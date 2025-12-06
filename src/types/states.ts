import { QualityType } from '@/types/global.ts';
import { ModalConfig } from '@/types/modal.ts';
import { LibrarySong, MostListened, Playlist, RecentlyPlayed, SearchHistory, Track, UserProfile } from '@/types/models.ts';

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
  duration: number | null;
  quality: QualityType | null;
};

export type LibraryState = {
  likedSongs: LibrarySong[];
  playlists: Playlist[];
  recentlyPlayed: RecentlyPlayed[];
  mostListened: MostListened[];
  librarySongs: LibrarySong[];
  recentSearches: SearchHistory[];
};

export type AuthState = {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
};

export type AppState = {
  isOnline: boolean;
  showNowPlaying: boolean;
  showDownloadManager: boolean;
  showLoading: boolean;
};

export type ModalState = {
  modals: ModalConfig[];
  activeModalId: string | null;
};
