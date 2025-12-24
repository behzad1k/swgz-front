import { useEffect, useRef } from 'react';
import { useIsPlaying, useCurrentSong, useAudioRef } from './selectors/usePlayerSelectors';

export const useIOSAudioFocus = () => {
  const isPlaying = useIsPlaying();
  const currentSong = useCurrentSong();
  const audioRef = useAudioRef();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    console.log('🍎 iOS detected - setting up audio focus management');

    // Create and manage AudioContext for background playback
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn('⚠️ AudioContext not available');
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      console.log('🔊 Created AudioContext for iOS');
    }

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        console.log('📱 App backgrounded - ensuring audio context is active');

        // CRITICAL: Resume AudioContext when going to background
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
            console.log('✅ AudioContext resumed for background playback');
          } catch (error) {
            console.error('❌ Failed to resume AudioContext:', error);
          }
        }

        // Ensure media session stays active
        if ('mediaSession' in navigator && isPlaying) {
          navigator.mediaSession.playbackState = 'playing';
          console.log('📻 Media session set to playing in background');
        }
      } else {
        console.log('📱 App foregrounded');

        // Resume AudioContext when coming to foreground
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
            console.log('✅ AudioContext resumed on foreground');
          } catch (error) {
            console.error('❌ Failed to resume AudioContext:', error);
          }
        }
      }
    };

    // Handle audio interruptions (calls, alarms, etc.)
    const handleAudioInterruption = async () => {
      console.log('🔔 Audio interruption detected');

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
          console.log('✅ AudioContext resumed after interruption');
        } catch (error) {
          console.error('❌ Failed to resume after interruption:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for audio context state changes
    if (audioContextRef.current) {
      audioContextRef.current.addEventListener('statechange', () => {
        console.log('🔊 AudioContext state changed to:', audioContextRef.current?.state);

        // Auto-resume if suspended while playing
        if (audioContextRef.current?.state === 'suspended' && isPlaying) {
          audioContextRef.current.resume().catch(console.error);
        }
      });
    }

    // Handle page freeze/resume (iOS specific)
    window.addEventListener('freeze', handleAudioInterruption);
    window.addEventListener('resume', handleAudioInterruption);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('freeze', handleAudioInterruption);
      window.removeEventListener('resume', handleAudioInterruption);
    };
  }, [isPlaying]);

  // Keep AudioContext active during playback
  useEffect(() => {
    if (!audioContextRef.current) return;

    const keepAudioContextAlive = async () => {
      if (isPlaying && currentSong && audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
            console.log('🔊 AudioContext resumed (keepalive)');
          } catch (error) {
            console.error('❌ Failed to resume AudioContext:', error);
          }
        }
      }
    };

    // Check AudioContext state periodically while playing
    const interval = isPlaying ? setInterval(keepAudioContextAlive, 3000) : null;

    if (isPlaying && currentSong) {
      console.log('🍎 iOS audio focus keepalive started');
      keepAudioContextAlive(); // Run immediately
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        console.log('🍎 iOS audio focus keepalive stopped');
      }
    };
  }, [isPlaying, currentSong]);

  // Ensure audio element is properly configured for background playback
  useEffect(() => {
    if (!audioRef) return;

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    // Configure audio element for background playback
    audioRef.setAttribute('playsinline', 'true');
    audioRef.setAttribute('webkit-playsinline', 'true');

    // These attributes help with iOS background playback
    if ('webkitPreservesPitch' in audioRef) {
      (audioRef as any).webkitPreservesPitch = true;
    }
    if ('mozPreservesPitch' in audioRef) {
      (audioRef as any).mozPreservesPitch = true;
    }

    console.log('🍎 Audio element configured for iOS background playback');
  }, [audioRef]);
};
