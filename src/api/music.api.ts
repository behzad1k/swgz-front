import { SearchFilters } from '@/enums/global.ts';
import ApiService from '@utils/api';
import { SearchHistory, Track } from '@/types/models.ts';

export const musicApi = {
  search: (query: string, filter: SearchFilters, signal?: AbortSignal) => ApiService.get<Track[]>(`/music/search?q=${encodeURIComponent(query)}&filter=${filter}`, signal),
  getRecentSearches: (signal?: AbortSignal) => ApiService.get<SearchHistory[]>('/music/recent-searches', signal),
  recordPlay: (songId: string) => ApiService.post(`/music/play/${songId}`, {}),
  checkFlacAvailability: (songId: string) => ApiService.get<{ available: boolean }>(`/music/check-flac/${songId}`),
  prepareForPlaying: (track: Partial<Track>, signal?: AbortSignal) => ApiService.post<Track>('/music/prepare', track, signal),
  getSimilarTracks: (songId: string, signal?: AbortSignal) => ApiService.get<Track[]>(`/music/similar-tracks/${songId}`, signal),
};