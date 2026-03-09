import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata.userId
    const plan = session.line_items?.data?.[0]?.price?.id === process.env.STRIPE_PRICE_MENSAL ? 'mensal' : 'anual'

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      plan,
      status: 'active',
      current_period_end: new Date(Date.now() + (plan === 'anual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'user_id' })
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    await supabase.from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', sub.id)
  }

  return Response.json({ received: true })
}
