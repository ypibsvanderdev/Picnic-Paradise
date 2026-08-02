/**
 * Picnic Paradise Admin Dashboard Logic (Fault-Tolerant & Bulletproof)
 */

function formatMoney(num) {
  if (typeof PPUtils !== 'undefined' && PPUtils.formatCurrency) {
    return PPUtils.formatCurrency(num);
  }
  return '$' + (Number(num) || 0).toFixed(2);
}

function getLocalOrders() {
  if (typeof PPUtils !== 'undefined' && PPUtils.getStorage) {
    return PPUtils.getStorage('pp_orders') || [];
  }
  try {
    const raw = localStorage.getItem('pp_orders');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setLocalOrders(orders) {
  if (typeof PPUtils !== 'undefined' && PPUtils.setStorage) {
    PPUtils.setStorage('pp_orders', orders);
  } else {
    try {
      localStorage.setItem('pp_orders', JSON.stringify(orders));
    } catch (e) {}
  }
}

let isSoundEnabled = localStorage.getItem('pp_admin_sound') !== 'false';
let knownOrderIds = new Set();
window.adminSearchQuery = '';

function playOrderChime() {
  if (!isSoundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Tone 1 (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);
    
    // Tone 2 (B5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch(e) {}
}

function updateSoundButton() {
  const btn = document.getElementById('btnToggleSound');
  if (btn) {
    btn.textContent = isSoundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF';
    btn.style.borderColor = isSoundEnabled ? 'var(--dash-green)' : 'var(--dash-border)';
  }
}

// Top-Level Event Delegation for Sidebar Nav Tabs, Filters, and Action Buttons
document.addEventListener('click', (e) => {
  // Sound Toggle
  const soundBtn = e.target.closest('#btnToggleSound');
  if (soundBtn) {
    e.preventDefault();
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('pp_admin_sound', isSoundEnabled ? 'true' : 'false');
    updateSoundButton();
    if (isSoundEnabled) playOrderChime();
    return;
  }

  // Sidebar Section Nav Tab
  const navBtn = e.target.closest('.sb-link[data-target]');
  if (navBtn) {
    e.preventDefault();
    const targetId = navBtn.dataset.target;
    
    document.querySelectorAll('.sb-link[data-target]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => {
      s.classList.remove('active');
      s.style.setProperty('display', 'none', 'important');
    });
    
    navBtn.classList.add('active');
    const targetSec = document.getElementById(targetId);
    if (targetSec) {
      targetSec.classList.add('active');
      targetSec.style.setProperty('display', 'block', 'important');
    }
    
    if (targetId === 'section-dashboard') renderDashboard();
    else if (targetId === 'section-menu') renderMenuTable();
    else if (targetId === 'section-customers') renderCustomers();
    else if (targetId === 'section-settings') setupSettings();
    return;
  }

  // Orders Filter Tab (All, Pending, Confirmed, Preparing, Ready, Picked Up)
  const filterBtn = e.target.closest('#ordersFilterTabs .filter-tab');
  if (filterBtn) {
    e.preventDefault();
    document.querySelectorAll('#ordersFilterTabs .filter-tab').forEach(f => f.classList.remove('active'));
    filterBtn.classList.add('active');
    currentOrderFilter = filterBtn.dataset.filter;
    renderDashboard();
    return;
  }

  // Logout Button
  const logoutBtn = e.target.closest('#adminLogoutBtn');
  if (logoutBtn) {
    e.preventDefault();
    sessionStorage.removeItem('pp_admin_logged_in');
    sessionStorage.removeItem('pp_admin_user');
    localStorage.removeItem('pp_user');
    window.location.href = 'index.html';
    return;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  updateSoundButton();

  // Search input live handler
  const searchInput = document.getElementById('adminOrderSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      window.adminSearchQuery = e.target.value.toLowerCase().trim();
      renderDashboard();
    });
  }

  // Promo Code Form Submit
  const promoForm = document.getElementById('addPromoForm');
  if (promoForm) {
    promoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const codeInput = document.getElementById('promoCodeInput');
      const discountInput = document.getElementById('promoDiscountInput');
      if (!codeInput || !discountInput) return;

      const code = codeInput.value.trim().toUpperCase();
      const discount = parseInt(discountInput.value, 10);
      if (!code || isNaN(discount) || discount < 1 || discount > 100) return;

      let codes = getPromoCodes();
      const idx = codes.findIndex(c => c.code === code);
      if (idx !== -1) {
        codes[idx].discount = discount;
      } else {
        codes.push({ code, discount });
      }

      setPromoCodes(codes);
      renderPromoCodesTable();

      codeInput.value = '';
      discountInput.value = '';
      alert(`Promo code "${code}" (${discount}% OFF) created successfully!`);
    });
  }

  try {
    const adminLogin = document.getElementById('adminLogin');
    const adminDashboard = document.getElementById('adminDashboard');
    const adminLoginForm = document.getElementById('adminLoginForm');

    // Check login state
    const isAdminLoggedIn = sessionStorage.getItem('pp_admin_logged_in') === 'true';
    let currentUser = sessionStorage.getItem('pp_admin_user');
    if (!currentUser) {
      try {
        const u = JSON.parse(localStorage.getItem('pp_user'));
        if (u && (u.isAdmin || ['admin', 'yahiamoon13@gmail.com', 'meqdad@gmail.com'].includes((u.email || '').toLowerCase().trim()))) {
          currentUser = u.email;
        }
      } catch(e) {}
    }

    if (isAdminLoggedIn || currentUser) {
      if (adminLogin) adminLogin.style.display = 'none';
      if (adminDashboard) adminDashboard.style.setProperty('display', 'flex', 'important');
      initAdmin(currentUser || 'Admin');
    }
  } catch (err) {
    console.error('Error during DOMContentLoaded admin setup:', err);
  }
});

// --- Main Initialization ---
function initAdmin(userEmail) {
  try {
    // Header Greeting & Date
    const greetingEl = document.getElementById('dashGreeting');
    const dateEl = document.getElementById('dashDate');
    if (greetingEl) {
      const name = userEmail ? (userEmail.split('@')[0] || 'Admin') : 'Admin';
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      greetingEl.textContent = `Welcome back, ${capitalized}! 👋`;
    }
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Render immediately from local storage
    renderDashboard();
    renderMenuTable();
    renderCustomers();
    setupSettings();

    // Subscribe to Firebase Realtime Orders
    if (typeof window.listenToFirebaseOrders === 'function') {
      window.listenToFirebaseOrders((orders) => {
        if (orders && Array.isArray(orders)) {
          window.currentAdminOrders = orders;
          renderDashboardWithOrders(orders);
          renderCustomersWithOrders(orders);
        }
      });
    }
  } catch (err) {
    console.error('Error in initAdmin:', err);
  }
}

// --- Dashboard & Orders ---
function renderDashboard() {
  const orders = window.currentAdminOrders || getLocalOrders();
  renderDashboardWithOrders(orders);
}

function renderDashboardWithOrders(orders) {
  try {
    // Check for new orders to play chime
    let hasNewOrder = false;
    (orders || []).forEach(o => {
      if (o && o.orderId && !knownOrderIds.has(o.orderId)) {
        if (knownOrderIds.size > 0) hasNewOrder = true;
        knownOrderIds.add(o.orderId);
      }
    });
    if (hasNewOrder) playOrderChime();

    let totalRev = 0;
    let itemsSold = 0;
    let payCounts = { card: 0, apple: 0, google: 0 };
    
    (orders || []).forEach(o => {
      if (!o) return;
      totalRev += (o.total || 0);
      if (o.items && Array.isArray(o.items)) {
        itemsSold += o.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
      }
      const payStr = (o.paymentMethod || '').toLowerCase();
      if (payStr.includes('apple')) payCounts.apple++;
      else if (payStr.includes('google')) payCounts.google++;
      else payCounts.card++;
    });
    
    const elOrders = document.getElementById('statTotalOrders');
    const elRev = document.getElementById('statRevenue');
    const elSold = document.getElementById('statItemsSold');
    const elPay = document.getElementById('statPaymentMethods');

    if (elOrders) elOrders.textContent = (orders || []).length;
    if (elRev) elRev.textContent = formatMoney(totalRev);
    if (elSold) elSold.textContent = itemsSold;
    if (elPay) {
      elPay.innerHTML = `💳 ${payCounts.card} | 🍎 ${payCounts.apple} | 🌐 ${payCounts.google}`;
    }
    
    renderTopSellingItems(orders);
    renderOrdersTable(orders);
  } catch(e) {
    console.error("Error rendering dashboard:", e);
  }
}

function renderTopSellingItems(orders) {
  const container = document.getElementById('topSellingContainer');
  if (!container) return;

  let itemCounts = {};
  let itemTotalSold = 0;

  (orders || []).forEach(o => {
    if (o && Array.isArray(o.items)) {
      o.items.forEach(i => {
        const name = i.name || 'Unknown Item';
        const qty = i.quantity || 1;
        itemCounts[name] = (itemCounts[name] || 0) + qty;
        itemTotalSold += qty;
      });
    }
  });

  const sorted = Object.entries(itemCounts).sort((a,b) => b[1] - a[1]);
  if (sorted.length === 0) {
    container.innerHTML = `<p style="color:var(--dash-muted); font-size:0.9rem;">No sales data yet.</p>`;
    return;
  }

  container.innerHTML = sorted.slice(0, 5).map(([name, count]) => {
    const percent = itemTotalSold > 0 ? Math.round((count / itemTotalSold) * 100) : 0;
    return `
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.9rem;">
          <strong style="color:#fff;">${name}</strong>
          <span style="color:var(--dash-primary); font-weight:700;">${count} sold (${percent}%)</span>
        </div>
        <div style="background:var(--dash-card2); height:8px; border-radius:4px; overflow:hidden;">
          <div style="background:var(--dash-primary); height:100%; width:${percent}%; transition:width 0.3s ease;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function formatOrderItemsHtml(items) {
  if (!items || !items.length) return '<span style="color:var(--dash-muted);">No items</span>';
  return items.map(i => {
    let addInsText = '';
    if (i.addIns && i.addIns.length > 0) {
      const names = i.addIns.map(a => typeof a === 'string' ? a : (a.name || a)).join(', ');
      addInsText = `<div style="font-size:0.75rem; color:var(--dash-primary);">+ ${names}</div>`;
    }
    let noteText = '';
    if (i.specialInstructions && i.specialInstructions.trim()) {
      noteText = `<div style="font-size:0.75rem; color:var(--dash-yellow); font-style:italic;">📝 ${i.specialInstructions}</div>`;
    }
    return `
      <div style="margin-bottom:0.35rem; line-height:1.3;">
        <strong style="color:#fff;">${i.quantity}x ${i.name}</strong> <small style="color:var(--dash-muted);">(${i.size || 'single'}${i.flavor ? ' - ' + i.flavor : ''})</small>
        ${addInsText}
        ${noteText}
      </div>
    `;
  }).join('');
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('recentOrdersTable');
  if (!tbody) return;
  
  let filteredOrders = orders || [];
  if (currentOrderFilter !== 'all') {
    filteredOrders = (orders || []).filter(o => o && o.status === currentOrderFilter);
  }

  if (window.adminSearchQuery) {
    const q = window.adminSearchQuery;
    filteredOrders = filteredOrders.filter(o => {
      if (!o) return false;
      const id = (o.orderId || '').toLowerCase();
      const name = (o.customerName || '').toLowerCase();
      const email = (o.customerEmail || '').toLowerCase();
      const phone = (o.customerPhone || '').toLowerCase();
      return id.includes(q) || name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }

  filteredOrders = [...filteredOrders].sort((a,b) => new Date(b.timestamp || Date.now()) - new Date(a.timestamp || Date.now()));

  if (filteredOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 2.5rem; color:var(--dash-muted);">No orders found. Place an order on the menu page to test!</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredOrders.map(o => `
    <tr>
      <td><strong style="color:var(--dash-blue);">#${(o.orderId || 'PP-000000').replace('PP-','')}</strong></td>
      <td><strong style="color:#fff; font-size:0.95rem;">${o.customerName || 'Guest'}</strong><br><small style="color:var(--dash-muted);">${o.customerPhone || o.customerEmail || ''}</small></td>
      <td>${formatOrderItemsHtml(o.items)}</td>
      <td><span style="background:var(--dash-card2); color:#fff; padding:4px 10px; border-radius:6px; font-weight:600; font-size:0.8rem; border:1px solid var(--dash-border);">${o.paymentMethod || 'Credit Card 💳'}</span></td>
      <td><strong style="color:var(--dash-primary); font-size:1rem;">${formatMoney(o.total || 0)}</strong></td>
      <td><span style="color:#fff; font-weight:600;">${o.pickupTime || '12:00 PM'}</span></td>
      <td>
        <select style="background:var(--dash-card2); color:#fff; border:1px solid var(--dash-border); padding:5px 8px; border-radius:6px; font-weight:600; font-size:0.8rem; cursor:pointer;" onchange="window.changeOrderStatus('${o.orderId}', this.value)">
          <option value="pending" ${o.status==='pending'?'selected':''}>Pending ⏳</option>
          <option value="confirmed" ${o.status==='confirmed'?'selected':''}>Confirmed 👍</option>
          <option value="preparing" ${o.status==='preparing'?'selected':''}>Preparing 🍳</option>
          <option value="ready" ${o.status==='ready'?'selected':''}>Ready ✨</option>
          <option value="picked-up" ${o.status==='picked-up'?'selected':''}>Picked Up 🛍️</option>
        </select>
      </td>
      <td>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-outline" style="padding:4px 10px; font-size:0.8rem; color:#fff; border-color:var(--dash-border); cursor:pointer;" onclick="window.printReceipt('${o.orderId}')">🖨️ Receipt</button>
          <button type="button" class="btn btn-sm btn-outline" style="padding:4px 10px; font-size:0.8rem; color:var(--dash-red); border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.1); cursor:pointer;" onclick="window.deleteOrder('${o.orderId}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.deleteOrder = function(orderId) {
  if (!confirm(`Are you sure you want to delete order #${(orderId || '').replace('PP-','')}? This action cannot be undone.`)) {
    return;
  }

  // Remove from localStorage
  let orders = getLocalOrders();
  orders = orders.filter(o => o && o.orderId !== orderId);
  setLocalOrders(orders);

  // Remove from current memory state
  if (window.currentAdminOrders) {
    window.currentAdminOrders = window.currentAdminOrders.filter(o => o && o.orderId !== orderId);
  }

  // Delete from Firebase Firestore
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    try {
      firebase.firestore().collection('orders').doc(orderId).delete().catch(e => console.warn('Firestore delete notice:', e));
    } catch(e) {}
  }

  renderDashboard();
  renderCustomers();
};

window.changeOrderStatus = function(orderId, newStatus) {
  if (typeof window.updateOrderStatusInFirebase === 'function') {
    window.updateOrderStatusInFirebase(orderId, newStatus);
  } else {
    let orders = getLocalOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
      orders[idx].status = newStatus;
      setLocalOrders(orders);
    }
  }
  renderDashboard();
};

// --- Menu Management ---
function renderMenuTable() {
  const tbody = document.getElementById('menuAdminTable');
  if (!tbody) return;
  
  let overrides = {};
  try {
    overrides = (typeof PPUtils !== 'undefined' && PPUtils.getStorage) ? PPUtils.getStorage('pp_menu_overrides') : JSON.parse(localStorage.getItem('pp_menu_overrides'));
  } catch(e) {}
  overrides = overrides || {};

  const items = (typeof getMenuItems === 'function') ? getMenuItems() : (window.MENU_ITEMS || []);
  
  let html = '';
  items.forEach(item => {
    const isSoldOut = overrides[item.id]?.soldOut || item.soldOut || false;
    const firstPrice = item.prices ? (item.prices.single || item.prices.medium || item.prices.small || 0) : 0;
    html += `
      <tr>
        <td style="font-size: 1.5rem;">${item.emoji}</td>
        <td><strong style="color:#fff;">${item.name}</strong><br><small style="color:var(--dash-muted);">${item.description || ''}</small></td>
        <td><span style="background:var(--dash-card2); padding:3px 8px; border-radius:4px; font-size:0.8rem; color:var(--dash-blue);">${item.categoryLabel || item.category}</span></td>
        <td><strong style="color:var(--dash-primary);">${formatMoney(firstPrice)}</strong></td>
        <td>
          <label class="toggle-switch">
            <input type="checkbox" onchange="window.toggleSoldOut('${item.id}', this.checked)" ${isSoldOut ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-outline" style="padding:4px 10px; font-size:0.8rem; color:#fff; border-color:var(--dash-border);" onclick="alert('Status updated!')">Save</button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

window.toggleSoldOut = function(itemId, checked) {
  let overrides = {};
  try {
    overrides = (typeof PPUtils !== 'undefined' && PPUtils.getStorage) ? PPUtils.getStorage('pp_menu_overrides') : JSON.parse(localStorage.getItem('pp_menu_overrides'));
  } catch(e) {}
  overrides = overrides || {};

  if (!overrides[itemId]) overrides[itemId] = {};
  overrides[itemId].soldOut = checked;
  
  if (typeof PPUtils !== 'undefined' && PPUtils.setStorage) {
    PPUtils.setStorage('pp_menu_overrides', overrides);
  } else {
    localStorage.setItem('pp_menu_overrides', JSON.stringify(overrides));
  }
};

// --- Customers ---
function renderCustomers() {
  const orders = window.currentAdminOrders || getLocalOrders();
  renderCustomersWithOrders(orders);
}

function renderCustomersWithOrders(orders) {
  let customersMap = {};
  
  (orders || []).forEach(o => {
    if (!o) return;
    const key = o.customerEmail || o.customerName || 'Guest';
    if (!customersMap[key]) {
      customersMap[key] = {
        name: o.customerName || 'Guest',
        email: o.customerEmail || '-',
        phone: o.customerPhone || '-',
        ordersCount: 0,
        totalSpent: 0
      };
    }
    customersMap[key].ordersCount++;
    customersMap[key].totalSpent += (o.total || 0);
  });
  
  const tbody = document.getElementById('customersTable');
  if (!tbody) return;
  
  const list = Object.values(customersMap).sort((a,b) => b.totalSpent - a.totalSpent);
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding: 2.5rem; color:var(--dash-muted);">No customers found yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => `
    <tr>
      <td><strong style="color:#fff;">${c.name}</strong></td>
      <td style="color:var(--dash-muted);">${c.email}</td>
      <td style="color:var(--dash-muted);">${c.phone}</td>
      <td><strong style="color:#fff;">${c.ordersCount}</strong></td>
      <td><strong style="color:var(--dash-primary);">${formatMoney(c.totalSpent)}</strong></td>
    </tr>
  `).join('');
}

function getPromoCodes() {
  try {
    const raw = localStorage.getItem('pp_promo_codes');
    return raw ? JSON.parse(raw) : [
      { code: 'PICNIC10', discount: 10 },
      { code: 'SUMMER20', discount: 20 },
      { code: 'FIRSTORDER', discount: 15 },
      { code: 'TEST99', discount: 99.99 }
    ];
  } catch(e) {
    return [
      { code: 'PICNIC10', discount: 10 },
      { code: 'SUMMER20', discount: 20 },
      { code: 'FIRSTORDER', discount: 15 },
      { code: 'TEST99', discount: 99.99 }
    ];
  }
}

function setPromoCodes(codes) {
  try {
    localStorage.setItem('pp_promo_codes', JSON.stringify(codes));
  } catch(e) {}
}

function renderPromoCodesTable() {
  const tbody = document.getElementById('promoCodesTable');
  if (!tbody) return;
  const codes = getPromoCodes();
  if (codes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="color:var(--dash-muted); padding:1rem; text-align:center;">No promo codes created yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = codes.map(c => `
    <tr>
      <td><strong style="color:var(--dash-primary); font-size:0.95rem;">${c.code}</strong></td>
      <td><span style="background:var(--dash-card2); color:#fff; padding:3px 8px; border-radius:4px; font-weight:700;">${c.discount}% OFF</span></td>
      <td>
        <button type="button" class="btn btn-sm btn-outline" style="padding:3px 8px; font-size:0.8rem; color:var(--dash-red); border-color:rgba(239,68,68,0.3);" onclick="window.deletePromoCode('${c.code}')">🗑️ Remove</button>
      </td>
    </tr>
  `).join('');
}

window.deletePromoCode = function(code) {
  let codes = getPromoCodes().filter(c => c.code !== code);
  setPromoCodes(codes);
  renderPromoCodesTable();
};

// --- Settings ---
function setupSettings() {
  renderPromoCodesTable();

  const btnExport = document.getElementById('btnExportCSV');
  const btnClear = document.getElementById('btnClearData');

  if (btnExport && !btnExport.dataset.bound) {
    btnExport.dataset.bound = "true";
    btnExport.addEventListener('click', () => {
      const orders = getLocalOrders();
      if (orders.length === 0) return alert("No orders to export.");
      
      const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Payment Method', 'Total', 'Status'];
      const rows = orders.map(o => [
        o.orderId, 
        new Date(o.timestamp).toLocaleString(), 
        `"${o.customerName || 'Guest'}"`, 
        o.customerEmail || '', 
        `"${o.paymentMethod || 'Credit Card'}"`, 
        (o.total || 0).toFixed(2), 
        o.status
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `picnic_orders_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }
  
  if (btnClear && !btnClear.dataset.bound) {
    btnClear.dataset.bound = "true";
    btnClear.addEventListener('click', () => {
      if(confirm("WARNING: This will clear all orders and settings. Are you sure?")) {
        const keys = ['pp_orders', 'pp_user', 'pp_cart', 'pp_menu_overrides', 'pp_promo_codes'];
        keys.forEach(k => localStorage.removeItem(k));
        alert("All data cleared. Reloading...");
        window.location.reload();
      }
    });
  }
}

// Printable Receipt
window.printReceipt = function(orderId) {
  const orders = getLocalOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;
  
  let printWin = window.open('', '_blank');
  const itemsHtml = (order.items || []).map(i => `
    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
      <span>${i.quantity}x ${i.name} (${i.size || 'single'}${i.flavor ? ' - ' + i.flavor : ''})</span>
      <span>$${((i.unitPrice || 0) * (i.quantity || 1)).toFixed(2)}</span>
    </div>
  `).join('');

  printWin.document.write(`
    <html>
    <head><title>Receipt #${order.orderId}</title></head>
    <body style="font-family:monospace; padding:20px; width:300px;">
      <h2 style="text-align:center; margin-bottom:4px;">Picnic Paradise</h2>
      <p style="text-align:center; margin-top:0;">Order #${order.orderId}</p>
      <hr/>
      <p><strong>Customer:</strong> ${order.customerName || 'Guest'}</p>
      <p><strong>Pickup Time:</strong> ${order.pickupTime || '12:00 PM'}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod || 'Credit Card'}</p>
      <hr/>
      ${itemsHtml}
      <hr/>
      <p style="text-align:right;"><strong>Total Paid: $${(order.total || 0).toFixed(2)}</strong></p>
    </body>
    </html>
  `);
  printWin.document.close();
  printWin.focus();
  printWin.print();
  printWin.close();
};
