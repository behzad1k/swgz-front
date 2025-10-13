import { FC, ReactNode, createContext, useEffect, useState, useCallback } from 'react';

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

  useEffect(() => {
    // This ensures params are available immediately
    const initialPath = window.location.pathname;
    setCurrentPath(initialPath);
  }, []);

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

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) {
      // Ensure router initializes correctly in PWA mode
      setCurrentPath(window.location.pathname);
      setQuery(parseQuery(window.location.search));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      // Re-sync router state when coming back online
      setCurrentPath(window.location.pathname);
      setQuery(parseQuery(window.location.search));
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [parseQuery]);

  const navigate = useCallback((path: string | number, options: NavigateOptions = {}) => {
    requestAnimationFrame(() => {
      if (typeof path === 'number') {
        window.history.go(path);
        return;
      }

      if (window.history.length > MAX_HISTORY) {
        // Use replace instead of push for old entries
        options.replace = true;
      }

      if (options.replace) {
        window.history.replaceState(options.state || {}, '', path);
      } else {
        window.history.pushState(options.state || {}, '', path);
      }
      setCurrentPath(window.location.pathname);
      setQuery(parseQuery(window.location.search));
    });
  }, [parseQuery]);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  const forward = useCallback(() => {
    window.history.forward();
  }, []);

  const replace = useCallback((path: string) => {
    navigate(path, { replace: true });
  }, [navigate]);

  // Memoize setParams to prevent infinite loops
  const setParamsMemoized = useCallback((newParams: Record<string, string>) => {
    setParams(newParams);
  }, []);

  // IOS Compatibility
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setQuery(parseQuery(window.location.search));
    };

    // Handle bfcache restoration
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        setCurrentPath(window.location.pathname);
        setQuery(parseQuery(window.location.search));
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [parseQuery]);


  // Android Compatibility
  useEffect(() => {
    // Prevent default back behavior if needed
    const handleBackButton = (e: Event) => {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    };

    // Some Android browsers need this
    window.addEventListener('backbutton', handleBackButton);

    return () => {
      window.removeEventListener('backbutton', handleBackButton);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      // Optionally handle hash changes
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setQuery(parseQuery(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    setQuery(parseQuery(window.location.search));

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [parseQuery]);

  return (
    <RouterContext.Provider value={{
      currentPath,
      params,
      query,
      navigate,
      back,
      forward,
      replace,
      setParams: setParamsMemoized
    }}>
      {children}
    </RouterContext.Provider>
  );
};