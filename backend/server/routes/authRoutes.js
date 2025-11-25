// File: routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginCustomer, loginAdmin } = require('../controllers/authController');

// Thay vì viết logic ở đây, ta chỉ cần gọi hàm từ controller
router.post('/register', registerUser);
router.post('/login-user', loginCustomer);
router.post('/login-admin', loginAdmin);

module.exports = router;