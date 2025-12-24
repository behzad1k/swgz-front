import { FC, ReactNode, useEffect, useMemo, useRef } from 'react';
import { useRouter } from './hooks/useRouter';
import { matchPath } from './RouteMatch';

interface RouteProps {
  path: string;
  element: ReactNode;
  exact?: boolean;
}

export const Route: FC<RouteProps> = ({ path, element, exact = false }) => {
  const { currentPath, setParams, params: currentParams } = useRouter();
  const prevParamsRef = useRef<string>('');

  // Memoize the match result
  const match = useMemo(() => {
    return matchPath(path, currentPath, exact);
  }, [path, currentPath, exact]);

  // CRITICAL FIX: Only update params if they actually changed
  useEffect(() => {
    if (match && match.params) {
      const paramsString = JSON.stringify(match.params);

      // Only update if params actually changed
      if (prevParamsRef.current !== paramsString) {
        prevParamsRef.current = paramsString;

        // Additional check: only update if different from current params
        if (JSON.stringify(currentParams) !== paramsString) {
          setParams(match.params);
        }
      }
    } else if (!match && prevParamsRef.current !== '') {
      // Clear params when route doesn't match
      prevParamsRef.current = '';
    }
  }, [match, setParams, currentParams]);

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
