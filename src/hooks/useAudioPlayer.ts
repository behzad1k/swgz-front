// hooks/useAudioPlayer.ts
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
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio element with iOS/PWA optimizations
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();

      // Critical iOS/PWA attributes
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';

      // Set initial volume
      audio.volume = 1;

      audioRef.current = audio;
      setAudioRef(audio);

      console.log('🎵 Audio element initialized:', {
        playsinline: audio.getAttribute('playsinline'),
        preload: audio.preload,
        crossOrigin: audio.crossOrigin,
      });
    }

    const audio = audioRef.current;

    // Initialize AudioContext for iOS (required for playback)
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        console.log('🎚️ AudioContext initialized:', audioContextRef.current.state);
      }
    }

    const updateProgress = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);

        // Update Media Session position
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audio.duration,
              playbackRate: audio.playbackRate,
              position: audio.currentTime,
            });
          } catch (error) {
            // Ignore position state errors
          }
        }
      }
    };

    const handleEnded = () => {
      console.log('🎵 Song ended');
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(err => console.error('Repeat play failed:', err));
      } else {
        playNextAction();
      }
    };

    const handleError = (e: Event) => {
      console.error('❌ Audio playback error:', e);
      console.error('Audio error details:', {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src,
      });
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      console.log('🔄 Audio: Load start');
    };

    const handleLoadedMetadata = () => {
      console.log('✅ Audio: Metadata loaded', {
        duration: audio.duration,
        readyState: audio.readyState,
      });
    };

    const handleLoadedData = () => {
      console.log('✅ Audio: Data loaded');
    };

    const handleCanPlay = () => {
      console.log('✅ Audio: Can play', {
        readyState: audio.readyState,
        paused: audio.paused,
      });

      // Resume AudioContext if suspended (iOS requirement)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log(audioContextRef.current.state);
        audioContextRef.current.resume().then(() => {
          console.log('🎚️ AudioContext resumed');
        }).catch(e => console.error(e));
      }
    };

    const handleCanPlayThrough = () => {
      console.log('✅ Audio: Can play through');
    };

    const handleWaiting = () => {
      console.log('⏳ Audio: Waiting/Buffering');
    };

    const handleStalled = () => {
      console.log('⚠️ Audio: Stalled');
    };

    const handlePlay = async () => {
      console.log('▶️ Audio: Play event fired');

      // Resume AudioContext on play (critical for iOS)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('🎚️ AudioContext resumed on play');
      }

      // Request wake lock
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
      console.log('⏸️ Audio: Pause event fired');

      // Release wake lock
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('🔓 Wake lock released');
      }
    };

    const handlePlaying = () => {
      console.log('▶️ Audio: Playing event (actually playing now)');
    };

    // Add all event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('playing', handlePlaying);

      // Release wake lock on cleanup
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }

      // Close AudioContext
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
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
        const apiKey = user?.apiKey || '';
        const streamUrl = musicApi.getStreamUrl(songObj.id || '', quality, apiKey);


        console.log('🌐 Setting stream URL');
        console.log('📊 Audio state before load:', {
          paused: audio.paused,
          readyState: audio.readyState,
          networkState: audio.networkState,
          currentSrc: audio.currentSrc,
        });

        // Set source and load
        audio.src = streamUrl;
        audio.load();

        console.log('📊 Audio state after load:', {
          readyState: audio.readyState,
          networkState: audio.networkState,
        });

        // Wait for audio to be ready before playing
        if (isPlaying) {
          console.log('▶️ Attempting to play...');

          // Wait for canplay event
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio load timeout'));
            }, 60000); // 10 second timeout

            const canPlayHandler = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', canPlayHandler);
              audio.removeEventListener('error', errorHandler);
              resolve();
            };

            const errorHandler = (e: Event) => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', canPlayHandler);
              audio.removeEventListener('error', errorHandler);
              reject(e);
            };

            audio.addEventListener('canplay', canPlayHandler, { once: true });
            audio.addEventListener('error', errorHandler, { once: true });
          });

          // Resume AudioContext before playing (CRITICAL for iOS)
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            console.log('🎚️ Resuming AudioContext before play...');
            await audioContextRef.current.resume();
          }

          // Now try to play
          try {
            await audio.play();
            console.log('✅ Playback started successfully');

            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
          } catch (playError: any) {
            console.error('❌ Play error:', playError);
            console.error('Play error details:', {
              name: playError.name,
              message: playError.message,
              audioState: {
                paused: audio.paused,
                readyState: audio.readyState,
                networkState: audio.networkState,
                error: audio.error,
              },
            });

            if (playError.name === 'NotAllowedError') {
              console.warn('⚠️ Autoplay blocked - user interaction required');
              setIsPlaying(false);
            } else if (playError.name === 'NotSupportedError') {
              console.error('❌ Audio format not supported');
              setIsPlaying(false);
            } else {
              // Retry once after a short delay
              console.log('🔄 Retrying play after 500ms...');
              await new Promise(resolve => setTimeout(resolve, 500));

              try {
                await audio.play();
                console.log('✅ Playback started on retry');
              } catch (retryError) {
                console.error('❌ Retry failed:', retryError);
                setIsPlaying(false);
              }
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
  }, [currentSong?.id, currentSong?.title, quality, user?.apiKey, setCurrentSong, setIsPlaying]);

  // Sync isPlaying with audio element
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    const syncPlayback = async () => {
      if (isPlaying && audio.paused) {
        console.log('▶️ Syncing: Playing audio (was paused)');

        // Resume AudioContext if needed
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        audio.play()
        .then(() => {
          console.log('✅ Sync play successful');
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        })
        .catch((e) => {
          console.error('❌ Sync play failed:', e);
          if (e.name === 'NotAllowedError') {
            setIsPlaying(false);
          }
        });
      } else if (!isPlaying && !audio.paused) {
        console.log('⏸️ Syncing: Pausing audio');
        audio.pause();

        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    };

    syncPlayback();
  }, [isPlaying, currentSong, setIsPlaying]);

  return audioRef;
};