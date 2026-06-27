require('dotenv').config();
const db = require('./config/database');

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable memory foam ear cushions. Features Bluetooth 5.3 and Hi-Res Audio support for an immersive listening experience.',
    price: 249.99,
    image: '/images/headphones.jpg',
    category: 'Electronics',
    stock: 45,
    rating: 4.8
  },
  {
    name: 'Smart Fitness Watch Pro',
    description: 'Advanced fitness tracker with AMOLED display, heart rate monitoring, GPS tracking, sleep analysis, and 14-day battery life. Water-resistant to 50m with 100+ workout modes.',
    price: 199.99,
    image: '/images/smartwatch.jpg',
    category: 'Electronics',
    stock: 60,
    rating: 4.6
  },
  {
    name: 'Ultra-Slim Laptop Stand',
    description: 'Ergonomic aluminum laptop stand with adjustable height and angle. Foldable design for portability, supports laptops up to 17 inches. Improves posture and airflow for your device.',
    price: 49.99,
    image: '/images/laptop-stand.jpg',
    category: 'Electronics',
    stock: 120,
    rating: 4.5
  },
  {
    name: 'Premium Leather Backpack',
    description: 'Handcrafted genuine leather backpack with padded laptop compartment, multiple organizer pockets, and water-resistant lining. Perfect for work, travel, or everyday use.',
    price: 159.99,
    image: '/images/backpack.jpg',
    category: 'Accessories',
    stock: 35,
    rating: 4.7
  },
  {
    name: 'Minimalist Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard with hot-swappable switches, RGB backlighting, and premium PBT keycaps. USB-C and Bluetooth connectivity with up to 3 device pairing.',
    price: 129.99,
    image: '/images/keyboard.jpg',
    category: 'Electronics',
    stock: 80,
    rating: 4.9
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless medium-wash denim jacket with a modern slim fit. Features button closure, chest pockets, and adjustable waist tabs. Made from premium 100% organic cotton denim.',
    price: 89.99,
    image: '/images/denim-jacket.jpg',
    category: 'Clothing',
    stock: 55,
    rating: 4.4
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    description: 'Artisan ceramic pour-over coffee dripper with matching carafe and two mugs. Produces clean, flavorful coffee. Dishwasher safe with a beautiful matte glaze finish.',
    price: 64.99,
    image: '/images/coffee-set.jpg',
    category: 'Home',
    stock: 40,
    rating: 4.6
  },
  {
    name: 'Running Shoes — Cloud Series',
    description: 'Lightweight performance running shoes with responsive CloudTec cushioning, breathable mesh upper, and durable rubber outsole. Engineered for neutral runners seeking comfort on any surface.',
    price: 139.99,
    image: '/images/running-shoes.jpg',
    category: 'Clothing',
    stock: 70,
    rating: 4.7
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Sleek Qi-certified wireless charging pad with 15W fast charging. Compatible with all Qi-enabled devices. Features LED indicator and anti-slip surface with premium aluminum housing.',
    price: 34.99,
    image: '/images/charging-pad.jpg',
    category: 'Electronics',
    stock: 150,
    rating: 4.3
  },
  {
    name: 'Scented Soy Candle Collection',
    description: 'Set of 3 hand-poured soy wax candles in amber glass jars. Scents include Sandalwood & Vanilla, Cedar & Bergamot, and Lavender & Sage. 45-hour burn time each.',
    price: 42.99,
    image: '/images/candles.jpg',
    category: 'Home',
    stock: 90,
    rating: 4.8
  },
  {
    name: 'Polarized Aviator Sunglasses',
    description: 'Classic aviator sunglasses with polarized UV400 lenses and lightweight titanium frame. Includes premium leather carrying case and microfiber cleaning cloth.',
    price: 79.99,
    image: '/images/sunglasses.jpg',
    category: 'Accessories',
    stock: 65,
    rating: 4.5
  },
  {
    name: 'Merino Wool Crew Sweater',
    description: 'Ultra-soft 100% merino wool sweater with a relaxed crew neck fit. Temperature-regulating, moisture-wicking, and naturally odor-resistant. Machine washable for easy care.',
    price: 109.99,
    image: '/images/sweater.jpg',
    category: 'Clothing',
    stock: 50,
    rating: 4.6
  }
];

// Clear existing products and insert fresh seed data
const seed = db.transaction(() => {
  db.prepare('DELETE FROM order_items').run();
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM products').run();

  const stmt = db.prepare(
    'INSERT INTO products (name, description, price, image, category, stock, rating) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  for (const p of products) {
    stmt.run(p.name, p.description, p.price, p.image, p.category, p.stock, p.rating);
  }
});

seed();
console.log(`✅ Seeded ${products.length} products successfully.`);
process.exit(0);
