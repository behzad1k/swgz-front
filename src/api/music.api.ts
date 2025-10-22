// src/api/music.api.ts
import { SearchFilters } from '@/enums/global.ts';
import { QualityType, SearchResult } from '@/types/global.ts';
import ApiService, { API_BASE_URL } from '@/utils/api';
import { Track, SearchHistory, Artist, Album } from '@/types/models';
import { LOCAL_STORAGE_KEYS } from '@utils/constants.ts';

export interface QualityDetails {
  songId: string;
  title: string;
  artist: string;
  hasFlac: boolean;
  availableQualities: QualityInfo[];
  unavailableQualities: QualityInfo[];
  totalAvailable: number;
  totalUnavailable: number;
}

export interface QualityInfo {
  quality: string;
  format: string;
  available: boolean;
  unavailable: boolean;
  path?: string;
  size?: number;
}

export interface QualityFallbackResponse {
  requestedQuality: string;
  fallbackChain: QualityType[];
}

export interface PrepareForPlayingResponse extends Track {
  id: string;
}

export interface TriggerDownloadResponse {
  status: 'ready' | 'accepted';
  message: string;
  streamUrl?: string;
  progressUrl?: string;
  songId: string;
  quality?: string;
  duration?: number;
  fileSize?: number;
}

export interface StreamInfo {
  status: 'ready' | 'downloading' | 'searching' | 'not_started';
  ready: boolean;
  filePath?: string;
  quality?: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
  progress?: number;
  estimatedTime?: number;
  message?: string;
}

export const musicApi = {
  search: (query: string, filter: SearchFilters, signal?: AbortSignal) =>
    ApiService.get<SearchResult>(`/music/search?q=${encodeURIComponent(query)}&filter=${filter}`, signal),

  getRecentSearches: (signal?: AbortSignal) =>
    ApiService.get<SearchHistory[]>('/music/recent-searches', signal),

  recordPlay: (songId: string) =>
    ApiService.post(`/music/play/${songId}`, {}),

  checkFlacAvailability: (songId: string) =>
    ApiService.get<{ songId: string; hasFlac: boolean }>(`/music/check-flac/${songId}`),

  prepareForPlaying: (track: Partial<Track>, signal?: AbortSignal) =>
    ApiService.post<PrepareForPlayingResponse>('/music/prepare', track, signal),

  getSimilarTracks: (songId: string, signal?: AbortSignal) =>
    ApiService.get<Track[]>(`/music/similar-tracks/${songId}`, signal),

  getArtist: (artistId: string, signal?: AbortSignal) =>
    ApiService.get<Artist>(`/music/artist/${artistId}`, signal),

  getAlbum: (albumId: string, signal?: AbortSignal) =>
    ApiService.get<Album>(`/music/album/${albumId}`, signal),

  getDetailedQualities: (songId: string, signal?: AbortSignal) =>
    ApiService.get<QualityDetails>(`/music/qualities/${songId}`, signal),

  getSongInfo: (songId: string, signal?: AbortSignal) =>
    ApiService.get<Track & { availableQualities: QualityInfo[]; unavailableQualities: string[] }>(
      `/music/info/${songId}`,
      signal
    ),

  getQualityFallback: (quality: string, signal?: AbortSignal) =>
    ApiService.get<QualityFallbackResponse>(`/music/quality-fallback/${quality}`, signal),

  resetUnavailableQuality: (songId: string, quality: string) =>
    ApiService.post(`/music/reset-quality/${songId}/${quality}`, {}),

  /**
   * Get stream info - returns immediately with file status
   */
  getStreamInfo: (songId: string, quality?: QualityType | null, signal?: AbortSignal) =>
    ApiService.get<StreamInfo>(
      `/music/stream-info/${songId}${quality ? `?quality=${quality}` : ''}`,
      signal
    ),

  /**
   * Get stream URL (only call when file is ready)
   */
  getStreamUrl: (songId: string, apiKey: string, quality?: QualityType | null) => {
    let url = `${API_BASE_URL}/music/stream/${songId}?api-key=${apiKey}`;
    if (quality) url += `&quality=${quality}`;
    return url;
  },

  /**
   * Get SSE progress URL - no longer needs manual token
   * Cookies are sent automatically with EventSource
   */
  getProgressUrl: (songId: string, quality?: QualityType | null) => {
    let url = `${API_BASE_URL}/music/progress/${songId}`;
    if (quality) url += `?quality=${quality}`;
    return url;
  },

  /**
   * Trigger download
   */
  triggerDownload: (songId: string, quality?: QualityType | null, signal?: AbortSignal) =>
    ApiService.post<TriggerDownloadResponse>(
      `/music/download/${songId}${quality ? `?quality=${quality}` : ''}`,
      {},
      signal
    ),

  getStreamMetadata: (streamUrl: string) =>
    fetch(streamUrl, {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)}`,
      },
    }),
};