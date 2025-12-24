import App from '@/App';
import AppProvider from '@/contexts/AppContext';
import AuthProvider from '@/contexts/AuthContext';
import LibraryProvider from '@/contexts/LibraryContext';
import ModalProvider from '@/contexts/ModalContext';
import PlayerProvider from '@/contexts/PlayerContext';
import { Router } from '@/router/Router';
import serviceWorker from '@/workers/service-worker';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import { TelegramProvider } from './contexts/TelegramContext';

serviceWorker();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <TelegramProvider>
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
  </TelegramProvider>
);
