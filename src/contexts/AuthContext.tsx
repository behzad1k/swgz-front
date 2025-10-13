import { createContext, FC, ReactNode, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any;
  login: (email: string, password: string) => Promise<any>;
  signup: (username: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};