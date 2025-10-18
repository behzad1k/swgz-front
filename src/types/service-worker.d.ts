
interface Window {
  __SW_FORCE_UPDATE__?: boolean;
}

interface ServiceWorkerMessageEvent extends MessageEvent {
  data: {
    type: string;
    payload?: any;
  };
}

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