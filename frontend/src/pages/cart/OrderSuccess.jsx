import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './OrderSuccess.css';

export default function OrderSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState('loading'); // loading, success, failed
    const [orderInfo, setOrderInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Get all VNPay parameters from URL
                const vnpParams = {};
                for (let [key, value] of searchParams.entries()) {
                    vnpParams[key] = value;
                }

                // Verify payment with backend
                const response = await axios.get('http://localhost:5001/api/vnpay_return', {
                    params: vnpParams
                });

                if (response.data.success) {
                    setPaymentStatus('success');
                    setOrderInfo({
                        orderId: response.data.orderId,
                        message: response.data.message
                    });
                } else {
                    setPaymentStatus('failed');
                    setErrorMessage(response.data.message || 'Thanh toán thất bại');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setPaymentStatus('failed');
                setErrorMessage('Không thể xác minh thanh toán. Vui lòng liên hệ hỗ trợ.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    const handleTrackOrder = () => {
        if (orderInfo && orderInfo.orderId) {
            // Get phone from sessionStorage if available
            const pendingOrder = sessionStorage.getItem('pendingOrder');
            if (pendingOrder) {
                const { phone } = JSON.parse(pendingOrder);
                navigate('/tracking', { state: { orderId: orderInfo.orderId, phone } });
                sessionStorage.removeItem('pendingOrder');
            } else {
                navigate('/tracking');
            }
        }
    };

    const handleContinueShopping = () => {
        navigate('/product');
    };

    const handleViewProfile = () => {
        navigate('/profile');
    };

    if (paymentStatus === 'loading') {
        return (
            <Fragment>
                <div className="main">
                    <div className="order-success-container">
                        <div className="loading-spinner">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <p>Đang xác minh thanh toán...</p>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <div className="main">
                <div className="order-success-container">
                    {paymentStatus === 'success' ? (
                        <div className="success-content">
                            <div className="success-icon">
                                <i className="fa-solid fa-circle-check"></i>
                            </div>
                            <h1 className="success-title">Thanh toán thành công!</h1>
                            <p className="success-message">
                                Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.
                            </p>
                            {orderInfo && (
                                <div className="order-details">
                                    <p className="order-id">
                                        Mã đơn hàng: <span>{orderInfo.orderId}</span>
                                    </p>
                                </div>
                            )}
                            <div className="action-buttons">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleTrackOrder}
                                >
                                    <i className="fa-solid fa-truck"></i>
                                    Theo dõi đơn hàng
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleContinueShopping}
                                >
                                    <i className="fa-solid fa-shopping-bag"></i>
                                    Tiếp tục mua sắm
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="failed-content">
                            <div className="failed-icon">
                                <i className="fa-solid fa-circle-xmark"></i>
                            </div>
                            <h1 className="failed-title">Thanh toán thất bại</h1>
                            <p className="failed-message">
                                {errorMessage || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}
                            </p>
                            <div className="action-buttons">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/cart')}
                                >
                                    <i className="fa-solid fa-cart-shopping"></i>
                                    Quay lại giỏ hàng
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleContinueShopping}
                                >
                                    <i className="fa-solid fa-shopping-bag"></i>
                                    Tiếp tục mua sắm
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
}
