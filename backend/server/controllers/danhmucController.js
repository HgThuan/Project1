// controllers/danhmucController.js
const DanhMuc = require('../models/danhmuc');

// Hàm trợ giúp tạo mã danh mục duy nhất
const generateMaDM = (tenDM) => {
  const code = tenDM.substring(0, 3).toUpperCase();
  return `${code}-${Date.now()}`;
};

const categoryController = {

  // TẠO DANH MỤC MỚI (cho createdm.jsx)
  createCategory: async (req, res) => {
    try {
      const { ten_danh_muc } = req.body;
      if (!ten_danh_muc) {
        return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
      }

      const ma_danh_muc = generateMaDM(ten_danh_muc);
      
      const newCategory = new DanhMuc({
        ma_danh_muc,
        ten_danh_muc
      });

      await newCategory.save();
      res.status(201).json({ message: 'Thêm danh mục thành công!' });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Lỗi server khi thêm danh mục', error: err.message });
    }
  },

  // LẤY TẤT CẢ DANH MỤC (cho indexdm.jsx và navbar.jsx)
  getAllCategories: async (req, res) => {
    try {
      // Frontend (indexdm.jsx) mong đợi một mảng đơn giản
      const categories = await DanhMuc.find();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // LẤY DANH MỤC THEO ID (cho viewdm.jsx và editdm.jsx)
  getCategoryById: async (req, res) => {
    try {
      const category = await DanhMuc.findOne({ ma_danh_muc: req.params.ma_danh_muc });
      
      if (!category) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      // Frontend (viewdm, editdm) mong đợi một mảng chứa 1 đối tượng
      res.json([category]);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // CẬP NHẬT DANH MỤC (cho editdm.jsx)
  updateCategory: async (req, res) => {
    try {
      const { ma_danh_muc } = req.params;
      const { ten_danh_muc } = req.body;

      const updatedCategory = await DanhMuc.findOneAndUpdate(
        { ma_danh_muc: ma_danh_muc },
        { ten_danh_muc: ten_danh_muc },
        { new: true } // Trả về tài liệu đã cập nhật
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }

      res.json({ message: 'Cập nhật thành công!' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // XÓA DANH MỤC (cho indexdm.jsx)
  deleteCategory: async (req, res) => {
    try {
      const deletedCategory = await DanhMuc.findOneAndDelete({ ma_danh_muc: req.params.ma_danh_muc });

      if (!deletedCategory) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      
      // Bạn cũng nên cân nhắc cập nhật các sản phẩm đang dùng mã danh mục này
      // (ví dụ: đặt ma_danh_muc của chúng thành null)

      res.json({ message: 'Xóa danh mục thành công' });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  },

  // TÌM KIẾM DANH MỤC (cho indexdm.jsx)
  searchCategoryByName: async (req, res) => {
    try {
      const searchTerm = req.params.searchTerm;
      const categories = await DanhMuc.find({
        ten_danh_muc: { $regex: searchTerm, $options: 'i' } 
      });
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  }
};

module.exports = categoryController;