// File: controllers/taikhoanController.js

const Taikhoan = require('../models/taikhoan');

/**
 * @desc    Lấy tất cả tài khoản
 * @route   GET /api/getallaccount
 * @access  Private/Admin
 */
const getAllAccounts = async (req, res) => {
    try {
        const users = await Taikhoan.find({}).select('-password');

        const formattedUsers = users.map(user => ({
            id: user._id,
            email: user.email,
            ten_nguoi_dung: user.name, // Đổi 'name' thành 'ten_nguoi_dung'
            is_admin: user.is_admin,
            role: user.role,
            isActive: user.isActive,
            phoneNumber: user.phoneNumber,
            permissions: user.permissions
        }));

        res.json(formattedUsers);

    } catch (error) {
        res.status(500).json({ message: `Lỗi máy chủ: ${error.message}` });
    }
};

/**
 * @desc    Tìm kiếm tài khoản
 * @route   GET /api/searchtk/:searchTerm
 * @access  Private/Admin
 */
const searchAccounts = async (req, res) => {
    const searchTerm = req.params.searchTerm;
    try {
        const users = await Taikhoan.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ],
        }).select('-password');

        const formattedUsers = users.map(user => ({
            id: user._id,
            email: user.email,
            ten_nguoi_dung: user.name,
            is_admin: user.is_admin,
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ message: `Lỗi máy chủ: ${error.message}` });
    }
};

/**
 * @desc    Xóa tài khoản
 * @route   DELETE /api/deletetk/:id
 * @access  Private/Admin
 */
const deleteAccount = async (req, res) => {
    try {
        const user = await Taikhoan.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }

        if (user.is_admin === 1) {
            return res.status(400).json({ message: 'Không thể xóa tài khoản Admin!' });
        }

        if (req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của mình' });
        }

        await user.deleteOne();
        res.json({ message: 'Xóa tài khoản thành công' });

    } catch (error) {
        res.status(500).json({ message: `Lỗi máy chủ: ${error.message}` });
    }
};

/**
 * @desc    Cập nhật thông tin tài khoản (Role, Permissions, Status)
 * @route   PUT /api/update/:id
 * @access  Private/Admin
 */
const updateAccount = async (req, res) => {
    try {
        const user = await Taikhoan.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

        if (req.body.role) {
            user.role = req.body.role;
            // Sync is_admin for legacy support
            user.is_admin = (req.body.role === 'admin' || req.body.role === 'staff') ? 1 : 0;
        }

        if (req.body.permissions) {
            user.permissions = req.body.permissions;
        }

        if (req.body.isActive !== undefined) {
            user.isActive = req.body.isActive;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            permissions: updatedUser.permissions,
            isActive: updatedUser.isActive,
            is_admin: updatedUser.is_admin,
        });

    } catch (error) {
        res.status(500).json({ message: `Lỗi máy chủ: ${error.message}` });
    }
};

/**
 * @desc    Tạo tài khoản nhân viên
 * @route   POST /api/createstaff
 * @access  Private/Admin
 */
const createStaff = async (req, res) => {
    const { name, email, password, phoneNumber, role, permissions } = req.body;

    try {
        const userExists = await Taikhoan.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const user = await Taikhoan.create({
            name,
            email,
            password,
            phoneNumber,
            role: role || 'staff',
            permissions: permissions || [],
            is_admin: 1, // Staff is considered admin in legacy check
            isActive: true
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
        }

    } catch (error) {
        res.status(500).json({ message: `Lỗi máy chủ: ${error.message}` });
    }
};

/**
 * @desc    Lấy chi tiết tài khoản theo ID
 * @route   GET /api/getaccount/:id
 * @access  Private/Admin
 */
const getAccountById = async (req, res) => {
    try {
        const user = await Taikhoan.findById(req.params.id).select('-password');

        if (user) {
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                isActive: user.isActive,
                is_admin: user.is_admin,
                phoneNumber: user.phoneNumber
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }
    } catch (error) {
        res.status(500).json({ message: `Lỗi máy chủ: ${error.message}` });
    }
};

module.exports = {
    getAllAccounts,
    searchAccounts,
    deleteAccount,
    updateAccount,
    createStaff,
    getAccountById,
};
