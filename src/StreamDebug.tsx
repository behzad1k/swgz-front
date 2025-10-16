// components/StreamDebug.tsx
import React, { useRef, useState } from 'react';

export const StreamDebug: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [testUrl, setTestUrl] = useState('');
  const [status, setStatus] = useState('');

  const testStream = async () => {
    if (!audioRef.current || !testUrl) return;

    setStatus('Testing...');

    try {
      // Test 1: Direct fetch
      console.log('Test 1: Fetching stream URL...');
      const response = await fetch(testUrl);
      console.log('Fetch response:', response.status, response.headers);
      setStatus(`Fetch: ${response.status} ${response.statusText}`);

      // Test 2: Audio element
      console.log('Test 2: Setting audio src...');
      audioRef.current.src = testUrl;
      audioRef.current.load();

      audioRef.current.onloadedmetadata = () => {
        console.log('✅ Audio metadata loaded');
        setStatus('✅ Stream loaded successfully!');
      };

      audioRef.current.onerror = (e) => {
        console.error('❌ Audio error:', e);
        setStatus('❌ Audio failed to load');
      };

      // Test 3: Play
      await audioRef.current.play();
      console.log('✅ Playing');

    } catch (error) {
      console.error('Test failed:', error);
      setStatus(`❌ Error: ${error}`);
    }
  };

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      console.log('SW Registration:', registration);
      console.log('SW Active:', registration?.active);
      console.log('SW Scope:', registration?.scope);

      setStatus(`SW: ${registration ? 'Active' : 'Not registered'}`);
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

      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <button onClick={testStream} style={{ padding: '5px 10px', flex: 1 }}>
          Test Stream
        </button>
        <button onClick={checkServiceWorker} style={{ padding: '5px 10px', flex: 1 }}>
          Check SW
        </button>
      </div>

      <div style={{
        padding: '8px',
        background: '#222',
        borderRadius: '4px',
        minHeight: '30px',
        wordBreak: 'break-all'
      }}>
        {status || 'Ready to test...'}
      </div>

      <audio ref={audioRef} style={{ width: '100%', marginTop: '10px' }} controls />
    </div>
  );
};