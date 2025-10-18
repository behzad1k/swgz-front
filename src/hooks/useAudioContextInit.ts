import { useEffect, useRef } from 'react';

/**
 * Initialize AudioContext on user interaction (required for iOS/PWA)
 */
export const useAudioContextInit = () => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    const initAudioContext = async () => {
      if (initializedRef.current) return;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      try {
        const audioContext = new AudioContext();
        console.log(audioContext, initializedRef);
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

                initializedRef.current = true;

                await audioContext.close();
      } catch (error) {
        console.error('Failed to initialize AudioContext:', error);
      }
    };

        const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];

    events.forEach(event => {
      document.addEventListener(event, initAudioContext, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, initAudioContext);
      });
    };
  }, []);
};