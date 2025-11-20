// backend/routes/product.js
import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // ĐÚNG ĐƯỜNG DẪN
import { upload } from '../middleware/upload.js';
const router = express.Router();

// @desc    Lấy tất cả sản phẩm (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Lấy top 5 sản phẩm bán chạy (public)
router.get('/top', async (req, res) => {
  try {
    const products = await Product.find().sort({ sold: -1 }).limit(5);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Lấy sản phẩm theo ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Tạo sản phẩm mới (chỉ admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      user: req.user._id
    });
    const created = await product.save();
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Cập nhật sản phẩm (chỉ admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy' });

    Object.assign(product, req.body);
    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Xóa sản phẩm (chỉ admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy' });

    await product.deleteOne();
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});


// @desc    Lấy tất cả sản phẩm + phân trang
// @route   GET /api/getallsp?page=1&limit=10
router.get('/getallsp', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Lỗi getallsp:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Tìm kiếm sản phẩm + phân trang
// @route   GET /api/searchsp/:keyword?page=1&limit=10
router.get('/searchsp/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      ten_san_pham: { $regex: keyword, $options: 'i' }
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error('Lỗi searchsp:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Lấy sản phẩm theo mã
// @route   GET /api/getsp/:ma_san_pham
router.get('/getsp/:ma_san_pham', async (req, res) => {
  try {
    const products = await Product.find({ ma_san_pham: req.params.ma_san_pham });
    if (!products.length) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(products);
  } catch (err) {
    console.error('Lỗi getsp:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @desc    Thêm sản phẩm mới + upload ảnh
// @route   POST /api/createsp
router.post('/createsp', upload.single('anh_sanpham'), async (req, res) => {
  try {
    // Kiểm tra file ảnh
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn ảnh sản phẩm' });
    }

    const anh_sanpham = `/images/${req.file.filename}`;

    const product = new Product({
      ten_san_pham: req.body.ten_san_pham,
      gia: Number(req.body.gia),
      size: req.body.size,
      mau_sac: req.body.mau_sac,
      anh_sanpham,
      ma_danh_muc: req.body.ma_danh_muc,
      soluong: Number(req.body.soluong),
      mo_ta: req.body.mo_ta
    });

    const created = await product.save();
    res.status(201).json(created);
  } catch (err) {
    console.error('Lỗi createsp:', err);
    res.status(400).json({ message: err.message || 'Lỗi thêm sản phẩm' });
  }
});

// @desc    Cập nhật sản phẩm + upload ảnh (nếu có)
// @route   PUT /api/updatesp/:ma_san_pham
router.put('/updatesp/:ma_san_pham', upload.single('anh_sanpham'), async (req, res) => {
  try {
    const product = await Product.findOne({ ma_san_pham: req.params.ma_san_pham });
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Nếu có file mới → cập nhật ảnh
    const anh_sanpham = req.file ? `/images/${req.file.filename}` : product.anh_sanpham;

    product.ten_san_pham = req.body.ten_san_pham || product.ten_san_pham;
    product.gia = req.body.gia ? Number(req.body.gia) : product.gia;
    product.size = req.body.size || product.size;
    product.mau_sac = req.body.mau_sac || product.mau_sac;
    product.anh_sanpham = anh_sanpham;
    product.ma_danh_muc = req.body.ma_danh_muc || product.ma_danh_muc;
    product.soluong = req.body.soluong ? Number(req.body.soluong) : product.soluong;
    product.mo_ta = req.body.mo_ta || product.mo_ta;

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error('Lỗi updatesp:', err);
    res.status(400).json({ message: err.message || 'Lỗi cập nhật' });
  }
});

// @desc    Xóa sản phẩm
// @route   DELETE /api/deletesp/:ma_san_pham
router.delete('/deletesp/:ma_san_pham', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ ma_san_pham: req.params.ma_san_pham });
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    console.error('Lỗi deletesp:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;