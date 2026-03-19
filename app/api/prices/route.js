import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const PRICE_IDS = {
  mensal: process.env.STRIPE_PRICE_ID_MENSAL || process.env.STRIPE_PRICE_MENSAL,
  anual: process.env.STRIPE_PRICE_ID_ANUAL || process.env.STRIPE_PRICE_ANUAL,
  vitalicio: process.env.STRIPE_PRICE_ID_VITALICIO || process.env.STRIPE_PRICE_VITALICIO,
};

function formatStripePrice(price) {
  const unitAmount = typeof price.unit_amount === 'number' ? price.unit_amount : null;
  const currency = typeof price.currency === 'string' ? price.currency.toUpperCase() : null;
  const recurring = price.recurring
    ? {
        interval: price.recurring.interval,
        interval_count: price.recurring.interval_count,
      }
    : null;

  return {
    id: price.id,
    active: price.active,
    unit_amount: unitAmount,
    currency,
    type: price.type,
    recurring,
  };
}

export async function GET() {
  try {
    const entries = await Promise.all(
      Object.entries(PRICE_IDS).map(async ([key, priceId]) => {
        if (!priceId) return [key, null];
        const price = await stripe.prices.retrieve(priceId);
        return [key, formatStripePrice(price)];
      })
    );

    return NextResponse.json({ prices: Object.fromEntries(entries) });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao carregar preços', details: error.message },
      { status: 500 }
    );
  }
}

