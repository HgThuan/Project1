const mongoose = require('mongoose');

const CTDHSchema = new mongoose.Schema({
    ma_don_hang: {
        type: String,
        required: true
    },
    ma_san_pham: {
        type: String,
        required: true
    },
    ten_san_pham: {
        type: String,
        required: true
    },
    so_luong: {
        type: Number,
        required: true
    },
    gia: {
        type: Number,
        required: true
    },
    mau_sac: {
        type: String
    },
    kich_co: {
        type: String
    },
    anh_sanpham: {
        type: String
    }
}, {
    timestamps: true
});

const CTDHModel = mongoose.model('CTDH', CTDHSchema);

const CTDH = {
    // Helper to access the raw model if needed
    model: CTDHModel,

    getById: async (ma_don_hang, callback) => {
        try {
            const details = await CTDHModel.find({ ma_don_hang });
            callback(null, details);
        } catch (err) {
            callback(err, null);
        }
    },

    getTop5ProductsDetails: async (callback) => {
        try {
            // Aggregation to find top 5 best selling products
            const topProducts = await CTDHModel.aggregate([
                {
                    $group: {
                        _id: "$ma_san_pham",
                        totalSold: { $sum: "$so_luong" },
                        ten_san_pham: { $first: "$ten_san_pham" },
                        anh_sanpham: { $first: "$anh_sanpham" },
                        gia: { $first: "$gia" }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 }
            ]);
            callback(null, topProducts);
        } catch (err) {
            callback(err, null);
        }
    },

    getDetailsByCustomerId: async (ma_khach_hang, callback) => {
        // This requires joining with DatHang to filter by customer
        // Since we don't have easy joins here without importing DatHang, 
        // and this might cause circular dependencies if not careful.
        // For now, we will return empty or implement a basic lookup if possible.
        // Assuming this function might not be heavily used or we can implement it later.
        // Let's try to do a lookup.
        try {
            // We need to find orders for this customer first.
            // But we can't easily access DatHang model here without require.
            // Let's require it inside the function to avoid top-level circular dependency if any.
            const DatHang = require('./dathang');
            const orders = await DatHang.find({ ma_khach_hang });
            const orderIds = orders.map(o => o.ma_don_hang);

            const details = await CTDHModel.find({ ma_don_hang: { $in: orderIds } });
            callback(null, details);
        } catch (err) {
            callback(err, null);
        }
    }
};

module.exports = CTDH;
