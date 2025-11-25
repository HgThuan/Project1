import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './InvoiceList.css';

export default function CreateInvoiceModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        customerInfo: {
            name: '',
            phone: '',
            address: '',
            email: ''
        },
        products: [
            {
                product_id: '',
                name: '',
                quantity: 1,
                price: 0,
                tax: 0,
                discount: 0,
                color: '',
                size: ''
            }
        ],
        paymentMethod: 'COD',
        paymentStatus: 'Chưa thanh toán'
    });

    const [loading, setLoading] = useState(false);

    const handleCustomerChange = (field, value) => {
        setFormData({
            ...formData,
            customerInfo: {
                ...formData.customerInfo,
                [field]: value
            }
        });
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...formData.products];
        updatedProducts[index][field] = ['quantity', 'price', 'tax', 'discount'].includes(field)
            ? parseFloat(value) || 0
            : value;
        setFormData({ ...formData, products: updatedProducts });
    };

    const addProduct = () => {
        setFormData({
            ...formData,
            products: [
                ...formData.products,
                {
                    product_id: '',
                    name: '',
                    quantity: 1,
                    price: 0,
                    tax: 0,
                    discount: 0,
                    color: '',
                    size: ''
                }
            ]
        });
    };

    const removeProduct = (index) => {
        if (formData.products.length === 1) {
            toast.error('Phải có ít nhất 1 sản phẩm');
            return;
        }
        const updatedProducts = formData.products.filter((_, i) => i !== index);
        setFormData({ ...formData, products: updatedProducts });
    };

    const calculateFinancials = () => {
        const subtotal = formData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const totalTax = formData.products.reduce((sum, p) => sum + ((p.tax || 0) * p.quantity), 0);
        const totalDiscount = formData.products.reduce((sum, p) => sum + ((p.discount || 0) * p.quantity), 0);
        const finalAmount = subtotal + totalTax - totalDiscount;

        return { subtotal, totalTax, totalDiscount, finalAmount };
    };

    const validateForm = () => {
        if (!formData.customerInfo.name.trim()) {
            toast.error('Vui lòng nhập tên khách hàng');
            return false;
        }
        if (!formData.customerInfo.phone.trim()) {
            toast.error('Vui lòng nhập số điện thoại');
            return false;
        }
        if (!formData.customerInfo.address.trim()) {
            toast.error('Vui lòng nhập địa chỉ');
            return false;
        }

        for (let i = 0; i < formData.products.length; i++) {
            const product = formData.products[i];
            if (!product.product_id.trim()) {
                toast.error(`Vui lòng nhập mã sản phẩm cho sản phẩm ${i + 1}`);
                return false;
            }
            if (!product.name.trim()) {
                toast.error(`Vui lòng nhập tên sản phẩm cho sản phẩm ${i + 1}`);
                return false;
            }
            if (product.quantity <= 0) {
                toast.error(`Số lượng sản phẩm ${i + 1} phải lớn hơn 0`);
                return false;
            }
            if (product.price <= 0) {
                toast.error(`Đơn giá sản phẩm ${i + 1} phải lớn hơn 0`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const invoiceData = {
                customerInfo: formData.customerInfo,
                products: formData.products,
                paymentMethod: formData.paymentMethod,
                paymentStatus: formData.paymentStatus,
                notes: 'Tạo hóa đơn thủ công từ admin panel',
                performedBy: 'admin'
            };

            await axios.post('http://localhost:5001/api/invoices', invoiceData);
            toast.success('Tạo hóa đơn thành công!');
            onSuccess();
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi tạo hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const financials = calculateFinancials();
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content invoice-detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                <div className="modal-header">
                    <h3>Tạo hóa đơn mới (Thủ công)</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Customer Information */}
                        <div className="info-card" style={{ marginBottom: '20px' }}>
                            <h4>Thông tin khách hàng</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                        Tên khách hàng <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customerInfo.name}
                                        onChange={(e) => handleCustomerChange('name', e.target.value)}
                                        placeholder="Nhập tên khách hàng"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                        Số điện thoại <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customerInfo.phone}
                                        onChange={(e) => handleCustomerChange('phone', e.target.value)}
                                        placeholder="Nhập số điện thoại"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                        Địa chỉ <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customerInfo.address}
                                        onChange={(e) => handleCustomerChange('address', e.target.value)}
                                        placeholder="Nhập địa chỉ"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                        Email (tùy chọn)
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.customerInfo.email}
                                        onChange={(e) => handleCustomerChange('email', e.target.value)}
                                        placeholder="Nhập email"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ margin: 0 }}>Danh sách sản phẩm</h4>
                                <button
                                    type="button"
                                    onClick={addProduct}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fa fa-plus"></i> Thêm sản phẩm
                                </button>
                            </div>

                            {formData.products.map((product, index) => (
                                <div
                                    key={index}
                                    style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        marginBottom: '15px',
                                        backgroundColor: '#f8f9fa'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <strong>Sản phẩm {index + 1}</strong>
                                        {formData.products.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(index)}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                <i className="fa fa-trash"></i> Xóa
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: '600' }}>
                                                Mã SP <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={product.product_id}
                                                onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                                                placeholder="Mã SP"
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                                required
                                            />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: '600' }}>
                                                Tên sản phẩm <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={product.name}
                                                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                                placeholder="Tên sản phẩm"
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: '600' }}>
                                                Số lượng <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={product.quantity}
                                                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                                min="1"
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: '600' }}>
                                                Đơn giá <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={product.price}
                                                onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                                min="0"
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: '600' }}>
                                                Thuế
                                            </label>
                                            <input
                                                type="number"
                                                value={product.tax}
                                                onChange={(e) => handleProductChange(index, 'tax', e.target.value)}
                                                min="0"
                                                placeholder="0"
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: '600' }}>
                                                Giảm giá
                                            </label>
                                            <input
                                                type="number"
                                                value={product.discount}
                                                onChange={(e) => handleProductChange(index, 'discount', e.target.value)}
                                                min="0"
                                                placeholder="0"
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: '600' }}>
                                                Màu sắc
                                            </label>
                                            <input
                                                type="text"
                                                value={product.color}
                                                onChange={(e) => handleProductChange(index, 'color', e.target.value)}
                                                placeholder="Màu sắc"
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px', fontWeight: '600' }}>
                                                Kích cỡ
                                            </label>
                                            <input
                                                type="text"
                                                value={product.size}
                                                onChange={(e) => handleProductChange(index, 'size', e.target.value)}
                                                placeholder="Kích cỡ"
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment Information */}
                        <div className="info-card" style={{ marginBottom: '20px' }}>
                            <h4>Thông tin thanh toán</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                        Phương thức thanh toán
                                    </label>
                                    <select
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    >
                                        <option value="Tiền mặt">Tiền mặt</option>
                                        <option value="Chuyển khoản">Chuyển khoản</option>
                                        <option value="Ví điện tử">Ví điện tử</option>
                                        <option value="COD">COD</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                        Trạng thái thanh toán
                                    </label>
                                    <select
                                        value={formData.paymentStatus}
                                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    >
                                        <option value="Chưa thanh toán">Chưa thanh toán</option>
                                        <option value="Đã thanh toán">Đã thanh toán</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="financial-summary">
                            <div className="summary-row">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(financials.subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tổng thuế:</span>
                                <span>{formatCurrency(financials.totalTax)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tổng giảm giá:</span>
                                <span>{formatCurrency(financials.totalDiscount)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>TỔNG CỘNG:</span>
                                <span>{formatCurrency(financials.finalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-close"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={loading}
                        >
                            {loading ? 'Đang tạo...' : <><i className="fa fa-check"></i> Tạo hóa đơn</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
