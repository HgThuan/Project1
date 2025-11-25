// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Fetch current user's cart
// GET /api/cart?userId=...
router.get('/api/cart', cartController.getCart);

// Add item to cart (handle merging if item exists)
// POST /api/cart/add
router.post('/api/cart/add', cartController.addToCart);

// Update item quantity
// PUT /api/cart/update
router.put('/api/cart/update', cartController.updateCartItem);

// Remove specific item
// DELETE /api/cart/remove/:itemId
router.delete('/api/cart/remove/:itemId', cartController.removeFromCart);

// Clear all items
// DELETE /api/cart/clear
router.delete('/api/cart/clear', cartController.clearCart);

// Sync localStorage cart to backend (useful on login)
router.post('/api/cart/sync', cartController.syncCart);

module.exports = router;
