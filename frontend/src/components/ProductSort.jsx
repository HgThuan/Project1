// ProductSort.jsx
import React from 'react';
import './ProductSort.css';

const ProductSort = ({ sortBy, sortOrder, onSortChange, totalProducts }) => {
    const sortOptions = [
        { value: 'newest', label: 'Mới nhất', icon: '🆕' },
        { value: 'popular', label: 'Bán chạy', icon: '🔥' },
        { value: 'price-asc', label: 'Giá: Thấp → Cao', icon: '💰' },
        { value: 'price-desc', label: 'Giá: Cao → Thấp', icon: '💎' },
        { value: 'name', label: 'Tên A-Z', icon: '📝' }
    ];

    const handleSortChange = (value) => {
        if (value === 'price-asc') {
            onSortChange({ sortBy: 'price', sortOrder: 'asc' });
        } else if (value === 'price-desc') {
            onSortChange({ sortBy: 'price', sortOrder: 'desc' });
        } else {
            onSortChange({ sortBy: value, sortOrder: 'desc' });
        }
    };

    const getCurrentSortValue = () => {
        if (sortBy === 'price') {
            return sortOrder === 'asc' ? 'price-asc' : 'price-desc';
        }
        return sortBy || 'newest';
    };

    return (
        <div className="product-sort">
            <div className="product-sort__info">
                <span className="product-sort__count">
                    {totalProducts > 0 && (
                        <>
                            Hiển thị <strong>{totalProducts}</strong> sản phẩm
                        </>
                    )}
                </span>
            </div>

            <div className="product-sort__controls">
                <label htmlFor="sort-select" className="product-sort__label">
                    Sắp xếp:
                </label>
                <select
                    id="sort-select"
                    className="product-sort__select"
                    value={getCurrentSortValue()}
                    onChange={(e) => handleSortChange(e.target.value)}
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.icon} {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ProductSort;
