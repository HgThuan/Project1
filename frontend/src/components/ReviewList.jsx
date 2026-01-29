import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import axios from 'axios';

/**
 * ReviewList Component
 * Displays product reviews with pagination and filtering
 * 
 * @param {string} productId - Product ID (ma_san_pham)
 * @param {object} currentUser - Current logged-in user object
 */
export default function ReviewList({ productId, currentUser }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [ratingFilter, setRatingFilter] = useState(null);

    // Edit state
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const loadReviews = async () => {
        setLoading(true);
        setError('');

        try {
            // Load reviews
            const reviewsUrl = `http://localhost:5001/api/reviews/product/${productId}?page=${page}&limit=10${ratingFilter ? `&rating=${ratingFilter}` : ''}`;
            const reviewsResponse = await axios.get(reviewsUrl);

            if (reviewsResponse.data.success) {
                setReviews(reviewsResponse.data.reviews);
                setTotalPages(reviewsResponse.data.pagination.pages);
            }

            // Load stats (only on first load)
            if (!stats) {
                const statsResponse = await axios.get(`http://localhost:5001/api/reviews/stats/${productId}`);
                if (statsResponse.data.success) {
                    setStats(statsResponse.data.stats);
                }
            }
        } catch (err) {
            console.error('Error loading reviews:', err);
            setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [productId, page, ratingFilter]);

    const handleFilterChange = (rating) => {
        setRatingFilter(rating === ratingFilter ? null : rating);
        setPage(1); // Reset to first page when filtering
    };

    const isOwner = (review) => {
        return currentUser && review.ma_khach_hang === currentUser.id;
    };

    const handleEditClick = (review) => {
        setEditingReview(review);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleUpdateReview = async () => {
        if (!editingReview) return;

        if (editRating === 0) {
            alert('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (!editComment.trim()) {
            alert('Vui lòng nhập nhận xét');
            return;
        }

        if (editComment.trim().length < 10) {
            alert('Nhận xét phải có ít nhất 10 ký tự');
            return;
        }

        setIsUpdating(true);

        try {
            const response = await axios.put(`http://localhost:5001/api/reviews/${editingReview._id}`, {
                rating: editRating,
                comment: editComment.trim(),
                ma_khach_hang: currentUser.id
            });

            if (response.data.success) {
                alert('Đánh giá đã được cập nhật!');
                setEditingReview(null);
                setEditRating(0);
                setEditComment('');
                // Reload reviews and stats
                loadReviews();
                setStats(null); // Force stats reload
            }
        } catch (err) {
            console.error('Error updating review:', err);
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:5001/api/reviews/${reviewId}`, {
                data: {
                    ma_khach_hang: currentUser.id
                }
            });

            if (response.data.success) {
                alert('Đánh giá đã được xóa!');
                // Reload reviews and stats
                loadReviews();
                setStats(null); // Force stats reload
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading && !reviews.length) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px' }}></i>
                <p style={{ marginTop: '16px' }}>Đang tải đánh giá...</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            {/* Review Statistics */}
            {stats && stats.totalReviews > 0 && (
                <div className="review-stats" style={{
                    padding: '24px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    marginBottom: '30px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2d4b73' }}>
                                {stats.avgRating}
                            </div>
                            <StarRating rating={stats.avgRating} readOnly size={20} />
                            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                                {stats.totalReviews} đánh giá
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div style={{ flex: 1 }}>
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = stats.ratingDistribution[star] || 0;
                                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                                return (
                                    <div
                                        key={star}
                                        onClick={() => handleFilterChange(star)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '8px',
                                            cursor: 'pointer',
                                            opacity: ratingFilter === star ? 1 : 0.7
                                        }}
                                    >
                                        <span style={{ width: '60px', fontSize: '14px' }}>{star} sao</span>
                                        <div style={{
                                            flex: 1,
                                            height: '8px',
                                            backgroundColor: '#e0e0e0',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                backgroundColor: '#ffc107',
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                        <span style={{ width: '40px', fontSize: '14px', color: '#666' }}>
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filter Status */}
                    {ratingFilter && (
                        <div style={{ marginTop: '12px' }}>
                            <button
                                onClick={() => setRatingFilter(null)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    backgroundColor: '#2d4b73',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className="fa-solid fa-xmark"></i> Hiển thị tất cả đánh giá
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Review Items */}
            {error && (
                <div style={{ padding: '20px', backgroundColor: '#fee', color: '#c33', borderRadius: '8px' }}>
                    {error}
                </div>
            )}

            {!error && reviews.length === 0 && (
                <div style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px'
                }}>
                    <i className="fa-regular fa-comment-dots" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                    <p style={{ fontSize: '16px', color: '#999' }}>
                        {ratingFilter ? `Chưa có đánh giá ${ratingFilter} sao nào` : 'Chưa có đánh giá nào cho sản phẩm này'}
                    </p>
                    <p style={{ fontSize: '14px', color: '#bbb', marginTop: '8px' }}>
                        Hãy là người đầu tiên đánh giá sản phẩm!
                    </p>
                </div>
            )}

            <div className="review-items">
                {reviews.map((review) => (
                    <div
                        key={review._id}
                        className="review-item"
                        style={{
                            padding: '20px',
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            marginBottom: '16px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                                    {review.ten_khach_hang}
                                </div>
                                <StarRating rating={review.rating} readOnly size={16} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {isOwner(review) && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEditClick(review)}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '12px',
                                                backgroundColor: '#2d4b73',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                            title="Chỉnh sửa"
                                        >
                                            <i className="fa-solid fa-edit"></i> Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReview(review._id)}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '12px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                            title="Xóa"
                                        >
                                            <i className="fa-solid fa-trash"></i> Xóa
                                        </button>
                                    </div>
                                )}
                                <div style={{ fontSize: '13px', color: '#999' }}>
                                    {formatDate(review.createdAt)}
                                </div>
                            </div>
                        </div>

                        <p style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#333',
                            margin: 0
                        }}>
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="review-pagination" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e0e0e0'
                }}>
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: page === 1 ? '#f5f5f5' : '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                            color: page === 1 ? '#999' : '#333'
                        }}
                    >
                        <i className="fa-solid fa-angle-left"></i>
                    </button>

                    <span style={{ fontSize: '14px', color: '#666' }}>
                        Trang {page} / {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: page === totalPages ? '#f5f5f5' : '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: page === totalPages ? 'not-allowed' : 'pointer',
                            color: page === totalPages ? '#999' : '#333'
                        }}
                    >
                        <i className="fa-solid fa-angle-right"></i>
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {editingReview && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => !isUpdating && setEditingReview(null)}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        maxWidth: '600px',
                        width: '90%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                            Chỉnh sửa đánh giá
                        </h3>

                        {/* Rating */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Đánh giá: <span style={{ color: 'red' }}>*</span>
                            </label>
                            <StarRating rating={editRating} onChange={setEditRating} size={32} />
                            {editRating > 0 && (
                                <span style={{ marginLeft: '12px', color: '#666' }}>
                                    {editRating === 5 ? 'Xuất sắc!' :
                                        editRating === 4 ? 'Rất tốt!' :
                                            editRating === 3 ? 'Tốt' :
                                                editRating === 2 ? 'Tạm được' : 'Không hài lòng'}
                                </span>
                            )}
                        </div>

                        {/* Comment */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Nhận xét: <span style={{ color: 'red' }}>*</span>
                            </label>
                            <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                                disabled={isUpdating}
                            />
                            <small style={{ color: '#666', fontSize: '12px' }}>
                                Tối thiểu 10 ký tự ({editComment.length}/10)
                            </small>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setEditingReview(null)}
                                disabled={isUpdating}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateReview}
                                disabled={isUpdating}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: isUpdating ? '#ccc' : '#2d4b73',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
