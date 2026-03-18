require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const priceId = 'price_1TALbzHvQipEVZgFKfkN8uSA'; // Hardcoded for testing
    console.log("Using Price ID:", priceId);

    const price = await stripe.prices.retrieve(priceId);
    console.log("Price Info:");
    console.log("- Tipo:", price.type);
    console.log("- Valor:", price.unit_amount / 100);
    
    console.log("\nTentando criar sessão...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment', 
      success_url: 'http://localhost/sucesso',
      cancel_url: 'http://localhost/cancel',
      client_reference_id: 'test_user_id_123',
    });
    
    console.log("✅ Sessão criada com sucesso! URL:", session.url);
  } catch (e) {
    console.log("❌ ERRO AO CRIAR SESSÃO:");
    console.log(e.message);
  }
}

test();
