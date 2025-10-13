import { useEffect } from 'react';
import { Track } from '@/types/models.ts';

interface UseMediaSessionProps {
  song: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const useMediaSession = ({
                                  song,
                                  isPlaying,
                                  onPlay,
                                  onPause,
                                  onNext,
                                  onPrevious,
                                }: UseMediaSessionProps) => {
  useEffect(() => {
    if ('mediaSession' in navigator && song) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artistName,
        album: song.albumName,
        artwork: [
          { src: song.coverUrl || '', sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', onPlay);
      navigator.mediaSession.setActionHandler('pause', onPause);
      navigator.mediaSession.setActionHandler('nexttrack', onNext);
      navigator.mediaSession.setActionHandler('previoustrack', onPrevious);

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [song, isPlaying, onPlay, onPause, onNext, onPrevious]);
};

export default useMediaSession;