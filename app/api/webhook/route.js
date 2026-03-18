import { stripe } from '../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a Supabase admin client to update users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Needs service role key to update other users' data
);

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
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // In one-time payments, userId might come from client_reference_id instead of metadata
    const userId = session.client_reference_id || session.metadata?.userId;
    const plan = session.metadata?.plan || 'vitalicio'; // Fallback if not set

    if (!userId) {
        console.error('Webhook error: No user ID found in session metadata or client_reference_id');
        return NextResponse.json({ error: 'No user ID found' }, { status: 400 });
    }

    console.log(`Processing subscription for user ${userId} plan ${plan}`);

    // Update user subscription in Supabase
    // Using upsert to create if not exists or update if exists
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: 'active',
        plan: plan,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription || 'one-time', // vitalicio might not have subscription id
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }); // Assuming user_id is unique in subscriptions table or PK

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
