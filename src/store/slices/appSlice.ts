import { AppState } from '@/types/states.ts';

export const initialAppState: AppState = {
  isOnline: navigator.onLine,
  currentPage: 'home',
  showNowPlaying: false,
  showDownloadManager: false,
};