require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

const sampleProducts = [
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with tactile blue switches and detachable USB-C braided cable.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    stock: 12,
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation, 30-hour battery life, and high-res audio.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 25,
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Water-resistant smartwatch with AMOLED display, heart-rate tracking, and GPS.',
    price: 3499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    stock: 18,
  },
  {
    name: 'Ultra-Slim Wireless Mouse',
    description: 'Ergonomic 2.4GHz rechargeable silent wireless mouse with adjustable DPI levels.',
    price: 899,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    stock: 35,
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless vintage wash denim jacket made from 100% durable cotton with brass buttons.',
    price: 2199,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    stock: 15,
  },
  {
    name: 'Organic Cotton Crewneck T-Shirt',
    description: 'Ultra-soft breathable everyday cotton t-shirt with reinforced seams and pre-shrunk fabric.',
    price: 699,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    stock: 45,
  },
  {
    name: 'Leather Minimalist Wallet',
    description: 'Slim genuine leather bifold wallet with RFID blocking technology and multiple card slots.',
    price: 1199,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    stock: 20,
  },
  {
    name: 'Atomic Habits by James Clear',
    description: 'An easy and proven way to build good habits and break bad ones. Hardcover edition.',
    price: 599,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    stock: 30,
  },
  {
    name: 'Clean Code: A Handbook of Agile Craftsmanship',
    description: 'Legendary software engineering handbook by Robert C. Martin on writing elegant, maintainable code.',
    price: 1899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80',
    stock: 8,
  },
  {
    name: 'Ceramic Pour-Over Coffee Maker',
    description: 'Artisan matte ceramic dripper with wooden collar for brewing cafe-quality pour-over coffee.',
    price: 1499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    stock: 14,
  },
  {
    name: 'Aroma Diffuser & Humidifier',
    description: 'Ultrasonic cool mist aromatherapy diffuser with 7 ambient LED colors and automatic shut-off.',
    price: 1299,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    stock: 22,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing products and insert fresh catalog
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const created = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${created.length} products into ShopKart catalog!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
}

seedDatabase();
