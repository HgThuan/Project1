const Invoice = require('../models/Invoice');

/**
 * GET /api/stats/invoices - Get invoice analytics
 */
exports.getInvoiceStats = async (req, res) => {
    try {
        const { period = 'month' } = req.query; // 'day', 'month', 'year'

        // Calculate date range based on period
        const now = new Date();
        let startDate;

        if (period === 'day') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 30); // Last 30 days
        } else if (period === 'month') {
            startDate = new Date();
            startDate.setMonth(now.getMonth() - 12); // Last 12 months
        } else {
            startDate = new Date();
            startDate.setFullYear(now.getFullYear() - 5); // Last 5 years
        }

        // 1. Revenue over time (grouped by period)
        const revenueOverTime = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: 'Hoạt động'
                }
            },
            {
                $group: {
                    _id: period === 'day'
                        ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                        : period === 'month'
                            ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
                            : { $dateToString: { format: "%Y", date: "$createdAt" } },
                    totalRevenue: { $sum: "$financials.finalAmount" },
                    paidRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$paymentStatus", "Đã thanh toán"] },
                                "$financials.finalAmount",
                                0
                            ]
                        }
                    },
                    unpaidRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$paymentStatus", "Chưa thanh toán"] },
                                "$financials.finalAmount",
                                0
                            ]
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 2. Count of invoices by payment status
        const invoicesByStatus = await Invoice.aggregate([
            {
                $match: {
                    status: 'Hoạt động'
                }
            },
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$financials.finalAmount" }
                }
            }
        ]);

        // 3. Revenue breakdown by payment method
        const revenueByPaymentMethod = await Invoice.aggregate([
            {
                $match: {
                    status: 'Hoạt động',
                    paymentStatus: 'Đã thanh toán'
                }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    revenue: { $sum: "$financials.finalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Summary calculations
        const summary = await Invoice.aggregate([
            {
                $facet: {
                    totalOutstanding: [
                        {
                            $match: {
                                status: 'Hoạt động',
                                paymentStatus: 'Chưa thanh toán'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$financials.finalAmount" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    totalRefunded: [
                        {
                            $match: {
                                paymentStatus: 'Đã hoàn tiền'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$financials.finalAmount" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    totalPaid: [
                        {
                            $match: {
                                status: 'Hoạt động',
                                paymentStatus: 'Đã thanh toán'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$financials.finalAmount" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    totalInvoices: [
                        {
                            $match: {
                                status: 'Hoạt động'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        // Format summary
        const summaryData = {
            totalOutstanding: summary[0].totalOutstanding[0] || { amount: 0, count: 0 },
            totalRefunded: summary[0].totalRefunded[0] || { amount: 0, count: 0 },
            totalPaid: summary[0].totalPaid[0] || { amount: 0, count: 0 },
            totalInvoices: summary[0].totalInvoices[0]?.count || 0
        };

        // 5. Recent invoices (last 10)
        const recentInvoices = await Invoice.find({ status: 'Hoạt động' })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('ma_hoa_don customerInfo.name financials.finalAmount paymentStatus createdAt');

        res.status(200).json({
            success: true,
            data: {
                revenueOverTime,
                invoicesByStatus,
                revenueByPaymentMethod,
                summary: summaryData,
                recentInvoices
            }
        });

    } catch (error) {
        console.error('Error fetching invoice stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê hóa đơn',
            error: error.message
        });
    }
};

/**
 * GET /api/stats/dashboard - Get overall dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Get invoice statistics
        const invoiceStats = await Invoice.aggregate([
            {
                $facet: {
                    monthlyRevenue: [
                        {
                            $match: {
                                createdAt: { $gte: startOfMonth },
                                status: 'Hoạt động',
                                paymentStatus: 'Đã thanh toán'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$financials.finalAmount" }
                            }
                        }
                    ],
                    yearlyRevenue: [
                        {
                            $match: {
                                createdAt: { $gte: startOfYear },
                                status: 'Hoạt động',
                                paymentStatus: 'Đã thanh toán'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$financials.finalAmount" }
                            }
                        }
                    ],
                    pendingInvoices: [
                        {
                            $match: {
                                status: 'Hoạt động',
                                paymentStatus: 'Chưa thanh toán'
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const stats = invoiceStats[0];

        res.status(200).json({
            success: true,
            data: {
                monthlyRevenue: stats.monthlyRevenue[0]?.total || 0,
                yearlyRevenue: stats.yearlyRevenue[0]?.total || 0,
                pendingInvoices: stats.pendingInvoices[0]?.count || 0
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê dashboard',
            error: error.message
        });
    }
};
