import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Hàm này sẽ lấy token từ localStorage và tạo header
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Lấy token
  if (token) {
    return {
      headers: {
        Authorization: `Bearer ${token}`, // Tạo header
      },
    };
  }
  return {};
};

export default function TaiKhoan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Thêm 'getAuthHeaders()' vào lệnh gọi API
      const response = await axios.get(
        'http://localhost:5001/api/getallaccount',
        getAuthHeaders() // <--- GỬI KÈM TOKEN
      );
      console.log('API Response:', response.data); // Debug log
      setData(response.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error.response?.data?.message || error.message);
      setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    if (!searchTerm) {
      loadData();
    } else {
      try {
        setLoading(true);
        // Thêm 'getAuthHeaders()' vào lệnh gọi API
        const response = await axios.get(
          `http://localhost:5001/api/searchtk/${searchTerm}`,
          getAuthHeaders() // <--- GỬI KÈM TOKEN
        );
        setData(response.data);
      } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
        setError('Lỗi khi tìm kiếm dữ liệu.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        await axios.delete(
          `http://localhost:5001/api/deletetk/${id}`,
          getAuthHeaders()
        );
        // Load lại dữ liệu sau khi xóa
        loadData();
        alert('Xóa tài khoản thành công!');
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert('Lỗi khi xóa tài khoản!');
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="card shadow mb-4">
        <div className="d-flex align-items-center justify-content-between card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Dữ Liệu Tài Khoản</h6>
          <Link to="/them-tai-khoan" className="btn btn-primary">Thêm tài khoản</Link>
        </div>

        <div className="d-flex align-items-center card-header">
          <form className="d-none d-sm-inline-block form-inline mr-auto my-2 my-md-0 mw-100 navbar-search">
            <div className="input-group">
              <label htmlFor="searchInput">Tìm kiếm :</label>
              <input
                style={{ marginLeft: '5px' }}
                type="text"
                onChange={handleSearch}
                className="form-control form-control-sm"
                placeholder="nhập dữ liệu tìm kiếm"
                aria-label="Search"
                id="searchInput"
              />
            </div>
          </form>
        </div>

        <div className="card-body">
          {/* Hiển thị loading */}
          {loading && (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Đang tải...</span>
              </div>
              <p>Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Hiển thị lỗi */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên đăng nhập</th>
                  <th>Tên người dùng</th>
                  <th>Mật khẩu</th>
                  <th>Loại tài khoản</th>
                  <th>Chi tiết</th>
                  <th>Sửa</th>
                  <th>Xóa</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>{item.email}</td>
                      <td>{item.ten_nguoi_dung || 'Chưa có thông tin'}</td>
                      <td>••••••••</td>
                      <td>
                        <span className={`badge ${item.role === 'admin' ? 'bg-danger' :
                          item.role === 'staff' ? 'bg-warning' : 'bg-success'
                          }`}>
                          {item.role ? item.role.toUpperCase() : (item.is_admin === 1 ? "ADMIN" : "CUSTOMER")}
                        </span>
                      </td>
                      <td>
                        <Link to={`/chi-tiet-tai-khoan/${item.id}`} className="btn btn-primary btn-sm">
                          Chi Tiết
                        </Link>
                      </td>
                      <td>
                        <Link to={`/sua-tai-khoan/${item.id}`} className="btn btn-warning btn-sm">
                          Sửa
                        </Link>
                      </td>
                      <td>
                        <button
                          type='button'
                          onClick={() => handleDelete(item.id)}
                          className='btn btn-danger btn-sm'
                          // Không cho xóa admin
                          disabled={item.is_admin === 1}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Hiển thị tổng số bản ghi */}
          {data.length > 0 && (
            <div className="mt-3">
              <small className="text-muted">
                Hiển thị {data.length} tài khoản
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}