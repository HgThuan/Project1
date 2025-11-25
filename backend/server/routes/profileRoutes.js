// File: routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect, checkActive } = require('../middleware/authMiddleware');
const { logAction } = require('../middleware/auditMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/avatars/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All routes require authentication and active account
router.use(protect);
router.use(checkActive);

// Get current user profile
router.get('/api/profile', profileController.getProfile);

// Update profile
router.put(
    '/api/profile',
    logAction('UPDATE_PROFILE', 'auth'),
    profileController.updateProfile
);

// Change password
router.put(
    '/api/profile/change-password',
    logAction('PASSWORD_CHANGE', 'auth'),
    profileController.changePassword
);

// Upload avatar
router.post(
    '/api/profile/avatar',
    upload.single('avatar'),
    profileController.uploadAvatar
);

module.exports = router;
