const mongoose = require('mongoose');
const DatHang = require('./dathang'); // Reuse the DatHang model

// Since hoadonController uses callback style (err, result), we need to wrap the Mongoose promises.
// However, it's better to rewrite the controller to use async/await and the DatHang model directly.
// But to fix the immediate 500 error without rewriting the controller yet, we can create a compatibility layer.

const Hoadon = {
    getAll: async (callback) => {
        try {
            const orders = await DatHang.find().sort({ createdAt: -1 });
            callback(null, orders);
        } catch (err) {
            callback(err, null);
        }
    },

    getById: async (id, callback) => {
        try {
            const order = await DatHang.findOne({ ma_don_hang: id });
            callback(null, order);
        } catch (err) {
            callback(err, null);
        }
    },

    delete: async (id, callback) => {
        try {
            await DatHang.findOneAndDelete({ ma_don_hang: id });
            callback(null, { message: "Deleted" });
        } catch (err) {
            callback(err, null);
        }
    },

    update: async (id, data, callback) => {
        try {
            const updated = await DatHang.findOneAndUpdate({ ma_don_hang: id }, data, { new: true });
            callback(null, updated);
        } catch (err) {
            callback(err, null);
        }
    },

    searchByName: async (term, callback) => {
        try {
            const orders = await DatHang.find({
                $or: [
                    { ma_don_hang: { $regex: term, $options: 'i' } },
                    { ten_khach: { $regex: term, $options: 'i' } }
                ]
            });
            callback(null, orders);
        } catch (err) {
            callback(err, null);
        }
    }
};

module.exports = Hoadon;
