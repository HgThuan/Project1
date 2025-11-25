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
  avg_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_reviews: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for search and filter performance
SanPhamSchema.index({ ten_san_pham: 'text' }); // Text search
SanPhamSchema.index({ gia: 1 }); // Price sorting/filtering
SanPhamSchema.index({ gioi_tinh: 1 }); // Gender filter
SanPhamSchema.index({ ma_danh_muc: 1 }); // Category filter
SanPhamSchema.index({ giam_gia: 1 }); // Sale filter
SanPhamSchema.index({ createdAt: -1 }); // Newest sort
SanPhamSchema.index({ so_luong_mua: -1 }); // Popular sort

module.exports = mongoose.model('SanPham', SanPhamSchema);