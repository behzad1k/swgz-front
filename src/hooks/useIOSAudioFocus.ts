import { useEffect, useRef } from 'react';
import { useIsPlaying, useCurrentSong } from './selectors/usePlayerSelectors';

export const useIOSAudioFocus = () => {
  const isPlaying = useIsPlaying();
  const currentSong = useCurrentSong();
  const silenceIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    if (isPlaying && currentSong) {
      // Keep audio session alive by updating media session periodically
      silenceIntervalRef.current = window.setInterval(() => {
        if ('mediaSession' in navigator && navigator.mediaSession.playbackState === 'playing') {
          // Trigger a tiny metadata update to keep session alive
          const currentMetadata = navigator.mediaSession.metadata;
          if (currentMetadata) {
            // Re-set the same metadata to keep session active
            navigator.mediaSession.metadata = new MediaMetadata({
              title: currentMetadata.title,
              artist: currentMetadata.artist,
              album: currentMetadata.album,
              // @ts-ignore
              artwork: currentMetadata.artwork,
            });
          }
        }
      }, 5000); // Every 5 seconds

      console.log('🍎 iOS audio focus keepalive started');
    } else {
      if (silenceIntervalRef.current) {
        clearInterval(silenceIntervalRef.current);
        silenceIntervalRef.current = null;
        console.log('🍎 iOS audio focus keepalive stopped');
      }
    }

    return () => {
      if (silenceIntervalRef.current) {
        clearInterval(silenceIntervalRef.current);
      }
    };
  }, [isPlaying, currentSong]);
};
