// hooks/usePlayerSelectors.ts
import { usePlayerContext } from '@/contexts/PlayerContext';
import { useMemo } from 'react';

export const usePlayerState = () => {
  const { state } = usePlayerContext();
  return state;
};

export const useAudioRef = () => {
  const { state } = usePlayerContext();
  return state.audioRef;
};

export const useCurrentSong = () => {
  const { state } = usePlayerContext();
  return state.currentSong;
};

export const useIsPlaying = () => {
  const { state } = usePlayerContext();
  return state.isPlaying;
};

export const useQueue = () => {
  const { state } = usePlayerContext();
  return state.queue;
};

export const usePlayerProgress = () => {
  const { state } = usePlayerContext();
  return state.progress;
};

export const usePlayerVolume = () => {
  const { state } = usePlayerContext();
  return state.volume;
};

export const usePlayerRepeat = () => {
  const { state } = usePlayerContext();
  return state.repeat;
};

export const usePlayerShuffle = () => {
  const { state } = usePlayerContext();
  return state.shuffle;
};

export const usePlayerQuality = () => {
  const { state } = usePlayerContext();
  return state.quality;
};

// Computed selectors
export const useQueueLength = () => {
  const { state } = usePlayerContext();
  return useMemo(() => state.queue.length, [state.queue.length]);
};

export const useIsQueueEmpty = () => {
  const { state } = usePlayerContext();
  return useMemo(() => state.queue.length === 0, [state.queue.length]);
};

export const useHasNextSong = () => {
  const { state } = usePlayerContext();
  return useMemo(() => {
    if (state.queue.length === 0) return false;
    const currentIndex = state.queue.findIndex((song) => song.id === state.currentSong?.id);
    return currentIndex < state.queue.length - 1 || state.repeat;
  }, [state.queue, state.currentSong, state.repeat]);
};

export const useHasPreviousSong = () => {
  const { state } = usePlayerContext();
  return useMemo(() => {
    if (state.queue.length === 0) return false;
    const currentIndex = state.queue.findIndex((song) => song.id === state.currentSong?.id);
    return currentIndex > 0 || state.repeat;
  }, [state.queue, state.currentSong, state.repeat]);
};