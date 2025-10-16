import App from '@/App';
import AppProvider from '@/contexts/AppContext';
import AuthProvider from '@/contexts/AuthContext';
import LibraryProvider from '@/contexts/LibraryContext';
import ModalProvider from '@/contexts/ModalContext';
import PlayerProvider from '@/contexts/PlayerContext';
import { Router } from '@/router/Router';
import serviceWorker from '@/workers/service-worker';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

serviceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <LibraryProvider>
          <ModalProvider>
            <PlayerProvider>
              <Router>
                <App />
              </Router>
            </PlayerProvider>
          </ModalProvider>
        </LibraryProvider>
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
);