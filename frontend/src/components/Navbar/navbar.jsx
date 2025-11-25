import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../until/userContext';
import { LoadData } from '../../until/cartactive';
import { MiniCart } from '../../until/cart';
import axios from 'axios';
import './navbar.css';

export default function Navbar() {
    const { user, logoutUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [showCart, setShowCart] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const cartRef = useRef(null);
    const searchRef = useRef(null);

    // Check if a path is active
    const isActivePath = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        const loadCategories = async () => {
            setLoading(true);
            try {
                const res = await axios.get("http://localhost:5001/api/getalldm");
                setCategories(res.data);
            } catch (err) {
                console.error("Lỗi tải danh mục:", err);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const updateCartCount = async () => {
            try {
                if (user && user.id) {
                    // Get cart count from backend for logged-in users
                    const response = await axios.get(`http://localhost:5001/api/cart?userId=${user.id}`);
                    if (response.data.success) {
                        const total = response.data.cart.reduce((sum, item) => sum + item.so_luong, 0);
                        setCartCount(total);
                    }
                } else {
                    // Get cart count from localStorage for guests
                    let cart = [];
                    try {
                        const cartData = localStorage.getItem("cart");
                        cart = cartData ? JSON.parse(cartData) : [];
                    } catch (e) {
                        console.error("Error parsing cart data:", e);
                        cart = [];
                    }
                    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
                    setCartCount(total);
                }
            } catch (error) {
                console.error("Error updating cart count:", error);
                // Fallback to localStorage if backend fails
                let cart = [];
                try {
                    const cartData = localStorage.getItem("cart");
                    cart = cartData ? JSON.parse(cartData) : [];
                } catch (e) {
                    console.error("Error parsing cart data:", e);
                    cart = [];
                }
                const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
                setCartCount(total);
            }
        };

        updateCartCount();
        window.addEventListener('cartUpdated', updateCartCount);
        return () => window.removeEventListener('cartUpdated', updateCartCount);
    }, [user]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setShowSearch(false);
    }, [location.pathname]);

    // Click outside to close cart/search
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cartRef.current && !cartRef.current.contains(e.target)) {
                setShowCart(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard support (Escape to close)
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setShowSearch(false);
                setShowCart(false);
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    // Prevent scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const handleLogout = () => {
        logoutUser();
        navigate('/');
        localStorage.setItem("cart", JSON.stringify([]));
        LoadData();
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const toggleSearch = () => {
        setShowSearch(prev => !prev);
        if (!showSearch) {
            setTimeout(() => {
                document.querySelector('.search__input')?.focus();
            }, 100);
        }
    };

    const toggleCart = () => setShowCart(prev => !prev);
    const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

    // Close cart on navigation
    useEffect(() => {
        const handleCloseCart = () => setShowCart(false);
        window.addEventListener('closeCart', handleCloseCart);
        return () => window.removeEventListener('closeCart', handleCloseCart);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const input = document.querySelector('.search__input');
        if (input?.value.trim()) {
            navigate(`/product?search=${encodeURIComponent(input.value.trim())}`);
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
                            <Link to="/wishlist" className={`topbar__item ${isActivePath('/wishlist') ? 'active' : ''}`}>
                                <i className="fa-solid fa-heart"></i> Yêu thích
                            </Link>
                            <Link to="/cart" className={`topbar__item ${isActivePath('/cart') ? 'active' : ''}`}>
                                <i className="fa-solid fa-bag-shopping"></i> Giỏ hàng
                                {cartCount > 0 && <span className="topbar__cart-badge">{cartCount}</span>}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="header">
                    <div className="header-inner">
                        <div className="header__logo">
                            <Link to="/">
                                <img src="../Images/logo.svg" alt="Saveman" />
                                Saveman
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="header__navbar hide-on-mobile-tablet" role="navigation" aria-label="Main navigation">
                            <ul className="header__navbar-list">
                                {/* SHOP MEGA MENU */}
                                <li className="header__navbar-product">
                                    <Link
                                        to="/product"
                                        className={`header__navbar-link ${isActivePath('/product') ? 'active' : ''}`}
                                    >
                                        Shop
                                    </Link>

                                    <div className="header__navbar-product-menu-wrap">
                                        <div className="header__navbar-product-menu">
                                            {/* Featured Banner */}
                                            <div className="header__navbar-product-col-featured">
                                                <img
                                                    src="https://media.coolmate.me/cdn-cgi/image/width=400,quality=80,format=auto/uploads/January2024/summer-collection.jpg"
                                                    alt="Summer Collection 2025"
                                                    className="header__navbar-product-featured-img"
                                                />
                                                <h3 className="header__navbar-product-featured-title">Summer Collection 2025</h3>
                                                <p className="header__navbar-product-featured-desc">Khám phá ngay những thiết kế mới nhất với chất liệu cao cấp và form dáng hoàn hảo.</p>
                                                <div className="header__navbar-product-featured-price">Từ 299.000đ</div>
                                            </div>

                                            {/* Column 1 */}
                                            <div className="header__navbar-product-col">
                                                <span className="header__navbar-product-heading">Tất cả sản phẩm</span>
                                                <ul>
                                                    <li><Link to="/product?sort=newest" className="header__navbar-product-item-link">
                                                        <span className="header__navbar-product-item-link-name">Mới nhất</span>
                                                    </Link></li>
                                                    <li><Link to="/product?sort=best-seller" className="header__navbar-product-item-link">
                                                        <span className="header__navbar-product-item-link-name">Bán chạy nhất</span>
                                                    </Link></li>
                                                    <li><Link to="/product?filter=sale" className="header__navbar-product-item-link">
                                                        <span className="header__navbar-product-item-link-name">Đang giảm giá</span>
                                                    </Link></li>
                                                    <li><Link to="/product" className="header__navbar-product-item-link">
                                                        <span className="header__navbar-product-item-link-name">Xem tất cả</span>
                                                    </Link></li>
                                                </ul>
                                            </div>

                                            {/* Column 2 – Dynamic Categories */}
                                            <div className="header__navbar-product-col">
                                                <span className="header__navbar-product-heading">Danh mục</span>
                                                <ul>
                                                    <li><Link to="/product" className="header__navbar-product-item-link">
                                                        <span className="header__navbar-product-item-link-name">Tất cả sản phẩm</span>
                                                    </Link></li>
                                                    {loading && <li><span style={{ color: '#999', padding: '10px 16px' }}>Đang tải...</span></li>}
                                                    {categories.map(cat => (
                                                        <li key={cat.ma_danh_muc}>
                                                            <Link to={`/product?category=${cat.ma_danh_muc}`} className="header__navbar-product-item-link">
                                                                <span className="header__navbar-product-item-link-name">{cat.ten_danh_muc}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Column 3 */}
                                            <div className="header__navbar-product-col">
                                                <span className="header__navbar-product-heading">Xu hướng & Bộ sưu tập</span>
                                                <ul>
                                                    <li><Link to="/product?trend=new" className="header__navbar-product-item-link">
                                                        <span className="header__navbar-product-item-link-name">
                                                            Hàng mới về <span className="new-tag">New</span>
                                                        </span>
                                                    </Link></li>
                                                    <li><Link to="/product?collection=summer" className="header__navbar-product-item-link">
                                                        <span className="header__navbar-product-item-link-name">Summer 2025</span>
                                                    </Link></li>
                                                    <li><Link to="/product?collection=basics" className="header__navbar-product-item-link">
                                                        <span className="header__navbar-product-item-link-name">
                                                            Basic Items <span className="hot-tag">Hot</span>
                                                        </span>
                                                    </Link></li>
                                                    <li><Link to="/product?type=premium" className="header__navbar-product-item-link">
                                                        <span className="header__navbar-product-item-link-name">Premium Line</span>
                                                    </Link></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </li>

                                <li><Link to="/product?gender=Nam" className={`header__navbar-link ${isActivePath('/product') && location.search.includes('Nam') ? 'active' : ''}`}>Nam</Link></li>
                                <li><Link to="/product?gender=Nữ" className={`header__navbar-link ${isActivePath('/product') && location.search.includes('Nữ') ? 'active' : ''}`}>Nữ</Link></li>
                                <li><Link to="/product?filter=sale" className="header__navbar-link sale">Sale off</Link></li>
                                <li><Link to="/size-guide" className={`header__navbar-link ${isActivePath('/size-guide') ? 'active' : ''}`}>Chọn size</Link></li>
                                <li><Link to="/blog" className={`header__navbar-link ${isActivePath('/blog') ? 'active' : ''}`}>Blog</Link></li>
                            </ul>
                        </nav>

                        {/* Actions */}
                        <div className="header__actions">
                            {/* Hamburger Menu (Mobile) */}
                            <button
                                className="hamburger-menu show-on-mobile-tablet"
                                onClick={toggleMobileMenu}
                                aria-label="Toggle menu"
                                aria-expanded={mobileMenuOpen}
                            >
                                <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} fa-xl`}></i>
                            </button>

                            <button className="header__actions-link" onClick={toggleSearch} aria-label="Search">
                                <i className="fa-solid fa-magnifying-glass fa-xl"></i>
                            </button>

                            <div className="header__actions-cart" ref={cartRef}>
                                <button className="header__actions-link" onClick={toggleCart} aria-label="Cart">
                                    <i className="fa-solid fa-bag-shopping fa-xl"></i>
                                    {cartCount > 0 && <span className="header__actions-cart-notify">{cartCount}</span>}
                                </button>
                                {showCart && (
                                    <div className="mini-cart-dropdown">
                                        <MiniCart />
                                    </div>
                                )}
                            </div>

                            <div className="header__actions-account">
                                <Link to={user ? "/profile" : "/DangNhap"} className="header__actions-link" aria-label="Account">
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
                        </div>
                    </div>

                    {/* Search Popup */}
                    <div
                        className={`search ${showSearch ? 'active' : ''}`}
                        ref={searchRef}
                        role="search"
                    >
                        <div className="search__inner">
                            <form onSubmit={handleSearchSubmit}>
                                <input
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="search__input"
                                    type="text"
                                    aria-label="Search products"
                                />
                                <button type="submit" className="search__button" aria-label="Submit search">
                                    <img className="search__img" src="/Images/icon-search.svg" alt="" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <div className={`mobile-backdrop ${mobileMenuOpen ? 'show' : ''}`} onClick={toggleMobileMenu}></div>
            <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`} role="navigation" aria-label="Mobile navigation">
                <div className="mobile-nav__header">
                    <div className="mobile-nav__logo">Saveman</div>
                    <button onClick={toggleMobileMenu} className="mobile-nav__close" aria-label="Close menu">
                        <i className="fa-solid fa-times fa-xl"></i>
                    </button>
                </div>

                <div className="mobile-nav__content">
                    {/* User Info */}
                    {user && (
                        <div className="mobile-nav__user">
                            <i className="fas fa-user-circle fa-2x"></i>
                            <span>{user.name}</span>
                        </div>
                    )}

                    {/* Menu Items */}
                    <ul className="mobile-nav__list">
                        <li><Link to="/" className={isActivePath('/') ? 'active' : ''}>
                            <i className="fa-solid fa-home"></i> Trang chủ
                        </Link></li>
                        <li><Link to="/product" className={isActivePath('/product') ? 'active' : ''}>
                            <i className="fa-solid fa-shop"></i> Sản phẩm
                        </Link></li>
                        <li><Link to="/product?gender=Nam">
                            <i className="fa-solid fa-mars"></i> Nam
                        </Link></li>
                        <li><Link to="/product?gender=Nữ">
                            <i className="fa-solid fa-venus"></i> Nữ
                        </Link></li>
                        <li><Link to="/product?filter=sale" className="sale-link">
                            <i className="fa-solid fa-tag"></i> Sale off
                        </Link></li>
                        <li><Link to="/cart" className={isActivePath('/cart') ? 'active' : ''}>
                            <i className="fa-solid fa-bag-shopping"></i> Giỏ hàng
                            {cartCount > 0 && <span className="mobile-nav__badge">{cartCount}</span>}
                        </Link></li>
                        <li><Link to="/orders" className={isActivePath('/orders') ? 'active' : ''}>
                            <i className="fa-solid fa-box"></i> Đơn hàng
                        </Link></li>
                        <li><Link to="/wishlist" className={isActivePath('/wishlist') ? 'active' : ''}>
                            <i className="fa-solid fa-heart"></i> Yêu thích
                        </Link></li>
                        <li><Link to="/size-guide" className={isActivePath('/size-guide') ? 'active' : ''}>
                            <i className="fa-solid fa-ruler"></i> Hướng dẫn chọn size
                        </Link></li>
                        <li><Link to="/blog" className={isActivePath('/blog') ? 'active' : ''}>
                            <i className="fa-solid fa-newspaper"></i> Blog
                        </Link></li>
                    </ul>

                    {/* Categories */}
                    {categories.length > 0 && (
                        <div className="mobile-nav__categories">
                            <h3>Danh mục</h3>
                            <ul>
                                {categories.map(cat => (
                                    <li key={cat.ma_danh_muc}>
                                        <Link to={`/product?category=${cat.ma_danh_muc}`}>
                                            {cat.ten_danh_muc}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Auth Actions */}
                    <div className="mobile-nav__actions">
                        {user ? (
                            <button onClick={handleLogout} className="btn-logout">
                                <i className="fas fa-sign-out-alt"></i> Đăng xuất
                            </button>
                        ) : (
                            <>
                                <Link to="/DangNhap" className="btn-login">
                                    <i className="fas fa-sign-in-alt"></i> Đăng nhập
                                </Link>
                                <Link to="/DangKy" className="btn-register">
                                    <i className="fas fa-user-plus"></i> Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </Fragment>
    );
}