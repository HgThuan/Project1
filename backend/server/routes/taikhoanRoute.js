// File: routes/taikhoanRoute.js

const express = require('express');
const router = express.Router();

// Import controllers
const { 
    getAllAccounts, 
    searchAccounts, 
    deleteAccount 
} = require('../controllers/taikhoanController');

// Import middleware
const { protect, admin } = require('../middleware/authMiddleware');

// Áp dụng middleware và gọi hàm controller
router.get('/getallaccount', protect, admin, getAllAccounts);
router.get('/searchtk/:searchTerm', protect, admin, searchAccounts);
router.delete('/deletetk/:id', protect, admin, deleteAccount);

module.exports = router;