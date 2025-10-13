class ServiceWorkerService {
  private registration: ServiceWorkerRegistration | null = null;

  async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
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

        this.registration = await navigator.serviceWorker.register(swUrl);
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async unregister(): Promise<void> {
    if (this.registration) {
      await this.registration.unregister();
      this.registration = null;
    }
  }

  async checkForUpdates(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }
}

export default new ServiceWorkerService();