import React, { useState, useEffect } from 'react';
import './SizeManager.css';

const SizeManager = ({ initialSizes = [], onChange }) => {
    const [sizes, setSizes] = useState(initialSizes);
    const [newSize, setNewSize] = useState('');
    const [newQuantity, setNewQuantity] = useState('');

    // Common size presets
    const commonSizes = ['S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

    useEffect(() => {
        setSizes(initialSizes);
    }, [initialSizes]);

    const handleAddSize = () => {
        if (!newSize.trim() || !newQuantity) {
            alert('Vui lòng nhập size và số lượng');
            return;
        }

        const quantity = parseInt(newQuantity);
        if (isNaN(quantity) || quantity < 0) {
            alert('Số lượng phải là số dương');
            return;
        }

        // Check if size already exists
        const exists = sizes.find(s => s.size.toLowerCase() === newSize.trim().toLowerCase());
        if (exists) {
            alert('Size này đã tồn tại');
            return;
        }

        const newSizeObj = {
            size: newSize.trim(),
            so_luong: quantity,
            gia_tang_them: 0
        };

        const updatedSizes = [...sizes, newSizeObj];
        setSizes(updatedSizes);
        onChange(updatedSizes);

        // Clear inputs
        setNewSize('');
        setNewQuantity('');
    };

    const handleQuickAdd = (presetSize) => {
        const exists = sizes.find(s => s.size === presetSize);
        if (exists) {
            alert('Size này đã tồn tại');
            return;
        }

        const newSizeObj = {
            size: presetSize,
            so_luong: 0,
            gia_tang_them: 0
        };

        const updatedSizes = [...sizes, newSizeObj];
        setSizes(updatedSizes);
        onChange(updatedSizes);
    };

    const handleUpdateQuantity = (index, quantity) => {
        const updated = [...sizes];
        updated[index].so_luong = parseInt(quantity) || 0;
        setSizes(updated);
        onChange(updated);
    };

    const handleRemoveSize = (index) => {
        const updated = sizes.filter((_, i) => i !== index);
        setSizes(updated);
        onChange(updated);
    };

    const getTotalInventory = () => {
        return sizes.reduce((total, size) => total + (parseInt(size.so_luong) || 0), 0);
    };

    return (
        <div className="size-manager">
            <div className="size-manager__header">
                <h4>Quản lý kích cỡ và tồn kho</h4>
                <div className="size-manager__total">
                    Tổng tồn kho: <strong>{getTotalInventory()}</strong> sản phẩm
                </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="size-manager__quick-add">
                <label>Thêm nhanh:</label>
                {commonSizes.map(size => (
                    <button
                        key={size}
                        type="button"
                        className="btn-quick-size"
                        onClick={() => handleQuickAdd(size)}
                        disabled={sizes.some(s => s.size === size)}
                    >
                        {size}
                    </button>
                ))}
            </div>

            {/* Size input form */}
            <div className="size-manager__add-form">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tên size (VD: M, XL, 38...)"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                />
                <input
                    type="number"
                    className="form-control"
                    placeholder="Số lượng"
                    min="0"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                />
                <button type="button" className="btn btn-success" onClick={handleAddSize}>
                    <i className="fas fa-plus"></i> Thêm
                </button>
            </div>

            {/* Size table */}
            {sizes.length > 0 && (
                <div className="size-manager__table">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Size</th>
                                <th>Số lượng</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sizes.map((size, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td><strong>{size.size}</strong></td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            min="0"
                                            value={size.so_luong}
                                            onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemoveSize(index)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {sizes.length === 0 && (
                <div className="size-manager__empty">
                    <p>Chưa có size nào. Thêm size bằng cách nhập thủ công hoặc chọn size phổ biến ở trên.</p>
                </div>
            )}
        </div>
    );
};

export default SizeManager;
