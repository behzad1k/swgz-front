import { AppContextType } from '@/types/states.ts';
import { createContext, useContext } from 'react';

const AppContext = createContext<AppContextType | undefined>(undefined);

const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export { useApp }

export default AppContext;