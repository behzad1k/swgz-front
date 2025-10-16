// hooks/useAppSelectors.ts
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

export const useShowDownloadManager = () => {
  const { state } = useAppContext();
  return state.showDownloadManager;
};