import { ModalConfig } from '@/types/modal.ts';
import { DownloadItem, Playlist, SearchHistory, Track, UserProfile } from '@/types/models.ts';
import React from 'react';
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_ENABLE_SERVICE_WORKER: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}


export interface AppContextType {
  state: RootState;
  dispatch: React.Dispatch<any>;
  player: {
    currentSong: any;
    isPlaying: boolean;
    progress: number;
    volume: number;
    queue: any[];
    repeat: boolean;
    shuffle: boolean;
    quality: '128' | '320' | 'FLAC';
    audioRef: React.RefObject<HTMLAudioElement>;
    play: (song: any) => Promise<void>;
    togglePlay: () => void;
    playNext: () => void;
    playPrevious: () => void;
    seek: (value: number) => void;
    changeVolume: (value: number) => void;
    addToQueue: (song: any) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
    toggleRepeat: () => void;
    toggleShuffle: () => void;
    changeQuality: (quality: '128' | '320' | 'FLAC') => void;
  };
}



export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export interface PlayerState {
  currentSong: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  volume: number;
  repeat: boolean;
  shuffle: boolean;
  quality: '128' | '320' | 'FLAC';
}

export interface MostListened {
  count: number;
  song: Track
}

export interface LibraryState {
  librarySongs: Track[];
  likedSongs: Track[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  mostListened: MostListened[];
  recentSearches: SearchHistory[];
}

export interface DownloadsState {
  active: Record<string, DownloadItem>;
  completed: DownloadItem[];
  failed: DownloadItem[];
}


export interface ModalState {
  modals: ModalConfig[];
  activeModalId: string | null;
}

export interface RootState {
  auth: AuthState;
  player: PlayerState;
  library: LibraryState;
  downloads: DownloadsState;
  app: AppState;
  modal: ModalState; // Add this line
}


export interface AppState {
  isOnline: boolean;
  currentPage: 'home' | 'search' | 'library' | 'profile';
  showNowPlaying: boolean;
  showDownloadManager: boolean;
}


export type Action =
  | { type: 'SET_AUTH'; payload: Partial<AuthState> }
  | { type: 'SET_PLAYER'; payload: Partial<PlayerState> }
  | { type: 'SET_LIBRARY'; payload: Partial<LibraryState> }
  | { type: 'SET_DOWNLOADS'; payload: Partial<DownloadsState> }
  | { type: 'SET_APP'; payload: Partial<AppState> }
  | { type: 'UPDATE_DOWNLOAD_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'COMPLETE_DOWNLOAD'; payload: { id: string } };
