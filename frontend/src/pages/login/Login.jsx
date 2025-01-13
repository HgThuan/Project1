import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../until/userContext';

const Login = () => {
  const userData = [
    {
      id: 1,
      username: 'hoangvanthuan@gmail.com',
      password: '12345',
      name: 'Hoàng Văn Thuấn',
    },
    {
      id: 2,
      username: 'user1@gmail.com',
      password: '12345',
      name: 'Nguyễn Văn A',
    },
    {
      id: 3,
      username: 'user2@gmail.com',
      password: '12345',
      name: 'Lê Thị Bình',
    },
    {
      id: 4,
      username: 'user3@gmail.com',
      password: '12345',
      name: 'Trần Thị C',
    },
    {
      id: 5,
      username: 'user4@gmail.com',
      password: '12345',
      name: 'Lò lựu đạn',
    },
  ];

  const { updateUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username.endsWith('@gmail.com')) {
      setMessage('Tên đăng nhập phải có dạng @gmail.com');
      return;
    }

    const user = userData.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      updateUser({ id: user.id, name: user.name, username: user.username });
      alert(`Xin chào, ${user.name}!`);
      navigate('/');
    } else {
      setMessage('Thông tin tài khoản hoặc mật khẩu không chính xác!');
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
          placeholder="Email/SĐT của bạn"
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
