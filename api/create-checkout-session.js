/**
 * Vercel Serverless API Endpoint: Stripe Checkout Session Creator
 *
 * Environment Variable Required on Vercel:
 * STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mockKeyForPicnicParadise123456');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { orderId, customerEmail, customerName, items, total } = req.body;

    const lineItems = (items || []).map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.name} (${item.size || 'single'}${item.flavor ? ' - ' + item.flavor : ''})`,
          description: item.addIns && item.addIns.length > 0 
            ? `Add-ins: ${item.addIns.map(a => typeof a === 'string' ? a : (a.name || a)).join(', ')}` 
            : undefined
        },
        unit_amount: Math.round((item.unitPrice || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const origin = req.headers.origin || `https://${req.headers.host}` || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail || undefined,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Picnic Paradise Order #${orderId}`,
            description: (items || []).map(i => `${i.quantity || 1}x ${i.name}`).join(', ') || 'Delicious food & drinks'
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
    console.error('Stripe Session Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
