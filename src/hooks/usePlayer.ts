import { QualityType } from '@/types/global.ts';
import { musicApi } from '@api/music.api.ts';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Track } from '@/types/models.ts';
import { RootState } from '@/types/states';

interface UsePlayerProps {
  state: RootState;
  dispatch: React.Dispatch<any>;
}

export const usePlayer = ({ state, dispatch }: UsePlayerProps) => {
  const [currentSong, setCurrentSong] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [quality, setQuality] = useState<QualityType>(
    (localStorage.getItem('preferred_quality') as QualityType) || '320'
  );
  const [actualQuality, setActualQuality] = useState<string | null>(null); // What's actually playing
  const [qualityFallbackUsed, setQualityFallbackUsed] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [unavailableQualities, setUnavailableQualities] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadingRef = useRef(false);
  const isPreparingNextRef = useRef(false);
  const isFetchingSimilarRef = useRef(false);
  const preparedNextSongRef = useRef<Track | null>(null);

  // Sync FROM global state TO local state
  useEffect(() => {
    if (state.player.currentSong) {
      setCurrentSong(state.player.currentSong);
      setIsPlaying(state.player.isPlaying);
    }
  }, [state.player.currentSong]);

  useEffect(() => {
    setIsPlaying(state.player.isPlaying);
  }, [state.player.isPlaying]);

  useEffect(() => {
    if (state.player.quality !== quality) {
      setQuality(state.player.quality);
      localStorage.setItem('preferred_quality', state.player.quality);
    }
  }, [state.player.quality]);

  // const checkQualities = async () => {
  //   if (!currentSong?.id) return;
  //
  //   try {
  //     const qualitiesInfo = await musicApi.getAvailableQualities(currentSong.id);
  //     setAvailableQualities(qualitiesInfo.availableQualities.map(q => q.quality));
  //     setUnavailableQualities(qualitiesInfo.unavailableQualities);
  //
  //     console.log('📊 Available qualities:', qualitiesInfo.availableQualities);
  //     console.log('❌ Unavailable qualities:', qualitiesInfo.unavailableQualities);
  //   } catch (error) {
  //     console.error('Failed to check qualities:', error);
  //   }
  // };

  // Use refs for latest values in event handlers
  const queueRef = useRef(queue);
  const repeatRef = useRef(repeat);
  const preparedNextSongRefLatest = useRef(preparedNextSongRef.current);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    preparedNextSongRefLatest.current = preparedNextSongRef.current;
  }, [preparedNextSongRef.current]);

  const play = useCallback(async (song: Track) => {
    console.log('🎵 Playing song:', song.title);
    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);
    setQualityFallbackUsed(false);
    setActualQuality(null);
    // Reset prepared next song
    preparedNextSongRef.current = null;
    isPreparingNextRef.current = false;
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      console.log('🎵 Song ended, playing next...');
      console.log('🎵 Queue length in handleEnded:', queueRef.current.length);
      console.log('🎵 Prepared next song exists:', !!preparedNextSongRefLatest.current);

      if (repeatRef.current) {
        audio.currentTime = 0;
        audio.play();
      } else {
        if (queueRef.current.length > 0) {
          const nextSong = preparedNextSongRefLatest.current || queueRef.current[0];
          console.log('🎵 Playing next song:', nextSong.title, 'Has ID:', !!nextSong.id);

          setQueue(prev => prev.slice(1));
          preparedNextSongRef.current = null;
          isPreparingNextRef.current = false;
          play(nextSong);
        } else {
          console.log('⏹️ Queue empty in handleEnded, stopping playback');
          setIsPlaying(false);
        }
      }
    };

    const handleError = (e: ErrorEvent) => {
      console.error('❌ Audio playback error:', e);

      // If quality fallback failed, notify user
      if (qualityFallbackUsed) {
        dispatch({
          type: 'SHOW_NOTIFICATION',
          payload: {
            message: 'Playback failed. This track may not be available.',
            type: 'error'
          }
        });
      }
    };

    audio.addEventListener('loadstart', () => console.log('🔄 Audio: Load start'));
    audio.addEventListener('loadedmetadata', () => console.log('✅ Audio: Metadata loaded'));
    audio.addEventListener('loadeddata', () => console.log('✅ Audio: Data loaded'));
    audio.addEventListener('canplay', () => console.log('✅ Audio: Can play'));
    audio.addEventListener('canplaythrough', () => console.log('✅ Audio: Can play through'));
    audio.addEventListener('waiting', () => console.log('⏳ Audio: Waiting'));
    audio.addEventListener('stalled', () => console.log('⚠️ Audio: Stalled'));
    audio.addEventListener('suspend', () => console.log('⏸️ Audio: Suspended'));
    audio.addEventListener('abort', () => console.log('🛑 Audio: Aborted'));
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [play, qualityFallbackUsed, dispatch]);

  // Handle song changes and quality changes
  useEffect(() => {
    const loadAndPlaySong = async () => {
      if (!currentSong || !audioRef.current || isLoadingRef.current) {
        console.log('🔍 LoadAndPlaySong blocked:', {
          hasCurrentSong: !!currentSong,
          hasAudioRef: !!audioRef.current,
          isLoading: isLoadingRef.current
        });
        return;
      }

      console.log('🎵 Starting to load song:', currentSong);

      try {
        let songObj: any = currentSong;

        // Prepare song if needed
        if (!currentSong.id) {
          console.log('⚠️ Song has no ID, preparing...');
          isLoadingRef.current = true;

          songObj = await musicApi.prepareForPlaying({
            title: currentSong.title,
            artistName: currentSong.artistName,
            albumName: currentSong.albumName,
            albumCover: currentSong.albumCover,
            mbid: currentSong.mbid,
            duration: currentSong.duration,
            lastFMLink: currentSong.lastFMLink
          });

          console.log('✅ Song prepared:', songObj);

          setCurrentSong(songObj);
          setAvailableQualities(songObj.qualities.filter((e: any) => !e.unavailable).map((e: any) => e.quality))
          setUnavailableQualities(songObj.qualities.filter((e: any) => e.unavailable).map((e: any) => e.quality))
          dispatch({
            type: 'SET_CURRENT_SONG',
            payload: songObj
          });

          isLoadingRef.current = false;
        }

        const audio = audioRef.current;

        // Check if requested quality is available (proactively)
        const isRequestedQualityUnavailable = unavailableQualities.includes(quality);

        if (isRequestedQualityUnavailable) {
          console.warn(`⚠️ Requested quality ${quality} is unavailable for this track`);

          // Get fallback chain
          try {
            const fallbackInfo = await musicApi.getQualityFallback(quality);
            console.log('📊 Fallback chain:', fallbackInfo.fallbackChain);

            // Find first available fallback
            const availableFallback = fallbackInfo.fallbackChain.find(
              q => availableQualities.includes(q)
            );

            if (availableFallback) {
              console.log(`✅ Using fallback quality: ${availableFallback}`);
              setActualQuality(availableFallback);
              setQualityFallbackUsed(true);

              dispatch({
                type: 'SHOW_NOTIFICATION',
                payload: {
                  message: `Playing ${availableFallback} quality instead of ${quality}`,
                  type: 'info'
                }
              });
            }
          } catch (error) {
            console.error('Failed to get fallback chain:', error);
          }
        } else {
          // Reset fallback state if quality is available
          setActualQuality(quality);
          setQualityFallbackUsed(false);
        }

        // Build stream URL directly (no HEAD request)
        const preferFlac = quality.toLowerCase() === 'flac';
        const apiKey = state.auth?.user?.apiKey ||
          localStorage.getItem('apiKey') ||
          '';

        const streamUrl = musicApi.getStreamUrl(songObj.id, preferFlac, apiKey);

        console.log('🌐 Stream URL:', streamUrl.substring(0, 80) + '...');

        console.log('🎚️ Audio state before setting src:', {
          currentSrc: audio.src,
          paused: audio.paused,
          readyState: audio.readyState,
          networkState: audio.networkState
        });

        // Set audio source
        audio.src = streamUrl;
        audio.load();

        console.log('📊 Audio state after load:', {
          readyState: audio.readyState,
          networkState: audio.networkState
        });

        // Listen for loadedmetadata to detect actual quality from headers
        const handleLoadedMetadata = () => {
          console.log('✅ Audio metadata loaded');
          // Quality detection will happen on backend through X-Quality-Fallback header
          // which we can check via audio element events or response inspection
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });

        if (isPlaying) {
          console.log('▶️ Attempting to play...');

          audio.play()
          .then(() => {
            console.log('✅ Playback started successfully');
          })
          .catch(e => {
            console.error('❌ Playback error:', e);

            // Handle different error types
            // if (e.name === 'NotAllowedError') {
            //   dispatch({
            //     type: 'SHOW_NOTIFICATION',
            //     payload: {
            //       message: 'Please interact with the page to enable audio playback',
            //       type: 'warning'
            //     }
            //   });
            // } else if (e.name === 'NotSupportedError') {
            //   dispatch({
            //     type: 'SHOW_NOTIFICATION',
            //     payload: {
            //       message: 'Audio format not supported',
            //       type: 'error'
            //     }
            //   });
            // } else if (e.message?.includes('404')) {
            //   dispatch({
            //     type: 'SHOW_NOTIFICATION',
            //     payload: {
            //       message: `${quality} quality not available for this track`,
            //       type: 'error'
            //     }
            //   });
            // } else if (e.message?.includes('401') || e.message?.includes('403')) {
            //   dispatch({
            //     type: 'SHOW_NOTIFICATION',
            //     payload: {
            //       message: 'Authentication error. Please log in again.',
            //       type: 'error'
            //     }
            //   });
            // } else {
            //   dispatch({
            //     type: 'SHOW_NOTIFICATION',
            //     payload: {
            //       message: 'Failed to play track. Please try again.',
            //       type: 'error'
            //     }
            //   });
            // }
          });
        }
      } catch (error) {
        console.error('❌ Failed to load song:', error);
        setIsPlaying(false);
        isLoadingRef.current = false;

        // dispatch({
        //   type: 'SHOW_NOTIFICATION',
        //   payload: {
        //     message: 'Failed to load song. Please try again.',
        //     type: 'error'
        //   }
        // });
      }
    };

    loadAndPlaySong();
  }, [
    currentSong?.title,
    currentSong?.artistName,
    quality,
    dispatch,
    availableQualities,
    unavailableQualities,
    state.auth?.user?.apiKey,
    isPlaying
  ]);

  // Fill queue at 10% progress if empty
  useEffect(() => {
    const fillQueueIfEmpty = async () => {
      if (
        isPlaying &&
        progress > 10 &&
        progress < 11 &&
        queue.length === 0 &&
        !isFetchingSimilarRef.current &&
        currentSong?.id
      ) {
        console.log('📊 Progress at 10% - Queue is empty, fetching similar tracks...');
        isFetchingSimilarRef.current = true;

        try {
          const similarTracks = await musicApi.getSimilarTracks(currentSong.id);
          console.log('✅ Similar tracks fetched:', similarTracks.length);
          setQueue(similarTracks);
        } catch (error) {
          console.error('❌ Failed to fetch similar tracks:', error);
        } finally {
          isFetchingSimilarRef.current = false;
        }
      }
    };

    fillQueueIfEmpty();
  }, [progress, isPlaying, queue.length, currentSong]);

  // Prepare next song at 80% progress
  useEffect(() => {
    const prepareNextSong = async () => {
      if (
        isPlaying &&
        progress > 80 &&
        progress < 81 &&
        !isPreparingNextRef.current &&
        queue.length > 0 &&
        currentSong?.id
      ) {
        console.log('🔄 Progress at 80% - Preparing next song...');
        isPreparingNextRef.current = true;

        try {
          const nextSong = queue[0];

          if (preparedNextSongRef.current?.title === nextSong.title) {
            console.log('⏭️ Next song already prepared:', nextSong.title);
            isPreparingNextRef.current = false;
            return;
          }

          console.log('🔄 Preparing next song from queue:', nextSong.title);

          if (!nextSong.id) {
            console.log('⚠️ Preparing next song from backend...');
            const preparedSong = await musicApi.prepareForPlaying({
              title: nextSong.title,
              artistName: nextSong.artistName,
              albumName: nextSong.albumName,
              albumCover: nextSong.albumCover,
              mbid: nextSong.mbid,
              duration: nextSong.duration,
              lastFMLink: nextSong.lastFMLink
            });

            console.log('✅ Next song prepared:', preparedSong);

            setQueue(prev => {
              const newQueue = [...prev];
              newQueue[0] = preparedSong;
              return newQueue;
            });

            preparedNextSongRef.current = preparedSong;
          } else {
            console.log('✅ Next song already has ID, no preparation needed');
            preparedNextSongRef.current = nextSong;
          }
        } catch (error) {
          console.error('❌ Failed to prepare next song:', error);
        } finally {
          isPreparingNextRef.current = false;
        }
      }
    };

    prepareNextSong();
  }, [progress, isPlaying, queue, currentSong]);

  // Sync isPlaying with audio element
  useEffect(() => {
    if (!audioRef.current) return;

    console.log('🎮 isPlaying changed to:', isPlaying);

    if (isPlaying && audioRef.current.paused) {
      console.log('▶️ Playing audio (was paused)');
      audioRef.current.play()
      .then(() => console.log('✅ Play successful'))
      .catch(e => console.error('❌ Play failed:', e));
    } else if (!isPlaying && !audioRef.current.paused) {
      console.log('⏸️ Pausing audio');
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) {
      console.log('❌ TogglePlay blocked:', {
        hasAudioRef: !!audioRef.current,
        hasCurrentSong: !!currentSong
      });
      return;
    }

    console.log('🔄 Toggle play. Current state:', {
      isPlaying,
      paused: audioRef.current.paused,
      src: audioRef.current.src,
      readyState: audioRef.current.readyState
    });

    setIsPlaying(prev => !prev);
  }, [currentSong, isPlaying]);

  const playNext = useCallback(() => {
    console.log('⏭️ Playing next song. Queue length:', queue.length);

    if (queue.length > 0) {
      const nextSong = preparedNextSongRef.current || queue[0];
      console.log('🎵 Next song:', nextSong.title, 'Has ID:', !!nextSong.id);
      console.log('🎵 Using prepared song:', !!preparedNextSongRef.current);

      setQueue(prev => prev.slice(1));
      preparedNextSongRef.current = null;
      isPreparingNextRef.current = false;
      play(nextSong);
    } else {
      console.log('⏹️ Queue empty, stopping playback');
      setIsPlaying(false);
    }
  }, [queue, play]);

  const playPrevious = useCallback(() => {
    if (!audioRef.current) return;

    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setProgress(0);
    } else {
      console.log('Previous song not implemented yet');
    }
  }, []);

  const seek = useCallback((value: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    setProgress(value);
  }, []);

  const changeVolume = useCallback((value: number) => {
    if (!audioRef.current) return;
    const volumeValue = value / 100;
    audioRef.current.volume = volumeValue;
    setVolume(volumeValue);
  }, []);

  const addToQueue = useCallback((song: Track) => {
    console.log('➕ Adding to queue:', song.title);
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    console.log('➖ Removing from queue at index:', index);
    setQueue(prev => prev.filter((_, i) => i !== index));

    if (index === 0) {
      preparedNextSongRef.current = null;
      isPreparingNextRef.current = false;
    }
  }, []);

  const clearQueue = useCallback(() => {
    console.log('🗑️ Clearing queue');
    setQueue([]);
    preparedNextSongRef.current = null;
    isPreparingNextRef.current = false;
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const changeQuality = useCallback((newQuality: QualityType) => {
    console.log('🎚️ Changing quality to:', newQuality);
    setQuality(newQuality);
    localStorage.setItem('preferred_quality', newQuality);

    // Trigger reload of current song with new quality
    if (currentSong?.id && isPlaying) {
      console.log('🔄 Reloading current song with new quality');
      setQualityFallbackUsed(false);
      setActualQuality(null);
    }
  }, [currentSong, isPlaying]);

  return {
    // State
    currentSong,
    isPlaying,
    progress,
    volume,
    queue,
    repeat,
    shuffle,
    quality,
    actualQuality, // The quality actually being played (may differ from requested)
    qualityFallbackUsed, // Whether fallback was used
    availableQualities, // Qualities available for current song
    unavailableQualities, // Qualities marked unavailable

    // Audio ref
    audioRef,

    // Actions
    play,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    changeVolume,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleRepeat,
    toggleShuffle,
    changeQuality,
  };
};

export default usePlayer;