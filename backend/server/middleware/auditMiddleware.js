// File: middleware/auditMiddleware.js

const AuditLog = require('../models/AuditLog');

/**
 * Create audit log middleware
 * @param {string} action - Action type (e.g., 'CREATE_ORDER')
 * @param {string} resource - Resource type (e.g., 'order')
 * @returns {Function} Middleware function
 */
const logAction = (action, resource) => {
    return async (req, res, next) => {
        // Store original json and send functions
        const originalJson = res.json.bind(res);
        const originalSend = res.send.bind(res);

        // Override res.json to capture response
        res.json = function (data) {
            // Log the action after response
            setImmediate(() => {
                createAuditLog(req, res, action, resource, data);
            });
            return originalJson(data);
        };

        // Override res.send for non-JSON responses
        res.send = function (data) {
            setImmediate(() => {
                createAuditLog(req, res, action, resource, data);
            });
            return originalSend(data);
        };

        next();
    };
};

/**
 * Create audit log entry
 */
const createAuditLog = async (req, res, action, resource, responseData) => {
    try {
        // Skip if no user (e.g., public endpoints)
        if (!req.user) {
            return;
        }

        // Extract resource ID from various sources
        let resourceId = null;
        if (req.params.id) {
            resourceId = req.params.id;
        } else if (req.params.ma_don_hang) {
            resourceId = req.params.ma_don_hang;
        } else if (req.params.ma_san_pham) {
            resourceId = req.params.ma_san_pham;
        } else if (responseData && responseData.invoice) {
            resourceId = responseData.invoice.ma_hoa_don;
        } else if (responseData && responseData.order) {
            resourceId = responseData.order.ma_don_hang;
        } else if (responseData && responseData.user) {
            resourceId = responseData.user.id || responseData.user._id;
        }

        // Determine status from response
        const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failed';

        // Extract error message if failed
        let errorMessage = null;
        if (status === 'failed' && responseData) {
            errorMessage = responseData.message || responseData.error || 'Unknown error';
        }

        // Get IP address
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        // Create audit log
        await AuditLog.create({
            userId: req.user._id,
            userName: req.user.name,
            userEmail: req.user.email,
            action,
            resource,
            resourceId,
            method: req.method,
            ipAddress,
            userAgent: req.get('user-agent') || null,
            details: {
                url: req.originalUrl,
                body: sanitizeBody(req.body),
                params: req.params,
                query: req.query
            },
            status,
            errorMessage
        });

    } catch (error) {
        // Don't fail the request if audit logging fails
        console.error('Audit log creation failed:', error);
    }
};

/**
 * Sanitize request body to remove sensitive data
 */
const sanitizeBody = (body) => {
    if (!body) return {};

    const sanitized = { ...body };

    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.confirmPassword;
    delete sanitized.newPassword;
    delete sanitized.currentPassword;

    return sanitized;
};

/**
 * Manual audit log creation (for use in controllers)
 */
const createManualLog = async (user, action, resource, resourceId, details = {}, status = 'success', errorMessage = null) => {
    try {
        await AuditLog.create({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            action,
            resource,
            resourceId,
            method: 'MANUAL',
            ipAddress: 'Internal',
            userAgent: null,
            details,
            status,
            errorMessage
        });
    } catch (error) {
        console.error('Manual audit log creation failed:', error);
    }
};

module.exports = {
    logAction,
    createManualLog
};
