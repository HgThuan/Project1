import React, { Fragment, useEffect, useState } from 'react';
import Silde from '../../components/slider/silde';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AddProduct from '../../until/cart';
import WishlistButton from '../../components/WishlistButton';

export default function Home() {
    const [topSellers, setTopSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            // Fetch best sellers
            const response = await axios.get('http://localhost:5001/api/sanpham/filter/best-seller?limit=4');
            if (response.data && response.data.success) {
                setTopSellers(response.data.products);
            }
        } catch (error) {
            console.error("Error loading top sellers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    return (
        <Fragment>
            <AddProduct />
            <div className="main">
                <Silde />

                {/* Search Section */}
                <section className="homepage-search">
                    <div className="container-medium">
                        <div className="homepage-search-wrapper">
                            <h2 className="homepage-search-heading"> Bạn tìm gì hôm nay? </h2>
                            <div className="homepage-search-inner">
                                <form action="/product" method="GET">
                                    <input type="text" name="search" placeholder="Hãy thử bắt đầu với Quần đen xem sao" className="homepage-search-control" />
                                    <button className="homepage-search-submit">
                                        <i className="fa-solid fa-magnifying-glass fa-2xl"></i>
                                    </button>
                                </form>
                            </div>
                            <div className="homepage-search-content">
                                <p className="home-search-description"> Từ khóa nổi bật ngày hôm nay</p>
                                <div className="homepage-search-buttons">
                                    <Link to="/product?search=Chạy bộ" className="homepage-search-button">Chạy bộ</Link>
                                    <Link to="/product?search=Giầy thể thao" className="homepage-search-button">Giầy thể thao</Link>
                                    <Link to="/product?search=Áo Polo" className="homepage-search-button">Áo Polo</Link>
                                    <Link to="/product?search=Quần jean" className="homepage-search-button">Quần jean</Link>
                                    <Link to="/product?search=Áo ngủ" className="homepage-search-button">Áo ngủ</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Collections Section */}
                <section className="homepage-collections">
                    <div className="container--full">
                        <div className="homepage-collections__wrapper">
                            <div className="homepage-collections__item">
                                <Link to="/product" className="collection-grid">
                                    <div className="collection-grid__thumbnail">
                                        <picture style={{ width: '100%' }}>
                                            <img src="../Images/Tatcasanpham.png" alt="Tất cả sản phẩm" />
                                        </picture>
                                    </div>
                                </Link>
                            </div>
                            <div className="homepage-collections__item">
                                <Link to="/product?category=daily-wear" className="collection-grid">
                                    <div className="collection-grid__thumbnail">
                                        <picture style={{ width: '100%' }}>
                                            <img src="../Images/domachangngay.png" alt="Đồ mặc hàng ngày" />
                                        </picture>
                                    </div>
                                </Link>
                            </div>
                            <div className="homepage-collections__item">
                                <Link to="/product?category=sports" className="collection-grid">
                                    <div className="collection-grid__thumbnail">
                                        <picture style={{ width: '100%' }}>
                                            <img src="../Images/dothethao.png" alt="Đồ thể thao" />
                                        </picture>
                                    </div>
                                </Link>
                            </div>
                            <div className="homepage-collections__item">
                                <Link to="/product?category=indoor" className="collection-grid">
                                    <div className="collection-grid__thumbnail">
                                        <picture style={{ width: '100%' }}>
                                            <img src="../Images/domactrongnha.png" alt="Đồ mặc trong nhà" />
                                        </picture>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Top Seller Section (Dynamic) */}
                <section className="homepage-product">
                    <div className="container">
                        <div className="homepage-product__heading"> TOP SELLER</div>
                        <div className="bestseller__content active">
                            <div className="row">
                                {loading ? (
                                    <div style={{ width: '100%', textAlign: 'center', padding: '20px' }}>Đang tải...</div>
                                ) : (
                                    topSellers.map((item) => (
                                        <div key={item.ma_san_pham} className="col p-2-4">
                                            <div id={item.ma_san_pham} className="product">
                                                <div className="product-img-wrap" style={{ marginBottom: '8px' }}>
                                                    <Link to={`/detail/${item.ma_san_pham}`} className="product-img product-img--small">
                                                        <img className="product-img-1" src={item.anh_sanpham} alt={item.ten_san_pham} />
                                                        <img className="product-img-2" src={item.anhhover1 || item.anh_sanpham} alt={item.ten_san_pham} />
                                                    </Link>
                                                    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                                                        <WishlistButton productId={item.ma_san_pham} />
                                                    </div>
                                                    <div className="product-size">
                                                        <p>Thêm nhanh vào giỏ hàng +</p>
                                                        {item.size && item.size.map((s, index) => (
                                                            <div key={index} className="btn btn--size">{s}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="product-content">
                                                    <div style={{ display: 'none' }} className="product-content__option ">
                                                        <div className="product-content__option-item-wrap active">
                                                            <span data={item.mau_sac ? item.mau_sac[0] : ''}></span>
                                                        </div>
                                                    </div>
                                                    <Link to={`/detail/${item.ma_san_pham}`} className="product-name">{item.ten_san_pham}</Link>
                                                    <div className="product-price-wrap">
                                                        <div className="product-price-new">{formatCurrency(item.gia)}</div>
                                                        {item.giam_gia > 0 && (
                                                            <div className="product-percent">-{item.giam_gia}%</div>
                                                        )}
                                                    </div>
                                                    <div className="product-discount">
                                                        {item.thongbao || 'Sản phẩm bán chạy'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Basic Section */}
                <section className="homepage-basic">
                    <div className="homepage-basic__wrapper">
                        <div className="homepage-basic__content">
                            <h2>Underwear 7 Days</h2>
                            <p>
                                Nhập <span style={{ fontWeight: 'bold' }}>QuanSip </span>
                                - Tặng quần mặc nhà Collmate Basics
                            </p>
                            <Link to="/product?category=underwear" className="btn-primary"> Mua ngay</Link>
                        </div>
                        <div className="homepage-basic__image">
                            <Link to="/product?category=underwear">
                                <picture style={{ width: '100%' }}>
                                    <img src="../Images/anhquansip.png" alt="quansip" />
                                </picture>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Brands Section */}
                <section className="homepage-brands">
                    <div className="container--full">
                        <div className="homepage-brands__wrapper">
                            <div className="homepage-banner__item homepage-banner__item--cm24">
                                <div className="homepage-brands__image">
                                    <img src="../Images/anhphanbrands.png" alt="" />
                                </div>
                                <div className="homepage-brands__content">
                                    <h2> 84RISING*</h2>
                                    <p>
                                        Local brand dành cho giới trẻ
                                        <br className="mobile--hidden" />
                                        <b style={{ fontSize: '130%' }}>Áo thun đón hè chỉ từ 199k </b>
                                    </p>
                                    <Link to="/product?brand=84rising" className="btn-brands"> Mua ngay</Link>
                                </div>
                            </div>
                            <div className="homepage-banner__item homepage-banner__item--cm24">
                                <div className="homepage-brands__image">
                                    <img src="../Images/cm24.png" alt="" />
                                </div>
                                <div className="homepage-brands__content">
                                    <h2> CM24</h2>
                                    <p>
                                        Thương hiệu chăm sóc cá nhân cho nam giới
                                        <br className="mobile--hidden" />
                                        <b style={{ fontSize: '130%' }}>Comboo 3 sản phẩm chỉ từ 249k </b>
                                    </p>
                                    <Link to="/product?brand=cm24" className="btn-brands"> Mua ngay</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Hashtag Section */}
                <section className="homepage-hashtag">
                    <div className="container--full">
                        <div className="homepage-hashtag__inner">
                            <p className="homepage-hashtag__left">
                                Các sản phẩm tự hào sản xuất tại Việt Nam và dành cho người Việt Nam!
                                <br />
                                Hơn 3 triệu sản phẩm đã được gửi đến tay khách hàng sử dụng và hài lòng!
                            </p>
                            <p className="homepage-hashtag__title">#Saveman</p>
                            <p className="homepage-hashtag__right">
                                Giải pháp mua sắm
                                <br />
                                Cả tủ đồ cho nam giới
                            </p>
                        </div>
                    </div>
                </section>

                {/* Service Section */}
                <section className="homepage-service">
                    <div className="container--full">
                        <div className="homepage-service__grid">
                            <div className="homepage-service__item">
                                <div className="infomation-card">
                                    <a href="#" className="infomation-card">
                                        <div className="infomation-card__thumbnail">
                                            <img src="../Images/duahopquacauchuyen.png" alt="" />
                                        </div>
                                        <div className="infomation-card__buttons">
                                            <span className="infomation-card__title">Chăm sóc tận tình</span>
                                            <span className="infomation-card__button">
                                                <i className="fa-solid fa-arrow-up fa-rotate-45"></i>
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div className="homepage-service__item">
                                <div className="infomation-card">
                                    <a href="#" className="infomation-card">
                                        <div className="infomation-card__thumbnail">
                                            <img src="../Images/dichvuhailong100.png" alt="" />
                                        </div>
                                        <div className="infomation-card__buttons">
                                            <span className="infomation-card__title">Dịch vụ hài lòng 100% </span>
                                            <span className="infomation-card__button">
                                                <i className="fa-solid fa-arrow-up fa-rotate-45"></i>
                                            </span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="homepage-service__list">
                            <div className="homepage-service__card">
                                <p className="homepage-service__text">
                                    Miễn phí vận chuyển cho
                                    <br />
                                    đơn hàng trên 200k
                                </p>
                            </div>
                            <div className="homepage-service__card">
                                <p className="homepage-service__text">
                                    60 ngày đổi trả
                                    <br />
                                    vì bất kì lí do gì
                                </p>
                            </div>
                            <div className="homepage-service__card">
                                <p className="homepage-service__text">
                                    đến tận nơi nhận hàng trả
                                    <br />
                                    hoàn tiền trong 24h
                                </p>
                            </div>
                            <div className="homepage-service__card">
                                <p className="homepage-service__text">
                                    Tự hào sản xuất
                                    <br />
                                    Tại Việt Nam
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* IRL Section */}
                <section className="homepage-irl">
                    <div className="container--full">
                        <h2 className="homepage-irl__title">Nhật kí </h2>
                        <p className="homepage-irl__description">Chia sẻ diện mạo mới </p>
                        <div className="homepage-irl__slide slick-slider">
                            <button className="slick-arrow slick-prev"> <i className="fa-solid fa-arrow-left fa-2xl"></i></button>
                            <div className="slick-list">
                                <img src="../Images/homepage-irl1.png" alt="" />
                                <img src="../Images/homepage-irl2.png" alt="" />
                                <img src="../Images/homepage-irl3.png" alt="" />
                                <img src="../Images/homepage-irl4.png" alt="" />
                                <img src="../Images/homepage-irl5.png" alt="" />
                            </div>
                            <button className="slick-arrow slick-next"> <i className="fa-solid fa-arrow-right fa-2xl"></i> </button>
                        </div>
                    </div>
                </section>

            </div>
        </Fragment>
    );
}
