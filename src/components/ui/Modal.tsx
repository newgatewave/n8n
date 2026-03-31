import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
}: ModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return '#0F9D58';
      case 'error': return '#ff4d4d';
      case 'warning': return '#fbbc04';
      default: return '#1877F2';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${getColor()}`,
        borderRadius: '12px',
        width: '90%',
        maxWidth: '450px',
        padding: '24px',
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 10px ${getColor()}44`,
        position: 'relative',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.3s ease-out',
      }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes modalSlideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        ` }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '1.5rem' }}>{getIcon()}</span>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white', fontWeight: 600 }}>{title}</h3>
        </div>

        <div style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {message}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {onConfirm && (
            <button 
              onClick={onClose} 
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {cancelText}
            </button>
          )}
          
          <button 
            onClick={onConfirm || onClose} 
            style={{
              padding: '10px 24px',
              background: getColor(),
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: `0 4px 12px ${getColor()}33`
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
