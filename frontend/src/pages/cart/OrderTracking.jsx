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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 6;

    // Cancel order state
    const [showCancelModal, setShowCancelModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [customCancelReason, setCustomCancelReason] = useState('');

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

    // Pagination logic
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        setExpandedOrder(null); // Collapse any expanded order when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelOrder = (ma_don_hang) => {
        setShowCancelModal(ma_don_hang);
        setCancelReason('');
        setCustomCancelReason('');
    };

    const confirmCancelOrder = async () => {
        if (!showCancelModal) return;

        const finalReason = cancelReason === 'custom' ? customCancelReason : cancelReason;

        if (!finalReason || finalReason.trim() === '') {
            alert('Vui lòng nhập lý do hủy đơn');
            return;
        }

        try {
            await axios.post(`http://localhost:5001/api/cancelOrder/${showCancelModal}`, {
                userId: user.id,
                ly_do_huy: finalReason
            });

            // Refresh orders
            fetchUserOrders();
            setShowCancelModal(null);
            setCancelReason('');
            setCustomCancelReason('');
            alert('Đã hủy đơn hàng thành công');
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert(error.response?.data?.message || 'Lỗi khi hủy đơn hàng');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5',
            paddingBottom: '60px'
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
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {currentOrders.map((order) => (
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
                                                        {order.trang_thai === 5 && order.ly_do_huy && (
                                                            <p style={{ color: '#dc3545', marginTop: '10px' }}>
                                                                <strong>Lý do hủy:</strong> {order.ly_do_huy}
                                                                <br />
                                                                <small style={{ color: '#666' }}>(Được hủy bởi: {order.nguoi_huy === 'manager' ? 'Cửa hàng' : 'Bạn'})</small>
                                                            </p>
                                                        )}
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

                                                {/* Cancel Order Button */}
                                                {order.trang_thai === 1 && (
                                                    <div style={{ marginTop: '15px', textAlign: 'right' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelOrder(order.ma_don_hang);
                                                            }}
                                                            style={{
                                                                padding: '10px 20px',
                                                                backgroundColor: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontWeight: '600'
                                                            }}
                                                        >
                                                            <i className="fa fa-times" style={{ marginRight: '5px' }}></i>
                                                            Hủy đơn hàng
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginTop: '40px',
                                    padding: '20px'
                                }}>
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: currentPage === 1 ? '#e0e0e0' : '#2d4b73',
                                            color: currentPage === 1 ? '#999' : 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <i className="fa-solid fa-chevron-left" style={{ marginRight: '8px' }}></i>
                                        Trước
                                    </button>

                                    {/* Page Numbers */}
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNumber = index + 1;
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundColor: currentPage === pageNumber ? '#2d4b73' : 'white',
                                                        color: currentPage === pageNumber ? 'white' : '#2d4b73',
                                                        border: currentPage === pageNumber ? 'none' : '2px solid #2d4b73',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Next Button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: currentPage === totalPages ? '#e0e0e0' : '#2d4b73',
                                            color: currentPage === totalPages ? '#999' : 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Sau
                                        <i className="fa-solid fa-chevron-right" style={{ marginLeft: '8px' }}></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Cancel Reason Modal */}
            {showCancelModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowCancelModal(null)}>
                    <div style={{
                        backgroundColor: 'white', width: '90%', maxWidth: '500px',
                        borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Lý do hủy đơn hàng</h3>
                            <button onClick={() => setShowCancelModal(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Chọn lý do</label>
                                <select
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="">-- Chọn lý do hủy --</option>
                                    <option value="Đổi ý, không muốn mua nữa">Đổi ý, không muốn mua nữa</option>
                                    <option value="Tìm được giá rẻ hơn">Tìm được giá rẻ hơn</option>
                                    <option value="Thay đổi địa chỉ giao hàng">Thay đổi địa chỉ giao hàng</option>
                                    <option value="Thủ tục thanh toán rắc rối">Thủ tục thanh toán rắc rối</option>
                                    <option value="Đặt nhầm sản phẩm">Đặt nhầm sản phẩm</option>
                                    <option value="custom">Khác (nhập lý do)</option>
                                </select>
                            </div>

                            {cancelReason === 'custom' && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nhập lý do cụ thể</label>
                                    <textarea
                                        value={customCancelReason}
                                        onChange={(e) => setCustomCancelReason(e.target.value)}
                                        rows="3"
                                        placeholder="Nhập lý do hủy đơn..."
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setShowCancelModal(null)}
                                style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Đóng
                            </button>
                            <button
                                onClick={confirmCancelOrder}
                                style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                <i className="fa fa-times"></i> Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
