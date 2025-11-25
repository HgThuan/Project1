// models/cart.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    ma_khach_hang: {
        type: String,
        required: true,
        index: true
    },
    ma_san_pham: {
        type: String,
        required: true
    },
    ten_san_pham: {
        type: String,
        required: true
    },
    gia: {
        type: Number,
        required: true
    },
    so_luong: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    mau_sac: {
        type: String,
        required: true
    },
    kich_co: {
        type: String,
        required: true
    },
    anh_sanpham: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Composite index to ensure unique cart items per user
// Same product with different color/size = different cart items
CartSchema.index({
    ma_khach_hang: 1,
    ma_san_pham: 1,
    mau_sac: 1,
    kich_co: 1
}, { unique: true });

module.exports = mongoose.model('Cart', CartSchema);
