import { Album, Artist, Track, UserProfile } from '@/types/models.ts';

export type QualityType = '128' | '192' | '256' | '320' | 'flac';

export interface SearchResult {
  track: Track[];
  stalker: UserProfile[];
  artist: Artist[];
  album: Album[];
}
