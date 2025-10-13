import routesConfig, { routes } from '@/config/routes.config.ts';
import { ProtectedRoute, Route, Routes, useNavigate } from '@/router';
import { authApi } from '@api/auth.api.ts';
import { libraryApi } from '@api/library.api.ts';
import { musicApi } from '@api/music.api.ts';
import { playlistApi } from '@api/playlist.api.ts';
import ModalManager from '@components/layout/ModalManager.tsx';
import NowPlayingSheet from '@components/player/NowPlayingSheet.tsx';
import { LOCAL_STORAGE_KEYS } from '@utils/constants.ts';
import { FC, useContext, useEffect } from 'react';
import AppContext from './contexts/AppContext';

// Components
import DownloadManager from '@components/download/DownloadManager.tsx';
import Navigation from '@components/layout/Navigation.tsx';
import { WifiOff } from 'lucide-react';

const AppContent: FC = () => {
  const { state, dispatch } = useContext(AppContext)!;
  const navigate = useNavigate()

  async function fetchUserLibrary() {
    try {
      const [librarySongs, recentlyPlayed, mostListened, recentSearches, playlists] = await Promise.all([
        libraryApi.getLibrary(),
        libraryApi.getRecentlyPlayed(),
        libraryApi.getMostListened(),
        musicApi.getRecentSearches(),
        playlistApi.getUserPlaylists()
      ]);

      dispatch({
        type: 'SET_LIBRARY',
        payload: { librarySongs, mostListened, recentlyPlayed, recentSearches, playlists, likedSongs: librarySongs.filter(e => e.isLiked) }
      });
    } catch (e) {
      console.error('Failed to fetch user data:', e);
    }
  }

  async function fetchUserData(){
    try {
      const response = await authApi.getUser();
      dispatch({ type: 'SET_AUTH', payload: { user: response, token: localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN), isAuthenticated: true }})
    }catch (e){
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
      navigate(routes.login.path)
    }
  }
  useEffect(() => {
    if (state.auth.isAuthenticated && state.auth.user) {
      fetchUserLibrary();
    } else if (state.auth.isAuthenticated || localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)){
      fetchUserData();
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
      navigate(routes.login.path)
    }
  }, [state.auth.isAuthenticated, state.auth.user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      {!state.app.isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500/90 text-black px-4 py-2 text-center z-50 flex items-center justify-center gap-2">
          <WifiOff size={20} />
          <span>You're offline. Playing downloaded music.</span>
        </div>
      )}

      <div className="pb-40">
        <Routes>
          {routesConfig.map((route) => {
            const RouteComponent = route.component;

            return (
              <Route
                key={route.path}
                path={route.path}
                exact={route.exact}
                element={
                  route.protected ? (
                    <ProtectedRoute>
                      <RouteComponent />
                    </ProtectedRoute>
                  ) : (
                    <RouteComponent />
                  )
                }
              />
            );
          })}

          {/* 404 fallback */}
          {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
        </Routes>
      </div>

      {/* <MiniPlayer onClick={() => dispatch({ type: 'SET_APP', payload: { showNowPlaying: true } })} /> */}
      {state.auth.isAuthenticated && <Navigation/>}

      <NowPlayingSheet />

      {state.app.showDownloadManager && (
        <DownloadManager
          isOpen
          onClose={() => dispatch({ type: 'SET_APP', payload: { showDownloadManager: false } })}
        />
      )}


      {/* Modal Manager for all modals */}
      <ModalManager />
    </div>
  );
};

export default AppContent;