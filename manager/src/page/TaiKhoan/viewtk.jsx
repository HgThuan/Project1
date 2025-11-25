import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export default function Viewtk() {
    const { id } = useParams();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5001/api/getaccount/${id}`,
                    getAuthHeaders()
                );
                setAccount(response.data);
            } catch (error) {
                console.error('Lỗi khi tải thông tin tài khoản:', error);
                setError('Không thể tải thông tin tài khoản.');
                toast.error('Không thể tải thông tin tài khoản.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAccount();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-4" role="alert">
                {error}
            </div>
        );
    }

    if (!account) {
        return (
            <div className="alert alert-warning m-4" role="alert">
                Không tìm thấy tài khoản.
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex justify-content-between align-items-center">
                    <h6 className="m-0 font-weight-bold text-primary">Chi Tiết Tài Khoản</h6>
                    <Link to="/Indextaikhoan" className="btn btn-secondary btn-sm">
                        Quay lại
                    </Link>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="font-weight-bold">Tên người dùng:</label>
                                <p>{account.name}</p>
                            </div>
                            <div className="form-group">
                                <label className="font-weight-bold">Email:</label>
                                <p>{account.email}</p>
                            </div>
                            <div className="form-group">
                                <label className="font-weight-bold">Số điện thoại:</label>
                                <p>{account.phoneNumber || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="font-weight-bold">Vai trò:</label>
                                <p>
                                    <span className={`badge ${account.role === 'admin' ? 'bg-danger' :
                                        account.role === 'staff' ? 'bg-warning' : 'bg-success'
                                        }`}>
                                        {account.role ? account.role.toUpperCase() : (account.is_admin === 1 ? "ADMIN" : "CUSTOMER")}
                                    </span>
                                </p>
                            </div>
                            <div className="form-group">
                                <label className="font-weight-bold">Trạng thái:</label>
                                <p>
                                    <span className={`badge ${account.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                        {account.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                    </span>
                                </p>
                            </div>
                            {account.role === 'staff' && (
                                <div className="form-group">
                                    <label className="font-weight-bold">Quyền hạn:</label>
                                    <ul>
                                        {account.permissions && account.permissions.length > 0 ? (
                                            account.permissions.map((perm, index) => (
                                                <li key={index}>{perm}</li>
                                            ))
                                        ) : (
                                            <li>Không có quyền hạn đặc biệt</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-3">
                        <Link to={`/sua-tai-khoan/${account.id}`} className="btn btn-warning mr-2">
                            Sửa thông tin
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
