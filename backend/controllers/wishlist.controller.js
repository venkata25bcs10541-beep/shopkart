const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

/**
 * Task 2: Add product to current user's wishlist
 * POST /wishlist/:productId
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Reject if client attempts to pass userId in body
    if (req.body && req.body.userId) {
      delete req.body.userId;
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Verify product exists in Product collection
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Fetch authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Ensure wishlist array exists
    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Prevent duplicate entries (Status 409 Conflict)
    const isAlreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // Add product reference and persist
    user.wishlist.push(productId);
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Add to Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while adding to wishlist',
    });
  }
};

/**
 * Task 3: Get current authenticated user's wishlist with populated product references
 * GET /wishlist
 */
const getWishlist = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock description',
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const wishlist = user.wishlist || [];

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching wishlist',
    });
  }
};

/**
 * Task 4: Remove product from current user's wishlist
 * DELETE /wishlist/:productId
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.wishlist || user.wishlist.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    user.wishlist.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Remove from Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while removing from wishlist',
    });
  }
};

/**
 * Bonus Challenge (+10 Marks): Wishlist Toggle Action
 * PATCH /wishlist/:productId/toggle
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const existingIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (existingIndex !== -1) {
      // Remove product
      user.wishlist.splice(existingIndex, 1);
      await user.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
      });
    } else {
      // Add product
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Product added to wishlist',
      });
    }
  } catch (error) {
    console.error('Toggle Wishlist Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while toggling wishlist',
    });
  }
};

/**
 * Bonus Challenge (+5 Marks): Wishlist Count
 * GET /wishlist/count
 */
const getWishlistCount = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const count = user.wishlist ? user.wishlist.length : 0;
    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Get Wishlist Count Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching wishlist count',
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
};
