<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '../../../lib/stripe';

const PLANS = {
  mensal: {
    priceId: process.env.STRIPE_PRICE_ID_MENSAL,
    mode: 'subscription',
  },
  anual: {
    priceId: process.env.STRIPE_PRICE_ID_ANUAL,
    mode: 'subscription',
  },
  vitalicio: {
    priceId: process.env.STRIPE_PRICE_ID_VITALICIO,
    mode: 'payment',
  },
};

export async function POST(req) {
  try {
    const { plan } = await req.json();
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return NextResponse.json({ error: 'Plano invalido' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      mode: planConfig.mode,
      success_url: baseUrl + '/sucesso?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: baseUrl + '/planos',
      customer_email: user.email,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
=======
import { NextResponse } from 'next/server'; 
import { createClient } from '@supabase/supabase-js'; 
import { stripe } from '../../../lib/stripe'; 

const PLANS = { 
  mensal: { priceId: process.env.STRIPE_PRICE_ID_MENSAL, mode: 'subscription' }, 
  anual: { priceId: process.env.STRIPE_PRICE_ID_ANUAL, mode: 'subscription' }, 
  vitalicio: { priceId: process.env.STRIPE_PRICE_ID_VITALICIO, mode: 'payment' }, 
}; 

export async function POST(req) { 
  try { 
    const { plan } = await req.json(); 
    const planConfig = PLANS[plan]; 
    if (!planConfig) return NextResponse.json({ error: 'Plano invalido' }, { status: 400 }); 

    const authHeader = req.headers.get('authorization'); 
    if (!authHeader) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 }); 

    const token = authHeader.replace('Bearer ', ''); 
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 
    const { data: { user }, error: userError } = await supabase.auth.getUser(token); 
    if (userError || !user) return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 401 }); 

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; 
    const session = await stripe.checkout.sessions.create({ 
      payment_method_types: ['card'], 
      line_items: [{ price: planConfig.priceId, quantity: 1 }], 
      mode: planConfig.mode, 
      success_url: baseUrl + '/sucesso?session_id={CHECKOUT_SESSION_ID}', 
      cancel_url: baseUrl + '/planos', 
      customer_email: user.email, 
      metadata: { userId: user.id, plan }, 
    }); 

    return NextResponse.json({ url: session.url }); 
  } catch (error) { 
    console.error('Checkout error:', error); 
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 }); 
  } 
} 
>>>>>>> da5e995 (fix: remove special chars from checkout route)
