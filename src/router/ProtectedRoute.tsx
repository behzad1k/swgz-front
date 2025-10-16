import { useIsAuthenticated } from '@hooks/selectors/useAuthSelectors.ts';
import { FC, ReactElement } from 'react';
import { Navigate } from './Navigate';

interface ProtectedRouteProps {
  children: ReactElement;
  redirectTo?: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
                                                          children,
                                                          redirectTo = '/login'
                                                        }) => {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};