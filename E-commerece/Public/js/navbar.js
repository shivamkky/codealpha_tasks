// ── Navbar Component ──
// Dynamically injects the shared navbar into every page

function initNavbar() {
  const user = getCurrentUser();
  const currentPage = window.location.pathname;
  const cartCount = Cart.getCount();

  const navbar = document.createElement('nav');
  navbar.className = 'navbar';
  navbar.id = 'main-navbar';

  navbar.innerHTML = `
    <div class="navbar-inner">
      <a href="/" class="navbar-brand">
        <div class="brand-icon">◆</div>
        <span>NovaBuy</span>
      </a>

      <ul class="navbar-links">
        <li><a href="/" class="${currentPage === '/' || currentPage === '/index.html' ? 'active' : ''}">Shop</a></li>
        <li>
          <a href="/cart.html" class="cart-link ${currentPage === '/cart.html' ? 'active' : ''}">
            🛒 Cart
            <span class="cart-badge" data-count="${cartCount}">${cartCount || ''}</span>
          </a>
        </li>
        ${user ? `
          <li><a href="/orders.html" class="${currentPage === '/orders.html' ? 'active' : ''}">My Orders</a></li>
        ` : ''}
      </ul>

      <div class="navbar-auth">
        ${user ? `
          <span class="user-greeting">Hello, <strong>${user.name.split(' ')[0]}</strong></span>
          <button class="btn btn-secondary btn-sm" id="logout-btn" onclick="logout()">Logout</button>
        ` : `
          <a href="/login.html" class="btn btn-secondary btn-sm">Sign In</a>
          <a href="/register.html" class="btn btn-primary btn-sm">Sign Up</a>
        `}
      </div>
    </div>
  `;

  document.body.prepend(navbar);
}

// Initialize navbar on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  Cart.updateBadge();
});
