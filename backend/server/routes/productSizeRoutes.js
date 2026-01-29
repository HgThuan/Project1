// routes/productSizeRoutes.js
const express = require('express');
const router = express.Router();
const ProductSize = require('../models/ProductSize');
const Product = require('../models/sanpham');

// @desc    Get all sizes for a product
// @route   GET /api/product-sizes/:ma_san_pham
router.get('/:ma_san_pham', async (req, res) => {
    try {
        const sizes = await ProductSize.getProductSizes(req.params.ma_san_pham);
        const total = await ProductSize.getTotalInventory(req.params.ma_san_pham);

        res.json({
            success: true,
            sizes,
            totalInventory: total
        });
    } catch (err) {
        console.error('Error fetching product sizes:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// @desc    Batch create/update sizes for a product  
// @route   POST /api/product-sizes/:ma_san_pham/batch
// NOTE: This MUST come before /:ma_san_pham/:size routes to avoid conflicts
router.post('/:ma_san_pham/batch', async (req, res) => {
    try {
        const { sizes } = req.body; // Array of { size, so_luong, gia_tang_them }

        if (!Array.isArray(sizes) || sizes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp danh sách sizes'
            });
        }

        // Check if product exists
        const product = await Product.findOne({ ma_san_pham: req.params.ma_san_pham });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Update product to managed type
        if (product.size_type !== 'managed') {
            product.size_type = 'managed';
            await product.save();
        }

        // Delete all existing sizes for this product
        await ProductSize.deleteMany({ ma_san_pham: req.params.ma_san_pham });

        // Insert new sizes
        const sizeRecords = sizes.map(s => ({
            ma_san_pham: req.params.ma_san_pham,
            size: s.size,
            so_luong: Number(s.so_luong) || 0,
            gia_tang_them: Number(s.gia_tang_them) || 0
        }));

        const created = await ProductSize.insertMany(sizeRecords);
        const total = await ProductSize.getTotalInventory(req.params.ma_san_pham);

        res.json({
            success: true,
            message: 'Cập nhật sizes thành công',
            sizes: created,
            totalInventory: total
        });
    } catch (err) {
        console.error('Error batch updating sizes:', err);
        res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

// @desc    Add or update a size for a product
// @route   POST /api/product-sizes/:ma_san_pham
router.post('/:ma_san_pham', async (req, res) => {
    try {
        const { size, so_luong, gia_tang_them } = req.body;

        if (!size || so_luong === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp size và số lượng'
            });
        }

        // Check if product exists
        const product = await Product.findOne({ ma_san_pham: req.params.ma_san_pham });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Update product to managed type
        if (product.size_type !== 'managed') {
            product.size_type = 'managed';
            await product.save();
        }

        // Upsert size
        const sizeRecord = await ProductSize.findOneAndUpdate(
            { ma_san_pham: req.params.ma_san_pham, size },
            {
                so_luong: Number(so_luong),
                gia_tang_them: Number(gia_tang_them) || 0
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật size thành công',
            size: sizeRecord
        });
    } catch (err) {
        console.error('Error adding/updating size:', err);
        res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

// @desc    Update size quantity
// @route   PUT /api/product-sizes/:ma_san_pham/:size
router.put('/:ma_san_pham/:size', async (req, res) => {
    try {
        const { so_luong, gia_tang_them } = req.body;

        const updateData = {};
        if (so_luong !== undefined) updateData.so_luong = Number(so_luong);
        if (gia_tang_them !== undefined) updateData.gia_tang_them = Number(gia_tang_them);

        const sizeRecord = await ProductSize.findOneAndUpdate(
            { ma_san_pham: req.params.ma_san_pham, size: req.params.size },
            updateData,
            { new: true }
        );

        if (!sizeRecord) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy size'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật thành công',
            size: sizeRecord
        });
    } catch (err) {
        console.error('Error updating size:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

// @desc    Delete a size
// @route   DELETE /api/product-sizes/:ma_san_pham/:size
router.delete('/:ma_san_pham/:size', async (req, res) => {
    try {
        const sizeRecord = await ProductSize.findOneAndDelete({
            ma_san_pham: req.params.ma_san_pham,
            size: req.params.size
        });

        if (!sizeRecord) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy size'
            });
        }

        res.json({
            success: true,
            message: 'Xóa size thành công'
        });
    } catch (err) {
        console.error('Error deleting size:', err);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
