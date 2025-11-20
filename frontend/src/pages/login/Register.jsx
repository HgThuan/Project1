import React, { Fragment, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'; // Import axios

// URL cơ sở của API backend
const API_URL = 'http://localhost:5001/api/auth'; // Thay 5000 bằng PORT của bạn

export default function Register() {
    // 1. Định nghĩa State cho các input
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(''); // State thông báo lỗi/thành công
    const navigate = useNavigate();

    // 2. Logic xử lý Đăng ký
const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
        setMessage('Mật khẩu và Nhập lại mật khẩu không khớp!');
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/register`, {
            name,
            phoneNumber,
            email,
            password,
            confirmPassword,
        });

        setMessage(`✅ ${response.data.message || 'Đăng ký thành công!'}`);
        
        setTimeout(() => {
            navigate('/DangNhap'); 
        }, 2000);

    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Đăng ký thất bại. Vui lòng thử lại.';
        setMessage(`❌ ${errorMessage}`);
    }
};

    return (
        <Fragment>
            <div className="modal-form">
                {/* Thêm onSubmit cho form và loại bỏ className form-login1 (chỉ là CSS) */}
                <form className="form-login1" onSubmit={handleRegister}> 
                    <h2 className="login__heading">Đăng kí tài khoản</h2>
                    <p className="login__text">...</p>
                    
                    {/* Thêm value và onChange cho từng input */}
                    <input type="text" placeholder="Tên của bạn" className="login__input" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="text" placeholder="SĐT của bạn" className="login__input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    <input type="email" placeholder="Email của bạn" className="login__input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Mật khẩu" className="login__input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <input type="password" placeholder="Nhập lại mật khẩu" className="login__input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    
                    {/* Hiển thị thông báo */}
                    {message && <p style={{ margin: '15px 0', color: message.startsWith('❌') ? 'red' : 'green', textAlign: 'center' }}>{message}</p>}

                    {/* Thay đổi div thành button type="submit" hoặc giữ div và gọi handleRegister (nên dùng button) */}
                    <button type="submit" className="btn btn--login">
                        Đăng ký
                    </button>
                    
                    <div className="login-separate">
                    <span></span>
                    Hoặc
                    <span></span>
                    
                </div>
                <div className="btn btn--fb">
                    <p>Đăng ký với Facebook</p>
                    <img src="https://www.coolmate.me/images/facebook.svg" alt=""/>
                </div>
                <div className="btn btn--google">
                    <p>Đăng ký với Google</p>
                    <img src="https://www.coolmate.me/images/google.svg" alt=""/>
                </div>
                    
                    <div className="form-option">
                        <Link to="/DangNhap">
                            <span className="form-option__login1">Đăng nhập</span>
                        </Link>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}