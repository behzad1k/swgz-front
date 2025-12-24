import {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';

export interface RouterContextType {
  currentPath: string;
  params: Record<string, string>;
  query: Record<string, string>;
  navigate: (path: string | number, options?: NavigateOptions) => void;
  back: () => void;
  forward: () => void;
  replace: (path: string) => void;
  setParams: (params: Record<string, string>) => void;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

export const RouterContext = createContext<RouterContextType | null>(null);

interface RouterProps {
  children: ReactNode;
}

// CRITICAL FIX: Single state object to prevent multiple re-renders
interface RouterState {
  currentPath: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

const MAX_HISTORY = 50;

const parseQuery = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const query: Record<string, string> = {};

  params.forEach((value, key) => {
    try {
      query[key] = value === '' ? '' : decodeURIComponent(value);
    } catch {
      query[key] = value;
    }
  });

  return query;
};

export const Router: FC<RouterProps> = ({ children }) => {
  // CRITICAL FIX: Single state object instead of 4 separate states
  const [routerState, setRouterState] = useState<RouterState>(() => ({
    currentPath: window.location.pathname,
    params: {},
    query: parseQuery(window.location.search),
  }));

  // Use refs to prevent navigation loops
  const isNavigatingRef = useRef(false);
  const lastPathRef = useRef(window.location.pathname);
  const lastSearchRef = useRef(window.location.search);

  // CRITICAL FIX: Single update function that batches all state changes
  const updateRouteState = useCallback(() => {
    const newPath = window.location.pathname;
    const newSearch = window.location.search;

    // Only update if something actually changed
    if (newPath === lastPathRef.current && newSearch === lastSearchRef.current) {
      return;
    }

    lastPathRef.current = newPath;
    lastSearchRef.current = newSearch;

    // Single state update instead of 3-4 separate updates
    setRouterState((prev) => {
      const newQuery = parseQuery(newSearch);

      // Only update if values actually changed
      if (prev.currentPath === newPath && JSON.stringify(prev.query) === JSON.stringify(newQuery)) {
        return prev;
      }

      return {
        currentPath: newPath,
        params: prev.params, // Keep existing params, will be updated by Route component
        query: newQuery,
      };
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    updateRouteState();
  }, [updateRouteState]);

  const navigate = useCallback(
    (path: string | number, options: NavigateOptions = {}) => {
      // Prevent concurrent navigation
      if (isNavigatingRef.current) return;

      if (typeof path === 'number') {
        window.history.go(path);
        return;
      }

      // Prevent duplicate navigation
      const targetPath = path.split('?')[0];
      const targetSearch = path.includes('?') ? `?${path.split('?')[1]}` : '';

      if (targetPath === lastPathRef.current && targetSearch === lastSearchRef.current) {
        return;
      }

      isNavigatingRef.current = true;

      try {
        // Limit history size
        if (window.history.length > MAX_HISTORY) {
          options.replace = true;
        }

        if (options.replace) {
          window.history.replaceState(options.state || {}, '', path);
        } else {
          window.history.pushState(options.state || {}, '', path);
        }

        updateRouteState();
      } finally {
        // Allow next navigation
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 0);
      }
    },
    [updateRouteState]
  );

  const back = useCallback(() => {
    window.history.back();
  }, []);

  const forward = useCallback(() => {
    window.history.forward();
  }, []);

  const replace = useCallback(
    (path: string) => {
      navigate(path, { replace: true });
    },
    [navigate]
  );

  // CRITICAL FIX: Optimized setParams that doesn't trigger update if params haven't changed
  const setParams = useCallback((newParams: Record<string, string>) => {
    setRouterState((prev) => {
      // Only update if params actually changed
      if (JSON.stringify(prev.params) === JSON.stringify(newParams)) {
        return prev;
      }

      return {
        ...prev,
        params: newParams,
      };
    });
  }, []);

  // Handle browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      updateRouteState();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [updateRouteState]);

  // Handle bfcache restoration (iOS Safari)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        updateRouteState();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [updateRouteState]);

  // CRITICAL FIX: Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      currentPath: routerState.currentPath,
      params: routerState.params,
      query: routerState.query,
      navigate,
      back,
      forward,
      replace,
      setParams,
    }),
    [
      routerState.currentPath,
      routerState.params,
      routerState.query,
      navigate,
      back,
      forward,
      replace,
      setParams,
    ]
  );

  return <RouterContext.Provider value={contextValue}>{children}</RouterContext.Provider>;
};
