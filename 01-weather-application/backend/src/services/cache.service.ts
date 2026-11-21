interface CacheEntry<T> {
  data: T;
  sourceTimestamp: string;
  fetchedAt: string;
  expiresAt: number;
}

export class CacheService {
  private memoryStore = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number, sourceTimestamp?: string): void {
    const now = Date.now();
    this.memoryStore.set(key, {
      data,
      sourceTimestamp: sourceTimestamp || new Date(now).toISOString(),
      fetchedAt: new Date(now).toISOString(),
      expiresAt: now + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): { hit: boolean; data?: T; isStale?: boolean; sourceTimestamp?: string; fetchedAt?: string } {
    const entry = this.memoryStore.get(key);
    if (!entry) {
      return { hit: false };
    }

    const isExpired = Date.now() > entry.expiresAt;
    return {
      hit: true,
      data: entry.data,
      isStale: isExpired,
      sourceTimestamp: entry.sourceTimestamp,
      fetchedAt: entry.fetchedAt,
    };
  }

  delete(key: string): void {
    this.memoryStore.delete(key);
  }

  clear(): void {
    this.memoryStore.clear();
  }
}

export const globalCache = new CacheService();
