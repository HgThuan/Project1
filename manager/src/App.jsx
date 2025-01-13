import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Indexdm from "./page/Danhmuc/indexdm";
import Sizebar from "./components/Sidebar/sizebar";
import Footer from "./components/Footter/footer";
import Navbar from "./components/Navbar/navbar";
import Createdm from "./page/Danhmuc/createdm";
import Viewdm from "./page/Danhmuc/viewdm";
import Editdm from "./page/Danhmuc/editdm";
import Indexsp from "./page/SanPham/indexsp";
import Createsp from "./page/SanPham/createsp";
import Viewsp from "./page/SanPham/viewsp";
import Indexkh from "./page/KhachHang/indexkh";
import Createkh from "./page/KhachHang/createkh";
import Editkh from "./page/KhachHang/editkh";
import Viewkh from "./page/KhachHang/viewkh";
import Editnv from "./page/NhanVien/editnv";
import Viewnv from "./page/NhanVien/viewnv";
import Indexnv from "./page/NhanVien/indexnv";
import Createnv from "./page/NhanVien/createnv";
import Editsp from "./page/SanPham/editsp";
import Thongke from "./page/ThongKe/thongke";
import Indexhoadon from "./page/HoaDon/indexhoadon";
import IndexHDN from "./page/HoaDonNhap/indexHDN";
import Indexkhohang from "./page/KhoHang/indexkhohang";
import Createkhohang from "./page/KhoHang/createkhohang";
import Editkhohang from "./page/KhoHang/editkhohang";
import Viewkhohang from "./page/KhoHang/viewkhohang";
import Viewhoadon from "./page/HoaDon/viewhoadon";
import TaiKhoan from "./page/TaiKhoan/indextk";
import Createhdn from "./page/HoaDonNhap/createhoadon";
import Viewhoadonnhap from "./page/HoaDonNhap/viewhoadon";
import EditHD from "./page/HoaDon/edithoadon";

export default function App() {
  return (
    <BrowserRouter>
            <ToastContainer />
      <div className="app">


      <div id="wrapper">

        {/* <!-- Sidebar --> */}
       <Sizebar/>

        <div id="content-wrapper" class="d-flex flex-column">

          {/* <!-- Main Content --> */}
          <div id="content">

            {/* <!-- Topbar --> */}
            <Navbar/>

            <div class="container-fluid">
              {/* <!-- Content Row --> */}
            <Routes>
              
              <Route path="/" element={<Thongke/>} />

              <Route path="/Indexdm" element={<Indexdm/>} />
              <Route path="/Themdm" element={<Createdm/>} />
              <Route path="/Updatedm/:ma_danh_muc" element={<Editdm/>} />
              <Route path="/Viewdm/:ma_danh_muc" element={<Viewdm/>} />

              <Route path="/Indexsp" element={<Indexsp/>} />
              <Route path="/Createsp" element={<Createsp/>} />
              <Route path="/Updatesp/:ma_san_pham" element={<Editsp/>} />
              <Route path="/Viewsp/:ma_san_pham" element={<Viewsp/>} />

              <Route path="/Indexkh" element={<Indexkh/>} />
              <Route path="/Createkh" element={<Createkh/>} />
              <Route path="/Updatekh/:ma_khach_hang" element={<Editkh/>} />
              <Route path="/Viewkh/:ma_khach_hang" element={<Viewkh/>} />

              <Route path="/Indexnv" element={<Indexnv/>} />
              <Route path="/Createnv" element={<Createnv/>} />
              <Route path="/Updatenv/:ma_nhan_vien" element={<Editnv/>} />
              <Route path="/Viewnv/:ma_nhan_vien" element={<Viewnv/>} />
              
              <Route path="/Indexhd" element={<Indexhoadon/>} />
              <Route path="/Indexhdn" element={<IndexHDN/>} />

              <Route path="/Indexkhohang" element={<Indexkhohang/>} />
              <Route path="/Createkhohang" element={<Createkhohang/>} />
              <Route path="/Updatekhohang/:ma_kho_hang" element={<Editkhohang/>} />
              <Route path="/Viewkhohang/:ma_kho_hang" element={<Viewkhohang/>} />

              <Route path="/Viewctdh/:ma_don_hang" element={<Viewhoadon/>} />
              <Route path="/Updatedh/:ma_don_hang" element={<EditHD/>} />
              <Route path="/Viewcthdn/:ma_hoa_don" element={<Viewhoadonnhap/>} />
              
              <Route path="/Indextaikhoan" element={<TaiKhoan/>} />

              <Route path="/CreateHDN" element={<Createhdn/>} />
            </Routes>
            </div>

          </div>

          <Footer/>

        </div>

      </div>
    </div>


    </BrowserRouter>
  );
}
