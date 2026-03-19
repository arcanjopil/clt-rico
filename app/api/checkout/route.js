import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '../../../lib/stripe';

const PLANS = {
  mensal: {
    priceId: process.env.STRIPE_PRICE_ID_MENSAL || process.env.STRIPE_PRICE_MENSAL,
    mode: 'subscription',
  },
  anual: {
    priceId: process.env.STRIPE_PRICE_ID_ANUAL || process.env.STRIPE_PRICE_ANUAL,
    mode: 'subscription',
  },
  vitalicio: {
    priceId: process.env.STRIPE_PRICE_ID_VITALICIO || process.env.STRIPE_PRICE_VITALICIO,
    mode: 'payment',
  },
};

function getBaseUrl(req) {
  const envUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  const origin = req.headers.get('origin');
  if (origin) return origin.replace(/\/$/, '');

  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) return `${proto}://${host}`.replace(/\/$/, '');

  return null;
}

export async function POST(req) {
  try {
    const { plan } = await req.json();
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return NextResponse.json({ error: 'Plano invalido' }, { status: 400 });
    }

    if (!planConfig.priceId) {
       console.error(`Price ID not found for plan: ${plan}`);
       return NextResponse.json({ error: 'Erro de configuracao do plano' }, { status: 500 });
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

    const baseUrl = getBaseUrl(req);
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'URL base nao configurada' },
        { status: 500 }
      );
    }
    
    // Metadata for webhook handling
    const metadata = {
        userId: user.id,
        plan: plan,
        mode: planConfig.mode
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      mode: planConfig.mode,
      success_url: `${baseUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/planos`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 });
  }
}
