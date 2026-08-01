// Basic hash function for demo purposes (NOT FOR PRODUCTION)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return btoa(hash.toString());
}

document.addEventListener('DOMContentLoaded', () => {
  const authView = document.getElementById('authView');
  const accountDashboard = document.getElementById('accountDashboard');
  
  // Auth Tabs
  const authTabs = document.querySelectorAll('.auth-tab');
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  // Account Tabs
  const accTabs = document.querySelectorAll('.account-tab');
  accTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.account-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  // Forms
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const profileForm = document.getElementById('profileForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const googleCustomerBtn = document.getElementById('googleCustomerBtn');

  if (googleCustomerBtn) {
    googleCustomerBtn.addEventListener('click', async () => {
      try {
        if (typeof window.signInWithGoogle === 'function') {
          const gUser = await window.signInWithGoogle();
          if (gUser && gUser.email) {
            const adminEmails = ['admin', 'yahiamoon13@gmail.com', 'meqdad@gmail.com'];
            const isAdmin = adminEmails.includes(gUser.email.toLowerCase().trim());
            
            const userObj = {
              id: gUser.uid || ('u_' + Date.now()),
              name: gUser.name || gUser.email.split('@')[0],
              email: gUser.email,
              phone: '',
              provider: 'google',
              photoURL: gUser.photoURL || null,
              isAdmin: isAdmin,
              createdAt: new Date().toISOString()
            };
            
            setStorage('pp_user', userObj);
            if (isAdmin) {
              sessionStorage.setItem('pp_admin_logged_in', 'true');
              sessionStorage.setItem('pp_admin_user', gUser.email);
            }
            window.location.reload();
          }
        }
      } catch (err) {
        console.error('Customer Google Auth Error:', err);
      }
    });
  }

  const updateViewState = () => {
    const user = getStorage('pp_user');
    if (user) {
      if (authView) authView.style.display = 'none';
      if (accountDashboard) {
        accountDashboard.style.display = 'block';
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.name.split(' ')[0]}!`;
        document.getElementById('memberSince').textContent = `Member since ${new Date(user.createdAt || Date.now()).toLocaleDateString()}`;
        
        // Populate profile form
        document.getElementById('profName').value = user.name;
        document.getElementById('profEmail').value = user.email;
        document.getElementById('profPhone').value = user.phone;
        
        renderOrderHistory(user.email);
        renderFavorites();
      }
    } else {
      if (authView) authView.style.display = 'block';
      if (accountDashboard) accountDashboard.style.display = 'none';
    }
  };

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const err = document.getElementById('regError');
      err.style.display = 'none';
      
      const pwd = document.getElementById('regPassword').value;
      const confirmPwd = document.getElementById('regConfirmPassword').value;
      
      if (pwd !== confirmPwd) {
        err.textContent = "Passwords do not match.";
        err.style.display = 'block';
        return;
      }
      
      const email = document.getElementById('regEmail').value;
      let users = getStorage('pp_users') || [];
      if (users.find(u => u.email === email)) {
        err.textContent = "Email already in use.";
        err.style.display = 'block';
        return;
      }
      
      const newUser = {
        id: 'u_' + Date.now(),
        name: document.getElementById('regName').value,
        email: email,
        phone: document.getElementById('regPhone').value,
        passwordHash: simpleHash(pwd),
        createdAt: Date.now()
      };
      
      users.push(newUser);
      setStorage('pp_users', users);
      setStorage('pp_user', newUser);
      
      // Dispatch event for other scripts (e.g. navbar updating)
      window.dispatchEvent(new Event('userChanged'));
      updateViewState();
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const err = document.getElementById('loginError');
      err.style.display = 'none';
      
      const email = document.getElementById('loginEmail').value;
      const pwd = document.getElementById('loginPassword').value;
      
      const users = getStorage('pp_users') || [];
      const user = users.find(u => u.email === email && u.passwordHash === simpleHash(pwd));
      
      if (user) {
        setStorage('pp_user', user);
        window.dispatchEvent(new Event('userChanged'));
        updateViewState();
      } else {
        err.textContent = "Invalid email or password.";
        err.style.display = 'block';
      }
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('profMsg');
      
      let user = getStorage('pp_user');
      if (!user) return;
      
      user.name = document.getElementById('profName').value;
      user.phone = document.getElementById('profPhone').value;
      
      // Update in users list too
      let users = getStorage('pp_users') || [];
      const index = users.findIndex(u => u.email === user.email);
      if (index !== -1) {
        users[index].name = user.name;
        users[index].phone = user.phone;
        setStorage('pp_users', users);
      }
      
      setStorage('pp_user', user);
      
      msg.textContent = "Profile updated successfully!";
      msg.style.color = "var(--pp-green)";
      msg.style.display = "block";
      setTimeout(() => msg.style.display = 'none', 3000);
      
      document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.name.split(' ')[0]}!`;
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('pp_user');
      window.dispatchEvent(new Event('userChanged'));
      updateViewState();
    });
  }

  function renderOrderHistory(email) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    const allOrders = getStorage('pp_orders') || [];
    const userOrders = allOrders.filter(o => o.customerEmail === email).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (userOrders.length === 0) {
      ordersList.innerHTML = `<p style="text-align: center; color: var(--pp-text-secondary); padding: 2rem;">No orders yet. time to plan your picnic!</p>`;
      return;
    }
    
    ordersList.innerHTML = userOrders.map(order => `
      <div class="card order-card">
        <div class="order-header">
          <div>
            <h3 style="margin-bottom: 4px;">Order ${order.orderId}</h3>
            <span class="text-secondary" style="font-size: 0.9rem;">${new Date(order.timestamp).toLocaleString()}</span>
          </div>
          <div>
            <span class="badge badge-${order.status === 'confirmed' ? 'warning' : order.status === 'ready' ? 'success' : 'primary'}">${order.status.toUpperCase()}</span>
          </div>
        </div>
        <p><strong>Total:</strong> ${formatCurrency(order.total)} (${order.items.length} items)</p>
        <p><strong>Pickup:</strong> ${order.pickupTime}</p>
        <details style="margin-top: 1rem;">
          <summary style="cursor: pointer; color: var(--pp-primary); font-weight: 500;">View Details</summary>
          <ul style="margin-top: 0.5rem; list-style: none; padding-left: 0;">
            ${order.items.map(i => `<li style="padding: 4px 0; border-bottom: 1px solid var(--pp-border);">${i.quantity}x ${i.name} (${i.size}) - ${formatCurrency(i.unitPrice * i.quantity)}</li>`).join('')}
          </ul>
        </details>
      </div>
    `).join('');
  }

  function renderFavorites() {
    const favGrid = document.getElementById('favoritesGrid');
    if (!favGrid) return;
    
    const favorites = getStorage('pp_favorites') || [];
    if (favorites.length === 0) {
      favGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--pp-text-secondary); padding: 2rem;">No favorite items yet.</p>`;
      favGrid.style.display = 'block';
      return;
    }
    favGrid.style.display = 'grid';
    
    // We assume MENU_ITEMS is available from data.js
    let html = '';
    MENU_ITEMS.forEach(category => {
      category.items.forEach(item => {
        if (favorites.includes(item.id)) {
          html += `
            <div class="card" style="padding: 1rem; text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">${item.emoji}</div>
              <h3 style="margin-bottom: 0.5rem;">${item.name}</h3>
              <p class="text-secondary" style="margin-bottom: 1rem; font-size: 0.9rem;">${item.description}</p>
              <button class="btn btn-outline btn-sm btn-full" onclick="window.location.href='menu.html'">View in Menu</button>
            </div>
          `;
        }
      });
    });
    favGrid.innerHTML = html;
  }

  // Initial load
  updateViewState();
});
