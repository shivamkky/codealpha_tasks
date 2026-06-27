// ── Cart Module ──
// Client-side cart management using localStorage

const CART_KEY = 'ecommerce_cart';

const Cart = {
  getItems() {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  },

  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.updateBadge();
  },

  addItem(product, quantity = 1) {
    const items = this.getItems();
    const existing = items.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity
      });
    }

    this.save(items);
    return items;
  },

  removeItem(productId) {
    const items = this.getItems().filter(item => item.id !== productId);
    this.save(items);
    return items;
  },

  updateQuantity(productId, quantity) {
    const items = this.getItems();
    const item = items.find(i => i.id === productId);

    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }
      item.quantity = quantity;
      this.save(items);
    }

    return items;
  },

  getTotal() {
    return this.getItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  clear() {
    localStorage.removeItem(CART_KEY);
    this.updateBadge();
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getCount();
    badges.forEach(badge => {
      badge.textContent = count || '';
      badge.setAttribute('data-count', count);
    });
  }
};
