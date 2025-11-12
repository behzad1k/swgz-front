import { Album, Artist, Track, UserProfile } from '@/types/models.ts';

export type QualityType = '128' | '192' | '256' | '320' | 'flac';

export interface SearchResult {
  track: Track[];
  stalker: UserProfile[];
  artist: Artist[];
  album: Album[];
}

export type TrackAction = {
  icon: string;
  alt: string;
  onClick: (song: any, e: React.MouseEvent) => void;
  tooltip?: string;
  className?: string;
  isActive?: boolean;
  activeClassName?: string;
  show?: boolean; // conditionally show action
};
