const express = require('express');
const router = express.Router();

const { addToCart, getCart, updateCartQuantity, removeFromCart } = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All cart endpoints require authentication
router.use(authMiddleware);

router.post('/:productId', addToCart);       // Add to cart (or increment)
router.get('/', getCart);                    // Get current user's cart
router.patch('/:productId', updateCartQuantity); // Update quantity
router.delete('/:productId', removeFromCart);    // Remove product

module.exports = router;
