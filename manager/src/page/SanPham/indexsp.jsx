// indexsp.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast, Flip } from 'react-toastify';

export default function Indexsp() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({}); // State để lưu thông tin phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleView = (product) => {
    navigate(`/Viewsp/${product.ma_san_pham}`, { state: { product } });
  };

  const handleEdit = (product) => {
    navigate(`/Updatesp/${product.ma_san_pham}`, { state: { product } });
  };

  const loadData = async (page = 1) => {
    try {
      // API call đã chuẩn hóa
      const res = await axios.get(`http://localhost:5001/api/getallsp?page=${page}&limit=10`);

      // Cập nhật state từ cấu trúc API mới
      setData(res.data.products);
      setPagination(res.data.pagination); // { total, pages, page, limit }
      setCurrentPage(res.data.pagination.page);

    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []); // Chỉ chạy một lần khi component mount

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm

    if (!term) {
      loadData(1); // Tải lại dữ liệu trang 1 nếu ô tìm kiếm rỗng
    } else {
      try {
        // API tìm kiếm cũng trả về cấu trúc chuẩn
        const res = await axios.get(`http://localhost:5001/api/searchsp/${term}?page=1&limit=10`);
        setData(res.data.products);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error('Lỗi tìm kiếm:', err);
      }
    }
  };

  const deleteSP = async (ma_san_pham) => {
    if (window.confirm('Bạn có muốn xóa sản phẩm này không?')) {
      try {
        await axios.delete(`http://localhost:5001/api/deletesp/${ma_san_pham}`);
        toast.success('Xóa sản phẩm thành công!', {
          position: 'top-right',
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Flip,
        });
        // Tải lại dữ liệu trang hiện tại sau khi xóa
        loadData(currentPage);
      } catch (err) {
        toast.error('Lỗi xóa sản phẩm');
      }
    }
  };

  return (
    <div className="card shadow mb-4">
      <div className="d-flex align-items-center justify-content-between card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Dữ Liệu Sản Phẩm</h6>
        <Link to="/Createsp" className="btn btn-primary">Thêm sản phẩm</Link>
      </div>
      <div className="d-flex align-items-center card-header">
        <form className="d-none d-sm-inline-block form-inline mr-auto my-2 my-md-0 mw-100 navbar-search">
          <div className="input-group">
            <label htmlFor="">Tìm kiếm:</label>
            <input
              style={{ marginLeft: '5px' }}
              onChange={handleSearch}
              type="text"
              className="form-control form-control-sm"
              placeholder="nhập dữ liệu tìm kiếm"
              value={searchTerm}
            />
          </div>
        </form>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
            <thead>
              <tr>
                <th>STT</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Chi tiết</th>
                <th>Sửa</th>
                <th>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                // Tính toán STT dựa trên trang hiện tại và giới hạn (limit)
                const stt = (currentPage - 1) * (pagination.limit || 10) + index + 1;
                return (
                  // Sử dụng _id của MongoDB làm key dự phòng
                  <tr key={item.ma_san_pham || item._id}>
                    <td>{stt}</td>
                    <td>
                      <img
                        style={{ borderRadius: '5px' }}
                        src={item.anh_sanpham} // Đường dẫn ảnh đầy đủ từ server
                        width="60"
                        height="60"
                        className="img img-responsive"
                        alt={item.ten_san_pham}
                      />
                    </td>
                    <td>{item.ten_san_pham}</td>
                    <td>{item.soluong}</td>
                    <td>
                      <button onClick={() => handleView(item)} className="btn btn-primary">Chi Tiết</button>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(item)} className="btn btn-warning">Sửa</button>
                    </td>
                    <td>
                      <button onClick={() => deleteSP(item.ma_san_pham)} className="btn btn-danger">Xóa</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-center mt-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => loadData(currentPage - 1)}
            className="btn btn-sm btn-outline-primary mx-1"
          >
            Trước
          </button>
          <span className="align-self-center mx-2">
            Trang {currentPage} / {pagination.pages || 1}
          </span>
          <button
            disabled={currentPage >= (pagination.pages || 1)}
            onClick={() => loadData(currentPage + 1)}
            className="btn btn-sm btn-outline-primary mx-1"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}