import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../until/userContext';

export default function OrderDetail() {
    const { ma_don_hang } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.id) {
            fetchOrderDetails();
        }
    }, [user, ma_don_hang]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/api/order/${ma_don_hang}?userId=${user.id}`);
            if (response.data.success) {
                setOrder(response.data.order);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            alert("Không thể tải thông tin đơn hàng");
            navigate('/donhang');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
            try {
                await axios.put(`http://localhost:5001/api/order/cancel/${ma_don_hang}`, { userId: user.id });
                alert("Đã hủy đơn hàng thành công");
                fetchOrderDetails(); // Refresh data
            } catch (error) {
                console.error("Error canceling order:", error);
                alert(error.response?.data?.message || "Lỗi khi hủy đơn hàng");
            }
        }
    };

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    const getStatusStep = (status) => {
        // Map status to step index (0-based)
        // 1: Pending, 2: Preparing, 3: Shipping, 4: Delivered, 5: Cancelled
        switch (status) {
            case 1: return 0; // Chờ xác nhận
            case 2: return 1; // Đang chuẩn bị
            case 3: return 2; // Đang giao
            case 4: return 3; // Đã giao
            case 5: return -1; // Đã hủy
            default: return 0;
        }
    };

    if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Đang tải...</div>;
    if (!order) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Không tìm thấy đơn hàng</div>;

    const currentStep = getStatusStep(order.trang_thai);
    const isCancelled = order.trang_thai === 5;

    return (
        <div className="main">
            <div className="container" style={{ padding: '40px 0' }}>
                <div style={{ marginBottom: '20px' }}>
                    <button onClick={() => navigate('/donhang')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d4b73' }}>
                        <i className="fa-solid fa-arrow-left"></i> Quay lại danh sách
                    </button>
                </div>

                <h2 style={{ marginBottom: '30px' }}>Chi tiết đơn hàng: #{order.ma_don_hang}</h2>

                {/* Stepper */}
                <div className="order-stepper" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px', position: 'relative' }}>
                    {isCancelled ? (
                        <div style={{ width: '100%', textAlign: 'center', color: 'red', fontWeight: 'bold', fontSize: '20px' }}>
                            ĐƠN HÀNG ĐÃ BỊ HỦY
                        </div>
                    ) : (
                        ['Chờ xác nhận', 'Đang chuẩn bị', 'Đang giao hàng', 'Giao thành công'].map((label, index) => (
                            <div key={index} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    backgroundColor: index <= currentStep ? '#2d4b73' : '#ddd',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 10px'
                                }}>
                                    {index + 1}
                                </div>
                                <span style={{ color: index <= currentStep ? '#2d4b73' : '#999', fontWeight: index <= currentStep ? 'bold' : 'normal' }}>
                                    {label}
                                </span>
                            </div>
                        ))
                    )}
                    {/* Progress Line (Simplified CSS) */}
                    {!isCancelled && (
                        <div style={{
                            position: 'absolute', top: '20px', left: '12%', right: '12%', height: '2px', backgroundColor: '#ddd', zIndex: 0
                        }}>
                            <div style={{
                                height: '100%', backgroundColor: '#2d4b73',
                                width: `${currentStep * 33.33}%`, transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                    )}
                </div>

                <div className="row">
                    {/* Info Section */}
                    <div className="col p-6">
                        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', height: '100%' }}>
                            <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Thông tin nhận hàng</h3>
                            <p><strong>Người nhận:</strong> {order.ten_khach}</p>
                            <p><strong>Số điện thoại:</strong> {order.sdt}</p>
                            <p><strong>Địa chỉ:</strong> {order.dia_chi}</p>
                            <p><strong>Ghi chú:</strong> {order.ghi_chu || 'Không có'}</p>
                            <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="col p-6">
                        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', height: '100%' }}>
                            <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Thanh toán</h3>
                            <p><strong>Phương thức:</strong> COD (Thanh toán khi nhận hàng)</p> {/* Assuming COD for now as per previous code */}
                            <p><strong>Trạng thái:</strong> {order.trang_thai === 4 ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                            <div style={{ marginTop: '20px', fontSize: '18px' }}>
                                <strong>Tổng tiền: </strong>
                                <span style={{ color: '#ff6b6b', fontSize: '24px' }}>{formatCurrency(order.tong_tien)}</span>
                            </div>

                            {order.trang_thai === 1 && (
                                <button
                                    onClick={handleCancelOrder}
                                    style={{
                                        marginTop: '20px', padding: '10px 20px', backgroundColor: '#fff',
                                        border: '1px solid red', color: 'red', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    Hủy đơn hàng
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Sản phẩm đã mua</h3>
                    <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f5f5f5' }}>
                                <tr>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Sản phẩm</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Đơn giá</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Số lượng</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.orderDetails.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <img src={item.anh_sanpham} alt={item.ten_san_pham} style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px', borderRadius: '4px' }} />
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{item.ten_san_pham}</div>
                                                    <div style={{ color: '#666', fontSize: '14px' }}>{item.mau_sac} / {item.kich_co}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>{formatCurrency(item.gia)}</td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>{item.so_luong}</td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.gia * item.so_luong)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
