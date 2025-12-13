import { useEffect, useState, useCallback, useMemo } from 'react';
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

/**
 * Hook to set search params - supports multiple params
 * Usage:
 *   setSearchParams({ tab: 'songs', filter: 'recent' })
 *   setSearchParams({ tab: 'songs' }, { replace: true })
 */
export const useSetSearchParams = () => {
  const { navigate, currentPath, query } = useRouter();

  return useCallback(
    (
      params: Record<string, string | number | boolean | null | undefined>,
      options?: { replace?: boolean; merge?: boolean }
    ) => {
      const { replace = false, merge = true } = options || {};

      // Start with existing query if merging
      const baseQuery = merge ? { ...query } : {};

      // Update with new params
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          // Remove param if value is null/undefined
          delete baseQuery[key];
        } else {
          // Add/update param
          baseQuery[key] = String(value);
        }
      });

      // Build search string
      const searchParams = new URLSearchParams(baseQuery);
      const searchString = searchParams.toString();
      const newPath = searchString ? `${currentPath}?${searchString}` : currentPath;

      navigate(newPath, { replace });
    },
    [navigate, currentPath, query]
  );
};

/**
 * Hook to remove specific search params
 */
export const useRemoveSearchParams = () => {
  const setSearchParams = useSetSearchParams();

  return useCallback(
    (keys: string[], options?: { replace?: boolean }) => {
      const paramsToRemove = keys.reduce(
        (acc, key) => {
          acc[key] = null;
          return acc;
        },
        {} as Record<string, null>
      );

      setSearchParams(paramsToRemove, { ...options, merge: true });
    },
    [setSearchParams]
  );
};

/**
 * Hook to clear all search params
 */
export const useClearSearchParams = () => {
  const { navigate, currentPath } = useRouter();

  return useCallback(
    (options?: { replace?: boolean }) => {
      navigate(currentPath, { replace: options?.replace });
    },
    [navigate, currentPath]
  );
};

/**
 * Hook that returns parsed query params as typed object
 */
export const useTypedQuery = <T extends Record<string, any>>(): Partial<T> => {
  const { query } = useRouter();

  return useMemo(() => {
    const typed: Partial<T> = {};

    Object.entries(query).forEach(([key, value]) => {
      // Try to parse as number
      const numValue = Number(value);
      if (!isNaN(numValue) && value !== '') {
        (typed as any)[key] = numValue;
        return;
      }

      // Try to parse as boolean
      if (value === 'true' || value === 'false') {
        (typed as any)[key] = value === 'true';
        return;
      }

      // Keep as string
      (typed as any)[key] = value;
    });

    return typed;
  }, [query]);
};
