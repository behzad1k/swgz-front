import { useEffect, useRef } from 'react';
import {
  useCurrentSong,
  useIsPlaying,
  usePlayerProgress,
} from '@/hooks/selectors/usePlayerSelectors';
import { usePlayerActions } from '@/hooks/actions/usePlayerActions';

export const useMediaSession = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const progress = usePlayerProgress();
  const { togglePlay, playNext, playPrevious, seek, setProgress } = usePlayerActions();

  const audioRefForSeek = useRef<HTMLAudioElement | null>(null);
  const positionUpdateIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const audioElements = document.getElementsByTagName('audio');
    if (audioElements.length > 0) {
      audioRefForSeek.current = audioElements[0];
    }
  }, []);

  // Set up media session metadata
  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      console.warn('Media Session API not supported');
      return;
    }

    if (!currentSong) {
      // Clear metadata when no song
      navigator.mediaSession.metadata = null;
      return;
    }

    console.log('🎵 Setting media session metadata for:', currentSong.title);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artistName,
      album: currentSong.albumName,
      artwork: [
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '256x256',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '384x384',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    });
  }, [currentSong]);

  // Update playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const newState = isPlaying ? 'playing' : 'paused';
    console.log('📻 Setting media session playback state to:', newState);
    navigator.mediaSession.playbackState = newState;
  }, [isPlaying]);

  // CRITICAL: Update position state frequently for iOS background playback
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentSong || !audioRefForSeek.current) return;

    const audio = audioRefForSeek.current;

    // Clear any existing interval
    if (positionUpdateIntervalRef.current) {
      clearInterval(positionUpdateIntervalRef.current);
      positionUpdateIntervalRef.current = null;
    }

    const updatePositionState = () => {
      if (!audio.duration || isNaN(audio.duration) || !isFinite(audio.duration)) {
        return;
      }

      if ('setPositionState' in navigator.mediaSession) {
        try {
          const position = Math.min(audio.currentTime, audio.duration);

          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: position,
          });

          // Only log occasionally to avoid spam
          if (Math.floor(audio.currentTime) % 10 === 0) {
            console.log('📍 Position state updated:', {
              position: position.toFixed(1),
              duration: audio.duration.toFixed(1),
              background: document.hidden,
            });
          }
        } catch (error) {
          console.warn('Failed to update position state:', error);
        }
      }
    };

    // Update immediately
    updatePositionState();

    // CRITICAL: Update position every second (especially important for iOS background)
    if (isPlaying) {
      positionUpdateIntervalRef.current = window.setInterval(updatePositionState, 1000);
      console.log('⏱️ Started position state updates (1s interval)');
    }

    return () => {
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
        positionUpdateIntervalRef.current = null;
        console.log('⏱️ Stopped position state updates');
      }
    };
  }, [currentSong, isPlaying]);

  // Set up media session action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    console.log('🎮 Setting up media session action handlers');

    const actionHandlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      [
        'play',
        () => {
          console.log('📻 Media session: play');
          if (!isPlaying) {
            togglePlay();
          }
        },
      ],
      [
        'pause',
        () => {
          console.log('📻 Media session: pause');
          if (isPlaying) {
            togglePlay();
          }
        },
      ],
      [
        'previoustrack',
        () => {
          console.log('📻 Media session: previous track');
          playPrevious();
        },
      ],
      [
        'nexttrack',
        () => {
          console.log('📻 Media session: next track');
          playNext();
        },
      ],
      [
        'seekbackward',
        (details) => {
          if (!audioRefForSeek.current) return;

          const audio = audioRefForSeek.current;
          const skipTime = details.seekOffset || 10;
          const newTime = Math.max(0, audio.currentTime - skipTime);

          console.log('📻 Media session: seek backward', skipTime, 's');
          audio.currentTime = newTime;

          if (audio.duration) {
            const newProgress = (newTime / audio.duration) * 100;
            setProgress(newProgress);
          }
        },
      ],
      [
        'seekforward',
        (details) => {
          if (!audioRefForSeek.current) return;

          const audio = audioRefForSeek.current;
          const skipTime = details.seekOffset || 10;
          const newTime = Math.min(audio.duration, audio.currentTime + skipTime);

          console.log('📻 Media session: seek forward', skipTime, 's');
          audio.currentTime = newTime;

          if (audio.duration) {
            const newProgress = (newTime / audio.duration) * 100;
            setProgress(newProgress);
          }
        },
      ],
      [
        'seekto',
        (details) => {
          if (!audioRefForSeek.current) return;
          if (details.seekTime === undefined || details.seekTime === null) return;

          const audio = audioRefForSeek.current;
          const seekTime = details.seekTime;
          const validSeekTime = Math.max(0, Math.min(audio.duration, seekTime));

          console.log('📻 Media session: seek to', validSeekTime, 's');
          audio.currentTime = validSeekTime;

          if (audio.duration) {
            const newProgress = (validSeekTime / audio.duration) * 100;
            setProgress(newProgress);
          }
        },
      ],
      [
        'stop',
        () => {
          console.log('📻 Media session: stop');
          if (audioRefForSeek.current) {
            audioRefForSeek.current.pause();
            audioRefForSeek.current.currentTime = 0;
          }
          if (isPlaying) {
            togglePlay();
          }
        },
      ],
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
        console.log(`📻 Registered "${action}" handler`);
      } catch (error) {
        console.warn(`️ Action "${action}" not supported`, error);
      }
    });

    return () => {
      console.log('🧹 Cleaning up media session handlers');
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {
          // Ignore
        }
      });
    };
  }, [togglePlay, playNext, playPrevious, setProgress, isPlaying]);

  // CRITICAL: Handle visibility changes to keep session active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!('mediaSession' in navigator)) return;

      if (document.hidden && isPlaying) {
        console.log('📻 Background: Ensuring media session stays playing');
        navigator.mediaSession.playbackState = 'playing';

        // Update position state to keep session alive
        if (audioRefForSeek.current && audioRefForSeek.current.duration) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audioRefForSeek.current.duration,
              playbackRate: audioRefForSeek.current.playbackRate,
              position: audioRefForSeek.current.currentTime,
            });
          } catch (error) {
            console.warn('Failed to update position on background:', error);
          }
        }
      } else if (!document.hidden) {
        console.log('📻 Foreground: Media session state:', navigator.mediaSession.playbackState);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);
};
