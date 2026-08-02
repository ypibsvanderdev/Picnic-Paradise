/**
 * Vercel Serverless API Endpoint: Stripe Checkout Session Creator
 *
 * Environment Variable Required on Vercel:
 * STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
 */

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  // Debug: show what env vars look like (first 10 chars only, safe to expose)
  if (!stripeKey) {
    const envKeys = Object.keys(process.env).filter(k => k.includes('STRIPE') || k.includes('stripe'));
    return res.status(500).json({ 
      error: 'STRIPE_SECRET_KEY is not set',
      debug_env_keys_containing_stripe: envKeys,
      debug_all_env_count: Object.keys(process.env).length
    });
  }

  try {
    const stripe = require('stripe')(stripeKey);
    const { orderId, customerEmail, customerName, items, total } = req.body;

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail || undefined,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Picnic Paradise Order #${orderId}`,
            description: (items || []).map(i => `${i.quantity || 1}x ${i.name}`).join(', ') || 'Picnic order'
          },
          unit_amount: Math.max(50, Math.round((total || 0.50) * 100))
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${origin}/order-confirmation.html?id=${orderId}&payment=success`,
      cancel_url: `${origin}/cart.html?payment=cancelled`,
      metadata: {
        orderId: orderId,
        customerName: customerName || ''
      }
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Session Error:', error.message);
    return res.status(500).json({ 
      error: error.message,
      key_prefix: stripeKey ? stripeKey.substring(0, 12) + '...' : 'NONE'
    });
  }
};
