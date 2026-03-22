import Stripe from 'stripe'

export async function POST(req) {
  try {
    const { priceId, userId, userEmail } = await req.json()

    if (!priceId) {
      console.error('Missing priceId')
      return Response.json({ error: 'Missing priceId' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY')
      return Response.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Initialize Stripe inside the handler to avoid build-time errors
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://cltrico.online'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/planos`,
      customer_email: userEmail,
      metadata: { userId },
      locale: 'pt-BR',
    })

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Stripe Checkout Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
