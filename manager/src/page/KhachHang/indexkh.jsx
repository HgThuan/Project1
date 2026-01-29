import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios';
import { toast, Flip } from 'react-toastify';

export default function Indexkh() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Password reset modal state
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetting, setResetting] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5001/api/getallaccount", getAuthHeaders());
            // Filter only customers
            const customers = response.data.filter(user => user.role === 'customer');
            setData(customers);
        } catch (error) {
            console.error("Error loading customers", error);
            toast.error("Không thể tải danh sách khách hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSearch = async (e) => {
        const searchTerm = e.target.value;
        if (!searchTerm) {
            loadData();
        } else {
            try {
                const response = await axios.get(`http://localhost:5001/api/searchtk/${searchTerm}`, getAuthHeaders());
                const customers = response.data.filter(user => user.role === 'customer');
                setData(customers);
            } catch (error) {
                console.error("Error searching data", error);
            }
        }
    };

    const toggleLock = async (id, currentStatus) => {
        if (window.confirm(`Bạn có chắc muốn ${currentStatus ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
            try {
                await axios.put(`http://localhost:5001/api/update/${id}`, { isActive: !currentStatus }, getAuthHeaders());
                toast.success(`${currentStatus ? 'Khóa' : 'Mở khóa'} thành công!`);
                loadData();
            } catch (error) {
                console.error("Error updating status", error);
                toast.error("Lỗi khi cập nhật trạng thái");
            }
        }
    };

    const handleResetPassword = async () => {
        // Validation
        if (!newPassword || newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setResetting(true);
        try {
            const response = await axios.put(
                `http://localhost:5001/api/users/reset-password/${selectedUser.id}`,
                { newPassword },
                getAuthHeaders()
            );

            if (response.data.success) {
                toast.success('Đặt lại mật khẩu thành công!');
                setShowResetModal(false);
                setNewPassword('');
                setConfirmPassword('');
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            const message = error.response?.data?.message || 'Lỗi khi đặt lại mật khẩu';
            toast.error(message);
        } finally {
            setResetting(false);
        }
    };

    const openResetModal = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setConfirmPassword('');
        setShowResetModal(true);
    };

    return (
        <div className="card shadow mb-4">
            <div className="d-flex align-items-center justify-content-between card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Quản Lý Khách Hàng (User App)</h6>
            </div>
            <div className="d-flex align-items-center card-header">
                <form className="d-none d-sm-inline-block form-inline mr-auto my-2 my-md-0 mw-100 navbar-search">
                    <div className="input-group">
                        <label htmlFor="">Tìm kiếm :</label>
                        <input style={{ marginLeft: '5px' }} type="text" onChange={handleSearch} className="form-control form-control-sm" placeholder="nhập tên hoặc email" aria-label="Search" />
                    </div>
                </form>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên khách hàng</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan="6" className="text-center">Không có khách hàng nào</td></tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.ten_nguoi_dung}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phoneNumber}</td>
                                        <td>
                                            <span className={`badge ${item.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                {item.isActive ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleLock(item.id, item.isActive)}
                                                className={`btn btn-sm ${item.isActive ? 'btn-warning' : 'btn-success'} me-2`}
                                            >
                                                {item.isActive ? 'Khóa' : 'Mở khóa'}
                                            </button>
                                            <button
                                                onClick={() => openResetModal(item)}
                                                className="btn btn-sm btn-info"
                                                title="Đặt lại mật khẩu"
                                            >
                                                Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Password Reset Modal */}
            {showResetModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowResetModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Đặt lại mật khẩu</h5>
                                <button type="button" className="close" onClick={() => setShowResetModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    <strong>Khách hàng:</strong> {selectedUser?.ten_nguoi_dung}
                                </p>
                                <p>
                                    <strong>Email:</strong> {selectedUser?.email}
                                </p>
                                <div className="form-group">
                                    <label htmlFor="newPassword">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowResetModal(false)}
                                    disabled={resetting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleResetPassword}
                                    disabled={resetting}
                                >
                                    {resetting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
