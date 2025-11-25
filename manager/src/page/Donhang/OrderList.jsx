import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderList.css';
import { toast } from 'react-toastify';

export default function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(null);

    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    // Invoice form state
    const [invoiceData, setInvoiceData] = useState({
        ten_khach: '',
        sdt: '',
        dia_chi: '',
        ghi_chu: '',
        tong_tien: 0,
        orderDetails: []
    });

    useEffect(() => {
        fetchOrders();
    }, [page, status, startDate, endDate]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                search,
                status,
                startDate,
                endDate
            };
            const response = await axios.get('http://localhost:5001/api/allOrders', { params });
            setOrders(response.data.orders);
            setTotalPages(response.data.totalPages);
            setTotalOrders(response.data.totalOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchOrders();
    };

    const handleStatusChange = async (ma_don_hang, newStatus) => {
        try {
            await axios.put(`http://localhost:5001/api/updateOrder/${ma_don_hang}`, {
                trang_thai: parseInt(newStatus),
                isAdmin: true // Admin can change any status
            });
            fetchOrders();
            toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
        }
    };

    const handleSoftDelete = async (ma_don_hang) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5001/api/deleteOrder/${ma_don_hang}`);
            fetchOrders();
            toast.success('Đã hủy đơn hàng thành công!');
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Lỗi khi hủy đơn hàng');
        }
    };

    const openInvoiceModal = (order) => {
        setInvoiceData({
            ma_don_hang: order.ma_don_hang,
            ten_khach: order.ten_khach,
            sdt: order.sdt,
            dia_chi: order.dia_chi,
            ghi_chu: order.ghi_chu || '',
            tong_tien: order.tong_tien,
            orderDetails: order.orderDetails || []
        });
        setShowInvoiceModal(order);
    };

    const handleInvoiceInputChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAndPrint = async () => {
        try {
            // Update order information with customer data
            await axios.put(`http://localhost:5001/api/approveOrder/${invoiceData.ma_don_hang}`, {
                ten_khach: invoiceData.ten_khach,
                sdt: invoiceData.sdt,
                dia_chi: invoiceData.dia_chi,
                ghi_chu: invoiceData.ghi_chu
            });

            // Trigger print dialog
            window.print();

            setShowInvoiceModal(null);
            fetchOrders();
            toast.success('Đã duyệt và in hóa đơn thành công!');
        } catch (error) {
            console.error('Error saving invoice:', error);
            toast.error('Lỗi khi lưu hóa đơn');
        }
    };

    const getStatusLabel = (status) => {
        const statuses = {
            1: { label: 'Chưa duyệt', class: 'status-pending', color: '#ffc107' },
            2: { label: 'Đã duyệt', class: 'status-processing', color: '#17a2b8' },
            3: { label: 'Đang giao', class: 'status-shipping', color: '#007bff' },
            4: { label: 'Đã giao', class: 'status-completed', color: '#28a745' },
            5: { label: 'Đã hủy', class: 'status-cancelled', color: '#dc3545' }
        };
        return statuses[status] || { label: 'Không xác định', class: '', color: '#6c757d' };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="order-list-container" style={{ padding: '20px' }}>
            <h2 className="page-title" style={{ marginBottom: '20px', color: '#2d4b73' }}>Quản lý Đơn hàng</h2>

            {/* Toolbar */}
            <div className="toolbar" style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end'
            }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tìm kiếm</label>
                    <form onSubmit={handleSearch} style={{ display: 'flex' }}>
                        <input
                            type="text"
                            placeholder="Mã ĐH hoặc Tên khách..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px 0 0 4px' }}
                        />
                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#2d4b73', color: 'white', border: 'none', borderRadius: '0 4px 4px 0' }}>
                            <i className="fa fa-search"></i>
                        </button>
                    </form>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Trạng thái</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '150px' }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="1">Chưa duyệt</option>
                        <option value="2">Đã duyệt</option>
                        <option value="3">Đang giao</option>
                        <option value="4">Đã giao</option>
                        <option value="5">Đã hủy</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Từ ngày</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Đến ngày</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="orders-table-wrapper" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Mã ĐH</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Khách hàng</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Ngày đặt</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Tổng tiền</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Trạng thái</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center' }}>Đang tải dữ liệu...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center' }}>Không tìm thấy đơn hàng nào</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.ma_don_hang} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px' }}><strong>{order.ma_don_hang}</strong></td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{order.ten_khach}</div>
                                        <div style={{ fontSize: '13px', color: '#666' }}>{order.sdt}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>{formatDate(order.ngay_dat_hang)}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#2d4b73' }}>{formatCurrency(order.tong_tien)}</td>
                                    <td style={{ padding: '15px' }}>
                                        <select
                                            value={order.trang_thai}
                                            onChange={(e) => handleStatusChange(order.ma_don_hang, e.target.value)}
                                            style={{
                                                padding: '5px 10px', borderRadius: '20px', border: 'none',
                                                backgroundColor: getStatusLabel(order.trang_thai).color, color: 'white',
                                                fontWeight: 'bold', cursor: 'pointer', fontSize: '12px'
                                            }}
                                        >
                                            <option value="1" style={{ color: 'black' }}>Chưa duyệt</option>
                                            <option value="2" style={{ color: 'black' }}>Đã duyệt</option>
                                            <option value="3" style={{ color: 'black' }}>Đang giao</option>
                                            <option value="4" style={{ color: 'black' }}>Đã giao</option>
                                            <option value="5" style={{ color: 'black' }}>Đã hủy</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                style={{
                                                    padding: '6px 12px', backgroundColor: '#6c757d', color: 'white',
                                                    border: 'none', borderRadius: '4px', cursor: 'pointer'
                                                }}
                                                title="Chi tiết"
                                            >
                                                <i className="fa fa-eye"></i>
                                            </button>
                                            <button
                                                onClick={() => openInvoiceModal(order)}
                                                style={{
                                                    padding: '6px 12px', backgroundColor: '#28a745', color: 'white',
                                                    border: 'none', borderRadius: '4px', cursor: 'pointer'
                                                }}
                                                title="Duyệt"
                                            >
                                                <i className="fa fa-check"></i>
                                            </button>
                                            <button
                                                onClick={() => handleSoftDelete(order.ma_don_hang)}
                                                style={{
                                                    padding: '6px 12px', backgroundColor: '#dc3545', color: 'white',
                                                    border: 'none', borderRadius: '4px', cursor: 'pointer'
                                                }}
                                                title="Xóa"
                                            >
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee' }}>
                    <div>Hiển thị {orders.length} / {totalOrders} đơn hàng</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                style={{
                                    padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer',
                                    backgroundColor: page === p ? '#2d4b73' : 'white', color: page === p ? 'white' : 'black'
                                }}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setSelectedOrder(null)}>
                    <div style={{
                        backgroundColor: 'white', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
                        borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Chi tiết đơn hàng #{selectedOrder.ma_don_hang}</h3>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                                    <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#2d4b73' }}>Thông tin khách hàng</h4>
                                    <p style={{ margin: '5px 0' }}><strong>Tên:</strong> {selectedOrder.ten_khach}</p>
                                    <p style={{ margin: '5px 0' }}><strong>SĐT:</strong> {selectedOrder.sdt}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Địa chỉ:</strong> {selectedOrder.dia_chi}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Ghi chú:</strong> {selectedOrder.ghi_chu || 'Không có'}</p>
                                </div>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                                    <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#2d4b73' }}>Thông tin thanh toán</h4>
                                    <p style={{ margin: '5px 0' }}><strong>Tổng tiền:</strong> <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>{formatCurrency(selectedOrder.tong_tien)}</span></p>
                                    <p style={{ margin: '5px 0' }}><strong>Phương thức:</strong> Thanh toán khi nhận hàng (COD)</p>
                                    <p style={{ margin: '5px 0' }}><strong>Ngày đặt:</strong> {formatDate(selectedOrder.ngay_dat_hang)}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Trạng thái:</strong> {getStatusLabel(selectedOrder.trang_thai).label}</p>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '10px' }}>Danh sách sản phẩm</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#eee' }}>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Sản phẩm</th>
                                        <th style={{ padding: '10px', textAlign: 'center' }}>Đơn giá</th>
                                        <th style={{ padding: '10px', textAlign: 'center' }}>Số lượng</th>
                                        <th style={{ padding: '10px', textAlign: 'right' }}>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.orderDetails?.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
                                                <img src={item.anh_sanpham} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px', borderRadius: '4px' }} />
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{item.ten_san_pham}</div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>{item.mau_sac} / {item.kich_co}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>{formatCurrency(item.gia)}</td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>{item.so_luong}</td>
                                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.gia * item.so_luong)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ padding: '20px', borderTop: '1px solid #eee', textAlign: 'right' }}>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice/Approval Modal */}
            {showInvoiceModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowInvoiceModal(null)}>
                    <div className="invoice-modal" style={{
                        backgroundColor: 'white', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto',
                        borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Duyệt đơn hàng & In hóa đơn #{invoiceData.ma_don_hang}</h3>
                            <button onClick={() => setShowInvoiceModal(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tên khách hàng</label>
                                    <input
                                        type="text"
                                        name="ten_khach"
                                        value={invoiceData.ten_khach}
                                        onChange={handleInvoiceInputChange}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="sdt"
                                        value={invoiceData.sdt}
                                        onChange={handleInvoiceInputChange}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Địa chỉ giao hàng</label>
                                <input
                                    type="text"
                                    name="dia_chi"
                                    value={invoiceData.dia_chi}
                                    onChange={handleInvoiceInputChange}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Ghi chú</label>
                                <textarea
                                    name="ghi_chu"
                                    value={invoiceData.ghi_chu}
                                    onChange={handleInvoiceInputChange}
                                    rows="3"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>

                            <h4 style={{ marginBottom: '10px' }}>Danh sách sản phẩm</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee', marginBottom: '20px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#eee' }}>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>Sản phẩm</th>
                                        <th style={{ padding: '10px', textAlign: 'center' }}>Đơn giá</th>
                                        <th style={{ padding: '10px', textAlign: 'center' }}>Số lượng</th>
                                        <th style={{ padding: '10px', textAlign: 'right' }}>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.orderDetails?.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{item.ten_san_pham}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{item.mau_sac} / {item.kich_co}</div>
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>{formatCurrency(item.gia)}</td>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>{item.so_luong}</td>
                                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.gia * item.so_luong)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                                        <td colSpan="3" style={{ padding: '10px', textAlign: 'right' }}>Tổng cộng:</td>
                                        <td style={{ padding: '10px', textAlign: 'right', color: '#ff6b6b', fontSize: '18px' }}>{formatCurrency(invoiceData.tong_tien)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="modal-actions" style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setShowInvoiceModal(null)}
                                style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveAndPrint}
                                style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                <i className="fa fa-print"></i> Lưu & In
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
