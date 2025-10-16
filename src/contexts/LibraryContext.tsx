import { LibraryState } from '@/types/states';
import { initialLibraryState, LibraryAction, libraryReducer } from '@store/slices/librarySlice';
import { createContext, ReactNode, useContext, useMemo, useReducer } from 'react';

type LibraryContextType = {
  state: LibraryState;
  dispatch: React.Dispatch<LibraryAction>;
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(libraryReducer, initialLibraryState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibraryContext = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibraryContext must be used within LibraryProvider');
  }
  return context;
};

export default LibraryProvider