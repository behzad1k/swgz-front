import { FC, ReactElement } from 'react';
import { Navigate } from './Navigate';

interface RouteGuardProps {
  children: ReactElement;
  condition: boolean;
  redirectTo: string;
  fallback?: ReactElement;
}

export const RouteGuard: FC<RouteGuardProps> = ({
                                                  children,
                                                  condition,
                                                  redirectTo,
                                                  fallback
                                                }) => {
  if (!condition) {
    return fallback || <Navigate to={redirectTo} replace />;
  }

  return children;
};

// Role-based guard
interface RoleGuardProps {
  children: ReactElement;
  allowedRoles: string[];
  userRole?: string;
  redirectTo?: string;
}

export const RoleGuard: FC<RoleGuardProps> = ({
                                                children,
                                                allowedRoles,
                                                userRole,
                                                redirectTo = '/unauthorized',
                                              }) => {
  const hasAccess = userRole && allowedRoles.includes(userRole);

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};