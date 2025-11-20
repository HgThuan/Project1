const User = require('../models/taikhoan');

// @desc    Cập nhật thông tin profile người dùng
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    // req.user được gán từ middleware 'protect'
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      
      if (req.body.password) {
        // Mật khẩu sẽ tự động được hash bởi userSchema.pre('save')
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
      });
    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
     res.status(500).json({ message: `Lỗi máy chủ: ${error.message}` });
  }
};

module.exports = { updateUserProfile };