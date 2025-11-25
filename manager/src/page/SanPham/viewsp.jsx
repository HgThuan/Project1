import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';

export default function Viewsp() {
  const formatCurrency = (number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
  };

  const [sanpham, setData] = useState({});
  const { ma_san_pham } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.product) {
      setData(location.state.product);
    } else {
      axios.get(`http://localhost:5001/api/getsp/${ma_san_pham}`)
        .then((resp) => {
          // Fix: API returns { success: true, product: {...} }
          const productData = resp.data.product || resp.data[0];
          setData({ ...productData });
        })
        .catch((err) => console.error('Lỗi tải chi tiết:', err));
    }
  }, [ma_san_pham, location.state]);

  return (
    <div>
      <h3 className="mb-0">Thông tin: {sanpham.ten_san_pham}</h3>
      <hr />

      <div className="row">
        <img
          style={{ borderRadius: '10px', marginLeft: '10px' }}
          src={sanpham.anh_sanpham}
          width="150"
          height="180"
          className="img img-responsive"
          alt={sanpham.ten_san_pham}
        />
        <div className="row-1">
          <div className="col mb-3">
            <label className="form-label">Mã sản phẩm</label>
            <input
              type="text"
              name="ma_san_pham"
              className="form-control"
              placeholder="Mã sản phẩm"
              value={ma_san_pham}
              readOnly
            />
          </div>
          <div className="col mb-3">
            <label className="form-label">Mã danh mục</label>
            <input
              type="text"
              name="ma_danh_muc"
              className="form-control"
              placeholder="Mã danh mục"
              value={sanpham.ma_danh_muc}
              readOnly
            />
          </div>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col mb-3">
          <label className="form-label">Giá</label>
          <input
            type="text"
            name="gia"
            className="form-control"
            placeholder="Giá"
            value={formatCurrency(sanpham.gia || 0)}
            readOnly
          />
        </div>
        <div className="col mb-3">
          <label className="form-label">Số lượng</label>
          <input
            type="text"
            name="soluong"
            className="form-control"
            placeholder="Số lượng"
            value={sanpham.soluong}
            readOnly
          />
        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Số lượng đã bán</label>
            <input
              type="text"
              className="form-control"
              value={sanpham.so_luong_mua || 0}
              readOnly
            />
          </div>
          <div className="col mb-3">
            <label className="form-label">Giảm giá</label>
            <input
              type="text"
              className="form-control"
              value={`${sanpham.giam_gia || 0}%`}
              readOnly
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col mb-3">
          <label className="form-label">Màu sắc</label>
          <input
            type="text"
            name="mau_sac"
            className="form-control"
            placeholder="Màu sắc"
            value={sanpham.mau_sac}
            readOnly
          />
        </div>
        <div className="col mb-3">
          <label className="form-label">Kích cỡ</label>
          <input
            type="text"
            name="size"
            className="form-control"
            placeholder="Kích cỡ"
            value={sanpham.size}
            readOnly
          />
        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-control"
              value={sanpham.mo_ta || ''}
              readOnly
            ></textarea>
          </div>
          <div className="col mb-3">
            <label className="form-label">Đối tượng</label>
            <input
              type="text"
              className="form-control"
              value={sanpham.gioi_tinh || 'Unisex'} // Hiển thị giá trị
              readOnly
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col mb-3">
          <label className="form-label">Mô tả</label>
          <textarea
            className="form-control"
            name="mo_ta"
            placeholder="Mô tả"
            value={sanpham.mo_ta}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
}