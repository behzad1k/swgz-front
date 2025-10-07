
const API_BASE_URL = 'http://localhost:3000';

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

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }

    return response;
  }

  static async get<T>(endpoint: string): Promise<T> {
    const response = await this.request(endpoint);
    return response.json();
  }

  static async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await this.request(endpoint, { method: 'DELETE' });
    return response.json();
  }

  static getStreamUrl(songId: string, flac = false): string {
    return `${API_BASE_URL}/music/stream/${songId}?flac=${flac}`;
  }

  static async downloadSong(
    songId: string,
    preferFlac: boolean,
    onProgress: (progress: number) => void
  ): Promise<string> {
    const response = await this.request(`/music/stream/${songId}?flac=${preferFlac}`);
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is null');

    const contentLength = +(response.headers.get('Content-Length') || 0);
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      onProgress(Math.round((receivedLength / contentLength) * 100));
    }

    const blob = new Blob(chunks);
    return URL.createObjectURL(blob);
  }
}

export default ApiService;