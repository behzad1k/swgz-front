// components/ModalManager.tsx

'use client';

import { useApp } from '@/contexts/AppContext.tsx';
import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ModalConfig } from '@/types/modal';

const ModalManager: React.FC = () => {
  const { state, dispatch } = useApp();
  const modals = state.modal?.modals || [];

  const closeModal = useCallback((id: string) => {
    dispatch({ type: 'CLOSE_MODAL', payload: id });
  }, [dispatch]);

  const closeTopModal = useCallback(() => {
    dispatch({ type: 'CLOSE_TOP_MODAL' });
  }, [dispatch]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        if (topModal.closeOnEscape && !topModal.persistent) {
          closeTopModal();
        }
      }
    };

    if (modals.length > 0) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [modals, closeTopModal]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {modals.map((modal, index) => (
        <ModalWrapper
          key={modal.id}
          modal={modal}
          index={index}
          totalModals={modals.length}
          onClose={() => closeModal(modal.id)}
        />
      ))}
    </>,
    document.body
  );
};

interface ModalWrapperProps {
  modal: ModalConfig;
  index: number;
  totalModals: number;
  onClose: () => void;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
                                                     modal,
                                                     index,
                                                     totalModals,
                                                     onClose,
                                                   }) => {
  const { component: Component, props, size, animation, closeOnOverlayClick, showCloseButton, className, overlayClassName, persistent, onClose: onCloseCallback } = modal;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && !persistent) {
      onClose();
      onCloseCallback?.();
    }
  };

  const handleClose = () => {
    onClose();
    onCloseCallback?.();
  };

  const zIndex = 1000 + index * 10;
  const opacity = 1 - (totalModals - index - 1) * 0.1;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const animationClasses = {
    fade: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    slideDown: 'animate-slideDown',
    scale: 'animate-scale',
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${overlayClassName || ''}`}
      style={{ zIndex }}
      onClick={handleOverlayClick}
    >
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: opacity * 0.5 }}
      />

      <div
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full ${sizeClasses[size || 'md']} ${animationClasses[animation || 'fade']} ${className || ''}`}
        style={{ maxHeight: '90vh' }}
      >
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="overflow-y-auto max-h-[90vh]">
          <Component {...props} onClose={handleClose} />
        </div>
      </div>
    </div>
  );
};

export default ModalManager;