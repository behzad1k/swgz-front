import React from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverUrl?: string;
  isLiked?: boolean;
  trackNumber?: number;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songCount?: number;
  songs?: Song[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  stalkingsCount: number;
  stalkersCount: number;
  swagzScore: number;
  isPremium: boolean;
  isPrivate?: boolean;
  songOfTheDay?: Song;
}

interface Activity {
  id: string;
  type: 'like' | 'repost' | 'comment';
  user: UserProfile;
  song?: Song;
  timestamp: string;
  content?: string;
}

interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
  followers: number;
}

interface Album {
  id: string;
  name: string;
  artist: string;
  year: number;
  coverUrl: string;
  totalTracks: number;
  songs?: Song[];
}

interface DownloadItem {
  id: string;
  songId: string;
  progress: number;
  status: 'active' | 'completed' | 'failed';
  song?: Song;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  progress: number;
  volume: number;
  repeat: boolean;
  shuffle: boolean;
  quality: '128' | '320' | 'FLAC';
}

interface LibraryState {
  likedSongs: Song[];
  playlists: Playlist[];
  recentlyPlayed: Song[];
  mostListened: Song[];
}

interface DownloadsState {
  active: Record<string, DownloadItem>;
  completed: DownloadItem[];
  failed: DownloadItem[];
}

interface AppState {
  isOnline: boolean;
  currentPage: 'home' | 'search' | 'library' | 'profile';
  showNowPlaying: boolean;
  showDownloadManager: boolean;
}

interface RootState {
  auth: AuthState;
  player: PlayerState;
  library: LibraryState;
  downloads: DownloadsState;
  app: AppState;
}

type Action =
  | { type: 'SET_AUTH'; payload: Partial<AuthState> }
  | { type: 'SET_PLAYER'; payload: Partial<PlayerState> }
  | { type: 'SET_LIBRARY'; payload: Partial<LibraryState> }
  | { type: 'SET_DOWNLOADS'; payload: Partial<DownloadsState> }
  | { type: 'SET_APP'; payload: Partial<AppState> }
  | { type: 'UPDATE_DOWNLOAD_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'COMPLETE_DOWNLOAD'; payload: { id: string } };

interface AppContextType {
  state: RootState;
  dispatch: React.Dispatch<Action>;
}
