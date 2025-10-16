// hooks/usePlayerInitialization.ts
import { useAudioPlayer } from './useAudioPlayer';
import { useQueueManager } from './useQueueManager';
import { usePlayerActions } from './actions/usePlayerActions';
import { useEffect } from 'react';

/**
 * Initialize the player with all necessary side effects
 * Call this once in your main App component or player layout
 */
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

  return audioRef;
};