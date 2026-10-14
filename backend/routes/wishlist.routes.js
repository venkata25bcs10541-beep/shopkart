const express = require('express');
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
} = require('../controllers/wishlist.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All Wishlist endpoints are protected by authMiddleware
router.use(authMiddleware);

// Core endpoints
router.post('/:productId', addToWishlist);
router.get('/', getWishlist);
router.delete('/:productId', removeFromWishlist);

// Bonus endpoints
router.patch('/:productId/toggle', toggleWishlist);
router.get('/count', getWishlistCount);

module.exports = router;
