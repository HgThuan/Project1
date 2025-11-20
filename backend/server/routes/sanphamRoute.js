// routes/sanphamRoute.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/sanphamController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh!'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/api/getallsp', productController.getAllProducts);
router.get('/api/searchsp/:searchTerm', productController.searchProductByName);
router.get('/api/sanpham/danhmuc/:ma_danh_muc', productController.getProductsByCategory);
router.get('/api/getsp/:ma_san_pham', productController.getProductById);
router.post('/api/createsp', upload.single('anh_sanpham'), productController.createProduct);
router.put('/api/updatesp/:ma_san_pham', upload.single('anh_sanpham'), productController.updateProduct);
router.delete('/api/deletesp/:ma_san_pham', productController.deleteProduct);

router.get('/api/sanpham/gender/:gioi_tinh', productController.getProductsByGender);
router.get('/api/sanpham/filter/sale', productController.getSaleProducts);
router.get('/api/sanpham/filter/new', productController.getNewProducts);
router.get('/api/sanpham/filter/best-seller', productController.getBestSellerProducts);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File quá lớn. Tối đa 5MB.' });
  }
  res.status(500).json({ success: false, message: error.message });
});

module.exports = router;