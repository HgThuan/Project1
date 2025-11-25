// Product.jsx - Enhanced with Unified API and Filter Components
import { Fragment, useEffect, useState, useCallback } from "react";
import Productt from "../../until/layoutauto";
import useProductFilter from "../../until/fillter";
import { Link, useSearchParams } from "react-router-dom";
import AddProduct from "../../until/cart";
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import ProductFilters from "../../components/ProductFilters";
import ProductSort from "../../components/ProductSort";
import WishlistButton from "../../components/WishlistButton";
import './Product.css';

export default function Product() {
    Productt();
    useProductFilter();

    const [data, setData] = useState([]);
    const [totalProduct, setTotalProduct] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    const itemsPageSize = 12;

    // Extract current filters from URL
    const getCurrentFilters = useCallback(() => ({
        search: searchParams.get('search') || null,
        category: searchParams.get('category') || null,
        gender: searchParams.get('gender') || null,
        onSale: searchParams.get('onSale') === 'true',
        minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : null,
        maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : null,
        sortBy: searchParams.get('sortBy') || 'newest',
        sortOrder: searchParams.get('sortOrder') || 'desc',
        page: parseInt(searchParams.get('page')) || 1
    }), [searchParams]);

    // Load data using unified API endpoint
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const filters = getCurrentFilters();

            const params = {
                page: filters.page,
                limit: itemsPageSize,
                search: filters.search,
                category: filters.category,
                gender: filters.gender,
                onSale: filters.onSale || undefined,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            };

            // Remove null/undefined values
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await axios.get('http://localhost:5001/api/products/search', { params });

            if (response.data.success) {
                setData(response.data.products);
                setTotalProduct(response.data.pagination.totalProducts);
                setPageCount(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Error loading products:", error);
            setData([]);
            setTotalProduct(0);
            setPageCount(0);
        } finally {
            setLoading(false);
        }
    }, [getCurrentFilters]);

    useEffect(() => {
        // Set page to 1 if not present
        if (!searchParams.has('page')) {
            setSearchParams(params => {
                params.set('page', '1');
                return params;
            });
        } else {
            loadData();
        }
    }, [searchParams, setSearchParams, loadData]);

    const handleFilterChange = (newFilters) => {
        setSearchParams(params => {
            // Reset to page 1 when filters change
            params.set('page', '1');

            Object.entries(newFilters).forEach(([key, value]) => {
                if (value === null || value === undefined || value === false || value === '') {
                    params.delete(key);
                } else {
                    params.set(key, value.toString());
                }
            });

            return params;
        });
    };

    const handleSortChange = ({ sortBy, sortOrder }) => {
        setSearchParams(params => {
            params.set('sortBy', sortBy);
            params.set('sortOrder', sortOrder);
            params.set('page', '1'); // Reset to page 1
            return params;
        });
    };

    const handlePageClick = (event) => {
        setSearchParams(params => {
            params.set('page', (event.selected + 1).toString());
            return params;
        });
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearAllFilters = () => {
        setSearchParams({ page: '1' });
    };

    const formatCurrency = (number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
    };

    const currentFilters = getCurrentFilters();
    const hasActiveFilters = currentFilters.search || currentFilters.category ||
        currentFilters.gender || currentFilters.onSale ||
        currentFilters.minPrice || currentFilters.maxPrice;

    return (
        <Fragment>
            <AddProduct />
            <div className="product-page">
                <div className="container1">
                    {/* Page Header */}
                    <div className="product-page__header">
                        <h1 className="product-page__title">
                            {currentFilters.search ? `Kết quả tìm kiếm: "${currentFilters.search}"` : 'Sản phẩm'}
                        </h1>
                        {hasActiveFilters && (
                            <button onClick={handleClearAllFilters} className="product-page__clear-all">
                                <i className="fa-solid fa-times"></i> Xóa tất cả bộ lọc
                            </button>
                        )}
                    </div>

                    <div className="product-page__layout">
                        {/* Filters Sidebar */}
                        <aside className="product-page__sidebar">
                            <ProductFilters
                                filters={currentFilters}
                                onFilterChange={handleFilterChange}
                                onClearAll={handleClearAllFilters}
                            />
                        </aside>

                        {/* Main Content */}
                        <main className="product-page__main">
                            {/* Sort Bar */}
                            <ProductSort
                                sortBy={currentFilters.sortBy}
                                sortOrder={currentFilters.sortOrder}
                                onSortChange={handleSortChange}
                                totalProducts={totalProduct}
                            />

                            {/* Loading State */}
                            {loading && (
                                <div className="product-page__loading">
                                    <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
                                    <p>Đang tải sản phẩm...</p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && data.length === 0 && (
                                <div className="product-page__empty">
                                    <i className="fa-solid fa-box-open fa-4x"></i>
                                    <h3>Không tìm thấy sản phẩm</h3>
                                    <p>Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>
                                    <button onClick={handleClearAllFilters} className="btn-primary">
                                        Xem tất cả sản phẩm
                                    </button>
                                </div>
                            )}

                            {/* Product Grid */}
                            {!loading && data.length > 0 && (
                                <div className="product-grid">
                                    {data.map((item) => {
                                        const hasDiscount = item.giam_gia > 0;
                                        const newPrice = hasDiscount ? item.gia * (1 - item.giam_gia / 100) : item.gia;

                                        return (
                                            <div key={item.ma_san_pham} className="product-grid__item">
                                                <div id={item.ma_san_pham} className="product">
                                                    <div className="product-img-wrap">
                                                        <Link to={`/detail/${item.ma_san_pham}`} className="product-img product-img--small">
                                                            <img className="product-img-1" src={item.anh_sanpham} alt={item.ten_san_pham} />
                                                            <img className="product-img-2" src={item.anhhover1 || item.anh_sanpham} alt={item.ten_san_pham} />
                                                        </Link>
                                                        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                                                            <WishlistButton productId={item.ma_san_pham} />
                                                        </div>
                                                        {hasDiscount && (
                                                            <div className="product-badge product-badge--sale">
                                                                -{item.giam_gia}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="product-content">
                                                        <Link to={`/detail/${item.ma_san_pham}`} className="product-name">
                                                            {item.ten_san_pham}
                                                        </Link>
                                                        <div className="product-price-wrap">
                                                            {hasDiscount ? (
                                                                <>
                                                                    <div className="product-price product-price--new">{formatCurrency(newPrice)}</div>
                                                                    <div className="product-price product-price--old">{formatCurrency(item.gia)}</div>
                                                                </>
                                                            ) : (
                                                                <div className="product-price">{formatCurrency(item.gia)}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {pageCount > 1 && (
                                <ReactPaginate
                                    breakLabel="..."
                                    nextLabel="Trang tiếp ›"
                                    onPageChange={handlePageClick}
                                    pageRangeDisplayed={5}
                                    pageCount={pageCount}
                                    previousLabel="‹ Trước"
                                    containerClassName="pagination"
                                    pageLinkClassName="page-num"
                                    previousLinkClassName="page-num"
                                    nextLinkClassName="page-num"
                                    activeLinkClassName="active"
                                    forcePage={currentFilters.page - 1}
                                />
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}