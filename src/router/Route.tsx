import { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import { useRouter } from './hooks/useRouter';
import { matchPath } from './RouteMatch';

interface RouteProps {
  path: string;
  element: ReactNode;
  exact?: boolean;
}

export const Route: FC<RouteProps> = ({ path, element, exact = false }) => {
  const { currentPath, setParams } = useRouter();
  const match = useMemo(() => matchPath(path, currentPath, exact), [path, currentPath, exact]);
  const prevParamsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (match && match.params) {
      // Only update if params actually changed
      const paramsChanged = JSON.stringify(prevParamsRef.current) !== JSON.stringify(match.params);

      if (paramsChanged) {
        prevParamsRef.current = match.params;
        setParams(match.params);
      }
    }
  }, [match, setParams]);

  if (!match) {
    return null;
  }

  return <>{element}</>;
};

interface RoutesProps {
  children: ReactNode;
}

export const Routes: FC<RoutesProps> = ({ children }) => {
  return <>{children}</>;
};