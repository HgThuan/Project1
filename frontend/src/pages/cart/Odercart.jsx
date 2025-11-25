import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../until/userContext';
import { Link } from 'react-router-dom';

export default function OrderCart() {
    const { user } = useUser();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    const loadData = async () => {
        setLoading(true);
        setError('');

        if (!user) {
            setError('Vui lòng đăng nhập để xem đơn hàng');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5001/api/orderDetailsByCustomer/${user.id}`);
            setOrders(response.data);
        } catch (error) {
            console.error('Error loading orders:', error);
            setError(error.response?.status === 404 ? 'Bạn chưa có đơn hàng nào!' : 'Không thể tải đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            1: { label: 'Chờ xác nhận', color: '#ff9800', icon: 'fa-clock' },
            2: { label: 'Đang chuẩn bị', color: '#2196F3', icon: 'fa-box' },
            3: { label: 'Đang giao', color: '#9C27B0', icon: 'fa-truck' },
            4: { label: 'Đã giao', color: '#4CAF50', icon: 'fa-check-circle' },
            5: { label: 'Đã hủy', color: '#f44336', icon: 'fa-times-circle' }
        };
        return statusMap[parseInt(status)] || statusMap[1];
    };

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '48px', color: '#2d4b73' }}></i>
                <p style={{ marginTop: '20px', color: '#666' }}>Đang tải đơn hàng...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <i className="fa-solid fa-user-slash" style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                <h2 style={{ marginBottom: '16px', color: '#333' }}>Bạn chưa đăng nhập</h2>
                <p style={{ marginBottom: '24px', color: '#666' }}>Vui lòng đăng nhập để xem đơn hàng của bạn</p>
                <Link
                    to="/DangNhap"
                    style={{
                        display: 'inline-block',
                        padding: '12px 32px',
                        backgroundColor: '#2d4b73',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: '600'
                    }}
                >
                    Đăng nhập ngay
                </Link>
            </div>
        );
    }

    return (
        <Fragment>
            <div className="container-cart" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', color: '#333' }}>
                    <i className="fa-solid fa-shopping-bag" style={{ marginRight: '12px', color: '#2d4b73' }}></i>
                    Đơn hàng của bạn
                </h2>

                {error && !loading && (
                    <div style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px'
                    }}>
                        <i className="fa-solid fa-inbox" style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                        <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>{error}</p>
                        <Link
                            to="/product"
                            style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                backgroundColor: '#2d4b73',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px'
                            }}
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px'
                    }}>
                        <i className="fa-regular fa-folder-open" style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                        <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>Bạn chưa có đơn hàng nào</p>
                        <Link
                            to="/product"
                            style={{
                                display: 'inline-block',
                                padding: '12px 24px',
                                backgroundColor: '#2d4b73',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px'
                            }}
                        >
                            Bắt đầu mua sắm
                        </Link>
                    </div>
                )}

                <div className='layout-order'>
                    {orders.map((order) => {
                        const statusInfo = getStatusInfo(order.trang_thai);
                        const isExpanded = expandedOrders.has(order.ma_don_hang);

                        return (
                            <div
                                key={order.ma_don_hang}
                                className="order-card"
                                style={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'box-shadow 0.2s',
                                }}
                            >
                                {/* Order Header */}
                                <div
                                    style={{
                                        padding: '20px',
                                        backgroundColor: '#f9f9f9',
                                        borderBottom: '1px solid #e0e0e0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggleOrderExpansion(order.ma_don_hang)}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '6px' }}>
                                            Đơn hàng #{order.ma_don_hang}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            {formatDate(order.ngay_dat_hang)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '6px 12px',
                                                backgroundColor: statusInfo.color,
                                                color: 'white',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                marginBottom: '8px'
                                            }}
                                        >
                                            <i className={`fa-solid ${statusInfo.icon}`} style={{ marginRight: '6px' }}></i>
                                            {statusInfo.label}
                                        </div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d4b73' }}>
                                            {formatCurrency(order.tong_tien)}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details (Expandable) */}
                                <div style={{
                                    maxHeight: isExpanded ? '1000px' : '0',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.3s ease-in-out'
                                }}>
                                    {/* Shipping Info */}
                                    <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
                                        <h4 style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: '12px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: '#2d4b73' }}></i>
                                            Địa chỉ nhận hàng
                                        </h4>
                                        <div style={{ paddingLeft: '26px' }}>
                                            <p style={{ marginBottom: '6px' }}>
                                                <strong>{order.ten_khach}</strong>
                                            </p>
                                            <p style={{ marginBottom: '6px', color: '#666' }}>
                                                SĐT: {order.sdt}
                                            </p>
                                            <p style={{ color: '#666' }}>
                                                {order.dia_chi}
                                            </p>
                                            {order.ghi_chu && (
                                                <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#999', fontSize: '14px' }}>
                                                    Ghi chú: {order.ghi_chu}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div style={{ padding: '20px' }}>
                                        <h4 style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            marginBottom: '16px'
                                        }}>
                                            Sản phẩm ({order.orderDetails?.length || 0} món)
                                        </h4>
                                        {order.orderDetails && order.orderDetails.length > 0 ? (
                                            <div>
                                                {order.orderDetails.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            display: 'flex',
                                                            gap: '16px',
                                                            padding: '12px',
                                                            backgroundColor: '#f9f9f9',
                                                            borderRadius: '6px',
                                                            marginBottom: '12px'
                                                        }}
                                                    >
                                                        <img
                                                            src={item.anh_sanpham}
                                                            alt={item.ten_san_pham}
                                                            style={{
                                                                width: '80px',
                                                                height: '80px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px'
                                                            }}
                                                            loading="lazy"
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: '600', marginBottom: '6px' }}>
                                                                {item.ten_san_pham}
                                                            </div>
                                                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>
                                                                {item.mau_sac} / {item.kich_co}
                                                            </div>
                                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                                Số lượng: {item.so_luong}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontWeight: '600', color: '#2d4b73' }}>
                                                            {formatCurrency(item.gia)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: '#999' }}>Không có sản phẩm nào</p>
                                        )}
                                    </div>
                                </div>

                                {/* Expand/Collapse Button */}
                                <div
                                    style={{
                                        padding: '12px 20px',
                                        textAlign: 'center',
                                        backgroundColor: '#f9f9f9',
                                        cursor: 'pointer',
                                        color: '#2d4b73',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}
                                    onClick={() => toggleOrderExpansion(order.ma_don_hang)}
                                >
                                    <i className={`fa-solid fa-angle-${isExpanded ? 'up' : 'down'}`} style={{ marginRight: '6px' }}></i>
                                    <Link to={`/order/${order.ma_don_hang}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        Xem chi tiết đầy đủ <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Fragment>
    );
}
