import { useAudioPlayer } from './useAudioPlayer';
import { useQueueManager } from './useQueueManager';
import { useMediaSession } from './useMediaSession';
import { usePlayerActions } from './actions/usePlayerActions';
import { useAudioContextInit } from './useAudioContextInit';
import { useEffect } from 'react';

export const usePlayerInitialization = () => {
  const { audioRef } = useAudioPlayer();
  const { setAudioRef } = usePlayerActions();

  // Initialize AudioContext on user interaction (CRITICAL for iOS/PWA)
  useAudioContextInit();

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, [audioRef, setAudioRef]);

  useQueueManager();
  useMediaSession();

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 App went to background');
      } else {
        console.log('📱 App came to foreground');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return audioRef;
};