// models/sanpham.js
const mongoose = require('mongoose');

const SanPhamSchema = new mongoose.Schema({
  ma_san_pham: {
    type: String,
    required: true,
    unique: true
  },
  ten_san_pham: {
    type: String,
    required: true
  },
  gia: {
    type: Number,
    required: true
  },
  size: {
    type: [String],
    default: []
  },
  mau_sac: {
    type: [String],
    default: []
  },
  anh_sanpham: {
    type: String,
    required: true
  },
  ma_danh_muc: String,
  soluong: {
    type: Number,
    required: true
  },
  mo_ta: String,
  so_luong_mua: {
    type: Number,
    default: 0
  },
  giam_gia: {
    type: Number,
    default: 0
  },
  gioi_tinh: {
    type: String,
    enum: ['Nam', 'Nữ', 'Unisex'],
    default: 'Unisex'
  },
  anhhover1: String,
  anhhover2: String,
  thongbao: String,
  sale: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('SanPham', SanPhamSchema);