import ApiService from '@utils/api';

export const downloadApi = {
  startDownload: (songId: string, preferFlac: boolean) => ApiService.post(`/downloads/${songId}`, { preferFlac }),
  getStatus: (jobId: string) => ApiService.get(`/downloads/status/${jobId}`),
  cancelDownload: (jobId: string) => ApiService.delete(`/downloads/${jobId}`),
};