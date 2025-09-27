/**
 * Cache Manager Service
 * MELLOWISE-032: Multi-level caching system with automatic optimization
 */

import type {
  CacheStrategy,
  CacheConfig,
  CacheEntry,
  CacheMetrics,
  DEFAULT_PERFORMANCE_CONFIG
} from '@/types/performance';

export class CacheManager {
  private caches: Map<CacheStrategy, CacheInstance> = new Map();
  private metrics: CacheMetrics = {
    hitRate: 0,
    missRate: 0,
    evictionRate: 0,
    totalSize: 0,
    entryCount: 0,
    avgResponseTime: 0
  };
  private requestTimes: number[] = [];

  constructor() {
    this.initializeCaches();
  }

  /**
   * Get cached value with fallback strategies
   */
  async get<T = any>(key: string, fallback?: () => Promise<T> | T): Promise<T | null> {
    const startTime = performance.now();

    // Try each cache strategy in order of speed
    const strategies: CacheStrategy[] = ['memory', 'sessionStorage', 'localStorage', 'indexedDB'];

    for (const strategy of strategies) {
      const cache = this.caches.get(strategy);
      if (!cache) continue;

      try {
        const entry = await cache.get(key);
        if (entry && !this.isExpired(entry)) {
          this.updateMetrics('hit', performance.now() - startTime);
          this.updateAccessTime(entry);
          return entry.value;
        }
      } catch (error) {
        console.warn(`Cache ${strategy} get error:`, error);
      }
    }

    // Cache miss - try fallback
    if (fallback) {
      try {
        const value = await fallback();
        if (value !== null && value !== undefined) {
          await this.set(key, value);
          this.updateMetrics('miss', performance.now() - startTime);
          return value;
        }
      } catch (error) {
        console.error('Cache fallback error:', error);
      }
    }

    this.updateMetrics('miss', performance.now() - startTime);
    return null;
  }

  /**
   * Set value in appropriate cache with intelligent strategy selection
   */
  async set<T = any>(key: string, value: T, options?: Partial<CacheConfig>): Promise<boolean> {
    const config: CacheConfig = {
      strategy: this.selectOptimalStrategy(value),
      ttl: DEFAULT_PERFORMANCE_CONFIG.caching.ttl,
      maxSize: DEFAULT_PERFORMANCE_CONFIG.caching.maxSize,
      compression: DEFAULT_PERFORMANCE_CONFIG.caching.compression,
      encryption: DEFAULT_PERFORMANCE_CONFIG.caching.encryption,
      ...options
    };

    const entry: CacheEntry<T> = {
      key,
      value: config.compression ? this.compress(value) : value,
      timestamp: new Date(),
      ttl: config.ttl,
      accessCount: 1,
      lastAccessed: new Date(),
      size: this.calculateSize(value)
    };

    // Try primary strategy first
    let success = await this.setCacheEntry(config.strategy, entry);

    // Fallback to other strategies if primary fails
    if (!success) {
      const fallbackStrategies = this.getFallbackStrategies(config.strategy);
      for (const strategy of fallbackStrategies) {
        success = await this.setCacheEntry(strategy, entry);
        if (success) break;
      }
    }

    if (success) {
      this.updateCacheMetrics();
    }

    return success;
  }

  /**
   * Delete entry from all caches
   */
  async delete(key: string): Promise<boolean> {
    let deleted = false;

    for (const [strategy, cache] of this.caches) {
      try {
        const result = await cache.delete(key);
        if (result) deleted = true;
      } catch (error) {
        console.warn(`Cache ${strategy} delete error:`, error);
      }
    }

    if (deleted) {
      this.updateCacheMetrics();
    }

    return deleted;
  }

  /**
   * Clear all caches
   */
  async clear(strategy?: CacheStrategy): Promise<void> {
    if (strategy) {
      const cache = this.caches.get(strategy);
      if (cache) {
        await cache.clear();
      }
    } else {
      for (const [, cache] of this.caches) {
        await cache.clear();
      }
    }

    this.updateCacheMetrics();
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Optimize cache performance
   */
  async optimize(): Promise<void> {
    console.log('🔧 Starting cache optimization...');

    // Clean expired entries
    await this.cleanExpired();

    // Rebalance cache sizes
    await this.rebalanceCaches();

    // Optimize frequently accessed items
    await this.optimizeHotData();

    this.updateCacheMetrics();

    console.log('✅ Cache optimization completed');
  }

  /**
   * Preload critical data into cache
   */
  async preload(data: { key: string; loader: () => Promise<any> }[]): Promise<void> {
    const promises = data.map(async ({ key, loader }) => {
      try {
        const value = await loader();
        await this.set(key, value, { strategy: 'memory', ttl: 3600 });
      } catch (error) {
        console.warn(`Failed to preload ${key}:`, error);
      }
    });

    await Promise.all(promises);
    console.log(`📦 Preloaded ${data.length} cache entries`);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize all cache instances
   */
  private initializeCaches(): void {
    this.caches.set('memory', new MemoryCache());
    this.caches.set('sessionStorage', new StorageCache('session'));
    this.caches.set('localStorage', new StorageCache('local'));
    this.caches.set('indexedDB', new IndexedDBCache());
  }

  /**
   * Select optimal caching strategy based on data characteristics
   */
  private selectOptimalStrategy<T>(value: T): CacheStrategy {
    const size = this.calculateSize(value);

    // Small, frequently accessed data -> memory
    if (size < 1024) return 'memory';

    // Medium data -> sessionStorage
    if (size < 1024 * 100) return 'sessionStorage';

    // Large data -> indexedDB
    if (size > 1024 * 500) return 'indexedDB';

    // Default to localStorage
    return 'localStorage';
  }

  /**
   * Get fallback strategies for a given primary strategy
   */
  private getFallbackStrategies(primary: CacheStrategy): CacheStrategy[] {
    const allStrategies: CacheStrategy[] = ['memory', 'sessionStorage', 'localStorage', 'indexedDB'];
    return allStrategies.filter(s => s !== primary);
  }

  /**
   * Set entry in specific cache
   */
  private async setCacheEntry<T>(strategy: CacheStrategy, entry: CacheEntry<T>): Promise<boolean> {
    const cache = this.caches.get(strategy);
    if (!cache) return false;

    try {
      return await cache.set(entry);
    } catch (error) {
      console.warn(`Cache ${strategy} set error:`, error);
      return false;
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    if (entry.ttl === 0) return false; // Never expire
    const now = Date.now();
    const expiry = entry.timestamp.getTime() + (entry.ttl * 1000);
    return now > expiry;
  }

  /**
   * Update access time for cache entry
   */
  private updateAccessTime(entry: CacheEntry): void {
    entry.accessCount++;
    entry.lastAccessed = new Date();
  }

  /**
   * Calculate approximate size of value
   */
  private calculateSize(value: any): number {
    if (typeof value === 'string') return value.length * 2; // UTF-16
    if (typeof value === 'number') return 8;
    if (typeof value === 'boolean') return 4;
    if (value === null || value === undefined) return 0;

    // Estimate object size
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 1024; // Default estimate
    }
  }

  /**
   * Compress value for storage
   */
  private compress<T>(value: T): T {
    // In a real implementation, you might use compression libraries
    // For now, just return the value as-is
    return value;
  }

  /**
   * Update cache metrics
   */
  private updateMetrics(type: 'hit' | 'miss', responseTime: number): void {
    this.requestTimes.push(responseTime);

    // Keep only recent request times
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-500);
    }

    // Update average response time
    this.metrics.avgResponseTime = this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length;

    // Update hit/miss rates (simplified)
    const totalRequests = this.requestTimes.length;
    if (type === 'hit') {
      this.metrics.hitRate = ((this.metrics.hitRate * (totalRequests - 1)) + 1) / totalRequests;
    } else {
      this.metrics.missRate = ((this.metrics.missRate * (totalRequests - 1)) + 1) / totalRequests;
    }
  }

  /**
   * Update overall cache metrics
   */
  private async updateCacheMetrics(): Promise<void> {
    let totalSize = 0;
    let entryCount = 0;

    for (const [, cache] of this.caches) {
      const size = await cache.getSize();
      const count = await cache.getCount();
      totalSize += size;
      entryCount += count;
    }

    this.metrics.totalSize = totalSize;
    this.metrics.entryCount = entryCount;
  }

  /**
   * Clean expired entries from all caches
   */
  private async cleanExpired(): Promise<void> {
    const promises = Array.from(this.caches.values()).map(cache => cache.cleanExpired());
    await Promise.all(promises);
  }

  /**
   * Rebalance cache sizes
   */
  private async rebalanceCaches(): Promise<void> {
    // Move frequently accessed items to faster caches
    for (const [strategy, cache] of this.caches) {
      if (strategy === 'memory') continue; // Skip memory cache

      const entries = await cache.getAll();
      const hotEntries = entries
        .filter(entry => entry.accessCount > 10)
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 50); // Top 50 hot entries

      // Move to memory cache
      const memoryCache = this.caches.get('memory');
      if (memoryCache) {
        for (const entry of hotEntries) {
          await memoryCache.set(entry);
        }
      }
    }
  }

  /**
   * Optimize frequently accessed data
   */
  private async optimizeHotData(): Promise<void> {
    // Implementation would identify and optimize hot data paths
    console.log('🔥 Optimizing hot data paths...');
  }
}

// ============================================================================
// CACHE IMPLEMENTATIONS
// ============================================================================

interface CacheInstance {
  get(key: string): Promise<CacheEntry | null>;
  set<T>(entry: CacheEntry<T>): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getSize(): Promise<number>;
  getCount(): Promise<number>;
  getAll(): Promise<CacheEntry[]>;
  cleanExpired(): Promise<void>;
}

/**
 * Memory Cache Implementation
 */
class MemoryCache implements CacheInstance {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 50 * 1024 * 1024; // 50MB

  async get(key: string): Promise<CacheEntry | null> {
    return this.cache.get(key) || null;
  }

  async set<T>(entry: CacheEntry<T>): Promise<boolean> {
    // Check size limits
    if (entry.size > this.maxSize) return false;

    // Evict if necessary
    while (this.getCurrentSize() + entry.size > this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(entry.key, entry);
    return true;
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async getSize(): Promise<number> {
    return this.getCurrentSize();
  }

  async getCount(): Promise<number> {
    return this.cache.size;
  }

  async getAll(): Promise<CacheEntry[]> {
    return Array.from(this.cache.values());
  }

  async cleanExpired(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (entry.ttl > 0) {
        const expiry = entry.timestamp.getTime() + (entry.ttl * 1000);
        if (now > expiry) {
          this.cache.delete(key);
        }
      }
    }
  }

  private getCurrentSize(): number {
    return Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed.getTime() < oldestTime) {
        oldestTime = entry.lastAccessed.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

/**
 * Storage Cache Implementation (localStorage/sessionStorage)
 */
class StorageCache implements CacheInstance {
  private storage: Storage;
  private prefix = 'mellowise_cache_';

  constructor(type: 'local' | 'session') {
    this.storage = type === 'local' ? localStorage : sessionStorage;
  }

  async get(key: string): Promise<CacheEntry | null> {
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry = JSON.parse(item);
      entry.timestamp = new Date(entry.timestamp);
      entry.lastAccessed = new Date(entry.lastAccessed);

      return entry;
    } catch (error) {
      console.warn('Storage cache get error:', error);
      return null;
    }
  }

  async set<T>(entry: CacheEntry<T>): Promise<boolean> {
    try {
      const serialized = JSON.stringify(entry);
      this.storage.setItem(this.prefix + entry.key, serialized);
      return true;
    } catch (error) {
      // Likely quota exceeded
      console.warn('Storage cache set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      this.storage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.warn('Storage cache delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    const keys = Object.keys(this.storage).filter(key => key.startsWith(this.prefix));
    keys.forEach(key => this.storage.removeItem(key));
  }

  async getSize(): Promise<number> {
    let size = 0;
    const keys = Object.keys(this.storage).filter(key => key.startsWith(this.prefix));

    keys.forEach(key => {
      const item = this.storage.getItem(key);
      if (item) size += item.length * 2; // UTF-16
    });

    return size;
  }

  async getCount(): Promise<number> {
    return Object.keys(this.storage).filter(key => key.startsWith(this.prefix)).length;
  }

  async getAll(): Promise<CacheEntry[]> {
    const entries: CacheEntry[] = [];
    const keys = Object.keys(this.storage).filter(key => key.startsWith(this.prefix));

    keys.forEach(key => {
      const item = this.storage.getItem(key);
      if (item) {
        try {
          const entry: CacheEntry = JSON.parse(item);
          entry.timestamp = new Date(entry.timestamp);
          entry.lastAccessed = new Date(entry.lastAccessed);
          entries.push(entry);
        } catch (error) {
          console.warn('Error parsing cache entry:', error);
        }
      }
    });

    return entries;
  }

  async cleanExpired(): Promise<void> {
    const now = Date.now();
    const keys = Object.keys(this.storage).filter(key => key.startsWith(this.prefix));

    keys.forEach(key => {
      const item = this.storage.getItem(key);
      if (item) {
        try {
          const entry: CacheEntry = JSON.parse(item);
          if (entry.ttl > 0) {
            const expiry = new Date(entry.timestamp).getTime() + (entry.ttl * 1000);
            if (now > expiry) {
              this.storage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted entries
          this.storage.removeItem(key);
        }
      }
    });
  }
}

/**
 * IndexedDB Cache Implementation
 */
class IndexedDBCache implements CacheInstance {
  private dbName = 'MellowiseCache';
  private storeName = 'entries';
  private version = 1;

  async get(key: string): Promise<CacheEntry | null> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const entry = request.result;
        if (entry) {
          entry.timestamp = new Date(entry.timestamp);
          entry.lastAccessed = new Date(entry.lastAccessed);
        }
        resolve(entry || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(entry: CacheEntry<T>): Promise<boolean> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve) => {
        const request = store.put(entry);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.warn('IndexedDB set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.warn('IndexedDB delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    store.clear();
  }

  async getSize(): Promise<number> {
    const entries = await this.getAll();
    return entries.reduce((total, entry) => total + entry.size, 0);
  }

  async getCount(): Promise<number> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<CacheEntry[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result.map((entry: any) => {
          entry.timestamp = new Date(entry.timestamp);
          entry.lastAccessed = new Date(entry.lastAccessed);
          return entry;
        });
        resolve(entries);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async cleanExpired(): Promise<void> {
    const entries = await this.getAll();
    const now = Date.now();

    const expiredKeys = entries
      .filter(entry => {
        if (entry.ttl === 0) return false;
        const expiry = entry.timestamp.getTime() + (entry.ttl * 1000);
        return now > expiry;
      })
      .map(entry => entry.key);

    const promises = expiredKeys.map(key => this.delete(key));
    await Promise.all(promises);
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();