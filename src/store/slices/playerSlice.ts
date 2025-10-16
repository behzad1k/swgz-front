import { PlayerState } from '@/types/states.ts';

export const initialPlayerState: PlayerState = {
  currentSong: null,
  queue: [],
  isPlaying: false,
  progress: 0,
  volume: 1,
  repeat: false,
  shuffle: false,
  quality: (localStorage.getItem('preferred_quality') as '128' | '320' | 'flac') || '320',
};