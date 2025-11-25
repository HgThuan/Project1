// controllers/sanphamController.js
const SanPham = require('../models/sanpham');

const generateMaSP = (tenSP) => {
  const code = tenSP.substring(0, 3).toUpperCase();
  return `${code}-${Date.now()}`;
};

const getFilePath = (req) => {
  if (!req.file) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
};

const productController = {

  createProduct: async (req, res) => {
    try {
      const { ten_san_pham, gia, size, mau_sac, ma_danh_muc, soluong, mo_ta, so_luong_mua, giam_gia, gioi_tinh, thongbao, sale, anhhover1 } = req.body;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng tải lên ảnh sản phẩm.' });
      }

      const anh_sanpham = getFilePath(req);
      const ma_san_pham = generateMaSP(ten_san_pham);

      const newProduct = new SanPham({
        ma_san_pham,
        ten_san_pham,
        gia: parseInt(gia),
        size: Array.isArray(size) ? size : size?.split(',').filter(Boolean),
        mau_sac: Array.isArray(mau_sac) ? mau_sac : mau_sac?.split(',').filter(Boolean),
        anh_sanpham,
        anhhover1: anhhover1 || anh_sanpham,
        ma_danh_muc,
        soluong: parseInt(soluong),
        mo_ta,
        so_luong_mua: parseInt(so_luong_mua) || 0,
        giam_gia: parseInt(giam_gia) || 0,
        gioi_tinh: gioi_tinh || 'Unisex',
        thongbao: thongbao || '',
        sale: sale || ''
      });

      await newProduct.save();
      res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công!', product: newProduct });

    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server khi thêm sản phẩm', error: err.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await SanPham.findOne({ ma_san_pham: req.params.ma_san_pham });
      if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      res.json({ success: true, product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { ma_san_pham } = req.params;
      const updateData = { ...req.body };

      if (req.file) updateData.anh_sanpham = getFilePath(req);
      if (updateData.gia) updateData.gia = parseInt(updateData.gia);
      if (updateData.soluong) updateData.soluong = parseInt(updateData.soluong);
      if (updateData.so_luong_mua) updateData.so_luong_mua = parseInt(updateData.so_luong_mua);
      if (updateData.giam_gia) updateData.giam_gia = parseInt(updateData.giam_gia);

      if (updateData.size && !Array.isArray(updateData.size)) {
        updateData.size = updateData.size.split(',').filter(Boolean);
      }
      if (updateData.mau_sac && !Array.isArray(updateData.mau_sac)) {
        updateData.mau_sac = updateData.mau_sac.split(',').filter(Boolean);
      }

      const updatedProduct = await SanPham.findOneAndUpdate(
        { ma_san_pham },
        updateData,
        { new: true }
      );

      if (!updatedProduct) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      res.json({ success: true, message: 'Cập nhật thành công!', product: updatedProduct });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const deletedProduct = await SanPham.findOneAndDelete({ ma_san_pham: req.params.ma_san_pham });
      if (!deletedProduct) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
      res.json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  // HỖ TRỢ SORT THEO GIÁ
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const sort = req.query.sort;

      let sortOption = { created_at: -1 };
      if (sort === 'price-asc') sortOption = { gia: 1 };
      if (sort === 'price-desc') sortOption = { gia: -1 };
      if (sort === 'best-seller') sortOption = { so_luong_mua: -1 };

      const products = await SanPham.find()
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

      const totalProducts = await SanPham.countDocuments();
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        products,
        pagination: { total: totalProducts, pages: totalPages, page, limit }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  searchProductByName: async (req, res) => {
    try {
      const searchTerm = req.params.searchTerm;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const products = await SanPham.find({ ten_san_pham: { $regex: searchTerm, $options: 'i' } })
        .skip(skip)
        .limit(limit);

      const totalProducts = await SanPham.countDocuments({ ten_san_pham: { $regex: searchTerm, $options: 'i' } });
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        products,
        pagination: { total: totalProducts, pages: totalPages, page, limit }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  getProductsByCategory: async (req, res) => {
    try {
      const { ma_danh_muc } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const products = await SanPham.find({ ma_danh_muc })
        .skip(skip)
        .limit(limit);

      const totalProducts = await SanPham.countDocuments({ ma_danh_muc });
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        products,
        pagination: { total: totalProducts, pages: totalPages, page, limit }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  getProductsByGender: async (req, res) => {
    try {
      const { gioi_tinh } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = { gioi_tinh: { $in: [gioi_tinh, 'Unisex'] } };
      const products = await SanPham.find(filter).skip(skip).limit(limit);
      const totalProducts = await SanPham.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        products,
        pagination: { total: totalProducts, pages: totalPages, page, limit }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  getSaleProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const products = await SanPham.find({ giam_gia: { $gt: 0 } })
        .sort({ giam_gia: -1 })
        .skip(skip)
        .limit(limit);

      const totalProducts = await SanPham.countDocuments({ giam_gia: { $gt: 0 } });
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        products,
        pagination: { total: totalProducts, pages: totalPages, page, limit }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  getNewProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const products = await SanPham.find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const totalProducts = await SanPham.countDocuments();
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        products,
        pagination: { total: totalProducts, pages: totalPages, page, limit }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  getBestSellerProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const products = await SanPham.find()
        .sort({ so_luong_mua: -1 })
        .skip(skip)
        .limit(limit);

      const totalProducts = await SanPham.countDocuments();
      const totalPages = Math.ceil(totalProducts / limit);

      res.json({
        success: true,
        products,
        pagination: { total: totalProducts, pages: totalPages, page, limit }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
  },

  /**
   * Unified Search and Filter Endpoint
   * Supports: text search, filters (gender, category, price, sale), sorting, pagination
   * @route GET /api/products/search
   */
  searchAndFilterProducts: async (req, res) => {
    try {
      const {
        search,
        category,
        gender,
        minPrice,
        maxPrice,
        onSale,
        sortBy = 'newest',
        sortOrder = 'desc',
        page = 1,
        limit = 12
      } = req.query;

      // Build query object
      const query = {};

      // Text search (case-insensitive)
      if (search) {
        query.ten_san_pham = { $regex: search, $options: 'i' };
      }

      // Category filter
      if (category) {
        query.ma_danh_muc = category;
      }

      // Gender filter (include Unisex products)
      if (gender) {
        query.gioi_tinh = { $in: [gender, 'Unisex'] };
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.gia = {};
        if (minPrice) query.gia.$gte = parseInt(minPrice);
        if (maxPrice) query.gia.$lte = parseInt(maxPrice);
      }

      // Sale filter (products with discount > 0)
      if (onSale === 'true') {
        query.giam_gia = { $gt: 0 };
      }

      // Build sort options
      let sortOptions = {};
      const order = sortOrder === 'desc' ? -1 : 1;

      switch (sortBy) {
        case 'price':
          sortOptions = { gia: order };
          break;
        case 'name':
          sortOptions = { ten_san_pham: order };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { so_luong_mua: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Execute query
      const products = await SanPham.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      // Get total count for pagination
      const totalProducts = await SanPham.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limitNum);

      // Build response
      res.json({
        success: true,
        products,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalProducts,
          hasMore: pageNum < totalPages,
          limit: limitNum
        },
        appliedFilters: {
          search: search || null,
          category: category || null,
          gender: gender || null,
          priceRange: {
            min: minPrice ? parseInt(minPrice) : null,
            max: maxPrice ? parseInt(maxPrice) : null
          },
          onSale: onSale === 'true',
          sortBy,
          sortOrder
        }
      });

    } catch (err) {
      console.error('Error in searchAndFilterProducts:', err);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tìm kiếm sản phẩm',
        error: err.message
      });
    }
  }
};

module.exports = productController;