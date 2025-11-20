
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../until/userContext';
import axios from 'axios'; 
const API_URL = 'http://localhost:5001/api/auth';

const Login = () => {
  // Xóa mảng userData cứng
  const { updateUser } = useUser();
  const [username, setUsername] = useState(''); // Đây thực chất là email
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 3. Cập nhật hàm handleLogin
const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: username,
        password: password,
      });

      // 1. LẤY TOKEN VÀ USER TỪ RESPONSE
      const { token, user } = response.data;

      // 2. LƯU VÀO LOCALSTORAGE (ĐÂY LÀ BƯỚC QUAN TRỌNG NHẤT)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      updateUser({ id: user.id, name: user.name, username: user.username, is_admin: user.is_admin });
      alert(`Xin chào, ${user.name}!`);
      navigate('/');

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="modal-form">
      <div className="form-login">
        <h2 className="login__heading">Đăng nhập</h2>
        <p className="login__text">
          Nếu đã từng mua hàng trên Website trước đây, bạn có thể dùng tính năng{' '}
          <a href="#">"Lấy mật khẩu"</a> để có thể truy cập vào tài khoản bằng email nhé.
        </p>

        <input
          type="text"
          id="username"
          placeholder="Email của bạn" // Đổi placeholder cho rõ ràng
          className="login__input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          id="password"
          placeholder="Mật khẩu"
          className="login__input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && <p style={{ marginBottom: '15px', color: 'red' }} className="login__message">{message}</p>}

        <div className="btn btn--login" onClick={handleLogin}>
          Đăng nhập
        </div>

        {/* ...Phần còn lại của JSX giữ nguyên... */}
        <div className="login-separate">
          <span></span>
          Hoặc
          <span></span>
        </div>
        <div className="btn btn--fb">
          <p>Đăng nhập với Facebook</p>
          <img src="https://www.coolmate.me/images/facebook.svg" alt="" />
        </div>
        <div className="btn btn--google">
          <p>Đăng nhập với Google</p>
          <img src="https://www.coolmate.me/images/google.svg" alt="" />
        </div>

        <div className="form-option">
          <Link to="/DangKy">
            <span className="form-option__login">Đăng ký tài khoản mới</span>
          </Link>
          <span>Quên mật khẩu</span>
        </div>
      </div>
    </div>
  );
};

export default Login;