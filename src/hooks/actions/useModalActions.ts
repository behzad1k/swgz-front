// hooks/useModalActions.ts
import { useCallback } from 'react';
import { useModalContext } from '@/contexts/ModalContext';
import { ModalActionKeys } from '@store/modalSlice.ts';
import { ModalConfig } from '@/types/modal';

export const useModalActions = () => {
  const { dispatch } = useModalContext();

  const openModal = useCallback(
    (config: Omit<ModalConfig, 'id'> & { id?: string }) => {
      const modalId = config.id || `modal-${Date.now()}-${Math.random()}`;

      const modalConfig: ModalConfig = {
        id: modalId,
        component: config.component,
        props: config.props,
        size: config.size || 'md',
        animation: config.animation || 'fade',
        closeOnOverlayClick: config.closeOnOverlayClick ?? true,
        closeOnEscape: config.closeOnEscape ?? true,
        showCloseButton: config.showCloseButton ?? true,
        className: config.className,
        overlayClassName: config.overlayClassName,
        persistent: config.persistent ?? false,
        onClose: config.onClose,
      };

      dispatch({
        type: ModalActionKeys.OPEN_MODAL,
        payload: modalConfig,
      });

      return modalId;
    },
    [dispatch]
  );

  const closeModal = useCallback(
    (id: string) => {
      dispatch({
        type: ModalActionKeys.CLOSE_MODAL,
        payload: id
      });
    },
    [dispatch]
  );

  const closeTopModal = useCallback(() => {
    dispatch({ type: ModalActionKeys.CLOSE_TOP_MODAL });
  }, [dispatch]);

  const closeAllModals = useCallback(() => {
    dispatch({ type: ModalActionKeys.CLOSE_ALL_MODALS });
  }, [dispatch]);

  const updateModal = useCallback(
    (id: string, props: Record<string, any>) => {
      dispatch({
        type: ModalActionKeys.UPDATE_MODAL,
        payload: { id, props },
      });
    },
    [dispatch]
  );

  return {
    openModal,
    closeModal,
    closeTopModal,
    closeAllModals,
    updateModal,
  };
};