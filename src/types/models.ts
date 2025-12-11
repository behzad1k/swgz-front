import { SearchFilters } from '@/enums/global.ts';

export interface Track {
  id?: string;
  title: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  albumCover?: string;
  mbid?: string;
  isLiked?: boolean;
  trackNumber?: number;
  lastFMLink?: string;
  externalListens: number;
}

export interface Image {
  '#text': string;
  size?: 'large' | 'medium' | 'small';
}

export interface Playlist {
  id: string;
  title: string;
  source: string;
  isEditable: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  songs: PlaylistSong[];
  userId?: string;
  externalId?: string;
  coverField?: string;
  description?: string;
  coverUrl?: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  apiKey?: string;
  subscriptionPlan?: 'free' | 'premium';
}

export interface UserProfile extends User {
  bio?: string;
  avatarUrl?: string;
  stalkingsCount: number;
  stalkersCount: number;
  swgzScore: number;
  isPrivate?: boolean;
  songOfTheDay?: Track;
}

export interface Activity {
  id: string;
  type: 'like' | 'repost' | 'comment';
  user: UserProfile;
  song?: Track;
  timestamp: string;
  content?: string;
}

export interface Artist {
  albums: Album[];
  id: string;
  name: string;
  pfp: string;
  lastFMLink: string;
  mbid: string;
  bio?: string;
  fullBio?: string;
  externalListeners?: number;
  externalPlays?: number;
  songs: Track[];
}

export interface Album {
  id: string;
  title: string;
  artistName: string;
  releaseDate: number;
  totalTracks?: number;
  albumCover?: string;
  songs?: Track[];
  mbid?: string;
}

export interface DownloadItem {
  id: string;
  songId: string;
  progress: number;
  status: 'active' | 'completed' | 'failed';
  song?: Track;
}

export interface SearchHistory {
  id: string;
  query: string;
  filter: SearchFilters;
}

export interface MostListened {
  count: number;
  song: Track;
}
export interface RecentlyPlayed {
  song: Track;
  id: string;
  userId: string;
  songId: string;
  playedAt: Date;
}

export interface LibrarySong {
  id: string;
  userId: string;
  songId: string;
  isLiked: boolean;
  isDownloaded: boolean;
  addedAt: Date;
  song: Track;
  user?: User;
}

export interface PlaylistSong {
  id: string;
  songId: string;
  playlistId: string;
  position: number;
  addedAt: Date;
  song: Track;
}
