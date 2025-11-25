const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Taikhoan',
            required: true,
            index: true
        },
        userName: {
            type: String,
            required: true
        },
        userEmail: {
            type: String,
            required: true
        },
        action: {
            type: String,
            required: true,
            index: true,
            enum: [
                // Order Actions
                'CREATE_ORDER',
                'UPDATE_ORDER',
                'DELETE_ORDER',
                'CANCEL_ORDER',
                'APPROVE_ORDER',

                // Product Actions
                'CREATE_PRODUCT',
                'UPDATE_PRODUCT',
                'DELETE_PRODUCT',

                // Invoice Actions
                'CREATE_INVOICE',
                'UPDATE_INVOICE',
                'CANCEL_INVOICE',

                // Customer Actions
                'CREATE_CUSTOMER',
                'UPDATE_CUSTOMER',
                'DELETE_CUSTOMER',

                // Staff Actions
                'CREATE_STAFF',
                'UPDATE_STAFF',
                'DELETE_STAFF',
                'LOCK_STAFF',
                'UNLOCK_STAFF',
                'RESET_PASSWORD',

                // Auth Actions
                'LOGIN',
                'LOGOUT',
                'REGISTER',
                'PASSWORD_CHANGE',

                // System Actions
                'VIEW_REPORTS',
                'EXPORT_DATA',
                'IMPORT_DATA',
                'CHANGE_SETTINGS'
            ]
        },
        resource: {
            type: String,
            required: true,
            index: true,
            enum: ['order', 'product', 'invoice', 'customer', 'staff', 'auth', 'report', 'system']
        },
        resourceId: {
            type: String,
            default: null
        },
        method: {
            type: String,
            required: true,
            enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        },
        ipAddress: {
            type: String,
            required: true
        },
        userAgent: {
            type: String,
            default: null
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        status: {
            type: String,
            required: true,
            enum: ['success', 'failed'],
            default: 'success'
        },
        errorMessage: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// Prevent modification of audit logs
auditLogSchema.pre('save', function (next) {
    if (!this.isNew) {
        return next(new Error('Audit logs cannot be modified'));
    }
    next();
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
