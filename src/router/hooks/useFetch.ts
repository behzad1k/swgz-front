import { useEffect, useState, useRef } from 'react';

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  skip?: boolean;
}

export function useFetch<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  deps: any[],
  options: UseFetchOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (options.skip) return;

        if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    fetchFn(controller.signal)
    .then((result) => {
      if (!controller.signal.aborted) {
        setData(result);
        options.onSuccess?.(result);
      }
    })
    .catch((err) => {
      if (!controller.signal.aborted) {
        setError(err);
        options.onError?.(err);
      }
    })
    .finally(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, deps);

  return { data, loading, error, refetch: () => {} };
}