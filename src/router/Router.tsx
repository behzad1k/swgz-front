import { FC, ReactNode, createContext, useEffect, useState, useCallback, useRef } from 'react';

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

const MAX_HISTORY = 50;

export const Router: FC<RouterProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [params, setParams] = useState<Record<string, string>>({});
  const [query, setQuery] = useState<Record<string, string>>({});
  const [renderKey, setRenderKey] = useState(0);

  // Use refs to track navigation state
  const isNavigatingRef = useRef(false);
  const lastPathRef = useRef(window.location.pathname);
  const lastQueryRef = useRef(window.location.search);

  const parseQuery = useCallback((search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const query: Record<string, string> = {};

    params.forEach((value, key) => {
      // Handle empty values
      if (value === '') {
        query[key] = '';
        return;
      }

      // Decode URI components
      try {
        query[key] = decodeURIComponent(value);
      } catch {
        query[key] = value; // Fallback if decode fails
      }
    });

    return query;
  }, []);

  // Force update helper
  const forceUpdate = useCallback(() => {
    setRenderKey((prev) => prev + 1);
  }, []);

  // Update route state helper
  const updateRouteState = useCallback(() => {
    const newPath = window.location.pathname;
    const newSearch = window.location.search;

    // Check if path or query actually changed
    const pathChanged = newPath !== lastPathRef.current;
    const queryChanged = newSearch !== lastQueryRef.current;

    if (pathChanged || queryChanged) {
      lastPathRef.current = newPath;
      lastQueryRef.current = newSearch;

      setCurrentPath(newPath);
      setQuery(parseQuery(newSearch));
      forceUpdate(); // Force re-render to ensure route components update
    }
  }, [parseQuery, forceUpdate]);

  // Initialize on mount
  useEffect(() => {
    const initialPath = window.location.pathname;
    const initialSearch = window.location.search;

    lastPathRef.current = initialPath;
    lastQueryRef.current = initialSearch;

    setCurrentPath(initialPath);
    setQuery(parseQuery(initialSearch));

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      forceUpdate();
    }
  }, [parseQuery, forceUpdate]);

  const navigate = useCallback(
    (path: string | number, options: NavigateOptions = {}) => {
      if (isNavigatingRef.current) return;

      isNavigatingRef.current = true;

      requestAnimationFrame(() => {
        try {
          if (typeof path === 'number') {
            window.history.go(path);
            return;
          }

          // Prevent duplicate navigation
          const targetPath = path.split('?')[0];
          const targetSearch = path.includes('?') ? path.split('?')[1] : '';

          if (
            targetPath === lastPathRef.current &&
            targetSearch === lastQueryRef.current.slice(1)
          ) {
            return;
          }

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
          isNavigatingRef.current = false;
        }
      });
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

  const setParamsMemoized = useCallback((newParams: Record<string, string>) => {
    setParams((prevParams) => {
      // Only update if params actually changed
      if (JSON.stringify(prevParams) !== JSON.stringify(newParams)) {
        return newParams;
      }
      return prevParams;
    });
  }, []);

  // Handle popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      updateRouteState();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [updateRouteState]);

  // Handle bfcache restoration (iOS)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        updateRouteState();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [updateRouteState]);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      updateRouteState();
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [updateRouteState]);

  // Handle online/offline
  useEffect(() => {
    const handleOnline = () => {
      updateRouteState();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [updateRouteState]);

  // Android back button
  useEffect(() => {
    const handleBackButton = (e: Event) => {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    };

    window.addEventListener('backbutton', handleBackButton);

    return () => {
      window.removeEventListener('backbutton', handleBackButton);
    };
  }, []);

  return (
    <RouterContext.Provider
      value={{
        currentPath,
        params,
        query,
        navigate,
        back,
        forward,
        replace,
        setParams: setParamsMemoized,
      }}
      key={renderKey}
    >
      {children}
    </RouterContext.Provider>
  );
};
