// js/utils.js - The Sugar Printer Utilities

window.PPUtils = {
  // LocalStorage Helpers
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
    
    // Decrement stock for purchased items
    if (order.items && order.items.length > 0) {
      window.PPUtils.decrementStockForOrder(order.items);
    }
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
    }).format(amount || 0);
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

  // Toast Notifications
  showToast: (message, type = 'info') => {
    const toastContainer = window.PPUtils.$('#toast-container') || (() => {
      const tc = window.PPUtils.createElement('div', '', { id: 'toast-container' });
      Object.assign(tc.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '99999',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      });
      document.body.appendChild(tc);
      return tc;
    })();

    const toast = window.PPUtils.createElement('div', `toast toast-${type}`);
    
    Object.assign(toast.style, {
      padding: '12px 24px',
      borderRadius: '24px',
      background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#8b5cf6',
      color: '#FFF',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      fontWeight: '600',
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.95rem',
      opacity: '0',
      transform: 'translateY(20px)',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      pointerEvents: 'auto'
    });
    
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    
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

  // Product & Inventory Helpers for The Sugar Printer
  getMenuItems: () => {
    let baseItems = JSON.parse(JSON.stringify(window.MENU_ITEMS || []));
    let customItems = window.PPUtils.getStorage('pp_custom_items') || [];
    let deletedItems = window.PPUtils.getStorage('pp_deleted_items') || [];
    let overrides = window.PPUtils.getStorage('pp_menu_overrides') || {};

    // Combine base and custom items
    let allItems = [...baseItems, ...customItems];

    // Filter out deleted items
    allItems = allItems.filter(item => !deletedItems.includes(item.id));

    // Apply overrides and ensure stock / soldOut values
    return allItems.map(item => {
      let finalItem = { ...item };
      if (overrides[item.id]) {
        finalItem = { ...finalItem, ...overrides[item.id] };
      }
      
      // Stock calculation
      if (finalItem.stock === undefined || finalItem.stock === null) {
        finalItem.stock = 1;
      }
      finalItem.stock = parseInt(finalItem.stock, 10);
      if (isNaN(finalItem.stock)) finalItem.stock = 0;

      if (finalItem.stock <= 0) {
        finalItem.soldOut = true;
      }

      return finalItem;
    });
  },

  updateProductStock: (itemId, newStock) => {
    let overrides = window.PPUtils.getStorage('pp_menu_overrides') || {};
    if (!overrides[itemId]) overrides[itemId] = {};
    const stockNum = Math.max(0, parseInt(newStock, 10) || 0);
    overrides[itemId].stock = stockNum;
    overrides[itemId].soldOut = (stockNum <= 0);
    window.PPUtils.setStorage('pp_menu_overrides', overrides);
    window.dispatchEvent(new CustomEvent('inventoryUpdated', { detail: { itemId, stock: stockNum } }));
    return stockNum;
  },

  decrementStockForOrder: (items) => {
    let overrides = window.PPUtils.getStorage('pp_menu_overrides') || {};
    let allCurrentItems = window.PPUtils.getMenuItems();

    (items || []).forEach(cartItem => {
      const current = allCurrentItems.find(i => i.id === cartItem.itemId);
      if (current) {
        const prevStock = (current.stock !== undefined) ? current.stock : 1;
        const newStock = Math.max(0, prevStock - (cartItem.quantity || 1));
        if (!overrides[cartItem.itemId]) overrides[cartItem.itemId] = {};
        overrides[cartItem.itemId].stock = newStock;
        overrides[cartItem.itemId].soldOut = (newStock <= 0);
      }
    });

    window.PPUtils.setStorage('pp_menu_overrides', overrides);
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
  },

  saveProduct: (product) => {
    let customItems = window.PPUtils.getStorage('pp_custom_items') || [];
    const baseItems = window.MENU_ITEMS || [];
    const isBaseItem = baseItems.some(i => i.id === product.id);

    if (isBaseItem) {
      let overrides = window.PPUtils.getStorage('pp_menu_overrides') || {};
      overrides[product.id] = { ...product };
      window.PPUtils.setStorage('pp_menu_overrides', overrides);
    } else {
      const existingIndex = customItems.findIndex(i => i.id === product.id);
      if (existingIndex > -1) {
        customItems[existingIndex] = product;
      } else {
        customItems.push(product);
      }
      window.PPUtils.setStorage('pp_custom_items', customItems);
    }

    // Also remove from deleted if re-added
    let deletedItems = window.PPUtils.getStorage('pp_deleted_items') || [];
    if (deletedItems.includes(product.id)) {
      deletedItems = deletedItems.filter(id => id !== product.id);
      window.PPUtils.setStorage('pp_deleted_items', deletedItems);
    }

    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
  },

  deleteProduct: (itemId) => {
    // Check if custom item
    let customItems = window.PPUtils.getStorage('pp_custom_items') || [];
    customItems = customItems.filter(i => i.id !== itemId);
    window.PPUtils.setStorage('pp_custom_items', customItems);

    // Also mark in deleted items for base items
    let deletedItems = window.PPUtils.getStorage('pp_deleted_items') || [];
    if (!deletedItems.includes(itemId)) {
      deletedItems.push(itemId);
      window.PPUtils.setStorage('pp_deleted_items', deletedItems);
    }
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
  },

  // QR Code Renderer Helper using highly reliable image API with fallback
  renderQRCodeHTML: (orderId, containerEl) => {
    if (!containerEl) return;
    const text = `SUGAR-ORDER:${orderId}`;
    
    containerEl.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px; background:#fff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(text)}&color=0f172a" 
             alt="QR Code #${orderId}" 
             style="width:160px; height:160px; border-radius:10px; display:block;"
             onerror="this.onerror=null; this.src='https://chart.googleapis.com/chart?cht=qr&chs=160x160&chl=${encodeURIComponent(text)}';">
        <div style="margin-top:8px; font-weight:700; font-size:0.9rem; color:#8b5cf6; font-family:monospace;">#${(orderId||'').replace('PP-','')}</div>
      </div>
    `;
  }
};

// Aliases
window.getMenuItems = window.PPUtils.getMenuItems;
window.$ = window.PPUtils.$;
window.$$ = window.PPUtils.$$;
