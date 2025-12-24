// src/hooks/useAudioPlayer.ts
import { API_BASE_URL } from '@/utils/api';
import { musicApi } from '@api/music.api';
import { useEffect, useRef, useState } from 'react';
import { usePlayerActions } from './actions/usePlayerActions';
import { useCurrentUser } from './selectors/useAuthSelectors';
import {
  useCurrentSong,
  useIsPlaying,
  usePlayerQuality,
  usePlayerRepeat,
  usePlayerVolume,
  useQueue,
} from './selectors/usePlayerSelectors';
import { useDownloadStatus } from './useDownloadStatus';

let globalAudioInstance: HTMLAudioElement | null = null;
let globalAudioCleanup: (() => void) | null = null;

// iOS Audio Session Manager
class iOSAudioSessionManager {
  private static instance: iOSAudioSessionManager;
  private isActive = false;
  private audioContext: AudioContext | null = null;

  static getInstance(): iOSAudioSessionManager {
    if (!this.instance) {
      this.instance = new iOSAudioSessionManager();
    }
    return this.instance;
  }

  async activate(): Promise<void> {
    if (this.isActive) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isActive = true;
      console.log('🔊 iOS Audio Session activated');
    } catch (error) {
      console.error('Failed to activate audio session:', error);
    }
  }

  async ensureActive(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async deactivate(): Promise<void> {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
    }
    this.isActive = false;
  }
}

export const useAudioPlayer = () => {
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const quality = usePlayerQuality();
  const queue = useQueue();
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

  const repeatState = usePlayerRepeat();
  const repeatRef = useRef(repeatState);
  const queueRef = useRef(queue);
  const isPlayingRef = useRef(isPlaying); // ADDED: Track isPlaying state
  const currentSongRef = useRef(currentSong); // ADDED: Track current song

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadingRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSongIdRef = useRef<string | null>(null);
  const shouldAutoPlayRef = useRef(false);
  const isWaitingForDownloadRef = useRef(false);
  const previousUrlRef = useRef<string>('');
  const lastPathnameRef = useRef<string | null>(null);
  const endedEventCountRef = useRef(0); // ADDED: Prevent duplicate ended events

  // CRITICAL FIX: Stable refs for callbacks to prevent event listener cleanup
  const playNextActionRef = useRef(playNextAction);
  const setIsPlayingRef = useRef(setIsPlaying);
  const setProgressRef = useRef(setProgress);
  const setAudioRefRef = useRef(setAudioRef);
  const setCurrentSongRef = useRef(setCurrentSong);
  const volumeRef = useRef(volume);

  // Keep refs updated with latest values
  useEffect(() => {
    playNextActionRef.current = playNextAction;
  }, [playNextAction]);

  useEffect(() => {
    setIsPlayingRef.current = setIsPlaying;
  }, [setIsPlaying]);

  useEffect(() => {
    setProgressRef.current = setProgress;
  }, [setProgress]);

  useEffect(() => {
    setAudioRefRef.current = setAudioRef;
  }, [setAudioRef]);

  useEffect(() => {
    setCurrentSongRef.current = setCurrentSong;
  }, [setCurrentSong]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    console.log('🎮 isPlayingRef updated to:', isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  // Download status tracking
  const downloadStatus = useDownloadStatus(
    isWaitingForDownloadRef.current ? currentSongIdRef.current : null,
    quality,
    {
      onFilenameChanged: (data) => {
        if (!data) {
          console.error('⚠️ onFilenameChanged called with null/undefined data');
          return;
        }

        console.log('🔄 Filename changed, updating audio source...');

        const apiKey = user?.apiKey;
        if (!apiKey) {
          console.error('❌ No API key found');
          return;
        }

        let newUrl: string;
        if (data.streamUrl) {
          newUrl = `${API_BASE_URL}${data.streamUrl}${data.streamUrl.includes('?') ? '&' : '?'}api-key=${apiKey}`;
        } else if (currentSongIdRef.current) {
          newUrl = `${API_BASE_URL}/music/stream/${currentSongIdRef.current}?api-key=${apiKey}${quality ? `&quality=${quality}` : ''}`;
        } else {
          console.error('❌ No song ID available');
          return;
        }

        console.log('🎵 New stream URL after filename change:', newUrl);
        console.log('✅ New URL available for future use:', newUrl);
      },
      onReady: (data) => {
        if (!data) {
          console.error('⚠️ onReady called with null/undefined data');
          setIsDownloading(false);
          isWaitingForDownloadRef.current = false;
          return;
        }

        console.log('✅ File ready from download (metadata update only)');
        setIsDownloading(false);
        setDownloadProgress(100);
        isWaitingForDownloadRef.current = false;

        if (data.quality) setActualQuality(data.quality);
        if (data.duration) setSongDuration(data.duration);

        console.log('🎵 Audio not playing yet, loading stream...');

        const apiKey = user?.apiKey;
        if (!apiKey) {
          console.error('❌ No API key found in cookies');
          setIsPlayingRef.current(false);
          return;
        }

        let fullUrl: string;

        if (data.streamUrl) {
          fullUrl = `${API_BASE_URL}${data.streamUrl}${data.streamUrl.includes('?') ? '&' : '?'}api-key=${apiKey}`;
        } else if (currentSongIdRef.current) {
          fullUrl = `${API_BASE_URL}/music/stream/${currentSongIdRef.current}?api-key=${apiKey}${quality ? `&quality=${quality}` : ''}`;
        } else {
          console.error('❌ No song ID available');
          setIsPlayingRef.current(false);
          return;
        }

        console.log('🎵 Stream URL from download:', fullUrl);
        loadStreamUrl(fullUrl, shouldAutoPlayRef.current);
      },
      onError: (error) => {
        console.error('Download failed:', error || 'Unknown error');
        setIsDownloading(false);
        setIsPlayingRef.current(false);
        console.log('🔓 Setting isWaitingForDownloadRef to FALSE');
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

  // CRITICAL FIX: Initialize audio element with singleton pattern - NO DEPENDENCIES
  useEffect(() => {
    console.log('🎵 Initializing audio element');

    // If global instance exists, reuse it
    if (globalAudioInstance) {
      console.log('♻️ Reusing existing global audio instance');
      audioRef.current = globalAudioInstance;
      setAudioRefRef.current(globalAudioInstance);
      return;
    }

    // Create new audio element (only once globally)
    const audio = new Audio();
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.volume = volumeRef.current / 100;

    audioRef.current = audio;
    globalAudioInstance = audio;
    setAudioRefRef.current(audio);
    console.log('✅ Created new global audio instance');

    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        console.log('🔊 AudioContext created');
      }
    }

    return () => {
      console.log('🧹 Audio player component unmounting (keeping global instance)');
    };
  }, []);

  useEffect(() => {
    repeatRef.current = repeatState;
  }, [repeatState]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const newSongId = currentSong.id;
    const oldSongId = currentSongIdRef.current;

    if (oldSongId && newSongId && oldSongId !== newSongId) {
      console.log('🔄 Song changed from', oldSongId, 'to', newSongId);

      // Reset ended event counter for new song
      endedEventCountRef.current = 0;

      audio.pause();
      audio.currentTime = 0;

      if (audio.src) {
        console.log('🔇 Clearing old audio source');
        audio.removeAttribute('src');
        audio.load();
        previousUrlRef.current = '';
      }
    }
  }, [currentSong?.id]);

  // CRITICAL FIX: Audio event listeners - ZERO dependencies to prevent ANY re-runs
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('🎧 Setting up audio event listeners (ONE TIME ONLY)');

    const updateProgress = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgressRef.current(progressPercent);

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

    // CRITICAL FIX: Enhanced handleEnded with debouncing and background handling
    const handleEnded = async () => {
      // Prevent duplicate ended events (iOS fires this multiple times)
      endedEventCountRef.current++;
      const eventNumber = endedEventCountRef.current;

      console.log('🏁 Audio stream ended (event #' + eventNumber + ')');

      // Only process the first ended event
      if (eventNumber > 1) {
        console.log('⏭️ Ignoring duplicate ended event #' + eventNumber);
        return;
      }

      console.log('📊 Background state:', {
        documentHidden: document.hidden,
        visibilityState: document.visibilityState,
      });

      console.log('📊 State Check:', {
        repeat: repeatRef.current,
        queueLength: queueRef.current.length,
        currentSong: currentSongRef.current?.title,
        isPlaying: isPlayingRef.current,
        audioSrc: !!audio.src,
        audioPaused: audio.paused,
      });

      if (repeatRef.current) {
        console.log('🔁 Repeat is on - restarting current song');
        audio.currentTime = 0;

        // CRITICAL: Always try to play in background
        try {
          await audio.play();
          console.log('✅ Repeat play started');
        } catch (err) {
          console.error('❌ Repeat play failed:', err);
        }
      } else if (queueRef.current.length > 0) {
        console.log('⏭️ Playing next song from queue');
        console.log('📊 About to call playNextAction with queue length:', queueRef.current.length);

        // CRITICAL FIX: Set shouldAutoPlayRef BEFORE calling playNext
        // This ensures the next song will auto-play even in background
        shouldAutoPlayRef.current = true;

        console.log('🎯 Setting shouldAutoPlayRef to TRUE for background playback');

        // Small delay to allow state to settle
        setTimeout(() => {
          playNextActionRef.current();
        }, 100);
      } else {
        console.log('⏹️ Queue empty, stopping playback');
        setIsPlayingRef.current(false);
      }
    };

    const handleError = (e: Event) => {
      console.error('❌ Audio playback error event:', e);
      console.error('❌ Audio error details:', {
        error: audio.error,
        errorCode: audio.error?.code,
        errorMessage: audio.error?.message,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src,
        paused: audio.paused,
        currentTime: audio.currentTime,
      });
      setIsPlayingRef.current(false);
      setIsDownloading(false);
    };

    const handleCanPlay = () => {
      console.log(
        '✅ Audio: canplay event - readyState:',
        audio.readyState,
        'networkState:',
        audio.networkState
      );

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current
          .resume()
          .then(() => console.log('🔊 AudioContext resumed'))
          .catch((e) => console.error('❌ AudioContext resume failed:', e));
      }
    };

    const handlePlay = async () => {
      console.log(
        '▶️ Audio: play event fired - currentTime:',
        audio.currentTime,
        'paused:',
        audio.paused,
        'background:',
        document.hidden
      );

      // Activate iOS audio session
      const sessionManager = iOSAudioSessionManager.getInstance();
      await sessionManager.activate();

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('🔆 Wake lock acquired');
        } catch (error) {
          console.warn('⚠️ Wake lock failed:', error);
        }
      }
    };

    const handlePause = () => {
      console.log(
        '⏸️ Audio: pause event fired - currentTime:',
        audio.currentTime,
        'background:',
        document.hidden
      );

      // CRITICAL: Don't release wake lock if we're in background and should be playing
      // This prevents iOS from stopping playback
      if (!document.hidden || !isPlayingRef.current) {
        if (wakeLockRef.current) {
          wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('🔆 Wake lock released');
        }
      } else {
        console.log('🔒 Keeping wake lock - background playback active');
      }
    };

    const handleWaiting = () => {
      console.log('⏳ Audio: waiting event - buffering...');
    };

    const handleStalled = () => {
      console.log('🛑 Audio: stalled event - network stalled');
    };

    const handleSuspend = () => {
      console.log('💤 Audio: suspend event - data loading suspended');
    };

    const handleLoadStart = () => {
      console.log('📥 Audio: loadstart event - started loading:', audio.src);
    };

    const handleLoadedMetadata = () => {
      setSongDuration(audio.duration);
      console.log(
        '📊 Audio: loadedmetadata - duration:',
        audio.duration,
        'readyState:',
        audio.readyState
      );
    };

    const handleLoadedData = () => {
      console.log('📦 Audio: loadeddata - readyState:', audio.readyState);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspend);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);

    globalAudioCleanup = () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };

    return () => {
      console.log('🧹 Cleaning up audio listeners - COMPONENT UNMOUNTING');
      if (globalAudioCleanup) {
        globalAudioCleanup();
        globalAudioCleanup = null;
      }

      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    console.log('🎮 isPlaying STATE CHANGED:', isPlaying, 'at', new Date().toISOString());
    console.trace('isPlaying changed from');
  }, [isPlaying]);

  // Load stream URL helper
  const loadStreamUrl = async (streamUrl: string, shouldPlay: boolean = false) => {
    console.log('🎬 loadStreamUrl called');
    console.log('📊 Parameters:', {
      streamUrl,
      shouldPlay,
      isPlaying,
      currentSongId: currentSongIdRef.current,
      background: document.hidden,
    });

    if (!audioRef.current) {
      console.error('❌ Audio ref not available');
      return;
    }

    const audio = audioRef.current;

    // CRITICAL FIX: Only update source if URL actually changed
    if (streamUrl === previousUrlRef.current) {
      console.log('⏭️ URL unchanged, skipping update');

      // But still play if requested
      if (shouldPlay && audio.paused) {
        console.log('▶️ Playing existing source');
        try {
          await audio.play();
          console.log('✅ Playback started successfully');
        } catch (error) {
          console.error('❌ Play error:', error);
          setIsPlayingRef.current(false);
        }
      }
      return;
    }

    try {
      console.log('📂 Loading stream URL:', streamUrl);
      console.log('🎵 Should play:', shouldPlay, 'isPlaying state:', isPlaying);
      console.log('📊 Current audio state:', {
        src: audio.src,
        paused: audio.paused,
        currentTime: audio.currentTime,
        readyState: audio.readyState,
        networkState: audio.networkState,
      });

      // CRITICAL: Stop old audio before loading new source
      audio.pause();
      audio.currentTime = 0;

      // Set the new source
      audio.src = streamUrl;
      audio.load();
      previousUrlRef.current = streamUrl;

      // Reset ended event counter for new source
      endedEventCountRef.current = 0;

      console.log('✅ Audio src set and load() called');

      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('⏱️ Audio load timeout after 60s');
          reject(new Error('Audio load timeout'));
        }, 60000);

        const canPlayHandler = () => {
          console.log('✅ Audio canplay event received in promise');
          clearTimeout(timeout);
          audio.removeEventListener('canplay', canPlayHandler);
          audio.removeEventListener('error', errorHandler);
          resolve();
        };

        const errorHandler = (e: Event) => {
          console.error('❌ Audio load error event in promise:', e);
          clearTimeout(timeout);
          audio.removeEventListener('canplay', canPlayHandler);
          audio.removeEventListener('error', errorHandler);
          reject(e);
        };

        audio.addEventListener('canplay', canPlayHandler, { once: true });
        audio.addEventListener('error', errorHandler, { once: true });
      });

      console.log('✅ Audio loaded and ready');
      console.log('📊 Audio state after load:', {
        paused: audio.paused,
        currentTime: audio.currentTime,
        readyState: audio.readyState,
        networkState: audio.networkState,
      });

      // Resume audio context if needed
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log('🔊 Resuming AudioContext...');
        await audioContextRef.current.resume();
        console.log('✅ AudioContext resumed, state:', audioContextRef.current.state);
      }

      // CRITICAL FIX: Always play if shouldPlay is true, regardless of background state
      if (shouldPlay) {
        console.log('▶️ Attempting to play audio (shouldPlay=true)...');
        console.log('📊 Background state:', document.hidden);
        console.log('📊 isPlaying state at play time:', isPlaying);

        try {
          await audio.play();
          console.log('✅ Playback started successfully');
          console.log('📊 Audio state after play:', {
            paused: audio.paused,
            currentTime: audio.currentTime,
          });

          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        } catch (playError: any) {
          console.error('❌ Play error:', playError);
          console.error('❌ Play error details:', {
            name: playError.name,
            message: playError.message,
            audioState: {
              paused: audio.paused,
              currentTime: audio.currentTime,
              readyState: audio.readyState,
            },
          });

          if (playError.name === 'NotAllowedError') {
            console.warn('⚠️ Autoplay blocked - user interaction required');
            setIsPlayingRef.current(false);
          } else {
            // Retry once
            console.log('🔄 Retrying play after 500ms...');
            await new Promise((resolve) => setTimeout(resolve, 500));

            try {
              await audio.play();
              console.log('✅ Playback started on retry');
            } catch (retryError) {
              console.error('❌ Retry failed:', retryError);
              setIsPlayingRef.current(false);
            }
          }
        }
      } else {
        console.log('ℹ️ Audio loaded but not auto-playing (shouldPlay = false)');
        console.log('📊 Current isPlaying state:', isPlaying);
      }
    } catch (error) {
      console.error('❌ Failed to load stream:', error);
      setIsPlayingRef.current(false);
    }
  };

  // Main song loading effect
  useEffect(() => {
    const loadAndPlaySong = async () => {
      try {
        const currentPathname = window.location.pathname;
        const isNavigationOnly =
          lastPathnameRef.current !== null &&
          lastPathnameRef.current !== currentPathname &&
          currentSongIdRef.current === currentSong?.id;

        if (isNavigationOnly) {
          console.log('📍 Navigation detected (same song), preserving playback');
          lastPathnameRef.current = currentPathname;
          return;
        }

        lastPathnameRef.current = currentPathname;

        if (audioRef.current && currentSongIdRef.current !== currentSong?.id) {
          const audio = audioRef.current;
          if (!audio.paused) {
            console.log('⏸️ Pausing old audio before loading new song');
            audio.pause();
          }
          if (audio.src) {
            console.log('🔇 Clearing old audio source');
            audio.removeAttribute('src');
            audio.load();
            previousUrlRef.current = '';
          }
        }

        if (downloadStatus) {
          downloadStatus.reset();
        }

        if (
          !currentSong ||
          !audioRef.current ||
          isLoadingRef.current ||
          isWaitingForDownloadRef.current
        ) {
          if (isLoadingRef.current) {
            console.log('⏳ Already loading, skipping...');
          }
          if (isWaitingForDownloadRef.current) {
            console.log('⏳ Already waiting for download to complete...');
          }
          return;
        }

        isLoadingRef.current = true;
        console.log('🔒 isLoadingRef set to TRUE');

        try {
          let songObj = currentSong;

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
            setCurrentSongRef.current(songObj);
          }

          currentSongIdRef.current = songObj.id || null;

          // CRITICAL FIX: Use shouldAutoPlayRef instead of isPlaying for background
          // This ensures next song plays even if isPlaying state hasn't updated yet
          const shouldAutoPlay = shouldAutoPlayRef.current || isPlaying;
          console.log(
            '🎯 shouldAutoPlay determined:',
            shouldAutoPlay,
            '(ref:',
            shouldAutoPlayRef.current,
            'state:',
            isPlaying,
            ')'
          );
          shouldAutoPlayRef.current = shouldAutoPlay;

          console.log('🔍 Checking stream info...', { songId: songObj.id, quality });
          const streamInfo = await musicApi.getStreamInfo(songObj.id || '', quality);
          console.log('✅ Stream info received:', streamInfo);

          if (streamInfo.ready && streamInfo.filePath) {
            console.log('✅ File already cached, streaming immediately...');
            setIsDownloading(false);
            console.log('🔓 Setting isWaitingForDownloadRef to FALSE');
            isWaitingForDownloadRef.current = false;

            if (streamInfo.quality) setActualQuality(streamInfo.quality);
            if (streamInfo.duration) setSongDuration(streamInfo.duration);

            const apiKey = user?.apiKey;
            if (!apiKey) {
              console.error('❌ No API key found');
              setIsPlayingRef.current(false);
              return;
            }

            const streamUrl = `${API_BASE_URL}/music/stream/${songObj.id}?api-key=${apiKey}${quality ? `&quality=${quality}` : ''}`;
            await loadStreamUrl(streamUrl, shouldAutoPlay);
          } else {
            console.log('⬇️ File not ready, triggering download...');
            setIsDownloading(true);
            setDownloadProgress(0);
            console.log('🔒 Setting isWaitingForDownloadRef to TRUE');
            isWaitingForDownloadRef.current = true;

            const downloadResponse = await musicApi.triggerDownload(songObj.id || '', quality);

            if (downloadResponse.status === 'ready') {
              console.log('✅ File became ready during request (race condition)');
              setIsDownloading(false);
              console.log('🔓 Setting isWaitingForDownloadRef to FALSE');
              isWaitingForDownloadRef.current = false;

              if (downloadResponse.quality) setActualQuality(downloadResponse.quality);
              if (downloadResponse.duration) setSongDuration(downloadResponse.duration);

              const apiKey = user?.apiKey;
              if (!apiKey) {
                console.error('❌ No API key found');
                setIsPlayingRef.current(false);
                return;
              }

              let streamUrl: string;
              if (downloadResponse.streamUrl) {
                streamUrl = `${API_BASE_URL}${downloadResponse.streamUrl}?api-key=${apiKey}`;
              } else {
                streamUrl = `${API_BASE_URL}/music/stream/${songObj.id}?api-key=${apiKey}${quality ? `&quality=${quality}` : ''}`;
              }

              await loadStreamUrl(streamUrl, shouldAutoPlay);
            } else {
              console.log('📡 Download started, waiting for SSE ready event...');
            }
          }
        } catch (error) {
          console.error('❌ Failed to load song:', error);
          console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
          setIsPlayingRef.current(false);
          setIsDownloading(false);
          console.log('🔓 Setting isWaitingForDownloadRef to FALSE');
          isWaitingForDownloadRef.current = false;
        } finally {
          isLoadingRef.current = false;
          console.log('🔓 isLoadingRef set to FALSE');
        }
      } catch (outerError) {
        console.error('❌ OUTER CATCH - Critical error in loadAndPlaySong:', outerError);
        isLoadingRef.current = false;
        console.log('🔓 isLoadingRef set to FALSE (outer catch)');
      }
    };

    loadAndPlaySong();
  }, [currentSong?.id, currentSong?.title, quality]);

  // Sync play/pause state
  useEffect(() => {
    console.log(
      '🔄 Sync playback effect triggered - isPlaying:',
      isPlaying,
      'currentSong:',
      currentSong?.id,
      'background:',
      document.hidden
    );

    if (!audioRef.current || !currentSong) {
      console.log('⏭️ Skipping sync - no audio or song');
      return;
    }

    const audio = audioRef.current;

    const syncPlayback = async () => {
      console.log(
        '🔄 syncPlayback called - isWaitingForDownload:',
        isWaitingForDownloadRef.current
      );

      if (isWaitingForDownloadRef.current) {
        console.log('⏳ Skipping playback sync - waiting for download');
        return;
      }

      console.log(
        '🔍 Sync check - isPlaying:',
        isPlaying,
        'audio.paused:',
        audio.paused,
        'audio.src:',
        !!audio.src
      );

      if (isPlaying && audio.paused && audio.src) {
        console.log('▶️ Syncing: Playing audio (was paused)');
        console.log('📊 Audio state before play:', {
          paused: audio.paused,
          currentTime: audio.currentTime,
          readyState: audio.readyState,
          networkState: audio.networkState,
        });

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
              console.log('⚠️ Autoplay blocked by browser');
              setIsPlayingRef.current(false);
            }
          });
      } else if (!isPlaying && !audio.paused) {
        console.log('⏸️ Syncing: Pausing audio');
        console.log('📊 Audio state before pause:', {
          paused: audio.paused,
          currentTime: audio.currentTime,
          readyState: audio.readyState,
        });
        audio.pause();

        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      } else {
        console.log('ℹ️ No sync needed - states match');
      }
    };

    syncPlayback();
  }, [isPlaying, currentSong]);

  // Volume sync - apply directly to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      console.log('🔊 Volume updated to:', volume);
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

export const cleanupAllAudioInstances = () => {
  console.log('🧹 Emergency cleanup of all audio instances');

  if (globalAudioCleanup) {
    globalAudioCleanup();
  }

  if (globalAudioInstance) {
    globalAudioInstance.pause();
    globalAudioInstance.src = '';
    globalAudioInstance.load();
    globalAudioInstance = null;
  }

  document.querySelectorAll('audio').forEach((audio) => {
    audio.pause();
    audio.src = '';
    audio.remove();
  });
};
