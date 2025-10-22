// src/hooks/useDownloadStatus.ts
import { useSSE } from '@hooks/useSSEResult.ts';
import { useEffect, useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/utils/api';
import { QualityType } from '@/types/global';

export interface DownloadStatus {
  status: 'not_started' | 'searching' | 'downloading' | 'ready' | 'failed';
  progress: number;
  quality?: string;
  duration?: number;
  fileSize?: number;
  error?: string;
  streamUrl?: string;
}

interface UseDownloadStatusOptions {
  onReady?: (data: DownloadStatus) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  onMetadata?: (metadata: { quality?: string; duration?: number; fileSize?: number }) => void;
}

export const useDownloadStatus = (
  songId: string | null,
  quality: QualityType | null,
  options: UseDownloadStatusOptions = {}
) => {
  const [status, setStatus] = useState<DownloadStatus>({
    status: 'not_started',
    progress: 0,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Track if we've already closed to prevent double-closing
  const hasClosedRef = useRef(false);

  // Build SSE URL
  const sseUrl = songId
    ? `${API_BASE_URL}/music/progress/${songId}${quality ? `?quality=${quality}` : ''}`
    : null;

  const { isConnected, on, off, close } = useSSE(sseUrl, {
    withCredentials: true,
    onError: (error) => {
      console.log('SSE connection error (this is normal on close)', error);
      // Don't treat connection close as an error
    },
  });

  useEffect(() => {
    if (!isConnected) return;

    // Reset closed flag when connected
    hasClosedRef.current = false;

    const handleProgress = (data: DownloadStatus) => {
      // Validate data exists
      if (!data) {
        console.warn('⚠️ Received null/undefined progress data');
        return;
      }

      console.log('📊 Download progress:', data);
      setStatus(data);

      if (data.progress !== undefined) {
        optionsRef.current.onProgress?.(data.progress);
      }

      // Send metadata when available
      if (data.quality || data.duration || data.fileSize) {
        optionsRef.current.onMetadata?.({
          quality: data.quality,
          duration: data.duration,
          fileSize: data.fileSize,
        });
      }
    };

    const handleReady = (data: DownloadStatus) => {
      // Validate data exists
      if (!data) {
        console.warn('⚠️ Received null/undefined ready data');
        return;
      }

      console.log('✅ Download ready:', data);
      setStatus({ ...data, status: 'ready' });
      optionsRef.current.onReady?.(data);

      // Close connection after a delay to ensure all events are processed
      if (!hasClosedRef.current) {
        hasClosedRef.current = true;
        setTimeout(() => {
          console.log('🔌 Closing SSE after ready event');
          close();
        }, 100);
      }
    };

    const handleError = (data: DownloadStatus) => {
      // Validate data exists and has error property
      if (!data) {
        console.warn('⚠️ Received null/undefined error data');
        optionsRef.current.onError?.('Unknown download error');
        setStatus({ status: 'failed', progress: 0, error: 'Unknown error' });
      } else {
        console.error('❌ Download error:', data);
        setStatus({ ...data, status: 'failed' });
        optionsRef.current.onError?.(data.error || 'Download failed');
      }

      // Close connection after error
      if (!hasClosedRef.current) {
        hasClosedRef.current = true;
        setTimeout(() => {
          console.log('🔌 Closing SSE after error event');
          close();
        }, 100);
      }
    };

    on('progress', handleProgress);
    on('ready', handleReady);
    on('error', handleError);

    return () => {
      off('progress', handleProgress);
      off('ready', handleReady);
      off('error', handleError);
    };
  }, [isConnected, on, off, close]);

  const reset = useCallback(() => {
    setStatus({ status: 'not_started', progress: 0 });
    hasClosedRef.current = false;
    close();
  }, [close]);

  return {
    status,
    isConnected,
    reset,
  };
};