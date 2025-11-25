// src/until/cartApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Cart API Service
 * Refactored to match new API endpoints
 */

/**
 * Get user's cart from backend
 * GET /api/cart?userId=...
 */
export const fetchCart = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/cart`, {
            params: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

/**
 * Add item to backend cart
 * POST /api/cart/add
 */
export const addItemToBackend = async (userId, item) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/cart/add`, {
            ma_khach_hang: userId,
            ma_san_pham: item.id,
            ten_san_pham: item.name,
            gia: item.price,
            so_luong: item.quantity || 1,
            mau_sac: item.color,
            kich_co: item.size,
            anh_sanpham: item.img
        });
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

/**
 * Update cart item quantity
 * PUT /api/cart/update
 */
export const updateCartItemQuantity = async (cartItemId, quantity) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/cart/update`, {
            itemId: cartItemId,
            quantity: quantity
        });
        return response.data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
};

/**
 * Remove item from cart
 * DELETE /api/cart/remove/:itemId
 */
export const removeItemFromBackend = async (cartItemId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/cart/remove/${cartItemId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};

/**
 * Clear entire cart
 * DELETE /api/cart/clear
 */
export const clearCartOnBackend = async (userId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/cart/clear`, {
            data: { userId }
        });
        return response.data;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};

/**
 * Sync localStorage cart to backend
 * POST /api/cart/sync
 */
export const syncCartToBackend = async (userId, cartItems) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/cart/sync`, {
            ma_khach_hang: userId,
            cartItems
        });
        return response.data;
    } catch (error) {
        console.error('Error syncing cart:', error);
        throw error;
    }
};

/**
 * Merge backend cart with localStorage on login
 */
export const mergeCartsOnLogin = async (userId) => {
    try {
        // Get localStorage cart
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (localCart.length > 0) {
            // Sync to backend
            await syncCartToBackend(userId, localCart);

            // Clear localStorage (optional - cart now lives on backend)
            // localStorage.setItem('cart', '[]');
        }

        // Fetch merged cart from backend
        const backendCart = await fetchCart(userId);
        return backendCart;
    } catch (error) {
        console.error('Error merging carts:', error);
        throw error;
    }
};

export default {
    fetchCart,
    addItemToBackend,
    updateCartItemQuantity,
    removeItemFromBackend,
    clearCartOnBackend,
    syncCartToBackend,
    mergeCartsOnLogin
};
