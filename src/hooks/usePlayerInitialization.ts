import { useAudioPlayer } from './useAudioPlayer';
import { useQueueManager } from './useQueueManager';
import { useMediaSession } from './useMediaSession';
import { usePlayerActions } from './actions/usePlayerActions';
import { useAudioContextInit } from './useAudioContextInit';
import { useIOSAudioFocus } from './useIOSAudioFocus'; // ADD THIS
import { useEffect } from 'react';

export const usePlayerInitialization = () => {
  const { audioRef } = useAudioPlayer();
  const { setAudioRef } = usePlayerActions();

  useAudioContextInit();
  useIOSAudioFocus(); // ADD THIS

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
        console.log('📱 App backgrounded');
      } else {
        console.log('📱 App foregrounded');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return audioRef;
};
