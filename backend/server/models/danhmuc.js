// models/danhmuc.js
const mongoose = require('mongoose');

const DanhMucSchema = new mongoose.Schema({
  ma_danh_muc: {
    type: String,
    required: true,
    unique: true
  },
  ten_danh_muc: {
    type: String,
    required: true
  },
}, {
  timestamps: true 
});

module.exports = mongoose.model('DanhMuc', DanhMucSchema);