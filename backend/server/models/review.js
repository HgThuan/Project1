// models/review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    ma_san_pham: {
        type: String,
        required: true,
        index: true
    },
    ma_khach_hang: {
        type: String,
        required: true
    },
    ten_khach_hang: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved' // Auto-approve for now, can add moderation later
    }
}, {
    timestamps: true
});

// Index for faster queries
ReviewSchema.index({ ma_san_pham: 1, createdAt: -1 });
ReviewSchema.index({ ma_khach_hang: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
