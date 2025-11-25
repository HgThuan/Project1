import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../../until/userContext';
import './Profile.css';

const Profile = () => {
    const { user, setUser } = useUser();
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: 'Nam',
        avatar: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const userData = response.data.user;
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phoneNumber: userData.phoneNumber || '',
                    address: userData.address || '',
                    dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
                    gender: userData.gender || 'Nam',
                    avatar: userData.avatar || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', content: 'Không thể tải thông tin người dùng' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5001/api/profile',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage({ type: 'success', content: 'Cập nhật thông tin thành công' });
                // Update user context if needed
                // setUser(response.data.user);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || 'Lỗi khi cập nhật thông tin'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', content: 'Mật khẩu mới không khớp' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5001/api/profile/change-password',
                passwordData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessage({ type: 'success', content: 'Đổi mật khẩu thành công' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || 'Lỗi khi đổi mật khẩu'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('avatar', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5001/api/profile/avatar',
                uploadData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setFormData(prev => ({ ...prev, avatar: response.data.avatar }));
                setMessage({ type: 'success', content: 'Cập nhật ảnh đại diện thành công' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || 'Lỗi khi tải ảnh lên'
            });
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-sidebar">
                <div className="profile-avatar-container" onClick={handleAvatarClick}>
                    <img
                        src={formData.avatar ? `http://localhost:5001${formData.avatar}` : '/Images/default-avatar.png'}
                        alt="Avatar"
                        className="profile-avatar"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                    />
                    <div className="avatar-overlay">
                        <i className="fas fa-camera"></i>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                </div>
                <h2 className="profile-name">{formData.name}</h2>
                <p className="profile-email">{formData.email}</p>
            </div>

            <div className="profile-content">
                <div className="profile-tabs">
                    <div
                        className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        Thông tin cá nhân
                    </div>
                    <div
                        className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        Đổi mật khẩu
                    </div>
                </div>

                {message.content && (
                    <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
                        {message.content}
                    </div>
                )}

                {activeTab === 'info' ? (
                    <form onSubmit={handleUpdateProfile}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={formData.email}
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                type="tel"
                                className="form-control"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input
                                type="text"
                                className="form-control"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                className="form-control"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select
                                className="form-control"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group">
                            <label>Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                className="form-control"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu mới</label>
                            <input
                                type="password"
                                className="form-control"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label>Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                className="form-control"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
