import ApiService from '@utils/api';
import { Playlist } from '@/types/models.ts';
import ENDPOINTS from '@/utils/endpoints';

export const playlistApi = {
  getUserPlaylists: () => ApiService.get<Playlist[]>(ENDPOINTS.PLAYLIST.INDEX),
  getPlaylist: (id: string) => ApiService.get<Playlist>(`${ENDPOINTS.PLAYLIST.INDEX}/${id}`),
  createPlaylist: (data: { name: string; description?: string }) =>
    ApiService.post<Playlist>(ENDPOINTS.PLAYLIST.INDEX, data),
  updatePlaylist: (id: string, data: { name?: string; description?: string }) =>
    ApiService.put<Playlist>(`${ENDPOINTS.PLAYLIST.INDEX}/${id}`, data),
  deletePlaylist: (id: string) => ApiService.delete(`${ENDPOINTS.PLAYLIST.INDEX}/${id}`),
  addSong: (playlistId: string, songData: any): Promise<Playlist> =>
    ApiService.post(`${ENDPOINTS.PLAYLIST.SONGS}/${playlistId}`, songData),
  removeSong: (playlistId: string, songId: string): Promise<Playlist> =>
    ApiService.delete(`${ENDPOINTS.PLAYLIST.SONGS}/${playlistId}/${songId}`),
  importFromSpotify: (playlistUrl: string) =>
    ApiService.post<Playlist>(ENDPOINTS.PLAYLIST.SPOTIFY, { playlistUrl }),
  importFromYoutube: (playlistUrl: string) =>
    ApiService.post<Playlist>(ENDPOINTS.PLAYLIST.YOUTUBE, { playlistUrl }),

  // Cover upload - You'll need to implement this endpoint on the backend
  uploadCover: async (playlistId: string, formData: FormData): Promise<{ coverUrl: string }> => {
    const token = ApiService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/playlists/${playlistId}/cover`,
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const res = await response.json();
      throw new Error(res.message || 'Cover upload failed');
    }

    return response.json();
  },
  deleteCover: (playlistId: string) =>
    ApiService.delete(`${ENDPOINTS.PLAYLIST.COVER}/${playlistId}`),
  // Update song order - You'll need to implement this endpoint on the backend
  updateSongOrder: (playlistId: string, songIds: (string | undefined)[]) =>
    ApiService.put(`${ENDPOINTS.PLAYLIST.ORDER}/${playlistId}`, {
      songIds: songIds.filter(Boolean),
    }),
};
