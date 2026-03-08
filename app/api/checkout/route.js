import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { priceId, userEmail, userId } = await req.json();

    if (!priceId || !userEmail || !userId) {
      return NextResponse.json({ error: 'Missing priceId, userEmail, or userId' }, { status: 400 });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/?success=true`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
