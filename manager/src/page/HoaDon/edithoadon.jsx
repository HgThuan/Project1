import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const initiaState = {
  ten_khach: "",
  ngay_dat_hang: "",
  tong_tien: "",
  trang_thai: "",
  dia_chi: "",
  ghi_chu: "",
  sdt: "",
};

export default function EditHD() {

  const [state, setState] = useState(initiaState);


  const { ten_khach, ngay_dat_hang, tong_tien, trang_thai, dia_chi, ghi_chu, sdt } = state;

  const { ma_don_hang } = useParams();

  const navigate = useNavigate();


  useEffect(() => {
    axios.get(`http://localhost:5001/api/gethd/${ma_don_hang}`)
      .then((resp) => setState({ ...resp.data[0] }));
  }, [ma_don_hang]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({ ...state, [name]: value });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!trang_thai) {
      toast.error("Vui lòng nhập đầy đủ thông tin");

    } else {
      if (window.confirm("Bạn có muốn cập nhật thông tin  ?")) {

        axios.put(`http://localhost:5001/api/updatehd/${ma_don_hang}`, {
          trang_thai
        }).then(() => {
          setState({ trang_thai: "" })
        }).catch((err) => toast.error(err.response.data));
        toast.success("Sửa hóa đơn thành công !")
        setTimeout(() => navigate("/Indexhd"), 500);
      }

    }
  }
  return (
    <div>
      <h3 className="mb-0">Cập nhật đơn hàng</h3>
      <hr />
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Tên khách hàng</label>
            <input type="text" name="ten_khach" className="form-control" onChange={handleInputChange} placeholder="Tên khách hàng" value={ten_khach || ""} />
          </div>
          <div className="col mb-3">
            <label className="form-label">Số điện thoại</label>
            <input type="text" name="sdt" className="form-control" onChange={handleInputChange} placeholder="Số điện thoại" value={sdt || ""} />
          </div>
        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Ngày đặt hàng</label>
            <input type="text" name="ngay_dat_hang" className="form-control" onChange={handleInputChange} placeholder="Ngày đặt hàng" value={ngay_dat_hang?.slice(0, 10) || ""} />
          </div>
          <div className="col mb-3">
            <select
              style={{ marginTop: '31px' }}
              name="trang_thai"
              className="form-control"
              onChange={handleInputChange}
              value={trang_thai}
            >
              <option value="2">Đã Duyệt</option>
              <option value="1">Chưa Duyệt</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Địa chỉ</label>
            <input type="text" name="soluong" className="form-control" onChange={handleInputChange} placeholder="Địa chỉ" value={dia_chi || ""} />
          </div>
          <div className="col mb-3">
            <label className="form-label">Tổng tiền</label>
            <input type="text" name="ma_danh_muc" className="form-control" onChange={handleInputChange} placeholder="Tổng tiền" value={tong_tien || ""} />
          </div>
        </div>
        <div className='row'>

          <div className="col mb-3">
            <label className="form-label">Mô tả</label>
            <input type="text" name="ghi_chu" className="form-control" onChange={handleInputChange} placeholder="Ghi chú" value={ghi_chu || ""} />
          </div>
        </div>
        <div className="row">
          <div className="d-grid">
            <button style={{ marginLeft: '10px', marginTop: '30px' }} className="btn btn-warning">Cập nhật</button>
          </div>
          <div className="d-grid">
            <button style={{ marginLeft: '10px', marginTop: '30px' }} className="btn btn-warning">In Đơn </button>
          </div>
        </div>
      </form>
    </div>
  )
}
