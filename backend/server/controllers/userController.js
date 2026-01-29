const User = require('../models/taikhoan');
const { createManualLog } = require('../middleware/auditMiddleware');

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

// @desc    Reset user password (Admin force reset)
// @route   PUT /api/users/reset-password/:id
// @access  Admin only
const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Ensure this is a customer account
    if (user.role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể đặt lại mật khẩu cho tài khoản khách hàng'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Log action
    await createManualLog(
      req.user,
      'RESET_PASSWORD',
      'user',
      user._id.toString(),
      { resetBy: req.user.email, userEmail: user.email },
      'success'
    );

    res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đặt lại mật khẩu',
      error: error.message
    });
  }
};

module.exports = { updateUserProfile, resetUserPassword };