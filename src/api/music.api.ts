// music.api.ts - SIMPLIFIED VERSION
import { SearchFilters } from '@/enums/global.ts';
import ApiService, { API_BASE_URL } from '@/utils/api';
import { Track, SearchHistory, Artist, Album } from '@/types/models';


export interface QualityInfo {
  quality: string;
  format: string;
  available: boolean;
  unavailable: boolean;
  path?: string;
  size?: number;
}

export interface AvailableQualitiesResponse {
  songId: string;
  title: string;
  artist: string;
  hasFlac: boolean;
  availableQualities: QualityInfo[];
  unavailableQualities: string[];
  totalAvailable: number;
  totalUnavailable: number;
}

export interface QualityFallbackResponse {
  requestedQuality: string;
  fallbackChain: string[];
}

export const musicApi = {
  search: (query: string, filter: SearchFilters, signal?: AbortSignal) =>
    ApiService.get<Track[]>(`/music/search?q=${encodeURIComponent(query)}&filter=${filter}`, signal),

  getRecentSearches: (signal?: AbortSignal) =>
    ApiService.get<SearchHistory[]>('/music/recent-searches', signal),

  recordPlay: (songId: string) =>
    ApiService.post(`/music/play/${songId}`, {}),

  checkFlacAvailability: (songId: string) =>
    ApiService.get<{ songId: string; hasFlac: boolean }>(`/music/check-flac/${songId}`),

  prepareForPlaying: (track: Partial<Track>, signal?: AbortSignal) =>
    ApiService.post<Track>('/music/prepare', track, signal),

  getSimilarTracks: (songId: string, signal?: AbortSignal) =>
    ApiService.get<Track[]>(`/music/similar-tracks/${songId}`, signal),

  getArtist: (artistId: string, signal?: AbortSignal) =>
    ApiService.get<Artist>(`/music/artist/${artistId}`, signal),

  getAlbum: (albumId: string, signal?: AbortSignal) =>
    ApiService.get<Album>(`/music/album/${albumId}`, signal),

  getAvailableQualities: (songId: string, signal?: AbortSignal) =>
    ApiService.get<AvailableQualitiesResponse>(`/music/qualities/${songId}`, signal),

  getSongInfo: (songId: string, signal?: AbortSignal) =>
    ApiService.get<Track & { availableQualities: QualityInfo[]; unavailableQualities: string[] }>(
      `/music/info/${songId}`,
      signal
    ),

  getQualityFallback: (quality: string, signal?: AbortSignal) =>
    ApiService.get<QualityFallbackResponse>(`/music/quality-fallback/${quality}`, signal),

  resetUnavailableQuality: (songId: string, quality: string) =>
    ApiService.post(`/music/reset-quality/${songId}/${quality}`, {}),

  getStreamUrl: (songId: string, flac = false, apiKey: string)=>
  `${API_BASE_URL}/music/stream/${songId}?flac=${flac}&api-key=${apiKey}`


};