const mongoose = require('mongoose');

// Helper function to generate unique invoice ID
const generateInvoiceId = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Find the count of invoices created today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await mongoose.model('Invoice').countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const counter = (count + 1).toString().padStart(4, '0');
    return `HD${year}${month}${day}${counter}`;
};

const InvoiceSchema = new mongoose.Schema({
    ma_hoa_don: {
        type: String,
        required: true,
        unique: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DatHang',
        default: null
    },
    ma_don_hang: {
        type: String,
        default: null
    },
    customerInfo: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        email: {
            type: String,
            default: ''
        }
    },
    products: [{
        product_id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        tax: {
            type: Number,
            default: 0,
            min: 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0
        },
        color: {
            type: String,
            default: ''
        },
        size: {
            type: String,
            default: ''
        },
        image: {
            type: String,
            default: ''
        }
    }],
    financials: {
        subtotal: {
            type: Number,
            required: true,
            default: 0
        },
        totalTax: {
            type: Number,
            default: 0
        },
        totalDiscount: {
            type: Number,
            default: 0
        },
        finalAmount: {
            type: Number,
            required: true,
            default: 0
        }
    },
    paymentStatus: {
        type: String,
        enum: ['Chưa thanh toán', 'Đã thanh toán', 'Đã hoàn tiền'],
        default: 'Chưa thanh toán'
    },
    paymentMethod: {
        type: String,
        enum: ['Tiền mặt', 'Chuyển khoản', 'Ví điện tử', 'COD'],
        default: 'COD'
    },
    logs: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        action: {
            type: String,
            required: true
        },
        note: {
            type: String,
            default: ''
        },
        performedBy: {
            type: String,
            default: 'system'
        }
    }],
    createdType: {
        type: String,
        enum: ['Auto', 'Manual'],
        required: true
    },
    status: {
        type: String,
        enum: ['Hoạt động', 'Đã hủy'],
        default: 'Hoạt động'
    }
}, {
    timestamps: true
});

// Indexes for search and filter performance
InvoiceSchema.index({ ma_hoa_don: 1 });
InvoiceSchema.index({ ma_don_hang: 1 });
InvoiceSchema.index({ 'customerInfo.name': 'text', 'customerInfo.phone': 'text' });
InvoiceSchema.index({ paymentStatus: 1 });
InvoiceSchema.index({ paymentMethod: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ createdType: 1 });
InvoiceSchema.index({ createdAt: -1 });

// Method to calculate financials from products
InvoiceSchema.methods.calculateFinancials = function () {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    this.products.forEach(product => {
        const itemSubtotal = product.price * product.quantity;
        subtotal += itemSubtotal;
        totalTax += (product.tax || 0) * product.quantity;
        totalDiscount += (product.discount || 0) * product.quantity;
    });

    this.financials = {
        subtotal: subtotal,
        totalTax: totalTax,
        totalDiscount: totalDiscount,
        finalAmount: subtotal + totalTax - totalDiscount
    };

    return this.financials;
};

// Static method to generate invoice ID
InvoiceSchema.statics.generateInvoiceId = generateInvoiceId;

module.exports = mongoose.model('Invoice', InvoiceSchema);
