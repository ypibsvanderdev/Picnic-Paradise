/**
 * Picnic Paradise Core Application Logic
 * Runs on every page.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initCartBadge();
  initBackToTop();
  initScrollAnimations();
  initAnnouncementBanner();
  initNewsletterForms();
  
  // Page specific initialization
  const isHomepage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
  if (isHomepage) {
    initHomepage();
  }
});

// --- Theme Toggle ---
function initTheme() {
  document.documentElement.setAttribute('data-theme', 'light');
}
function updateThemeIcon() {}

// --- Navbar ---
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  
  // Sticky with shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
      navbar.style.boxShadow = 'var(--pp-shadow)';
    } else {
      navbar?.classList.remove('scrolled');
      navbar.style.boxShadow = 'none';
    }
  });

  // Set active link
  const currentFileName = window.location.pathname.split('/').pop() || 'index.html';
  const pageMap = {
    'index.html': 'home',
    'menu.html': 'menu',
    'cart.html': 'cart',
    'account.html': 'account'
  };
  const currentPage = pageMap[currentFileName];
  if (currentPage) {
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.page === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Mobile menu
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Render User Profile Badge / Dropdown in Navbar
  renderNavUserProfile();
}

function renderNavUserProfile() {
  const isAdminLoggedIn = sessionStorage.getItem('pp_admin_logged_in') === 'true';
  const adminUserEmail = sessionStorage.getItem('pp_admin_user') || 'admin';
  let customerUser = null;
  try {
    customerUser = JSON.parse(localStorage.getItem('pp_user'));
  } catch (e) {}

  const isLoggedIn = isAdminLoggedIn || !!customerUser;

  // Find account link to replace or modify
  const accountLink = document.querySelector('a[data-page="account"]') || document.querySelector('a[href="account.html"]');
  if (!accountLink) return;

  const dropdownDiv = document.createElement('div');
  dropdownDiv.className = 'nav-user-dropdown';
  dropdownDiv.style.cssText = 'position: relative; display: inline-block; margin-left: 8px; vertical-align: middle;';

  if (isLoggedIn) {
    // LOGGED IN STATE
    const email = isAdminLoggedIn ? adminUserEmail : (customerUser ? customerUser.email : '');
    let name = customerUser ? (customerUser.name || customerUser.email.split('@')[0]) : (isAdminLoggedIn ? (adminUserEmail.split('@')[0] || 'Admin') : 'User');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    const initial = name.charAt(0).toUpperCase();

    const adminEmails = ['admin', 'yahiamoon13@gmail.com', 'meqdad@gmail.com'];
    const isUserAdmin = isAdminLoggedIn || (email && adminEmails.includes(email.toLowerCase().trim()));

    dropdownDiv.innerHTML = `
      <button type="button" id="navUserBtn" style="display:flex; align-items:center; gap:8px; background:linear-gradient(135deg, rgba(78,205,196,0.15), rgba(255,230,109,0.2)); border:1.5px solid var(--pp-primary); padding:6px 14px; border-radius:20px; cursor:pointer; font-weight:600; font-family:'Outfit',sans-serif; color:var(--pp-text); transition:all 0.2s;">
        <span style="width:24px; height:24px; border-radius:50%; background:var(--pp-primary); color:white; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">${initial}</span>
        <span>${name}</span>
        <span style="font-size:0.65rem; opacity:0.7;">▼</span>
      </button>
      
      <div id="navUserMenu" style="display:none; position:absolute; right:0; top:calc(100% + 8px); background:var(--pp-surface); border-radius:12px; box-shadow:var(--pp-shadow-lg); min-width:210px; padding:8px 0; z-index:99999; border:1px solid var(--pp-border); text-align:left;">
        <div style="padding:10px 16px; border-bottom:1px solid var(--pp-border); font-size:0.8rem; color:var(--pp-text-secondary);">
          Signed in as<br><strong style="color:var(--pp-text); font-size:0.85rem; word-break:break-all;">${email || name}</strong>
        </div>
        
        ${isUserAdmin ? `
          <a href="admin.html" style="display:flex; align-items:center; gap:8px; padding:10px 16px; color:var(--pp-primary-dark); text-decoration:none; font-weight:700; font-size:0.9rem; transition:background 0.2s;" onmouseover="this.style.background='var(--pp-bg-alt)'" onmouseout="this.style.background='transparent'">
            ⚙️ Admin Dashboard
          </a>
        ` : ''}
        
        <a href="account.html" style="display:flex; align-items:center; gap:8px; padding:10px 16px; color:var(--pp-text); text-decoration:none; font-size:0.9rem; transition:background 0.2s;" onmouseover="this.style.background='var(--pp-bg-alt)'" onmouseout="this.style.background='transparent'">
          👤 My Profile
        </a>
        
        <div style="border-top:1px solid var(--pp-border); margin:4px 0;"></div>
        
        <button id="globalSignOutBtn" type="button" style="width:100%; text-align:left; display:flex; align-items:center; gap:8px; padding:10px 16px; color:var(--pp-accent); background:transparent; border:none; font-weight:600; font-size:0.9rem; cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='rgba(255,107,107,0.1)'" onmouseout="this.style.background='transparent'">
          🚪 Sign Out
        </button>
      </div>
    `;
  } else {
    // NOT LOGGED IN (GUEST) STATE
    dropdownDiv.innerHTML = `
      <button type="button" id="navUserBtn" style="display:flex; align-items:center; gap:8px; background:var(--pp-bg-alt); border:1px solid var(--pp-border); padding:6px 14px; border-radius:20px; cursor:pointer; font-weight:600; font-family:'Outfit',sans-serif; color:var(--pp-text); transition:all 0.2s;">
        <span style="width:24px; height:24px; border-radius:50%; background:#888; color:white; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">👤</span>
        <span>Guest</span>
        <span style="font-size:0.65rem; opacity:0.7;">▼</span>
      </button>
      
      <div id="navUserMenu" style="display:none; position:absolute; right:0; top:calc(100% + 8px); background:var(--pp-surface); border-radius:12px; box-shadow:var(--pp-shadow-lg); min-width:200px; padding:8px 0; z-index:99999; border:1px solid var(--pp-border); text-align:left;">
        <div style="padding:10px 16px; border-bottom:1px solid var(--pp-border); font-size:0.8rem; color:var(--pp-text-secondary);">
          Welcome to The Sugar Printer!
        </div>
        
        <a href="account.html" style="display:flex; align-items:center; gap:8px; padding:10px 16px; color:var(--pp-primary-dark); text-decoration:none; font-weight:700; font-size:0.9rem; transition:background 0.2s;" onmouseover="this.style.background='var(--pp-bg-alt)'" onmouseout="this.style.background='transparent'">
          🔑 Sign In / Register
        </a>

        <a href="admin.html" style="display:flex; align-items:center; gap:8px; padding:10px 16px; color:var(--pp-text); text-decoration:none; font-size:0.9rem; transition:background 0.2s;" onmouseover="this.style.background='var(--pp-bg-alt)'" onmouseout="this.style.background='transparent'">
          ⚙️ Admin Login
        </a>
      </div>
    `;
  }

  accountLink.parentNode.replaceChild(dropdownDiv, accountLink);

  const userBtn = document.getElementById('navUserBtn');
  const userMenu = document.getElementById('navUserMenu');
  const signOutBtn = document.getElementById('globalSignOutBtn');

  if (userBtn && userMenu) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userMenu.style.display === 'block';
      userMenu.style.display = isOpen ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!dropdownDiv.contains(e.target)) {
        userMenu.style.display = 'none';
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('pp_admin_logged_in');
      sessionStorage.removeItem('pp_admin_user');
      localStorage.removeItem('pp_user');
      if (typeof showToast === 'function') showToast('Signed out successfully');
      setTimeout(() => window.location.href = 'index.html', 300);
    });
  }
}

// --- Cart Badge ---
function initCartBadge() {
  updateCartBadge();
  window.addEventListener('cartUpdated', updateCartBadge);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('pp_cart')) || [];
  } catch (e) {
    cart = [];
  }
  
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'inline-block';
    
    // Bounce animation
    badge.style.transform = 'scale(1.2)';
    setTimeout(() => badge.style.transform = 'scale(1)', 200);
  } else {
    badge.style.display = 'none';
  }
}

// Custom Event for Cart Updates
function dispatchCartUpdate() {
  const event = new CustomEvent('cartUpdated');
  window.dispatchEvent(event);
}

// Mock addToCart for homepage buttons
window.addToCart = function(itemInput) {
  try {
    const item = typeof itemInput === 'string' ? JSON.parse(decodeURIComponent(itemInput)) : itemInput;
    let cart = JSON.parse(localStorage.getItem('pp_cart')) || [];
    
    const cartItem = {
      cartId: item.cartId || ('ci_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
      itemId: item.itemId || item.id,
      name: item.name,
      category: item.category || 'drinks',
      size: item.size || 'medium',
      flavor: item.flavor || null,
      addIns: item.addIns || [],
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.price || 5,
      specialInstructions: item.specialInstructions || ''
    };

    // Try to find if item with same ID and options already exists
    const existingIndex = cart.findIndex(ci => 
      ci.itemId === cartItem.itemId && 
      ci.size === cartItem.size && 
      ci.flavor === cartItem.flavor &&
      JSON.stringify(ci.addIns || []) === JSON.stringify(cartItem.addIns || []) &&
      (ci.specialInstructions || '') === (cartItem.specialInstructions || '')
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += (cartItem.quantity || 1);
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('pp_cart', JSON.stringify(cart));
    dispatchCartUpdate();
    showToast(`${cartItem.name} added to cart!`);
  } catch (e) {
    console.error('Add to cart failed', e);
  }
};

// Toast notification function
function showToast(message) {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: var(--pp-primary);
    color: white;
    padding: 12px 24px;
    border-radius: var(--pp-radius-sm);
    box-shadow: var(--pp-shadow);
    font-weight: 500;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s;
  `;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Back to Top ---
function initBackToTop() {
  const backBtn = document.getElementById('backToTop');
  if (!backBtn) return;
  
  backBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: var(--pp-primary);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: var(--pp-shadow);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: 1000;
  `;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backBtn.style.opacity = '1';
      backBtn.style.pointerEvents = 'auto';
    } else {
      backBtn.style.opacity = '0';
      backBtn.style.pointerEvents = 'none';
    }
  });
  
  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- Scroll Animations ---
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  
  elements.forEach(el => observer.observe(el));
}

// --- Announcement Banner ---
function initAnnouncementBanner() {
  const banner = document.getElementById('announcementBanner');
  const textEl = document.getElementById('announcementText');
  if (!banner || !textEl) return;
  
  let announcements = [];
  try {
    announcements = JSON.parse(localStorage.getItem('pp_announcements')) || [];
  } catch(e) {}
  
  if (announcements.length > 0) {
    textEl.textContent = announcements[announcements.length - 1];
    banner.style.display = 'block';
  }
}

// --- Newsletter Forms ---
function initNewsletterForms() {
  const forms = [
    document.getElementById('footerNewsletter'),
    document.getElementById('mainNewsletter')
  ];
  
  forms.forEach(form => {
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          showToast('Thanks for subscribing!');
          form.reset();
        }
      });
    }
  });

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Message sent successfully!');
      contactForm.reset();
    });
  }
}

// --- Homepage Specific Rendering ---
function initHomepage() {
  // Mock data if data.js doesn't exist yet
  const MENU_ITEMS = window.MENU_ITEMS || [
    { itemId: 'blue-slushie', name: 'Blue Raspberry Slushie', category: 'slushies', price: 5, emoji: '🍧', gradient: '#667eea, #764ba2', featured: true, rating: '4.9' },
    { itemId: 'mango-lemonade', name: 'Mango Lemonade', category: 'lemonade', price: 5, emoji: '🍋', gradient: '#f6d365, #fda085', featured: true, rating: '4.8' },
    { itemId: 'iced-coffee', name: 'Iced Vanilla Latte', category: 'coffee', price: 4, emoji: '☕', gradient: '#a18cd1, #fbc2eb', featured: true, rating: '4.7' },
    { itemId: 'choc-brownie', name: 'Fudge Brownie', category: 'brownies', price: 3, emoji: '🍫', gradient: '#434343, #000000', featured: true, rating: '5.0' },
    { itemId: 'cake-pop-cookies-and-cream', name: 'Cookies and Cream Cake Pop', category: 'cake-pops', price: 3, emoji: '🍰', gradient: '#f093fb, #f5576c', featured: true, rating: '4.9' },
    { itemId: 'baklawa-pistachio', name: 'Pistachio Baklawa', category: 'baklawa', price: 1, emoji: '🍯', gradient: '#f7971e, #ffd200', featured: true, rating: '4.9' },
    { itemId: 'kanafa-traditional', name: 'Warm Kanafa', category: 'kanafa', price: 2, emoji: '🥮', gradient: '#ff9966, #ff5e62', featured: true, rating: '5.0' },
    { itemId: 'peach-tea', name: 'Peach Iced Tea', category: 'tea', price: 4, emoji: '🍵', gradient: '#89f7fe, #66a6ff', featured: true, rating: '4.8' }
  ];

  const BEST_SELLERS = window.BEST_SELLERS || MENU_ITEMS.slice(0, 4);

  const FAQ_ITEMS = window.FAQ_ITEMS || [
    { q: 'Where do I pick up my order?', a: 'Pickups are located at the Central Park Pavilion. Just show your order confirmation email at the counter.' },
    { q: 'What if it rains?', a: 'The pavilion is fully covered! We will be there rain or shine.' },
    { q: 'Can I pay with cash?', a: 'For this event, we are only accepting online orders via credit card, Apple Pay, or Google Pay.' }
  ];

  const TESTIMONIALS = window.TESTIMONIALS || [
    { text: "Best slushies I've ever had! Can't wait for this year's picnic.", author: "Sarah M.", rating: "⭐⭐⭐⭐⭐", avatar: "👩" },
    { text: "The cake pops were a huge hit with my kids. Highly recommend!", author: "David T.", rating: "⭐⭐⭐⭐⭐", avatar: "👨" },
    { text: "Refreshing drinks and a great atmosphere.", author: "Jessica L.", rating: "⭐⭐⭐⭐", avatar: "👩‍🦰" }
  ];

  // Render Featured Items
  const featuredContainer = document.getElementById('featuredContainer');
  if (featuredContainer) {
    featuredContainer.innerHTML = '';
    MENU_ITEMS.filter(item => item.featured !== false).forEach(item => {
      featuredContainer.appendChild(createProductCard(item));
    });
  }

  // Render Best Sellers
  const bestSellersContainer = document.getElementById('bestSellersContainer');
  if (bestSellersContainer) {
    bestSellersContainer.innerHTML = '';
    BEST_SELLERS.forEach(item => {
      bestSellersContainer.appendChild(createProductCard(item));
    });
  }

  // Render FAQ
  const faqContainer = document.getElementById('faqContainer');
  if (faqContainer) {
    faqContainer.innerHTML = '';
    FAQ_ITEMS.forEach(faq => {
      const item = document.createElement('div');
      item.className = 'faq-item';
      item.innerHTML = `
        <div class="faq-question">
          <span>${faq.q}</span>
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer">
          <p>${faq.a}</p>
        </div>
      `;
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('active');
          i.querySelector('.faq-icon').textContent = '+';
        });
        if (!isActive) {
          item.classList.add('active');
          item.querySelector('.faq-icon').textContent = '-';
        }
      });
      faqContainer.appendChild(item);
    });
  }

  // Render Testimonials
  const testContent = document.getElementById('testimonialContent');
  const testDots = document.getElementById('testimonialDots');
  const btnPrev = document.getElementById('prevTestimonial');
  const btnNext = document.getElementById('nextTestimonial');
  
  if (testContent && TESTIMONIALS.length > 0) {
    let currentIndex = 0;
    
    const renderTestimonial = (index) => {
      const t = TESTIMONIALS[index];
      testContent.innerHTML = `
        <div class="testimonial-avatar">${t.avatar}</div>
        <div class="testimonial-text">"${t.text}"</div>
        <div class="testimonial-author">${t.author}</div>
        <div style="color:var(--pp-secondary-dark); margin-top:5px;">${t.rating}</div>
      `;
      
      // Update dots
      if (testDots) {
        testDots.innerHTML = '';
        TESTIMONIALS.forEach((_, i) => {
          const dot = document.createElement('div');
          dot.className = `dot ${i === index ? 'active' : ''}`;
          dot.addEventListener('click', () => {
            currentIndex = i;
            renderTestimonial(currentIndex);
          });
          testDots.appendChild(dot);
        });
      }
    };
    
    renderTestimonial(0);
    
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
        renderTestimonial(currentIndex);
      });
    }
    
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % TESTIMONIALS.length;
        renderTestimonial(currentIndex);
      });
    }
    
    // Auto-rotate
    setInterval(() => {
      currentIndex = (currentIndex + 1) % TESTIMONIALS.length;
      renderTestimonial(currentIndex);
    }, 5000);
  }
}

// Product card generator
// Product card generator for The Sugar Printer
function createProductCard(item) {
  const card = document.createElement('div');
  card.className = 'card card-product';
  card.style.cursor = 'pointer';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.position = 'relative';
  card.style.overflow = 'hidden';

  const stock = (item.stock !== undefined) ? parseInt(item.stock, 10) : 1;
  const isSoldOut = (stock <= 0) || item.soldOut;
  const price = item.prices ? (item.prices.single || item.prices.medium || item.prices.small || item.price || 0) : (item.price || 0);

  let stockTag = '';
  if (isSoldOut) {
    stockTag = '<div class="stock-pill out">❌ Out of Stock</div>';
  } else if (stock === 1) {
    stockTag = '<div class="stock-pill low">⚡ Only 1 Left!</div>';
  } else if (stock <= 3) {
    stockTag = `<div class="stock-pill low">🔥 Only ${stock} Left</div>`;
  } else {
    stockTag = `<div class="stock-pill in">✅ In Stock</div>`;
  }

  let imageHtml = '';
  if (item.image) {
    imageHtml = `
      <div class="product-card-image" style="height: 200px; width: 100%; overflow: hidden; background: #1e1e2e; position: relative;">
        <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:4rem; background:${item.gradient || '#8b5cf6'}">${item.emoji || '✨'}</div>
        ${stockTag}
      </div>
    `;
  } else {
    imageHtml = `
      <div class="product-card-image" style="height: 200px; width: 100%; display: flex; align-items: center; justify-content: center; font-size: 4.5rem; background: ${item.gradient || 'linear-gradient(135deg, #8b5cf6, #3b82f6)'}; position: relative;">
        <span>${item.emoji || '✨'}</span>
        ${stockTag}
      </div>
    `;
  }

  card.innerHTML = `
    ${imageHtml}
    <div class="product-card-body" style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="font-size:0.8rem; text-transform:uppercase; color:var(--pp-primary); font-weight:700; margin-bottom:4px;">${item.categoryLabel || item.category || 'Fidgets'}</div>
        <h3 class="card-title" style="font-size:1.15rem; margin-bottom:6px; font-weight:700;">${item.name}</h3>
        <p style="font-size:0.85rem; color:var(--pp-text-secondary); margin-bottom:10px; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${item.description || ''}</p>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div class="card-price" style="font-size:1.25rem; font-weight:800; color:var(--pp-primary);">${price.toFixed(2)}</div>
          <div class="card-rating" style="font-size:0.85rem; font-weight:600; color:#f59e0b;">⭐ ${item.rating || '5.0'}</div>
        </div>
        <button class="btn ${isSoldOut ? 'btn-outline' : 'btn-primary'} btn-full" style="padding:10px; font-weight:700; font-size:0.9rem;">
          ${isSoldOut ? 'Sold Out' : 'View & Order'}
        </button>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    window.location.href = `menu.html?item=${encodeURIComponent(item.id)}`;
  });

  return card;
}
