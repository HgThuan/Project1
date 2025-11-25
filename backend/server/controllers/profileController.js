// File: controllers/profileController.js

const Taikhoan = require('../models/taikhoan');
const bcrypt = require('bcryptjs');
const { createManualLog } = require('../middleware/auditMiddleware');

/**
 * @desc    Get current user profile
 * @route   GET /api/profile
 * @access  Protected
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await Taikhoan.findById(req.user._id)
            .select('-password')
            .populate('createdBy', 'name email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin cá nhân',
            error: error.message
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Protected
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, phoneNumber, address, dateOfBirth, gender } = req.body;

        const user = await Taikhoan.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (address !== undefined) user.address = address;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (gender !== undefined) user.gender = gender;

        await user.save();

        // Log action
        await createManualLog(
            req.user,
            'UPDATE_PROFILE',
            'auth',
            user._id.toString(),
            { updatedFields: Object.keys(req.body) },
            'success'
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                avatar: user.avatar,
                role: user.role,
                permissions: user.permissions
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thông tin',
            error: error.message
        });
    }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/profile/avatar
 * @access  Protected
 */
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ảnh'
            });
        }

        const user = await Taikhoan.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Update avatar path (assuming static file serving is set up)
        // Store relative path or full URL depending on your setup
        // Here we store the relative path from the server root or public folder
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        user.avatar = avatarPath;

        await user.save();

        // Log action
        await createManualLog(
            req.user,
            'UPDATE_AVATAR',
            'auth',
            user._id.toString(),
            { filename: req.file.filename },
            'success'
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật ảnh đại diện thành công',
            avatar: avatarPath
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật ảnh đại diện',
            error: error.message
        });
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/profile/change-password
 * @access  Protected
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới không khớp'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        const user = await Taikhoan.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        // Log action
        await createManualLog(
            req.user,
            'PASSWORD_CHANGE',
            'auth',
            user._id.toString(),
            { action: 'User changed own password' },
            'success'
        );

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đổi mật khẩu',
            error: error.message
        });
    }
};
