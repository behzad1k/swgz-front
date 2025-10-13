const registerServiceWorker = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'NAVIGATION') {
        // Update router state when SW handles navigation
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
    const swCode = `
      const CACHE_NAME = 'swgz -music-v1';
      const urlsToCache = ['/', '/offline.html'];

      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
        );
      });

      self.addEventListener('fetch', (event) => {
        if (event.request.url.includes('/music/stream/')) {
          event.respondWith(
            caches.match(event.request).then((response) => {
              if (response) return response;
              return fetch(event.request).then((response) => {
                if (!response || response.status !== 200) return response;
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                return response;
              });
            })
          );
        } else {
          event.respondWith(
            caches.match(event.request).then((response) => response || fetch(event.request))
          );
        }
      });

      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys().then((cacheNames) =>
            Promise.all(
              cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
              })
            )
          )
        );
      });
    `;

    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);

    navigator.serviceWorker.register(swUrl).then(() => {
      console.log('Service Worker registered');
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  }
};
export default registerServiceWorker;