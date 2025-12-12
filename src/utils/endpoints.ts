const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGN_UP: '/auth/signup',
    CONFIRM_EMAIL: '/auth/confirm-email',
    USER: '/auth/user',
    TELEGRAM: '/auth/telegram',
  },
  PLAYLIST: {
    INDEX: '/playlists',
    COVER: '/playlists/cover',
    SONGS: '/playlists/songs',
    ORDER: '/playlists/order',
    YOUTUBE: '/playlists/import/youtube',
    SPOTIFY: '/playlists/import/spotify',
  },
};

export const publicEndpoints = [ENDPOINTS.AUTH.LOGIN, ENDPOINTS.AUTH.SIGN_UP];
export default ENDPOINTS;
