import { useAudioPlayer } from './useAudioPlayer';
import { useQueueManager } from './useQueueManager';
import { useMediaSession } from './useMediaSession';
import { usePlayerActions } from './actions/usePlayerActions';
import { useEffect } from 'react';

export const usePlayerInitialization = () => {
  const audioRef = useAudioPlayer();
  const { setAudioRef } = usePlayerActions();

  // Set audio ref in context
  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, [audioRef, setAudioRef]);

  // Initialize queue manager
  useQueueManager();

  // Initialize Media Session API (Critical for iOS)
  useMediaSession();

  // Prevent iOS from sleeping during audio playback
  useEffect(() => {
    // Visibility change handler
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