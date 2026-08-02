/**
 * Picnic Paradise Stripe Payment Configuration & Handler
 */

// Live Stripe Publishable Key
window.STRIPE_PUBLISHABLE_KEY = localStorage.getItem('pp_stripe_pk') || 'pk_live_51Tzmw4LXU4os5QyXVR72hFVpCQPyKW5tRbqXnlhuKwmaFlRlhmdHw8aGZzBVtmfO9OmRp4UrndaL2IXQHEXbEBqF00ix5aeQSG';

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

  let redirected = false;

  const doFinalRedirect = () => {
    if (redirected) return;
    redirected = true;
    localStorage.removeItem('pp_cart');
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));
    window.location.href = `order-confirmation.html?id=${orderData.orderId}`;
  };

  // 3.5 Second Safety Timeout so modal NEVER freezes
  const safetyTimer = setTimeout(doFinalRedirect, 3500);

  try {
    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        items: orderData.items,
        total: orderData.total
      })
    });
    clearTimeout(fetchTimeout);

    if (response.ok) {
      const session = await response.json();
      if (session && session.url) {
        clearTimeout(safetyTimer);
        redirected = true;
        localStorage.removeItem('pp_cart');
        window.location.href = session.url;
        return;
      }
    }
  } catch (err) {
    console.log('Stripe checkout notice:', err);
  }

  clearTimeout(safetyTimer);
  doFinalRedirect();
};
