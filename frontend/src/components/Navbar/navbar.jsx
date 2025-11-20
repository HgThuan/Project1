import React, { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../until/userContext';
import { LoadData } from '../../until/cartactive';
import { MiniCart } from '../../until/cart';
import axios from 'axios';
import './navbar.css'

export default function Navbar() {
    const { user, logoutUser } = useUser();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // Load danh mục từ API khi component mount
    useEffect(() => {
        const loadCategories = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:5001/api/getalldm");
                setCategories(response.data);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    // Load số lượng giỏ hàng
    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCount(totalItems);
        };

        updateCartCount();
        // Lắng nghe sự kiện custom khi giỏ hàng thay đổi
        window.addEventListener('cartUpdated', updateCartCount);
        
        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    const handleLogout = () => {
        logoutUser();
        navigate('/');
        const list = [];
        localStorage.setItem("cart", JSON.stringify(list));
        LoadData();
        // Kích hoạt sự kiện cập nhật giỏ hàng
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const toggleSearch = () => {
        setShowSearch(!showSearch);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const searchInput = document.querySelector('.search__input');
        if (searchInput && searchInput.value.trim()) {
            navigate(`/product?search=${encodeURIComponent(searchInput.value.trim())}`);
            setShowSearch(false);
        }
    };

    return (
        <Fragment>
            <header className="site-header">
                {/* Topbar */}
                <div className="topbar">
                    <div className="topbar__inner">
                        <div className="topbar__right">
                            <Link to="/tracking" className="topbar__item">
                                <i className="fa-solid fa-box"></i> Tra cứu đơn hàng
                            </Link>
                            <Link to="/store" className="topbar__item">
                                <i className="fa-solid fa-location-dot"></i> Tìm cửa hàng
                            </Link>
                            <Link to="/wishlist" className="topbar__item">
                                <i className="fa-solid fa-heart"></i> Yêu thích
                            </Link>
                            <div className="topbar__cart">
                <Link to="/cart" className="topbar__item">
                    <i className="fa-solid fa-bag-shopping"></i> Giỏ hàng
                    {cartCount > 0 && (
                        <span className="topbar__cart-badge">{cartCount}</span>
                    )}
                </Link>
            </div>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="header">
                    <div className="header-inner">
                        {/* Logo */}
                        <div className="header__logo">
                            <Link to="/">
                                <img src="../Images/logo.svg" alt="logo"/>
                                Saveman
                            </Link>
                        </div>

                        {/* Navigation */}
                        <div className="header__navbar hide-on-mobile-tablet">
                            <ul className="header__navbar-list">
                                {/* Shop Menu với Dropdown */}
                                <li className="header__navbar-product">
                                    <Link to="/product" className="header__navbar-link">
                                        Shop
                                    </Link>
                                    
                                    <div className="header__navbar-product-menu-wrap">
                                        <div className="header__navbar-product-menu">
                                            {/* Bộ sưu tập */}
                                            <div className="header__navbar-product-col">
                                                <span className="header__navbar-product-heading">Tất cả sản phẩm</span>
                                                <ul>
                                                    <li>
                                                        <Link to="/product?sort=newest" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Mới nhất</p>
                                                        </Link>
                                                    </li>  
                                                    <li>
                                                        <Link to="/product?sort=best-seller" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Bán chạy nhất</p>
                                                        </Link>
                                                    </li> 
                                                    <li>
                                                        <Link to="/product?filter=sale" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Đang giảm giá</p>
                                                            <p className="header__navbar-product-item-link-content">Ưu đãi đặc biệt</p>
                                                        </Link>
                                                    </li> 
                                                    <li>
                                                        <Link to="/product" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Tất cả sản phẩm</p>
                                                            <p className="header__navbar-product-item-link-content">Khám phá bộ sưu tập</p>
                                                        </Link>
                                                    </li>   
                                                </ul>
                                            </div>
                                            
                                            {/* Danh mục động từ API */}
                                            <div className="header__navbar-product-col">
                                                <span className="header__navbar-product-heading">Danh mục</span>
                                                <ul>
                                                    <li className="header__navbar-product-item">
                                                        <Link to="/product" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Tất cả</p>
                                                        </Link>
                                                    </li>
                                                    
                                                    {/* Loading state */}
                                                    {loading && (
                                                        <li className="header__navbar-product-item">
                                                            <p className="header__navbar-product-item-link-name">Đang tải...</p>
                                                        </li>
                                                    )}
                                                    
                                                    {/* Render danh mục động */}
                                                    {categories.map((cat) => (
                                                        <li key={cat.ma_danh_muc} className="header__navbar-product-item">
                                                            <Link 
                                                                to={`/product?category=${cat.ma_danh_muc}`}
                                                                className="header__navbar-product-item-link"
                                                            >
                                                                <p className="header__navbar-product-item-link-name">{cat.ten_danh_muc}</p>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                    
                                                    {/* Empty state */}
                                                    {!loading && categories.length === 0 && (
                                                        <li className="header__navbar-product-item">
                                                            <p className="header__navbar-product-item-link-name">Không có danh mục</p>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>

                                            {/* Xu hướng */}
                                            <div className="header__navbar-product-col">
                                                <span className="header__navbar-product-heading">Xu hướng</span>
                                                <ul>
                                                    <li className="header__navbar-product-item">
                                                        <Link to="/product?trend=new" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Hàng mới về <span className="new-tag">NEW</span></p>
                                                        </Link>
                                                    </li>
                                                    <li className="header__navbar-product-item">
                                                        <Link to="/product?sort=discount" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Giảm nhiều nhất</p>
                                                        </Link>
                                                    </li>
                                                    <li className="header__navbar-product-item">
                                                        <Link to="/product?collection=basics" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Basic Items<span className="hot-tag">HOT</span></p>
                                                        </Link>
                                                    </li>
                                                    <li className="header__navbar-product-item">
                                                        <Link to="/product?type=premium" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Premium Collection</p>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* Theo nhu cầu */}
                                            <div className="header__navbar-product-col">
                                                <span className="header__navbar-product-heading">Theo nhu cầu</span>
                                                <ul>
                                                    <li className="header__navbar-product-item">
                                                        <Link to="/product?gender=Nam" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Thời trang Nam</p>
                                                        </Link>
                                                    </li>
                                                    <li className="header__navbar-product-item">
                                                        <Link to="/product?gender=Nữ" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Thời trang Nữ</p>
                                                        </Link>
                                                    </li>
                                                    <li className="header__navbar-product-item">
                                                        <Link to="/product?usage=daily" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Mặc hàng ngày</p>
                                                        </Link>
                                                    </li>
                                                    <li className="header__navbar-product-item">
                                                        <Link to="/product?usage=sport" className="header__navbar-product-item-link">
                                                            <p className="header__navbar-product-item-link-name">Đồ thể thao</p>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </li>

                                {/* Menu items chính */}
                                <li className="header__navbar-item">
                                    <Link to="/product?gender=Nam" className="header__navbar-link">Nam</Link>
                                </li>

                                <li className="header__navbar-item">
                                    <Link to="/product?gender=Nữ" className="header__navbar-link">Nữ</Link>
                                </li>

                                <li className="header__navbar-item">
                                    <Link to="/product?filter=sale" className="header__navbar-link">Sale off</Link>
                                </li>

                                <li className="header__navbar-item">
                                    <Link to="/size-guide" className="header__navbar-link">Chọn size</Link>
                                </li>

                                <li className="header__navbar-item">
                                    <Link to="/blog" className="header__navbar-link">Blog</Link>
                                </li>
                            </ul>
                        </div>

                        {/* Header Actions */}
                        <div className="header__actions">
                            {/* Search */}
                            <div className="header__actions-search">
                                <button className="header__actions-link" onClick={toggleSearch}>
                                    <i className="fa-solid fa-magnifying-glass fa-xl"></i>
                                </button>
                            </div>

                            {/* Account */}
                            <div className="header__actions-account">
                                <Link to={user ? "/profile" : "/DangNhap"} className="header__actions-link">
                                    <i className="fa-solid fa-user fa-xl"></i>
                                </Link>
                                <div className="dropdown-menu">
                                    {user ? (
                                        <>
                                            <Link to="/profile" className="dropdown-item">
                                                <i className="fas fa-user"></i> {user.name}
                                            </Link>
                                            <Link to="/orders" className="dropdown-item">
                                                <i className="fas fa-shopping-bag"></i> Đơn hàng
                                            </Link>
                                            <Link to="/wishlist" className="dropdown-item">
                                                <i className="fas fa-heart"></i> Yêu thích
                                            </Link>
                                            <button className="dropdown-item" onClick={handleLogout}>
                                                <i className="fas fa-sign-out-alt"></i> Đăng xuất
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/DangNhap" className="dropdown-item">
                                                <i className="fas fa-sign-in-alt"></i> Đăng nhập
                                            </Link>
                                            <Link to="/DangKy" className="dropdown-item">
                                                <i className="fas fa-user-plus"></i> Đăng ký
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                           {/* Cart */}
                        
                        </div>
                    </div> 

                    {/* Search Popup */}
                    <div className="search" style={{ display: showSearch ? 'block' : 'none' }}>
                        <div className="search__inner">
                            <form onSubmit={handleSearchSubmit}>
                                <input 
                                    placeholder="Tìm kiếm sản phẩm..." 
                                    className="search__input" 
                                    type="text"
                                />
                                <button type="submit" className="search__button">
                                    <img 
                                        className="search__img" 
                                        src="/Images/icon-search.svg" 
                                        alt="Search"
                                    />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>
        </Fragment>
    )
}