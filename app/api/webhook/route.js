import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;

      // Update user status in Supabase
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: session.customer,
          status: 'active',
          plan: 'pro',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating subscription in Supabase:', error);
        return NextResponse.json({ error: 'Error updating subscription' }, { status: 500 });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      // Find user by stripe_customer_id (assuming we store it)
      // Or just ignore for now as we store by user_id
      // Ideally, we query subscriptions table by stripe_customer_id
      const { data: subData, error: fetchError } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', subscription.customer)
        .single();
      
      if (subData) {
         await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('user_id', subData.user_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler failed:', err.message);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
