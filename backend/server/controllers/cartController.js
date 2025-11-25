// controllers/cartController.js
const Cart = require('../models/cart');

/**
 * Helper function to calculate cart totals
 */
const calculateCartTotals = (cartItems) => {
    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.gia * item.so_luong);
    }, 0);

    // Free shipping for orders >= 200,000 VND
    const shippingFee = subtotal < 200000 ? 25000 : 0;
    const total = subtotal + shippingFee;

    return {
        subtotal,
        shippingFee,
        total,
        itemCount: cartItems.reduce((sum, item) => sum + item.so_luong, 0)
    };
};

const cartController = {
    /**
     * Get user's cart
     * @route GET /api/cart?userId=...
     */
    getCart: async (req, res) => {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu userId'
                });
            }

            const cartItems = await Cart.find({ ma_khach_hang: userId }).sort({ createdAt: -1 });

            const totals = calculateCartTotals(cartItems);

            res.json({
                success: true,
                cart: cartItems,
                totals
            });
        } catch (err) {
            console.error('Error getting cart:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tải giỏ hàng',
                error: err.message
            });
        }
    },

    /**
     * Add item to cart
     * @route POST /api/cart/add
     */
    addToCart: async (req, res) => {
        try {
            const {
                ma_khach_hang,
                ma_san_pham,
                ten_san_pham,
                gia,
                so_luong = 1,
                mau_sac,
                kich_co,
                anh_sanpham
            } = req.body;

            // Validation
            if (!ma_khach_hang || !ma_san_pham || !ten_san_pham || !gia || !mau_sac || !kich_co || !anh_sanpham) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin sản phẩm'
                });
            }

            // Find existing cart item with same product, color, and size
            const existingItem = await Cart.findOne({
                ma_khach_hang,
                ma_san_pham,
                mau_sac,
                kich_co
            });

            if (existingItem) {
                // Increment quantity
                existingItem.so_luong += parseInt(so_luong);
                await existingItem.save();

                return res.json({
                    success: true,
                    message: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng',
                    cartItem: existingItem,
                    action: 'updated'
                });
            }

            // Create new cart item
            const newCartItem = new Cart({
                ma_khach_hang,
                ma_san_pham,
                ten_san_pham,
                gia: parseInt(gia),
                so_luong: parseInt(so_luong),
                mau_sac,
                kich_co,
                anh_sanpham
            });

            await newCartItem.save();

            res.status(201).json({
                success: true,
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                cartItem: newCartItem,
                action: 'added'
            });

        } catch (err) {
            console.error('Error adding to cart:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi thêm sản phẩm vào giỏ hàng',
                error: err.message
            });
        }
    },

    /**
     * Update cart item quantity
     * @route PUT /api/cart/update
     */
    updateCartItem: async (req, res) => {
        try {
            const { itemId, quantity } = req.body;

            if (!itemId || !quantity || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ'
                });
            }

            const cartItem = await Cart.findById(itemId);

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm trong giỏ hàng'
                });
            }

            cartItem.so_luong = parseInt(quantity);
            await cartItem.save();

            res.json({
                success: true,
                message: 'Đã cập nhật số lượng',
                cartItem
            });

        } catch (err) {
            console.error('Error updating cart item:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật giỏ hàng',
                error: err.message
            });
        }
    },

    /**
     * Remove item from cart
     * @route DELETE /api/cart/remove/:itemId
     */
    removeFromCart: async (req, res) => {
        try {
            const { itemId } = req.params;

            const deletedItem = await Cart.findByIdAndDelete(itemId);

            if (!deletedItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm trong giỏ hàng'
                });
            }

            res.json({
                success: true,
                message: 'Đã xóa sản phẩm khỏi giỏ hàng',
                deletedItem
            });

        } catch (err) {
            console.error('Error removing from cart:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa sản phẩm',
                error: err.message
            });
        }
    },

    /**
     * Clear entire cart for a user
     * @route DELETE /api/cart/clear
     */
    clearCart: async (req, res) => {
        try {
            const { userId } = req.body; // Expect userId in body for DELETE

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu userId'
                });
            }

            const result = await Cart.deleteMany({ ma_khach_hang: userId });

            res.json({
                success: true,
                message: 'Đã xóa tất cả sản phẩm khỏi giỏ hàng',
                deletedCount: result.deletedCount
            });

        } catch (err) {
            console.error('Error clearing cart:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa giỏ hàng',
                error: err.message
            });
        }
    },

    /**
     * Sync localStorage cart to backend
     * @route POST /api/cart/sync
     */
    syncCart: async (req, res) => {
        try {
            const { ma_khach_hang, cartItems } = req.body;

            if (!ma_khach_hang || !Array.isArray(cartItems)) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ'
                });
            }

            const results = {
                added: 0,
                updated: 0,
                failed: 0
            };

            for (const item of cartItems) {
                try {
                    const existingItem = await Cart.findOne({
                        ma_khach_hang,
                        ma_san_pham: item.id,
                        mau_sac: item.color,
                        kich_co: item.size
                    });

                    if (existingItem) {
                        existingItem.so_luong += item.quantity || 1;
                        await existingItem.save();
                        results.updated++;
                    } else {
                        await Cart.create({
                            ma_khach_hang,
                            ma_san_pham: item.id,
                            ten_san_pham: item.name,
                            gia: item.price,
                            so_luong: item.quantity || 1,
                            mau_sac: item.color,
                            kich_co: item.size,
                            anh_sanpham: item.img
                        });
                        results.added++;
                    }
                } catch (itemErr) {
                    console.error('Error syncing item:', itemErr);
                    results.failed++;
                }
            }

            res.json({
                success: true,
                message: 'Đã đồng bộ giỏ hàng',
                results
            });

        } catch (err) {
            console.error('Error syncing cart:', err);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi đồng bộ giỏ hàng',
                error: err.message
            });
        }
    }
};

module.exports = cartController;
