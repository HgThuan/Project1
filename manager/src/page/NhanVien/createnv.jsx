import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const initialState = {
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "staff",
    permissions: []
};

export default function Createnv() {
    const [state, setState] = useState(initialState);
    const { name, email, password, phoneNumber, role, permissions } = state;
    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email || !password || !phoneNumber) {
            toast.error("Vui lòng nhập đủ thông tin bắt buộc");
            return;
        }

        axios.post("http://localhost:5001/api/createstaff", state, getAuthHeaders())
            .then(() => {
                toast.success("Thêm nhân viên thành công!");
                setState(initialState);
                setTimeout(() => navigate("/Indexnv"), 500);
            })
            .catch((err) => toast.error(err.response?.data?.message || "Lỗi khi thêm nhân viên"));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setState({ ...state, [name]: value });
    };

    const handlePermissionChange = (e) => {
        const { value, checked } = e.target;
        let newPermissions = [...permissions];
        if (checked) {
            newPermissions.push(value);
        } else {
            newPermissions = newPermissions.filter(p => p !== value);
        }
        setState({ ...state, permissions: newPermissions });
    };

    return (
        <div>
            <h3 className="mb-0">Thêm nhân viên (Tài khoản)</h3>
            <hr />
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col">
                        <label>Tên nhân viên</label>
                        <input type="text" name="name" onChange={handleInputChange} value={name} className="form-control" placeholder="Nhập tên" required />
                    </div>
                    <div className="col">
                        <label>Email (Tên đăng nhập)</label>
                        <input type="email" name="email" onChange={handleInputChange} value={email} className="form-control" placeholder="Nhập email" required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Mật khẩu</label>
                        <input type="password" name="password" onChange={handleInputChange} value={password} className="form-control" placeholder="Nhập mật khẩu" required />
                    </div>
                    <div className="col">
                        <label>Số điện thoại</label>
                        <input type="text" name="phoneNumber" onChange={handleInputChange} value={phoneNumber} className="form-control" placeholder="Nhập SĐT" required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Vai trò</label>
                        <select name="role" value={role} onChange={handleInputChange} className="form-control">
                            <option value="staff">Nhân viên (Staff)</option>
                            <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Quyền hạn</label>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="manage_orders" id="permOrders" checked={permissions.includes('manage_orders')} onChange={handlePermissionChange} />
                            <label className="form-check-label" htmlFor="permOrders">Quản lý đơn hàng</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="manage_products" id="permProducts" checked={permissions.includes('manage_products')} onChange={handlePermissionChange} />
                            <label className="form-check-label" htmlFor="permProducts">Quản lý sản phẩm</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="manage_customers" id="permCustomers" checked={permissions.includes('manage_customers')} onChange={handlePermissionChange} />
                            <label className="form-check-label" htmlFor="permCustomers">Quản lý khách hàng</label>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="d-grid">
                        <button style={{ marginLeft: '10px' }} type="submit" className="btn btn-primary">Thêm</button>
                    </div>
                </div>
            </form>
        </div>
    )
}
