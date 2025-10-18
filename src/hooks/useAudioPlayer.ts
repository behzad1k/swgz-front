
import { useEffect, useRef, useState } from 'react';
import { musicApi } from '@api/music.api';
import { usePlayerActions } from './actions/usePlayerActions';
import {
  useCurrentSong,
  useIsPlaying,
  usePlayerQuality,
  usePlayerRepeat, usePlayerVolume
} from './selectors/usePlayerSelectors';
import { useCurrentUser } from './selectors/useAuthSelectors';

export const useAudioPlayer = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const quality = usePlayerQuality();
  const repeat = usePlayerRepeat();
  const user = useCurrentUser();
  const volume = usePlayerVolume();
  const [actualQuality, setActualQuality] = useState<string | null>(null);
  const [isAutoSelected, setIsAutoSelected] = useState(false);

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

    useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();

      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      audio.volume = volume / 100;

      audioRef.current = audio;
      setAudioRef(audio);

          }

    const audio = audioRef.current;

    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
              }
    }

    const updateProgress = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);

        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audio.duration,
              playbackRate: audio.playbackRate,
              position: audio.currentTime,
            });
          } catch (error) {
                      }
        }
      }
    };

    const handleEnded = () => {
            if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(err => console.error('Repeat play failed:', err));
      } else {
        playNextAction();
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      console.error('Audio error details:', {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src,
      });
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log('Audio: Can play');

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
                  }).catch(e => console.error(e));
      }
    };

    const handlePlay = async () => {
      console.log('️ Audio: Play event fired');

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
              }

      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
                  } catch (error) {
          console.warn('Wake lock failed:', error);
        }
      }
    };

    const handlePause = () => {
      console.log('️ Audio: Pause event fired');

      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
              }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);

      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [repeat, setProgress, setIsPlaying, playNextAction, setAudioRef]);

    useEffect(() => {
    const loadAndPlaySong = async () => {
      if (!currentSong || !audioRef.current || isLoadingRef.current) {
        return;
      }


      try {
        isLoadingRef.current = true;
        let songObj = currentSong;

        if (!currentSong.id) {
          console.log('️ Song has no ID, preparing...');
          songObj = await musicApi.prepareForPlaying({
            title: currentSong.title,
            artistName: currentSong.artistName,
            albumName: currentSong.albumName,
            albumCover: currentSong.albumCover,
            mbid: currentSong.mbid,
            duration: currentSong.duration,
            lastFMLink: currentSong.lastFMLink,
          });

          console.log('Song prepared:', songObj);
          setCurrentSong(songObj);
        }

        const audio = audioRef.current;
        const apiKey = user?.apiKey || '';

                const streamUrl = musicApi.getStreamUrl(songObj.id || '', apiKey, quality);

                const metadata = await fetchMetaData(streamUrl)

        if (metadata) {
          console.log('Stream metadata:', metadata);
          setActualQuality(metadata.actualQuality || metadata.qualityFallback || quality || null);
          setIsAutoSelected(metadata.autoSelected);

          if (metadata.autoSelected) {
                      } else if (metadata.qualityFallback) {
            console.log(`️ Using fallback quality: ${metadata.qualityFallback} (requested: ${metadata.requestedQuality})`);
          }
        }

        console.log('Setting stream URL');
        audio.src = streamUrl;
        audio.load();

        if (isPlaying) {
          console.log('️ Attempting to play...');

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio load timeout'));
              loadAndPlaySong();
            }, 60 * 1000);

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

          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            console.log('Resuming AudioContext before play...');
            await audioContextRef.current.resume();
          }

          try {
            await audio.play();
            console.log('Playback started successfully');

            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
          } catch (playError: any) {
            console.error('Play error:', playError);

            if (playError.name === 'NotAllowedError') {
              console.warn('️Autoplay blocked - user interaction required');
              setIsPlaying(false);
            } else {
              console.log('Retrying play after 500ms...');
              await new Promise(resolve => setTimeout(resolve, 500));

              try {
                await audio.play();
                console.log('Playback started on retry');
              } catch (retryError) {
                console.error('Retry failed:', retryError);
                setIsPlaying(false);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load song:', error);
        setIsPlaying(false);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadAndPlaySong();
  }, [currentSong?.id, currentSong?.title, quality, user?.apiKey, setCurrentSong, setIsPlaying]);

    useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    const syncPlayback = async () => {
      if (isPlaying && audio.paused) {
        console.log('️ Syncing: Playing audio (was paused)');

        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        audio.play()
        .then(() => {
          console.log('Sync play successful');
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        })
        .catch((e) => {
          console.error('Sync play failed:', e);
          if (e.name === 'NotAllowedError') {
            setIsPlaying(false);
          }
        });
      } else if (!isPlaying && !audio.paused) {
        console.log('️ Syncing: Pausing audio');
        audio.pause();

        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    };

    syncPlayback();
  }, [isPlaying, currentSong, setIsPlaying]);

  const fetchMetaData = async (streamUrl: string) => {
    const response: any = await musicApi.getStreamMetadata(streamUrl);

    return {
      actualQuality: response.headers.get('X-Actual-Quality'),
      qualityFallback: response.headers.get('X-Quality-Fallback'),
      requestedQuality: response.headers.get('X-Requested-Quality'),
      autoSelected: response.headers.get('X-Auto-Selected') === 'true',
      contentType: response.headers.get('Content-Type'),
      contentLength: response.headers.get('Content-Length'),
    };
  };

  useEffect(() => {
    if (audioRef){
      // audioRef.current?.volume =
    }
  }, [volume, audioRef])

  return {
    audioRef,
    actualQuality,
    isAutoSelected
  };
}