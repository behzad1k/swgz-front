import ApiService from '@utils/api';
import { LibrarySong, MostListened, RecentlyPlayed } from '@/types/models.ts';

interface ToggleLikeResponse {
  isLiked: boolean,
  librarySong: LibrarySong
}

export const libraryApi = {
  getLibrary: (signal?: AbortSignal) => ApiService.get<LibrarySong[]>('/library', signal),
  getLikedSongs: (signal?: AbortSignal) => ApiService.get<LibrarySong[]>('/library/liked', signal),
  addToLibrary: (songData: any): Promise<LibrarySong> => ApiService.post('/library/add', songData),
  removeFromLibrary: (songId: string) => ApiService.delete(`/library/${songId}`),
  toggleLike: (songId: string) => ApiService.post<ToggleLikeResponse>(`/library/like/${songId}`, {}),
  getRecentlyPlayed: (signal?: AbortSignal) => ApiService.get<RecentlyPlayed[]>('/library/recently-played', signal),
  getMostListened: (signal?: AbortSignal) => ApiService.get<MostListened[]>('/library/most-listened', signal),
};