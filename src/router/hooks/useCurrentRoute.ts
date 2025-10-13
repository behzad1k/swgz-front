import { useLocation } from './useRouteData';
import { matchPath } from '@/router/RouteMatch';
import { Route, routesConfig } from '@/config/routes.config';

export const useCurrentRoute = (): Route | undefined => {
  const location = useLocation();

  return routesConfig.find((route) => {
    const match = matchPath(route.path, location.pathname, route.exact);
    return match !== null;
  });
};