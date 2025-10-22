// src/hooks/useAudioPlayer.ts
import { useEffect, useRef, useState } from 'react';
import { musicApi } from '@api/music.api';
import { usePlayerActions } from './actions/usePlayerActions';
import {
  useCurrentSong,
  useIsPlaying,
  usePlayerQuality,
  usePlayerRepeat,
  usePlayerVolume,
} from './selectors/usePlayerSelectors';
import { useCurrentUser } from './selectors/useAuthSelectors';
import { useDownloadStatus } from './useDownloadStatus';
import { API_BASE_URL } from '@/utils/api';

export const useAudioPlayer = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const quality = usePlayerQuality();
  const repeat = usePlayerRepeat();
  const user = useCurrentUser();
  const volume = usePlayerVolume();

  const [actualQuality, setActualQuality] = useState<string | null>(null);
  const [isAutoSelected, _setIsAutoSelected] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [songDuration, setSongDuration] = useState<number | null>(null);

  const {
    setIsPlaying,
    setProgress,
    setCurrentSong,
    playNext: playNextAction,
    setAudioRef,
  } = usePlayerActions();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadingRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSongIdRef = useRef<string | null>(null);
  const shouldAutoPlayRef = useRef(false);
  const isWaitingForDownloadRef = useRef(false); // NEW: Track if waiting for download

  // Download status tracking
  const downloadStatus = useDownloadStatus(
    isWaitingForDownloadRef.current ? currentSongIdRef.current : null, // Only connect when waiting
    quality,
    {
      onReady: (data) => {
        if (!data) {
          console.error('⚠️ onReady called with null/undefined data');
          setIsDownloading(false);
          isWaitingForDownloadRef.current = false;
          return;
        }

        console.log('🎵 File ready from download, loading stream...');
        setIsDownloading(false);
        setDownloadProgress(100);
        isWaitingForDownloadRef.current = false;

        // Set metadata safely
        if (data.quality) setActualQuality(data.quality);
        if (data.duration) setSongDuration(data.duration);

        // Build full URL with API key
        const apiKey = user?.apiKey
        if (!apiKey) {
          console.error('❌ No API key found in cookies');
          setIsPlaying(false);
          return;
        }

        let fullUrl: string;

        if (data.streamUrl) {
          fullUrl = `${API_BASE_URL}${data.streamUrl}${data.streamUrl.includes('?') ? '&' : '?'}api-key=${apiKey}`;
        } else if (currentSongIdRef.current) {
          fullUrl = `${API_BASE_URL}/music/stream/${currentSongIdRef.current}?api-key=${apiKey}${quality ? `&quality=${quality}` : ''}`;
        } else {
          console.error('❌ No song ID available');
          setIsPlaying(false);
          return;
        }

        console.log('🎵 Stream URL from download:', fullUrl);

        // Load and play the stream
        loadStreamUrl(fullUrl, shouldAutoPlayRef.current);
      },
      onError: (error) => {
        console.error('Download failed:', error || 'Unknown error');
        setIsDownloading(false);
        setIsPlaying(false);
        isWaitingForDownloadRef.current = false;
      },
      onProgress: (progress) => {
        setDownloadProgress(progress);
      },
      onMetadata: (metadata) => {
        if (metadata.quality) setActualQuality(metadata.quality);
        if (metadata.duration) setSongDuration(metadata.duration);
      },
    }
  );

  // Initialize audio element (same as before)
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      audio.volume = volume / 100;
      audioRef.current = audio;
      setAudioRef(audio);
    }

    const audio = audioRef.current;

    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }

    const updateProgress = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);

        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audio.duration,
              playbackRate: audio.playbackRate,
              position: audio.currentTime,
            });
          } catch (error) {
            // Ignore
          }
        }
      }
    };

    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch((err) => console.error('Repeat play failed:', err));
      } else {
        playNextAction();
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      console.error('Audio error details:', {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src,
      });
      setIsPlaying(false);
      setIsDownloading(false);
    };

    const handleCanPlay = () => {
      console.log('✅ Audio: Can play');

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current
        .resume()
        .then(() => console.log('AudioContext resumed'))
        .catch((e) => console.error(e));
      }
    };

    const handlePlay = async () => {
      console.log('▶️ Audio: Play event fired');

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (error) {
          console.warn('Wake lock failed:', error);
        }
      }
    };

    const handlePause = () => {
      console.log('⏸️ Audio: Pause event fired');
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);

      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [repeat, setProgress, setIsPlaying, playNextAction, setAudioRef, volume]);

  // Load stream URL helper
  const loadStreamUrl = async (streamUrl: string, shouldPlay: boolean = false) => {
    if (!audioRef.current) {
      console.error('❌ Audio ref not available');
      return;
    }

    const audio = audioRef.current;

    try {
      console.log('📂 Loading stream URL:', streamUrl);
      console.log('🎵 Should play:', shouldPlay, 'isPlaying:', isPlaying);

      // Abort any ongoing load
      // if (audio.src && audio.readyState > 0) {
      //   console.log('⏹️ Aborting previous load');
      //   audio.pause();
      //   audio.src = '';
      //   audio.load(); // Reset
      //   await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
      // }

      // Set the new source
      audio.src = streamUrl;
      audio.load();

      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('⏱️ Audio load timeout');
          reject(new Error('Audio load timeout'));
        }, 60000);

        const canPlayHandler = () => {
          console.log('✅ Audio can play event received');
          clearTimeout(timeout);
          audio.removeEventListener('canplay', canPlayHandler);
          audio.removeEventListener('error', errorHandler);
          resolve();
        };

        const errorHandler = (e: Event) => {
          console.error('❌ Audio load error event:', e);
          clearTimeout(timeout);
          audio.removeEventListener('canplay', canPlayHandler);
          audio.removeEventListener('error', errorHandler);
          reject(e);
        };

        audio.addEventListener('canplay', canPlayHandler, { once: true });
        audio.addEventListener('error', errorHandler, { once: true });
      });

      console.log('✅ Audio loaded and ready');

      // Resume audio context if needed
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log('🔊 Resuming AudioContext...');
        await audioContextRef.current.resume();
      }

      // Play if requested
      if (shouldPlay) {
        console.log('▶️ Attempting to play audio...');

        try {
          await audio.play();
          console.log('✅ Playback started successfully');

          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        } catch (playError: any) {
          console.error('❌ Play error:', playError);

          if (playError.name === 'NotAllowedError') {
            console.warn('⚠️ Autoplay blocked - user interaction required');
            setIsPlaying(false);
          } else {
            // Retry once
            console.log('🔄 Retrying play after 500ms...');
            await new Promise((resolve) => setTimeout(resolve, 500));

            try {
              await audio.play();
              console.log('✅ Playback started on retry');
            } catch (retryError) {
              console.error('❌ Retry failed:', retryError);
              setIsPlaying(false);
            }
          }
        }
      } else {
        console.log('ℹ️ Audio loaded but not auto-playing');
      }
    } catch (error) {
      console.error('❌ Failed to load stream:', error);
      setIsPlaying(false);
    }
  };

  // Main song loading effect
  useEffect(() => {
    const loadAndPlaySong = async () => {
      // Skip if already loading or waiting for download
      if (!currentSong || !audioRef.current || isLoadingRef.current || isWaitingForDownloadRef.current) {
        if (isWaitingForDownloadRef.current) {
          console.log('⏳ Already waiting for download to complete...');
        }
        return;
      }

      try {
        isLoadingRef.current = true;
        let songObj = currentSong;

        // Prepare song if no ID
        if (!currentSong.id) {
          console.log('🎵 Song has no ID, preparing...');
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

        currentSongIdRef.current = songObj.id || null;
        shouldAutoPlayRef.current = isPlaying;

        // Check stream info first
        console.log('🔍 Checking stream info...');
        const streamInfo = await musicApi.getStreamInfo(songObj.id || '', quality);

        if (streamInfo.ready && streamInfo.filePath) {
          // File is ready, stream immediately
          console.log('✅ File already cached, streaming immediately...');
          setIsDownloading(false);
          isWaitingForDownloadRef.current = false;

          if (streamInfo.quality) setActualQuality(streamInfo.quality);
          if (streamInfo.duration) setSongDuration(streamInfo.duration);

          const apiKey = user?.apiKey
          if (!apiKey) {
            console.error('❌ No API key found');
            setIsPlaying(false);
            return;
          }

          const streamUrl = `${API_BASE_URL}/music/stream/${songObj.id}?api-key=${apiKey}${quality ? `&quality=${quality}` : ''}`;
          await loadStreamUrl(streamUrl, isPlaying);
        } else {
          // Need to download
          console.log('⬇️ File not ready, triggering download...');
          setIsDownloading(true);
          setDownloadProgress(0);
          isWaitingForDownloadRef.current = true; // Start waiting for download

          const downloadResponse = await musicApi.triggerDownload(songObj.id || '', quality);

          if (downloadResponse.status === 'ready') {
            // Already ready (race condition)
            console.log('✅ File became ready during request (race condition)');
            setIsDownloading(false);
            isWaitingForDownloadRef.current = false;

            if (downloadResponse.quality) setActualQuality(downloadResponse.quality);
            if (downloadResponse.duration) setSongDuration(downloadResponse.duration);

            const apiKey = user?.apiKey
            if (!apiKey) {
              console.error('❌ No API key found');
              setIsPlaying(false);
              return;
            }

            let streamUrl: string;
            if (downloadResponse.streamUrl) {
              streamUrl = `${API_BASE_URL}${downloadResponse.streamUrl}?api-key=${apiKey}`;
            } else {
              streamUrl = `${API_BASE_URL}/music/stream/${songObj.id}?api-key=${apiKey}${quality ? `&quality=${quality}` : ''}`;
            }

            await loadStreamUrl(streamUrl, isPlaying);
          } else {
            // Download started, wait for SSE onReady callback
            console.log('📡 Download started, waiting for SSE ready event...');
            // Don't call loadStreamUrl here - let onReady handle it
          }
        }
      } catch (error) {
        console.error('❌ Failed to load song:', error);
        setIsPlaying(false);
        setIsDownloading(false);
        isWaitingForDownloadRef.current = false;
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadAndPlaySong();
  }, [currentSong?.id, currentSong?.title, quality, setCurrentSong, setIsPlaying]);

  // Sync play/pause state
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    const syncPlayback = async () => {
      // Don't sync if waiting for download - let onReady handle initial play
      if (isWaitingForDownloadRef.current) {
        console.log('⏳ Skipping playback sync - waiting for download');
        return;
      }

      if (isPlaying && audio.paused && audio.src) {
        console.log('▶️ Syncing: Playing audio (was paused)');

        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        audio
        .play()
        .then(() => {
          console.log('✅ Sync play successful');
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        })
        .catch((e) => {
          console.error('❌ Sync play failed:', e);
          if (e.name === 'NotAllowedError') {
            setIsPlaying(false);
          }
        });
      } else if (!isPlaying && !audio.paused) {
        console.log('⏸️ Syncing: Pausing audio');
        audio.pause();

        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    };

    syncPlayback();
  }, [isPlaying, currentSong, setIsPlaying]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return {
    audioRef,
    actualQuality,
    isAutoSelected,
    downloadProgress,
    isDownloading,
    songDuration,
    downloadStatus: downloadStatus.status,
  };
};