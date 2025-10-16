
import ApiService from '@utils/api';
import { MostListened, Track } from '@/types/models.ts';

export const libraryApi = {
  getLibrary: (signal?: AbortSignal) => ApiService.get<Track[]>('/library', signal),
  getLikedSongs: (signal?: AbortSignal) => ApiService.get<Track[]>('/library/liked', signal),
  addToLibrary: (songData: any) => ApiService.post('/library/add', songData),
  removeFromLibrary: (songId: string) => ApiService.delete(`/library/${songId}`),
  toggleLike: (songId: string) => ApiService.post(`/library/like/${songId}`, {}),
  getRecentlyPlayed: (signal?: AbortSignal) => ApiService.get<Track[]>('/library/recently-played', signal),
  getMostListened: (signal?: AbortSignal) => ApiService.get<MostListened[]>('/library/most-listened', signal),
};