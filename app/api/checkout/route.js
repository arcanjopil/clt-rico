import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';

// IDs dos Planos no Stripe (Você precisará criar esses produtos no painel do Stripe e pegar os IDs)
const PLANS = {
  mensal: {
    priceId: process.env.STRIPE_PRICE_ID_MENSAL, // Ex: price_1Op...
    mode: 'subscription',
  },
  anual: {
    priceId: process.env.STRIPE_PRICE_ID_ANUAL, // Ex: price_1Op...
    mode: 'subscription',
  },
  vitalicio: {
    priceId: process.env.STRIPE_PRICE_ID_VITALICIO, // Ex: price_1Op...
    mode: 'payment', // Pagamento único
  },
};

export async function POST(req) {
  try {
    const { plan } = await req.json();
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // Verificar Usuário Logado
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = session.user;

    // Criar Sessão de Checkout no Stripe
    const sessionStripe = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      mode: planConfig.mode,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan: plan,
      },
    });

    return NextResponse.json({ url: sessionStripe.url });
  } catch (error) {
    console.error('Erro no Checkout:', error);
    return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 });
  }
}
