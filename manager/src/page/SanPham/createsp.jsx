import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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

export default function Createsp() {
  const [state, setState] = useState(initialState);
  const [file, setFile] = useState(null);

  const { ten_san_pham, gia, size, mau_sac, anh_sanpham, ma_danh_muc, soluong, mo_ta, so_luong_mua, giam_gia, gioi_tinh } = state;
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ten_san_pham || !gia || !size || !mau_sac || !ma_danh_muc || !soluong || !mo_ta || !file) {
      toast.error('Vui lòng nhập đầy đủ thông tin và chọn ảnh');
      return;
    }

    const formData = new FormData();
    formData.append('ten_san_pham', ten_san_pham);
    formData.append('gia', gia);
    formData.append('size', size);
    formData.append('mau_sac', mau_sac);
    formData.append('ma_danh_muc', ma_danh_muc);
    formData.append('soluong', soluong);
    formData.append('mo_ta', mo_ta);
    formData.append('anh_sanpham', file);
    formData.append('so_luong_mua', so_luong_mua); 
    formData.append('giam_gia', giam_gia);
    formData.append('gioi_tinh', gioi_tinh);

    try {
      await axios.post('http://localhost:5001/api/createsp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Thêm sản phẩm thành công!');
      setState(initialState);
      setFile(null);
      setTimeout(() => navigate('/Indexsp'), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi thêm sản phẩm');
    }
  };

  return (
    <div>
      <h3 className="mb-0">Thêm sản phẩm</h3>
      <hr />
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="row mb-3">
          <div className="col">
            <input
              type="text"
              name="ten_san_pham"
              onChange={handleInputChange}
              value={ten_san_pham}
              className="form-control"
              placeholder="Tên sản phẩm"
            />
          </div>
          <div className="col">
            <input
              type="text"
              name="gia"
              onChange={handleInputChange}
              value={gia}
              className="form-control"
              placeholder="Giá"
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <input
              type="text"
              name="size"
              onChange={handleInputChange}
              value={size}
              className="form-control"
              placeholder="Kích cỡ"
            />
          </div>
          <div className="col">
            <input
              type="text"
              name="mau_sac"
              onChange={handleInputChange}
              value={mau_sac}
              className="form-control"
              placeholder="Màu sắc"
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <input
              type="file"
              name="anh_sanpham"
              onChange={handleFileChange}
              className="form-control"
              placeholder="Ảnh sản phẩm"
            />
          </div>
          <div className="col">
            <input
              type="text"
              onChange={handleInputChange}
              value={ma_danh_muc}
              className="form-control"
              name="ma_danh_muc"
              placeholder="Mã danh mục"
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col">
            <input
              type="text"
              onChange={handleInputChange}
              value={soluong}
              name="soluong"
              className="form-control"
              placeholder="Số lượng"
            />
          </div>
          <div className="col">
            <textarea
              name="mo_ta"
              onChange={handleInputChange}
              value={mo_ta}
              className="form-control"
              placeholder="Mô tả"
            ></textarea>
          </div>
          <div className="col">
            <input
              type="number"
              name="so_luong_mua"
              onChange={handleInputChange}
              value={so_luong_mua}
              className="form-control"
              placeholder="Số lượng đã bán"
            />
          </div>
          <div className="row mb-3">
          <div className="col">
            <label>Giảm giá (%)</label>
            <select
              name="giam_gia"
              onChange={handleInputChange}
              value={giam_gia}
              className="form-control"
            >
              <option value="0">Không giảm giá</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="50">50%</option>
            </select>
          </div>
          <div className="col">
            <label>Đối tượng</label>
            <select
              name="gioi_tinh"
              onChange={handleInputChange}
              value={gioi_tinh} // Giá trị được kiểm soát
              className="form-control"
            >
              <option value="Unisex">Unisex (Nam/Nữ)</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        </div>
        </div>
        <div className="row">
          <div className="d-grid">
            <button style={{ marginLeft: '10px' }} type="submit" className="btn btn-primary">
              Thêm
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}