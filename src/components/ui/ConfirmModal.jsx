import React from 'react';
import { Modal } from './Modal';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  confirmColor = '#C23A52',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width={440}>
      <p style={{ color: 'var(--mute)', fontSize: '14px', lineHeight: 1.5 }}>
        {message}
      </p>

      <div className="row" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
        <button
          type="button"
          className="ghost"
          style={{ margin: 0 }}
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          className="pb"
          style={{
            background: confirmColor.startsWith('#') || confirmColor.startsWith('var') ? confirmColor : undefined,
            height: '40px',
            padding: '0 18px',
          }}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
