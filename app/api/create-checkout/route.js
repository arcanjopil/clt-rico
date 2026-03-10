import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { priceId, userId, userEmail } = await req.json()

    if (!priceId || !userId) {
      return Response.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://cltrico.online/sucesso?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://cltrico.online/planos',
      customer_email: userEmail,
      metadata: { userId },
      locale: 'pt-BR',
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Erro create-checkout:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}