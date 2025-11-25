// ProductFilters.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductFilters.css';

const ProductFilters = ({ filters, onFilterChange, onClearAll }) => {
    const [categories, setCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 2000000]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/getalldm');
                setCategories(response.data);
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };
        loadCategories();
    }, []);

    const handlePriceChange = (min, max) => {
        setPriceRange([min, max]);
        onFilterChange({ minPrice: min > 0 ? min : null, maxPrice: max < 2000000 ? max : null });
    };

    const pricePresets = [
        { label: 'Dưới 200K', min: 0, max: 200000 },
        { label: '200K - 500K', min: 200000, max: 500000 },
        { label: '500K - 1M', min: 500000, max: 1000000 },
        { label: 'Trên 1M', min: 1000000, max: 10000000 }
    ];

    const hasActiveFilters = filters.category || filters.gender || filters.onSale || filters.minPrice || filters.maxPrice;

    return (
        <div className="product-filters">
            <div className="product-filters__header">
                <h3>Bộ lọc</h3>
                {hasActiveFilters && (
                    <button onClick={onClearAll} className="product-filters__clear">
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* Gender Filter */}
            <div className="product-filters__section">
                <h4 className="product-filters__section-title">Giới tính</h4>
                <div className="product-filters__options">
                    <label className="product-filters__radio">
                        <input
                            type="radio"
                            name="gender"
                            value=""
                            checked={!filters.gender}
                            onChange={() => onFilterChange({ gender: null })}
                        />
                        <span>Tất cả</span>
                    </label>
                    <label className="product-filters__radio">
                        <input
                            type="radio"
                            name="gender"
                            value="Nam"
                            checked={filters.gender === 'Nam'}
                            onChange={() => onFilterChange({ gender: 'Nam' })}
                        />
                        <span>Nam</span>
                    </label>
                    <label className="product-filters__radio">
                        <input
                            type="radio"
                            name="gender"
                            value="Nữ"
                            checked={filters.gender === 'Nữ'}
                            onChange={() => onFilterChange({ gender: 'Nữ' })}
                        />
                        <span>Nữ</span>
                    </label>
                </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="product-filters__section">
                    <h4 className="product-filters__section-title">Danh mục</h4>
                    <div className="product-filters__options">
                        <label className="product-filters__checkbox">
                            <input
                                type="radio"
                                checked={!filters.category}
                                onChange={() => onFilterChange({ category: null })}
                            />
                            <span>Tất cả</span>
                        </label>
                        {categories.map((cat) => (
                            <label key={cat.ma_danh_muc} className="product-filters__checkbox">
                                <input
                                    type="radio"
                                    checked={filters.category === cat.ma_danh_muc}
                                    onChange={() => onFilterChange({ category: cat.ma_danh_muc })}
                                />
                                <span>{cat.ten_danh_muc}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Range Filter */}
            <div className="product-filters__section">
                <h4 className="product-filters__section-title">Khoảng giá</h4>
                <div className="product-filters__price-presets">
                    {pricePresets.map((preset, index) => (
                        <button
                            key={index}
                            className={`product-filters__price-preset ${priceRange[0] === preset.min && priceRange[1] === preset.max ? 'active' : ''
                                }`}
                            onClick={() => handlePriceChange(preset.min, preset.max)}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
                <div className="product-filters__price-range">
                    <input
                        type="number"
                        placeholder="Từ"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(parseInt(e.target.value) || 0, priceRange[1])}
                        className="product-filters__price-input"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        placeholder="Đến"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(priceRange[0], parseInt(e.target.value) || 2000000)}
                        className="product-filters__price-input"
                    />
                </div>
            </div>

            {/* Sale Filter */}
            <div className="product-filters__section">
                <h4 className="product-filters__section-title">Khuyến mãi</h4>
                <label className="product-filters__checkbox">
                    <input
                        type="checkbox"
                        checked={filters.onSale}
                        onChange={(e) => onFilterChange({ onSale: e.target.checked })}
                    />
                    <span>Chỉ hiển thị sản phẩm đang giảm giá</span>
                </label>
            </div>
        </div>
    );
};

export default ProductFilters;
