import { QualityType } from '@/types/global.ts';
import { Track } from '@/types/models.ts';
import { PlayerState } from '@/types/states.ts';
import { LOCAL_STORAGE_KEYS } from '@utils/constants.ts';

export const initialPlayerState: PlayerState = {
  audioRef: null,
  currentSong: null,
  queue: [],
  isPlaying: false,
  progress: 0,
  volume: 100,
  repeat: false,
  shuffle: false,
  // quality: (localStorage.getItem(LOCAL_STORAGE_KEYS.PREFERRED_QUALITY) as QualityType) || '320',
  quality: null,
};

export enum PlayerActionKeys {
  SET_AUDIO_REF = 'SET_AUDIO_REF',
  SET_CURRENT_SONG = 'SET_CURRENT_SONG',
  SET_IS_PLAYING = 'SET_IS_PLAYING',
  SET_PROGRESS = 'SET_PROGRESS',
  SET_VOLUME = 'SET_VOLUME',
  SET_QUALITY = 'SET_QUALITY',
  SET_QUEUE = 'SET_QUEUE',
  ADD_TO_QUEUE = 'ADD_TO_QUEUE',
  REMOVE_FROM_QUEUE = 'REMOVE_FROM_QUEUE',
  CLEAR_QUEUE = 'CLEAR_QUEUE',
  SET_REPEAT = 'SET_REPEAT',
  SET_SHUFFLE = 'SET_SHUFFLE',
  TOGGLE_PLAY = 'TOGGLE_PLAY',
  TOGGLE_REPEAT = 'TOGGLE_REPEAT',
  TOGGLE_SHUFFLE = 'TOGGLE_SHUFFLE',
}

export type PlayerAction =
  | { type: PlayerActionKeys.SET_AUDIO_REF; payload: HTMLAudioElement | null }
  | { type: PlayerActionKeys.SET_CURRENT_SONG; payload: Track | null }
  | { type: PlayerActionKeys.SET_IS_PLAYING; payload: boolean }
  | { type: PlayerActionKeys.SET_PROGRESS; payload: number }
  | { type: PlayerActionKeys.SET_VOLUME; payload: number }
  | { type: PlayerActionKeys.SET_QUALITY; payload: QualityType }
  | { type: PlayerActionKeys.SET_QUEUE; payload: Track[] }
  | { type: PlayerActionKeys.ADD_TO_QUEUE; payload: Track }
  | { type: PlayerActionKeys.REMOVE_FROM_QUEUE; payload: number }
  | { type: PlayerActionKeys.CLEAR_QUEUE }
  | { type: PlayerActionKeys.SET_REPEAT; payload: boolean }
  | { type: PlayerActionKeys.SET_SHUFFLE; payload: boolean }
  | { type: PlayerActionKeys.TOGGLE_PLAY }
  | { type: PlayerActionKeys.TOGGLE_REPEAT }
  | { type: PlayerActionKeys.TOGGLE_SHUFFLE };

export const playerReducer = (
  state: PlayerState,
  action: PlayerAction
): PlayerState => {
  switch (action.type) {
    case PlayerActionKeys.SET_AUDIO_REF:
      return { ...state, audioRef: action.payload };
    case PlayerActionKeys.SET_CURRENT_SONG:
      return { ...state, currentSong: action.payload };
    case PlayerActionKeys.SET_IS_PLAYING:
      return { ...state, isPlaying: action.payload };
    case PlayerActionKeys.TOGGLE_PLAY:
      return { ...state, isPlaying: !state.isPlaying };
    case PlayerActionKeys.SET_PROGRESS:
      return { ...state, progress: action.payload };
    case PlayerActionKeys.SET_VOLUME:
      return { ...state, volume: action.payload };
    case PlayerActionKeys.SET_QUALITY:
      localStorage.setItem(LOCAL_STORAGE_KEYS.PREFERRED_QUALITY, action.payload);
      return { ...state, quality: action.payload };
    case PlayerActionKeys.SET_QUEUE:
      return { ...state, queue: action.payload };
    case PlayerActionKeys.ADD_TO_QUEUE:
      return { ...state, queue: [...state.queue, action.payload] };
    case PlayerActionKeys.REMOVE_FROM_QUEUE:
      return {
        ...state,
        queue: state.queue.filter((_, index) => index !== action.payload),
      };
    case PlayerActionKeys.CLEAR_QUEUE:
      return { ...state, queue: [] };
    case PlayerActionKeys.SET_REPEAT:
      return { ...state, repeat: action.payload };
    case PlayerActionKeys.TOGGLE_REPEAT:
      return { ...state, repeat: !state.repeat };
    case PlayerActionKeys.SET_SHUFFLE:
      return { ...state, shuffle: action.payload };
    case PlayerActionKeys.TOGGLE_SHUFFLE:
      return { ...state, shuffle: !state.shuffle };
    default:
      return state;
  }
};