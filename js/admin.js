document.addEventListener('DOMContentLoaded', () => {
  // Authentication & Initialization
  const adminLogin = document.getElementById('adminLogin');
  const adminDashboard = document.getElementById('adminDashboard');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  // Check login state
  if (sessionStorage.getItem('pp_admin_logged_in') === 'true') {
    adminLogin.style.display = 'none';
    adminDashboard.style.display = 'flex';
    initAdmin();
  }

  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value;
    const err = document.getElementById('adminLoginError');
    
    const validUsers = ['admin', 'yahiamoon13@gmail.com', 'meqdad@gmail.com'];
    const storedPass = localStorage.getItem('pp_admin_pass');
    
    // Fail-safe password check: Eman165*, picnic2026, or custom stored password
    const isPassValid = (pass === 'Eman165*' || pass === 'picnic2026' || (storedPass && pass === storedPass));
    const isUserValid = validUsers.includes(user.toLowerCase());

    if (isUserValid && isPassValid) {
      sessionStorage.setItem('pp_admin_logged_in', 'true');
      sessionStorage.setItem('pp_admin_user', user);
      adminLogin.style.display = 'none';
      adminDashboard.style.display = 'flex';
      initAdmin();
    } else {
      err.textContent = 'Invalid username or password. (Default password: Eman165*)';
      err.style.display = 'block';
    }
  });

  // Google Sign-In Handler for Admin
  const googleAdminBtn = document.getElementById('googleAdminBtn');
  if (googleAdminBtn) {
    googleAdminBtn.addEventListener('click', async () => {
      const err = document.getElementById('adminLoginError');
      if (err) err.style.display = 'none';
      
      try {
        if (typeof window.signInWithGoogle === 'function') {
          const user = await window.signInWithGoogle();
          const validUsers = ['admin', 'yahiamoon13@gmail.com', 'meqdad@gmail.com'];
          
          if (validUsers.includes(user.email.toLowerCase().trim())) {
            sessionStorage.setItem('pp_admin_logged_in', 'true');
            sessionStorage.setItem('pp_admin_user', user.email);
            adminLogin.style.display = 'none';
            adminDashboard.style.display = 'flex';
            initAdmin();
          } else {
            if (err) {
              err.textContent = `Access Denied: ${user.email} is not an authorized Admin account.`;
              err.style.display = 'block';
            }
          }
        }
      } catch (error) {
        console.warn('Google Sign-In notice:', error);
      }
    });
  }

  adminLogoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('pp_admin_logged_in');
    adminLogin.style.display = 'block';
    adminDashboard.style.display = 'none';
  });

  // Navigation
  const navItems = document.querySelectorAll('.admin-nav-item');
  const sections = document.querySelectorAll('.admin-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      item.classList.add('active');
      document.getElementById(item.dataset.target).classList.add('active');
      
      // Refresh section data
      refreshSection(item.dataset.target);
    });
  });

  function refreshSection(target) {
    switch(target) {
      case 'section-dashboard': renderDashboard(); break;
      case 'section-menu': renderMenuTable(); break;
      case 'section-orders': renderOrdersTable(); break;
      case 'section-reports': renderReports(); break;
      case 'section-customers': renderCustomers(); break;
      case 'section-announcements': renderAnnouncements(); break;
    }
  }

  // --- Main Initialization ---
  function initAdmin() {
    renderDashboard();
    renderMenuTable();
    renderOrdersTable();
    renderReports();
    renderCustomers();
    renderAnnouncements();
    setupSettings();
  }

  // --- Dashboard Data ---
  function renderDashboard() {
    const orders = getStorage('pp_orders') || [];
    const today = new Date().toDateString();
    
    let totalRev = 0;
    let todayRev = 0;
    let itemsSold = 0;
    
    orders.forEach(o => {
      totalRev += o.total;
      if (new Date(o.timestamp).toDateString() === today) {
        todayRev += o.total;
      }
      itemsSold += o.items.reduce((acc, item) => acc + item.quantity, 0);
    });
    
    const activeItems = MENU_ITEMS.reduce((acc, cat) => acc + cat.items.length, 0); // Simplified
    
    document.getElementById('statTotalOrders').textContent = orders.length;
    document.getElementById('statRevenue').textContent = formatCurrency(todayRev);
    document.getElementById('statItemsSold').textContent = itemsSold;
    document.getElementById('statActiveItems').textContent = activeItems;
    
    const recentOrders = [...orders].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    const tbody = document.getElementById('recentOrdersTable');
    tbody.innerHTML = recentOrders.map(o => `
      <tr>
        <td>#${o.orderId.split('-')[1] || o.orderId}</td>
        <td>${o.customerName}</td>
        <td>${o.items.length} items</td>
        <td>${formatCurrency(o.total)}</td>
        <td><span class="status-badge status-${o.status}">${o.status}</span></td>
        <td>${new Date(o.timestamp).toLocaleTimeString()}</td>
      </tr>
    `).join('');
  }

  // Quick actions
  document.getElementById('btnMarkAllReady')?.addEventListener('click', () => {
    if(!confirm("Mark all preparing orders as ready?")) return;
    let orders = getStorage('pp_orders') || [];
    let updated = 0;
    orders = orders.map(o => {
      if(o.status === 'preparing') { o.status = 'ready'; updated++; }
      return o;
    });
    if(updated > 0) {
      setStorage('pp_orders', orders);
      renderDashboard();
      renderOrdersTable();
    }
  });

  // --- Menu Management ---
  function renderMenuTable() {
    const tbody = document.getElementById('menuAdminTable');
    const overrides = getStorage('pp_menu_overrides') || {};
    
    let html = '';
    MENU_ITEMS.forEach(category => {
      category.items.forEach(item => {
        const isSoldOut = overrides[item.id]?.soldOut || false;
        html += `
          <tr>
            <td style="font-size: 1.5rem;">${item.emoji}</td>
            <td><strong>${item.name}</strong><br><small class="text-secondary">${item.description}</small></td>
            <td>${category.label}</td>
            <td>${formatCurrency(Object.values(item.prices)[0])}</td>
            <td>
              <label class="toggle-switch">
                <input type="checkbox" onchange="window.toggleSoldOut('${item.id}', this.checked)" ${isSoldOut ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </td>
            <td>
              <button class="btn btn-sm btn-outline" onclick="alert('Edit modal placeholder')">Edit</button>
            </td>
          </tr>
        `;
      });
    });
    tbody.innerHTML = html;
  }
  
  window.toggleSoldOut = function(itemId, checked) {
    let overrides = getStorage('pp_menu_overrides') || {};
    if (!overrides[itemId]) overrides[itemId] = {};
    overrides[itemId].soldOut = checked;
    setStorage('pp_menu_overrides', overrides);
  }

  // --- Orders Section ---
  let currentOrderFilter = 'all';
  
  const filterTabs = document.querySelectorAll('#ordersFilterTabs .filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentOrderFilter = tab.dataset.filter;
      renderOrdersTable();
    });
  });

  function renderOrdersTable() {
    const tbody = document.getElementById('fullOrdersTable');
    let orders = getStorage('pp_orders') || [];
    
    if (currentOrderFilter !== 'all') {
      orders = orders.filter(o => o.status === currentOrderFilter);
    }
    
    orders.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><input type="checkbox" class="order-select-cb" value="${o.orderId}"></td>
        <td><strong>#${o.orderId.split('-')[1] || o.orderId}</strong></td>
        <td>${o.customerName}<br><small class="text-secondary">${o.customerPhone}</small></td>
        <td>${formatCurrency(o.total)}</td>
        <td>${o.pickupTime}</td>
        <td>
          <select class="select btn-sm" style="padding: 4px; border-radius: 4px;" onchange="window.changeOrderStatus('${o.orderId}', this.value)">
            <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
            <option value="confirmed" ${o.status==='confirmed'?'selected':''}>Confirmed</option>
            <option value="preparing" ${o.status==='preparing'?'selected':''}>Preparing</option>
            <option value="ready" ${o.status==='ready'?'selected':''}>Ready</option>
            <option value="picked-up" ${o.status==='picked-up'?'selected':''}>Picked Up</option>
          </select>
        </td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="window.printReceipt('${o.orderId}')">Print</button>
        </td>
      </tr>
    `).join('');
  }
  
  window.changeOrderStatus = function(orderId, newStatus) {
    let orders = getStorage('pp_orders') || [];
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
      orders[idx].status = newStatus;
      setStorage('pp_orders', orders);
      renderDashboard(); // Update stats if needed
    }
  }

  // Bulk actions
  document.getElementById('selectAllOrders')?.addEventListener('change', (e) => {
    document.querySelectorAll('.order-select-cb').forEach(cb => cb.checked = e.target.checked);
  });
  
  document.getElementById('btnApplyBulk')?.addEventListener('click', () => {
    const action = document.getElementById('bulkActionSelect').value;
    if (!action) return;
    
    const selected = Array.from(document.querySelectorAll('.order-select-cb:checked')).map(cb => cb.value);
    if (selected.length === 0) return;
    
    let orders = getStorage('pp_orders') || [];
    orders = orders.map(o => {
      if(selected.includes(o.orderId)) {
        o.status = action;
      }
      return o;
    });
    setStorage('pp_orders', orders);
    renderOrdersTable();
    renderDashboard();
  });

  // Print Receipt
  window.printReceipt = function(orderId) {
    const orders = getStorage('pp_orders') || [];
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;
    
    const receiptDiv = document.getElementById('printReceipt');
    let itemsHtml = order.items.map(i => `
      <div class="receipt-item">
        <span>${i.quantity}x ${i.name} (${i.size})</span>
        <span>${formatCurrency(i.unitPrice * i.quantity)}</span>
      </div>
    `).join('');
    
    receiptDiv.innerHTML = `
      <div class="receipt-header">
        <h2>Picnic Paradise</h2>
        <p>Order #${order.orderId}</p>
        <p>${new Date(order.timestamp).toLocaleString()}</p>
        <p>Customer: ${order.customerName}</p>
        <p>Pickup: ${order.pickupTime}</p>
      </div>
      <div class="receipt-items">
        ${itemsHtml}
      </div>
      <div class="receipt-total">
        <p>Subtotal: ${formatCurrency(order.subtotal)}</p>
        <p>Tax: ${formatCurrency(order.tax)}</p>
        <p>Total: ${formatCurrency(order.total)}</p>
      </div>
    `;
    
    receiptDiv.style.display = 'block';
    window.print();
    receiptDiv.style.display = 'none';
  }

  // --- Reports Section ---
  document.getElementById('reportDateRange')?.addEventListener('change', renderReports);

  function renderReports() {
    const range = document.getElementById('reportDateRange')?.value || 'all';
    const orders = getStorage('pp_orders') || [];
    
    const now = new Date();
    let filteredOrders = orders;
    
    if (range === 'today') {
      filteredOrders = orders.filter(o => new Date(o.timestamp).toDateString() === now.toDateString());
    } else if (range === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(o => new Date(o.timestamp) >= weekAgo);
    }
    
    let rev = 0;
    let itemCounts = {};
    let catRev = {};
    
    filteredOrders.forEach(o => {
      rev += o.total;
      o.items.forEach(i => {
        itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
        catRev[i.category] = (catRev[i.category] || 0) + (i.unitPrice * i.quantity);
      });
    });
    
    document.getElementById('reportRev').textContent = formatCurrency(rev);
    document.getElementById('reportCount').textContent = filteredOrders.length;
    document.getElementById('reportAOV').textContent = filteredOrders.length ? formatCurrency(rev / filteredOrders.length) : '$0.00';
    
    let topItem = '-';
    let max = 0;
    for (const [name, count] of Object.entries(itemCounts)) {
      if (count > max) { max = count; topItem = name; }
    }
    document.getElementById('reportTopItem').textContent = topItem;
    
    // Chart
    const chart = document.getElementById('revenueChart');
    let maxCatRev = Math.max(...Object.values(catRev), 1);
    
    chart.innerHTML = Object.entries(catRev).sort((a,b) => b[1]-a[1]).map(([cat, val]) => {
      const pct = (val / maxCatRev) * 100;
      return `
        <div class="chart-row">
          <div class="chart-label">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
          <div class="chart-bar-wrapper">
            <div class="chart-bar" style="width: ${pct}%">${formatCurrency(val)}</div>
          </div>
        </div>
      `;
    }).join('');
    
    // List
    const list = document.getElementById('itemsSoldList');
    list.innerHTML = Object.entries(itemCounts).sort((a,b) => b[1]-a[1]).map(([name, count]) => `
      <li style="padding: 12px; border-bottom: 1px solid var(--pp-border); display: flex; justify-content: space-between;">
        <span>${name}</span>
        <strong>${count} sold</strong>
      </li>
    `).join('');
  }

  // --- Customers Section ---
  function renderCustomers() {
    const orders = getStorage('pp_orders') || [];
    let customersMap = {};
    
    orders.forEach(o => {
      const email = o.customerEmail;
      if (!email) return;
      if (!customersMap[email]) {
        customersMap[email] = {
          name: o.customerName,
          email: email,
          phone: o.customerPhone,
          ordersCount: 0,
          totalSpent: 0
        };
      }
      customersMap[email].ordersCount++;
      customersMap[email].totalSpent += o.total;
    });
    
    const tbody = document.getElementById('customersTable');
    tbody.innerHTML = Object.values(customersMap).sort((a,b) => b.totalSpent - a.totalSpent).map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.email}</td>
        <td>${c.phone}</td>
        <td>${c.ordersCount}</td>
        <td>${formatCurrency(c.totalSpent)}</td>
      </tr>
    `).join('');
  }

  // --- Announcements ---
  function renderAnnouncements() {
    const announcements = getStorage('pp_announcements') || [];
    const display = document.getElementById('currentAnnouncementDisplay');
    
    if (announcements.length > 0) {
      display.textContent = announcements[announcements.length - 1];
    } else {
      display.textContent = "No active announcement.";
    }
  }
  
  document.getElementById('announcementForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('announcementText').value;
    let announcements = getStorage('pp_announcements') || [];
    announcements.push(text);
    setStorage('pp_announcements', announcements);
    document.getElementById('announcementText').value = '';
    renderAnnouncements();
    alert("Announcement published!");
  });
  
  document.getElementById('btnClearAnnouncement')?.addEventListener('click', () => {
    setStorage('pp_announcements', []);
    renderAnnouncements();
  });

  // --- Settings ---
  function setupSettings() {
    document.getElementById('btnExportCSV')?.addEventListener('click', () => {
      const orders = getStorage('pp_orders') || [];
      if (orders.length === 0) return alert("No orders to export.");
      
      const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Total', 'Status'];
      const rows = orders.map(o => [
        o.orderId, 
        new Date(o.timestamp).toLocaleString(), 
        `"${o.customerName}"`, 
        o.customerEmail, 
        o.total.toFixed(2), 
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
    
    document.getElementById('adminPasswordForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPass = document.getElementById('newAdminPass').value;
      localStorage.setItem('pp_admin_pass', newPass);
      document.getElementById('newAdminPass').value = '';
      const msg = document.getElementById('pwdMsg');
      msg.style.display = 'block';
      setTimeout(() => msg.style.display = 'none', 3000);
    });
    
    document.getElementById('btnClearData')?.addEventListener('click', () => {
      if(confirm("WARNING: This will permanently delete ALL orders, users, and settings. Are you absolutely sure?")) {
        if(confirm("Second confirmation: Type OK to delete all data (or Cancel)")) {
          const keys = ['pp_orders', 'pp_user', 'pp_users', 'pp_cart', 'pp_favorites', 'pp_menu_overrides', 'pp_announcements'];
          keys.forEach(k => localStorage.removeItem(k));
          alert("All data cleared. Reloading...");
          window.location.reload();
        }
      }
    });
    
    // Setup for Quick Export on dashboard
    document.getElementById('btnExportOrdersQuick')?.addEventListener('click', () => {
      document.getElementById('btnExportCSV').click();
    });
  }

});
