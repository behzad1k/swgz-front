export interface SSEOptions {
  withCredentials?: boolean; // Now actually uses browser credentials
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private url: string;
  private options: SSEOptions;
  private retryCount: number = 0;
  private isManualClose: boolean = false;

  constructor(url: string, options: SSEOptions = {}) {
    this.url = url;
    this.options = {
      maxRetries: 5,
      retryDelay: 1000,
      withCredentials: true, // Default to true for cookie support
      ...options,
    };
  }

  connect(): void {
    if (this.eventSource) {
      console.warn('SSE already connected');
      return;
    }

    this.isManualClose = false;

    // EventSource automatically sends cookies with withCredentials
    console.log('🔌 SSE: Connecting to', this.url);

    // Note: EventSource doesn't have a withCredentials option in the constructor
    // But it automatically sends cookies if the URL is same-origin or if CORS is properly configured
    // For cross-origin with credentials, server must respond with:
    // Access-Control-Allow-Origin: <specific-origin> (not *)
    // Access-Control-Allow-Credentials: true

    this.eventSource = new EventSource(this.url, {
      withCredentials: this.options.withCredentials,
    });

    this.eventSource.onopen = () => {
      console.log('✅ SSE: Connected');
      this.retryCount = 0;
      this.options.onOpen?.();
    };

    this.eventSource.onmessage = (event) => {
      this.handleMessage('message', event);
    };

    this.eventSource.onerror = (error) => {
      console.error('❌ SSE: Error', error);
      this.options.onError?.(error);

      if (this.eventSource?.readyState === EventSource.CLOSED && !this.isManualClose) {
        this.handleReconnect();
      }
    };
  }
  on(eventType: string, callback: (data: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());

      // Register event listener with EventSource
      if (this.eventSource && eventType !== 'message') {
        this.eventSource.addEventListener(eventType, (event) => {
          this.handleMessage(eventType, event);
        });
      }
    }

    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: (data: any) => void): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  close(): void {
    console.log('🔌 SSE: Closing connection');
    this.isManualClose = true;
    this.eventSource?.close();
    this.eventSource = null;
    this.listeners.clear();
  }


  private handleMessage(eventType: string, event: MessageEvent): void {
    const listeners = this.listeners.get(eventType);
    if (!listeners || listeners.size === 0) return;

    try {
      // Check if data exists and is not empty
      if (!event.data || event.data.trim() === '') {
        console.log('⚠️ SSE: Empty data received, ignoring');
        return;
      }

      const data = JSON.parse(event.data);
      listeners.forEach((callback) => callback(data));
    } catch (error) {
      console.error('Failed to parse SSE data:', error);
      console.log('Raw event data:', event.data);

      // Don't call listeners with unparseable data
      // This prevents the crash
      return;
    }
  }

  private handleReconnect(): void {
    if (this.retryCount >= this.options.maxRetries!) {
      console.error('❌ SSE: Max retries reached');
      this.close();
      return;
    }

    this.retryCount++;
    const delay = Math.min(
      this.options.retryDelay! * Math.pow(2, this.retryCount - 1),
      30000
    );

    console.log(`🔄 SSE: Reconnecting in ${delay}ms (attempt ${this.retryCount})`);

    setTimeout(() => {
      if (!this.isManualClose) {
        this.eventSource?.close();
        this.eventSource = null;
        this.connect();
      }
    }, delay);
  }
}