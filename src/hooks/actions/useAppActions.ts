// hooks/useAppActions.ts
import { useAppContext } from '@/contexts/AppContext';
import { AppActionKeys } from '@store/appSlice.ts';
import { useCallback } from 'react';

export const useAppActions = () => {
  const { dispatch } = useAppContext();

  const setConnectivityStatus = useCallback(
    (isOnline: boolean) => {
      dispatch({ type: AppActionKeys.SET_CONNECTIVITY_STATUS, payload: isOnline });
    },
    [dispatch]
  );

  const setShowNowPlaying = useCallback(
    (show: boolean) => {
      dispatch({ type: AppActionKeys.SET_SHOW_NOW_PLAYING, payload: show });
    },
    [dispatch]
  );

  const setShowDownloadManager = useCallback(
    (show: boolean) => {
      dispatch({ type: AppActionKeys.SET_SHOW_DOWNLOAD_MANAGER, payload: show });
    },
    [dispatch]
  );

  const toggleNowPlaying = useCallback(() => {
    dispatch({ type: AppActionKeys.TOGGLE_NOW_PLAYING });
  }, [dispatch]);

  const toggleDownloadManager = useCallback(() => {
    dispatch({ type: AppActionKeys.TOGGLE_DOWNLOAD_MANAGER });
  }, [dispatch]);

  return {
    setConnectivityStatus,
    setShowNowPlaying,
    setShowDownloadManager,
    toggleNowPlaying,
    toggleDownloadManager,
  };
};