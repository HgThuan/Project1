const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// VNPay Routes
router.post('/create_payment_url', paymentController.createPaymentUrl);
router.get('/vnpay_ipn', paymentController.vnpayIPN);
router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;
