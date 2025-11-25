import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialState = {
  ten_san_pham: '',
  gia: '',
  size: '',
  mau_sac: '',
  anh_sanpham: '',
  ma_danh_muc: '',
  soluong: '',
  mo_ta: '',
  so_luong_mua: '0',
  giam_gia: '0',
  gioi_tinh: 'Unisex',
};

export default function Editsp() {
  const [state, setState] = useState(initialState);
  const [file, setFile] = useState(null);
  const { ten_san_pham, gia, size, mau_sac, anh_sanpham, ma_danh_muc, soluong, mo_ta, so_luong_mua, giam_gia, gioi_tinh } = state;
  const { ma_san_pham } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.product) {
      setState(prevState => ({ ...prevState, ...location.state.product }));
    } else {
      axios.get(`http://localhost:5001/api/getsp/${ma_san_pham}`)
        .then((resp) => {
          // Fix: API returns { success: true, product: {...} }
          // If it returns an array in some cases, handle that too, but based on controller it returns .product
          const productData = resp.data.product || resp.data[0];
          setState(prevState => ({ ...prevState, ...productData }));
        })
        .catch((err) => console.error('Lỗi tải dữ liệu:', err));
    }
  }, [ma_san_pham, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ten_san_pham || !gia || !size || !mau_sac || !ma_danh_muc || !soluong || !mo_ta) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (window.confirm('Bạn có muốn cập nhật thông tin?')) {
      const formData = new FormData();
      formData.append('ten_san_pham', ten_san_pham);
      formData.append('gia', gia);
      formData.append('size', size);
      formData.append('mau_sac', mau_sac);
      formData.append('ma_danh_muc', ma_danh_muc);
      formData.append('soluong', soluong);
      formData.append('mo_ta', mo_ta);
      formData.append('so_luong_mua', so_luong_mua || 0);
      formData.append('giam_gia', giam_gia || 0);
      formData.append('gioi_tinh', gioi_tinh || 'Unisex');
      if (file) {
        formData.append('anh_sanpham', file);
      } else {
        formData.append('anh_sanpham', anh_sanpham); // Giữ ảnh cũ nếu không upload mới
      }

      try {
        await axios.put(`http://localhost:5001/api/updatesp/${ma_san_pham}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Cập nhật thành công!');
        setTimeout(() => navigate('/Indexsp'), 500);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Lỗi cập nhật');
      }
    }
  };

  return (
    <div>
      <h3 className="mb-0">Cập nhật sản phẩm</h3>
      <hr />
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Tên sản phẩm</label>
            <input
              type="text"
              name="ten_san_pham"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Tên sản phẩm"
              value={ten_san_pham}
            />
          </div>
          <div className="col mb-3">
            <label className="form-label">Giá tiền</label>
            <input
              type="text"
              name="gia"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Giá tiền"
              value={gia}
            />
          </div>
        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Kích cỡ</label>
            <input
              type="text"
              name="size"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Kích cỡ"
              value={size}
            />
          </div>
          <div className="col mb-3">
            <label className="form-label">Màu sắc</label>
            <input
              type="text"
              name="mau_sac"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Màu sắc"
              value={mau_sac}
            />
          </div>
        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Số lượng</label>
            <input
              type="text"
              name="soluong"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Số lượng"
              value={soluong}
            />
          </div>
          <div className="col mb-3">
            <label className="form-label">Mã danh mục</label>
            <input
              type="text"
              name="ma_danh_muc"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Mã danh mục"
              value={ma_danh_muc}
            />
          </div>
        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Mô tả</label>
            <input
              type="text"
              name="mo_ta"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Mô tả"
              value={mo_ta}
            />
          </div>
        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Số lượng đã bán</label>
            <input
              type="number"
              name="so_luong_mua"
              className="form-control"
              onChange={handleInputChange}
              placeholder="Số lượng đã bán"
              value={so_luong_mua || 0}
            />
          </div>
          <div className="col mb-3">
            <label className="form-label">Giảm giá (%)</label>
            <select
              name="giam_gia"
              className="form-control"
              onChange={handleInputChange}
              value={giam_gia || 0}
            >
              <option value="0">Không giảm giá</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="50">50%</option>
            </select>
          </div>

        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Đối tượng</label>
            <select
              name="gioi_tinh"
              className="form-control"
              onChange={handleInputChange}
              value={gioi_tinh || 'Unisex'} // Dùng || để tránh lỗi khi data là null
            >
              <option value="Unisex">Unisex (Nam/Nữ)</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div className="col mb-3">
            {/* Để trống cho cân bằng layout */}
          </div>
        </div>
        <div className="row">
          <img
            style={{ borderRadius: '10px', marginLeft: '10px' }}
            src={anh_sanpham}
            width="150"
            height="180"
            className="img img-responsive"
            alt="Ảnh sản phẩm"
          />
          <div className="col mb-3">
            <label className="form-label">Ảnh sản phẩm</label>
            <input
              type="file"
              name="anh_sanpham"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className="row">
          <div className="d-grid">
            <button style={{ marginLeft: '10px', marginTop: '30px' }} className="btn btn-warning">
              Cập nhật
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}