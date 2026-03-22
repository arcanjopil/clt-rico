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
  const configured = {
    mensal: PRICE_IDS.mensal || null,
    anual: PRICE_IDS.anual || null,
    vitalicio: PRICE_IDS.vitalicio || null,
  };

  const results = await Promise.all(
    Object.entries(PRICE_IDS).map(async ([key, priceId]) => {
      if (!priceId) {
        return [key, { price: null, error: 'Price ID nao configurado', used_price_id: null }];
      }

      try {
        const price = await stripe.prices.retrieve(priceId);
        return [key, { price: formatStripePrice(price), error: null, used_price_id: priceId }];
      } catch (error) {
        const message = typeof error?.message === 'string' ? error.message : 'Erro ao carregar price';
        return [key, { price: null, error: message, used_price_id: priceId }];
      }
    })
  );

  return NextResponse.json({ configured, results: Object.fromEntries(results) });
}
