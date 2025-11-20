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

module.exports = {
    getAllAccounts,
    searchAccounts,
    deleteAccount,
};