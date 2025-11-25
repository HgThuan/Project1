// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Create a new review
router.post('/api/reviews', reviewController.createReview);

// Get reviews for a product
router.get('/api/reviews/product/:ma_san_pham', reviewController.getProductReviews);

// Get review statistics for a product
router.get('/api/reviews/stats/:ma_san_pham', reviewController.getReviewStats);

// Update a review
router.put('/api/reviews/:review_id', reviewController.updateReview);

// Delete a review
router.delete('/api/reviews/:review_id', reviewController.deleteReview);

module.exports = router;
