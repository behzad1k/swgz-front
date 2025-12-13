import { useRouter } from './useRouter';
import { useMemo } from 'react';

export const useParams = <T extends Record<string, string> = Record<string, string>>(): T => {
  const { params } = useRouter();
  return params as T;
};

export const useQuery = <T extends Record<string, string> = Record<string, string>>(): T => {
  const { query } = useRouter();
  return query as T;
};

export const useLocation = () => {
  const { currentPath, query } = useRouter();

  return useMemo(
    () => ({
      pathname: currentPath,
      search: Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : '',
      query,
      href: `${currentPath}${Object.keys(query).length > 0 ? `?${new URLSearchParams(query).toString()}` : ''}`,
    }),
    [currentPath, query]
  );
};

/**
 * Get a single query parameter value
 */
export const useQueryParam = (key: string): string | null => {
  const { query } = useRouter();
  return query[key] || null;
};

/**
 * Get multiple query parameters
 */
export const useQueryParams = (...keys: string[]): Record<string, string | null> => {
  const { query } = useRouter();

  return useMemo(() => {
    const result: Record<string, string | null> = {};
    keys.forEach((key) => {
      result[key] = query[key] || null;
    });
    return result;
  }, [query, keys.join(',')]);
};

/**
 * Get a single URL parameter
 */
export const useParam = (key: string): string | null => {
  const { params } = useRouter();
  return params[key] || null;
};
