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
window.addToCart = function(itemStr) {
  try {
    const item = typeof itemStr === 'string' ? JSON.parse(decodeURIComponent(itemStr)) : itemStr;
    let cart = JSON.parse(localStorage.getItem('pp_cart')) || [];
    
    // Try to find if item with same ID and options already exists
    const existingIndex = cart.findIndex(ci => ci.itemId === item.itemId);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        cartId: 'ci_' + Date.now(),
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        size: item.size || 'medium',
        quantity: 1,
        unitPrice: item.price || 5,
      });
    }
    localStorage.setItem('pp_cart', JSON.stringify(cart));
    dispatchCartUpdate();
    showToast(`${item.name} added to cart!`);
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
    { itemId: 'strawberry-cake-pop', name: 'Strawberry Cake Pop', category: 'cake-pops', price: 4, emoji: '🍰', gradient: '#f093fb, #f5576c', featured: true, rating: '4.6' },
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
function createProductCard(item) {
  const card = document.createElement('div');
  card.className = 'card card-product';
  card.style.cursor = 'pointer';
  
  card.innerHTML = `
    <div class="card-emoji-bg" style="background: linear-gradient(135deg, ${item.gradient})">
      ${item.emoji}
    </div>
    <h3 class="card-title">${item.name}</h3>
    <div class="card-price">$${item.price || (item.prices ? (item.prices.medium || item.prices.single || item.prices.small) : '?')}</div>
    <div class="card-rating">⭐ ${item.rating || '4.9'}</div>
    <button class="btn btn-primary card-btn">View & Order</button>
  `;
  
  card.addEventListener('click', () => {
    window.location.href = 'menu.html';
  });
  
  return card;
}
