const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Vercel handler
 */
module.exports = async (req, res) => {
  // Autoriser les requêtes CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // réponse rapide aux preflight requests
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { itemName, amountCents } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: itemName,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://dailyloc.fr/success', // change ça plus tard
      cancel_url: 'https://dailyloc.fr/cancel',   // change ça plus tard
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe error', details: err.message });
  }
};

