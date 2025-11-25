import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AuditLogViewer.css';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        action: '',
        resource: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        limit: 50
    });
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [stats, setStats] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [filters, pagination.currentPage]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                ...(filters.search && { search: filters.search }),
                ...(filters.action && { action: filters.action }),
                ...(filters.resource && { resource: filters.resource }),
                ...(filters.status && { status: filters.status }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate })
            });

            const response = await axios.get(
                `http://localhost:5001/api/admin/audit-logs?${params}`,
                getAuthHeaders()
            );

            setLogs(response.data.logs);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages,
                currentPage: response.data.currentPage
            }));
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Không thể tải nhật ký hệ thống');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5001/api/admin/audit-logs/stats',
                getAuthHeaders()
            );
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleViewDetails = async (log) => {
        try {
            const response = await axios.get(
                `http://localhost:5001/api/admin/audit-logs/${log._id}`,
                getAuthHeaders()
            );
            setSelectedLog(response.data.log);
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Error fetching log details:', error);
            toast.error('Không thể tải chi tiết nhật ký');
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams({
                ...(filters.action && { action: filters.action }),
                ...(filters.resource && { resource: filters.resource }),
                ...(filters.status && { status: filters.status }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate })
            });

            const response = await axios.get(
                `http://localhost:5001/api/admin/audit-logs/export?${params}`,
                {
                    ...getAuthHeaders(),
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `AuditLogs_${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Xuất file thành công');
        } catch (error) {
            console.error('Error exporting logs:', error);
            toast.error('Không thể xuất file');
        }
    };

    const getActionBadge = (action) => {
        const colors = {
            'CREATE': 'badge-success',
            'UPDATE': 'badge-info',
            'DELETE': 'badge-danger',
            'LOGIN': 'badge-primary',
            'LOCK': 'badge-warning',
            'UNLOCK': 'badge-success'
        };

        const type = action.split('_')[0];
        return colors[type] || 'badge-secondary';
    };

    const getStatusBadge = (status) => {
        return status === 'success' ? 'badge-success' : 'badge-danger';
    };

    return (
        <div className="audit-log-viewer">
            {/* Header */}
            <div className="audit-header">
                <h1 className="h3 mb-0 text-gray-800">Nhật ký hệ thống</h1>
                <button className="btn btn-success" onClick={handleExport}>
                    <i className="fas fa-file-excel mr-2"></i>
                    Xuất Excel
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="row mb-4">
                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-primary shadow h-100 py-2">
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                            Tổng số nhật ký
                                        </div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                                            {stats.total.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-list fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-success shadow h-100 py-2">
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                            Thành công
                                        </div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                                            {stats.byStatus.find(s => s._id === 'success')?.count || 0}
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-check-circle fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-danger shadow h-100 py-2">
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                            Thất bại
                                        </div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                                            {stats.byStatus.find(s => s._id === 'failed')?.count || 0}
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-exclamation-circle fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card border-left-info shadow h-100 py-2">
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                            Loại hành động
                                        </div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                                            {stats.byAction.length}
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-tasks fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="form-group">
                                <label>Tìm kiếm</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Người dùng, IP..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="form-group">
                                <label>Hành động</label>
                                <select
                                    className="form-control form-control-sm"
                                    value={filters.action}
                                    onChange={(e) => handleFilterChange('action', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="CREATE_STAFF">Tạo nhân viên</option>
                                    <option value="UPDATE_STAFF">Sửa nhân viên</option>
                                    <option value="DELETE_STAFF">Xóa nhân viên</option>
                                    <option value="LOCK_STAFF">Khóa nhân viên</option>
                                    <option value="CREATE_ORDER">Tạo đơn hàng</option>
                                    <option value="UPDATE_ORDER">Sửa đơn hàng</option>
                                    <option value="LOGIN">Đăng nhập</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="form-group">
                                <label>Tài nguyên</label>
                                <select
                                    className="form-control form-control-sm"
                                    value={filters.resource}
                                    onChange={(e) => handleFilterChange('resource', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="staff">Nhân viên</option>
                                    <option value="order">Đơn hàng</option>
                                    <option value="product">Sản phẩm</option>
                                    <option value="invoice">Hóa đơn</option>
                                    <option value="customer">Khách hàng</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="form-group">
                                <label>Từ ngày</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="form-group">
                                <label>Đến ngày</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-1">
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select
                                    className="form-control form-control-sm"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="success">Thành công</option>
                                    <option value="failed">Thất bại</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
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
                            <table className="table table-bordered table-sm">
                                <thead>
                                    <tr>
                                        <th>Thời gian</th>
                                        <th>Người dùng</th>
                                        <th>Hành động</th>
                                        <th>Tài nguyên</th>
                                        <th>IP</th>
                                        <th>Trạng thái</th>
                                        <th>Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                Không có nhật ký nào
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log._id}>
                                                <td className="text-nowrap">
                                                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                                                </td>
                                                <td>
                                                    <div className="font-weight-bold">{log.userName}</div>
                                                    <small className="text-muted">{log.userEmail}</small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getActionBadge(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td>{log.resource}</td>
                                                <td className="text-nowrap">
                                                    <small>{log.ipAddress}</small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusBadge(log.status)}`}>
                                                        {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-info"
                                                        onClick={() => handleViewDetails(log)}
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
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

            {/* Details Modal */}
            {showDetailsModal && selectedLog && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5 className="modal-title">Chi tiết nhật ký</h5>
                            <button className="close-button" onClick={() => setShowDetailsModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Người thực hiện:</strong>
                                    <p>{selectedLog.userName} ({selectedLog.userEmail})</p>
                                </div>
                                <div className="col-md-6">
                                    <strong>Thời gian:</strong>
                                    <p>{new Date(selectedLog.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Hành động:</strong>
                                    <p><span className={`badge ${getActionBadge(selectedLog.action)}`}>{selectedLog.action}</span></p>
                                </div>
                                <div className="col-md-6">
                                    <strong>Tài nguyên:</strong>
                                    <p>{selectedLog.resource}</p>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>IP Address:</strong>
                                    <p>{selectedLog.ipAddress}</p>
                                </div>
                                <div className="col-md-6">
                                    <strong>Trạng thái:</strong>
                                    <p><span className={`badge ${getStatusBadge(selectedLog.status)}`}>
                                        {selectedLog.status === 'success' ? 'Thành công' : 'Thất bại'}
                                    </span></p>
                                </div>
                            </div>
                            <div className="mb-3">
                                <strong>Chi tiết (JSON):</strong>
                                <pre className="json-display">
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                            </div>
                            {selectedLog.errorMessage && (
                                <div className="alert alert-danger">
                                    <strong>Lỗi:</strong> {selectedLog.errorMessage}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogViewer;
