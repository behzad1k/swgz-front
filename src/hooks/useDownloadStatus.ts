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
  onFilenameChanged?: (data: DownloadStatus) => void; // NEW
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

  const hasClosedRef = useRef(false);

  const sseUrl = songId
    ? `${API_BASE_URL}/music/progress/${songId}${quality ? `?quality=${quality}` : ''}`
    : null;

  const { isConnected, on, off, close } = useSSE(sseUrl, {
    withCredentials: true,
    onError: (error) => {
      console.log('SSE connection error (this is normal on close)', error);
    },
  });

  useEffect(() => {
    if (!isConnected) return;

    hasClosedRef.current = false;

    const handleProgress = (data: DownloadStatus) => {
      if (!data) {
        console.warn('⚠️ Received null/undefined progress data');
        return;
      }

      console.log('📊 Download progress:', data);
      setStatus(data);

      if (data.progress !== undefined) {
        optionsRef.current.onProgress?.(data.progress);
      }

      if (data.quality || data.duration || data.fileSize) {
        optionsRef.current.onMetadata?.({
          quality: data.quality,
          duration: data.duration,
          fileSize: data.fileSize,
        });
      }
    };

    // NEW: Handle filename changed event
    const handleFilenameChanged = (data: DownloadStatus) => {
      if (!data) {
        console.warn('⚠️ Received null/undefined filename changed data');
        return;
      }

      console.log('🔄 Filename changed:', data);
      setStatus({ ...data, status: 'ready' });

      // Notify the parent that we need to switch URLs
      optionsRef.current.onFilenameChanged?.(data);
    };

    const handleReady = (data: DownloadStatus) => {
      if (!data) {
        console.warn('⚠️ Received null/undefined ready data');
        return;
      }

      console.log('✅ Download ready:', data);
      setStatus({ ...data, status: 'ready' });
      optionsRef.current.onReady?.(data);

      // Don't close automatically - let the parent control when to close
      // The parent should call reset() when switching songs
    };

    const handleError = (data: DownloadStatus) => {
      if (!data) {
        console.warn('⚠️ Received null/undefined error data');
        optionsRef.current.onError?.('Unknown download error');
        setStatus({ status: 'failed', progress: 0, error: 'Unknown error' });
      } else {
        console.error('❌ Download error:', data);
        setStatus({ ...data, status: 'failed' });
        optionsRef.current.onError?.(data.error || 'Download failed');
      }

      if (!hasClosedRef.current) {
        hasClosedRef.current = true;
        setTimeout(() => {
          console.log('🔌 Closing SSE after error event');
          close();
        }, 100);
      }
    };

    on('progress', handleProgress);
    on('filename_changed', handleFilenameChanged); // NEW
    on('ready', handleReady);
    on('error', handleError);

    return () => {
      off('progress', handleProgress);
      off('filename_changed', handleFilenameChanged); // NEW
      off('ready', handleReady);
      off('error', handleError);
    };
  }, [isConnected, on, off, close]);

  const reset = useCallback(() => {
    console.log('onRESET');
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