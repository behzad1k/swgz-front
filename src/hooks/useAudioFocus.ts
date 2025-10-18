import { useEffect } from 'react';
import { useIsPlaying } from './selectors/usePlayerSelectors';
import { usePlayerActions } from './actions/usePlayerActions';

export const useAudioFocus = () => {
  const isPlaying = useIsPlaying();
  const { setIsPlaying } = usePlayerActions();

  useEffect(() => {

        const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
              }
    };

        const handleAudioContextStateChange = () => {
          };

    document.addEventListener('visibilitychange', handleVisibilityChange);

        if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      audioContext.addEventListener('statechange', handleAudioContextStateChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, setIsPlaying]);
};