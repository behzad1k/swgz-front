'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ModalConfig } from '@/types/modal';
import { useModals } from '@/hooks/selectors/useModalSelectors';
import { useModalActions } from '@/hooks/actions/useModalActions';

const ModalManager: React.FC = () => {
  const modals = useModals();
  const { closeModal, closeTopModal } = useModalActions();

  // Log modals for debugging
  useEffect(() => {
    if (modals.length > 0) {
      console.log('Active modals:', modals.length);
    }
  }, [modals.length]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        if (topModal.closeOnEscape && !topModal.persistent) {
          closeTopModal();
          topModal.onClose?.();
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

  // SSR guard
  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {modals.map((modal, index) => (
        <ModalWrapper
          key={modal.id}
          modal={modal}
          index={index}
          totalModals={modals.length}
          onClose={() => {
            closeModal(modal.id);
            modal.onClose?.();
          }}
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
  const {
    component: Component,
    props,
    size = 'md',
    animation = 'fade',
    closeOnOverlayClick = true,
    showCloseButton = true,
    className = '',
    overlayClassName = '',
    persistent = false,
  } = modal;

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnOverlayClick && !persistent) {
        onClose();
      }
    },
    [closeOnOverlayClick, persistent, onClose]
  );

  const zIndex = 1000 + index * 10;
  const opacity = 1 - (totalModals - index - 1) * 0.1;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const animationClasses: Record<string, string> = {
    fade: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    slideDown: 'animate-slideDown',
    scale: 'animate-scale',
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${overlayClassName}`}
      style={{ zIndex }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: opacity * 0.5 }}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full ${sizeClasses[size]} ${animationClasses[animation]} ${className}`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[90vh]">
          <Component {...props} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default ModalManager;