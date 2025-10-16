// store/slices/appSlice.ts
import { AppState } from '@/types/states';

export const initialAppState: AppState = {
  isOnline: navigator.onLine,
  showNowPlaying: false,
  showDownloadManager: false,
};

export enum AppActionKeys {
  SET_CONNECTIVITY_STATUS = 'SET_CONNECTIVITY_STATUS',
  SET_SHOW_NOW_PLAYING = 'SET_SHOW_NOW_PLAYING',
  SET_SHOW_DOWNLOAD_MANAGER = 'SET_SHOW_DOWNLOAD_MANAGER',
  TOGGLE_NOW_PLAYING = 'TOGGLE_NOW_PLAYING',
  TOGGLE_DOWNLOAD_MANAGER = 'TOGGLE_DOWNLOAD_MANAGER',
}

export type AppAction =
  | { type: AppActionKeys.SET_CONNECTIVITY_STATUS; payload: boolean }
  | { type: AppActionKeys.SET_SHOW_NOW_PLAYING; payload: boolean }
  | { type: AppActionKeys.SET_SHOW_DOWNLOAD_MANAGER; payload: boolean }
  | { type: AppActionKeys.TOGGLE_NOW_PLAYING }
  | { type: AppActionKeys.TOGGLE_DOWNLOAD_MANAGER };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case AppActionKeys.SET_CONNECTIVITY_STATUS:
      return { ...state, isOnline: action.payload };
    case AppActionKeys.SET_SHOW_NOW_PLAYING:
      return { ...state, showNowPlaying: action.payload };
    case AppActionKeys.SET_SHOW_DOWNLOAD_MANAGER:
      return { ...state, showDownloadManager: action.payload };
    case AppActionKeys.TOGGLE_NOW_PLAYING:
      return { ...state, showNowPlaying: !state.showNowPlaying };
    case AppActionKeys.TOGGLE_DOWNLOAD_MANAGER:
      return { ...state, showDownloadManager: !state.showDownloadManager };
    default:
      return state;
  }
};