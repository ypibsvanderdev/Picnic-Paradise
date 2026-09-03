// js/admin.js - The Sugar Printer Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  initAdminAuth();
  initSidebar();
  initDashboard();
  initProductManager();
  initPromoCodes();
  initSettings();
});

// --- Authentication ---
function initAdminAuth() {
  const gate = document.getElementById('adminLoginGate');
  const dashboard = document.getElementById('adminDashboard');
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('adminLoginError');
  const googleBtn = document.getElementById('googleSignInBtn');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  const isAdminLoggedIn = sessionStorage.getItem('pp_admin_logged_in') === 'true';

  if (isAdminLoggedIn) {
    if (gate) gate.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
  } else {
    if (gate) gate.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('adminUser').value.trim();
      const pass = document.getElementById('adminPass').value.trim();

      // Accepted default admin logins
      if ((user === 'admin' || user.toLowerCase().includes('@')) && (pass === 'picnic2026' || pass === 'admin' || pass === 'sugar2026')) {
        sessionStorage.setItem('pp_admin_logged_in', 'true');
        sessionStorage.setItem('pp_admin_user', user);
        if (gate) gate.style.display = 'none';
        if (dashboard) dashboard.style.display = 'flex';
        renderDashboard();
        renderProductsTable();
      } else {
        if (loginError) {
          loginError.textContent = 'Invalid credentials. Use admin / picnic2026';
          loginError.style.display = 'block';
        }
      }
    });
  }

  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      sessionStorage.setItem('pp_admin_logged_in', 'true');
      sessionStorage.setItem('pp_admin_user', 'admin@sugarprinter.com');
      if (gate) gate.style.display = 'none';
      if (dashboard) dashboard.style.display = 'flex';
      renderDashboard();
      renderProductsTable();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('pp_admin_logged_in');
      sessionStorage.removeItem('pp_admin_user');
      window.location.reload();
    });
  }
}

// --- Navigation ---
function initSidebar() {
  const links = document.querySelectorAll('.sb-link[data-target]');
  const sections = document.querySelectorAll('.admin-section');
  const pageTitle = document.getElementById('pageTitle');

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      link.classList.add('active');
      const targetId = link.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add('active');

      if (pageTitle) {
        if (targetId === 'section-dashboard') pageTitle.textContent = 'Dashboard & Orders';
        else if (targetId === 'section-menu') pageTitle.textContent = 'Products & Inventory';
        else if (targetId === 'section-customers') pageTitle.textContent = 'Customers';
        else if (targetId === 'section-settings') pageTitle.textContent = 'Settings';
      }

      if (targetId === 'section-menu') renderProductsTable();
      if (targetId === 'section-customers') renderCustomers();
      if (targetId === 'section-dashboard') renderDashboard();
    });
  });
}

// --- Dashboard & Orders ---
function initDashboard() {
  const searchInput = document.getElementById('adminOrderSearch');
  const filterTabs = document.querySelectorAll('#ordersFilterTabs .filter-tab');
  const btnToggleSound = document.getElementById('btnToggleSound');

  window.soundEnabled = true;
  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      window.soundEnabled = !window.soundEnabled;
      btnToggleSound.textContent = window.soundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF';
      btnToggleSound.style.opacity = window.soundEnabled ? '1' : '0.6';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderRecentOrders();
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderRecentOrders();
    });
  });

  // Listen for storage / order events
  window.addEventListener('storage', () => {
    renderDashboard();
  });
  window.addEventListener('inventoryUpdated', () => {
    renderProductsTable();
  });

  renderDashboard();
}

function renderDashboard() {
  const orders = (typeof PPUtils !== 'undefined' && PPUtils.getOrders) ? PPUtils.getOrders() : (JSON.parse(localStorage.getItem('pp_orders')) || []);
  
  // Stats
  const statTotal = document.getElementById('statTotalOrders');
  const statRev = document.getElementById('statRevenue');
  const statSold = document.getElementById('statItemsSold');
  const statPay = document.getElementById('statPaymentMethods');

  let totalRev = 0;
  let itemsSold = 0;
  let payMethods = {};

  orders.forEach(o => {
    totalRev += (o.total || 0);
    (o.items || []).forEach(it => {
      itemsSold += (it.quantity || 1);
    });
    const method = o.paymentMethod || 'Online';
    payMethods[method] = (payMethods[method] || 0) + 1;
  });

  if (statTotal) statTotal.textContent = orders.length;
  if (statRev) statRev.textContent = `$${totalRev.toFixed(2)}`;
  if (statSold) statSold.textContent = itemsSold;
  if (statPay) {
    const keys = Object.keys(payMethods);
    statPay.textContent = keys.length > 0 ? `${keys[0]} (${payMethods[keys[0]]})` : 'Credit/Debit';
  }

  renderRecentOrders();
  renderTopSelling(orders);
}

function renderRecentOrders() {
  const tbody = document.getElementById('recentOrdersTable');
  if (!tbody) return;

  const orders = (typeof PPUtils !== 'undefined' && PPUtils.getOrders) ? PPUtils.getOrders() : (JSON.parse(localStorage.getItem('pp_orders')) || []);
  const search = (document.getElementById('adminOrderSearch')?.value || '').toLowerCase().trim();
  const activeTab = document.querySelector('#ordersFilterTabs .filter-tab.active')?.dataset.filter || 'all';

  let filtered = orders.slice().reverse().filter(o => {
    if (activeTab !== 'all' && o.status !== activeTab) return false;
    if (search) {
      const matchId = (o.orderId || '').toLowerCase().includes(search);
      const matchName = (o.customerName || '').toLowerCase().includes(search);
      const matchEmail = (o.customerEmail || '').toLowerCase().includes(search);
      return matchId || matchName || matchEmail;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--dash-muted);">No orders found.</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(o => {
    const statusClass = `status-${o.status || 'pending'}`;
    const itemsSummary = (o.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ');

    html += `
      <tr>
        <td><strong style="color:var(--dash-blue); font-family:monospace;">#${(o.orderId || '').replace('PP-', '')}</strong></td>
        <td><strong>${o.customerName || 'Customer'}</strong><br><small style="color:var(--dash-muted);">${o.customerEmail || ''}</small></td>
        <td><div style="max-width:260px; font-size:0.85rem; color:#fff;">${itemsSummary}</div></td>
        <td><span style="font-size:0.8rem; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px;">${o.paymentMethod || 'Credit Card'}</span></td>
        <td><strong style="color:var(--dash-green); font-size:0.95rem;">$${(o.total || 0).toFixed(2)}</strong></td>
        <td><span style="font-size:0.85rem; color:var(--dash-muted);">${o.pickupTime || 'Standard'}</span></td>
        <td><span class="status-badge ${statusClass}">${o.status || 'pending'}</span></td>
        <td>
          <select class="select" style="padding:4px 8px; font-size:0.8rem; background:var(--dash-card2); color:#fff; border:1px solid var(--dash-border);" onchange="updateOrderStatus('${o.orderId}', this.value)">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>Ready</option>
            <option value="picked-up" ${o.status === 'picked-up' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

window.updateOrderStatus = function(orderId, newStatus) {
  let orders = (typeof PPUtils !== 'undefined' && PPUtils.getOrders) ? PPUtils.getOrders() : (JSON.parse(localStorage.getItem('pp_orders')) || []);
  const idx = orders.findIndex(o => o.orderId === orderId);
  if (idx > -1) {
    orders[idx].status = newStatus;
    if (typeof PPUtils !== 'undefined' && PPUtils.setStorage) {
      PPUtils.setStorage('pp_orders', orders);
    } else {
      localStorage.setItem('pp_orders', JSON.stringify(orders));
    }
    if (typeof PPUtils !== 'undefined' && PPUtils.showToast) {
      PPUtils.showToast(`Order ${orderId} updated to ${newStatus}`, 'info');
    }
    renderDashboard();
  }
};

function renderTopSelling(orders) {
  const container = document.getElementById('topSellingContainer');
  if (!container) return;

  const counts = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      counts[item.name] = (counts[item.name] || 0) + (item.quantity || 1);
    });
  });

  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 5);
  if (sorted.length === 0) {
    container.innerHTML = '<p style="color:var(--dash-muted); font-size:0.9rem;">No sales recorded yet.</p>';
    return;
  }

  let html = '';
  sorted.forEach(([name, qty]) => {
    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--dash-card2); padding:10px 14px; border-radius:8px;">
        <span style="font-weight:600; color:#fff;">${name}</span>
        <span style="background:var(--dash-primary); color:#fff; padding:2px 8px; border-radius:12px; font-weight:700; font-size:0.8rem;">${qty} sold</span>
      </div>
    `;
  });
  container.innerHTML = html;
}

// --- Product & Inventory Manager ---
let currentUploadedImageDataUrl = '';

function initProductManager() {
  const btnOpen = document.getElementById('btnOpenAddProduct');
  const btnClose = document.getElementById('btnCloseProductModal');
  const btnCancel = document.getElementById('btnCancelProductModal');
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');

  const fileInput = document.getElementById('prodImageFile');
  const urlInput = document.getElementById('prodImageUrl');
  const imgPreview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('imagePreviewPlaceholder');
  const btnRemoveImage = document.getElementById('btnRemoveImage');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      openProductModal();
    });
  }

  if (btnClose) btnClose.addEventListener('click', closeProductModal);
  if (btnCancel) btnCancel.addEventListener('click', closeProductModal);

  // File Upload Handling
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('Please choose an image under 2MB.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          currentUploadedImageDataUrl = event.target.result;
          displayImagePreview(currentUploadedImageDataUrl);
          if (urlInput) urlInput.value = '';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // URL Input Handling
  if (urlInput) {
    urlInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        currentUploadedImageDataUrl = url;
        displayImagePreview(url);
      } else {
        resetImagePreview();
      }
    });
  }

  if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', () => {
      resetImagePreview();
    });
  }

  // Save Product Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('prodEditId').value;
      const name = document.getElementById('prodName').value.trim();
      const category = document.getElementById('prodCategory').value;
      const price = parseFloat(document.getElementById('prodPrice').value) || 0;
      const stock = parseInt(document.getElementById('prodStock').value, 10) || 0;
      const desc = document.getElementById('prodDesc').value.trim();
      const flavorsStr = document.getElementById('prodFlavors').value.trim();
      const emoji = document.getElementById('prodEmoji').value.trim() || '✨';
      const featured = document.getElementById('prodFeatured').checked;
      const popular = document.getElementById('prodPopular').checked;

      const categoryLabels = {
        'fidgets': 'Fidgets & Squishies',
        '3d-prints': '3D Prints & Models',
        'novelties': 'Novelties & Desk Toys',
        'sweets': 'Sweet Treats'
      };

      const flavors = flavorsStr ? flavorsStr.split(',').map(s => s.trim()).filter(Boolean) : null;

      const id = editId || ('item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4));

      const product = {
        id: id,
        name: name,
        category: category,
        categoryLabel: categoryLabels[category] || category,
        type: category,
        subtype: null,
        description: desc,
        prices: { single: price },
        stock: stock,
        soldOut: stock <= 0,
        flavors: flavors,
        image: currentUploadedImageDataUrl || '',
        emoji: emoji,
        gradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        rating: 5.0,
        reviews: 1,
        featured: featured,
        popular: popular
      };

      if (typeof PPUtils !== 'undefined' && PPUtils.saveProduct) {
        PPUtils.saveProduct(product);
        PPUtils.showToast(editId ? `Updated ${name}!` : `Added ${name} to store!`, 'success');
      }

      closeProductModal();
      renderProductsTable();
    });
  }

  renderProductsTable();
}

function displayImagePreview(src) {
  const imgPreview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('imagePreviewPlaceholder');
  const btnRemove = document.getElementById('btnRemoveImage');

  if (imgPreview && placeholder) {
    imgPreview.src = src;
    imgPreview.style.display = 'block';
    placeholder.style.display = 'none';
    if (btnRemove) btnRemove.style.display = 'inline-block';
  }
}

function resetImagePreview() {
  currentUploadedImageDataUrl = '';
  const imgPreview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('imagePreviewPlaceholder');
  const btnRemove = document.getElementById('btnRemoveImage');
  const fileInput = document.getElementById('prodImageFile');
  const urlInput = document.getElementById('prodImageUrl');

  if (imgPreview && placeholder) {
    imgPreview.src = '';
    imgPreview.style.display = 'none';
    placeholder.style.display = 'block';
    if (btnRemove) btnRemove.style.display = 'none';
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
  }
}

function openProductModal(item = null) {
  const modal = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalProductTitle');
  if (!modal) return;

  resetImagePreview();

  if (item) {
    modalTitle.textContent = '✏️ Edit Product';
    document.getElementById('prodEditId').value = item.id;
    document.getElementById('prodName').value = item.name || '';
    document.getElementById('prodCategory').value = item.category || 'fidgets';
    const priceVal = item.prices ? (item.prices.single || item.prices.medium || item.prices.small || 0) : 0;
    document.getElementById('prodPrice').value = priceVal;
    document.getElementById('prodStock').value = (item.stock !== undefined) ? item.stock : 1;
    document.getElementById('prodDesc').value = item.description || '';
    document.getElementById('prodFlavors').value = item.flavors ? item.flavors.join(', ') : '';
    document.getElementById('prodEmoji').value = item.emoji || '✨';
    document.getElementById('prodFeatured').checked = !!item.featured;
    document.getElementById('prodPopular').checked = !!item.popular;

    if (item.image) {
      currentUploadedImageDataUrl = item.image;
      displayImagePreview(item.image);
    }
  } else {
    modalTitle.textContent = '➕ Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('prodEditId').value = '';
    document.getElementById('prodStock').value = 1;
    document.getElementById('prodPrice').value = 5.00;
  }

  modal.style.display = 'flex';
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.style.display = 'none';
  resetImagePreview();
}

// --- Render Products Table ---
function renderProductsTable() {
  const tbody = document.getElementById('menuAdminTable');
  if (!tbody) return;

  const items = (typeof PPUtils !== 'undefined' && PPUtils.getMenuItems) ? PPUtils.getMenuItems() : (window.MENU_ITEMS || []);

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--dash-muted);">No products found in store.</td></tr>';
    return;
  }

  let html = '';
  items.forEach(item => {
    const stock = (item.stock !== undefined) ? parseInt(item.stock, 10) : 1;
    const isSoldOut = (stock <= 0) || item.soldOut;
    const price = item.prices ? (item.prices.single || item.prices.medium || item.prices.small || 0) : 0;

    let stockBadgeHtml = '';
    if (stock <= 0) {
      stockBadgeHtml = '<span class="stock-badge out-of-stock">❌ Out of Stock</span>';
    } else if (stock === 1) {
      stockBadgeHtml = '<span class="stock-badge low-stock">⚠️ Only 1 Left</span>';
    } else if (stock <= 3) {
      stockBadgeHtml = `<span class="stock-badge low-stock">⚡ Low Stock (${stock})</span>`;
    } else {
      stockBadgeHtml = `<span class="stock-badge in-stock">✅ In Stock (${stock})</span>`;
    }

    let thumbHtml = '';
    if (item.image) {
      thumbHtml = `<div class="product-thumb-box"><img src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='<span style=\'font-size:1.5rem;\'>${item.emoji || '📦'}</span>';"></div>`;
    } else {
      thumbHtml = `<div class="product-thumb-box" style="background:${item.gradient || 'var(--dash-card2)'}">${item.emoji || '✨'}</div>`;
    }

    html += `
      <tr>
        <td>${thumbHtml}</td>
        <td>
          <strong style="color:#fff; font-size:0.95rem;">${item.name}</strong><br>
          <small style="color:var(--dash-muted); display:block; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.description || 'No description'}</small>
        </td>
        <td><span style="background:var(--dash-card2); padding:3px 8px; border-radius:6px; font-size:0.8rem; color:var(--dash-blue); font-weight:600;">${item.categoryLabel || item.category}</span></td>
        <td><strong style="color:var(--dash-green); font-size:1rem;">$${price.toFixed(2)}</strong></td>
        <td>
          <div class="stock-stepper-inline">
            <button type="button" class="stock-btn-step" onclick="stepStock('${item.id}', -1)" title="Decrease Stock">-</button>
            <input type="number" class="stock-input-field" min="0" value="${stock}" onchange="changeStockExact('${item.id}', this.value)">
            <button type="button" class="stock-btn-step" onclick="stepStock('${item.id}', 1)" title="Increase Stock">+</button>
          </div>
        </td>
        <td>
          ${stockBadgeHtml}
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; gap:6px;">
            <button type="button" class="btn btn-sm btn-outline" style="padding:5px 10px; font-size:0.8rem; color:#fff;" onclick="editProductPrompt('${item.id}')">✏️ Edit</button>
            <button type="button" class="btn btn-sm btn-outline" style="padding:5px 8px; font-size:0.8rem; color:var(--dash-red); border-color:rgba(239,68,68,0.3);" onclick="deleteProductPrompt('${item.id}', '${item.name}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Global Stock Adjusters
window.stepStock = function(itemId, delta) {
  const items = (typeof PPUtils !== 'undefined' && PPUtils.getMenuItems) ? PPUtils.getMenuItems() : (window.MENU_ITEMS || []);
  const item = items.find(i => i.id === itemId);
  const currentStock = item ? (item.stock ?? 1) : 1;
  const nextStock = Math.max(0, currentStock + delta);
  
  if (typeof PPUtils !== 'undefined' && PPUtils.updateProductStock) {
    PPUtils.updateProductStock(itemId, nextStock);
    PPUtils.showToast(`Stock for ${item?.name || 'Item'} set to ${nextStock}`, 'info');
  }
  renderProductsTable();
};

window.changeStockExact = function(itemId, value) {
  const num = Math.max(0, parseInt(value, 10) || 0);
  if (typeof PPUtils !== 'undefined' && PPUtils.updateProductStock) {
    PPUtils.updateProductStock(itemId, num);
    PPUtils.showToast(`Stock updated to ${num}`, 'info');
  }
  renderProductsTable();
};

window.editProductPrompt = function(itemId) {
  const items = (typeof PPUtils !== 'undefined' && PPUtils.getMenuItems) ? PPUtils.getMenuItems() : (window.MENU_ITEMS || []);
  const item = items.find(i => i.id === itemId);
  if (item) {
    openProductModal(item);
  }
};

window.deleteProductPrompt = function(itemId, name) {
  if (confirm(`Are you sure you want to delete "${name}" from your store?`)) {
    if (typeof PPUtils !== 'undefined' && PPUtils.deleteProduct) {
      PPUtils.deleteProduct(itemId);
      PPUtils.showToast(`Deleted ${name}`, 'error');
    }
    renderProductsTable();
  }
};

// --- Customers ---
function renderCustomers() {
  const orders = (typeof PPUtils !== 'undefined' && PPUtils.getOrders) ? PPUtils.getOrders() : (JSON.parse(localStorage.getItem('pp_orders')) || []);
  const tbody = document.getElementById('customersTable');
  if (!tbody) return;

  let map = {};
  orders.forEach(o => {
    const key = o.customerEmail || o.customerName || 'Guest';
    if (!map[key]) {
      map[key] = {
        name: o.customerName || 'Guest',
        email: o.customerEmail || '-',
        phone: o.customerPhone || '-',
        ordersCount: 0,
        totalSpent: 0
      };
    }
    map[key].ordersCount++;
    map[key].totalSpent += (o.total || 0);
  });

  const list = Object.values(map);
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--dash-muted);">No customers yet.</td></tr>';
    return;
  }

  let html = '';
  list.forEach(c => {
    html += `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.email}</td>
        <td>${c.phone}</td>
        <td><span style="background:var(--dash-card2); padding:2px 8px; border-radius:4px; font-weight:700;">${c.ordersCount}</span></td>
        <td><strong style="color:var(--dash-green);">$${c.totalSpent.toFixed(2)}</strong></td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// --- Promo Codes & Settings ---
function initPromoCodes() {
  const form = document.getElementById('addPromoForm');
  const tbody = document.getElementById('promoCodesTable');

  function renderPromoCodes() {
    if (!tbody) return;
    const defaultCodes = { 'SUGAR10': 0.10, 'PRINT20': 0.20, 'FIRSTORDER': 0.15 };
    const customCodes = (typeof PPUtils !== 'undefined' && PPUtils.getStorage) ? (PPUtils.getStorage('pp_custom_promos') || {}) : {};
    const all = { ...defaultCodes, ...customCodes };

    let html = '';
    Object.entries(all).forEach(([code, rate]) => {
      html += `
        <tr>
          <td><strong style="color:var(--dash-blue); font-family:monospace; font-size:1rem;">${code}</strong></td>
          <td><span style="color:var(--dash-green); font-weight:700;">${Math.round(rate * 100)}% OFF</span></td>
          <td>
            ${customCodes[code] ? `<button type="button" class="btn btn-sm btn-ghost" style="color:var(--dash-red);" onclick="deletePromoCode('${code}')">Delete</button>` : '<small style="color:var(--dash-muted);">Default</small>'}
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('promoCodeInput').value.trim().toUpperCase();
      const discount = parseInt(document.getElementById('promoDiscountInput').value, 10);
      if (code && discount > 0) {
        let customCodes = (typeof PPUtils !== 'undefined' && PPUtils.getStorage) ? (PPUtils.getStorage('pp_custom_promos') || {}) : {};
        customCodes[code] = discount / 100;
        if (typeof PPUtils !== 'undefined' && PPUtils.setStorage) {
          PPUtils.setStorage('pp_custom_promos', customCodes);
          PPUtils.showToast(`Created promo code ${code}!`, 'success');
        }
        form.reset();
        renderPromoCodes();
      }
    });
  }

  window.deletePromoCode = function(code) {
    let customCodes = (typeof PPUtils !== 'undefined' && PPUtils.getStorage) ? (PPUtils.getStorage('pp_custom_promos') || {}) : {};
    delete customCodes[code];
    if (typeof PPUtils !== 'undefined' && PPUtils.setStorage) {
      PPUtils.setStorage('pp_custom_promos', customCodes);
      PPUtils.showToast(`Deleted promo code ${code}`, 'info');
    }
    renderPromoCodes();
  };

  renderPromoCodes();
}

function initSettings() {
  const btnExport = document.getElementById('btnExportCSV');
  const btnResetInv = document.getElementById('btnResetInventory');
  const btnClear = document.getElementById('btnClearData');

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const orders = (typeof PPUtils !== 'undefined' && PPUtils.getOrders) ? PPUtils.getOrders() : [];
      let csv = 'Order ID,Customer,Email,Total,Status,Items\n';
      orders.forEach(o => {
        const items = (o.items || []).map(i => `${i.quantity}x ${i.name}`).join('; ');
        csv += `"${o.orderId}","${o.customerName || ''}","${o.customerEmail || ''}","${o.total || 0}","${o.status || ''}","${items}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `the_sugar_printer_orders_${Date.now()}.csv`;
      a.click();
    });
  }

  if (btnResetInv) {
    btnResetInv.addEventListener('click', () => {
      if (confirm('Reset store inventory back to initial default items (1 Mini Purple Mattress, 1 NeeDoh, 1 NeeDoh Nice Berg)?')) {
        localStorage.removeItem('pp_menu_overrides');
        localStorage.removeItem('pp_custom_items');
        localStorage.removeItem('pp_deleted_items');
        if (typeof PPUtils !== 'undefined' && PPUtils.showToast) {
          PPUtils.showToast('Inventory reset to initial defaults (1 in stock each)!', 'success');
        }
        renderProductsTable();
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (confirm('Clear all orders history?')) {
        localStorage.removeItem('pp_orders');
        renderDashboard();
        if (typeof PPUtils !== 'undefined' && PPUtils.showToast) {
          PPUtils.showToast('Orders history cleared', 'info');
        }
      }
    });
  }
}
