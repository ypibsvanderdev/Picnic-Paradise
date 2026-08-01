// js/menu.js

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('productGrid')) return;

  const state = {
    filter: 'all',
    search: '',
    sort: 'name',
    items: typeof getMenuItems === 'function' ? getMenuItems() : (typeof MENU_ITEMS !== 'undefined' ? MENU_ITEMS : [])
  };

  // Elements
  const productGrid = document.getElementById('productGrid');
  const searchInput = document.getElementById('menuSearch');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const sortSelect = document.getElementById('menuSort');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  
  // Modal Elements
  const modal = document.getElementById('productModal');
  const modalClose = modal.querySelector('.modal-close');
  const modalImage = document.getElementById('modalImage');
  const modalEmoji = document.getElementById('modalEmoji');
  const modalFavorite = document.getElementById('modalFavorite');
  const modalName = document.getElementById('modalName');
  const modalRating = document.getElementById('modalRating');
  const modalDescription = document.getElementById('modalDescription');
  const modalSizes = document.getElementById('modalSizes');
  const modalFlavors = document.getElementById('modalFlavors');
  const modalAddins = document.getElementById('modalAddins');
  const modalInstructions = document.getElementById('modalInstructions');
  const modalQty = document.getElementById('modalQty');
  const modalQtyPlus = document.getElementById('modalQtyPlus');
  const modalQtyMinus = document.getElementById('modalQtyMinus');
  const modalPrice = document.getElementById('modalPrice');
  const modalAddToCart = document.getElementById('modalAddToCart');
  const alsoBoughtGrid = document.getElementById('alsoBoughtGrid');

  let currentModalItem = null;
  let modalSelections = {
    size: null,
    flavor: null,
    addIns: [],
    quantity: 1
  };

  // Init
  filterAndSort();

  // Search Debounce
  let searchTimeout;
  if(searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.search = e.target.value.toLowerCase();
        filterAndSort();
      }, 300);
    });
  }

  // Filter Tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      filterTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      state.filter = e.target.dataset.filter;
      filterAndSort();
    });
  });

  // Sort Select
  if(sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      filterAndSort();
    });
  }

  // Clear Filters
  if(clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.search = '';
      filterTabs.forEach(t => t.classList.remove('active'));
      document.querySelector('.filter-tab[data-filter="all"]').classList.add('active');
      state.filter = 'all';
      sortSelect.value = 'name';
      state.sort = 'name';
      filterAndSort();
    });
  }

  function filterAndSort() {
    let filtered = state.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(state.search) || 
                            item.category.toLowerCase().includes(state.search);
      let matchesFilter = true;
      if (state.filter === 'cold') matchesFilter = item.subtype === 'cold';
      else if (state.filter === 'hot') matchesFilter = item.subtype === 'hot';
      else if (state.filter === 'dessert') matchesFilter = item.type === 'dessert';
      
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      if (state.sort === 'name') return a.name.localeCompare(b.name);
      if (state.sort === 'price-low') {
        const aPrice = a.prices.single || a.prices.medium || 0;
        const bPrice = b.prices.single || b.prices.medium || 0;
        return aPrice - bPrice;
      }
      if (state.sort === 'price-high') {
        const aPrice = a.prices.single || a.prices.medium || 0;
        const bPrice = b.prices.single || b.prices.medium || 0;
        return bPrice - aPrice;
      }
      if (state.sort === 'rating') return (b.rating || 5) - (a.rating || 5);
      return 0;
    });

    renderProducts(filtered);
  }

  function renderProducts(items) {
    productGrid.innerHTML = '';
    resultCount.textContent = `${items.length} items`;
    
    if (items.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = `product-card ${item.soldOut ? 'sold-out' : ''}`;
        card.dataset.id = item.id;
        
        let priceText = '';
        if (item.prices.single) priceText = `$${item.prices.single.toFixed(2)}`;
        else if (item.prices.small && item.prices.large) priceText = `$${item.prices.small.toFixed(2)} - $${item.prices.large.toFixed(2)}`;
        else if (item.prices.medium) priceText = `from $${item.prices.medium.toFixed(2)}`;
        
        let badgeHtml = '';
        if (item.badge) badgeHtml = `<span class="product-card-badge">${item.badge}</span>`;
        else if (item.soldOut) badgeHtml = `<span class="product-card-badge">Sold Out</span>`;

        const isFav = typeof isFavorite === 'function' ? isFavorite(item.id) : false;
        
        card.innerHTML = `
          <div class="product-card-image" style="background: linear-gradient(135deg, ${item.gradient || '#eee, #ccc'})">
            <button class="product-card-favorite ${isFav ? 'active' : ''}" data-id="${item.id}" aria-label="Favorite">
              ${isFav ? '♥' : '♡'}
            </button>
            ${badgeHtml}
            <span>${item.emoji}</span>
          </div>
          <div class="product-card-body">
            <h3 class="product-card-name">${item.name}</h3>
            <div class="product-card-rating">
              <span>${'⭐'.repeat(Math.floor(item.rating || 5))}</span>
              <span class="text-muted ml-1">(${item.reviews || 12})</span>
            </div>
            <div class="product-card-price">${priceText}</div>
          </div>
          <div class="product-card-actions">
            <button class="btn btn-primary btn-full order-btn" data-id="${item.id}" ${item.soldOut ? 'disabled' : ''}>Order</button>
          </div>
        `;

        card.addEventListener('click', (e) => {
          if (!e.target.closest('.order-btn') && !e.target.closest('.product-card-favorite')) {
            openProductModal(item.id);
          }
        });

        const orderBtn = card.querySelector('.order-btn');
        if (orderBtn) {
          orderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openProductModal(item.id);
          });
        }

        const favBtn = card.querySelector('.product-card-favorite');
        if (favBtn) {
          favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof toggleFavorite === 'function') toggleFavorite(item.id);
            favBtn.textContent = (favBtn.textContent === '♥') ? '♡' : '♥';
          });
        }

        productGrid.appendChild(card);
      });
    }
  }

  function openProductModal(itemId) {
    currentModalItem = state.items.find(i => i.id === itemId);
    if (!currentModalItem || currentModalItem.soldOut) return;

    modalEmoji.textContent = currentModalItem.emoji;
    modalImage.style.background = `linear-gradient(135deg, ${currentModalItem.gradient || '#eee, #ccc'})`;
    modalName.textContent = currentModalItem.name;
    modalDescription.textContent = currentModalItem.description || `Enjoy our delicious ${currentModalItem.name}!`;
    modalRating.innerHTML = `<span>${'⭐'.repeat(Math.floor(currentModalItem.rating || 5))}</span>`;
    
    const isFav = typeof isFavorite === 'function' ? isFavorite(currentModalItem.id) : false;
    modalFavorite.textContent = isFav ? '♥' : '♡';

    modalSelections = { size: null, flavor: null, addIns: [], quantity: 1 };
    modalQty.textContent = '1';
    modalInstructions.value = '';

    modalSizes.innerHTML = '';
    if (currentModalItem.prices.single) {
      document.getElementById('modalSizeSection').style.display = 'none';
      modalSelections.size = 'single';
    } else {
      document.getElementById('modalSizeSection').style.display = 'block';
      ['small', 'medium', 'large'].forEach(size => {
        if (currentModalItem.prices[size]) {
          const btn = document.createElement('div');
          btn.className = `size-btn ${size === 'medium' ? 'active' : ''}`;
          btn.textContent = size.charAt(0).toUpperCase() + size.slice(1);
          btn.dataset.size = size;
          btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            modalSelections.size = size;
            updateModalPrice();
          });
          modalSizes.appendChild(btn);
          if (size === 'medium') modalSelections.size = 'medium';
        }
      });
    }

    modalFlavors.innerHTML = '';
    if (currentModalItem.flavors && currentModalItem.flavors.length > 0) {
      document.getElementById('modalFlavorSection').style.display = 'block';
      currentModalItem.flavors.forEach((flavor, index) => {
        const div = document.createElement('div');
        div.className = `flavor-option ${index === 0 ? 'active' : ''}`;
        div.textContent = flavor;
        div.dataset.flavor = flavor;
        div.addEventListener('click', () => {
          document.querySelectorAll('.flavor-option').forEach(f => f.classList.remove('active'));
          div.classList.add('active');
          modalSelections.flavor = flavor;
        });
        modalFlavors.appendChild(div);
        if (index === 0) modalSelections.flavor = flavor;
      });
    } else {
      document.getElementById('modalFlavorSection').style.display = 'none';
    }

    modalAddins.innerHTML = '';
    if (currentModalItem.addIns && currentModalItem.addIns.length > 0) {
      document.getElementById('modalAddinSection').style.display = 'block';
      currentModalItem.addIns.forEach(addin => {
        const addinName = typeof addin === 'string' ? addin : addin.name;
        const addinPrice = typeof addin === 'object' && addin.price ? addin.price : 0;
        
        const div = document.createElement('div');
        div.className = 'addin-option';
        div.textContent = addinPrice > 0 ? `+ ${addinName} ($${addinPrice.toFixed(2)})` : `+ ${addinName}`;
        div.dataset.addin = typeof addin === 'string' ? addin : JSON.stringify(addin);
        div.addEventListener('click', () => {
          div.classList.toggle('active');
          if (div.classList.contains('active')) {
            modalSelections.addIns.push(addin);
          } else {
            modalSelections.addIns = modalSelections.addIns.filter(a => (typeof a === 'string' ? a : a.name) !== addinName);
          }
          updateModalPrice();
        });
        modalAddins.appendChild(div);
      });
    } else {
      document.getElementById('modalAddinSection').style.display = 'none';
    }

    updateModalPrice();
    populateAlsoBought(currentModalItem);
    
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 200);
  }

  function updateModalPrice() {
    if (!currentModalItem) return;
    let basePrice = currentModalItem.prices[modalSelections.size] || currentModalItem.prices.single || currentModalItem.prices.medium || currentModalItem.prices.small || 0;
    let addInPrice = modalSelections.addIns.reduce((sum, a) => sum + (typeof a === 'object' && a.price ? a.price : 0), 0);
    let total = (basePrice + addInPrice) * modalSelections.quantity;
    modalPrice.textContent = `$${total.toFixed(2)}`;
  }

  if(modalQtyPlus) {
    modalQtyPlus.addEventListener('click', () => {
      modalSelections.quantity++;
      modalQty.textContent = modalSelections.quantity;
      updateModalPrice();
    });
  }

  if(modalQtyMinus) {
    modalQtyMinus.addEventListener('click', () => {
      if (modalSelections.quantity > 1) {
        modalSelections.quantity--;
        modalQty.textContent = modalSelections.quantity;
        updateModalPrice();
      }
    });
  }

  if(modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  if(modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) closeModal();
  });

  if(modalAddToCart) {
    modalAddToCart.addEventListener('click', () => {
      const basePrice = currentModalItem.prices[modalSelections.size] || currentModalItem.prices.single || currentModalItem.prices.medium || currentModalItem.prices.small || 0;
      const addInPrice = modalSelections.addIns.reduce((s,a) => s + (typeof a === 'object' && a.price ? a.price : 0), 0);
      
      const cartItem = {
        cartId: 'ci_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        itemId: currentModalItem.id,
        name: currentModalItem.name,
        category: currentModalItem.category,
        size: modalSelections.size,
        flavor: modalSelections.flavor,
        addIns: modalSelections.addIns,
        quantity: modalSelections.quantity,
        unitPrice: basePrice + addInPrice,
        specialInstructions: modalInstructions.value
      };
      
      if (typeof addToCart === 'function') {
        addToCart(cartItem);
      } else if (window.PPUtils && window.PPUtils.addToCart) {
        window.PPUtils.addToCart(cartItem);
      } else {
        const cart = JSON.parse(localStorage.getItem('pp_cart')) || [];
        cart.push(cartItem);
        localStorage.setItem('pp_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
      }
      
      closeModal();
    });
  }

  function quickAdd(item) {
    const size = item.prices.single ? 'single' : (item.prices.medium ? 'medium' : 'small');
    const flavor = (item.flavors && item.flavors.length > 0) ? item.flavors[0] : null;
    
    const cartItem = {
      cartId: 'ci_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      itemId: item.id,
      name: item.name,
      category: item.category,
      size: size,
      flavor: flavor,
      addIns: [],
      quantity: 1,
      unitPrice: item.prices[size],
      specialInstructions: ''
    };
    
    if (typeof addToCart === 'function') {
      addToCart(cartItem);
      if (typeof showToast === 'function') showToast('Quick added to cart!');
    } else {
      const cart = JSON.parse(localStorage.getItem('pp_cart')) || [];
      cart.push(cartItem);
      localStorage.setItem('pp_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }

  if(modalFavorite) {
    modalFavorite.addEventListener('click', () => {
      if (typeof toggleFavorite === 'function') toggleFavorite(currentModalItem.id);
      modalFavorite.textContent = (modalFavorite.textContent === '♥') ? '♡' : '♥';
    });
  }

  function populateAlsoBought(item) {
    alsoBoughtGrid.innerHTML = '';
    const otherItems = state.items.filter(i => i.id !== item.id && i.type === item.type);
    const shuffled = otherItems.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    selected.forEach(simItem => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.cursor = 'pointer';
      
      let priceText = '';
      if (simItem.prices.single) priceText = `$${simItem.prices.single.toFixed(2)}`;
      else if (simItem.prices.small && simItem.prices.large) priceText = `$${simItem.prices.small.toFixed(2)} - $${simItem.prices.large.toFixed(2)}`;
      
      card.innerHTML = `
        <div class="product-card-image" style="height: 100px; font-size: 2.5rem; background: linear-gradient(135deg, ${simItem.gradient || '#eee, #ccc'})">
          <span>${simItem.emoji}</span>
        </div>
        <div class="product-card-body" style="padding: 0.75rem;">
          <h4 style="font-size: 0.9rem; margin-bottom: 0.25rem;">${simItem.name}</h4>
          <div class="product-card-price" style="font-size: 0.8rem;">${priceText}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        openProductModal(simItem.id);
      });
      alsoBoughtGrid.appendChild(card);
    });
  }
});
