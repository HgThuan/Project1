const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// VNPay Routes
router.post('/create_payment_url', paymentController.createPaymentUrl);
// MoMo Route
router.post('/create_momo_url', paymentController.createMomoPayment);

// ZaloPay Route
router.post('/create_zalopay_url', paymentController.createZaloPayPayment);
router.post('/zalopay_callback', paymentController.zaloPayCallback);

router.get('/vnpay_ipn', paymentController.vnpayIPN);
router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;
