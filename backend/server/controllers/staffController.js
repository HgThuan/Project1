// File: controllers/staffController.js

const Taikhoan = require('../models/taikhoan');
const bcrypt = require('bcryptjs');
const { ROLE_PERMISSIONS } = require('../constants/permissions');
const { createManualLog } = require('../middleware/auditMiddleware');

/**
 * @desc    Create new staff account
 * @route   POST /api/admin/staff
 * @access  Admin only
 */
exports.createStaff = async (req, res) => {
    try {
        const { name, email, phoneNumber, password, role, permissions } = req.body;

        // Validation
        if (!name || !email || !phoneNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin (tên, email, số điện thoại, mật khẩu)'
            });
        }

        // Check if email already exists
        const existingUser = await Taikhoan.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Validate role
        const staffRole = role || 'staff';
        if (!['staff', 'admin'].includes(staffRole)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ. Chỉ chấp nhận: staff hoặc admin'
            });
        }

        // Set permissions: use provided or default for role
        let staffPermissions = permissions;
        if (!staffPermissions || staffPermissions.length === 0) {
            staffPermissions = ROLE_PERMISSIONS[staffRole] || [];
        }

        // Create staff user
        const newStaff = await Taikhoan.create({
            name,
            email,
            phoneNumber,
            password,
            role: staffRole,
            permissions: staffPermissions,
            is_admin: staffRole === 'admin' ? 1 : 0,
            isActive: true,
            createdBy: req.user._id
        });

        // Log action
        await createManualLog(
            req.user,
            'CREATE_STAFF',
            'staff',
            newStaff._id.toString(),
            { staffEmail: email, role: staffRole },
            'success'
        );

        res.status(201).json({
            success: true,
            message: 'Tạo nhân viên thành công',
            user: {
                id: newStaff._id,
                name: newStaff.name,
                email: newStaff.email,
                phoneNumber: newStaff.phoneNumber,
                role: newStaff.role,
                permissions: newStaff.permissions,
                isActive: newStaff.isActive,
                createdAt: newStaff.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo nhân viên',
            error: error.message
        });
    }
};

/**
 * @desc    Get all staff members
 * @route   GET /api/admin/staff
 * @access  Admin + VIEW_STAFF permission
 */
exports.getAllStaff = async (req, res) => {
    try {
        const { role, isActive, page = 1, limit = 20, search } = req.query;

        // Build query
        const query = {
            role: { $in: ['staff', 'admin'] } // Only staff and admin, not customers
        };

        if (role) {
            query.role = role;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const staff = await Taikhoan.find(query)
            .select('-password')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalStaff = await Taikhoan.countDocuments(query);

        res.status(200).json({
            success: true,
            staff,
            totalStaff,
            totalPages: Math.ceil(totalStaff / parseInt(limit)),
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách nhân viên',
            error: error.message
        });
    }
};

/**
 * @desc    Get single staff by ID
 * @route   GET /api/admin/staff/:id
 * @access  Admin + VIEW_STAFF permission
 */
exports.getStaffById = async (req, res) => {
    try {
        const staff = await Taikhoan.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'name email');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên'
            });
        }

        res.status(200).json({
            success: true,
            staff
        });

    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin nhân viên',
            error: error.message
        });
    }
};

/**
 * @desc    Update staff information
 * @route   PUT /api/admin/staff/:id
 * @access  Admin + MANAGE_STAFF permission
 */
exports.updateStaff = async (req, res) => {
    try {
        const { name, email, phoneNumber, role, permissions } = req.body;

        const staff = await Taikhoan.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên'
            });
        }

        // Update fields
        if (name) staff.name = name;
        if (email) {
            // Check if email is already used by another user
            const existingUser = await Taikhoan.findOne({
                email,
                _id: { $ne: req.params.id }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã được sử dụng bởi người dùng khác'
                });
            }
            staff.email = email;
        }
        if (phoneNumber) staff.phoneNumber = phoneNumber;

        if (role) {
            if (!['staff', 'admin'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Vai trò không hợp lệ'
                });
            }
            staff.role = role;
            staff.is_admin = role === 'admin' ? 1 : 0;
        }

        if (permissions) {
            staff.permissions = permissions;
        }

        await staff.save();

        // Log action
        await createManualLog(
            req.user,
            'UPDATE_STAFF',
            'staff',
            staff._id.toString(),
            { updates: req.body },
            'success'
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật nhân viên thành công',
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                phoneNumber: staff.phoneNumber,
                role: staff.role,
                permissions: staff.permissions,
                isActive: staff.isActive
            }
        });

    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật nhân viên',
            error: error.message
        });
    }
};

/**
 * @desc    Lock or unlock staff account
 * @route   PUT /api/admin/staff/lock/:id
 * @access  Admin only
 */
exports.lockStaff = async (req, res) => {
    try {
        const { isActive, lockedReason } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp trạng thái isActive (true/false)'
            });
        }

        if (isActive === false && !lockedReason) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp lý do khóa tài khoản'
            });
        }

        const staff = await Taikhoan.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên'
            });
        }

        // Prevent locking yourself
        if (staff._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Không thể khóa tài khoản của chính mình'
            });
        }

        staff.isActive = isActive;
        staff.lockedReason = isActive ? null : lockedReason;

        await staff.save();

        // Log action
        await createManualLog(
            req.user,
            isActive ? 'UNLOCK_STAFF' : 'LOCK_STAFF',
            'staff',
            staff._id.toString(),
            { lockedReason: staff.lockedReason },
            'success'
        );

        res.status(200).json({
            success: true,
            message: isActive ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công',
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                isActive: staff.isActive,
                lockedReason: staff.lockedReason
            }
        });

    } catch (error) {
        console.error('Error locking/unlocking staff:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi khóa/mở khóa tài khoản',
            error: error.message
        });
    }
};

/**
 * @desc    Reset staff password (Admin force reset)
 * @route   PUT /api/admin/staff/reset-password/:id
 * @access  Admin only
 */
exports.resetStaffPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        const staff = await Taikhoan.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên'
            });
        }

        // Update password (will be hashed by pre-save hook)
        staff.password = newPassword;
        await staff.save();

        // Log action
        await createManualLog(
            req.user,
            'RESET_PASSWORD',
            'staff',
            staff._id.toString(),
            { resetBy: req.user.email },
            'success'
        );

        res.status(200).json({
            success: true,
            message: 'Đặt lại mật khẩu thành công'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đặt lại mật khẩu',
            error: error.message
        });
    }
};

/**
 * @desc    Delete staff (soft delete)
 * @route   DELETE /api/admin/staff/:id
 * @access  Admin only
 */
exports.deleteStaff = async (req, res) => {
    try {
        const staff = await Taikhoan.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nhân viên'
            });
        }

        // Prevent deleting yourself
        if (staff._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa tài khoản của chính mình'
            });
        }

        // Soft delete
        staff.isActive = false;
        staff.lockedReason = 'Tài khoản đã bị xóa';
        await staff.save();

        // Log action
        await createManualLog(
            req.user,
            'DELETE_STAFF',
            'staff',
            staff._id.toString(),
            { deletedBy: req.user.email },
            'success'
        );

        res.status(200).json({
            success: true,
            message: 'Xóa nhân viên thành công'
        });

    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa nhân viên',
            error: error.message
        });
    }
};
