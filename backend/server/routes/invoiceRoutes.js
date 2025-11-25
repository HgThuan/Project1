const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Get all invoices with filtering and pagination
router.get('/api/invoices', invoiceController.getAllInvoices);

// Get invoice by ID
router.get('/api/invoices/:id', invoiceController.getInvoiceById);

// Create manual invoice
router.post('/api/invoices', invoiceController.createManualInvoice);

// Update invoice
router.put('/api/invoices/:id', invoiceController.updateInvoice);

// Cancel/Refund invoice
router.post('/api/invoices/cancel/:id', invoiceController.cancelInvoice);

module.exports = router;
