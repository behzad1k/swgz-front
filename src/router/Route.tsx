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
  const prevMatchRef = useRef<string>('');

  // Memoize the match result
  const match = useMemo(() => {
    const result = matchPath(path, currentPath, exact);
    return result;
  }, [path, currentPath, exact]);

  // Update params when match changes
  useEffect(() => {
    if (match && match.params) {
      const matchKey = `${currentPath}-${JSON.stringify(match.params)}`;

      // Only update if match actually changed
      if (prevMatchRef.current !== matchKey) {
        prevMatchRef.current = matchKey;
        setParams(match.params);
      }
    } else if (!match) {
      // Clear params when route doesn't match
      prevMatchRef.current = '';
    }
  }, [match, currentPath, setParams]);

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
