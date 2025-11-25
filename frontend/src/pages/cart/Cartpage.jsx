import React, { Fragment, useEffect, useState } from 'react';
import axios from "axios";
import { useUser } from '../../until/userContext';
import { useNavigate } from 'react-router-dom';

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
                        alert("Dữ liệu giỏ hàng bị lỗi, hệ thống sẽ đặt lại giỏ hàng.");
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
            alert('Vui lòng điền đầy đủ thông tin vận chuyển');
            return;
        }

        if (!user) {
            alert('Vui lòng đăng nhập để đặt hàng');
            navigate('/DangNhap');
            return;
        }

        if (cart.length === 0) {
            alert('Giỏ hàng của bạn đang trống');
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

        // If VNPay is selected, redirect to payment gateway
        if (selectedPaymentMethod === 'VNPay') {
            if (window.confirm("Xác nhận thanh toán qua VNPay?")) {
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
                        alert("Không thể tạo link thanh toán, vui lòng thử lại");
                    }
                } catch (error) {
                    console.error('VNPay payment error:', error);
                    alert("Đã có lỗi xảy ra khi tạo thanh toán VNPay");
                }
            }
        } else {
            // COD or other payment methods - existing flow
            if (window.confirm("Xác nhận lại thông tin đơn hàng, xác nhận đặt hàng?")) {
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
                        alert("Bạn đã đặt hàng thành công! Chuyển hướng đến trang theo dõi đơn hàng.");
                        navigate('/tracking', { state: { orderId: res.data.ma_don_hang, phone: sdt } });
                    })
                    .catch(error => {
                        console.error(error);
                        alert("Đã có lỗi xảy ra, vui lòng thử lại sau");
                    });
            }
        }
    };

    return (
        <Fragment>
            <div className="main">
                <div className="cartPage-container">
                    {/* Shipping Information Form */}
                    <form className="info" onSubmit={handlePayment}>
                        <div className="info-header">
                            <h2>Thông tin vận chuyển</h2>
                        </div>

                        <div className="row info-body">
                            <div className="col p-6">
                                <input
                                    className="input-name"
                                    name="ten_khach_hang"
                                    onChange={handleInputChange}
                                    value={ten_khach_hang}
                                    placeholder="Họ tên *"
                                    type="text"
                                    required
                                />
                            </div>
                            <div className="col p-6">
                                <input
                                    className="input-phone"
                                    name="sdt"
                                    onChange={handleInputChange}
                                    value={sdt}
                                    placeholder="Số điện thoại *"
                                    type="tel"
                                    required
                                />
                            </div>
                            <div className="col p-12">
                                <input
                                    className="input-adress"
                                    name="dia_chi"
                                    onChange={handleInputChange}
                                    value={dia_chi}
                                    placeholder="Địa chỉ *"
                                    type="text"
                                    required
                                />
                            </div>
                            <div className="adress col p-4">
                                <select
                                    onChange={handleProvinceChange}
                                    value={selectedProvinceId}
                                    name="tinh_thanh"
                                    required
                                >
                                    <option value="">Chọn Tỉnh/Thành Phố</option>
                                    {provinces.map(province => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="adress col p-4">
                                <select
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
                            <div className="adress col p-4">
                                <select
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
                            <div className="col p-12">
                                <input
                                    onChange={handleInputChange}
                                    value={ghi_chu}
                                    name="ghi_chu"
                                    className="input-adress"
                                    placeholder="Ghi chú thêm (không bắt buộc)"
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="payments">
                            <h2 className="payments">Hình thức thanh toán</h2>
                            <div className="payments-item active">
                                <input
                                    type="radio"
                                    className="check"
                                    name="check"
                                    value="ZaloPay"
                                    checked={selectedPaymentMethod === 'ZaloPay'}
                                    onChange={handlePaymentMethodChange}
                                />
                                <img src="https://www.coolmate.me/images/logo-zalopay.svg" alt="" />
                                <p className="payments-item__text">Ví điện tử ZaloPay</p>
                            </div>
                            <div className="payments-item">
                                <input
                                    type="radio"
                                    className="check"
                                    name="check"
                                    value="COD"
                                    checked={selectedPaymentMethod === 'COD'}
                                    onChange={handlePaymentMethodChange}
                                />
                                <img style={{ width: '35px', height: '35px' }} src="https://www.coolmate.me/images/COD.svg" alt="" />
                                <div className="payments-item__text">
                                    <p>COD</p>
                                    <p>Thanh toán khi nhận hàng</p>
                                </div>
                            </div>
                            <div className="payments-item">
                                <input
                                    type="radio"
                                    className="check"
                                    name="check"
                                    value="MoMo"
                                    checked={selectedPaymentMethod === 'MoMo'}
                                    onChange={handlePaymentMethodChange}
                                />
                                <img style={{ width: '35px', height: '35px' }} src="https://www.coolmate.me/images/momo-icon.png" alt="" />
                                <div className="payments-item__text">
                                    <p>MOMO</p>
                                    <p>Ưu đãi đầy bất ngờ</p>
                                </div>
                            </div>
                            <div className="payments-item">
                                <input
                                    type="radio"
                                    className="check"
                                    name="check"
                                    value="VNPay"
                                    checked={selectedPaymentMethod === 'VNPay'}
                                    onChange={handlePaymentMethodChange}
                                />
                                <img style={{ width: '55px' }} src="https://www.coolmate.me/images/vnpay.png" alt="" />
                                <div className="payments-item__text">
                                    <p>Thẻ ATM / Internet Banking</p>
                                    <p>Thẻ tín dụng (Credit card) / Thẻ ghi nợ (Debit card) VNPay QR</p>
                                </div>
                            </div>

                            <p style={{ paddingLeft: '5px', marginTop: '20px' }}>
                                Nếu bạn không hài lòng với sản phẩm của chúng tôi? Bạn hoàn toàn có thể trả lại sản phẩm.
                                Tìm hiểu thêm <a style={{ fontWeight: '700' }} href="/returns">tại đây</a>.
                            </p>

                            <button
                                type="submit"
                                className="btn-pay"
                                disabled={cart.length === 0}
                                style={{ opacity: cart.length === 0 ? 0.5 : 1 }}
                            >
                                Thanh toán <span className="btn-pay--price">{formatCurrency(total)}</span>
                                (<span className="type-payment">{selectedPaymentMethod}</span>)
                            </button>
                        </div>
                    </form>

                    {/* Cart Items */}
                    <div className="list-product">
                        <div className="list-product__inner">
                            <h2>Giỏ hàng ({cart.length} sản phẩm)</h2>

                            {cart.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '8px',
                                    marginTop: '20px'
                                }}>
                                    <i className="fa-solid fa-cart-shopping" style={{ fontSize: '64px', color: '#ddd', marginBottom: '20px' }}></i>
                                    <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>
                                        Giỏ hàng của bạn đang trống
                                    </p>
                                    <a
                                        href="/product"
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
                                    </a>
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
                                                    <div className="list-product__item-type">{item.color}/{item.size}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                                        <div className="quantity-product">
                                                            <span>x{item.quantity}</span>
                                                        </div>
                                                        <div className="product-price">
                                                            <div className="product-new-price">{formatCurrency(item.price)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className='cart-viewing-users mgt--10'>
                                        <i>
                                            <span>Có </span>
                                            <b>5</b>
                                            <span> người đang thêm cùng sản phẩm giống bạn vào giỏ hàng.</span>
                                        </i>
                                    </div>

                                    <div className='discount-block'>
                                        <div className='discount-box'>
                                            <input type="text" placeholder='Nhập mã giảm giá' />
                                            <button disabled>Áp dụng</button>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                                        <div className="cost-detail">
                                            <span>Tạm tính</span>
                                            <span className="tamTinh">{formatCurrency(tamtinh)}</span>
                                        </div>
                                        <div className="cost-detail">
                                            <span>Giảm giá</span>
                                            <span className="sale-off">0đ</span>
                                        </div>
                                        <div className="cost-detail">
                                            <span>Phí giao hàng</span>
                                            <span className="delever-cost">
                                                {shippingFee > 0 ? formatCurrency(shippingFee) : 'Miễn phí'}
                                            </span>
                                        </div>
                                        <div className="total" style={{
                                            marginTop: '16px',
                                            paddingTop: '16px',
                                            borderTop: '2px solid #ddd',
                                            fontSize: '20px',
                                            fontWeight: 'bold'
                                        }}>
                                            <span>Tổng</span>
                                            <span className="total__price" style={{ color: '#ff6b6b' }}>
                                                {formatCurrency(total)}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
