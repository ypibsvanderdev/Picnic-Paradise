// js/cart.js
document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCartState = document.getElementById('emptyCartState');
  const clearCartContainer = document.getElementById('clearCartContainer');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const orderSummaryContainer = document.getElementById('orderSummaryContainer');
  
  const pickupTimeSelect = document.getElementById('pickupTime');
  const discountCodeInput = document.getElementById('discountCodeInput');
  const applyDiscountBtn = document.getElementById('applyDiscountBtn');
  const discountMessage = document.getElementById('discountMessage');
  
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryDiscount = document.getElementById('summaryDiscount');
  const summaryTax = document.getElementById('summaryTax');
  const summaryTotal = document.getElementById('summaryTotal');
  const discountLineRow = document.getElementById('discountLineRow');
  const appliedDiscountName = document.getElementById('appliedDiscountName');

  // Discount Codes
  const DISCOUNT_CODES = {
    'PICNIC10': 0.10,
    'SUMMER20': 0.20,
    'FIRSTORDER': 0.15,
    'TEST99': 0.9999,
    'ADMIN99': 0.9999
  };
  
  const PICKUP_TIMES = [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
  ];

  let currentDiscount = { code: null, rate: 0 };
  let cart = [];

  // Init
  if(pickupTimeSelect) initPickupTimes();
  if(cartItemsContainer) loadCart();

  window.addEventListener('cartUpdated', loadCart);

  function initPickupTimes() {
    pickupTimeSelect.innerHTML = '<option value="" disabled selected>Select a time</option>';
    PICKUP_TIMES.forEach(time => {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = time;
      pickupTimeSelect.appendChild(option);
    });
  }

  function loadCart() {
    cart = JSON.parse(localStorage.getItem('pp_cart')) || [];
    renderCart();
    renderOrderSummary();
  }

  function renderCart() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
      emptyCartState.style.display = 'block';
      clearCartContainer.style.display = 'none';
      orderSummaryContainer.style.opacity = '0.5';
      orderSummaryContainer.style.pointerEvents = 'none';
    } else {
      emptyCartState.style.display = 'none';
      clearCartContainer.style.display = 'block';
      orderSummaryContainer.style.opacity = '1';
      orderSummaryContainer.style.pointerEvents = 'auto';

      cart.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item card';
        itemEl.style.display = 'flex';
        itemEl.style.gap = '1rem';
        itemEl.style.padding = '1.25rem';
        itemEl.style.alignItems = 'flex-start';
        
        let emoji = '🥤';
        let gradient = '#eee, #ccc';
        if (typeof MENU_ITEMS !== 'undefined') {
          const menuItem = MENU_ITEMS.find(m => m.id === item.itemId);
          if (menuItem) {
            emoji = menuItem.emoji;
            gradient = menuItem.gradient;
          }
        }

        let badgesHtml = '';
        if (item.size && item.size !== 'single') {
          badgesHtml += `<span class="badge" style="background:var(--pp-bg-alt); color:var(--pp-text); padding:0.25rem 0.6rem; border-radius:6px; font-size:0.8rem; font-weight:600; text-transform:uppercase;">Size: ${item.size}</span> `;
        }
        if (item.flavor) {
          badgesHtml += `<span class="badge" style="background:var(--pp-bg-alt); color:var(--pp-text); padding:0.25rem 0.6rem; border-radius:6px; font-size:0.8rem; font-weight:600;">Flavor: ${item.flavor}</span> `;
        }
        
        let addInsHtml = '';
        if (item.addIns && item.addIns.length > 0) {
          const addInNames = item.addIns.map(a => typeof a === 'string' ? a : (a.name || a)).join(', ');
          addInsHtml = `<div class="cart-item-addins" style="font-size: 0.85rem; color: var(--pp-primary-dark); margin-top: 0.4rem; font-weight: 600;">✨ Add-ins: ${addInNames}</div>`;
        }

        const lineTotal = item.unitPrice * item.quantity;

        itemEl.innerHTML = `
          <div class="cart-item-image" style="background: linear-gradient(135deg, ${gradient}); width: 80px; height: 80px; display:flex; align-items:center; justify-content:center; font-size:2.5rem; border-radius:12px; flex-shrink:0;">
            <span>${emoji}</span>
          </div>
          <div class="cart-item-info" style="flex:1;">
            <div class="cart-item-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
              <h4 style="margin:0; font-family:'Outfit',sans-serif; font-size:1.1rem; font-weight:700;">${item.name}</h4>
              <button class="btn-icon text-danger remove-btn" data-index="${index}" aria-label="Remove item" title="Remove item" style="background:transparent; border:none; cursor:pointer; font-size:1.1rem; opacity:0.6; transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">🗑️</button>
            </div>
            <div style="margin: 0.4rem 0; display:flex; flex-wrap:wrap; gap:0.4rem; align-items:center;">
              ${badgesHtml}
            </div>
            ${addInsHtml}
            
            <div class="cart-item-note-section" style="margin-top: 0.5rem;">
              <div style="display:flex; align-items:center; gap:0.4rem; font-size:0.8rem; font-weight:600; color:var(--pp-text-secondary); margin-bottom:2px;">
                <span>📝 Order Note / Instructions:</span>
              </div>
              <input type="text" class="input cart-note-input" data-index="${index}" 
                placeholder="Special requests (e.g. extra hot, no whip, light ice)..." 
                value="${item.specialInstructions || ''}" 
                style="font-size: 0.85rem; padding: 6px 12px; width: 100%; border-radius: 8px; border: 1px solid var(--pp-border); background: var(--pp-bg-alt);">
            </div>

            <div class="cart-item-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
              <div class="quantity-stepper" style="display:flex; align-items:center; gap:0.5rem; background:var(--pp-bg-alt); padding:3px 8px; border-radius:20px;">
                <button class="stepper-btn qty-minus" data-index="${index}" style="width:24px; height:24px; border-radius:50%; border:none; background:var(--pp-surface); cursor:pointer; font-weight:bold; box-shadow:0 1px 3px rgba(0,0,0,0.1);">-</button>
                <span style="min-width:20px; text-align:center; font-weight:600;">${item.quantity}</span>
                <button class="stepper-btn qty-plus" data-index="${index}" style="width:24px; height:24px; border-radius:50%; border:none; background:var(--pp-surface); cursor:pointer; font-weight:bold; box-shadow:0 1px 3px rgba(0,0,0,0.1);">+</button>
              </div>
              <div class="cart-item-price" style="font-weight: 700; font-family:'Outfit',sans-serif; font-size:1.2rem; color:var(--pp-primary);">$${lineTotal.toFixed(2)}</div>
            </div>
          </div>
        `;
        cartItemsContainer.appendChild(itemEl);
      });

      // Wire up note inputs
      document.querySelectorAll('.cart-note-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = parseInt(e.target.dataset.index);
          if (cart[idx]) {
            cart[idx].specialInstructions = e.target.value;
            localStorage.setItem('pp_cart', JSON.stringify(cart));
          }
        });
      });

      // Wire up buttons
      document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.dataset.index);
          if (cart[idx].quantity > 1) {
            cart[idx].quantity--;
            saveCart();
          }
        });
      });

      document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.dataset.index);
          cart[idx].quantity++;
          saveCart();
        });
      });

      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.dataset.index);
          cart.splice(idx, 1);
          saveCart();
          if (typeof showToast === 'function') showToast('Item removed');
        });
      });
    }
  }

  function saveCart() {
    localStorage.setItem('pp_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  if(clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
      }
    });
  }

  function renderOrderSummary() {
    if(!summarySubtotal) return;
    let subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    let discountAmount = subtotal * currentDiscount.rate;
    let afterDiscount = subtotal - discountAmount;
    let tax = afterDiscount * 0.0825; // 8.25%
    let total = afterDiscount + tax;

    summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    summaryTax.textContent = `$${tax.toFixed(2)}`;
    summaryTotal.textContent = `$${total.toFixed(2)}`;

    if (currentDiscount.rate > 0) {
      discountLineRow.style.display = 'flex';
      appliedDiscountName.textContent = currentDiscount.code;
      summaryDiscount.textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
      discountLineRow.style.display = 'none';
    }
    
    // Store globally for checkout
    window.cartSummary = { subtotal, discountAmount, tax, total, discountCode: currentDiscount.code };
    const modalTotalAmt = document.getElementById('checkoutTotalAmount');
    if (modalTotalAmt) modalTotalAmt.textContent = `$${total.toFixed(2)}`;
  }

  if(applyDiscountBtn) {
    applyDiscountBtn.addEventListener('click', () => {
      const code = discountCodeInput.value.trim().toUpperCase();
      if (!code) return;

      let rate = 0;
      if (DISCOUNT_CODES[code]) {
        rate = DISCOUNT_CODES[code];
      } else {
        try {
          const customCodes = JSON.parse(localStorage.getItem('pp_promo_codes')) || [];
          const match = customCodes.find(c => c.code.toUpperCase() === code);
          if (match && match.discount) {
            rate = match.discount / 100;
          }
        } catch(e) {}
      }

      if (rate > 0) {
        currentDiscount = { code: code, rate: rate };
        discountMessage.innerHTML = `<span style="color: var(--pp-green-dark)">✓ Discount applied! (-${Math.round(rate * 100)}%)</span>`;
        discountMessage.style.animation = 'none';
        renderOrderSummary();
      } else {
        discountMessage.innerHTML = `<span style="color: var(--pp-accent)">Invalid discount code</span>`;
        discountCodeInput.style.border = '1px solid var(--pp-accent)';
        setTimeout(() => discountCodeInput.style.border = '', 1000);
        currentDiscount = { code: null, rate: 0 };
        renderOrderSummary();
      }
    });
  }
});
