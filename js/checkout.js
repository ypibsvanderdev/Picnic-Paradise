// js/checkout.js
document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const modalClose = checkoutModal ? checkoutModal.querySelector('.modal-close') : null;
  
  const paymentTabs = document.querySelectorAll('.payment-tab');
  const paymentContentCard = document.getElementById('paymentContentCard');
  const paymentContentApple = document.getElementById('paymentContentApple');
  const paymentContentGoogle = document.getElementById('paymentContentGoogle');
  
  const cardNumber = document.getElementById('cardNumber');
  const cardExpiry = document.getElementById('cardExpiry');
  const cardCvv = document.getElementById('cardCvv');
  const cardTypeIcon = document.getElementById('cardTypeIcon');
  
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  const applePayBtn = document.getElementById('applePayBtn');
  const googlePayBtn = document.getElementById('googlePayBtn');
  const checkoutLoading = document.getElementById('checkoutLoading');
  const guestCheckoutSection = document.getElementById('guestCheckoutSection');
  
  let currentMethod = 'card';

  if (!checkoutBtn) return; // Not on cart page

  checkoutBtn.addEventListener('click', () => {
    const pickupTime = document.getElementById('pickupTime').value;
    if (!pickupTime) {
      alert('Please select a pickup time.');
      return;
    }
    
    // Auto-fill user info if logged in
    const user = JSON.parse(localStorage.getItem('pp_user'));
    if (user) {
      const nameInput = document.getElementById('checkoutName');
      const emailInput = document.getElementById('checkoutEmail');
      const phoneInput = document.getElementById('checkoutPhone');
      if(nameInput) nameInput.value = user.name || '';
      if(emailInput) emailInput.value = user.email || '';
      if(phoneInput) phoneInput.value = user.phone || '';
    }
    
    if(checkoutModal) {
      checkoutModal.style.display = 'flex';
      requestAnimationFrame(() => checkoutModal.classList.add('active'));
    }
  });

  if(modalClose) {
    modalClose.addEventListener('click', () => {
      if (checkoutModal) {
        checkoutModal.classList.remove('active');
        setTimeout(() => checkoutModal.style.display = 'none', 200);
      }
    });
  }

  paymentTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      paymentTabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = 'var(--pp-surface)';
        t.style.color = 'var(--pp-text)';
      });
      e.target.classList.add('active');
      e.target.style.background = 'var(--pp-primary)';
      e.target.style.color = 'white';
      
      currentMethod = e.target.dataset.method;
      
      if(paymentContentCard) paymentContentCard.style.display = 'none';
      if(paymentContentApple) paymentContentApple.style.display = 'none';
      if(paymentContentGoogle) paymentContentGoogle.style.display = 'none';
      
      if (currentMethod === 'card' && paymentContentCard) paymentContentCard.style.display = 'block';
      else if (currentMethod === 'applepay' && paymentContentApple) paymentContentApple.style.display = 'block';
      else if (currentMethod === 'googlepay' && paymentContentGoogle) paymentContentGoogle.style.display = 'block';
    });
  });

  // Card Formatting
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
      e.target.value = formatted;
      
      if(cardTypeIcon) {
        if (val.startsWith('4')) cardTypeIcon.textContent = '💳'; // Visa
        else if (val.startsWith('5')) cardTypeIcon.textContent = '💳'; // MC
        else if (val.startsWith('3')) cardTypeIcon.textContent = '💳'; // Amex
        else if (val.startsWith('6')) cardTypeIcon.textContent = '💳'; // Discover
        else cardTypeIcon.textContent = '💳';
      }
    });
  }

  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      e.target.value = val;
    });
  }
  
  if (cardCvv) {
    cardCvv.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
  }

  function processPayment() {
    const nameInput = document.getElementById('checkoutName');
    const emailInput = document.getElementById('checkoutEmail');
    const phoneInput = document.getElementById('checkoutPhone');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const pickupTime = document.getElementById('pickupTime')?.value || '12:00 PM';
    const instructions = document.getElementById('orderInstructions')?.value || '';
    
    if (!name || name.length < 2) {
      alert('⚠️ Please enter your Full Name for the order pickup.');
      if (nameInput) nameInput.focus();
      return;
    }
    
    if (!email || !phone) {
      alert('⚠️ Please fill out your Email and Phone Number so we can update you on your order status.');
      return;
    }
    
    if (currentMethod === 'card') {
      if (cardNumber.value.replace(/\D/g,'').length < 15) {
        alert('Invalid card number');
        return;
      }
      if (cardExpiry.value.length < 5) {
        alert('Invalid expiry');
        return;
      }
      if (cardCvv.value.length < 3) {
        alert('Invalid CVV');
        return;
      }
    }

    // Show loading
    if(paymentContentCard) paymentContentCard.style.display = 'none';
    if(paymentContentApple) paymentContentApple.style.display = 'none';
    if(paymentContentGoogle) paymentContentGoogle.style.display = 'none';
    paymentTabs.forEach(t => t.style.pointerEvents = 'none');
    if(guestCheckoutSection) guestCheckoutSection.style.display = 'none';
    if(checkoutLoading) checkoutLoading.style.display = 'block';

    const methodLabel = currentMethod === 'applepay' ? 'Apple Pay 🍎' : (currentMethod === 'googlepay' ? 'Google Pay 🌐' : 'Credit Card 💳');

    setTimeout(() => {
      const cart = JSON.parse(localStorage.getItem('pp_cart')) || [];
      const summary = window.cartSummary || { subtotal:0, tax:0, total:0, discountAmount:0, discountCode:null };
      
      const order = {
        orderId: 'PP-' + Date.now().toString().slice(-6),
        items: cart,
        subtotal: summary.subtotal,
        tax: summary.tax,
        discountCode: summary.discountCode,
        discountAmount: summary.discountAmount,
        total: summary.total,
        pickupTime: pickupTime,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        paymentMethod: methodLabel,
        specialInstructions: instructions
      };

      if (typeof window.saveOrderToFirebase === 'function') {
        window.saveOrderToFirebase(order);
      } else {
        const orders = JSON.parse(localStorage.getItem('pp_orders')) || [];
        orders.push(order);
        localStorage.setItem('pp_orders', JSON.stringify(orders));
      }
      localStorage.setItem('pp_cart', '[]');
      
      window.location.href = `order-confirmation.html?id=${order.orderId}`;
    }, 2000);
  }

  if(placeOrderBtn) placeOrderBtn.addEventListener('click', processPayment);
  if(applePayBtn) applePayBtn.addEventListener('click', processPayment);
  if(googlePayBtn) googlePayBtn.addEventListener('click', processPayment);
});
