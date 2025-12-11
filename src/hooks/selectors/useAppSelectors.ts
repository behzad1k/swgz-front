import { useAppContext } from '@/contexts/AppContext';

export const useAppState = () => {
  const { state } = useAppContext();
  return state;
};

export const useIsOnline = () => {
  const { state } = useAppContext();
  return state.isOnline;
};

export const useShowNowPlaying = () => {
  const { state } = useAppContext();
  return state.showNowPlaying;
};

export const useShowLoading = () => {
  const { state } = useAppContext();
  return state.showLoading;
};

export const useShowDownloadManager = () => {
  const { state } = useAppContext();
  return state.showDownloadManager;
};

export const useAddSongToPlaylist = () => {
  const { state } = useAppContext();
  return state.addSongToPlaylist;
};