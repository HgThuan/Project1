import React, { useState } from 'react';
import StarRating from './StarRating';
import axios from 'axios';

/**
 * ReviewForm Component
 * Form for submitting product reviews
 * 
 * @param {string} productId - Product ID (ma_san_pham)
 * @param {object} user - Current logged-in user object
 * @param {function} onSubmitSuccess - Callback after successful submission
 */
export default function ReviewForm({ productId, user, onSubmitSuccess }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!user) {
            setError('Vui lòng đăng nhập để đánh giá sản phẩm');
            return;
        }

        if (rating === 0) {
            setError('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (!comment.trim()) {
            setError('Vui lòng nhập nhận xét của bạn');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Nhận xét phải có ít nhất 10 ký tự');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:5001/api/reviews', {
                ma_san_pham: productId,
                ma_khach_hang: user.id,
                ten_khach_hang: user.name || user.ten_khach_hang,
                rating,
                comment: comment.trim()
            });

            if (response.data.success) {
                setSuccess('Đánh giá của bạn đã được gửi thành công!');
                setRating(0);
                setComment('');

                // Call success callback after a brief delay
                setTimeout(() => {
                    if (onSubmitSuccess) {
                        onSubmitSuccess(response.data.review);
                    }
                    setSuccess('');
                }, 2000);
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="review-form-login-prompt" style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <p style={{ marginBottom: '15px', color: '#666' }}>
                    Bạn cần đăng nhập để đánh giá sản phẩm
                </p>
                <a href="/DangNhap" className="btn btn-primary" style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    backgroundColor: '#2d4b73',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                }}>
                    Đăng nhập ngay
                </a>
            </div>
        );
    }

    return (
        <div className="review-form" style={{
            padding: '24px',
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            marginBottom: '30px'
        }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                Viết đánh giá của bạn
            </h3>

            <form onSubmit={handleSubmit}>
                {/* Rating */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Đánh giá của bạn: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <StarRating rating={rating} onChange={setRating} size={32} />
                    {rating > 0 && (
                        <span style={{ marginLeft: '12px', color: '#666' }}>
                            {rating === 5 ? 'Xuất sắc!' :
                                rating === 4 ? 'Rất tốt!' :
                                    rating === 3 ? 'Tốt' :
                                        rating === 2 ? 'Tạm được' : 'Không hài lòng'}
                        </span>
                    )}
                </div>

                {/* Comment */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="comment" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Nhận xét của bạn: <span style={{ color: 'red' }}>*</span>
                    </label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
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
                        disabled={isSubmitting}
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>
                        Tối thiểu 10 ký tự ({comment.length}/10)
                    </small>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#fee',
                        color: '#c33',
                        borderRadius: '4px',
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#efe',
                        color: '#3c3',
                        borderRadius: '4px',
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        {success}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        padding: '12px 32px',
                        backgroundColor: isSubmitting ? '#ccc' : '#2d4b73',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
            </form>
        </div>
    );
}
