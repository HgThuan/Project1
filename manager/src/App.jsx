import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
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
import EmployeeManagement from "./page/NhanVien/EmployeeManagement";
import Editsp from "./page/SanPham/editsp";
import Thongke from "./page/ThongKe/thongke";
import OrderList from "./page/Donhang/OrderList";
import InvoiceList from "./page/HoaDon/InvoiceList";
import Profile from "./page/Profile/Profile";
import AuditLogViewer from "./page/AuditLog/AuditLogViewer";
import Login from "./page/Login/Login";

import Viewhoadon from "./page/HoaDon/viewhoadon";
import TaiKhoan from "./page/TaiKhoan/indextk";
import Edittk from "./page/TaiKhoan/edittk";
import Viewtk from "./page/TaiKhoan/viewtk";
import EditHD from "./page/HoaDon/edithoadon";

// Protected route wrapper component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Main app layout with sidebar and navbar
function AppLayout() {
  return (
    <div className="app">
      <div id="wrapper">
        <Sizebar />
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <Navbar />
            <div className="container-fluid">
              <Routes>
                <Route path="/" element={<Thongke />} />
                <Route path="/Indexdm" element={<Indexdm />} />
                <Route path="/Themdm" element={<Createdm />} />
                <Route path="/Updatedm/:ma_danh_muc" element={<Editdm />} />
                <Route path="/Viewdm/:ma_danh_muc" element={<Viewdm />} />

                <Route path="/Indexsp" element={<Indexsp />} />
                <Route path="/Createsp" element={<Createsp />} />
                <Route path="/Updatesp/:ma_san_pham" element={<Editsp />} />
                <Route path="/Viewsp/:ma_san_pham" element={<Viewsp />} />

                <Route path="/Indexkh" element={<Indexkh />} />
                <Route path="/Createkh" element={<Createkh />} />
                <Route path="/Updatekh/:ma_khach_hang" element={<Editkh />} />
                <Route path="/Viewkh/:ma_khach_hang" element={<Viewkh />} />

                <Route path="/Indexnv" element={<EmployeeManagement />} />
                <Route path="/Createnv" element={<Createnv />} />
                <Route path="/Updatenv/:ma_nhan_vien" element={<Editnv />} />
                <Route path="/Viewnv/:ma_nhan_vien" element={<Viewnv />} />

                <Route path="/Indexdh" element={<OrderList />} />
                <Route path="/Viewctdh/:ma_don_hang" element={<Viewhoadon />} />
                <Route path="/Updatedh/:ma_don_hang" element={<EditHD />} />

                <Route path="/Indexhd" element={<InvoiceList />} />
                <Route path="/Indextaikhoan" element={<TaiKhoan />} />
                <Route path="/sua-tai-khoan/:id" element={<Edittk />} />
                <Route path="/chi-tiet-tai-khoan/:id" element={<Viewtk />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/AuditLogs" element={<AuditLogViewer />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
