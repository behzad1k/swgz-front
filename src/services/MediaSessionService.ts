import { Track } from '@/types/models.ts';

class MediaSessionService {
  updateMetadata(song: Track): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artistName,
        album: song.albumName || 'Unknown Album',
        artwork: song.coverUrl
          ? [
            { src: song.coverUrl, sizes: '96x96', type: 'image/png' },
            { src: song.coverUrl, sizes: '128x128', type: 'image/png' },
            { src: song.coverUrl, sizes: '192x192', type: 'image/png' },
            { src: song.coverUrl, sizes: '256x256', type: 'image/png' },
            { src: song.coverUrl, sizes: '384x384', type: 'image/png' },
            { src: song.coverUrl, sizes: '512x512', type: 'image/png' },
          ]
          : [],
      });
    }
  }

  setActionHandlers(handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onSeek?: (time: number) => void;
  }): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', handlers.onPlay);
      navigator.mediaSession.setActionHandler('pause', handlers.onPause);
      navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
      navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious);

      if (handlers.onSeek) {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            handlers.onSeek!(details.seekTime);
          }
        });
      }
    }
  }

  setPlaybackState(state: 'playing' | 'paused' | 'none'): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  updatePosition(duration: number, currentTime: number, playbackRate: number = 1): void {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate,
        position: currentTime,
      });
    }
  }
}

export default new MediaSessionService();