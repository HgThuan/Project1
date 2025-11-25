const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

router.post('/api/wishlist/toggle', wishlistController.toggleWishlist);
router.get('/api/wishlist/:userId', wishlistController.getWishlist);
router.delete('/api/wishlist/remove/:id', wishlistController.removeFromWishlist);

module.exports = router;
