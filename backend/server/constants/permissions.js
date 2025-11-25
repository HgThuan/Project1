// File: constants/permissions.js

// Define all system permissions
const PERMISSIONS = {
    // Customer Management
    VIEW_CUSTOMER: 'view_customer',
    MANAGE_CUSTOMER: 'manage_customer',
    DELETE_CUSTOMER: 'delete_customer',

    // Order Management
    VIEW_ORDER: 'view_order',
    MANAGE_ORDER: 'manage_order',
    CANCEL_ORDER: 'cancel_order',
    APPROVE_ORDER: 'approve_order',

    // Product Management
    VIEW_PRODUCT: 'view_product',
    MANAGE_PRODUCT: 'manage_product',
    DELETE_PRODUCT: 'delete_product',

    // Invoice Management
    VIEW_INVOICE: 'view_invoice',
    MANAGE_INVOICE: 'manage_invoice',
    CANCEL_INVOICE: 'cancel_invoice',
    EXPORT_INVOICE: 'export_invoice',

    // Reports & Analytics
    VIEW_REPORTS: 'view_reports',
    VIEW_ANALYTICS: 'view_analytics',
    EXPORT_REPORTS: 'export_reports',

    // Staff Management
    VIEW_STAFF: 'view_staff',
    MANAGE_STAFF: 'manage_staff',
    DELETE_STAFF: 'delete_staff',

    // System & Security
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    MANAGE_SETTINGS: 'manage_settings',
    MANAGE_ROLES: 'manage_roles'
};

// Default permissions for each role
const ROLE_PERMISSIONS = {
    admin: Object.values(PERMISSIONS), // Admin has all permissions

    staff: [
        // Customer
        PERMISSIONS.VIEW_CUSTOMER,
        PERMISSIONS.MANAGE_CUSTOMER,

        // Orders
        PERMISSIONS.VIEW_ORDER,
        PERMISSIONS.MANAGE_ORDER,
        PERMISSIONS.APPROVE_ORDER,

        // Products
        PERMISSIONS.VIEW_PRODUCT,

        // Invoices
        PERMISSIONS.VIEW_INVOICE,
        PERMISSIONS.MANAGE_INVOICE,

        // Reports
        PERMISSIONS.VIEW_REPORTS
    ],

    customer: [] // Customers have no admin permissions
};

// Action to Permission mapping for audit logging
const ACTION_PERMISSIONS = {
    // Orders
    'CREATE_ORDER': PERMISSIONS.MANAGE_ORDER,
    'UPDATE_ORDER': PERMISSIONS.MANAGE_ORDER,
    'DELETE_ORDER': PERMISSIONS.DELETE_STAFF, // Only admin
    'CANCEL_ORDER': PERMISSIONS.CANCEL_ORDER,
    'APPROVE_ORDER': PERMISSIONS.APPROVE_ORDER,

    // Products
    'CREATE_PRODUCT': PERMISSIONS.MANAGE_PRODUCT,
    'UPDATE_PRODUCT': PERMISSIONS.MANAGE_PRODUCT,
    'DELETE_PRODUCT': PERMISSIONS.DELETE_PRODUCT,

    // Invoices
    'CREATE_INVOICE': PERMISSIONS.MANAGE_INVOICE,
    'UPDATE_INVOICE': PERMISSIONS.MANAGE_INVOICE,
    'CANCEL_INVOICE': PERMISSIONS.CANCEL_INVOICE,

    // Customers
    'CREATE_CUSTOMER': PERMISSIONS.MANAGE_CUSTOMER,
    'UPDATE_CUSTOMER': PERMISSIONS.MANAGE_CUSTOMER,
    'DELETE_CUSTOMER': PERMISSIONS.DELETE_CUSTOMER,

    // Staff
    'CREATE_STAFF': PERMISSIONS.MANAGE_STAFF,
    'UPDATE_STAFF': PERMISSIONS.MANAGE_STAFF,
    'DELETE_STAFF': PERMISSIONS.DELETE_STAFF,
    'LOCK_STAFF': PERMISSIONS.MANAGE_STAFF,
    'UNLOCK_STAFF': PERMISSIONS.MANAGE_STAFF,
    'RESET_PASSWORD': PERMISSIONS.MANAGE_STAFF
};

module.exports = {
    PERMISSIONS,
    ROLE_PERMISSIONS,
    ACTION_PERMISSIONS
};
