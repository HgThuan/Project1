import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const initiaState = {
    ten_nhan_vien: "",
    gioi_tinh: "",
    ngay_sinh: "",
    dia_chi: "",
    sdt: "",
    cmnd: "",
    anh_nhanvien: ""
}

export default function Editnv() {

    const [state, setState] = useState(initiaState);

    const [file, setFile] = useState(null);

    const { ten_nhan_vien, gioi_tinh, dia_chi, ngay_sinh, sdt, cmnd, anh_nhanvien } = state;

    const { ma_nhan_vien } = useParams();

    const navigate = useNavigate();

    console.log(state)

    useEffect(() => {
        axios.get(`http://localhost:5001/api/getnv/${ma_nhan_vien}`)
            .then((resp) => setState({ ...resp.data[0] }));
    }, [ma_nhan_vien]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setState({ ...state, [name]: value });
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        setState({ ...state, anh_nhanvien: `/images/${file.name}` });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!ten_nhan_vien || !gioi_tinh || !dia_chi || !ngay_sinh || !sdt || !cmnd || !anh_nhanvien) {
            toast.error("Vui lòng nhập đủ thông tin ")
        } else {
            if (window.confirm("Bạn có muốn cập nhật thông tin  ?")) {
                axios.put(`http://localhost:5001/api/updatenv/${ma_nhan_vien}`, {
                    ten_nhan_vien, gioi_tinh, dia_chi, ngay_sinh, sdt, cmnd, anh_nhanvien
                }).then(() => { setState({ ten_nhan_vien: "", gioi_tinh: "", ngay_sinh: "", dia_chi: "", sdt: "", cmnd: "", anh_nhanvien: "" }) })
                    .catch((err) => toast.error(err.response.data));
                toast.success("Sửa nhân viên thành công !")
                setTimeout(() => navigate("/Indexnv"), 500);
            }
        }
    }

    return (
        <div>
            <h1 className="mb-0">Cập nhật nhân viên</h1>
            <hr />
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row">
                    <div className="col mb-3">
                        <label className="form-label">Tên nhân viên</label>
                        <input type="text" name="ten_nhan_vien" onChange={handleInputChange} value={ten_nhan_vien || ""} className="form-control" placeholder="Tên nhân viên" />
                    </div>
                    <div className="col mb-3">
                        <label className="form-label">Giới tính</label>
                        <input type="text" name="gioi_tinh" onChange={handleInputChange} value={gioi_tinh || ""} className="form-control" placeholder="Giới tính" />
                    </div>
                </div>
                <div className="row">
                    <div className="col mb-3">
                        <label className="form-label">Ngày sinh</label>
                        <input type="date" name="ngay_sinh" onChange={handleInputChange} value={ngay_sinh || ""} className="form-control" placeholder="Ngày sinh" />
                    </div>
                    <div className="col mb-3">
                        <label className="form-label">Địa chỉ</label>
                        <input type="text" name="dia_chi" onChange={handleInputChange} value={dia_chi || ""} className="form-control" placeholder="Địa chỉ" />
                    </div>

                </div>
                <div className="row">
                    <div className="col mb-3">
                        <label className="form-label">Số điện thoại</label>
                        <input type="text" name="sdt" onChange={handleInputChange} value={sdt || ""} className="form-control" placeholder="Số điện thoại" />
                    </div>
                    <div className="col mb-3">
                        <label className="form-label">Căn cước công dân</label>
                        <input type="text" name="cmnd" onChange={handleInputChange} value={cmnd || ""} className="form-control" placeholder="Căn cước công dân" />
                    </div>
                </div>
                <div className="row">
                    <div className="col mb-3">
                        <label className="form-label">Ảnh nhân viên</label>
                        <input type="file" name="anh_nhanvien" onChange={handleFileChange} className="form-control" placeholder="Ảnh nhân viên" readOnly />
                    </div>
                </div>
                <div className="row">
                    <div className="d-grid">
                        <button style={{ marginLeft: '10px' }} className="btn btn-warning">Cập nhật</button>
                    </div>
                </div>
            </form>
        </div>
    )
}
