import { ModalAction } from '@/types/modal';
import { ModalState } from '@/types/states.ts';

export const initialModalState: ModalState = {
  modals: [],
  activeModalId: null,
};

export const modalReducer = (
  state: ModalState = initialModalState,
  action: ModalAction
): ModalState => {
  switch (action.type) {
    case 'OPEN_MODAL': {
      const newModal = {
        ...action.payload,
        closeOnOverlayClick: action.payload.closeOnOverlayClick ?? true,
        closeOnEscape: action.payload.closeOnEscape ?? true,
        showCloseButton: action.payload.showCloseButton ?? true,
        size: action.payload.size ?? 'md',
        animation: action.payload.animation ?? 'fade',
      };

      return {
        ...state,
        modals: [...state.modals, newModal],
        activeModalId: newModal.id,
      };
    }

    case 'CLOSE_MODAL': {
      const filteredModals = state.modals.filter(
        (modal) => modal.id !== action.payload
      );

      return {
        ...state,
        modals: filteredModals,
        activeModalId: filteredModals.length > 0
          ? filteredModals[filteredModals.length - 1].id
          : null,
      };
    }

    case 'CLOSE_TOP_MODAL': {
      if (state.modals.length === 0) return state;

      const newModals = state.modals.slice(0, -1);

      return {
        ...state,
        modals: newModals,
        activeModalId: newModals.length > 0
          ? newModals[newModals.length - 1].id
          : null,
      };
    }

    case 'CLOSE_ALL_MODALS': {
      return {
        ...state,
        modals: [],
        activeModalId: null,
      };
    }

    case 'UPDATE_MODAL': {
      return {
        ...state,
        modals: state.modals.map((modal) =>
          modal.id === action.payload.id
            ? { ...modal, props: { ...modal.props, ...action.payload.props } }
            : modal
        ),
      };
    }

    default:
      return state;
  }
};