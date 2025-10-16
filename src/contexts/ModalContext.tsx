import { ModalState } from '@/types/states';
import { initialModalState, ModalAction, modalReducer } from '@store/slices/modalSlice';
import { createContext, ReactNode, useContext, useMemo, useReducer } from 'react';

type ModalContextType = {
  state: ModalState;
  dispatch: React.Dispatch<ModalAction>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(modalReducer, initialModalState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within ModalProvider');
  }
  return context;
};

export default ModalProvider;