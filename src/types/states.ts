import { QualityType } from '@/types/global.ts';
import { ModalConfig } from '@/types/modal.ts';
import { MostListened, Playlist, SearchHistory, Track, UserProfile } from '@/types/models.ts';
import { AppAction } from '@store/slices/appSlice.ts';
import { AuthAction } from '@store/slices/authSlice.ts';
import { LibraryAction } from '@store/slices/librarySlice.ts';
import { ModalAction } from '@store/slices/modalSlice.ts';
import { PlayerAction } from '@store/slices/playerSlice.ts';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_ENABLE_SERVICE_WORKER: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export type PlayerState = {
  audioRef: HTMLAudioElement | null;
  currentSong: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  volume: number;
  repeat: boolean;
  shuffle: boolean;
  quality: QualityType;
};

// Library State
export type LibraryState = {
  likedSongs: Track[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  mostListened: MostListened[];
  librarySongs: Track[];
  recentSearches: SearchHistory[];
};

// Auth State
export type AuthState = {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
};

// App State
export type AppState = {
  isOnline: boolean;
  showNowPlaying: boolean;
  showDownloadManager: boolean;
};

// Modal State (add if you have it)
export type ModalState = {
  modals: ModalConfig[];
  activeModalId: string | null;
};


export type RootAction = ModalAction | AppAction | PlayerAction | LibraryAction | AuthAction;

// export type Action =
//   | { type: 'SET_MODAL'; payload: Partial<ModalState> }
//   | { type: 'SET_AUTH'; payload: Partial<AuthState> }
//   | { type: 'SET_PLAYER'; payload: Partial<PlayerState> }
//   | { type: 'SET_LIBRARY'; payload: Partial<LibraryState> }
//   | { type: 'SET_DOWNLOADS'; payload: Partial<DownloadsState> }
//   | { type: 'SET_APP'; payload: Partial<AppState> }
//   | { type: 'UPDATE_DOWNLOAD_PROGRESS'; payload: { id: string; progress: number } }
//   | { type: 'COMPLETE_DOWNLOAD'; payload: { id: string } };
