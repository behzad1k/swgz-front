// src/types/service-worker.d.ts

// Extend Window interface
interface Window {
  __SW_FORCE_UPDATE__?: boolean;
}

// Service Worker types
interface ServiceWorkerMessageEvent extends MessageEvent {
  data: {
    type: string;
    payload?: any;
  };
}

// Notification options
interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}