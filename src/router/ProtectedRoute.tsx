import { FC, ReactElement, useContext } from 'react';
import { Navigate } from './Navigate';
import AppContext from '@/contexts/AppContext';

interface ProtectedRouteProps {
  children: ReactElement;
  redirectTo?: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
                                                          children,
                                                          redirectTo = '/login'
                                                        }) => {
  const { state } = useContext(AppContext)!;

  if (!state.auth.isAuthenticated && !window.location.href.includes('auth/confirm-email')) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};