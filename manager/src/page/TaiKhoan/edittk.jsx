import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }
    return {};
};

export default function Edittk() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        role: 'customer',
        permissions: [],
        isActive: true,
    });

    useEffect(() => {
        const fetchAccount = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `http://localhost:5001/api/getaccount/${id}`,
                    getAuthHeaders()
                );
                const data = response.data;
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || '',
                    role: data.role || 'customer',
                    permissions: data.permissions || [],
                    isActive: data.isActive !== undefined ? data.isActive : true,
                });
            } catch (error) {
                console.error('Lỗi khi tải thông tin tài khoản:', error);
                toast.error('Không thể tải thông tin tài khoản.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAccount();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox' && name === 'isActive') {
            setFormData((prev) => ({ ...prev, isActive: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePermissionChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prev) => {
            const newPermissions = checked
                ? [...prev.permissions, value]
                : prev.permissions.filter((perm) => perm !== value);
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(
                `http://localhost:5001/api/update/${id}`,
                formData,
                getAuthHeaders()
            );
            toast.success('Cập nhật tài khoản thành công!');
            navigate('/Indextaikhoan');
        } catch (error) {
            console.error('Lỗi khi cập nhật tài khoản:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Sửa Tài Khoản</h6>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tên người dùng</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled // Email thường không cho sửa để tránh lỗi logic
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                type="text"
                                className="form-control"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Vai trò</label>
                            <select
                                className="form-control"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="customer">Khách hàng</option>
                                <option value="staff">Nhân viên</option>
                                <option value="admin">Quản trị viên</option>
                            </select>
                        </div>

                        {formData.role === 'staff' && (
                            <div className="form-group">
                                <label>Quyền hạn (Chỉ dành cho nhân viên)</label>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value="manage_products"
                                        checked={formData.permissions.includes('manage_products')}
                                        onChange={handlePermissionChange}
                                        id="perm_products"
                                    />
                                    <label className="form-check-label" htmlFor="perm_products">
                                        Quản lý sản phẩm
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value="manage_orders"
                                        checked={formData.permissions.includes('manage_orders')}
                                        onChange={handlePermissionChange}
                                        id="perm_orders"
                                    />
                                    <label className="form-check-label" htmlFor="perm_orders">
                                        Quản lý đơn hàng
                                    </label>
                                </div>
                                {/* Thêm các quyền khác nếu cần */}
                            </div>
                        )}

                        <div className="form-group form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                id="isActive"
                            />
                            <label className="form-check-label" htmlFor="isActive">
                                Kích hoạt
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary mr-2">
                            Lưu thay đổi
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/Indextaikhoan')}
                        >
                            Hủy
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
