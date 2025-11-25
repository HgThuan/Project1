import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

export default function Viewnv() {

    const [nhanvien, setData] = useState({});

    const { ma_nhan_vien } = useParams();

    useEffect(() => {
        axios.get(`http://localhost:5001/api/getnv/${ma_nhan_vien}`)
            .then((resq) => setData({ ...resq.data[0] }));
    }, [ma_nhan_vien]);

    return (
        <div>
            <h3 className="mb-0">Thông tin nhân viên</h3>
            <hr />
            <div className="row">
                <div className="col mb-3">
                    <label className="form-label">Mã nhân viên</label>
                    <input type="text" name="ma_nhan_vien" className="form-control" placeholder="Mã nhân viên" value={nhanvien.ma_nhan_vien} readOnly />
                </div>
                <div className="col mb-3">
                    <label className="form-label">Tên nhân viên</label>
                    <input type="text" name="ten_nhan_vien" className="form-control" placeholder="Tên nhân viên" value={nhanvien.ten_nhan_vien} readOnly />
                </div>
            </div>

            <div className="row">
                <div className="col mb-3">
                    <label className="form-label">Giới tính</label>
                    <input type="text" name="gioi_tinh" className="form-control" placeholder="Giới tính" value={nhanvien.gioi_tinh} readOnly />
                </div>
                <div className="col mb-3">
                    <label className="form-label">Ngày sinh</label>
                    <input type="text" name="ngay_sinh" className="form-control" placeholder="Ngày sinh" value={nhanvien.ngay_sinh} readOnly />
                </div>
            </div>
            <div className="row">
                <div className="col mb-3">
                    <label className="form-label">Địa chỉ</label>
                    <input type="text" name="dia_chi" className="form-control" placeholder="Địa chỉ" value={nhanvien.dia_chi} readOnly />
                </div>
                <div className="col mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input type="text" name="sdt" className="form-control" placeholder="Số điện thoại" value={nhanvien.sdt} readOnly />
                </div>

            </div>
            <div className="row">
                <div className="col mb-3">
                    <label className="form-label">Căn cước công dân</label>
                    <input type="text" name="cmnd" className="form-control" placeholder="Created At" value={nhanvien.cmnd} readOnly />
                </div>

            </div>
            <div className="row">
                <div className="col mb-3">
                    <label className="form-label">Ảnh nhân viên</label>
                    <input type="text" name="anh_nhanvien" className="form-control" placeholder="Created At" value={nhanvien.anh_nhanvien} readOnly />
                </div>

            </div>
        </div>
    )
}
