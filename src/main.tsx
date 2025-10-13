import App from '@/App.tsx';
import serviceWorker from '@/workers/service-worker.ts';
import ReactDOM from 'react-dom/client'
import React from 'react'
import { Router } from '@/router/Router';
import './styles/index.css'

serviceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);