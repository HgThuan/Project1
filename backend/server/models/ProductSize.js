// models/ProductSize.js
const mongoose = require('mongoose');

const ProductSizeSchema = new mongoose.Schema({
    ma_san_pham: {
        type: String,
        required: true,
        index: true
    },
    size: {
        type: String,
        required: true,
        trim: true
    },
    so_luong: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    gia_tang_them: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Composite unique index to ensure one record per product-size combination
ProductSizeSchema.index({ ma_san_pham: 1, size: 1 }, { unique: true });

// Static method to get total inventory for a product
ProductSizeSchema.statics.getTotalInventory = async function (ma_san_pham) {
    const result = await this.aggregate([
        { $match: { ma_san_pham } },
        { $group: { _id: null, total: { $sum: '$so_luong' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
};

// Static method to get all sizes for a product
ProductSizeSchema.statics.getProductSizes = async function (ma_san_pham) {
    return await this.find({ ma_san_pham }).sort({ size: 1 });
};

// Static method to check if size is available
ProductSizeSchema.statics.checkAvailability = async function (ma_san_pham, size, quantity) {
    const sizeRecord = await this.findOne({ ma_san_pham, size });
    if (!sizeRecord) return false;
    return sizeRecord.so_luong >= quantity;
};

// Static method to update stock after order
ProductSizeSchema.statics.decrementStock = async function (ma_san_pham, size, quantity) {
    const result = await this.findOneAndUpdate(
        { ma_san_pham, size, so_luong: { $gte: quantity } },
        { $inc: { so_luong: -quantity } },
        { new: true }
    );
    return result !== null;
};

module.exports = mongoose.model('ProductSize', ProductSizeSchema);
