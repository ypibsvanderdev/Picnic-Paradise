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

  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  
  if (!stripeKey) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured on Vercel' });
  }

  try {
    const stripe = require('stripe')(stripeKey);
    const { orderId, customerEmail, customerName, items, total } = req.body;

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const itemsJson = JSON.stringify((items || []).map(i => ({
      name: i.name || 'Item',
      quantity: i.quantity || 1,
      unitPrice: i.unitPrice || 0,
      size: i.size || '',
      flavor: i.flavor || ''
    })));

    const params = new URLSearchParams({
      id: orderId || '',
      name: customerName || 'Picnic Guest',
      email: customerEmail || '',
      total: (total || 0.50).toString(),
      items: itemsJson,
      payment: 'success'
    });

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
      success_url: `${origin}/order-confirmation.html?${params.toString()}`,
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
