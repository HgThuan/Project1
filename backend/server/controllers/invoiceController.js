const Invoice = require('../models/Invoice');
const DatHang = require('../models/dathang');
const CTDH = require('../models/ctdh');

/**
 * GET /api/invoices - Get all invoices with filtering and pagination
 */
exports.getAllInvoices = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            paymentStatus,
            paymentMethod,
            status,
            startDate,
            endDate,
            createdType
        } = req.query;

        const query = {};

        // Search by Invoice ID, Customer Name, or Phone
        if (search) {
            query.$or = [
                { ma_hoa_don: { $regex: search, $options: 'i' } },
                { 'customerInfo.name': { $regex: search, $options: 'i' } },
                { 'customerInfo.phone': { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by Payment Status
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        // Filter by Payment Method
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        // Filter by Status (Active/Cancelled)
        if (status) {
            query.status = status;
        }

        // Filter by Created Type (Auto/Manual)
        if (createdType) {
            query.createdType = createdType;
        }

        // Filter by Date Range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const totalInvoices = await Invoice.countDocuments(query);
        const invoices = await Invoice.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('orderId', 'ma_don_hang trang_thai');

        res.status(200).json({
            success: true,
            invoices,
            totalInvoices,
            totalPages: Math.ceil(totalInvoices / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách hóa đơn',
            error: error.message
        });
    }
};

/**
 * GET /api/invoices/:id - Get invoice by ID
 */
exports.getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findOne({ ma_hoa_don: id })
            .populate('orderId', 'ma_don_hang trang_thai ten_khach dia_chi sdt');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        res.status(200).json({
            success: true,
            invoice
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin hóa đơn',
            error: error.message
        });
    }
};

/**
 * POST /api/invoices - Create manual invoice
 */
exports.createManualInvoice = async (req, res) => {
    try {
        const {
            customerInfo,
            products,
            paymentMethod = 'COD',
            paymentStatus = 'Chưa thanh toán',
            notes = '',
            performedBy = 'admin'
        } = req.body;

        // Validation
        if (!customerInfo || !customerInfo.name || !customerInfo.phone || !customerInfo.address) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin khách hàng không đầy đủ (tên, số điện thoại, địa chỉ)'
            });
        }

        if (!products || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách sản phẩm không được để trống'
            });
        }

        // Generate invoice ID
        const ma_hoa_don = await Invoice.generateInvoiceId();

        // Create invoice
        const invoice = new Invoice({
            ma_hoa_don,
            customerInfo,
            products,
            paymentMethod,
            paymentStatus,
            createdType: 'Manual',
            logs: [{
                timestamp: new Date(),
                action: 'created',
                note: notes || 'Tạo hóa đơn thủ công',
                performedBy
            }]
        });

        // Calculate financials
        invoice.calculateFinancials();

        await invoice.save();

        res.status(201).json({
            success: true,
            message: 'Tạo hóa đơn thành công',
            invoice
        });
    } catch (error) {
        console.error('Error creating manual invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo hóa đơn',
            error: error.message
        });
    }
};

/**
 * PUT /api/invoices/:id - Update invoice
 */
exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            customerInfo,
            products,
            paymentStatus,
            paymentMethod,
            notes = '',
            performedBy = 'admin'
        } = req.body;

        const invoice = await Invoice.findOne({ ma_hoa_don: id });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        // Check if invoice is cancelled
        if (invoice.status === 'Đã hủy') {
            return res.status(400).json({
                success: false,
                message: 'Không thể cập nhật hóa đơn đã hủy'
            });
        }

        // Update fields
        if (customerInfo) {
            invoice.customerInfo = { ...invoice.customerInfo, ...customerInfo };
        }

        if (products && products.length > 0) {
            invoice.products = products;
            invoice.calculateFinancials(); // Recalculate if products changed
        }

        if (paymentStatus) {
            invoice.paymentStatus = paymentStatus;
        }

        if (paymentMethod) {
            invoice.paymentMethod = paymentMethod;
        }

        // Add log entry
        invoice.logs.push({
            timestamp: new Date(),
            action: 'updated',
            note: notes || 'Cập nhật hóa đơn',
            performedBy
        });

        await invoice.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật hóa đơn thành công',
            invoice
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật hóa đơn',
            error: error.message
        });
    }
};

/**
 * POST /api/invoices/cancel/:id - Cancel/Refund invoice
 */
exports.cancelInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason = '', performedBy = 'admin' } = req.body;

        const invoice = await Invoice.findOne({ ma_hoa_don: id });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        if (invoice.status === 'Đã hủy') {
            return res.status(400).json({
                success: false,
                message: 'Hóa đơn đã được hủy trước đó'
            });
        }

        // Update status
        invoice.status = 'Đã hủy';

        // If invoice was paid, mark as refunded
        if (invoice.paymentStatus === 'Đã thanh toán') {
            invoice.paymentStatus = 'Đã hoàn tiền';
        }

        // Add log entry
        invoice.logs.push({
            timestamp: new Date(),
            action: 'cancelled',
            note: reason || 'Hủy hóa đơn',
            performedBy
        });

        await invoice.save();

        res.status(200).json({
            success: true,
            message: 'Đã hủy hóa đơn thành công',
            invoice
        });
    } catch (error) {
        console.error('Error cancelling invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi hủy hóa đơn',
            error: error.message
        });
    }
};

/**
 * Internal function to auto-generate invoice from order
 * Called when order status is updated to "Đã duyệt" (status 2)
 */
exports.autoGenerateInvoice = async (ma_don_hang) => {
    try {
        // Check if invoice already exists for this order
        const existingInvoice = await Invoice.findOne({ ma_don_hang });
        if (existingInvoice) {
            console.log(`Invoice already exists for order ${ma_don_hang}`);
            return existingInvoice;
        }

        // Fetch order details
        const order = await DatHang.findOne({ ma_don_hang });
        if (!order) {
            throw new Error(`Order ${ma_don_hang} not found`);
        }

        // Fetch order items
        const orderDetails = await CTDH.model.find({ ma_don_hang });
        if (!orderDetails || orderDetails.length === 0) {
            throw new Error(`No order details found for order ${ma_don_hang}`);
        }

        // Generate invoice ID
        const ma_hoa_don = await Invoice.generateInvoiceId();

        // Prepare customer info
        const customerInfo = {
            name: order.ten_khach,
            phone: order.sdt,
            address: order.dia_chi,
            email: '' // Not available in current order schema
        };

        // Prepare products
        const products = orderDetails.map(item => ({
            product_id: item.ma_san_pham,
            name: item.ten_san_pham,
            quantity: item.so_luong,
            price: item.gia,
            tax: 0, // Can be calculated if needed
            discount: 0, // Can be calculated if needed
            color: item.mau_sac || '',
            size: item.kich_co || '',
            image: item.anh_sanpham || ''
        }));

        // Determine payment method and status
        let paymentMethod = 'COD';
        let paymentStatus = order.thanh_toan === 'Đã thanh toán' ? 'Đã thanh toán' : 'Chưa thanh toán';

        // Create invoice
        const invoice = new Invoice({
            ma_hoa_don,
            orderId: order._id,
            ma_don_hang: order.ma_don_hang,
            customerInfo,
            products,
            paymentMethod,
            paymentStatus,
            createdType: 'Auto',
            logs: [{
                timestamp: new Date(),
                action: 'created',
                note: `Tự động tạo từ đơn hàng ${ma_don_hang} khi được duyệt`,
                performedBy: 'system'
            }]
        });

        // Calculate financials
        invoice.calculateFinancials();

        await invoice.save();

        console.log(`Auto-generated invoice ${ma_hoa_don} for order ${ma_don_hang}`);
        return invoice;
    } catch (error) {
        console.error('Error auto-generating invoice:', error);
        throw error;
    }
};
