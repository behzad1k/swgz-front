// components/StreamDebug.tsx
import React, { useRef, useState, useEffect } from 'react';

export const StreamDebug: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [testUrl, setTestUrl] = useState('');
  const [status, setStatus] = useState('');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      setAudioContext(ctx);
      console.log('AudioContext created:', ctx.state);
    }
  }, []);

  const testStream = async () => {
    if (!audioRef.current || !testUrl) return;

    setStatus('Testing...');

    try {
      const audio = audioRef.current;

      // Step 1: Resume AudioContext
      if (audioContext && audioContext.state === 'suspended') {
        console.log('Resuming AudioContext...');
        await audioContext.resume();
        console.log('AudioContext state:', audioContext.state);
      }

      // Step 2: Fetch test
      console.log('Test 1: Fetching stream URL...');
      const response = await fetch(testUrl);
      console.log('Fetch response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Step 3: Set audio src
      console.log('Test 2: Setting audio src...');
      audio.src = testUrl;
      audio.load();

      // Step 4: Wait for canplay
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);

        audio.oncanplay = () => {
          clearTimeout(timeout);
          console.log('✅ Can play');
          resolve(null);
        };

        audio.onerror = (e) => {
          clearTimeout(timeout);
          console.error('❌ Audio error:', e);
          reject(e);
        };
      });

      setStatus('✅ Loaded, attempting play...');

      // Step 5: Play
      console.log('Test 3: Playing...');
      await audio.play();
      console.log('✅ Playing!');
      setStatus('✅ Playing!');

    } catch (error: any) {
      console.error('Test failed:', error);
      setStatus(`❌ Error: ${error.message || error}`);
    }
  };

  const checkAudioContext = () => {
    if (audioContext) {
      console.log('AudioContext state:', audioContext.state);
      console.log('AudioContext sampleRate:', audioContext.sampleRate);
      setStatus(`AudioContext: ${audioContext.state}`);
    } else {
      setStatus('No AudioContext');
    }
  };

  const resumeAudioContext = async () => {
    if (audioContext) {
      await audioContext.resume();
      setStatus(`AudioContext resumed: ${audioContext.state}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '350px',
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔍 Stream Debug</h4>

      <input
        type="text"
        placeholder="Enter stream URL"
        value={testUrl}
        onChange={(e) => setTestUrl(e.target.value)}
        style={{
          width: '100%',
          padding: '5px',
          marginBottom: '10px',
          background: '#333',
          color: 'white',
          border: '1px solid #555',
          borderRadius: '4px',
        }}
      />

      <div style={{ display: 'flex', gap: '5px', marginBottom: '5px', flexWrap: 'wrap' }}>
        <button onClick={testStream} style={{ padding: '5px 10px', flex: '1 1 45%' }}>
          Test Stream
        </button>
        <button onClick={checkAudioContext} style={{ padding: '5px 10px', flex: '1 1 45%' }}>
          Check AC
        </button>
        <button onClick={resumeAudioContext} style={{ padding: '5px 10px', flex: '1 1 45%' }}>
          Resume AC
        </button>
      </div>

      <div style={{
        padding: '8px',
        background: '#222',
        borderRadius: '4px',
        minHeight: '30px',
        wordBreak: 'break-all',
        marginBottom: '10px',
      }}>
        {status || 'Ready to test...'}
      </div>

      <audio ref={audioRef} style={{ width: '100%' }} controls />

      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        <div>Standalone: {window.matchMedia('(display-mode: standalone)').matches ? 'Yes' : 'No'}</div>
        <div>AC State: {audioContext?.state || 'N/A'}</div>
      </div>
    </div>
  );
};