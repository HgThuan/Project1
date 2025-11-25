import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        isActive: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        limit: 20
    });
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'staff',
        permissions: []
    });

    // Permission definitions
    const AVAILABLE_PERMISSIONS = [
        { value: 'view_customer', label: 'Xem khách hàng', category: 'Khách hàng' },
        { value: 'manage_customer', label: 'Quản lý khách hàng', category: 'Khách hàng' },
        { value: 'view_order', label: 'Xem đơn hàng', category: 'Đơn hàng' },
        { value: 'manage_order', label: 'Quản lý đơn hàng', category: 'Đơn hàng' },
        { value: 'cancel_order', label: 'Hủy đơn hàng', category: 'Đơn hàng' },
        { value: 'approve_order', label: 'Duyệt đơn hàng', category: 'Đơn hàng' },
        { value: 'view_product', label: 'Xem sản phẩm', category: 'Sản phẩm' },
        { value: 'manage_product', label: 'Quản lý sản phẩm', category: 'Sản phẩm' },
        { value: 'view_invoice', label: 'Xem hóa đơn', category: 'Hóa đơn' },
        { value: 'manage_invoice', label: 'Quản lý hóa đơn', category: 'Hóa đơn' },
        { value: 'view_reports', label: 'Xem báo cáo', category: 'Báo cáo' },
        { value: 'view_analytics', label: 'Xem thống kê', category: 'Báo cáo' },
        { value: 'view_staff', label: 'Xem nhân viên', category: 'Nhân viên' }
    ];

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    useEffect(() => {
        fetchEmployees();
    }, [filters, pagination.currentPage]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                ...(filters.search && { search: filters.search }),
                ...(filters.role && { role: filters.role }),
                ...(filters.isActive !== '' && { isActive: filters.isActive })
            });

            const response = await axios.get(
                `http://localhost:5001/api/admin/staff?${params}`,
                getAuthHeaders()
            );

            setEmployees(response.data.staff);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages,
                currentPage: response.data.currentPage
            }));
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleOpenModal = (mode, employee = null) => {
        setModalMode(mode);
        setSelectedEmployee(employee);

        if (mode === 'edit' && employee) {
            setFormData({
                name: employee.name,
                email: employee.email,
                phoneNumber: employee.phoneNumber,
                password: '',
                role: employee.role,
                permissions: employee.permissions || []
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phoneNumber: '',
                password: '',
                role: 'staff',
                permissions: []
            });
        }

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEmployee(null);
        setFormData({
            name: '',
            email: '',
            phoneNumber: '',
            password: '',
            role: 'staff',
            permissions: []
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.phoneNumber) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (modalMode === 'create' && !formData.password) {
            toast.error('Vui lòng nhập mật khẩu');
            return;
        }

        try {
            if (modalMode === 'create') {
                await axios.post(
                    'http://localhost:5001/api/admin/staff',
                    formData,
                    getAuthHeaders()
                );
                toast.success('Tạo nhân viên thành công');
            } else {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await axios.put(
                    `http://localhost:5001/api/admin/staff/${selectedEmployee._id}`,
                    updateData,
                    getAuthHeaders()
                );
                toast.success('Cập nhật nhân viên thành công');
            }

            handleCloseModal();
            fetchEmployees();
        } catch (error) {
            console.error('Error saving employee:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handlePermissionToggle = (permission) => {
        setFormData(prev => {
            const permissions = prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission];
            return { ...prev, permissions };
        });
    };

    const handleLockUnlock = async (employee) => {
        const newStatus = !employee.isActive;

        if (!newStatus) {
            const reason = prompt('Vui lòng nhập lý do khóa tài khoản:');
            if (!reason) {
                toast.warning('Bạn phải nhập lý do khóa tài khoản');
                return;
            }

            try {
                await axios.put(
                    `http://localhost:5001/api/admin/staff/lock/${employee._id}`,
                    { isActive: false, lockedReason: reason },
                    getAuthHeaders()
                );
                toast.success('Khóa tài khoản thành công');
                fetchEmployees();
            } catch (error) {
                console.error('Error locking account:', error);
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        } else {
            try {
                await axios.put(
                    `http://localhost:5001/api/admin/staff/lock/${employee._id}`,
                    { isActive: true },
                    getAuthHeaders()
                );
                toast.success('Mở khóa tài khoản thành công');
                fetchEmployees();
            } catch (error) {
                console.error('Error unlocking account:', error);
                toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
            }
        }
    };

    const handleResetPassword = async (employee) => {
        const newPassword = prompt('Nhập mật khẩu mới (ít nhất 6 ký tự):');

        if (!newPassword) {
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            await axios.put(
                `http://localhost:5001/api/admin/staff/reset-password/${employee._id}`,
                { newPassword },
                getAuthHeaders()
            );
            toast.success('Đặt lại mật khẩu thành công');
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (employee) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${employee.name}"?`)) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:5001/api/admin/staff/${employee._id}`,
                getAuthHeaders()
            );
            toast.success('Xóa nhân viên thành công');
            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Group permissions by category
    const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
        if (!acc[perm.category]) {
            acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
    }, {});

    return (
        <div className="employee-management">
            {/* Header */}
            <div className="employee-header">
                <h1 className="h3 mb-0 text-gray-800">Quản lý nhân viên</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal('create')}>
                    <i className="fas fa-plus mr-2"></i>
                    Thêm nhân viên
                </button>
            </div>

            {/* Filters */}
            <div className="employee-filters card shadow mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label>Tìm kiếm</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tên hoặc email..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label>Vai trò</label>
                                <select
                                    className="form-control"
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select
                                    className="form-control"
                                    value={filters.isActive}
                                    onChange={(e) => handleFilterChange('isActive', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Đã khóa</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card shadow mb-4">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Đang tải...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên</th>
                                        <th>Email / SĐT</th>
                                        <th>Vai trò</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày tạo</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                Không có nhân viên nào
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map((emp, index) => (
                                            <tr key={emp._id}>
                                                <td>{(pagination.currentPage - 1) * pagination.limit + index + 1}</td>
                                                <td>
                                                    <div className="employee-info">
                                                        <div className="employee-avatar">
                                                            {emp.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <strong>{emp.name}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>{emp.email}</div>
                                                    <small className="text-muted">{emp.phoneNumber}</small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${emp.role === 'admin' ? 'badge-danger' : 'badge-warning'}`}>
                                                        {emp.role === 'admin' ? 'ADMIN' : 'STAFF'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${emp.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                                        {emp.isActive ? 'Hoạt động' : 'Đã khóa'}
                                                    </span>
                                                    {!emp.isActive && emp.lockedReason && (
                                                        <div className="text-muted small mt-1">
                                                            Lý do: {emp.lockedReason}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{new Date(emp.createdAt).toLocaleDateString('vi-VN')}</td>
                                                <td>
                                                    <div className="btn-group">
                                                        <button
                                                            className="btn btn-sm btn-info"
                                                            onClick={() => handleOpenModal('edit', emp)}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm ${emp.isActive ? 'btn-warning' : 'btn-success'}`}
                                                            onClick={() => handleLockUnlock(emp)}
                                                            title={emp.isActive ? 'Khóa' : 'Mở khóa'}
                                                        >
                                                            <i className={`fas ${emp.isActive ? 'fa-lock' : 'fa-unlock'}`}></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => handleResetPassword(emp)}
                                                            title="Đặt lại mật khẩu"
                                                        >
                                                            <i className="fas fa-key"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(emp)}
                                                            title="Xóa"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                Trang {pagination.currentPage} / {pagination.totalPages}
                            </div>
                            <div className="btn-group">
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    disabled={pagination.currentPage === 1}
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {modalMode === 'create' ? 'Thêm nhân viên mới' : 'Chỉnh sửa nhân viên'}
                            </h5>
                            <button className="close-button" onClick={handleCloseModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {/* Basic Info */}
                                <div className="form-section">
                                    <h6 className="form-section-title">Thông tin cơ bản</h6>

                                    <div className="form-group">
                                        <label>Họ và tên <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Email <span className="text-danger">*</span></label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Số điện thoại <span className="text-danger">*</span></label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Mật khẩu {modalMode === 'create' && <span className="text-danger">*</span>}
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder={modalMode === 'edit' ? 'Để trống nếu không đổi' : 'Tối thiểu 6 ký tự'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={modalMode === 'create'}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Vai trò <span className="text-danger">*</span></label>
                                        <select
                                            className="form-control"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            required
                                        >
                                            <option value="staff">Staff (Nhân viên)</option>
                                            <option value="admin">Admin (Quản trị viên)</option>
                                        </select>
                                        {formData.role === 'admin' && (
                                            <small className="form-text text-muted">
                                                <i className="fas fa-info-circle"></i> Admin có toàn bộ quyền hạn
                                            </small>
                                        )}
                                    </div>
                                </div>

                                {/* Permissions Section - Only show for Staff */}
                                {formData.role === 'staff' && (
                                    <div className="form-section">
                                        <h6 className="form-section-title">Phân quyền chi tiết</h6>
                                        <p className="text-muted small mb-3">
                                            Chọn các quyền hạn mà nhân viên này được phép thực hiện
                                        </p>

                                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                                            <div key={category} className="permission-group">
                                                <h6 className="permission-category">{category}</h6>
                                                <div className="permission-list">
                                                    {perms.map(perm => (
                                                        <label key={perm.value} className="permission-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.permissions.includes(perm.value)}
                                                                onChange={() => handlePermissionToggle(perm.value)}
                                                            />
                                                            <span>{perm.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {formData.permissions.length === 0 && (
                                            <div className="alert alert-warning">
                                                <i className="fas fa-exclamation-triangle"></i> Bạn chưa chọn quyền nào. Nhân viên sẽ không thể truy cập các chức năng quản trị.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modalMode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;
