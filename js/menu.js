// js/menu.js - The Sugar Printer Catalog Script

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('productGrid')) return;

  const state = {
    filter: 'all',
    search: '',
    sort: 'featured',
    items: []
  };

  function loadFreshItems() {
    state.items = (typeof PPUtils !== 'undefined' && PPUtils.getMenuItems) ? PPUtils.getMenuItems() : (window.MENU_ITEMS || []);
  }

  loadFreshItems();

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
  const modalClose = modal ? modal.querySelector('.modal-close') : null;
  const modalImage = document.getElementById('modalImage');
  const modalEmoji = document.getElementById('modalEmoji');
  const modalImgTag = document.getElementById('modalImgTag');
  const modalFavorite = document.getElementById('modalFavorite');
  const modalCategoryTag = document.getElementById('modalCategoryTag');
  const modalName = document.getElementById('modalName');
  const modalRating = document.getElementById('modalRating');
  const modalDescription = document.getElementById('modalDescription');
  const modalStockStatus = document.getElementById('modalStockStatus');
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
    size: 'single',
    flavor: null,
    addIns: [],
    quantity: 1
  };

  // Listen for inventory updates from admin or orders
  window.addEventListener('inventoryUpdated', () => {
    loadFreshItems();
    filterAndSort();
  });

  // Init
  filterAndSort();

  // Check URL params for item
  const urlParams = new URLSearchParams(window.location.search);
  const requestedItem = urlParams.get('item');
  if (requestedItem) {
    setTimeout(() => openProductModal(requestedItem), 150);
  }

  // Search Input
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.search = e.target.value.toLowerCase().trim();
        filterAndSort();
      }, 200);
    });
  }

  // Filter Tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.filter = tab.dataset.filter;
      filterAndSort();
    });
  });

  // Sort
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      filterAndSort();
    });
  }

  // Clear Filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      state.filter = 'all';
      state.search = '';
      if (searchInput) searchInput.value = '';
      filterTabs.forEach(t => t.classList.toggle('active', t.dataset.filter === 'all'));
      filterAndSort();
    });
  }

  function filterAndSort() {
    loadFreshItems();

    let filtered = state.items.filter(item => {
      let matchesFilter = true;
      if (state.filter !== 'all') {
        matchesFilter = (item.category === state.filter || item.type === state.filter);
      }

      let matchesSearch = true;
      if (state.search) {
        const nameMatch = (item.name || '').toLowerCase().includes(state.search);
        const descMatch = (item.description || '').toLowerCase().includes(state.search);
        const catMatch = (item.categoryLabel || item.category || '').toLowerCase().includes(state.search);
        matchesSearch = nameMatch || descMatch || catMatch;
      }

      return matchesFilter && matchesSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      const priceA = a.prices ? (a.prices.single || a.prices.medium || a.prices.small || a.price || 0) : 0;
      const priceB = b.prices ? (b.prices.single || b.prices.medium || b.prices.small || b.price || 0) : 0;

      if (state.sort === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.rating || 5) - (a.rating || 5);
      } else if (state.sort === 'price-low') {
        return priceA - priceB;
      } else if (state.sort === 'price-high') {
        return priceB - priceA;
      } else if (state.sort === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (state.sort === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    renderProducts(filtered);
  }

  function renderProducts(items) {
    productGrid.innerHTML = '';
    resultCount.textContent = `${items.length} product${items.length === 1 ? '' : 's'}`;

    if (items.length === 0) {
      emptyState.style.display = 'block';
      return;
    } else {
      emptyState.style.display = 'none';
    }

    items.forEach(item => {
      const card = createProductCardElement(item);
      productGrid.appendChild(card);
    });
  }

  function createProductCardElement(item) {
    const card = document.createElement('div');
    const stock = (item.stock !== undefined) ? parseInt(item.stock, 10) : 1;
    const isSoldOut = (stock <= 0) || item.soldOut;
    card.className = `product-card ${isSoldOut ? 'sold-out' : ''}`;
    card.dataset.id = item.id;

    const isFav = (typeof PPUtils !== 'undefined' && PPUtils.isFavorite) ? PPUtils.isFavorite(item.id) : false;
    const price = item.prices ? (item.prices.single || item.prices.medium || item.prices.small || 0) : 0;

    let stockTagHtml = '';
    if (isSoldOut) {
      stockTagHtml = '<div class="stock-pill out">❌ Out of Stock</div>';
    } else if (stock === 1) {
      stockTagHtml = '<div class="stock-pill low">⚡ Only 1 Left!</div>';
    } else if (stock <= 3) {
      stockTagHtml = `<div class="stock-pill low">🔥 Only ${stock} Left</div>`;
    } else {
      stockTagHtml = `<div class="stock-pill in">✅ In Stock</div>`;
    }

    let imageSection = '';
    if (item.image) {
      imageSection = `
        <div class="product-card-image" style="background:#1e1e2e; position:relative; overflow:hidden;">
          <button class="product-card-favorite" data-id="${item.id}" aria-label="Favorite" style="z-index:4;">${isFav ? '❤️' : '🤍'}</button>
          <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:4rem; background:${item.gradient || '#8b5cf6'}">${item.emoji || '✨'}</div>
          ${stockTagHtml}
        </div>
      `;
    } else {
      imageSection = `
        <div class="product-card-image" style="background: ${item.gradient || 'linear-gradient(135deg, #8b5cf6, #3b82f6)'}; position:relative;">
          <button class="product-card-favorite" data-id="${item.id}" aria-label="Favorite" style="z-index:4;">${isFav ? '❤️' : '🤍'}</button>
          <span>${item.emoji || '✨'}</span>
          ${stockTagHtml}
        </div>
      `;
    }

    card.innerHTML = `
      ${imageSection}
      <div class="product-card-body" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--pp-primary); margin-bottom:4px;">${item.categoryLabel || item.category}</div>
          <h3 class="product-card-name" style="font-size:1.15rem; margin-bottom:6px; font-weight:700;">${item.name}</h3>
          <div class="product-card-rating" style="color:#f59e0b; margin-bottom:8px;">
            <span>⭐ ${item.rating || '5.0'} (${item.reviews || 1})</span>
          </div>
          <p style="font-size:0.85rem; color:var(--pp-text-secondary); line-height:1.4; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${item.description || ''}</p>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--pp-border); padding-top:10px;">
          <div class="product-card-price" style="font-size:1.25rem; font-weight:800; color:var(--pp-primary);">$${price.toFixed(2)}</div>
          <button class="btn btn-sm ${isSoldOut ? 'btn-outline' : 'btn-primary'}" style="padding:6px 14px; font-weight:700;">
            ${isSoldOut ? 'Sold Out' : 'View Item'}
          </button>
        </div>
      </div>
    `;

    // Favorite Click
    const favBtn = card.querySelector('.product-card-favorite');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof PPUtils !== 'undefined' && PPUtils.toggleFavorite) {
          PPUtils.toggleFavorite(item.id);
          favBtn.textContent = PPUtils.isFavorite(item.id) ? '❤️' : '🤍';
        }
      });
    }

    card.addEventListener('click', () => {
      openProductModal(item.id);
    });

    return card;
  }

  // --- Modal Logic ---
  function openProductModal(itemId) {
    loadFreshItems();
    currentModalItem = state.items.find(i => i.id === itemId);
    if (!currentModalItem) return;

    modalSelections = {
      size: 'single',
      flavor: (currentModalItem.flavors && currentModalItem.flavors.length > 0) ? currentModalItem.flavors[0] : null,
      addIns: [],
      quantity: 1
    };

    if (modalInstructions) modalInstructions.value = '';

    // Image vs Emoji
    if (currentModalItem.image) {
      modalImgTag.src = currentModalItem.image;
      modalImgTag.style.display = 'block';
      modalEmoji.style.display = 'none';
      modalImage.style.background = '#1e1e2e';
    } else {
      modalImgTag.style.display = 'none';
      modalEmoji.style.display = 'block';
      modalEmoji.textContent = currentModalItem.emoji || '✨';
      modalImage.style.background = currentModalItem.gradient || 'linear-gradient(135deg, #8b5cf6, #3b82f6)';
    }

    // Info
    modalCategoryTag.textContent = (currentModalItem.categoryLabel || currentModalItem.category || 'Item').toUpperCase();
    modalName.textContent = currentModalItem.name;
    modalRating.innerHTML = `⭐ ${currentModalItem.rating || '5.0'} (${currentModalItem.reviews || 1} customer reviews)`;
    modalDescription.textContent = currentModalItem.description || '';

    // Stock
    const stock = (currentModalItem.stock !== undefined) ? parseInt(currentModalItem.stock, 10) : 1;
    const isSoldOut = (stock <= 0) || currentModalItem.soldOut;

    if (isSoldOut) {
      modalStockStatus.innerHTML = '<span style="background:rgba(239,68,68,0.15); color:#ef4444; padding:4px 10px; border-radius:12px; font-weight:700;">❌ Out of Stock</span>';
      modalAddToCart.disabled = true;
      modalAddToCart.textContent = 'Out of Stock';
      modalAddToCart.style.opacity = '0.6';
      modalAddToCart.style.cursor = 'not-allowed';
      if (modalQtyPlus) modalQtyPlus.disabled = true;
      if (modalQtyMinus) modalQtyMinus.disabled = true;
    } else if (stock === 1) {
      modalStockStatus.innerHTML = '<span style="background:rgba(245,158,11,0.15); color:#f59e0b; padding:4px 10px; border-radius:12px; font-weight:700;">⚡ Only 1 unit in stock!</span>';
      modalAddToCart.disabled = false;
      modalAddToCart.style.opacity = '1';
      modalAddToCart.style.cursor = 'pointer';
      if (modalQtyPlus) modalQtyPlus.disabled = false;
      if (modalQtyMinus) modalQtyMinus.disabled = false;
    } else {
      modalStockStatus.innerHTML = `<span style="background:rgba(16,185,129,0.15); color:#10b981; padding:4px 10px; border-radius:12px; font-weight:700;">✅ ${stock} in stock - Ready to order</span>`;
      modalAddToCart.disabled = false;
      modalAddToCart.style.opacity = '1';
      modalAddToCart.style.cursor = 'pointer';
      if (modalQtyPlus) modalQtyPlus.disabled = false;
      if (modalQtyMinus) modalQtyMinus.disabled = false;
    }

    modalQty.textContent = modalSelections.quantity;

    // Flavors / Colors
    modalFlavors.innerHTML = '';
    const flavorSection = document.getElementById('modalFlavorSection');
    if (currentModalItem.flavors && currentModalItem.flavors.length > 0) {
      flavorSection.style.display = 'block';
      currentModalItem.flavors.forEach((flavor, index) => {
        const div = document.createElement('div');
        div.className = `flavor-option ${index === 0 ? 'active' : ''}`;
        div.textContent = flavor;
        div.addEventListener('click', () => {
          modalFlavors.querySelectorAll('.flavor-option').forEach(f => f.classList.remove('active'));
          div.classList.add('active');
          modalSelections.flavor = flavor;
        });
        modalFlavors.appendChild(div);
      });
    } else {
      flavorSection.style.display = 'none';
    }

    updateModalPrice();
    populateAlsoBought(currentModalItem);

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
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
    const basePrice = currentModalItem.prices ? (currentModalItem.prices.single || currentModalItem.prices.medium || currentModalItem.prices.small || 0) : 0;
    const total = basePrice * modalSelections.quantity;
    if (modalPrice) modalPrice.textContent = `$${total.toFixed(2)}`;
    if (modalAddToCart && !modalAddToCart.disabled) {
      modalAddToCart.innerHTML = `Add to Cart - <span id="modalPrice">$${total.toFixed(2)}</span>`;
    }
  }

  if (modalQtyPlus) {
    modalQtyPlus.addEventListener('click', () => {
      if (!currentModalItem) return;
      const maxStock = (currentModalItem.stock !== undefined) ? currentModalItem.stock : 1;
      if (modalSelections.quantity < maxStock) {
        modalSelections.quantity++;
        modalQty.textContent = modalSelections.quantity;
        updateModalPrice();
      } else {
        if (typeof PPUtils !== 'undefined' && PPUtils.showToast) {
          PPUtils.showToast(`Only ${maxStock} in stock!`, 'info');
        }
      }
    });
  }

  if (modalQtyMinus) {
    modalQtyMinus.addEventListener('click', () => {
      if (modalSelections.quantity > 1) {
        modalSelections.quantity--;
        modalQty.textContent = modalSelections.quantity;
        updateModalPrice();
      }
    });
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) closeModal();
  });

  // Add to Cart from Modal
  if (modalAddToCart) {
    modalAddToCart.addEventListener('click', () => {
      if (!currentModalItem) return;
      const stock = (currentModalItem.stock !== undefined) ? currentModalItem.stock : 1;
      if (stock <= 0) return;

      const basePrice = currentModalItem.prices ? (currentModalItem.prices.single || currentModalItem.prices.medium || currentModalItem.prices.small || 0) : 0;

      const cartItem = {
        cartId: 'ci_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        itemId: currentModalItem.id,
        name: currentModalItem.name,
        category: currentModalItem.category,
        flavor: modalSelections.flavor,
        quantity: modalSelections.quantity,
        unitPrice: basePrice,
        specialInstructions: modalInstructions ? modalInstructions.value : '',
        image: currentModalItem.image || '',
        emoji: currentModalItem.emoji || '✨'
      };

      if (typeof PPUtils !== 'undefined' && PPUtils.addToCart) {
        PPUtils.addToCart(cartItem);
      } else {
        const cart = JSON.parse(localStorage.getItem('pp_cart')) || [];
        cart.push(cartItem);
        localStorage.setItem('pp_cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
      }

      closeModal();
    });
  }

  function populateAlsoBought(item) {
    if (!alsoBoughtGrid) return;
    alsoBoughtGrid.innerHTML = '';
    const otherItems = state.items.filter(i => i.id !== item.id);
    const shuffled = otherItems.sort(() => 0.5 - Math.random()).slice(0, 3);

    shuffled.forEach(simItem => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.cursor = 'pointer';

      const price = simItem.prices ? (simItem.prices.single || simItem.prices.medium || simItem.prices.small || 0) : 0;

      let thumbHtml = '';
      if (simItem.image) {
        thumbHtml = `<div class="product-card-image" style="height: 100px; overflow:hidden;"><img src="${simItem.image}" alt="${simItem.name}" style="width:100%; height:100%; object-fit:cover;"></div>`;
      } else {
        thumbHtml = `<div class="product-card-image" style="height: 100px; font-size: 2.5rem; background: ${simItem.gradient || '#8b5cf6'}"><span>${simItem.emoji || '✨'}</span></div>`;
      }

      card.innerHTML = `
        ${thumbHtml}
        <div class="product-card-body" style="padding: 0.75rem;">
          <h4 style="font-size: 0.9rem; margin-bottom: 0.25rem;">${simItem.name}</h4>
          <div class="product-card-price" style="font-size: 0.85rem; color:var(--pp-primary); font-weight:700;">$${price.toFixed(2)}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        openProductModal(simItem.id);
      });
      alsoBoughtGrid.appendChild(card);
    });
  }
});
