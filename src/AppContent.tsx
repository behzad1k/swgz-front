import routesConfig from '@/config/routes.config.ts';
import { Navigate, ProtectedRoute, Route, Routes } from '@/router';
import ModalManager from '@components/layout/ModalManager.tsx';
import NowPlayingSheet from '@components/player/NowPlayingSheet.tsx';
import { FC, useContext } from 'react';
import AppContext from './contexts/AppContext';

// Components
import DownloadManager from '@components/download/DownloadManager.tsx';
import Navigation from '@components/layout/Navigation.tsx';
import { WifiOff } from 'lucide-react';

const AppContent: FC = () => {
  const { state, dispatch } = useContext(AppContext)!;

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
          <Route path="*" element={<Navigate to="/library" replace />} />
        </Routes>
      </div>

      {/* <MiniPlayer onClick={() => dispatch({ type: 'SET_APP', payload: { showNowPlaying: true } })} /> */}
      <Navigation />

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