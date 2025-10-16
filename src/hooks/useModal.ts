// hooks/useModal.ts
import { ModalConfig } from '@/types/modal.ts';
import { useCallback } from 'react';
import { useModalContext } from '@/contexts/ModalContext';
import { ModalActionKeys } from '@store/modalSlice.ts';

export const useModal = () => {
  const { state, dispatch } = useModalContext();

  const openModal = useCallback(
    (config: Omit<ModalConfig, 'id'> & { id?: string }) => {
      const modalId = config.id || `modal-${Date.now()}-${Math.random()}`;

      dispatch({
        type: ModalActionKeys.OPEN_MODAL,
        payload: {
          ...config,
          id: modalId,
        },
      });

      console.log('Modal opened:', modalId);
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
    modals: state.modals || [],
    activeModalId: state.activeModalId || null,
  };
};