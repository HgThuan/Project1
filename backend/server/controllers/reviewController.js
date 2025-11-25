// controllers/reviewController.js
const Review = require('../models/review');
const SanPham = require('../models/sanpham');

const reviewController = {
    // Create a new review
    createReview: async (req, res) => {
        try {
            const { ma_san_pham, rating, comment } = req.body;
            const { ma_khach_hang, ten_khach_hang } = req.body; // Should come from authenticated user in real app

            // Validate required fields
            if (!ma_san_pham || !rating || !comment || !ma_khach_hang || !ten_khach_hang) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp đầy đủ thông tin đánh giá'
                });
            }

            // Validate rating
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Đánh giá phải từ 1 đến 5 sao'
                });
            }

            // Check if product exists
            const product = await SanPham.findOne({ ma_san_pham });
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            // Create review
            const newReview = new Review({
                ma_san_pham,
                ma_khach_hang,
                ten_khach_hang,
                rating: parseInt(rating),
                comment: comment.trim()
            });

            await newReview.save();

            // Update product review statistics
            await updateProductReviewStats(ma_san_pham);

            res.status(201).json({
                success: true,
                message: 'Đánh giá của bạn đã được gửi thành công!',
                review: newReview
            });

        } catch (err) {
            console.error('Error creating review:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi tạo đánh giá',
                error: err.message
            });
        }
    },

    // Get reviews for a product
    getProductReviews: async (req, res) => {
        try {
            const { ma_san_pham } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const ratingFilter = req.query.rating ? parseInt(req.query.rating) : null;

            // Build query
            const query = { ma_san_pham, status: 'approved' };
            if (ratingFilter) {
                query.rating = ratingFilter;
            }

            // Get reviews
            const reviews = await Review.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalReviews = await Review.countDocuments(query);
            const totalPages = Math.ceil(totalReviews / limit);

            res.json({
                success: true,
                reviews,
                pagination: {
                    total: totalReviews,
                    pages: totalPages,
                    page,
                    limit
                }
            });

        } catch (err) {
            console.error('Error getting reviews:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy đánh giá',
                error: err.message
            });
        }
    },

    // Get review statistics for a product
    getReviewStats: async (req, res) => {
        try {
            const { ma_san_pham } = req.params;

            const stats = await Review.aggregate([
                { $match: { ma_san_pham, status: 'approved' } },
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 },
                        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                    }
                }
            ]);

            const result = stats.length > 0 ? {
                avgRating: Math.round(stats[0].avgRating * 10) / 10,
                totalReviews: stats[0].totalReviews,
                ratingDistribution: {
                    5: stats[0].rating5,
                    4: stats[0].rating4,
                    3: stats[0].rating3,
                    2: stats[0].rating2,
                    1: stats[0].rating1
                }
            } : {
                avgRating: 0,
                totalReviews: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };

            res.json({ success: true, stats: result });

        } catch (err) {
            console.error('Error getting review stats:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thống kê đánh giá',
                error: err.message
            });
        }
    },

    // Update a review (user can update their own review)
    updateReview: async (req, res) => {
        try {
            const { review_id } = req.params;
            const { rating, comment, ma_khach_hang } = req.body;

            const review = await Review.findById(review_id);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đánh giá'
                });
            }

            // Check if user owns this review
            if (review.ma_khach_hang !== ma_khach_hang) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền sửa đánh giá này'
                });
            }

            // Update fields
            if (rating) review.rating = parseInt(rating);
            if (comment) review.comment = comment.trim();

            await review.save();

            // Update product review statistics
            await updateProductReviewStats(review.ma_san_pham);

            res.json({
                success: true,
                message: 'Đánh giá đã được cập nhật',
                review
            });

        } catch (err) {
            console.error('Error updating review:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật đánh giá',
                error: err.message
            });
        }
    },

    // Delete a review (user can delete their own review)
    deleteReview: async (req, res) => {
        try {
            const { review_id } = req.params;
            const { ma_khach_hang } = req.body;

            const review = await Review.findById(review_id);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đánh giá'
                });
            }

            // Check if user owns this review
            if (review.ma_khach_hang !== ma_khach_hang) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xóa đánh giá này'
                });
            }

            const ma_san_pham = review.ma_san_pham;
            await Review.findByIdAndDelete(review_id);

            // Update product review statistics
            await updateProductReviewStats(ma_san_pham);

            res.json({
                success: true,
                message: 'Đánh giá đã được xóa'
            });

        } catch (err) {
            console.error('Error deleting review:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa đánh giá',
                error: err.message
            });
        }
    }
};

// Helper function to update product review statistics
async function updateProductReviewStats(ma_san_pham) {
    try {
        const stats = await Review.aggregate([
            { $match: { ma_san_pham, status: 'approved' } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const avgRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
        const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

        await SanPham.findOneAndUpdate(
            { ma_san_pham },
            { avg_rating: avgRating, total_reviews: totalReviews }
        );
    } catch (err) {
        console.error('Error updating product review stats:', err);
    }
}

module.exports = reviewController;
