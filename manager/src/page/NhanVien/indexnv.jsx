import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { toast, Flip } from 'react-toastify';
export default function Indexnv() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5001/api/getallaccount", getAuthHeaders());
            // Filter only staff and admin
            const staff = response.data.filter(user => user.role === 'staff' || user.role === 'admin');
            setData(staff);
        } catch (error) {
            console.error("Error loading staff", error);
            toast.error("Không thể tải danh sách nhân viên");
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
                const staff = response.data.filter(user => user.role === 'staff' || user.role === 'admin');
                setData(staff);
            } catch (error) {
                console.error("Error searching data", error);
            }
        }
    };

    const deleteNV = async (id) => {
        if (window.confirm("Bạn có muốn xóa nhân viên này không?")) {
            try {
                await axios.delete(`http://localhost:5001/api/deletetk/${id}`, getAuthHeaders());
                toast.success('Xóa nhân viên thành công!', { transition: Flip });
                loadData();
            } catch (error) {
                console.error("Error deleting staff", error);
                toast.error(error.response?.data?.message || "Lỗi khi xóa nhân viên");
            }
        }
    };

    return (
        <div className="card shadow mb-4">
            <div className="d-flex align-items-center justify-content-between card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Quản Lý Nhân Viên (Admin & Staff)</h6>
                <Link to="/Createnv" className="btn btn-primary">Thêm nhân viên</Link>
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
                                <th>Tên nhân viên</th>
                                <th>Email</th>
                                <th>Sđt</th>
                                <th>Vai trò</th>
                                <th>Quyền hạn</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr><td colSpan="7" className="text-center">Không có nhân viên nào</td></tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.ten_nguoi_dung}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phoneNumber}</td>
                                        <td>
                                            <span className={`badge ${item.role === 'admin' ? 'bg-danger' : 'bg-warning'}`}>
                                                {item.role ? item.role.toUpperCase() : 'STAFF'}
                                            </span>
                                        </td>
                                        <td>
                                            {item.permissions && item.permissions.length > 0 ? (
                                                item.permissions.map((perm, idx) => (
                                                    <span key={idx} className="badge badge-info mr-1">{perm}</span>
                                                ))
                                            ) : (
                                                <span className="text-muted small">Không có quyền</span>
                                            )}
                                        </td>
                                        <td>
                                            <Link to={`/Updatenv/${item.id}`} className="btn btn-warning btn-sm mr-1">Sửa</Link>
                                            <button onClick={() => deleteNV(item.id)} className='btn btn-danger btn-sm'>Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
