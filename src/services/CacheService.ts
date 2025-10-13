class CacheService {
  private cacheName = 'swgz -music-cache';

  async put(key: string, data: any): Promise<void> {
    try {
      const cache = await caches.open(this.cacheName);
      const response = new Response(JSON.stringify(data));
      await cache.put(key, response);
    } catch (error) {
      console.error('Cache put error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(key);
      if (response) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const cache = await caches.open(this.cacheName);
      await cache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await caches.delete(this.cacheName);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const cache = await caches.open(this.cacheName);
      const requests = await cache.keys();
      return requests.map((req) => req.url);
    } catch (error) {
      console.error('Cache keys error:', error);
      return [];
    }
  }
}

export default new CacheService();