const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * Lab 05 Task 2 — POST /cart/:productId
 * Add product to cart. If already present, increase quantity by 1.
 * Stock must not be exceeded.
 */
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const customer = await Customer.findById(req.user._id);
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Check stock before incrementing
      if (existingItem.quantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) available in stock`,
        });
      }
      existingItem.quantity += 1;
    } else {
      // Check stock before adding new item
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product is out of stock',
        });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    // Return populated cart
    await customer.populate('cart.product', 'name price image stock category');

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: customer.cart,
    });
  } catch (err) {
    console.error('addToCart error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Lab 05 Task 3 — GET /cart
 * Return the authenticated user's cart with populated Product data.
 */
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate(
      'cart.product',
      'name price image stock category description'
    );

    // Filter out cart items where product was deleted
    const validCart = customer.cart.filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (err) {
    console.error('getCart error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Lab 05 Task 4 — PATCH /cart/:productId
 * Update quantity of a specific product in the cart.
 */
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // Validate quantity
    if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
      return res.status(400).json({ success: false, message: 'Quantity must be a number' });
    }
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) available in stock`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    cartItem.quantity = quantity;
    await customer.save();

    await customer.populate('cart.product', 'name price image stock category');

    return res.status(200).json({
      success: true,
      message: 'Quantity updated',
      cart: customer.cart,
    });
  } catch (err) {
    console.error('updateCartQuantity error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Lab 05 Task 5 — DELETE /cart/:productId
 * Remove a product from the authenticated user's cart.
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const customer = await Customer.findById(req.user._id);
    const beforeLength = customer.cart.length;

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    if (customer.cart.length === beforeLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    await customer.save();
    await customer.populate('cart.product', 'name price image stock category');

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: customer.cart,
    });
  } catch (err) {
    console.error('removeFromCart error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };
