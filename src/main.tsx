import Navigation from '@components/layout/Navigation.tsx';
import SettingsPage from '@pages/profile/SettingsPage.tsx';
import React, { useState, useEffect, useRef, createContext, useContext, useReducer, FC, ReactNode } from 'react';
import { Play, Pause, SkipForward, SkipBack, Repeat, Shuffle, Heart, MoreVertical, Search, Home, Library, User, Plus, ChevronRight, Settings, Download, Upload, X, Check, LogOut, Music, Users, Disc, Filter, Grid, List, Edit2, Volume2, Wifi, WifiOff, Trash2, FolderOpen, Clock, TrendingUp, Star, MessageCircle, Share2, Menu, ChevronDown } from 'lucide-react';

// ============ Initial State ============
const initialState: RootState = {
  auth: {
    token: localStorage.getItem('auth_token'),
    user: null,
    isAuthenticated: !!localStorage.getItem('auth_token'),
  },
  player: {
    currentSong: null,
    queue: [],
    isPlaying: false,
    progress: 0,
    volume: 1,
    repeat: false,
    shuffle: false,
    quality: (localStorage.getItem('preferred_quality') as '128' | '320' | 'FLAC') || '320',
  },
  library: {
    likedSongs: [],
    playlists: [],
    recentlyPlayed: [],
    mostListened: [],
  },
  downloads: {
    active: {},
    completed: [],
    failed: [],
  },
  app: {
    isOnline: navigator.onLine,
    currentPage: 'home',
    showNowPlaying: false,
    showDownloadManager: false,
  },
};

// ============ Reducer ============
function appReducer(state: RootState, action: Action): RootState {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, auth: { ...state.auth, ...action.payload } };
    case 'SET_PLAYER':
      return { ...state, player: { ...state.player, ...action.payload } };
    case 'SET_LIBRARY':
      return { ...state, library: { ...state.library, ...action.payload } };
    case 'SET_DOWNLOADS':
      return { ...state, downloads: { ...state.downloads, ...action.payload } };
    case 'SET_APP':
      return { ...state, app: { ...state.app, ...action.payload } };
    case 'UPDATE_DOWNLOAD_PROGRESS':
      return {
        ...state,
        downloads: {
          ...state.downloads,
          active: {
            ...state.downloads.active,
            [action.payload.id]: {
              ...state.downloads.active[action.payload.id],
              progress: action.payload.progress,
            },
          },
        },
      };
    case 'COMPLETE_DOWNLOAD':
      const { [action.payload.id]: completed, ...remaining } = state.downloads.active;
      return {
        ...state,
        downloads: {
          ...state.downloads,
          active: remaining,
          completed: [...state.downloads.completed, completed],
        },
      };
    default:
      return state;
  }
}

// ============ Context ============

// ============ Service Worker ============

// ============ API Service ============

// ============ Component Props Interfaces ============









interface PlaylistDetailPageProps {
  playlistId: string;
  onClose: () => void;
}



// ============ Reusable Components ============






// ============ Download Manager ============

// ============ Artist Page ============

// ============ Album Page ============

// ============ Settings Page ============

// ============ Mini Player ============

// ============ Now Playing Page ============

// ============ Home Page ============

// ============ Navigation ============

// ============ Main App ============
const MusicApp: FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [showSettings, setShowSettings] = useState(false);
  const [showArtist, setShowArtist] = useState<string | null>(null);
  const [showAlbum, setShowAlbum] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (state.player.currentSong && audioRef.current) {
      const url = ApiService.getStreamUrl(state.player.currentSong.id, state.player.quality === 'FLAC');
      audioRef.current.src = url;
      if (state.player.isPlaying) {
        audioRef.current.play().catch(e => console.error('Playback error:', e));
      }
    }
  }, [state.player.currentSong, state.player.quality]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.player.isPlaying) {
      audio.play().catch(e => console.error('Playback error:', e));
    } else {
      audio.pause();
    }
  }, [state.player.isPlaying]);

  if (!state.auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Music size={48} className="mx-auto mb-4 text-purple-500" />
            <h1 className="text-4xl font-bold text-white mb-2">Swagz Music</h1>
            <p className="text-gray-400">Your premium music experience</p>
          </div>
          <Button onClick={() => dispatch({ type: 'SET_AUTH', payload: { isAuthenticated: true } })} className="w-full" size="lg">
            Login / Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
        <audio ref={audioRef} />

        {!state.app.isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-500/90 text-black px-4 py-2 text-center z-50 flex items-center justify-center gap-2">
            <WifiOff size={20} />
            <span>You're offline. Playing downloaded music.</span>
          </div>
        )}

        <div className="pb-40">
          {state.app.currentPage === 'home' && <HomePage />}
          {state.app.currentPage === 'library' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">Library</h1>
                <div className="flex gap-2">
                  <button onClick={() => dispatch({ type: 'SET_APP', payload: { showDownloadManager: true } })} className="p-2 hover:bg-white/10 rounded-full">
                    <Download size={24} className="text-gray-400" />
                  </button>
                  <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 rounded-full">
                    <Settings size={24} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <MiniPlayer onClick={() => dispatch({ type: 'SET_APP', payload: { showNowPlaying: true } })} />
        <Navigation />

        {state.app.showNowPlaying && state.player.currentSong && (
          <NowPlayingPage onClose={() => dispatch({ type: 'SET_APP', payload: { showNowPlaying: false } })} />
        )}

        {state.app.showDownloadManager && (
          <DownloadManager isOpen onClose={() => dispatch({ type: 'SET_APP', payload: { showDownloadManager: false } })} />
        )}

        {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
        {showArtist && <ArtistPage artistId={showArtist} onClose={() => setShowArtist(null)} />}
        {showAlbum && <AlbumPage albumId={showAlbum} onClose={() => setShowAlbum(null)} />}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        input[type="range"] { -webkit-appearance: none; background: transparent; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: white; cursor: pointer; }
        input[type="range"]::-webkit-slider-runnable-track { height: 8px; border-radius: 4px; }
      `}</style>
    </AppContext.Provider>
  );
};

export default MusicApp;