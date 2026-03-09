import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return Response.json({ error: err.message }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata?.userId
      
      if (!userId) return Response.json({ received: true })

      // Retrieve full subscription details to get accurate period_end and price
      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      const priceId = subscription.items.data[0]?.price?.id
      
      // Determine plan based on price ID
      const plan = priceId === process.env.STRIPE_PRICE_MENSAL ? 'mensal' : 'anual'
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString()

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan,
        status: 'active',
        current_period_end: periodEnd,
      }, { onConflict: 'user_id' })
      
      if (error) console.error('Supabase error:', error)
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object
      await supabase.from('subscriptions')
        .update({ 
          status: sub.status, 
          current_period_end: new Date(sub.current_period_end * 1000).toISOString() 
        })
        .eq('stripe_subscription_id', sub.id)
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object
      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', sub.id)
    }
  } catch (err) {
    console.error('Erro webhook:', err)
    // Return 200 to Stripe even on internal error to avoid retries if it's a logic error, 
    // but usually 500 is better for retry. However, following the requested code structure which returns 200 at end.
  }

  return Response.json({ received: true })
}
