// File: controllers/auditController.js

const AuditLog = require('../models/AuditLog');
const XLSX = require('xlsx');

/**
 * @desc    Get audit logs with filters
 * @route   GET /api/admin/audit-logs
 * @access  Admin + VIEW_AUDIT_LOGS permission
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const {
            userId,
            action,
            resource,
            status,
            startDate,
            endDate,
            page = 1,
            limit = 50,
            search
        } = req.query;

        // Build query
        const query = {};

        if (userId) {
            query.userId = userId;
        }

        if (action) {
            query.action = action;
        }

        if (resource) {
            query.resource = resource;
        }

        if (status) {
            query.status = status;
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // End of day
                query.createdAt.$lte = end;
            }
        }

        // Search across multiple fields
        if (search) {
            query.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } },
                { resourceId: { $regex: search, $options: 'i' } },
                { ipAddress: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await AuditLog.find(query)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalLogs = await AuditLog.countDocuments(query);

        res.status(200).json({
            success: true,
            logs,
            totalLogs,
            totalPages: Math.ceil(totalLogs / parseInt(limit)),
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy nhật ký hệ thống',
            error: error.message
        });
    }
};

/**
 * @desc    Get single audit log by ID
 * @route   GET /api/admin/audit-logs/:id
 * @access  Admin + VIEW_AUDIT_LOGS permission
 */
exports.getAuditLogById = async (req, res) => {
    try {
        const log = await AuditLog.findById(req.params.id)
            .populate('userId', 'name email role phoneNumber');

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhật ký'
            });
        }

        res.status(200).json({
            success: true,
            log
        });

    } catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy nhật ký',
            error: error.message
        });
    }
};

/**
 * @desc    Export audit logs to Excel
 * @route   GET /api/admin/audit-logs/export
 * @access  Admin only
 */
exports.exportAuditLogs = async (req, res) => {
    try {
        const { userId, action, resource, status, startDate, endDate } = req.query;

        // Build query (same as getAuditLogs)
        const query = {};

        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (resource) query.resource = resource;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Fetch all matching logs (limit to 10000 for safety)
        const logs = await AuditLog.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10000);

        // Prepare data for Excel
        const data = logs.map(log => ({
            'Thời gian': new Date(log.createdAt).toLocaleString('vi-VN'),
            'Người dùng': log.userName,
            'Email': log.userEmail,
            'Hành động': log.action,
            'Tài nguyên': log.resource,
            'ID tài nguyên': log.resourceId || '',
            'Phương thức': log.method,
            'IP': log.ipAddress,
            'Trạng thái': log.status,
            'Lỗi': log.errorMessage || ''
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');

        // Generate buffer
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Set headers for download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=AuditLogs_${Date.now()}.xlsx`);

        res.send(excelBuffer);

    } catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xuất nhật ký',
            error: error.message
        });
    }
};

/**
 * @desc    Get audit log statistics
 * @route   GET /api/admin/audit-logs/stats
 * @access  Admin + VIEW_AUDIT_LOGS permission
 */
exports.getAuditStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date query
        const dateQuery = {};
        if (startDate || endDate) {
            dateQuery.createdAt = {};
            if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateQuery.createdAt.$lte = end;
            }
        }

        // Get statistics
        const stats = await AuditLog.aggregate([
            { $match: dateQuery },
            {
                $facet: {
                    byAction: [
                        { $group: { _id: '$action', count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ],
                    byResource: [
                        { $group: { _id: '$resource', count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ],
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    byUser: [
                        { $group: { _id: { userId: '$userId', userName: '$userName' }, count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ],
                    total: [
                        { $group: { _id: null, count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                byAction: stats[0].byAction,
                byResource: stats[0].byResource,
                byStatus: stats[0].byStatus,
                topUsers: stats[0].byUser,
                total: stats[0].total[0]?.count || 0
            }
        });

    } catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê nhật ký',
            error: error.message
        });
    }
};
