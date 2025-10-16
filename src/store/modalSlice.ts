// store/slices/modalSlice.ts
import { ModalConfig } from '@/types/modal.ts';
import { ModalState } from '@/types/states.ts';


export const initialModalState: ModalState = {
  modals: [],
  activeModalId: null,
};

export enum ModalActionKeys {
  OPEN_MODAL = 'OPEN_MODAL',
  CLOSE_MODAL = 'CLOSE_MODAL',
  CLOSE_TOP_MODAL = 'CLOSE_TOP_MODAL',
  CLOSE_ALL_MODALS = 'CLOSE_ALL_MODALS',
  UPDATE_MODAL = 'UPDATE_MODAL',
}

export type ModalAction =
  | { type: ModalActionKeys.OPEN_MODAL; payload: ModalConfig }
  | { type: ModalActionKeys.CLOSE_MODAL; payload: string }
  | { type: ModalActionKeys.CLOSE_TOP_MODAL }
  | { type: ModalActionKeys.CLOSE_ALL_MODALS }
  | { type: ModalActionKeys.UPDATE_MODAL; payload: { id: string; props: Record<string, any> } };

export const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case ModalActionKeys.OPEN_MODAL:
      return {
        modals: [...state.modals, action.payload],
        activeModalId: action.payload.id,
      };

    case ModalActionKeys.CLOSE_MODAL:
      const filteredModals = state.modals.filter((m) => m.id !== action.payload);
      return {
        modals: filteredModals,
        activeModalId: filteredModals.length > 0
          ? filteredModals[filteredModals.length - 1].id
          : null,
      };

    case ModalActionKeys.CLOSE_TOP_MODAL:
      const modalsAfterClosingTop = state.modals.slice(0, -1);
      return {
        modals: modalsAfterClosingTop,
        activeModalId: modalsAfterClosingTop.length > 0
          ? modalsAfterClosingTop[modalsAfterClosingTop.length - 1].id
          : null,
      };

    case ModalActionKeys.CLOSE_ALL_MODALS:
      return {
        modals: [],
        activeModalId: null,
      };

    case ModalActionKeys.UPDATE_MODAL:
      return {
        ...state,
        modals: state.modals.map((modal) =>
          modal.id === action.payload.id
            ? { ...modal, props: { ...modal.props, ...action.payload.props } }
            : modal
        ),
      };

    default:
      return state;
  }
};