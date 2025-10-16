import ApiService from '@utils/api';
import { Playlist } from '@/types/models.ts';

export const playlistApi = {
  getUserPlaylists: () => ApiService.get<Playlist[]>('/playlists'),
  getPlaylist: (id: string) => ApiService.get<Playlist>(`/playlists/${id}`),
  createPlaylist: (data: { name: string; description?: string }) => ApiService.post<Playlist>('/playlists', data),
  updatePlaylist: (id: string, data: { name?: string; description?: string }) => ApiService.put<Playlist>(`/playlists/${id}`, data),
  deletePlaylist: (id: string) => ApiService.delete(`/playlists/${id}`),
  addSong: (playlistId: string, songData: any): Promise<Playlist> => ApiService.post(`/playlists/${playlistId}/songs`, songData),
  removeSong: (playlistId: string, songId: string): Promise<Playlist> => ApiService.delete(`/playlists/${playlistId}/songs/${songId}`),
  importFromSpotify: (playlistUrl: string) => ApiService.post<Playlist>('/playlists/import/spotify', { playlistUrl }),
  importFromYoutube: (playlistUrl: string) => ApiService.post<Playlist>('/playlists/import/youtube', { playlistUrl }),
};