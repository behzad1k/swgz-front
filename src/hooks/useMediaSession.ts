import { useEffect, useRef } from 'react';
import { useCurrentSong, useIsPlaying, usePlayerProgress } from '@/hooks/selectors/usePlayerSelectors';
import { usePlayerActions } from '@/hooks/actions/usePlayerActions';

export const useMediaSession = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const progress = usePlayerProgress();
  const {
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setProgress
  } = usePlayerActions();

  // Store audio ref for seek operations
  const audioRefForSeek = useRef<HTMLAudioElement | null>(null);

  // Get audio element reference
  useEffect(() => {
    const audioElements = document.getElementsByTagName('audio');
    if (audioElements.length > 0) {
      audioRefForSeek.current = audioElements[0];
    }
  }, []);

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      console.warn('Media Session API not supported');
      return;
    }

    if (!currentSong) return;

    // Set metadata
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

    // Set playback state
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    console.log('📱 Media Session metadata updated');
  }, [currentSong, isPlaying]);

  // Update position state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentSong || !audioRefForSeek.current) return;

    const audio = audioRefForSeek.current;

    if ('setPositionState' in navigator.mediaSession && audio.duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime,
        });
      } catch (error) {
        console.warn('Failed to update position state:', error);
      }
    }
  }, [currentSong, progress]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    // Set action handlers
    const actionHandlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      [
        'play',
        () => {
          console.log('📱 Media Session: Play');
          togglePlay();
        },
      ],
      [
        'pause',
        () => {
          console.log('📱 Media Session: Pause');
          togglePlay();
        },
      ],
      [
        'previoustrack',
        () => {
          console.log('📱 Media Session: Previous');
          playPrevious();
        },
      ],
      [
        'nexttrack',
        () => {
          console.log('📱 Media Session: Next');
          playNext();
        },
      ],
      [
        'seekbackward',
        (details) => {
          console.log('📱 Media Session: Seek backward', details);

          if (!audioRefForSeek.current) {
            console.warn('No audio element available for seeking');
            return;
          }

          const audio = audioRefForSeek.current;
          const skipTime = details.seekOffset || 10; // Default 10 seconds

          // Calculate new time (don't go below 0)
          const newTime = Math.max(0, audio.currentTime - skipTime);

          console.log(`⏪ Seeking backward: ${audio.currentTime}s -> ${newTime}s`);

          // Update audio element
          audio.currentTime = newTime;

          // Update progress in state (as percentage)
          if (audio.duration) {
            const newProgress = (newTime / audio.duration) * 100;
            setProgress(newProgress);
          }
        },
      ],
      [
        'seekforward',
        (details) => {
          console.log('📱 Media Session: Seek forward', details);

          if (!audioRefForSeek.current) {
            console.warn('No audio element available for seeking');
            return;
          }

          const audio = audioRefForSeek.current;
          const skipTime = details.seekOffset || 10; // Default 10 seconds

          // Calculate new time (don't exceed duration)
          const newTime = Math.min(audio.duration, audio.currentTime + skipTime);

          console.log(`⏩ Seeking forward: ${audio.currentTime}s -> ${newTime}s`);

          // Update audio element
          audio.currentTime = newTime;

          // Update progress in state (as percentage)
          if (audio.duration) {
            const newProgress = (newTime / audio.duration) * 100;
            setProgress(newProgress);
          }
        },
      ],
      [
        'seekto',
        (details) => {
          console.log('📱 Media Session: Seek to', details.seekTime);

          if (!audioRefForSeek.current) {
            console.warn('No audio element available for seeking');
            return;
          }

          if (details.seekTime === undefined || details.seekTime === null) {
            console.warn('No seek time provided');
            return;
          }

          const audio = audioRefForSeek.current;
          const seekTime = details.seekTime;

          // Ensure seekTime is within valid range
          const validSeekTime = Math.max(0, Math.min(audio.duration, seekTime));

          console.log(`⏭️ Seeking to: ${validSeekTime}s`);

          // Update audio element
          audio.currentTime = validSeekTime;

          // Update progress in state (as percentage)
          if (audio.duration) {
            const newProgress = (validSeekTime / audio.duration) * 100;
            setProgress(newProgress);
          }
        },
      ],
      [
        'stop',
        () => {
          console.log('📱 Media Session: Stop');
          if (audioRefForSeek.current) {
            audioRefForSeek.current.pause();
            audioRefForSeek.current.currentTime = 0;
          }
          togglePlay();
        },
      ],
    ];

    // Register all handlers
    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
        console.log(`✅ Media Session: Registered "${action}" handler`);
      } catch (error) {
        console.warn(`⚠️ Media Session: Action "${action}" not supported`, error);
      }
    });

    // Cleanup
    return () => {
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    };
  }, [togglePlay, playNext, playPrevious, seek, setProgress]);
};