import App from '@/App.tsx';
import ReactDOM from 'react-dom/client'
import React from 'react'
import { Router } from '@/router/Router';
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);