import { useModalContext } from '@/contexts/ModalContext';
import { useMemo } from 'react';

export const useModalState = () => {
  const { state } = useModalContext();
  return state;
};

export const useModals = () => {
  const { state } = useModalContext();
  return state.modals;
};

export const useActiveModalId = () => {
  const { state } = useModalContext();
  return state.activeModalId;
};

export const useActiveModal = () => {
  const { state } = useModalContext();
  return useMemo(
    () => state.modals.find((m) => m.id === state.activeModalId) || null,
    [state.modals, state.activeModalId]
  );
};

export const useIsModalOpen = (modalId?: string) => {
  const { state } = useModalContext();
  return useMemo(() => {
    if (modalId) {
      return state.modals.some((m) => m.id === modalId);
    }
    return state.modals.length > 0;
  }, [state.modals, modalId]);
};

export const useModalById = (modalId: string) => {
  const { state } = useModalContext();
  return useMemo(
    () => state.modals.find((m) => m.id === modalId) || null,
    [state.modals, modalId]
  );
};

export const useHasModals = () => {
  const { state } = useModalContext();
  return useMemo(() => state.modals.length > 0, [state.modals.length]);
};