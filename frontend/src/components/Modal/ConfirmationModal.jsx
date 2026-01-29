import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Đồng ý', cancelText = 'Đóng' }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    const getConfirmBtnClass = () => {
        switch (type) {
            case 'danger': return 'btn-confirm danger';
            case 'warning': return 'btn-confirm warning';
            default: return 'btn-confirm';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="btn-modal btn-cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    {onConfirm && (
                        <button className={`btn-modal ${getConfirmBtnClass()}`} onClick={handleConfirm}>
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
