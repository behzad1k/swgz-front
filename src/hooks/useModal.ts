// hooks/useModal.ts

import { useApp } from '@/contexts/AppContext.tsx';
import { useCallback } from 'react';
import { ModalConfig } from '@/types/modal';

export const useModal = () => {
  const { state, dispatch } = useApp();

  const openModal = useCallback(
    (config: Omit<ModalConfig, 'id'> & { id?: string }) => {
      const modalId = config.id || `modal-${Date.now()}-${Math.random()}`;

      dispatch({
        type: 'OPEN_MODAL',
        payload: {
          ...config,
          id: modalId,
        },
      });

      return modalId;
    },
    [dispatch]
  );

  const closeModal = useCallback(
    (id: string) => {
      dispatch({ type: 'CLOSE_MODAL', payload: id });
    },
    [dispatch]
  );

  const closeTopModal = useCallback(() => {
    dispatch({ type: 'CLOSE_TOP_MODAL' });
  }, [dispatch]);

  const closeAllModals = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_MODALS' });
  }, [dispatch]);

  const updateModal = useCallback(
    (id: string, props: Record<string, any>) => {
      dispatch({
        type: 'UPDATE_MODAL',
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
    modals: state.modal?.modals || [],
    activeModalId: state.modal?.activeModalId || null,
  };
};