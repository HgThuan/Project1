import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                'http://localhost:5001/api/profile',
                getAuthHeaders()
            );
            setUser(response.data.user);
            setFormData({
                name: response.data.user.name,
                phoneNumber: response.data.user.phoneNumber
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Không thể tải thông tin cá nhân');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(
                'http://localhost:5001/api/profile',
                formData,
                getAuthHeaders()
            );
            setUser(response.data.user);
            setEditMode(false);
            toast.success('Cập nhật thông tin thành công');

            // Update localStorage if needed
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...storedUser,
                name: response.data.user.name
            }));
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            await axios.put(
                'http://localhost:5001/api/profile/change-password',
                passwordData,
                getAuthHeaders()
            );
            toast.success('Đổi mật khẩu thành công');
            setShowPasswordForm(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const getRoleBadgeClass = (role) => {
        return role === 'admin' ? 'badge-danger' : 'badge-warning';
    };

    const getPermissionLabel = (permission) => {
        const labels = {
            'view_customer': 'Xem khách hàng',
            'manage_customer': 'Quản lý khách hàng',
            'view_order': 'Xem đơn hàng',
            'manage_order': 'Quản lý đơn hàng',
            'cancel_order': 'Hủy đơn hàng',
            'approve_order': 'Duyệt đơn hàng',
            'view_product': 'Xem sản phẩm',
            'manage_product': 'Quản lý sản phẩm',
            'view_invoice': 'Xem hóa đơn',
            'manage_invoice': 'Quản lý hóa đơn',
            'view_reports': 'Xem báo cáo',
            'view_analytics': 'Xem thống kê',
            'view_staff': 'Xem nhân viên',
            'manage_staff': 'Quản lý nhân viên',
            'view_audit_logs': 'Xem nhật ký'
        };
        return labels[permission] || permission;
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Đang tải...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-page">
                <div className="alert alert-danger">
                    Không tìm thấy thông tin người dùng
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1 className="h3 mb-0 text-gray-800">Thông tin cá nhân</h1>
            </div>

            <div className="row">
                {/* Left Column - Profile Info */}
                <div className="col-lg-4">
                    <div className="card shadow mb-4">
                        <div className="card-body text-center">
                            <div className="profile-avatar-large">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h4 className="mt-3 mb-1">{user.name}</h4>
                            <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                                {user.role === 'admin' ? 'ADMIN' : 'STAFF'}
                            </span>
                            <div className="mt-3">
                                <p className="text-muted mb-1">
                                    <i className="fas fa-envelope mr-2"></i>
                                    {user.email}
                                </p>
                                <p className="text-muted mb-1">
                                    <i className="fas fa-phone mr-2"></i>
                                    {user.phoneNumber}
                                </p>
                                <p className="text-muted mb-0">
                                    <i className="fas fa-calendar mr-2"></i>
                                    Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Card */}
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                                Quyền hạn của bạn
                            </h6>
                        </div>
                        <div className="card-body">
                            {user.role === 'admin' ? (
                                <div className="alert alert-info mb-0">
                                    <i className="fas fa-crown mr-2"></i>
                                    Bạn có toàn bộ quyền quản trị viên
                                </div>
                            ) : (
                                <div className="permission-list-readonly">
                                    {user.permissions && user.permissions.length > 0 ? (
                                        user.permissions.map((perm, idx) => (
                                            <div key={idx} className="permission-item">
                                                <i className="fas fa-check-circle text-success mr-2"></i>
                                                {getPermissionLabel(perm)}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted mb-0">Chưa có quyền nào</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Edit Forms */}
                <div className="col-lg-8">
                    {/* Edit Profile Card */}
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-primary">
                                Chỉnh sửa thông tin
                            </h6>
                            {!editMode && (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => setEditMode(true)}
                                >
                                    <i className="fas fa-edit mr-1"></i>
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleUpdateProfile}>
                                <div className="form-group">
                                    <label>Họ và tên</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={!editMode}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={user.email}
                                        disabled
                                    />
                                    <small className="form-text text-muted">
                                        Email không thể thay đổi
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        disabled={!editMode}
                                        required
                                    />
                                </div>

                                {editMode && (
                                    <div className="form-group mb-0">
                                        <button type="submit" className="btn btn-primary mr-2">
                                            <i className="fas fa-save mr-1"></i>
                                            Lưu thay đổi
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setEditMode(false);
                                                setFormData({
                                                    name: user.name,
                                                    phoneNumber: user.phoneNumber
                                                });
                                            }}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-primary">
                                Đổi mật khẩu
                            </h6>
                            {!showPasswordForm && (
                                <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => setShowPasswordForm(true)}
                                >
                                    <i className="fas fa-key mr-1"></i>
                                    Đổi mật khẩu
                                </button>
                            )}
                        </div>
                        {showPasswordForm && (
                            <div className="card-body">
                                <form onSubmit={handleChangePassword}>
                                    <div className="form-group">
                                        <label>Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                            minLength={6}
                                        />
                                        <small className="form-text text-muted">
                                            Tối thiểu 6 ký tự
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label>Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group mb-0">
                                        <button type="submit" className="btn btn-warning mr-2">
                                            <i className="fas fa-key mr-1"></i>
                                            Đổi mật khẩu
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setPasswordData({
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                });
                                            }}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
