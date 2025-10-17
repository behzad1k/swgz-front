import { publicEndpoints } from '@utils/endpoints.ts';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  static async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !publicEndpoints.includes(endpoint)) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    if (!response.ok) {
      const res = await response.json();
      throw new Error(res.message || 'Request failed');
    }

    return response;
  }

  static async get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    const response = await this.request(endpoint, { signal });
    return response.json();
  }
  static async head<T>(endpoint: string, headers?: Headers, signal?: AbortSignal): Promise<T> {
    const response = await this.request(endpoint, {
      method: 'HEAD',
      headers,
      signal,
    });
    return response.json();
  }

  static async post<T>(endpoint: string, data: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      signal,
    });
    return response.json();
  }

  static async put<T>(endpoint: string, data: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      signal,
    });
    return response.json();
  }

  static async delete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    const response = await this.request(endpoint, {
      method: 'DELETE',
      signal,
    });
    return response.json();
  }

  static async downloadSong(
    songId: string,
    preferFlac: boolean,
    onProgress: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<string> {
    const response = await this.request(`/music/stream/${songId}?flac=${preferFlac}`, { signal });
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is null');

    const contentLength = +(response.headers.get('Content-Length') || 0);
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    // Check if already aborted
    if (signal?.aborted) {
      reader.cancel();
      throw new DOMException('Download aborted', 'AbortError');
    }

    // Listen for abort events during download
    const abortHandler = () => {
      reader.cancel();
    };
    signal?.addEventListener('abort', abortHandler);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        onProgress(Math.round((receivedLength / contentLength) * 100));
      }

      // @ts-ignore
      const blob = new Blob(chunks);
      return URL.createObjectURL(blob);
    } finally {
      signal?.removeEventListener('abort', abortHandler);
    }
  }
}

export default ApiService;