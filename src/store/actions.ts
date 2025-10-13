import { Action, AuthState, PlayerState, LibraryState, DownloadsState, AppState } from '../types/states.ts';

export const setAuth = (payload: Partial<AuthState>): Action => ({
  type: 'SET_AUTH',
  payload,
});

export const setPlayer = (payload: Partial<PlayerState>): Action => ({
  type: 'SET_PLAYER',
  payload,
});

export const setLibrary = (payload: Partial<LibraryState>): Action => ({
  type: 'SET_LIBRARY',
  payload,
});

export const setDownloads = (payload: Partial<DownloadsState>): Action => ({
  type: 'SET_DOWNLOADS',
  payload,
});

export const setApp = (payload: Partial<AppState>): Action => ({
  type: 'SET_APP',
  payload,
});

export const updateDownloadProgress = (id: string, progress: number): Action => ({
  type: 'UPDATE_DOWNLOAD_PROGRESS',
  payload: { id, progress },
});

export const completeDownload = (id: string): Action => ({
  type: 'COMPLETE_DOWNLOAD',
  payload: { id },
});