import React, { useState } from 'react';

/**
 * StarRating Component
 * Interactive star rating input or display-only mode
 * 
 * @param {number} rating - Current rating value (1-5)
 * @param {function} onChange - Callback when rating changes (for interactive mode)
 * @param {boolean} readOnly - If true, display only (not interactive)
 * @param {number} size - Size of stars in pixels (default: 24)
 */
export default function StarRating({ rating = 0, onChange, readOnly = false, size = 24 }) {
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleClick = (value) => {
        if (!readOnly && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (!readOnly) {
            setHoveredRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoveredRating(0);
        }
    };

    const displayRating = hoveredRating || rating;

    return (
        <div
            className={`star-rating ${readOnly ? 'star-rating--readonly' : 'star-rating--interactive'}`}
            style={{ display: 'inline-flex', gap: '4px', cursor: readOnly ? 'default' : 'pointer' }}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <i
                    key={star}
                    className={`fa-${star <= displayRating ? 'solid' : 'regular'} fa-star`}
                    style={{
                        color: star <= displayRating ? '#ffc107' : '#e0e0e0',
                        fontSize: `${size}px`,
                        transition: 'color 0.2s ease'
                    }}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => handleMouseEnter(star)}
                    onMouseLeave={handleMouseLeave}
                />
            ))}
        </div>
    );
}
