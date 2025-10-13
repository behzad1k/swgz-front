import { useState } from 'react';
import ApiService from '@/utils/api';

interface Download {
  id: string;
  songId: string;
  progress: number;
  status: 'active' | 'completed' | 'failed';
}

export const useDownload = () => {
  const [downloads, setDownloads] = useState<Record<string, Download>>({});

  const startDownload = async (songId: string, preferFlac: boolean = false) => {
    const downloadId = `${songId}-${Date.now()}`;

    setDownloads((prev) => ({
      ...prev,
      [downloadId]: {
        id: downloadId,
        songId,
        progress: 0,
        status: 'active',
      },
    }));

    try {
      const url = await ApiService.downloadSong(songId, preferFlac, (progress) => {
        setDownloads((prev) => ({
          ...prev,
          [downloadId]: {
            ...prev[downloadId],
            progress,
          },
        }));
      });

      setDownloads((prev) => ({
        ...prev,
        [downloadId]: {
          ...prev[downloadId],
          status: 'completed',
        },
      }));

      return url;
    } catch (error) {
      setDownloads((prev) => ({
        ...prev,
        [downloadId]: {
          ...prev[downloadId],
          status: 'failed',
        },
      }));
      throw error;
    }
  };

  const cancelDownload = (downloadId: string) => {
    setDownloads((prev) => {
      const { [downloadId]: removed, ...rest } = prev;
      return rest;
    });
  };

  return { downloads, startDownload, cancelDownload };
};

export default useDownload;