const mongoose = require('mongoose');

const DatHangSchema = new mongoose.Schema({
    ma_don_hang: {
        type: String,
        required: true,
        unique: true
    },
    ma_khach_hang: {
        type: String,
        required: true
    },
    ngay_dat_hang: {
        type: Date,
        default: Date.now
    },
    tong_tien: {
        type: Number,
        required: true
    },
    trang_thai: {
        type: Number,
        default: 1 // 1: Chờ xác nhận, 2: Đang chuẩn bị, 3: Đang giao, 4: Đã giao, 5: Đã hủy
    },
    ten_khach: {
        type: String,
        required: true
    },
    dia_chi: {
        type: String,
        required: true
    },
    sdt: {
        type: String,
        required: true
    },
    ghi_chu: {
        type: String
    },
    thanh_toan: {
        type: String,
        default: 'Chưa thanh toán'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DatHang', DatHangSchema);
