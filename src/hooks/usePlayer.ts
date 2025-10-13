import { musicApi } from '@api/music.api.ts';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Track } from '@/types/models.ts';
import ApiService from '@/utils/api';
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
  const [quality, setQuality] = useState<'128' | '320' | 'FLAC'>(
    (localStorage.getItem('preferred_quality') as '128' | '320' | 'FLAC') || '320'
  );
  const [queue, setQueue] = useState<Track[]>([]);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadingRef = useRef(false);
  const isPreparingNextRef = useRef(false);
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
        // Use the latest queue from ref
        if (queueRef.current.length > 0) {
          const nextSong = preparedNextSongRefLatest.current || queueRef.current[0];
          console.log('🎵 Playing next song:', nextSong.title, 'Has ID:', !!nextSong.id);

          // Remove from queue
          setQueue(prev => prev.slice(1));

          // Reset prepared reference
          preparedNextSongRef.current = null;
          isPreparingNextRef.current = false;

          // Play the song
          play(nextSong);
        } else {
          console.log('⏹️ Queue empty in handleEnded, stopping playback');
          setIsPlaying(false);
        }
      }
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      // setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [play]);

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
        let songObj: any = currentSong

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
          dispatch({
            type: 'SET_CURRENT_SONG',
            payload: songObj
          });

          isLoadingRef.current = false;
        }

        const audio = audioRef.current;
        const preferFlac = quality === 'FLAC';
        const streamUrl = ApiService.getStreamUrl(songObj.id, preferFlac, state.auth?.user?.apiKey || '');

        console.log('🌐 Stream URL:', streamUrl);
        console.log('🎚️ Audio state before setting src:', {
          currentSrc: audio.src,
          paused: audio.paused,
          readyState: audio.readyState,
          networkState: audio.networkState
        });

        audio.src = streamUrl;
        audio.load();

        console.log('📊 Audio state after load:', {
          src: audio.src,
          readyState: audio.readyState,
          networkState: audio.networkState
        });

        if (isPlaying) {
          console.log('▶️ Attempting to play...');
          audio.play()
          .catch(e => console.error('❌ Playback error:', e));
        }
      } catch (error) {
        console.error('❌ Failed to load song:', error);
        setIsPlaying(false);
        isLoadingRef.current = false;
      }
    };

    loadAndPlaySong();
  }, [currentSong?.title, currentSong?.artistName, quality, dispatch]);

  // Prepare next song when progress reaches 90%
  useEffect(() => {
    const prepareNextSong = async () => {
      // Only prepare if:
      // 1. Song is playing
      // 2. Progress is between 90-91% (narrow window to avoid multiple calls)
      // 3. Not already preparing
      // 4. Current song exists and has an ID
      if (
        isPlaying &&
        progress > 90 &&
        progress < 91 &&
        !isPreparingNextRef.current &&
        currentSong?.id
      ) {
        console.log('🔄 Progress at 90%, checking queue...');
        isPreparingNextRef.current = true;

        try {
          // If queue is empty, fetch similar tracks first
          if (queue.length === 0) {
            console.log('📡 Queue empty, fetching similar tracks...');
            const similarTracks = await musicApi.getSimilarTracks(currentSong.id);
            console.log('✅ Similar tracks fetched:', similarTracks.length);
            setQueue(similarTracks);

            // Now prepare the first similar track
            if (similarTracks.length > 0) {
              const nextSong = similarTracks[0];

              if (!nextSong.id) {
                console.log('⚠️ Preparing first similar track from backend...');
                const preparedSong = await musicApi.prepareForPlaying({
                  title: nextSong.title,
                  artistName: nextSong.artistName,
                  albumName: nextSong.albumName,
                  albumCover: nextSong.albumCover,
                  mbid: nextSong.mbid,
                  duration: nextSong.duration,
                  lastFMLink: nextSong.lastFMLink
                });

                console.log('✅ First similar track prepared:', preparedSong);

                // Update the queue with the prepared song
                setQueue(prev => {
                  const newQueue = [...prev];
                  newQueue[0] = preparedSong;
                  return newQueue;
                });

                preparedNextSongRef.current = preparedSong;
              } else {
                console.log('✅ First similar track already has ID');
                preparedNextSongRef.current = nextSong;
              }
            }
          } else {
            // Queue has songs, prepare the first one
            const nextSong = queue[0];

            // Skip if already prepared
            if (preparedNextSongRef.current?.title === nextSong.title) {
              console.log('⏭️ Next song already prepared:', nextSong.title);
              isPreparingNextRef.current = false;
              return;
            }

            console.log('🔄 Preparing next song from queue:', nextSong.title);

            // If song doesn't have an ID, prepare it
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

              // Update the queue with the prepared song
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

  // Add effect to sync isPlaying with audio element
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
      // Use the prepared song if available, otherwise use queue[0]
      const nextSong = preparedNextSongRef.current || queue[0];
      console.log('🎵 Next song:', nextSong.title, 'Has ID:', !!nextSong.id);
      console.log('🎵 Using prepared song:', !!preparedNextSongRef.current);

      // Remove from queue
      setQueue(prev => prev.slice(1));

      // Reset prepared reference
      preparedNextSongRef.current = null;
      isPreparingNextRef.current = false;

      // Play the song (which is already prepared if we did it right)
      play(nextSong);
    } else {
      console.log('⏹️ Queue empty, stopping playback');
      setIsPlaying(false);
    }
  }, [queue, play]);

  const playPrevious = useCallback(() => {
    if (!audioRef.current) return;

    // If more than 3 seconds into the song, restart it
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setProgress(0);
    } else {
      // TODO: Implement previous song from history
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

    // If we removed the next song that was being prepared, reset
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

  const changeQuality = useCallback((newQuality: '128' | '320' | 'FLAC') => {
    console.log('🎚️ Changing quality to:', newQuality);
    setQuality(newQuality);
    localStorage.setItem('preferred_quality', newQuality);
  }, []);

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

    // Audio ref (for direct access if needed)
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