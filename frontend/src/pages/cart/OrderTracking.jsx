import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../until/userContext';

export default function OrderHistory() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        // Only fetch orders if user is authenticated
        if (user && user.id) {
            fetchUserOrders();
        }
        // Don't redirect on initial load - let the context load first
    }, [user]);

    const fetchUserOrders = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(`http://localhost:5001/api/orders/user/${user.id}`);

            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            1: { label: 'Chờ xác nhận', color: '#ffa726', bg: '#fff3e0' },
            2: { label: 'Đang chuẩn bị', color: '#42a5f5', bg: '#e3f2fd' },
            3: { label: 'Đang giao', color: '#ff9800', bg: '#fff3e0' },
            4: { label: 'Hoàn thành', color: '#66bb6a', bg: '#e8f5e9' },
            5: { label: 'Đã hủy', color: '#ef5350', bg: '#ffebee' }
        };

        const statusInfo = statusMap[status] || { label: 'Không xác định', color: '#999', bg: '#f5f5f5' };

        return (
            <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                color: statusInfo.color,
                backgroundColor: statusInfo.bg,
                display: 'inline-block'
            }}>
                {statusInfo.label}
            </span>
        );
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5'
        }}>
            <div className="main" style={{ flex: 1 }}>
                <div className="container" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{
                        textAlign: 'center',
                        marginBottom: '40px',
                        fontSize: '28px',
                        color: '#2d4b73',
                        fontWeight: 'bold'
                    }}>
                        <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '10px' }}></i>
                        Lịch sử đơn hàng
                    </h2>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '48px', color: '#2d4b73' }}></i>
                            <p style={{ marginTop: '20px', color: '#666' }}>Đang tải đơn hàng...</p>
                        </div>
                    ) : !user || !user.id ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <i className="fa-solid fa-user-lock" style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                            <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>
                                Vui lòng đăng nhập để xem lịch sử đơn hàng
                            </p>
                            <a
                                href="/DangNhap"
                                style={{
                                    display: 'inline-block',
                                    padding: '12px 24px',
                                    backgroundColor: '#2d4b73',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '4px',
                                    fontWeight: '600'
                                }}
                            >
                                Đăng nhập ngay
                            </a>
                        </div>
                    ) : error ? (
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            <i className="fa-solid fa-box-open" style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                            <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>
                                Bạn chưa có đơn hàng nào
                            </p>
                            <a
                                href="/product"
                                style={{
                                    display: 'inline-block',
                                    padding: '12px 24px',
                                    backgroundColor: '#2d4b73',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '4px',
                                    fontWeight: '600'
                                }}
                            >
                                Khám phá sản phẩm
                            </a>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {orders.map((order) => (
                                <div
                                    key={order.ma_don_hang}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                        overflow: 'hidden',
                                        transition: 'box-shadow 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'}
                                >
                                    {/* Order Header */}
                                    <div
                                        onClick={() => toggleOrderDetails(order.ma_don_hang)}
                                        style={{
                                            padding: '20px',
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr auto',
                                            gap: '20px',
                                            alignItems: 'center',
                                            borderBottom: expandedOrder === order.ma_don_hang ? '1px solid #eee' : 'none'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>Mã đơn hàng</div>
                                            <div style={{ fontWeight: 'bold', color: '#2d4b73' }}>#{order.ma_don_hang}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>Ngày đặt</div>
                                            <div style={{ fontWeight: '600' }}>{formatDate(order.createdAt)}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>Trạng thái</div>
                                            {getStatusBadge(order.trang_thai)}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>Tổng tiền</div>
                                            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#ff6b6b' }}>
                                                {formatCurrency(order.tong_tien)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Details */}
                                    {expandedOrder === order.ma_don_hang && (
                                        <div style={{ padding: '20px', backgroundColor: '#fafafa' }}>
                                            {/* Shipping Info */}
                                            <div style={{ marginBottom: '20px' }}>
                                                <h4 style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>Thông tin giao hàng</h4>
                                                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                                    <p><strong>{order.ten_khach}</strong></p>
                                                    <p>{order.sdt}</p>
                                                    <p>{order.dia_chi}</p>
                                                    {order.ghi_chu && <p style={{ color: '#666', fontStyle: 'italic' }}>Ghi chú: {order.ghi_chu}</p>}
                                                </div>
                                            </div>

                                            {/* Products */}
                                            <div>
                                                <h4 style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>Sản phẩm ({order.orderDetails.length})</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {order.orderDetails.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                display: 'flex',
                                                                padding: '12px',
                                                                backgroundColor: 'white',
                                                                borderRadius: '6px',
                                                                alignItems: 'center',
                                                                gap: '15px'
                                                            }}
                                                        >
                                                            <img
                                                                src={item.anh_sanpham}
                                                                alt={item.ten_san_pham}
                                                                style={{
                                                                    width: '60px',
                                                                    height: '60px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.ten_san_pham}</div>
                                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                                    {item.mau_sac} / {item.kich_co} × {item.so_luong}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontWeight: 'bold', color: '#2d4b73' }}>
                                                                {formatCurrency(item.gia)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
