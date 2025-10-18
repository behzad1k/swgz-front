import { useAudioPlayer } from './useAudioPlayer';
import { useQueueManager } from './useQueueManager';
import { useMediaSession } from './useMediaSession';
import { usePlayerActions } from './actions/usePlayerActions';
import { useAudioContextInit } from './useAudioContextInit';
import { useEffect } from 'react';

export const usePlayerInitialization = () => {
  const { audioRef } = useAudioPlayer();
  const { setAudioRef } = usePlayerActions();

    useAudioContextInit();

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, [audioRef, setAudioRef]);

  useQueueManager();
  useMediaSession();

    useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
              } else {
              }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return audioRef;
};