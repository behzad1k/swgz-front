// contexts/AppContext.tsx
import { AppState } from '@/types/states';
import { AppAction, appReducer, initialAppState } from '@store/slices/appSlice';
import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer } from 'react';
import { AppActionKeys } from '@store/slices/appSlice';

type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: AppActionKeys.SET_CONNECTIVITY_STATUS, payload: true });
    };

    const handleOffline = () => {
      dispatch({ type: AppActionKeys.SET_CONNECTIVITY_STATUS, payload: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export default AppProvider;