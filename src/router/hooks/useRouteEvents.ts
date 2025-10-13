import { useEffect, useState, useCallback } from 'react';
import { useRouter } from './useRouter';

// Hook to detect route changes
export const useRouteChange = (callback: (path: string) => void) => {
  const { currentPath } = useRouter();

  useEffect(() => {
    callback(currentPath);
  }, [currentPath, callback]);
};

// Hook for scroll restoration
export const useScrollRestoration = () => {
  const { currentPath } = useRouter();
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    const saveScrollPosition = () => {
      setScrollPositions((prev) => ({
        ...prev,
        [currentPath]: window.scrollY,
      }));
    };

    window.addEventListener('beforeunload', saveScrollPosition);

    const savedPosition = scrollPositions[currentPath];
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [currentPath, scrollPositions]);
};

// Hook to get search param
export const useSearchParam = (key: string): string | null => {
  const { query } = useRouter();
  return query[key] || null;
};

// Hook to set search params
export const useSetSearchParams = () => {
  const { navigate, currentPath, query } = useRouter();

  return useCallback((params: Record<string, string>) => {
    const newQuery = { ...query, ...params };
    const searchParams = new URLSearchParams(newQuery);
    navigate(`${currentPath}?${searchParams.toString()}`);
  }, [navigate, currentPath, query]);
};