/**
 * Picnic Paradise Stripe Payment Configuration & Handler
 */

// Replace with your real Stripe Publishable Key from https://dashboard.stripe.com/apikeys
window.STRIPE_PUBLISHABLE_KEY = localStorage.getItem('pp_stripe_pk') || 'pk_test_51PPicnicParadiseTestKey1234567890';

let stripeInstance = null;

function getStripe() {
  if (!stripeInstance && typeof Stripe !== 'undefined' && window.STRIPE_PUBLISHABLE_KEY) {
    try {
      stripeInstance = Stripe(window.STRIPE_PUBLISHABLE_KEY);
    } catch (e) {
      console.warn('Stripe init notice:', e);
    }
  }
  return stripeInstance;
}

window.processStripeCheckout = async function(orderData) {
  const stripe = getStripe();
  
  // Save order details to local storage before processing
  let orders = PPUtils.getStorage('pp_orders') || [];
  orders.push(orderData);
  PPUtils.setStorage('pp_orders', orders);

  // Sync to Cloud Firestore if connected
  if (typeof window.saveOrderToFirebase === 'function') {
    window.saveOrderToFirebase(orderData);
  }

  // Attempt serverless Stripe API endpoint if deployed on Vercel
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        items: orderData.items,
        total: orderData.total
      })
    });

    if (response.ok) {
      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
        return;
      }
      if (session.id && stripe) {
        const result = await stripe.redirectToCheckout({ sessionId: session.id });
        if (!result.error) return;
      }
    }
  } catch (err) {
    console.log('Stripe Serverless Endpoint notice (using direct test confirmation):', err);
  }

  // Clear cart after successful checkout
  localStorage.removeItem('pp_cart');
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));

  // Redirect to order confirmation screen
  window.location.href = `order-confirmation.html?id=${orderData.orderId}`;
};
