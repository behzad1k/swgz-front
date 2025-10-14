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
}

export interface Image {
  '#text': string;
  size?: 'large' | 'medium' | 'small';
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songCount?: number;
  songs?: Track[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  apiKey?: string;
}

export interface UserProfile extends User{
  bio?: string;
  avatarUrl?: string;
  stalkingsCount: number;
  stalkersCount: number;
  swgzScore: number;
  isPremium: boolean;
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
  image: string;
  lastFMLink: string;
  mbid: string
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
  filter: SearchFilters
}