// src/hooks/useSSE.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { SSEClient, SSEOptions } from '@/utils/sse';

interface UseSSEResult {
  isConnected: boolean;
  error: Event | null;
  on: (eventType: string, callback: (data: any) => void) => void;
  off: (eventType: string, callback: (data: any) => void) => void;
  close: () => void;
}

export const useSSE = (url: string | null, options: SSEOptions = {}): UseSSEResult => {
  const clientRef = useRef<SSEClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);

  useEffect(() => {
    if (!url) return;

    const client = new SSEClient(url, {
      ...options,
      onOpen: () => {
        setIsConnected(true);
        setError(null);
        options.onOpen?.();
      },
      onError: (err) => {
        setError(err);
        if ((err.target as EventSource)?.readyState === EventSource.CLOSED) {
          setIsConnected(false);
        }
        options.onError?.(err);
      },
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.close();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [url]);

  const on = useCallback((eventType: string, callback: (data: any) => void) => {
    clientRef.current?.on(eventType, callback);
  }, []);

  const off = useCallback((eventType: string, callback: (data: any) => void) => {
    clientRef.current?.off(eventType, callback);
  }, []);

  const close = useCallback(() => {
    clientRef.current?.close();
    setIsConnected(false);
  }, []);

  return { isConnected, error, on, off, close };
};