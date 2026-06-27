const express = require('express');
const db = require('../config/database');

const router = express.Router();

// GET /api/products — list all products (with optional category filter)
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    if (search) {
      query += params.length ? ' AND' : ' WHERE';
      query += ' (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const products = db.prepare(query).all(...params);
    res.json({ products });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error fetching products.' });
  }
});

// GET /api/products/categories — list unique categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category').all();
    res.json({ categories: categories.map(c => c.category) });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
});

// GET /api/products/:id — get single product
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ product });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Server error fetching product.' });
  }
});

module.exports = router;
