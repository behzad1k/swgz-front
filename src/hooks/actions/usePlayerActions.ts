import { usePlayerContext } from '@/contexts/PlayerContext';
import { PlayerActionKeys } from '@store/playerSlice.ts';
import { QualityType } from '@/types/global';
import { Track } from '@/types/models';
import { useCallback } from 'react';

export const usePlayerActions = () => {
  const { dispatch, state } = usePlayerContext();

  const setAudioRef = useCallback(
    (ref: HTMLAudioElement | null) => {
      console.log(ref);
      dispatch({ type: PlayerActionKeys.SET_AUDIO_REF, payload: ref });
    },
    [dispatch]
  );

  const setCurrentSong = useCallback(
    (song: Track | null) => {
      dispatch({ type: PlayerActionKeys.SET_CURRENT_SONG, payload: song });
    },
    [dispatch]
  );

  const setIsPlaying = useCallback(
    (isPlaying: boolean) => {
      dispatch({ type: PlayerActionKeys.SET_IS_PLAYING, payload: isPlaying });
    },
    [dispatch]
  );

  const togglePlay = useCallback(() => {
    dispatch({ type: PlayerActionKeys.TOGGLE_PLAY });
  }, [dispatch]);

  const setProgress = useCallback(
    (progress: number) => {
      dispatch({ type: PlayerActionKeys.SET_PROGRESS, payload: progress });
    },
    [dispatch]
  );

  const setVolume = useCallback(
    (volume: number) => {
      dispatch({ type: PlayerActionKeys.SET_VOLUME, payload: volume });
    },
    [dispatch]
  );

  const changeVolume = useCallback(
    (value: number) => {
      const volumeValue = value;
      setVolume(volumeValue);
      if (state.audioRef) {
        state.audioRef.volume = volumeValue / 100;
      }
    },
    [setVolume, state.audioRef]
  );

  const setQuality = useCallback(
    (quality: QualityType) => {
      dispatch({ type: PlayerActionKeys.SET_QUALITY, payload: quality });
    },
    [dispatch]
  );

  const setQueue = useCallback(
    (tracks: Track[]) => {
      dispatch({ type: PlayerActionKeys.SET_QUEUE, payload: tracks });
    },
    [dispatch]
  );

  const addToQueue = useCallback(
    (track: Track) => {
      console.log('Adding to queue:', track.title);
      dispatch({ type: PlayerActionKeys.ADD_TO_QUEUE, payload: track });
    },
    [dispatch]
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      console.log('Removing from queue at index:', index);
      dispatch({ type: PlayerActionKeys.REMOVE_FROM_QUEUE, payload: index });
    },
    [dispatch]
  );

  const clearQueue = useCallback(() => {
    dispatch({ type: PlayerActionKeys.CLEAR_QUEUE });
  }, [dispatch]);

  const setRepeat = useCallback(
    (repeat: boolean) => {
      dispatch({ type: PlayerActionKeys.SET_REPEAT, payload: repeat });
    },
    [dispatch]
  );

  const toggleRepeat = useCallback(() => {
    dispatch({ type: PlayerActionKeys.TOGGLE_REPEAT });
  }, [dispatch]);

  const setShuffle = useCallback(
    (shuffle: boolean) => {
      dispatch({ type: PlayerActionKeys.SET_SHUFFLE, payload: shuffle });
    },
    [dispatch]
  );

  const toggleShuffle = useCallback(() => {
    dispatch({ type: PlayerActionKeys.TOGGLE_SHUFFLE });
  }, [dispatch]);

  const play = useCallback(
    (song: Track) => {
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);
    },
    [setCurrentSong, setIsPlaying, setProgress]
  );

  const playNext = useCallback(() => {
    console.log('️ Playing next song');

    if (state.queue.length > 0) {
      const nextSong = state.queue[0];

      dispatch({ type: PlayerActionKeys.SET_QUEUE, payload: state.queue.slice(1) });
      play(nextSong);
    } else {
      console.log('️ Queue empty, stopping playback');
      setIsPlaying(false);
    }
  }, [state.queue, dispatch, play, setIsPlaying]);

  const playPrevious = useCallback(() => {
    if (!state.audioRef) return;

    if (state.audioRef.currentTime > 3) {
      state.audioRef.currentTime = 0;
      setProgress(0);
    } else {
      console.log('Previous song not implemented yet');
    }
  }, [setProgress, state.audioRef]);

  const seek = useCallback(
    (value: number) => {
      if (!state.audioRef || !state.audioRef.duration) return;

      const newTime = (value / 100) * state.audioRef.duration;
      state.audioRef.currentTime = newTime;
      setProgress(value);
    },
    [setProgress, state.audioRef]
  );

  const changeQuality = useCallback(
    (newQuality: QualityType) => {
      setQuality(newQuality);
    },
    [setQuality]
  );

  return {
    setAudioRef,
    setCurrentSong,
    setIsPlaying,
    togglePlay,
    setProgress,
    setVolume,
    changeVolume,
    setQuality,
    changeQuality,
    setQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setRepeat,
    toggleRepeat,
    setShuffle,
    toggleShuffle,
    play,
    playNext,
    playPrevious,
    seek,
  };
};