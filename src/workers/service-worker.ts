// src/workers/service-worker.ts

/**
 * Service Worker registration with TypeScript types
 */

interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CLEAR_CACHE' | 'CACHE_URLS';
  urls?: string[];
}

interface ServiceWorkerResponse {
  success: boolean;
  error?: string;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckInterval: number | null = null;

  /**
   * Check if service workers are supported
   */
  private isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Register the service worker
   */
  public async register(): Promise<void> {
    if (!this.isSupported()) {
      console.warn('[App] Service Workers not supported');
      return;
    }

    try {
      // Wait for page to load
      await new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', () => resolve(), { once: true });
        }
      });

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[App] ✅ Service Worker registered');
      console.log('[App] 📍 Scope:', this.registration.scope);

      // Setup event listeners
      this.setupEventListeners();

      // Check for updates periodically (every 5 minutes)
      this.updateCheckInterval = window.setInterval(() => {
        this.checkForUpdates();
      }, 5 * 60 * 1000);

      // Check for updates on visibility change
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.checkForUpdates();
        }
      });

      // Initial update check
      this.checkForUpdates();

    } catch (error) {
      console.error('[App] ❌ Service Worker registration failed:', error);
    }
  }

  /**
   * Setup event listeners for service worker lifecycle
   */
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Listen for new service worker installing
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;
      if (!newWorker) return;

      console.log('[App] 🔄 New Service Worker found');

      newWorker.addEventListener('statechange', () => {
        console.log('[App] Service Worker state:', newWorker.state);

        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is ready to activate
          this.handleUpdate();
        }
      });
    });

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[App] 🔄 Service Worker controller changed');

      // Optionally reload the page when a new service worker takes control
      if (this.shouldAutoReload()) {
        window.location.reload();
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleMessage(event);
    });
  }

  /**
   * Check for service worker updates
   */
  private async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('[App] ✅ Update check complete');
    } catch (error) {
      console.error('[App] ❌ Update check failed:', error);
    }
  }

  /**
   * Handle service worker update available
   */
  private handleUpdate(): void {
    console.log('[App] ✨ New version available');

    // You can customize this behavior
    // Option 1: Auto-reload
    // this.skipWaitingAndReload();

    // Option 2: Show notification to user
    this.notifyUserOfUpdate();
  }

  /**
   * Notify user that an update is available
   */
  private notifyUserOfUpdate(): void {
    // You can implement your own notification UI here
    const shouldUpdate = confirm(
      'A new version is available! Would you like to update now?'
    );

    if (shouldUpdate) {
      this.skipWaitingAndReload();
    }
  }

  /**
   * Tell service worker to skip waiting and reload page
   */
  private async skipWaitingAndReload(): Promise<void> {
    if (!this.registration?.waiting) return;

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload will happen automatically via controllerchange event
  }

  /**
   * Determine if app should auto-reload on update
   */
  private shouldAutoReload(): boolean {
    // Don't auto-reload if user is playing music
    const isPlaying = document.querySelector('audio')?.paused === false;
    return !isPlaying;
  }

  /**
   * Handle messages from service worker
   */
  private handleMessage(event: MessageEvent): void {
    console.log('[App] 📨 Message from Service Worker:', event.data);

    // Handle different message types here
    if (event.data && event.data.type) {
      switch (event.data.type) {
        case 'CACHE_UPDATED':
          console.log('[App] Cache has been updated');
          break;
        default:
          console.log('[App] Unknown message type:', event.data.type);
      }
    }
  }

  /**
   * Send message to service worker
   */
  private async sendMessage(
    message: ServiceWorkerMessage
  ): Promise<ServiceWorkerResponse> {
    if (!this.registration?.active) {
      throw new Error('No active service worker');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      this.registration!.active!.postMessage(message, [messageChannel.port2]);

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Service Worker message timeout'));
      }, 10000);
    });
  }

  /**
   * Clear all caches
   */
  public async clearCache(): Promise<void> {
    try {
      await this.sendMessage({ type: 'CLEAR_CACHE' });
      console.log('[App] ✅ Cache cleared');
    } catch (error) {
      console.error('[App] ❌ Failed to clear cache:', error);
    }
  }

  /**
   * Precache specific URLs
   */
  public async cacheUrls(urls: string[]): Promise<void> {
    try {
      await this.sendMessage({ type: 'CACHE_URLS', urls });
      console.log('[App] ✅ URLs cached:', urls);
    } catch (error) {
      console.error('[App] ❌ Failed to cache URLs:', error);
    }
  }

  /**
   * Unregister the service worker
   */
  public async unregister(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.unregister();
      console.log('[App] ✅ Service Worker unregistered');

      if (this.updateCheckInterval) {
        clearInterval(this.updateCheckInterval);
      }
    } catch (error) {
      console.error('[App] ❌ Failed to unregister Service Worker:', error);
    }
  }

  /**
   * Get current registration
   */
  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Create singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

// Export functions
export const registerServiceWorker = (): void => {
  serviceWorkerManager.register();
};

export const clearServiceWorkerCache = (): Promise<void> => {
  return serviceWorkerManager.clearCache();
};

export const cacheUrls = (urls: string[]): Promise<void> => {
  return serviceWorkerManager.cacheUrls(urls);
};

export const unregisterServiceWorker = (): Promise<void> => {
  return serviceWorkerManager.unregister();
};

export const getServiceWorkerRegistration = (): ServiceWorkerRegistration | null => {
  return serviceWorkerManager.getRegistration();
};

export default registerServiceWorker;