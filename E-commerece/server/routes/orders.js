const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — create a new order
router.post('/', authMiddleware, (req, res) => {
  try {
    const { items, shipping } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must have at least one item.' });
    }

    if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.zip) {
      return res.status(400).json({ error: 'Complete shipping information is required.' });
    }

    // Validate products and calculate total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);

      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${product.name}". Available: ${product.stock}.` });
      }

      total += product.price * item.quantity;
      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order in a transaction
    const createOrder = db.transaction(() => {
      // Insert order
      const orderStmt = db.prepare(
        'INSERT INTO orders (user_id, total, shipping_name, shipping_address, shipping_city, shipping_zip) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const orderResult = orderStmt.run(
        req.user.id, total, shipping.name, shipping.address, shipping.city, shipping.zip
      );
      const orderId = orderResult.lastInsertRowid;

      // Insert order items and update stock
      const itemStmt = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      );
      const stockStmt = db.prepare(
        'UPDATE products SET stock = stock - ? WHERE id = ?'
      );

      for (const item of validatedItems) {
        itemStmt.run(orderId, item.productId, item.quantity, item.price);
        stockStmt.run(item.quantity, item.productId);
      }

      return orderId;
    });

    const orderId = createOrder();

    // Fetch the created order
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare(`
      SELECT oi.*, p.name as product_name, p.image as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(orderId);

    res.status(201).json({
      message: 'Order placed successfully!',
      order: { ...order, items: orderItems }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Server error creating order.' });
  }
});

// GET /api/orders — get user's order history
router.get('/', authMiddleware, (req, res) => {
  try {
    const orders = db.prepare(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);

    // Attach items to each order
    const itemStmt = db.prepare(`
      SELECT oi.*, p.name as product_name, p.image as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `);

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: itemStmt.all(order.id)
    }));

    res.json({ orders: ordersWithItems });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Server error fetching orders.' });
  }
});

// GET /api/orders/:id — get single order detail
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const order = db.prepare(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const items = db.prepare(`
      SELECT oi.*, p.name as product_name, p.image as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);

    res.json({ order: { ...order, items } });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Server error fetching order.' });
  }
});

module.exports = router;
