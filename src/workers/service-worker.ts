// src/workers/service-worker.ts
const registerServiceWorker = (): void => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NAVIGATION') {
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      });

      navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    });
  }
};

export default registerServiceWorker;