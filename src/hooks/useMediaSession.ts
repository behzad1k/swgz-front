import { useEffect, useRef } from 'react';
import { useCurrentSong, useIsPlaying, usePlayerProgress } from '@/hooks/selectors/usePlayerSelectors';
import { usePlayerActions } from '@/hooks/actions/usePlayerActions';

export const useMediaSession = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const progress = usePlayerProgress();
  const {
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setProgress
  } = usePlayerActions();

    const audioRefForSeek = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
    const audioElements = document.getElementsByTagName('audio');
    if (audioElements.length > 0) {
      audioRefForSeek.current = audioElements[0];
    }
  }, []);

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      console.warn('Media Session API not supported');
      return;
    }

    if (!currentSong) return;

        navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artistName,
      album: currentSong.albumName,
      artwork: [
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '256x256',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '384x384',
          type: 'image/png',
        },
        {
          src: currentSong.albumCover || '/default-cover.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      }, [currentSong, isPlaying]);

    useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentSong || !audioRefForSeek.current) return;

    const audio = audioRefForSeek.current;

    if ('setPositionState' in navigator.mediaSession && audio.duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime,
        });
      } catch (error) {
        console.warn('Failed to update position state:', error);
      }
    }
  }, [currentSong, progress]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

        const actionHandlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      [
        'play',
        () => {
                    togglePlay();
        },
      ],
      [
        'pause',
        () => {
                    togglePlay();
        },
      ],
      [
        'previoustrack',
        () => {
                    playPrevious();
        },
      ],
      [
        'nexttrack',
        () => {
                    playNext();
        },
      ],
      [
        'seekbackward',
        (details) => {

          if (!audioRefForSeek.current) {
            console.warn('No audio element available for seeking');
            return;
          }

          const audio = audioRefForSeek.current;
          const skipTime = details.seekOffset || 10; // Default 10 seconds

                    const newTime = Math.max(0, audio.currentTime - skipTime);

          console.log(`Seeking backward: ${audio.currentTime}s -> ${newTime}s`);

                    audio.currentTime = newTime;

                    if (audio.duration) {
            const newProgress = (newTime / audio.duration) * 100;
            setProgress(newProgress);
          }
        },
      ],
      [
        'seekforward',
        (details) => {

          if (!audioRefForSeek.current) {
            console.warn('No audio element available for seeking');
            return;
          }

          const audio = audioRefForSeek.current;
          const skipTime = details.seekOffset || 10; // Default 10 seconds

                    const newTime = Math.min(audio.duration, audio.currentTime + skipTime);

          console.log(`Seeking forward: ${audio.currentTime}s -> ${newTime}s`);

                    audio.currentTime = newTime;

                    if (audio.duration) {
            const newProgress = (newTime / audio.duration) * 100;
            setProgress(newProgress);
          }
        },
      ],
      [
        'seekto',
        (details) => {

          if (!audioRefForSeek.current) {
            console.warn('No audio element available for seeking');
            return;
          }

          if (details.seekTime === undefined || details.seekTime === null) {
            console.warn('No seek time provided');
            return;
          }

          const audio = audioRefForSeek.current;
          const seekTime = details.seekTime;

                    const validSeekTime = Math.max(0, Math.min(audio.duration, seekTime));

          console.log(`️ Seeking to: ${validSeekTime}s`);

                    audio.currentTime = validSeekTime;

                    if (audio.duration) {
            const newProgress = (validSeekTime / audio.duration) * 100;
            setProgress(newProgress);
          }
        },
      ],
      [
        'stop',
        () => {
                    if (audioRefForSeek.current) {
            audioRefForSeek.current.pause();
            audioRefForSeek.current.currentTime = 0;
          }
          togglePlay();
        },
      ],
    ];

        actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
        console.log(`Media Session: Registered "${action}" handler`);
      } catch (error) {
        console.warn(`️ Media Session: Action "${action}" not supported`, error);
      }
    });

        return () => {
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {
                  }
      });
    };
  }, [togglePlay, playNext, playPrevious, seek, setProgress]);
};