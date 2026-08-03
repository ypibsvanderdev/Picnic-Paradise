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
  
  // Save to system immediately as UNPAID. 
  // It will be hidden from the Admin Dashboard until the status changes to paid.
  orderData.status = 'unpaid';
  if (typeof window.saveOrderToFirebase === 'function') {
    window.saveOrderToFirebase(orderData);
  } else {
    let orders = PPUtils.getStorage('pp_orders') || [];
    orders.push(orderData);
    PPUtils.setStorage('pp_orders', orders);
  }

  try {
    // Call our API to create a Stripe Checkout Session — give it up to 15 seconds
    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 15000);

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
        // Redirect to Stripe's hosted checkout page
        localStorage.removeItem('pp_cart');
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));
        window.location.href = session.url;
        return;
      }
    }

    // If API returned an error, show it
    const errorData = await response.json().catch(() => ({}));
    console.error('Stripe API error:', errorData);
    alert('Payment setup failed: ' + (errorData.error || 'Unknown error. Please try again.'));
    
  } catch (err) {
    console.error('Stripe checkout error:', err);
    
    if (err.name === 'AbortError') {
      alert('Payment is taking too long. Please check your connection and try again.');
    } else {
      alert('Could not connect to payment service. Please try again.');
    }
  }
};
