// hooks/useAudioFocus.ts
import { useEffect } from 'react';
import { useIsPlaying } from './selectors/usePlayerSelectors';
import { usePlayerActions } from './actions/usePlayerActions';

export const useAudioFocus = () => {
  const isPlaying = useIsPlaying();
  const { setIsPlaying } = usePlayerActions();

  useEffect(() => {
    // Handle interruptions (phone calls, alarms, etc.)
    // const handleInterruption = () => {
    //   console.log('🔇 Audio interrupted');
    //   setIsPlaying(false);
    // };

    // Handle page visibility
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        console.log('📱 Page hidden, audio should continue in background');
      }
    };

    // Listen for audio context state changes
    const handleAudioContextStateChange = () => {
      console.log('🎚️ Audio context state changed');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // iOS-specific interruption handling
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