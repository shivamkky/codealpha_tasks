// ── Homepage App Logic ──
// Fetches products, renders grid, handles category filtering

let allProducts = [];
let activeCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  await loadCategories();
});

async function loadProducts() {
  try {
    const data = await apiFetch('/products');
    allProducts = data.products;
    renderProducts(allProducts);
  } catch (err) {
    console.error('Failed to load products:', err);
    document.getElementById('product-grid').innerHTML = `
      <div class="cart-empty" style="grid-column: 1 / -1;">
        <div class="cart-empty-icon">📦</div>
        <h3>Unable to load products</h3>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}

async function loadCategories() {
  try {
    const data = await apiFetch('/products/categories');
    const filtersContainer = document.getElementById('category-filters');

    data.categories.forEach(category => {
      const chip = document.createElement('button');
      chip.className = 'filter-chip';
      chip.dataset.category = category;
      chip.textContent = category;
      chip.addEventListener('click', () => filterByCategory(category));
      filtersContainer.appendChild(chip);
    });

    // Add click handler to "All" chip
    filtersContainer.querySelector('[data-category="all"]').addEventListener('click', () => filterByCategory('all'));
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function filterByCategory(category) {
  activeCategory = category;

  // Update chip active states
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.category === category);
  });

  // Filter and render
  const filtered = category === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === category);

  renderProducts(filtered);
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  const countEl = document.getElementById('product-count');

  countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="cart-empty" style="grid-column: 1 / -1;">
        <div class="cart-empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try selecting a different category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((product, index) => `
    <div class="product-card" style="animation-delay: ${index * 0.08}s" data-id="${product.id}">
      <div class="product-card-image" onclick="window.location.href='/product.html?id=${product.id}'">
        <img src="${product.image}" alt="${product.name}" loading="lazy"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:48px;opacity:0.3\\'>📦</div>';">
        <span class="product-card-category">${product.category}</span>
      </div>
      <div class="product-card-body">
        <h3 class="product-card-title" onclick="window.location.href='/product.html?id=${product.id}'" style="cursor:pointer;">
          ${product.name}
        </h3>
        <div class="product-card-rating">
          <span class="stars">${renderStars(product.rating)}</span>
          <span class="rating-value">${product.rating}</span>
        </div>
        <div class="product-card-footer">
          <span class="product-card-price">${formatPrice(product.price)}</span>
          <button class="btn-add-cart" id="add-btn-${product.id}" onclick="handleAddToCart(event, ${product.id})">
            + Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function handleAddToCart(event, productId) {
  event.stopPropagation();
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  Cart.addItem(product);
  showToast(`${product.name} added to cart!`);

  // Button feedback
  const btn = document.getElementById(`add-btn-${productId}`);
  btn.textContent = '✓ Added';
  btn.classList.add('added');

  setTimeout(() => {
    btn.textContent = '+ Add';
    btn.classList.remove('added');
  }, 1500);
}
