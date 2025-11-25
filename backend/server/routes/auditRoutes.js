// File: routes/auditRoutes.js

const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect, admin, checkActive, checkPermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

// All routes require authentication and active account
router.use(protect);
router.use(checkActive);

// Get audit logs - Admin or VIEW_AUDIT_LOGS permission
router.get(
    '/api/admin/audit-logs',
    checkPermission(PERMISSIONS.VIEW_AUDIT_LOGS),
    auditController.getAuditLogs
);

// Get audit log statistics - Admin or VIEW_AUDIT_LOGS permission
router.get(
    '/api/admin/audit-logs/stats',
    checkPermission(PERMISSIONS.VIEW_AUDIT_LOGS),
    auditController.getAuditStats
);

// Export audit logs - Admin only
router.get(
    '/api/admin/audit-logs/export',
    admin,
    auditController.exportAuditLogs
);

// Get single audit log - Admin or VIEW_AUDIT_LOGS permission
router.get(
    '/api/admin/audit-logs/:id',
    checkPermission(PERMISSIONS.VIEW_AUDIT_LOGS),
    auditController.getAuditLogById
);

module.exports = router;
