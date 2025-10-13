export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'swgz ',
  version: '1.0.0',
  description: 'Your premium music streaming experience',

  features: {
    downloads: true,
    offline: true,
    socialFeatures: true,
    comments: true,
    playlists: true,
  },

  limits: {
    maxPlaylistSongs: 1000,
    maxUploadSize: 100 * 1024 * 1024, // 100MB
    maxQueueSize: 100,
  },

  defaults: {
    quality: '320' as const,
    volume: 0.8,
    theme: 'dark' as const,
  },

  urls: {
    terms: '/terms',
    privacy: '/privacy',
    support: '/support',
  },
};

export default appConfig;