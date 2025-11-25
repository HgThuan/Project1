import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5001/api/auth/login-admin', {
                email,
                password
            });

            const { token, user } = response.data;

            // Store authentication data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userRole', user.role);

            toast.success(`Xin chào, ${user.name || 'Admin'}!`);
            navigate('/');

        } catch (error) {
            console.error("Login error", error);

            // Handle different error types
            if (error.response?.status === 403) {
                setError(error.response.data.message || 'Bạn không có quyền truy cập vào hệ thống quản lý');
            } else if (error.response?.status === 401) {
                setError('Email hoặc mật khẩu không đúng');
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Đăng nhập thất bại. Vui lòng thử lại sau.');
            }

            toast.error(error.response?.data?.message || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <img
                    src="/logo192.png"
                    alt="Manager Portal Logo"
                    className="login-logo"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23667eea"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="32" font-weight="bold">M</text></svg>';
                    }}
                />
                <h1>Manager Portal</h1>
                <p>Đăng nhập để quản lý hệ thống</p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="admin@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`login-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="#" onClick={(e) => {
                        e.preventDefault();
                        toast.info('Vui lòng liên hệ quản trị viên để được hỗ trợ');
                    }}>
                        Quên mật khẩu?
                    </a>
                </div>
            </div>
        </div>
    );
}
