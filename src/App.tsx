import AppContent from '@/AppContent.tsx';
import { QualityType } from '@/types/global.ts';
import { RootState } from '@/types/states.ts';
import appReducer from '@store/reducer.ts';
import { usePlayer } from '@hooks/usePlayer';
import { initialModalState } from '@store/slices/modalSlice.ts';
import { FC, useReducer } from 'react';
import AppContext from './contexts/AppContext';

export const initialState: RootState = {
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
    quality: (localStorage.getItem('preferred_quality') as QualityType) || '320',
  },
  library: {
    librarySongs: [],
    likedSongs: [],
    playlists: [],
    recentlyPlayed: [],
    mostListened: [],
    recentSearches: [],
  },
  downloads: {
    active: {},
    completed: [],
    failed: [],
  },
  app: {
    isOnline: navigator.onLine,
    currentPage: 'library',
    showNowPlaying: false,
    showDownloadManager: false,
  },
  modal: initialModalState
};


const App: FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const player = usePlayer({ state, dispatch });

  return (
    <AppContext.Provider value={{ state, dispatch, player }}>
      <AppContent />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: white; cursor: pointer; }
        input[type="range"]::-webkit-slider-runnable-track { height: 8px; border-radius: 4px; }
      `}</style>
    </AppContext.Provider>
  );
};

export default App;