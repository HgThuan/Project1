// File: routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Thay vì viết logic ở đây, ta chỉ cần gọi hàm từ controller
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;