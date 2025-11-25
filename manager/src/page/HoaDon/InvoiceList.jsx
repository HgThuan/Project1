import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import './InvoiceList.css';
import { toast } from 'react-toastify';
import CreateInvoiceModal from './CreateInvoiceModal';

export default function InvoiceList() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filters & Pagination
    const [filters, setFilters] = useState({
        search: '',
        paymentStatus: '',
        paymentMethod: '',
        status: '',
        createdType: '',
        startDate: '',
        endDate: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalInvoices, setTotalInvoices] = useState(0);

    // Edit invoice state
    const [editMode, setEditMode] = useState(false);
    const [editedInvoice, setEditedInvoice] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, [page]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                ...filters
            };
            const response = await axios.get('http://localhost:5001/api/invoices', { params });
            setInvoices(response.data.invoices);
            setTotalPages(response.data.totalPages);
            setTotalInvoices(response.data.totalInvoices);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Lỗi khi tải danh sách hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchInvoices();
    };

    const handleViewInvoice = async (ma_hoa_don) => {
        try {
            const response = await axios.get(`http://localhost:5001/api/invoices/${ma_hoa_don}`);
            setSelectedInvoice(response.data.invoice);
            setEditedInvoice(JSON.parse(JSON.stringify(response.data.invoice))); // Deep copy
            setShowDetailModal(true);
            setEditMode(false);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error('Lỗi khi tải hóa đơn');
        }
    };

    const handleSaveChanges = async () => {
        try {
            const updateData = {
                customerInfo: editedInvoice.customerInfo,
                products: editedInvoice.products,
                paymentStatus: editedInvoice.paymentStatus,
                paymentMethod: editedInvoice.paymentMethod,
                notes: 'Cập nhật từ admin panel',
                performedBy: 'admin'
            };

            await axios.put(`http://localhost:5001/api/invoices/${editedInvoice.ma_hoa_don}`, updateData);
            toast.success('Cập nhật hóa đơn thành công!');
            setShowDetailModal(false);
            setEditMode(false);
            fetchInvoices();
        } catch (error) {
            console.error('Error updating invoice:', error);
            toast.error('Lỗi khi cập nhật hóa đơn');
        }
    };

    const handleCancelInvoice = async (ma_hoa_don) => {
        const reason = window.prompt('Vui lòng nhập lý do hủy hóa đơn:');
        if (!reason) return;

        try {
            await axios.post(`http://localhost:5001/api/invoices/cancel/${ma_hoa_don}`, {
                reason,
                performedBy: 'admin'
            });
            toast.success('Đã hủy hóa đơn thành công!');
            setShowDetailModal(false);
            fetchInvoices();
        } catch (error) {
            console.error('Error cancelling invoice:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi hủy hóa đơn');
        }
    };

    const exportToPDF = (invoice) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('HÓA ĐƠN', 105, 20, { align: 'center' });

        // Invoice Info
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Mã hóa đơn: ${invoice.ma_hoa_don}`, 20, 35);
        doc.text(`Ngày tạo: ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}`, 20, 42);
        doc.text(`Loại: ${invoice.createdType === 'Auto' ? 'Tự động' : 'Thủ công'}`, 20, 49);

        // Customer Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('THÔNG TIN KHÁCH HÀNG', 20, 65);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tên: ${invoice.customerInfo.name}`, 20, 73);
        doc.text(`SĐT: ${invoice.customerInfo.phone}`, 20, 80);
        doc.text(`Địa chỉ: ${invoice.customerInfo.address}`, 20, 87);

        // Products
        let y = 105;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DANH SÁCH SẢN PHẨM', 20, y);
        y += 10;

        doc.setFontSize(10);
        doc.text('Sản phẩm', 20, y);
        doc.text('SL', 100, y);
        doc.text('Đơn giá', 120, y);
        doc.text('Thành tiền', 160, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        invoice.products.forEach(product => {
            doc.text(product.name.substring(0, 30), 20, y);
            doc.text(product.quantity.toString(), 100, y);
            doc.text(product.price.toLocaleString('vi-VN'), 120, y);
            doc.text((product.price * product.quantity).toLocaleString('vi-VN'), 160, y);
            y += 7;
        });

        // Financial Summary
        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.text(`Tạm tính:`, 120, y);
        doc.text(`${invoice.financials.subtotal.toLocaleString('vi-VN')} VND`, 160, y);
        y += 7;
        doc.text(`Thuế:`, 120, y);
        doc.text(`${invoice.financials.totalTax.toLocaleString('vi-VN')} VND`, 160, y);
        y += 7;
        doc.text(`Giảm giá:`, 120, y);
        doc.text(`${invoice.financials.totalDiscount.toLocaleString('vi-VN')} VND`, 160, y);
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`TỔNG CỘNG:`, 120, y);
        doc.text(`${invoice.financials.finalAmount.toLocaleString('vi-VN')} VND`, 160, y);

        doc.save(`HoaDon_${invoice.ma_hoa_don}.pdf`);
        toast.success('Đã xuất PDF thành công!');
    };

    const exportToExcel = (invoice) => {
        const data = [
            ['HÓA ĐƠN'],
            [],
            ['Mã hóa đơn:', invoice.ma_hoa_don],
            ['Ngày tạo:', new Date(invoice.createdAt).toLocaleDateString('vi-VN')],
            ['Loại:', invoice.createdType === 'Auto' ? 'Tự động' : 'Thủ công'],
            [],
            ['THÔNG TIN KHÁCH HÀNG'],
            ['Tên:', invoice.customerInfo.name],
            ['SĐT:', invoice.customerInfo.phone],
            ['Địa chỉ:', invoice.customerInfo.address],
            [],
            ['DANH SÁCH SẢN PHẨM'],
            ['Sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền'],
            ...invoice.products.map(p => [
                p.name,
                p.quantity,
                p.price,
                p.price * p.quantity
            ]),
            [],
            ['Tạm tính:', invoice.financials.subtotal],
            ['Thuế:', invoice.financials.totalTax],
            ['Giảm giá:', invoice.financials.totalDiscount],
            ['TỔNG CỘNG:', invoice.financials.finalAmount]
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Invoice');

        XLSX.writeFile(wb, `HoaDon_${invoice.ma_hoa_don}.xlsx`);
        toast.success('Đã xuất Excel thành công!');
    };

    const getPaymentStatusBadge = (status) => {
        const badges = {
            'Chưa thanh toán': 'badge-unpaid',
            'Đã thanh toán': 'badge-paid',
            'Đã hoàn tiền': 'badge-refunded'
        };
        return badges[status] || 'badge-unpaid';
    };

    const getStatusBadge = (status) => {
        return status === 'Hoạt động' ? 'badge-active' : 'badge-cancelled';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...editedInvoice.products];
        updatedProducts[index][field] = field === 'quantity' || field === 'price' || field === 'tax' || field === 'discount'
            ? parseFloat(value) || 0
            : value;

        // Recalculate financials
        const subtotal = updatedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const totalTax = updatedProducts.reduce((sum, p) => sum + ((p.tax || 0) * p.quantity), 0);
        const totalDiscount = updatedProducts.reduce((sum, p) => sum + ((p.discount || 0) * p.quantity), 0);

        setEditedInvoice({
            ...editedInvoice,
            products: updatedProducts,
            financials: {
                subtotal,
                totalTax,
                totalDiscount,
                finalAmount: subtotal + totalTax - totalDiscount
            }
        });
    };

    return (
        <div className="invoice-list-container">
            <h2 className="page-title">Quản lý Hóa đơn</h2>

            {/* Toolbar */}
            <div className="invoice-toolbar">
                <form onSubmit={handleSearch} className="search-form">
                    <label>Tìm kiếm</label>
                    <div className="search-group">
                        <input
                            type="text"
                            placeholder="Mã HĐ, tên KH, số điện thoại..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                        <button type="submit"><i className="fa fa-search"></i></button>
                    </div>
                </form>

                <div className="filter-group">
                    <label>Trạng thái thanh toán</label>
                    <select value={filters.paymentStatus} onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="Chưa thanh toán">Chưa thanh toán</option>
                        <option value="Đã thanh toán">Đã thanh toán</option>
                        <option value="Đã hoàn tiền">Đã hoàn tiền</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Phương thức</label>
                    <select value={filters.paymentMethod} onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="Tiền mặt">Tiền mặt</option>
                        <option value="Chuyển khoản">Chuyển khoản</option>
                        <option value="Ví điện tử">Ví điện tử</option>
                        <option value="COD">COD</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Loại hóa đơn</label>
                    <select value={filters.createdType} onChange={(e) => handleFilterChange('createdType', e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="Auto">Tự động</option>
                        <option value="Manual">Thủ công</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Trạng thái</label>
                    <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Đã hủy">Đã hủy</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Từ ngày</label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Đến ngày</label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                </div>

                <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                    <i className="fa fa-plus"></i> Tạo hóa đơn
                </button>
            </div>

            {/* Table */}
            <div className="invoice-table-wrapper">
                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Mã HĐ</th>
                            <th>Khách hàng</th>
                            <th>Mã ĐH</th>
                            <th>Ngày tạo</th>
                            <th>Tổng tiền</th>
                            <th>TT Thanh toán</th>
                            <th>PT Thanh toán</th>
                            <th>Loại</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="10" className="text-center">Đang tải dữ liệu...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan="10" className="text-center">Không tìm thấy hóa đơn nào</td></tr>
                        ) : (
                            invoices.map(invoice => (
                                <tr key={invoice.ma_hoa_don}>
                                    <td><strong>{invoice.ma_hoa_don}</strong></td>
                                    <td>
                                        <div className="customer-info">
                                            <div className="name">{invoice.customerInfo.name}</div>
                                            <div className="phone">{invoice.customerInfo.phone}</div>
                                        </div>
                                    </td>
                                    <td>{invoice.ma_don_hang || '-'}</td>
                                    <td>{formatDate(invoice.createdAt)}</td>
                                    <td className="amount">{formatCurrency(invoice.financials.finalAmount)}</td>
                                    <td>
                                        <span className={`badge ${getPaymentStatusBadge(invoice.paymentStatus)}`}>
                                            {invoice.paymentStatus}
                                        </span>
                                    </td>
                                    <td>{invoice.paymentMethod}</td>
                                    <td>
                                        <span className={`badge ${invoice.createdType === 'Auto' ? 'badge-auto' : 'badge-manual'}`}>
                                            {invoice.createdType === 'Auto' ? 'Tự động' : 'Thủ công'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-view"
                                                onClick={() => handleViewInvoice(invoice.ma_hoa_don)}
                                                title="Xem chi tiết"
                                            >
                                                <i className="fa fa-eye"></i>
                                            </button>
                                            <button
                                                className="btn-pdf"
                                                onClick={() => exportToPDF(invoice)}
                                                title="Xuất PDF"
                                            >
                                                <i className="fa fa-file-pdf-o"></i>
                                            </button>
                                            <button
                                                className="btn-excel"
                                                onClick={() => exportToExcel(invoice)}
                                                title="Xuất Excel"
                                            >
                                                <i className="fa fa-file-excel-o"></i>
                                            </button>
                                            {invoice.status === 'Hoạt động' && (
                                                <button
                                                    className="btn-cancel"
                                                    onClick={() => handleCancelInvoice(invoice.ma_hoa_don)}
                                                    title="Hủy hóa đơn"
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="pagination-wrapper">
                    <div>Hiển thị {invoices.length} / {totalInvoices} hóa đơn</div>
                    <div className="pagination-buttons">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                className={page === p ? 'active' : ''}
                                onClick={() => setPage(p)}
                            >
                                {p}
                            </button>
                        ))}
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
                    </div>
                </div>
            </div>

            {/* Invoice Detail Modal */}
            {showDetailModal && selectedInvoice && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content invoice-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết hóa đơn #{selectedInvoice.ma_hoa_don}</h3>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>

                        <div className="modal-body">
                            {/* Invoice Info */}
                            <div className="info-grid">
                                <div className="info-card">
                                    <h4>Thông tin hóa đơn</h4>
                                    <p><strong>Mã hóa đơn:</strong> {selectedInvoice.ma_hoa_don}</p>
                                    <p><strong>Ngày tạo:</strong> {formatDate(selectedInvoice.createdAt)}</p>
                                    <p><strong>Loại:</strong> {selectedInvoice.createdType === 'Auto' ? 'Tự động' : 'Thủ công'}</p>
                                    {selectedInvoice.ma_don_hang && (
                                        <p><strong>Mã đơn hàng:</strong> {selectedInvoice.ma_don_hang}</p>
                                    )}
                                </div>

                                <div className="info-card">
                                    <h4>Thông tin khách hàng {editMode && <i className="fa fa-edit"></i>}</h4>
                                    {editMode ? (
                                        <>
                                            <p><strong>Tên:</strong> <input type="text" value={editedInvoice.customerInfo.name} onChange={(e) => setEditedInvoice({ ...editedInvoice, customerInfo: { ...editedInvoice.customerInfo, name: e.target.value } })} /></p>
                                            <p><strong>SĐT:</strong> <input type="text" value={editedInvoice.customerInfo.phone} onChange={(e) => setEditedInvoice({ ...editedInvoice, customerInfo: { ...editedInvoice.customerInfo, phone: e.target.value } })} /></p>
                                            <p><strong>Địa chỉ:</strong> <input type="text" value={editedInvoice.customerInfo.address} onChange={(e) => setEditedInvoice({ ...editedInvoice, customerInfo: { ...editedInvoice.customerInfo, address: e.target.value } })} /></p>
                                        </>
                                    ) : (
                                        <>
                                            <p><strong>Tên:</strong> {selectedInvoice.customerInfo.name}</p>
                                            <p><strong>SĐT:</strong> {selectedInvoice.customerInfo.phone}</p>
                                            <p><strong>Địa chỉ:</strong> {selectedInvoice.customerInfo.address}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Products */}
                            <h4>Danh sách sản phẩm</h4>
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>SL</th>
                                        <th>Đơn giá</th>
                                        <th>Thuế</th>
                                        <th>Giảm giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(editMode ? editedInvoice : selectedInvoice).products.map((product, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="product-name">{product.name}</div>
                                                {(product.color || product.size) && (
                                                    <div className="product-variant">{product.color} / {product.size}</div>
                                                )}
                                            </td>
                                            <td>{editMode ? <input type="number" value={product.quantity} onChange={(e) => handleProductChange(idx, 'quantity', e.target.value)} style={{ width: '60px' }} /> : product.quantity}</td>
                                            <td>{formatCurrency(product.price)}</td>
                                            <td>{editMode ? <input type="number" value={product.tax} onChange={(e) => handleProductChange(idx, 'tax', e.target.value)} style={{ width: '80px' }} /> : formatCurrency(product.tax)}</td>
                                            <td>{editMode ? <input type="number" value={product.discount} onChange={(e) => handleProductChange(idx, 'discount', e.target.value)} style={{ width: '80px' }} /> : formatCurrency(product.discount)}</td>
                                            <td>{formatCurrency((product.price * product.quantity) + (product.tax * product.quantity) - (product.discount * product.quantity))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Financial Summary */}
                            <div className="financial-summary">
                                <div className="summary-row">
                                    <span>Tạm tính:</span>
                                    <span>{formatCurrency((editMode ? editedInvoice : selectedInvoice).financials.subtotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tổng thuế:</span>
                                    <span>{formatCurrency((editMode ? editedInvoice : selectedInvoice).financials.totalTax)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tổng giảm giá:</span>
                                    <span>{formatCurrency((editMode ? editedInvoice : selectedInvoice).financials.totalDiscount)}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>TỔNG CỘNG:</span>
                                    <span>{formatCurrency((editMode ? editedInvoice : selectedInvoice).financials.finalAmount)}</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="payment-info">
                                <h4>Thông tin thanh toán</h4>
                                <p>
                                    <strong>Trạng thái thanh toán:</strong>
                                    {editMode ? (
                                        <select value={editedInvoice.paymentStatus} onChange={(e) => setEditedInvoice({ ...editedInvoice, paymentStatus: e.target.value })}>
                                            <option value="Chưa thanh toán">Chưa thanh toán</option>
                                            <option value="Đã thanh toán">Đã thanh toán</option>
                                            <option value="Đã hoàn tiền">Đã hoàn tiền</option>
                                        </select>
                                    ) : (
                                        <span className={`badge ${getPaymentStatusBadge(selectedInvoice.paymentStatus)}`}>
                                            {selectedInvoice.paymentStatus}
                                        </span>
                                    )}
                                </p>
                                <p>
                                    <strong>Phương thức thanh toán:</strong>
                                    {editMode ? (
                                        <select value={editedInvoice.paymentMethod} onChange={(e) => setEditedInvoice({ ...editedInvoice, paymentMethod: e.target.value })}>
                                            <option value="Tiền mặt">Tiền mặt</option>
                                            <option value="Chuyển khoản">Chuyển khoản</option>
                                            <option value="Ví điện tử">Ví điện tử</option>
                                            <option value="COD">COD</option>
                                        </select>
                                    ) : selectedInvoice.paymentMethod}
                                </p>
                            </div>

                            {/* Log History */}
                            <div className="log-history">
                                <h4>Lịch sử thay đổi</h4>
                                <div className="log-timeline">
                                    {selectedInvoice.logs.map((log, idx) => (
                                        <div key={idx} className="log-item">
                                            <div className="log-icon">
                                                <i className={`fa ${log.action === 'created' ? 'fa-plus' : log.action === 'updated' ? 'fa-edit' : 'fa-ban'}`}></i>
                                            </div>
                                            <div className="log-content">
                                                <div className="log-action">{log.action.toUpperCase()}</div>
                                                <div className="log-note">{log.note}</div>
                                                <div className="log-meta">
                                                    {formatDate(log.timestamp)} - {log.performedBy}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            {selectedInvoice.status === 'Hoạt động' && !editMode && (
                                <button className="btn-edit-mode" onClick={() => setEditMode(true)}>
                                    <i className="fa fa-edit"></i> Chỉnh sửa
                                </button>
                            )}
                            {editMode && (
                                <>
                                    <button className="btn-cancel-edit" onClick={() => { setEditMode(false); setEditedInvoice(JSON.parse(JSON.stringify(selectedInvoice))); }}>
                                        Hủy
                                    </button>
                                    <button className="btn-save" onClick={handleSaveChanges}>
                                        <i className="fa fa-save"></i> Lưu thay đổi
                                    </button>
                                </>
                            )}
                            <button className="btn-email" onClick={() => toast.info('Tính năng gửi email đang phát triển')}>
                                <i className="fa fa-envelope"></i> Gửi Email
                            </button>
                            <button className="btn-pdf" onClick={() => exportToPDF(selectedInvoice)}>
                                <i className="fa fa-file-pdf-o"></i> Xuất PDF
                            </button>
                            <button className="btn-excel" onClick={() => exportToExcel(selectedInvoice)}>
                                <i className="fa fa-file-excel-o"></i> Xuất Excel
                            </button>
                            {selectedInvoice.status === 'Hoạt động' && (
                                <button className="btn-cancel-invoice" onClick={() => handleCancelInvoice(selectedInvoice.ma_hoa_don)}>
                                    <i className="fa fa-ban"></i> Hủy hóa đơn
                                </button>
                            )}
                            <button className="btn-close" onClick={() => setShowDetailModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <CreateInvoiceModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchInvoices();
                    }}
                />
            )}
        </div>
    );
}
