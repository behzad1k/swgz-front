export const APP_NAME = 'Swgz Music';

export const AUDIO_QUALITIES = {
  LOW: '128',
  MEDIUM: '320',
  HIGH: 'FLAC',
} as const;

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  LIBRARY: '/library',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGIN: '/login',
  SIGNUP: '/signup',
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  PREFERRED_QUALITY: 'preferred_quality',
  THEME: 'theme',
  VOLUME: 'volume',
  QUEUE: 'queue',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    GOOGLE: '/auth/google',
  },
  MUSIC: {
    SEARCH: '/music/search',
    STREAM: '/music/stream',
    RECENT: '/music/recently-played',
  },
  LIBRARY: {
    GET: '/library',
    LIKED: '/library/liked',
    ADD: '/library/add',
  },
  PLAYLISTS: {
    GET: '/playlists',
    CREATE: '/playlists',
  },
} as const;

export const MIME_TYPES = {
  MP3: 'audio/mpeg',
  FLAC: 'audio/flac',
  OGG: 'audio/ogg',
  WAV: 'audio/wav',
  M4A: 'audio/mp4',
} as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const DEBOUNCE_DELAY = 300;
export const TOAST_DURATION = 3000;