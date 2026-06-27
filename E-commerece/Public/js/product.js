// ── Product Detail Page Logic ──

let currentProduct = null;
let selectedQuantity = 1;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    window.location.href = '/';
    return;
  }

  await loadProduct(productId);
});

async function loadProduct(id) {
  try {
    const data = await apiFetch(`/products/${id}`);
    currentProduct = data.product;
    document.title = `${currentProduct.name} — NovaBuy`;
    renderProduct(currentProduct);
  } catch (err) {
    console.error('Failed to load product:', err);
    document.getElementById('product-detail').innerHTML = `
      <div class="cart-empty" style="grid-column: 1 / -1;">
        <div class="cart-empty-icon">😕</div>
        <h3>Product not found</h3>
        <p>The product you're looking for doesn't exist.</p>
        <a href="/" class="btn btn-primary" style="margin-top: 16px;">Back to Shop</a>
      </div>
    `;
  }
}

function renderProduct(product) {
  const stockStatus = product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock';
  const stockText = product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock';

  document.getElementById('product-detail').innerHTML = `
    <div class="product-image-container" style="animation: fadeInUp 0.5s ease-out;">
      <img src="${product.image}" alt="${product.name}"
           onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:500px;font-size:80px;opacity:0.2\\'>📦</div>';">
    </div>

    <div class="product-info" style="animation: fadeInUp 0.5s ease-out 0.1s both;">
      <div class="product-breadcrumb">
        <a href="/">Shop</a>
        <span>›</span>
        <a href="/#products" onclick="sessionStorage.setItem('filter','${product.category}')">${product.category}</a>
        <span>›</span>
        <span style="color: var(--text-secondary);">${product.name}</span>
      </div>

      <h1>${product.name}</h1>

      <div class="product-rating-detail">
        <span class="stars" style="font-size: 18px;">${renderStars(product.rating)}</span>
        <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">
          ${product.rating} rating
        </span>
      </div>

      <div class="product-price-detail">${formatPrice(product.price)}</div>

      <p class="product-description">${product.description}</p>

      <div class="product-stock">
        <span class="stock-dot ${stockStatus}"></span>
        <span style="color: var(--text-secondary);">${stockText}</span>
      </div>

      ${product.stock > 0 ? `
        <div class="quantity-selector">
          <label>Quantity:</label>
          <div class="quantity-controls">
            <button onclick="changeQuantity(-1)" id="qty-minus">−</button>
            <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" onchange="validateQuantity()">
            <button onclick="changeQuantity(1)" id="qty-plus">+</button>
          </div>
        </div>

        <div class="product-actions">
          <button class="btn btn-primary btn-lg" id="add-to-cart-btn" onclick="addProductToCart()">
            🛒 Add to Cart
          </button>
          <a href="/cart.html" class="btn btn-secondary btn-lg">View Cart</a>
        </div>
      ` : `
        <div class="product-actions">
          <button class="btn btn-secondary btn-lg" disabled>Out of Stock</button>
        </div>
      `}
    </div>
  `;
}

function changeQuantity(delta) {
  const input = document.getElementById('qty-input');
  const newVal = parseInt(input.value) + delta;

  if (newVal >= 1 && newVal <= currentProduct.stock) {
    input.value = newVal;
    selectedQuantity = newVal;
  }
}

function validateQuantity() {
  const input = document.getElementById('qty-input');
  let val = parseInt(input.value);

  if (isNaN(val) || val < 1) val = 1;
  if (val > currentProduct.stock) val = currentProduct.stock;

  input.value = val;
  selectedQuantity = val;
}

function addProductToCart() {
  if (!currentProduct) return;

  const qty = parseInt(document.getElementById('qty-input').value) || 1;
  Cart.addItem(currentProduct, qty);
  showToast(`${currentProduct.name} added to cart!`);

  // Button feedback
  const btn = document.getElementById('add-to-cart-btn');
  btn.innerHTML = '✓ Added to Cart';
  btn.style.background = 'var(--accent-green)';

  setTimeout(() => {
    btn.innerHTML = '🛒 Add to Cart';
    btn.style.background = '';
  }, 2000);
}
