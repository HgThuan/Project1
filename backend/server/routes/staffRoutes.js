// File: routes/staffRoutes.js

const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect, admin, checkActive, checkPermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');
const { logAction } = require('../middleware/auditMiddleware');

// All routes require authentication and active account
router.use(protect);
router.use(checkActive);

// Create new staff - Admin only
router.post(
    '/api/admin/staff',
    admin,
    logAction('CREATE_STAFF', 'staff'),
    staffController.createStaff
);

// Get all staff - Admin or VIEW_STAFF permission
router.get(
    '/api/admin/staff',
    checkPermission(PERMISSIONS.VIEW_STAFF),
    staffController.getAllStaff
);

// Get staff by ID - Admin or VIEW_STAFF permission
router.get(
    '/api/admin/staff/:id',
    checkPermission(PERMISSIONS.VIEW_STAFF),
    staffController.getStaffById
);

// Update staff - Admin or MANAGE_STAFF permission
router.put(
    '/api/admin/staff/:id',
    checkPermission(PERMISSIONS.MANAGE_STAFF),
    logAction('UPDATE_STAFF', 'staff'),
    staffController.updateStaff
);

// Lock/Unlock staff account - Admin only
router.put(
    '/api/admin/staff/lock/:id',
    admin,
    logAction('LOCK_STAFF', 'staff'),
    staffController.lockStaff
);

// Reset staff password - Admin only
router.put(
    '/api/admin/staff/reset-password/:id',
    admin,
    logAction('RESET_PASSWORD', 'staff'),
    staffController.resetStaffPassword
);

// Delete staff - Admin only
router.delete(
    '/api/admin/staff/:id',
    admin,
    logAction('DELETE_STAFF', 'staff'),
    staffController.deleteStaff
);

module.exports = router;
