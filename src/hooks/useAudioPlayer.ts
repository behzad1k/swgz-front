import { useEffect, useRef } from 'react';
import { musicApi } from '@api/music.api';
import { usePlayerActions } from './actions/usePlayerActions';
import { useCurrentSong, useIsPlaying, usePlayerQuality, usePlayerRepeat } from './selectors/usePlayerSelectors';
import { useCurrentUser } from './selectors/useAuthSelectors';

export const useAudioPlayer = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const quality = usePlayerQuality();
  const repeat = usePlayerRepeat();
  const user = useCurrentUser();

  const {
    setIsPlaying,
    setProgress,
    setCurrentSong,
    playNext: playNextAction,
  } = usePlayerActions();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadingRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      console.log('🎵 Song ended');
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNextAction();
      }
    };

    const handleError = (e: Event) => {
      console.error('❌ Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [repeat, setProgress, setIsPlaying, playNextAction]);

  // Load and play song when currentSong or quality changes
  useEffect(() => {
    const loadAndPlaySong = async () => {
      if (!currentSong || !audioRef.current || isLoadingRef.current) {
        return;
      }

      console.log('🎵 Loading song:', currentSong.title);

      try {
        isLoadingRef.current = true;
        let songObj = currentSong;

        // Prepare song if it doesn't have an ID
        if (!currentSong.id) {
          console.log('⚠️ Song has no ID, preparing...');
          songObj = await musicApi.prepareForPlaying({
            title: currentSong.title,
            artistName: currentSong.artistName,
            albumName: currentSong.albumName,
            albumCover: currentSong.albumCover,
            mbid: currentSong.mbid,
            duration: currentSong.duration,
            lastFMLink: currentSong.lastFMLink,
          });

          console.log('✅ Song prepared:', songObj);
          setCurrentSong(songObj);
        }

        const audio = audioRef.current;
        const streamUrl = musicApi.getStreamUrl(songObj?.id || '', quality, user?.apiKey || '');

        console.log('🌐 Setting stream URL');
        audio.src = streamUrl;
        audio.load();

        if (isPlaying) {
          console.log('▶️ Attempting to play...');
          await audio.play();
          console.log('✅ Playback started');
        }
      } catch (error) {
        console.error('❌ Failed to load song:', error);
        setIsPlaying(false);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadAndPlaySong();
  }, [currentSong?.id, currentSong?.title, quality, user?.apiKey, isPlaying, setCurrentSong, setIsPlaying]);

  // Sync isPlaying with audio element
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    if (isPlaying && audio.paused) {
      console.log('▶️ Playing audio');
      audio.play().catch((e) => console.error('❌ Play failed:', e));
    } else if (!isPlaying && !audio.paused) {
      console.log('⏸️ Pausing audio');
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  return audioRef;
};