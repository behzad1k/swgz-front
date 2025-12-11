// store/slices/appSlice.ts
import { Track } from '@/types/models.ts';
import { AppState } from '@/types/states.ts';

export const initialAppState: AppState = {
  isOnline: navigator.onLine,
  showNowPlaying: false,
  showDownloadManager: false,
  showLoading: false,
  addSongToPlaylist: undefined
};

export enum AppActionKeys {
  SET_CONNECTIVITY_STATUS = 'SET_CONNECTIVITY_STATUS',
  SET_SHOW_NOW_PLAYING = 'SET_SHOW_NOW_PLAYING',
  SET_SHOW_DOWNLOAD_MANAGER = 'SET_SHOW_DOWNLOAD_MANAGER',
  SET_SHOW_LOADING = 'SET_SHOW_LOADING',
  TOGGLE_SHOW_LOADING = 'TOGGLE_SHOW_LOADING',
  TOGGLE_NOW_PLAYING = 'TOGGLE_NOW_PLAYING',
  TOGGLE_DOWNLOAD_MANAGER = 'TOGGLE_DOWNLOAD_MANAGER',
  SET_ADD_SONG_TO_PLAYLIST = 'SET_ADD_SONG_TO_PLAYLIST',
}

export type AppAction =
  | { type: AppActionKeys.SET_CONNECTIVITY_STATUS; payload: boolean }
  | { type: AppActionKeys.SET_SHOW_NOW_PLAYING; payload: boolean }
  | { type: AppActionKeys.SET_SHOW_DOWNLOAD_MANAGER; payload: boolean }
  | { type: AppActionKeys.SET_SHOW_LOADING; payload: boolean }
  | { type: AppActionKeys.TOGGLE_SHOW_LOADING; payload: boolean }
  | { type: AppActionKeys.TOGGLE_NOW_PLAYING }
  | { type: AppActionKeys.TOGGLE_DOWNLOAD_MANAGER }
  | { type: AppActionKeys.SET_ADD_SONG_TO_PLAYLIST; payload?: Track };

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
    case AppActionKeys.SET_SHOW_LOADING:
      return { ...state, showLoading: action.payload };
    case AppActionKeys.TOGGLE_SHOW_LOADING:
      return { ...state, showLoading: !state.showLoading };
    case AppActionKeys.TOGGLE_DOWNLOAD_MANAGER:
      return { ...state, showDownloadManager: !state.showDownloadManager };
    case AppActionKeys.SET_ADD_SONG_TO_PLAYLIST:
      return { ...state, addSongToPlaylist: action.payload };
    default:
      return state;
  }
};