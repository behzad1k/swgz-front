import { useEffect, useRef } from 'react';
import { musicApi } from '@api/music.api';
import { usePlayerActions } from './actions/usePlayerActions';
import {
  useCurrentSong,
  useIsPlaying,
  usePlayerQuality,
  usePlayerRepeat
} from './selectors/usePlayerSelectors';
import { useCurrentUser } from './selectors/useAuthSelectors';

export const useAudioPlayer = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const quality = usePlayerQuality();
  const repeat = usePlayerRepeat();
  const user = useCurrentUser();

  const {
    setIsPlaying,
    setProgress,
    setCurrentSong,
    playNext: playNextAction,
    setAudioRef,
  } = usePlayerActions();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadingRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Initialize audio element with iOS optimizations
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();

      // iOS-specific attributes
      audio.setAttribute('playsinline', 'true'); // Prevent fullscreen on iOS
      audio.preload = 'auto'; // Preload audio

      audioRef.current = audio;
      setAudioRef(audio);
    }

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);

        // Update position state for Media Session API
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
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
      }
    };

    const handleEnded = () => {
      console.log('🎵 Song ended');
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNextAction();
      }
    };

    const handleError = (e: Event) => {
      console.error('❌ Audio playback error:', e);
      setIsPlaying(false);
    };

    // iOS wake lock - keep screen awake during playback
    const handlePlay = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('🔒 Wake lock activated');
        } catch (error) {
          console.warn('Wake lock failed:', error);
        }
      }
    };

    const handlePause = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('🔓 Wake lock released');
      }
    };

    // Audio event listeners
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);

      // Release wake lock on cleanup
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, [repeat, setProgress, setIsPlaying, playNextAction, setAudioRef]);

  // Load and play song
  useEffect(() => {
    const loadAndPlaySong = async () => {
      if (!currentSong || !audioRef.current || isLoadingRef.current) {
        return;
      }

      console.log('🎵 Loading song:', currentSong.title);

      try {
        isLoadingRef.current = true;
        let songObj = currentSong;

        // Prepare song if it doesn't have an ID
        if (!currentSong.id) {
          console.log('⚠️ Song has no ID, preparing...');
          songObj = await musicApi.prepareForPlaying({
            title: currentSong.title,
            artistName: currentSong.artistName,
            albumName: currentSong.albumName,
            albumCover: currentSong.albumCover,
            mbid: currentSong.mbid,
            duration: currentSong.duration,
            lastFMLink: currentSong.lastFMLink,
          });

          console.log('✅ Song prepared:', songObj);
          setCurrentSong(songObj);
        }

        const audio = audioRef.current;
        const streamUrl = musicApi.getStreamUrl(songObj.id || '', quality, user?.apiKey || '');

        console.log('🌐 Setting stream URL');

        // For iOS: Set crossOrigin to allow CORS
        audio.crossOrigin = 'anonymous';
        audio.src = streamUrl;
        audio.load();

        if (isPlaying) {
          console.log('▶️ Attempting to play...');

          // iOS requires user interaction to play audio
          // This should work if triggered by a user action
          try {
            await audio.play();
            console.log('✅ Playback started');

            // Update Media Session playback state
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
          } catch (playError: any) {
            console.error('❌ Play error:', playError);

            // Handle iOS autoplay restrictions
            if (playError.name === 'NotAllowedError') {
              console.warn('⚠️ Autoplay blocked - user interaction required');
              setIsPlaying(false);
            }
          }
        }
      } catch (error) {
        console.error('❌ Failed to load song:', error);
        setIsPlaying(false);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadAndPlaySong();
  }, [currentSong?.id, currentSong?.title, quality, user?.apiKey, isPlaying, setCurrentSong, setIsPlaying]);

  // Sync isPlaying with audio element
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    if (isPlaying && audio.paused) {
      console.log('▶️ Playing audio');
      audio.play()
      .then(() => {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      })
      .catch((e) => {
        console.error('❌ Play failed:', e);
        if (e.name === 'NotAllowedError') {
          setIsPlaying(false);
        }
      });
    } else if (!isPlaying && !audio.paused) {
      console.log('⏸️ Pausing audio');
      audio.pause();

      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  }, [isPlaying, currentSong, setIsPlaying]);

  return audioRef;
};