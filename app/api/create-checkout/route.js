import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const { priceId, userId, userEmail } = await req.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: process.env.NEXT_PUBLIC_URL + '/sucesso?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: process.env.NEXT_PUBLIC_URL + '/planos',
    customer_email: userEmail,
    metadata: { userId },
    locale: 'pt-BR',
  })

  return Response.json({ url: session.url })
}
