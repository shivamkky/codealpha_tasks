// ── Orders Page Logic ──

document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn()) {
    window.location.href = '/login.html?redirect=/orders.html';
    return;
  }

  await loadOrders();
});

async function loadOrders() {
  const container = document.getElementById('orders-content');

  try {
    const data = await apiFetch('/orders');

    if (data.orders.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">📋</div>
          <h3>No orders yet</h3>
          <p style="color: var(--text-muted); margin-bottom: 24px;">Start shopping to see your order history here.</p>
          <a href="/" class="btn btn-primary">Browse Products</a>
        </div>
      `;
      return;
    }

    container.innerHTML = data.orders.map((order, i) => `
      <div class="order-card" style="animation-delay: ${i * 0.08}s">
        <div class="order-header" onclick="toggleOrderDetails(${order.id})">
          <div>
            <div class="order-id">Order #${order.id}</div>
            <div class="order-date">${formatDate(order.created_at)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span class="order-status status-${order.status}">${order.status}</span>
            <span class="order-total">${formatPrice(order.total)}</span>
            <span style="color: var(--text-muted); font-size: 12px;" id="chevron-${order.id}">▼</span>
          </div>
        </div>
        <div class="order-details" id="order-details-${order.id}">
          <div style="padding-top: 16px;">
            ${order.items.map(item => `
              <div class="order-item-row">
                <img class="order-item-img" src="${item.product_image}" alt=""
                     onerror="this.style.display='none';">
                <span class="order-item-name">${item.product_name}</span>
                <span class="order-item-qty">×${item.quantity}</span>
                <span class="order-item-price">${formatPrice(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>
          <div style="padding: 16px 0 8px; border-top: 1px solid var(--border-color); margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">
              <span>Shipped to:</span>
              <span>${order.shipping_name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted);">
              <span>Address:</span>
              <span>${order.shipping_address}, ${order.shipping_city} ${order.shipping_zip}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load orders:', err);
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">⚠️</div>
        <h3>Failed to load orders</h3>
        <p style="color: var(--text-muted);">Please try refreshing the page.</p>
      </div>
    `;
  }
}

function toggleOrderDetails(orderId) {
  const details = document.getElementById(`order-details-${orderId}`);
  const chevron = document.getElementById(`chevron-${orderId}`);

  if (details.classList.contains('open')) {
    details.classList.remove('open');
    chevron.textContent = '▼';
  } else {
    details.classList.add('open');
    chevron.textContent = '▲';
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
