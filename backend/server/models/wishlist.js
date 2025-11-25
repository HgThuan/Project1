const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Taikhoan',
        required: true
    },
    product_id: {
        type: String, // Using String because SanPham.ma_san_pham is String, not ObjectId
        ref: 'SanPham', // Note: This ref might need adjustment if referencing a non-ObjectId field, but for now we store the ID string
        required: true
    }
}, {
    timestamps: true
});

// Ensure a user can't add the same product twice
WishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
