import { RootState } from '@/types/states.ts';

export const selectPlayer = (state: RootState) => state.player;
export const selectCurrentSong = (state: RootState) => state.player.currentSong;
export const selectIsPlaying = (state: RootState) => state.player.isPlaying;
export const selectProgress = (state: RootState) => state.player.progress;
export const selectVolume = (state: RootState) => state.player.volume;
export const selectQueue = (state: RootState) => state.player.queue;
export const selectQuality = (state: RootState) => state.player.quality;