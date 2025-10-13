import ApiService from '@/utils/api';

interface DownloadProgress {
  songId: string;
  progress: number;
  total: number;
  loaded: number;
}

class DownloadService {
  private activeDownloads: Map<string, AbortController> = new Map();

  async downloadSong(
    songId: string,
    preferFlac: boolean = false,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    const controller = new AbortController();
    this.activeDownloads.set(songId, controller);

    try {
      const url = await ApiService.downloadSong(songId, preferFlac, (progress) => {
        if (onProgress) {
          onProgress({
            songId,
            progress,
            total: 100,
            loaded: progress,
          });
        }
      });

      this.activeDownloads.delete(songId);
      await this.saveToCache(songId, url);
      return url;
    } catch (error) {
      this.activeDownloads.delete(songId);
      throw error;
    }
  }

  cancelDownload(songId: string): void {
    const controller = this.activeDownloads.get(songId);
    if (controller) {
      controller.abort();
      this.activeDownloads.delete(songId);
    }
  }

  private async saveToCache(songId: string, url: string): Promise<void> {
    try {
      const cache = await caches.open('music-downloads');
      const response = await fetch(url);
      await cache.put(`/downloads/${songId}`, response);
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  async getFromCache(songId: string): Promise<string | null> {
    try {
      const cache = await caches.open('music-downloads');
      const response = await cache.match(`/downloads/${songId}`);
      if (response) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (error) {
      console.error('Failed to get from cache:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await caches.delete('music-downloads');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

export default new DownloadService();