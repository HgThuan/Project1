const express = require('express');
const router = express.Router();
const orderController = require('../controllers/dathangController');

// User routes
router.post('/api/addOrder', orderController.addOrder);

// Admin routes
router.get('/api/allOrders', orderController.getAllOrders);
router.put('/api/updateOrder/:ma_don_hang', orderController.updateOrderStatus);
router.put('/api/approveOrder/:ma_don_hang', orderController.approveOrderWithCustomerUpdate);
router.delete('/api/deleteOrder/:ma_don_hang', orderController.softDeleteOrder);

// User specific order routes
router.get('/api/orders/user/:userId', orderController.getUserOrders);
router.get('/api/order/:ma_don_hang', orderController.getOrderById);
router.put('/api/order/cancel/:ma_don_hang', orderController.cancelOrder);
router.post('/api/order/track', orderController.trackOrder);

module.exports = router;
