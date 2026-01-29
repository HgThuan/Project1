import React, { Fragment, useEffect, useState } from 'react';
import axios from "axios";
import { useUser } from '../../until/userContext';
import { useNavigate } from 'react-router-dom';
import './Cartpage.css';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';




export default function Cartpage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [cart, setCart] = useState([]);

    // Location data from API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Selected location IDs for cascading logic
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');

    // Payment method selection
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');

    const [state, setState] = useState({
        ten_khach_hang: '',
        sdt: '',
        dia_chi: '',
        tinh_thanh: '',
        quan_huyen: '',
        phuong_xa: '',
        ghi_chu: '',
        tong_tien: 0
    });

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // info, warning, danger
        onConfirm: null,
        confirmText: 'Đồng ý',
        cancelText: 'Đóng'
    });

    const { ten_khach_hang, sdt, dia_chi, tinh_thanh, quan_huyen, phuong_xa, ghi_chu, tong_tien } = state;

    useEffect(() => {
        const loadCart = async () => {
            try {
                // 1. Try to load from localStorage first
                const localData = localStorage.getItem("cart");
                let parsedData = [];

                if (localData) {
                    try {
                        parsedData = JSON.parse(localData);
                    } catch (e) {
                        console.error("Corrupt cart data in localStorage", e);
                        toast.error("Dữ liệu giỏ hàng bị lỗi, hệ thống sẽ đặt lại giỏ hàng.");
                        localStorage.removeItem("cart");
                        parsedData = [];
                    }
                }

                // 2. Validate structure
                const validItems = Array.isArray(parsedData) ? parsedData.filter(item => {
                    return item && item.id && item.name && item.price && item.quantity && item.img && item.color && item.size;
                }) : [];

                // 3. If local cart is empty but user is logged in, try fetching from API
                if (validItems.length === 0 && user && user.id) {
                    try {
                        const response = await axios.get(`http://localhost:5001/api/cart?userId=${user.id}`);
                        if (response.data && response.data.success) {
                            // Convert backend format to frontend format if needed, or assume backend sends correct format
                            // Based on previous steps, backend sends: { ma_san_pham, ten_san_pham, ... }
                            // We need to map it to frontend structure: { id, name, ... }
                            const apiItems = response.data.cart.map(item => ({
                                id: item.ma_san_pham,
                                name: item.ten_san_pham,
                                price: item.gia,
                                quantity: item.so_luong,
                                img: item.anh_sanpham,
                                color: item.mau_sac,
                                size: item.kich_co
                            }));
                            setCart(apiItems);
                            return;
                        }
                    } catch (apiErr) {
                        console.warn("Failed to fetch cart from API", apiErr);
                    }
                }

                setCart(validItems);

            } catch (err) {
                console.error("Unexpected error loading cart", err);
                setCart([]);
            }
        };

        // Load immediately on mount
        loadCart();

        // Listen for updates
        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
    }, [user]);

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get('https://provinces.open-api.vn/api/p/');
                setProvinces(response.data);
            } catch (error) {
                console.error('Error fetching provinces:', error);
            }
        };
        fetchProvinces();
    }, []);

    const calculateTotals = () => {
        const tamtinh = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = tamtinh < 200000 ? 25000 : 0;
        const total = tamtinh + shippingFee;
        return { tamtinh, shippingFee, total };
    };

    const { tamtinh, shippingFee, total } = calculateTotals();

    useEffect(() => {
        setState((prevState) => ({ ...prevState, tong_tien: total }));
    }, [total]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setState({ ...state, [name]: value });
    };

    // Handle province/city selection
    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        const provinceName = provinces.find(p => p.code.toString() === provinceId)?.name || '';

        setSelectedProvinceId(provinceId);
        setState({ ...state, tinh_thanh: provinceName, quan_huyen: '', phuong_xa: '' });
        setDistricts([]);
        setWards([]);
        setSelectedDistrictId('');

        if (provinceId) {
            try {
                const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
                setDistricts(response.data.districts || []);
            } catch (error) {
                console.error('Error fetching districts:', error);
            }
        }
    };

    // Handle district selection
    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        const districtName = districts.find(d => d.code.toString() === districtId)?.name || '';

        setSelectedDistrictId(districtId);
        setState({ ...state, quan_huyen: districtName, phuong_xa: '' });
        setWards([]);

        if (districtId) {
            try {
                const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`);
                setWards(response.data.wards || []);
            } catch (error) {
                console.error('Error fetching wards:', error);
            }
        }
    };

    // Handle ward selection
    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        const wardName = wards.find(w => w.code.toString() === wardCode)?.name || '';
        setState({ ...state, phuong_xa: wardName });
    };

    // Handle payment method selection
    const handlePaymentMethodChange = (e) => {
        setSelectedPaymentMethod(e.target.value);
    };

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!ten_khach_hang || !sdt || !dia_chi || !tinh_thanh || !quan_huyen || !phuong_xa) {
            setModalConfig({
                isOpen: true,
                title: 'Thiếu thông tin',
                message: 'Vui lòng điền đầy đủ thông tin vận chuyển (Họ tên, SĐT, Địa chỉ, Tỉnh/Thành, ...)',
                type: 'warning',
                cancelText: 'Đóng',
                onConfirm: null
            });
            return;
        }

        if (!user) {
            setModalConfig({
                isOpen: true,
                title: 'Yêu cầu đăng nhập',
                message: 'Vui lòng đăng nhập để đặt hàng',
                type: 'warning',
                onConfirm: () => navigate('/DangNhap'),
                confirmText: 'Đăng nhập'
            });
            return;
        }

        if (cart.length === 0) {
            setModalConfig({
                isOpen: true,
                title: 'Giỏ hàng trống',
                message: 'Giỏ hàng của bạn đang trống, vui lòng thêm sản phẩm.',
                type: 'warning',
                cancelText: 'Đóng',
                onConfirm: null
            });
            return;
        }

        // Prepare order data
        const orderData = {
            ma_khach_hang: user.id,
            ngay_dat_hang: new Date().toISOString().slice(0, 10),
            tong_tien: total,
            trang_thai: 1,
            ten_khach: ten_khach_hang,
            dia_chi: `${dia_chi}, ${phuong_xa}, ${quan_huyen}, ${tinh_thanh}`,
            ghi_chu: ghi_chu,
            sdt: sdt,
            chi_tiet_don_hang: cart.map(item => ({
                ma_san_pham: String(item.id),
                ten_san_pham: item.name,
                so_luong: item.quantity,
                gia: item.price,
                kich_co: item.size,
                mau_sac: item.color,
                anh_sanpham: item.img
            }))
        };

        const processOrder = () => {
            axios.post("http://localhost:5001/api/addOrder", orderData)
                .then((res) => {
                    setState({
                        ten_khach_hang: "",
                        sdt: "",
                        dia_chi: "",
                        tinh_thanh: "",
                        phuong_xa: "",
                        quan_huyen: "",
                        ghi_chu: "",
                        tong_tien: 0
                    });
                    localStorage.setItem("cart", JSON.stringify([]));
                    setCart([]);
                    window.dispatchEvent(new Event('cartUpdated'));
                    window.dispatchEvent(new Event('cartUpdated'));
                    toast.success("Bạn đã đặt hàng thành công! Đang chuyển hướng...");
                    setTimeout(() => {
                        navigate('/tracking', { state: { orderId: res.data.ma_don_hang, phone: sdt } });
                    }, 2000);
                })
                .catch(error => {
                    console.error(error);
                    toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau");
                });
        };

        const processVNPay = async () => {
            try {
                // First create the order
                const orderResponse = await axios.post("http://localhost:5001/api/addOrder", orderData);
                const orderId = orderResponse.data.ma_don_hang;

                // Then get VNPay payment URL
                const paymentResponse = await axios.post("http://localhost:5001/api/create_payment_url", {
                    amount: total,
                    orderInfo: `Thanh toan don hang ${orderId}`,
                    orderId: orderId,
                    customerName: ten_khach_hang
                });

                if (paymentResponse.data.success) {
                    // Store order info in sessionStorage for return page
                    sessionStorage.setItem('pendingOrder', JSON.stringify({
                        orderId: orderId,
                        phone: sdt
                    }));

                    // Clear cart
                    localStorage.setItem("cart", JSON.stringify([]));
                    setCart([]);
                    window.dispatchEvent(new Event('cartUpdated'));

                    // Redirect to VNPay
                    window.location.href = paymentResponse.data.paymentUrl;
                } else {
                    toast.error("Không thể tạo link thanh toán, vui lòng thử lại");
                }
            } catch (error) {
                console.error('VNPay payment error:', error);
                toast.error("Đã có lỗi xảy ra khi tạo thanh toán VNPay");
            }
        };

        const processMoMo = async () => {
            try {
                // First create the order
                const orderResponse = await axios.post("http://localhost:5001/api/addOrder", orderData);
                const orderId = orderResponse.data.ma_don_hang;

                // Then get MoMo payment URL
                const paymentResponse = await axios.post("http://localhost:5001/api/create_momo_url", {
                    amount: total,
                    orderInfo: `Thanh toan don hang ${orderId}`,
                    orderId: orderId,
                    customerName: ten_khach_hang
                });

                if (paymentResponse.data.success) {
                    // Store order info in sessionStorage 
                    sessionStorage.setItem('pendingOrder', JSON.stringify({
                        orderId: orderId,
                        phone: sdt
                    }));

                    // Clear cart
                    localStorage.setItem("cart", JSON.stringify([]));
                    setCart([]);
                    window.dispatchEvent(new Event('cartUpdated'));

                    // Redirect to MoMo
                    window.location.href = paymentResponse.data.payUrl;
                } else {
                    toast.error(paymentResponse.data.message || "Không thể tạo link thanh toán MoMo");
                }
            } catch (error) {
                console.error('MoMo payment error:', error);
                toast.error("Đã có lỗi xảy ra khi tạo thanh toán MoMo");
            }
        };

        const processZaloPay = async () => {
            try {
                // First create the order
                const orderResponse = await axios.post("http://localhost:5001/api/addOrder", orderData);
                const orderId = orderResponse.data.ma_don_hang;

                // Then get ZaloPay payment URL
                const paymentResponse = await axios.post("http://localhost:5001/api/create_zalopay_url", {
                    amount: total,
                    orderInfo: `Thanh toan don hang ${orderId}`,
                    orderId: orderId,
                    customerName: ten_khach_hang
                });

                if (paymentResponse.data.success) {
                    // Store order info in sessionStorage 
                    sessionStorage.setItem('pendingOrder', JSON.stringify({
                        orderId: orderId,
                        phone: sdt
                    }));

                    // Clear cart
                    localStorage.setItem("cart", JSON.stringify([]));
                    setCart([]);
                    window.dispatchEvent(new Event('cartUpdated'));

                    // Redirect to ZaloPay
                    window.location.href = paymentResponse.data.payUrl;
                } else {
                    toast.error(paymentResponse.data.message || "Không thể tạo link thanh toán ZaloPay");
                }
            } catch (error) {
                console.error('ZaloPay payment error:', error);
                toast.error("Đã có lỗi xảy ra khi tạo thanh toán ZaloPay");
            }
        };

        // If VNPay is selected, redirect to payment gateway
        if (selectedPaymentMethod === 'VNPay') {
            setModalConfig({
                isOpen: true,
                title: 'Xác nhận thanh toán',
                message: 'Bạn có chắc chắn muốn thanh toán qua VNPay?',
                type: 'info',
                confirmText: 'Thanh toán ngay',
                onConfirm: processVNPay
            });
        } else if (selectedPaymentMethod === 'MoMo') {
            setModalConfig({
                isOpen: true,
                title: 'Xác nhận thanh toán',
                message: 'Bạn có chắc chắn muốn thanh toán qua hính thức MoMo?',
                type: 'info',
                confirmText: 'Thanh toán ngay',
                onConfirm: processMoMo
            });
        } else if (selectedPaymentMethod === 'ZaloPay') {
            setModalConfig({
                isOpen: true,
                title: 'Xác nhận thanh toán',
                message: 'Bạn có chắc chắn muốn thanh toán qua ví điện tử ZaloPay?',
                type: 'info',
                confirmText: 'Thanh toán ngay',
                onConfirm: processZaloPay
            });
        } else {
            // COD or other payment methods
            setModalConfig({
                isOpen: true,
                title: 'Xác nhận đặt hàng',
                message: 'Vui lòng kiểm tra kỹ thông tin trước khi đặt hàng.',
                type: 'info',
                confirmText: 'Xác nhận',
                onConfirm: processOrder
            });
        }
    };

    return (
        <Fragment>
            <div className="main">
                <div className="cartPage-wrapper">
                    <div className="cartPage-container">
                        {/* Shipping Information Form */}
                        <form className="info" onSubmit={handlePayment}>
                            <div className="info-header">
                                <h2>Thông tin vận chuyển</h2>
                            </div>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Họ và tên <span className="required">*</span></label>
                                    <input
                                        className="input-field"
                                        name="ten_khach_hang"
                                        onChange={handleInputChange}
                                        value={ten_khach_hang}
                                        type="text"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Số điện thoại <span className="required">*</span></label>
                                    <input
                                        className="input-field"
                                        name="sdt"
                                        onChange={handleInputChange}
                                        value={sdt}
                                        type="tel"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Địa chỉ <span className="required">*</span></label>
                                    <input
                                        className="input-field"
                                        name="dia_chi"
                                        onChange={handleInputChange}
                                        value={dia_chi}
                                        type="text"
                                        required
                                    />
                                </div>

                                <div className="form-group half-width">
                                    <label className="form-label">Tỉnh / Thành phố <span className="required">*</span></label>
                                    <select
                                        className="input-field"
                                        onChange={handleProvinceChange}
                                        value={selectedProvinceId}
                                        name="tinh_thanh"
                                        required
                                    >
                                        <option value="">Chọn Tỉnh/Thành</option>
                                        {provinces.map(province => (
                                            <option key={province.code} value={province.code}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group half-width">
                                    <label className="form-label">Quận / Huyện <span className="required">*</span></label>
                                    <select
                                        className="input-field"
                                        onChange={handleDistrictChange}
                                        value={selectedDistrictId}
                                        name="quan_huyen"
                                        required
                                        disabled={!selectedProvinceId || districts.length === 0}
                                    >
                                        <option value="">Chọn Quận/Huyện</option>
                                        {districts.map(district => (
                                            <option key={district.code} value={district.code}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group half-width">
                                    <label className="form-label">Phường / Xã <span className="required">*</span></label>
                                    <select
                                        className="input-field"
                                        onChange={handleWardChange}
                                        value={phuong_xa ? wards.find(w => w.name === phuong_xa)?.code || '' : ''}
                                        name="phuong_xa"
                                        required
                                        disabled={!selectedDistrictId || wards.length === 0}
                                    >
                                        <option value="">Chọn Phường/Xã</option>
                                        {wards.map(ward => (
                                            <option key={ward.code} value={ward.code}>
                                                {ward.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Ghi chú</label>
                                    <textarea
                                        onChange={handleInputChange}
                                        value={ghi_chu}
                                        name="ghi_chu"
                                        className="input-field textarea-field"
                                        placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                                        rows="3"
                                    />
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="payments">
                                <h2 className="payments">Hình thức thanh toán</h2>
                                <div className={`payments-item ${selectedPaymentMethod === 'ZaloPay' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        className="check"
                                        name="check"
                                        value="ZaloPay"
                                        checked={selectedPaymentMethod === 'ZaloPay'}
                                        onChange={handlePaymentMethodChange}
                                    />
                                    <img src="/images/payments/zalopay.png" alt="ZaloPay" />
                                    <div className="payments-item__text">
                                        <p>Ví điện tử ZaloPay</p>
                                    </div>
                                </div>
                                <div className={`payments-item ${selectedPaymentMethod === 'COD' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        className="check"
                                        name="check"
                                        value="COD"
                                        checked={selectedPaymentMethod === 'COD'}
                                        onChange={handlePaymentMethodChange}
                                    />
                                    <img src="/images/payments/cod.png" alt="COD" />
                                    <div className="payments-item__text">
                                        <p>COD</p>
                                        <p>Thanh toán khi nhận hàng</p>
                                    </div>
                                </div>
                                <div className={`payments-item ${selectedPaymentMethod === 'MoMo' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        className="check"
                                        name="check"
                                        value="MoMo"
                                        checked={selectedPaymentMethod === 'MoMo'}
                                        onChange={handlePaymentMethodChange}
                                    />
                                    <img src="/images/payments/momo.png" alt="Momo" />
                                    <div className="payments-item__text">
                                        <p>MOMO</p>
                                        <p>Ưu đãi đầy bất ngờ</p>
                                    </div>
                                </div>
                                <div className={`payments-item ${selectedPaymentMethod === 'VNPay' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        className="check"
                                        name="check"
                                        value="VNPay"
                                        checked={selectedPaymentMethod === 'VNPay'}
                                        onChange={handlePaymentMethodChange}
                                    />
                                    <img src="/images/payments/vnpay.png" alt="VNPay" />
                                    <div className="payments-item__text">
                                        <p>VNPay</p>
                                        <p>Thẻ ATM / Internet Banking / Thẻ tín dụng</p>
                                    </div>
                                </div>

                                <div className="payments-note">
                                    Nếu bạn không hài lòng với sản phẩm của chúng tôi? Bạn hoàn toàn có thể trả lại sản phẩm.
                                    Tìm hiểu thêm <a href="/returns">tại đây</a>.
                                </div>
                            </div>
                        </form>

                        {/* Cart Items */}
                        <div className="list-product">
                            <div className="list-product__inner">
                                <h2>Giỏ hàng ({cart.length} sản phẩm)</h2>

                                {cart.length === 0 ? (
                                    <div className="empty-cart">
                                        <i className="fa-solid fa-cart-shopping"></i>
                                        <p>Giỏ hàng của bạn đang trống</p>
                                        <a href="/product">Tiếp tục mua sắm</a>
                                    </div>
                                ) : (
                                    <>
                                        <div className="list-product__items">
                                            {cart.map((item, index) => (
                                                <div key={index} className="list-product__item">
                                                    <div className="list-product__item-img">
                                                        <img src={item.img} alt={item.name} />
                                                    </div>
                                                    <div className="list-product__item-content">
                                                        <div className="list-product__item-name">{item.name}</div>
                                                        <div className="list-product__item-type">
                                                            <span className="list-product__item-variant">{item.color}</span>
                                                            <span className="list-product__item-variant">{item.size}</span>
                                                        </div>
                                                        <div className="list-product__item-footer">
                                                            <div className="quantity-product">
                                                                <span>Số lượng: {item.quantity}</span>
                                                            </div>
                                                            <div className="product-price">
                                                                <div className="product-new-price">{formatCurrency(item.price * item.quantity)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>


                                        <div className="cost-summary">
                                            <div className="cost-detail">
                                                <span>Tạm tính</span>
                                                <span>{formatCurrency(tamtinh)}</span>
                                            </div>
                                            <div className="cost-detail">
                                                <span>Giảm giá</span>
                                                <span>0đ</span>
                                            </div>
                                            <div className="cost-detail">
                                                <span>Phí giao hàng</span>
                                                <span>
                                                    {shippingFee > 0 ? formatCurrency(shippingFee) : 'Miễn phí'}
                                                </span>
                                            </div>
                                            <div className="cost-detail total">
                                                <span>Tổng</span>
                                                <span className="total__price">
                                                    {formatCurrency(total)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn-pay"
                                            disabled={cart.length === 0}
                                            onClick={handlePayment}
                                        >
                                            Thanh toán <span className="btn-pay--price">{formatCurrency(total)}</span>
                                            <br />
                                            <span className="type-payment">({selectedPaymentMethod})</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
            />
        </Fragment >
    );
}
