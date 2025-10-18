import routesConfig, { routes } from '@/config/routes.config.ts';
import { ProtectedRoute, Route, Routes, useNavigate } from '@/router';
import { authApi } from '@api/auth.api.ts';
import { libraryApi } from '@api/library.api.ts';
import { musicApi } from '@api/music.api.ts';
import { playlistApi } from '@api/playlist.api.ts';
import ModalManager from '@components/layout/ModalManager.tsx';
import NowPlayingSheet from '@components/player/NowPlayingSheet.tsx';
import { useAppActions } from '@hooks/actions/useAppActions.ts';
import { useAuthActions } from '@hooks/actions/useAuthActions.ts';
import { useLibraryActions } from '@hooks/actions/useLibraryActions.ts';
import { useIsOnline, useShowDownloadManager } from '@hooks/selectors/useAppSelectors.ts';
import { useAuthToken, useCurrentUser, useIsAuthenticated } from '@hooks/selectors/useAuthSelectors.ts';
import { useAudioFocus } from '@hooks/useAudioFocus.ts';
import { usePlayerInitialization } from '@hooks/usePlayerInitialization.ts';
import { LOCAL_STORAGE_KEYS } from '@utils/constants.ts';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, useEffect } from 'react';

// Components
import DownloadManager from '@components/download/DownloadManager.tsx';
import Navigation from '@components/layout/Navigation.tsx';
import { WifiOff } from '@/assets/svg';

const App: FC = () => {
  usePlayerInitialization();
  useAudioFocus();
  const navigate = useNavigate()
  const isOnline = useIsOnline();
  const { login } = useAuthActions()
  const { setLibrary } = useLibraryActions();
  const authToken = useAuthToken()
  const currentUser = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();
  const showDownloadManager = useShowDownloadManager();
  const { setShowDownloadManager } = useAppActions()

  async function fetchUserLibrary() {
    try {
      const [librarySongs, recentlyPlayed, mostListened, recentSearches, playlists] = await Promise.all([
        libraryApi.getLibrary(),
        libraryApi.getRecentlyPlayed(),
        libraryApi.getMostListened(),
        musicApi.getRecentSearches(),
        playlistApi.getUserPlaylists()
      ]);

      setLibrary({ librarySongs, recentSearches, recentlyPlayed, mostListened, playlists, likedSongs: librarySongs.filter(e => e.isLiked) })

    } catch (e) {
      console.error('Failed to fetch user data:', e);
    }
  }

  async function fetchUserData(){
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)) return;
    try {
      const response = await authApi.getUser();

      login(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN) || authToken || '', response)
    }catch (e){
      // localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
      // navigate(routes.login.path)
    }
  }
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchUserLibrary();
    } else if (isAuthenticated || localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)){
      fetchUserData();
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
      navigate(routes.login.path)
    }
  }, [isAuthenticated, currentUser]);

  return (
    <div className="app-container bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900 ">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500/90 text-black px-4 py-2 text-center z-50 flex items-center justify-center gap-2">
          <img src={WifiOff} alt={getAltFromPath(WifiOff)} width={20}/>
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


      {isAuthenticated && <Navigation/>}

      <NowPlayingSheet />

      {showDownloadManager && (
        <DownloadManager
          isOpen
          onClose={() => setShowDownloadManager(false)}
        />
      )}


      <ModalManager />
    </div>
  );
};

export default App;