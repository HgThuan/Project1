import React, { Fragment, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../until/userContext';
import { addToCart } from '../../until/cart';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import StarRating from '../../components/StarRating';

export default function Details() {

    const { user } = useUser();
    const { ma_san_pham } = useParams();

    const [sanpham, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError('');

            try {

                const response = await axios.get(`http://localhost:5001/api/getsp/${ma_san_pham}`);

                if (response.data.success && response.data.product) {
                    const product = response.data.product;
                    setData(product);

                    // Set default selections
                    if (product.mau_sac && product.mau_sac.length > 0) {
                        setSelectedColor(product.mau_sac[0]);
                    }
                    if (product.size && product.size.length > 0) {
                        setSelectedSize(product.size[0]);
                    }
                    setSelectedImage(product.anh_sanpham);
                } else {
                    setError('Không tìm thấy sản phẩm');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [ma_san_pham]);

    const formatCurrency = (number) => {
        if (!number) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    const calculateDiscountedPrice = () => {
        if (!sanpham) return 0;
        const discount = sanpham.giam_gia || 0;
        return sanpham.gia - (sanpham.gia * discount / 100);
    };

    const handleReviewSubmitSuccess = () => {
        // Reload reviews or show success message
        window.scrollTo({ top: document.querySelector('.review-section')?.offsetTop || 0, behavior: 'smooth' });
    };

    const handleQuantityChange = (amount) => {
        setQuantity(prev => {
            const newQuantity = prev + amount;
            return newQuantity < 1 ? 1 : newQuantity;
        });
    };

    const handleAddToCart = async () => {
        if (!selectedColor || !selectedSize) {
            alert('Vui lòng chọn màu sắc và kích thước');
            return;
        }

        const item = {
            id: sanpham._id || sanpham.ma_san_pham, // Ensure ID is correct
            name: sanpham.ten_san_pham,
            img: selectedImage,
            color: selectedColor,
            size: selectedSize,
            price: discountedPrice || sanpham.gia,
            quantity: quantity
        };

        const result = await addToCart(item, user);
        if (result.success) {
            alert(result.message); // Or use a toast if available
        } else {
            alert(result.message);
        }
    };

    if (loading) {
        return (
            <main style={{ padding: '60px 20px', textAlign: 'center' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '48px', color: '#2d4b73' }}></i>
                <p style={{ marginTop: '20px', color: '#666' }}>Đang tải sản phẩm...</p>
            </main>
        );
    }

    if (error || !sanpham) {
        return (
            <main style={{ padding: '60px 20px', textAlign: 'center' }}>
                <i className="fa-solid fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ff6b6b' }}></i>
                <p style={{ marginTop: '20px', color: '#666', fontSize: '18px' }}>{error || 'Sản phẩm không tồn tại'}</p>
                <Link to="/product" style={{
                    display: 'inline-block',
                    marginTop: '20px',
                    padding: '12px 24px',
                    backgroundColor: '#2d4b73',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                }}>
                    Quay lại trang sản phẩm
                </Link>
            </main>
        );
    }

    const discountedPrice = calculateDiscountedPrice();
    const productImages = [sanpham.anh_sanpham, sanpham.anhhover1, sanpham.anhhover2].filter(Boolean);

    return (
        <Fragment>
            <main>
                <div className="container1">
                    <div className="container-product-single">
                        {/* Product Images */}
                        <div className="imgs">
                            <div className="link-page">
                                <Link to="/" className="link-page__homepage">Trang chủ</Link>
                                <span>/</span>
                                <Link to="/product" className="link-page__currentPage">Sản phẩm</Link>
                                <span>/</span>
                                <span className="link-page__currentPage">{sanpham.ten_san_pham}</span>
                            </div>

                            <div className="product-single-img">
                                <img className="product-img__main" src={selectedImage} alt={sanpham.ten_san_pham} />

                                <div className="product-img__option">
                                    {productImages.map((img, index) => (
                                        <div
                                            key={index}
                                            className={`product-img__option-item ${img === selectedImage ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(img)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <img src={img} alt={`${sanpham.ten_san_pham} ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="content">
                            <h1 className="content__heading">{sanpham.ten_san_pham}</h1>

                            {/* Rating Display */}
                            <div className="review-rating" style={{ marginBottom: '16px' }}>
                                <StarRating rating={sanpham.avg_rating || 0} readOnly size={18} />
                                <span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>
                                    ({sanpham.total_reviews || 0} đánh giá)
                                </span>
                            </div>

                            <div className="review-rating">
                                <p className="review-label">
                                    Đã bán: <strong>{sanpham.so_luong_mua || 0}</strong>
                                </p>
                            </div>

                            <div className="review-rating">
                                <p className="review-label">
                                    Số lượng còn: <span className="product-quantity">{sanpham.soluong}</span> sản phẩm
                                </p>
                            </div>

                            {/* Price */}
                            <div style={{ marginTop: '20px' }}>
                                {sanpham.giam_gia > 0 ? (
                                    <>
                                        <p className="content__price" style={{ color: '#ff6b6b', fontSize: '28px', fontWeight: 'bold' }}>
                                            {formatCurrency(discountedPrice)}
                                        </p>
                                        <p style={{ textDecoration: 'line-through', color: '#999', fontSize: '18px' }}>
                                            {formatCurrency(sanpham.gia)}
                                        </p>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            backgroundColor: '#ff6b6b',
                                            color: 'white',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            marginTop: '8px'
                                        }}>
                                            Giảm {sanpham.giam_gia}%
                                        </span>
                                    </>
                                ) : (
                                    <p className="content__price" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                                        {formatCurrency(sanpham.gia)}
                                    </p>
                                )}
                            </div>

                            {sanpham.thongbao && (
                                <div className="content__discount" style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    backgroundColor: '#fff3cd',
                                    borderRadius: '4px',
                                    color: '#856404'
                                }}>
                                    <i className="fa-solid fa-bullhorn"></i> {sanpham.thongbao}
                                </div>
                            )}

                            {/* Color Selection */}
                            {sanpham.mau_sac && sanpham.mau_sac.length > 0 && (
                                <div className="content__color" style={{ marginTop: '24px' }}>
                                    <p className="content__color-heading">
                                        Màu sắc: <b>{selectedColor}</b>
                                    </p>
                                    <div className="content__color-option" style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                        {sanpham.mau_sac.map((color, index) => (
                                            <div
                                                key={index}
                                                className={`content__color-item ${color === selectedColor ? 'active' : ''}`}
                                                onClick={() => setSelectedColor(color)}
                                                style={{
                                                    padding: '8px 16px',
                                                    border: color === selectedColor ? '2px solid #2d4b73' : '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {color}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {sanpham.size && sanpham.size.length > 0 && (
                                <div className="content__size" style={{ marginTop: '24px' }}>
                                    <div className="content__size-header">
                                        <span>Kích thước: <b>{selectedSize}</b></span>
                                    </div>
                                    <div className="content__size-option" style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                        {sanpham.size.map((size, index) => (
                                            <div
                                                key={index}
                                                className={`btn-size ${size === selectedSize ? 'active' : ''}`}
                                                onClick={() => setSelectedSize(size)}
                                                style={{
                                                    minWidth: '50px',
                                                    padding: '10px 16px',
                                                    textAlign: 'center',
                                                    border: size === selectedSize ? '2px solid #2d4b73' : '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: size === selectedSize ? 'bold' : 'normal',
                                                    backgroundColor: size === selectedSize ? '#f0f4f8' : 'white',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {size}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="product-single__actions" style={{ marginTop: '24px' }}>
                                        <div className="quantity">
                                            <button className="btn-decrease" onClick={() => handleQuantityChange(-1)}>-</button>
                                            <span>{quantity}</span>
                                            <button className="btn-increase" onClick={() => handleQuantityChange(1)}>+</button>
                                        </div>
                                        <div className="btn btn-addCart" onClick={handleAddToCart}>
                                            Thêm vào giỏ hàng
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Product Description */}
                            {sanpham.mo_ta && (
                                <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                                    <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Mô tả sản phẩm</h3>
                                    <p style={{ lineHeight: '1.6', color: '#555' }}>{sanpham.mo_ta}</p>
                                </div>
                            )}

                            {/* Product Policy */}
                            <div className="product-single__policy" style={{ marginTop: '32px' }}>
                                <div className="product-policy__item">
                                    <div className="product-policy__icon">
                                        <img src="https://www.coolmate.me/images/icons/icon3.svg" alt="" />
                                    </div>
                                    <p>Đổi trả cực dễ chỉ cần số điện thoại</p>
                                </div>
                                <div className="product-policy__item">
                                    <div className="product-policy__icon">
                                        <img src="https://www.coolmate.me/images/icons/icon4.svg" alt="" />
                                    </div>
                                    <p>Miễn phí vận chuyển cho đơn hàng trên 200k</p>
                                </div>
                                <div className="product-policy__item">
                                    <div className="product-policy__icon">
                                        <img src="https://www.coolmate.me/images/icons/icon5.svg" alt="" />
                                    </div>
                                    <p>60 ngày đổi trả vì bất kỳ lý do gì</p>
                                </div>
                                <div className="product-policy__item">
                                    <div className="product-policy__icon">
                                        <img src="https://www.coolmate.me/images/icons/icon2.svg" alt="" />
                                    </div>
                                    <p>Hotline 1900.27.27.37 hỗ trợ từ 8h30 - 22h mỗi ngày</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="feedback review-section" style={{ marginTop: '60px' }}>
                        <div className="review-title" style={{ marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Đánh giá sản phẩm</h2>
                        </div>

                        {/* Review Form */}
                        <ReviewForm
                            productId={ma_san_pham}
                            user={user}
                            onSubmitSuccess={handleReviewSubmitSuccess}
                        />

                        {/* Review List */}
                        <ReviewList productId={ma_san_pham} />
                    </div>
                </div>
            </main>
        </Fragment>
    );
}
