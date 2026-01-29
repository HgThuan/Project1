const express = require('express');
const router = express.Router();
const { updateUserProfile, resetUserPassword } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

router.put('/profile', protect, updateUserProfile);

// Reset user password - Admin only
router.put(
    '/reset-password/:id',
    protect,
    admin,
    logAction('RESET_PASSWORD', 'user'),
    resetUserPassword
);

module.exports = router;