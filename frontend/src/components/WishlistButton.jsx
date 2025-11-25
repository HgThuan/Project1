import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../until/userContext';

export default function WishlistButton({ productId }) {
    const { user } = useUser();
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.id) {
            checkIfLiked();
        }
    }, [user, productId]);

    const checkIfLiked = async () => {
        try {
            // Optimized: In a real app, we might fetch the whole wishlist once and check context
            // For now, we'll just fetch the list and check locally to keep it simple
            const res = await axios.get(`http://localhost:5001/api/wishlist/${user.id}`);
            if (res.data.success) {
                const found = res.data.wishlist.some(item => item.product.ma_san_pham === productId);
                setIsLiked(found);
            }
        } catch (error) {
            console.error("Error checking wishlist:", error);
        }
    };

    const toggleLike = async (e) => {
        e.preventDefault(); // Prevent parent link click
        e.stopPropagation();

        if (!user) {
            alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5001/api/wishlist/toggle', {
                userId: user.id,
                productId: productId
            });

            if (res.data.success) {
                setIsLiked(res.data.action === 'added');
                // Optional: Dispatch event to update global wishlist count if needed
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleLike}
            disabled={loading}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                transition: 'transform 0.2s'
            }}
            className="wishlist-btn"
        >
            <i
                className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}
                style={{
                    color: isLiked ? '#ff4d4f' : '#666',
                    fontSize: '20px'
                }}
            ></i>
        </button>
    );
}
