const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');

// ─── Razorpay Setup ───────────────────────────────────────────────────────────
let razorpay = null;
try {
  const Razorpay = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (_) {
  // razorpay package not installed — simulation mode
}

/**
 * Lab 06 Task 4 — POST /orders/create-payment-order
 * Validates cart, calculates server-side total, creates ShopKart pending order,
 * creates Razorpay Order (or simulates if keys missing).
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Basic shipping address validation
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingAddress?.[field] || !shippingAddress[field].trim()) {
        return res.status(400).json({
          success: false,
          message: `Shipping address is missing: ${field}`,
        });
      }
    }

    // Load user with populated cart
    const customer = await Customer.findById(req.user._id).populate(
      'cart.product',
      'name price image stock'
    );

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Validate stock & build order items snapshot
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart no longer exist',
        });
      }

      // Re-fetch latest product for most current stock/price
      const latestProduct = await Product.findById(product._id);
      if (!latestProduct) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is no longer available`,
        });
      }

      if (cartItem.quantity > latestProduct.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${latestProduct.name}. Only ${latestProduct.stock} unit(s) available.`,
        });
      }

      // Snapshot at purchase-time prices
      orderItems.push({
        product: latestProduct._id,
        name: latestProduct.name,
        price: latestProduct.price,
        quantity: cartItem.quantity,
        image: latestProduct.image,
      });

      totalAmount += latestProduct.price * cartItem.quantity;
    }

    // Create pending ShopKart Order in DB
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    // Create Razorpay Order (or simulate)
    let razorpayOrderId = `sim_${order._id}`;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_simulation';

    if (razorpay) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // paise
          currency: 'INR',
          receipt: `order_${order._id}`,
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn('Razorpay order creation failed, using simulation:', rzpErr.message);
      }
    }

    order.razorpayOrderId = razorpayOrderId;
    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Payment order created',
      order: {
        _id: order._id,
        totalAmount,
        items: orderItems,
        shippingAddress,
      },
      razorpay: {
        orderId: razorpayOrderId,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        keyId: razorpayKeyId,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      },
    });
  } catch (err) {
    console.error('createPaymentOrder error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Lab 06 Task 4 — POST /orders/verify-payment
 * Verifies Razorpay HMAC-SHA256 signature.
 * On success: marks order PAID + PLACED, clears user's cart.
 * On failure: marks FAILED, does NOT clear cart.
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    let isValid = false;

    if (!secret || !razorpayOrderId || razorpayOrderId.startsWith('sim_')) {
      // Simulation mode — treat as valid
      isValid = true;
    } else {
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      isValid = expectedSig === razorpaySignature;
    }

    if (!isValid) {
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Mark order paid
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpayPaymentId || `sim_pay_${Date.now()}`;
    await order.save();

    // Clear cart ONLY after verified payment
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified. Order placed successfully!',
      order,
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /orders — All orders for the current user (newest first)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /orders/:id — Single order (must belong to authenticated user)
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getMyOrders, getOrderById };
