// File: controllers/authController.js

const Taikhoan = require('../models/taikhoan');
const jwt = require('jsonwebtoken');

// Hàm trợ giúp tạo token (chuyển từ file route sang đây)
const generateToken = (id, is_admin) => {
    return jwt.sign({ id, is_admin }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Đăng ký tài khoản mới
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    const { name, phoneNumber, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Mật khẩu không khớp!' });
    }

    try {
        const userExists = await Taikhoan.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã được đăng ký!' });
        }

        const user = await Taikhoan.create({
            name,
            email,
            phoneNumber,
            password,
        });

        if (user) {
            res.status(201).json({
                message: 'Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.',
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
        }
    } catch (error) {
        res.status(500).json({ message: `Lỗi máy chủ: ${error.message}` });
    }
};

/**
 * @desc    Đăng nhập
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Taikhoan.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                token: generateToken(user._id, user.is_admin),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    is_admin: user.is_admin,
                },
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }
    } catch (error) {
        res.status(500).json({ message: `Lỗi máy chủ: ${error.message}` });
    }
};

module.exports = {
    registerUser,
    loginUser,
};