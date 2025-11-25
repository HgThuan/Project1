import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../until/userContext';
import { Link } from 'react-router-dom';

export default function Wishlist() {
    const { user } = useUser();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.id) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const res = await axios.get(`http://localhost:5001/api/wishlist/${user.id}`);
            if (res.data.success) {
                setWishlist(res.data.wishlist);
            }
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?")) {
            try {
                await axios.delete(`http://localhost:5001/api/wishlist/remove/${id}`);
                setWishlist(prev => prev.filter(item => item._id !== id));
            } catch (error) {
                console.error("Error removing item:", error);
            }
        }
    };

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    if (!user) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <h2>Vui lòng đăng nhập để xem danh sách yêu thích</h2>
                <Link to="/DangNhap" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', backgroundColor: '#2d4b73', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>Đăng nhập ngay</Link>
            </div>
        );
    }

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Đang tải...</div>;

    return (
        <div className="main">
            <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
                <h2 style={{ marginBottom: '30px', fontSize: '28px', color: '#2d4b73' }}>
                    <i className="fa-solid fa-heart" style={{ marginRight: '10px' }}></i>
                    Danh sách yêu thích
                </h2>

                {wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                        <p style={{ fontSize: '18px', color: '#666' }}>Danh sách yêu thích của bạn đang trống</p>
                        <Link to="/product" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', backgroundColor: '#2d4b73', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>Khám phá sản phẩm</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', paddingBottom: '40px' }}>
                        {wishlist.map(item => (
                            <div key={item._id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', transition: 'box-shadow 0.2s', backgroundColor: '#fff' }}>
                                <div style={{ position: 'relative', paddingTop: '100%' }}>
                                    <img
                                        src={item.product.anh_sanpham}
                                        alt={item.product.ten_san_pham}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button
                                        onClick={() => handleRemove(item._id)}
                                        style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                                            width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        title="Xóa"
                                    >
                                        <i className="fa-solid fa-times" style={{ color: '#ff4d4f' }}></i>
                                    </button>
                                </div>
                                <div style={{ padding: '15px' }}>
                                    <h3 style={{ fontSize: '16px', marginBottom: '10px', height: '40px', overflow: 'hidden' }}>
                                        <Link to={`/detail/${item.product.ma_san_pham}`} style={{ color: '#333', textDecoration: 'none' }}>
                                            {item.product.ten_san_pham}
                                        </Link>
                                    </h3>
                                    <div style={{ fontWeight: 'bold', color: '#2d4b73', marginBottom: '15px' }}>
                                        {formatCurrency(item.product.gia)}
                                    </div>
                                    <Link
                                        to={`/detail/${item.product.ma_san_pham}`}
                                        style={{
                                            display: 'block', width: '100%', padding: '10px', textAlign: 'center',
                                            backgroundColor: '#2d4b73', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: '600'
                                        }}
                                    >
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
