// File: middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const Taikhoan = require('../models/taikhoan'); // Import model

// Middleware bảo vệ route
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ header (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Tìm người dùng từ ID trong token, gán vào req.user
            // loại bỏ trường password
            req.user = await Taikhoan.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Người dùng không tồn tại' });
            }

            next(); // Cho phép đi tiếp
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Xác thực thất bại, token không hợp lệ' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Xác thực thất bại, không tìm thấy token' });
    }
};

// Middleware kiểm tra quyền Admin
const admin = (req, res, next) => {
    if (req.user && req.user.is_admin === 1) {
        next(); // Là admin, cho đi tiếp
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập, yêu cầu quyền Admin' });
    }
};

module.exports = { protect, admin };