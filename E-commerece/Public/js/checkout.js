// ── Checkout Page Logic ──

document.addEventListener('DOMContentLoaded', () => {
  if (!isLoggedIn()) {
    window.location.href = '/login.html?redirect=/checkout.html';
    return;
  }

  const items = Cart.getItems();
  if (items.length === 0) {
    window.location.href = '/cart.html';
    return;
  }

  renderCheckout(items);
});

function renderCheckout(items) {
  const subtotal = Cart.getTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const container = document.getElementById('checkout-content');

  container.innerHTML = `
    <div class="checkout-layout">
      <div class="checkout-form-card">
        <h2>📦 Shipping Information</h2>
        <div id="checkout-alert" class="alert alert-error"></div>

        <form id="checkout-form" onsubmit="placeOrder(event)">
          <div class="form-group">
            <label for="shipping-name">Full Name</label>
            <input type="text" id="shipping-name" class="form-control" placeholder="John Doe" required>
          </div>

          <div class="form-group">
            <label for="shipping-address">Street Address</label>
            <input type="text" id="shipping-address" class="form-control" placeholder="123 Main Street, Apt 4B" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="shipping-city">City</label>
              <input type="text" id="shipping-city" class="form-control" placeholder="New York" required>
            </div>
            <div class="form-group">
              <label for="shipping-zip">ZIP / Postal Code</label>
              <input type="text" id="shipping-zip" class="form-control" placeholder="10001" required>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" id="place-order-btn" style="width: 100%; margin-top: 8px;">
            🛍️ Place Order — ${formatPrice(total)}
          </button>
        </form>
      </div>

      <div class="cart-summary">
        <h3>Order Summary</h3>
        ${items.map(item => `
          <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
            <div style="width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--gradient-card);">
              <img src="${item.image}" alt="" style="width: 100%; height: 100%; object-fit: cover;"
                   onerror="this.style.display='none';">
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
              <div style="font-size: 12px; color: var(--text-muted);">Qty: ${item.quantity}</div>
            </div>
            <div style="font-weight: 600; font-size: 14px; white-space: nowrap;">${formatPrice(item.price * item.quantity)}</div>
          </div>
        `).join('')}

        <div class="summary-row" style="margin-top: 12px;">
          <span>Subtotal</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span style="color: var(--accent-green);">Free</span>
        </div>
        <div class="summary-row">
          <span>Tax</span>
          <span>${formatPrice(tax)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span class="amount">${formatPrice(total)}</span>
        </div>
      </div>
    </div>
  `;
}

async function placeOrder(e) {
  e.preventDefault();

  const btn = document.getElementById('place-order-btn');
  const alert = document.getElementById('checkout-alert');

  const shipping = {
    name: document.getElementById('shipping-name').value.trim(),
    address: document.getElementById('shipping-address').value.trim(),
    city: document.getElementById('shipping-city').value.trim(),
    zip: document.getElementById('shipping-zip').value.trim()
  };

  // Validate
  if (!shipping.name || !shipping.address || !shipping.city || !shipping.zip) {
    alert.textContent = 'Please fill in all shipping fields.';
    alert.classList.add('visible');
    return;
  }

  // Prepare order items
  const cartItems = Cart.getItems();
  const items = cartItems.map(item => ({
    productId: item.id,
    quantity: item.quantity
  }));

  // Disable button and show loading
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Processing...';
  alert.classList.remove('visible');

  try {
    const data = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ items, shipping })
    });

    // Clear cart
    Cart.clear();

    // Show success
    const page = document.getElementById('checkout-page');
    page.innerHTML = `
      <div class="order-success">
        <div class="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>Your order #${data.order.id} has been received and is being processed.</p>
        <p style="color: var(--text-muted); margin-bottom: 32px;">You'll receive updates on your order status.</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <a href="/orders.html" class="btn btn-primary btn-lg">View My Orders</a>
          <a href="/" class="btn btn-secondary btn-lg">Continue Shopping</a>
        </div>
      </div>
    `;
  } catch (err) {
    alert.textContent = err.message || 'Failed to place order. Please try again.';
    alert.classList.add('visible');
    btn.disabled = false;
    btn.innerHTML = '🛍️ Place Order';
  }
}
