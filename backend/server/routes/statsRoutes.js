const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Get invoice statistics
router.get('/api/stats/invoices', statsController.getInvoiceStats);

// Get dashboard statistics
router.get('/api/stats/dashboard', statsController.getDashboardStats);

module.exports = router;
