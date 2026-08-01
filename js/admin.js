document.addEventListener('DOMContentLoaded', () => {
  // Authentication & Initialization
  const adminLogin = document.getElementById('adminLogin');
  const adminDashboard = document.getElementById('adminDashboard');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

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
    if (adminDashboard) adminDashboard.style.display = 'flex';
    initAdmin(currentUser || 'Admin');
  }

  // Password Login
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('adminUser').value.trim();
      const pass = document.getElementById('adminPass').value;
      const err = document.getElementById('adminLoginError');
      
      const validUsers = ['admin', 'yahiamoon13@gmail.com', 'meqdad@gmail.com'];
      const storedPass = localStorage.getItem('pp_admin_pass');
      
      const isPassValid = (pass === 'Eman165*' || pass === 'picnic2026' || (storedPass && pass === storedPass));
      const isUserValid = validUsers.includes(user.toLowerCase());

      if (isUserValid && isPassValid) {
        sessionStorage.setItem('pp_admin_logged_in', 'true');
        sessionStorage.setItem('pp_admin_user', user);
        localStorage.setItem('pp_user', JSON.stringify({
          id: 'u_' + Date.now(),
          name: user.split('@')[0],
          email: user,
          isAdmin: true
        }));
        window.location.reload();
      } else {
        if (err) {
          err.textContent = 'Invalid username or password. (Default password: Eman165*)';
          err.style.display = 'block';
        }
      }
    });
  }

  // Google Sign-In Handler
  const googleAdminBtn = document.getElementById('googleAdminBtn');
  if (googleAdminBtn) {
    googleAdminBtn.addEventListener('click', async () => {
      const err = document.getElementById('adminLoginError');
      if (err) err.style.display = 'none';
      
      try {
        if (typeof window.signInWithGoogle === 'function') {
          const user = await window.signInWithGoogle();
          if (user && user.email) {
            sessionStorage.setItem('pp_admin_logged_in', 'true');
            sessionStorage.setItem('pp_admin_user', user.email);
            localStorage.setItem('pp_user', JSON.stringify({
              id: user.uid || ('u_' + Date.now()),
              name: user.name || user.email.split('@')[0],
              email: user.email,
              photoURL: user.photoURL || null,
              isAdmin: true
            }));
            window.location.reload();
          }
        }
      } catch (error) {
        console.warn('Google Sign-In notice:', error);
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('pp_admin_logged_in');
      sessionStorage.removeItem('pp_admin_user');
      localStorage.removeItem('pp_user');
      window.location.href = 'index.html';
    });
  }

  // Navigation Tabs (Shinely style)
  const navItems = document.querySelectorAll('.sb-link[data-target]');
  const sections = document.querySelectorAll('.admin-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      item.classList.add('active');
      const targetSec = document.getElementById(item.dataset.target);
      if (targetSec) targetSec.classList.add('active');
      
      refreshSection(item.dataset.target);
    });
  });

  function refreshSection(target) {
    switch(target) {
      case 'section-dashboard': renderDashboard(); break;
      case 'section-menu': renderMenuTable(); break;
      case 'section-customers': renderCustomers(); break;
    }
  }

  // --- Main Initialization ---
  function initAdmin(userEmail) {
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

    renderDashboard();
    renderMenuTable();
    renderCustomers();
    setupSettings();
  }

  let currentOrderFilter = 'all';
  
  const filterTabs = document.querySelectorAll('#ordersFilterTabs .filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentOrderFilter = tab.dataset.filter;
      renderDashboard();
    });
  });

  // --- Dashboard & Orders ---
  function renderDashboard() {
    const orders = PPUtils.getStorage('pp_orders') || [];
    
    let totalRev = 0;
    let itemsSold = 0;
    let payCounts = { card: 0, apple: 0, google: 0 };
    
    orders.forEach(o => {
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

    if (elOrders) elOrders.textContent = orders.length;
    if (elRev) elRev.textContent = PPUtils.formatCurrency(totalRev);
    if (elSold) elSold.textContent = itemsSold;
    if (elPay) {
      elPay.innerHTML = `💳 ${payCounts.card} | 🍎 ${payCounts.apple} | 🌐 ${payCounts.google}`;
    }
    
    renderOrdersTable(orders);
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
    
    let filteredOrders = orders;
    if (currentOrderFilter !== 'all') {
      filteredOrders = orders.filter(o => o.status === currentOrderFilter);
    }

    filteredOrders.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filteredOrders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 2.5rem; color:var(--dash-muted);">No orders found. Place an order on the menu page to test!</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredOrders.map(o => `
      <tr>
        <td><strong style="color:var(--dash-blue);">#${o.orderId.replace('PP-','')}</strong></td>
        <td><strong style="color:#fff; font-size:0.95rem;">${o.customerName || 'Guest'}</strong><br><small style="color:var(--dash-muted);">${o.customerPhone || o.customerEmail || ''}</small></td>
        <td>${formatOrderItemsHtml(o.items)}</td>
        <td><span style="background:var(--dash-card2); color:#fff; padding:4px 10px; border-radius:6px; font-weight:600; font-size:0.8rem; border:1px solid var(--dash-border);">${o.paymentMethod || 'Credit Card 💳'}</span></td>
        <td><strong style="color:var(--dash-primary); font-size:1rem;">${PPUtils.formatCurrency(o.total || 0)}</strong></td>
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
          <button type="button" class="btn btn-sm btn-outline" style="padding:4px 10px; font-size:0.8rem; color:#fff; border-color:var(--dash-border);" onclick="window.printReceipt('${o.orderId}')">🖨️ Receipt</button>
        </td>
      </tr>
    `).join('');
  }

  window.changeOrderStatus = function(orderId, newStatus) {
    let orders = PPUtils.getStorage('pp_orders') || [];
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
      orders[idx].status = newStatus;
      PPUtils.setStorage('pp_orders', orders);
      renderDashboard();
    }
  };

  // --- Menu Management ---
  function renderMenuTable() {
    const tbody = document.getElementById('menuAdminTable');
    if (!tbody) return;
    const overrides = PPUtils.getStorage('pp_menu_overrides') || {};
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
          <td><strong style="color:var(--dash-primary);">${PPUtils.formatCurrency(firstPrice)}</strong></td>
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
    let overrides = PPUtils.getStorage('pp_menu_overrides') || {};
    if (!overrides[itemId]) overrides[itemId] = {};
    overrides[itemId].soldOut = checked;
    PPUtils.setStorage('pp_menu_overrides', overrides);
  };

  // --- Customers ---
  function renderCustomers() {
    const orders = PPUtils.getStorage('pp_orders') || [];
    let customersMap = {};
    
    orders.forEach(o => {
      const email = o.customerEmail || o.customerName || 'Guest';
      if (!customersMap[email]) {
        customersMap[email] = {
          name: o.customerName || 'Guest',
          email: o.customerEmail || '-',
          phone: o.customerPhone || '-',
          ordersCount: 0,
          totalSpent: 0
        };
      }
      customersMap[email].ordersCount++;
      customersMap[email].totalSpent += (o.total || 0);
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
        <td><strong>${c.ordersCount}</strong></td>
        <td><strong style="color:var(--dash-primary);">${PPUtils.formatCurrency(c.totalSpent)}</strong></td>
      </tr>
    `).join('');
  }

  // --- Settings ---
  function setupSettings() {
    document.getElementById('btnExportCSV')?.addEventListener('click', () => {
      const orders = PPUtils.getStorage('pp_orders') || [];
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
    
    document.getElementById('btnClearData')?.addEventListener('click', () => {
      if(confirm("WARNING: This will clear all orders and settings. Are you sure?")) {
        const keys = ['pp_orders', 'pp_user', 'pp_cart', 'pp_menu_overrides'];
        keys.forEach(k => localStorage.removeItem(k));
        alert("All data cleared. Reloading...");
        window.location.reload();
      }
    });
  }

  // Printable Receipt
  window.printReceipt = function(orderId) {
    const orders = PPUtils.getStorage('pp_orders') || [];
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
});
