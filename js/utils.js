/**
 * Picnic Paradise Utility Functions
 */

window.PPUtils = {
  // Storage Helpers
  getStorage: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage`, error);
      return null;
    }
  },
  
  setStorage: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to storage`, error);
    }
  },
  
  removeStorage: (key) => {
    localStorage.removeItem(key);
  },

  // Cart Helpers
  getCart: () => {
    return window.PPUtils.getStorage('pp_cart') || [];
  },
  
  saveCart: (cart) => {
    window.PPUtils.setStorage('pp_cart', cart);
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
  },
  
  addToCart: (item) => {
    const cart = window.PPUtils.getCart();
    item.cartId = window.PPUtils.generateId('ci_');
    cart.push(item);
    window.PPUtils.saveCart(cart);
    window.PPUtils.showToast(`${item.name} added to cart!`, 'success');
  },
  
  removeFromCart: (cartId) => {
    const cart = window.PPUtils.getCart();
    const newCart = cart.filter(item => item.cartId !== cartId);
    window.PPUtils.saveCart(newCart);
  },
  
  updateQuantity: (cartId, qty) => {
    if (qty < 1) return;
    const cart = window.PPUtils.getCart();
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
      item.quantity = qty;
      window.PPUtils.saveCart(cart);
    }
  },
  
  clearCart: () => {
    window.PPUtils.saveCart([]);
  },
  
  getCartCount: () => {
    const cart = window.PPUtils.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },
  
  getCartTotal: () => {
    const cart = window.PPUtils.getCart();
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  },

  // Favorites Helpers
  getFavorites: () => {
    return window.PPUtils.getStorage('pp_favorites') || [];
  },
  
  toggleFavorite: (itemId) => {
    const favs = window.PPUtils.getFavorites();
    const index = favs.indexOf(itemId);
    if (index > -1) {
      favs.splice(index, 1);
      window.PPUtils.showToast('Removed from favorites', 'info');
    } else {
      favs.push(itemId);
      window.PPUtils.showToast('Added to favorites', 'success');
    }
    window.PPUtils.setStorage('pp_favorites', favs);
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  },
  
  isFavorite: (itemId) => {
    const favs = window.PPUtils.getFavorites();
    return favs.includes(itemId);
  },

  // Orders Helpers
  getOrders: () => {
    return window.PPUtils.getStorage('pp_orders') || [];
  },
  
  saveOrder: (order) => {
    const orders = window.PPUtils.getOrders();
    orders.push(order);
    window.PPUtils.setStorage('pp_orders', orders);
  },
  
  getOrderById: (id) => {
    const orders = window.PPUtils.getOrders();
    return orders.find(o => o.orderId === id) || null;
  },

  // Formatting
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },
  
  formatDate: (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  generateId: (prefix = '') => {
    return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
  },

  // Validation
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  isValidPhone: (phone) => {
    const re = /^[\d\s\-\+\(\)]{10,15}$/;
    return re.test(phone);
  },
  
  isValidCardNumber: (num) => {
    // Luhn algorithm
    const arr = (num + '')
      .split('')
      .reverse()
      .map(x => parseInt(x, 10));
    
    const lastDigit = arr.splice(0, 1)[0];
    let sum = arr.reduce((acc, val, i) => {
      if (i % 2 === 0) {
        val *= 2;
        if (val > 9) val -= 9;
      }
      return acc + val;
    }, 0);
    return (sum + lastDigit) % 10 === 0;
  },

  // DOM Helpers
  $: (selector) => document.querySelector(selector),
  $$: (selector) => document.querySelectorAll(selector),
  
  createElement: (tag, classes = '', attrs = {}) => {
    const el = document.createElement(tag);
    if (classes) el.className = classes;
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
    return el;
  },

  // Toast
  showToast: (message, type = 'info') => {
    const toastContainer = window.PPUtils.$('#toast-container') || (() => {
      const tc = window.PPUtils.createElement('div', '', { id: 'toast-container' });
      Object.assign(tc.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      });
      document.body.appendChild(tc);
      return tc;
    })();

    const toast = window.PPUtils.createElement('div', `toast toast-${type}`);
    
    // Style toast inline since it might not be in CSS
    Object.assign(toast.style, {
      padding: '12px 24px',
      borderRadius: '8px',
      background: type === 'success' ? '#95E872' : type === 'error' ? '#FF6B6B' : '#4ECDC4',
      color: type === 'success' ? '#111' : '#FFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontWeight: '600',
      opacity: '0',
      transform: 'translateY(20px)',
      transition: 'all 0.3s ease'
    });
    
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    
    // Remove after 3s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Scroll
  scrollToElement: (selector) => {
    const el = window.PPUtils.$(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },
  
  isInViewport: (el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Debounce
  debounce: (fn, delay) => {
    let timeoutId;
    return function (...args) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  },

  // Menu Helpers
  getMenuItems: () => {
    // Return window.MENU_ITEMS with overrides applied
    let items = JSON.parse(JSON.stringify(window.MENU_ITEMS));
    const overrides = window.PPUtils.getStorage('pp_menu_overrides') || {};
    
    return items.map(item => {
      if (overrides[item.id]) {
        return { ...item, ...overrides[item.id] };
      }
      return item;
    });
  },

  // QR Code Renderer Helper with Double Fallback
  renderQRCodeHTML: (orderId, containerEl) => {
    if (!containerEl) return;
    const text = `PP-ORDER:${orderId}`;
    const primaryUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}&color=0f172a`;
    const fallbackUrl = `https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(text)}`;
    
    containerEl.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px;">
        <img src="${primaryUrl}" 
             alt="QR Code #${orderId}" 
             style="width:160px; height:160px; border-radius:10px; border:3px solid #fff; box-shadow:0 4px 12px rgba(0,0,0,0.15); background:#fff;" 
             onerror="this.onerror=null; this.src='${fallbackUrl}';">
        <div style="margin-top:8px; font-weight:700; font-size:0.9rem; color:var(--pp-primary-dark,#2563eb); font-family:monospace;">#${(orderId||'').replace('PP-','')}</div>
      </div>
    `;
  }
};

// Aliases for easier use if needed
window.$ = window.PPUtils.$;
window.$$ = window.PPUtils.$$;
