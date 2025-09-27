/**
 * MELLOWISE-032: Advanced Caching Service
 *
 * Multi-tier caching system with Redis patterns, intelligent invalidation,
 * compression, and performance analytics
 *
 * @version 1.0.0
 */

import {
  CacheConfig,
  CacheEntry,
  CacheStats,
  CacheInvalidationRequest,
  CacheStrategy,
  DEFAULT_CACHE_CONFIG,
  getCacheKeyWithTenant
} from '../../types/performance-optimization'

/**
 * Cache tier levels
 */
type CacheTier = 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB' | 'redis'

/**
 * Cache operation result
 */
interface CacheOperationResult<T = any> {
  success: boolean
  data?: T
  cached: boolean
  hitRatio?: number
  responseTime?: number
  error?: string
}

/**
 * Cache invalidation pattern
 */
interface InvalidationPattern {
  pattern: string
  lastInvalidation: string
  invalidationCount: number
}

/**
 * Advanced Caching Service Implementation
 */
export class CachingService {
  private tenant_id: string
  private configs: Map<string, CacheConfig> = new Map()
  private entries: Map<string, CacheEntry> = new Map()
  private stats: Map<CacheTier, CacheStats> = new Map()
  private invalidationPatterns: Map<string, InvalidationPattern> = new Map()
  private compressionEnabled: boolean = true

  // Cache tiers (in priority order)
  private tiers: CacheTier[] = ['memory', 'localStorage', 'sessionStorage', 'indexedDB']

  // LRU eviction tracking
  private accessOrder: string[] = []
  private maxMemorySize: number = 50 * 1024 * 1024 // 50MB default

  constructor(tenant_id: string, maxMemorySize?: number) {
    this.tenant_id = tenant_id
    if (maxMemorySize) this.maxMemorySize = maxMemorySize

    this.initializeCacheStats()
    this.setupPeriodicCleanup()
  }

  /**
   * Initialize cache statistics for each tier
   */
  private initializeCacheStats(): void {
    this.tiers.forEach(tier => {
      this.stats.set(tier, {
        tenant_id: this.tenant_id,
        cache_type: tier,
        total_entries: 0,
        total_size: 0,
        hit_rate: 0,
        miss_rate: 0,
        eviction_rate: 0,
        average_response_time: 0,
        peak_memory_usage: 0,
        stats_period_start: new Date().toISOString(),
        stats_period_end: new Date().toISOString(),
        recorded_at: new Date().toISOString()
      })
    })
  }

  /**
   * Set cache configuration for a specific key pattern
   */
  public setConfig(keyPattern: string, config: Partial<CacheConfig>): void {
    const fullConfig: CacheConfig = {
      ...DEFAULT_CACHE_CONFIG,
      key: keyPattern,
      ...config
    }

    this.configs.set(keyPattern, fullConfig)
  }

  /**
   * Get cached data with multi-tier support
   */
  public async get<T = any>(
    key: string,
    strategy: CacheStrategy = 'cache-first'
  ): Promise<CacheOperationResult<T>> {
    const startTime = performance.now()
    const tenantKey = getCacheKeyWithTenant(this.tenant_id, key)

    try {
      switch (strategy) {
        case 'cache-first':
          return await this.getCacheFirst<T>(tenantKey, startTime)
        case 'network-first':
          return await this.getNetworkFirst<T>(tenantKey, startTime)
        case 'cache-only':
          return await this.getCacheOnly<T>(tenantKey, startTime)
        case 'network-only':
          return await this.getNetworkOnly<T>(tenantKey, startTime)
        case 'stale-while-revalidate':
          return await this.getStaleWhileRevalidate<T>(tenantKey, startTime)
        case 'cache-with-network-fallback':
          return await this.getCacheWithNetworkFallback<T>(tenantKey, startTime)
        default:
          return await this.getCacheFirst<T>(tenantKey, startTime)
      }
    } catch (error) {
      return {
        success: false,
        cached: false,
        error: `Cache get operation failed: ${error}`,
        responseTime: performance.now() - startTime
      }
    }
  }

  /**
   * Cache-first strategy
   */
  private async getCacheFirst<T>(tenantKey: string, startTime: number): Promise<CacheOperationResult<T>> {
    // Try cache tiers in order
    for (const tier of this.tiers) {
      const result = await this.getFromTier<T>(tier, tenantKey)
      if (result.success && result.data !== undefined) {
        this.updateStats(tier, 'hit', performance.now() - startTime)
        this.updateAccessOrder(tenantKey)
        return {
          success: true,
          data: result.data,
          cached: true,
          responseTime: performance.now() - startTime
        }
      }
    }

    this.updateStats('memory', 'miss', performance.now() - startTime)
    return {
      success: false,
      cached: false,
      responseTime: performance.now() - startTime
    }
  }

  /**
   * Network-first strategy (placeholder - would integrate with actual network layer)
   */
  private async getNetworkFirst<T>(tenantKey: string, startTime: number): Promise<CacheOperationResult<T>> {
    try {
      // In real implementation, this would fetch from network
      // For now, fall back to cache
      return await this.getCacheFirst<T>(tenantKey, startTime)
    } catch (error) {
      // Fallback to cache on network error
      return await this.getCacheFirst<T>(tenantKey, startTime)
    }
  }

  /**
   * Cache-only strategy
   */
  private async getCacheOnly<T>(tenantKey: string, startTime: number): Promise<CacheOperationResult<T>> {
    return await this.getCacheFirst<T>(tenantKey, startTime)
  }

  /**
   * Network-only strategy
   */
  private async getNetworkOnly<T>(tenantKey: string, startTime: number): Promise<CacheOperationResult<T>> {
    // Placeholder - would fetch from network only
    return {
      success: false,
      cached: false,
      error: 'Network-only strategy not implemented',
      responseTime: performance.now() - startTime
    }
  }

  /**
   * Stale-while-revalidate strategy
   */
  private async getStaleWhileRevalidate<T>(tenantKey: string, startTime: number): Promise<CacheOperationResult<T>> {
    // Get from cache first
    const cacheResult = await this.getCacheFirst<T>(tenantKey, startTime)

    if (cacheResult.success) {
      // Return cached data immediately, then revalidate in background
      this.revalidateInBackground(tenantKey)
      return cacheResult
    }

    // If no cache, fall back to network
    return await this.getNetworkFirst<T>(tenantKey, startTime)
  }

  /**
   * Cache with network fallback strategy
   */
  private async getCacheWithNetworkFallback<T>(tenantKey: string, startTime: number): Promise<CacheOperationResult<T>> {
    const cacheResult = await this.getCacheFirst<T>(tenantKey, startTime)

    if (cacheResult.success) {
      return cacheResult
    }

    // Fallback to network
    return await this.getNetworkFirst<T>(tenantKey, startTime)
  }

  /**
   * Get data from specific cache tier
   */
  private async getFromTier<T>(tier: CacheTier, key: string): Promise<CacheOperationResult<T>> {
    switch (tier) {
      case 'memory':
        return this.getFromMemory<T>(key)
      case 'localStorage':
        return this.getFromLocalStorage<T>(key)
      case 'sessionStorage':
        return this.getFromSessionStorage<T>(key)
      case 'indexedDB':
        return this.getFromIndexedDB<T>(key)
      case 'redis':
        return this.getFromRedis<T>(key)
      default:
        return { success: false, cached: false }
    }
  }

  /**
   * Memory cache operations
   */
  private getFromMemory<T>(key: string): CacheOperationResult<T> {
    const entry = this.entries.get(key)

    if (!entry) {
      return { success: false, cached: false }
    }

    // Check expiration
    if (this.isExpired(entry)) {
      this.entries.delete(key)
      this.removeFromAccessOrder(key)
      return { success: false, cached: false }
    }

    // Update access tracking
    entry.access_count++
    entry.last_accessed = new Date().toISOString()

    const data = this.decompress<T>(entry.value)
    return {
      success: true,
      data,
      cached: true
    }
  }

  /**
   * LocalStorage operations
   */
  private getFromLocalStorage<T>(key: string): CacheOperationResult<T> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, cached: false }
    }

    try {
      const stored = localStorage.getItem(key)
      if (!stored) return { success: false, cached: false }

      const entry: CacheEntry = JSON.parse(stored)

      if (this.isExpired(entry)) {
        localStorage.removeItem(key)
        return { success: false, cached: false }
      }

      const data = this.decompress<T>(entry.value)
      return {
        success: true,
        data,
        cached: true
      }
    } catch (error) {
      return { success: false, cached: false, error: String(error) }
    }
  }

  /**
   * SessionStorage operations
   */
  private getFromSessionStorage<T>(key: string): CacheOperationResult<T> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return { success: false, cached: false }
    }

    try {
      const stored = sessionStorage.getItem(key)
      if (!stored) return { success: false, cached: false }

      const entry: CacheEntry = JSON.parse(stored)

      if (this.isExpired(entry)) {
        sessionStorage.removeItem(key)
        return { success: false, cached: false }
      }

      const data = this.decompress<T>(entry.value)
      return {
        success: true,
        data,
        cached: true
      }
    } catch (error) {
      return { success: false, cached: false, error: String(error) }
    }
  }

  /**
   * IndexedDB operations (simplified implementation)
   */
  private async getFromIndexedDB<T>(key: string): Promise<CacheOperationResult<T>> {
    // Placeholder for IndexedDB implementation
    return { success: false, cached: false }
  }

  /**
   * Redis operations (placeholder for server-side implementation)
   */
  private async getFromRedis<T>(key: string): Promise<CacheOperationResult<T>> {
    // Placeholder for Redis implementation
    return { success: false, cached: false }
  }

  /**
   * Set data in cache with multi-tier support
   */
  public async set<T = any>(
    key: string,
    value: T,
    config?: Partial<CacheConfig>
  ): Promise<CacheOperationResult<void>> {
    const tenantKey = getCacheKeyWithTenant(this.tenant_id, key)
    const cacheConfig = this.getConfigForKey(key, config)

    try {
      const compressed = this.compress(value)
      const entry: CacheEntry = {
        key: tenantKey,
        value: compressed.data,
        size: compressed.size,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + cacheConfig.ttl * 1000).toISOString(),
        access_count: 0,
        last_accessed: new Date().toISOString(),
        tags: cacheConfig.tags,
        hit_ratio: 0,
        compression_ratio: compressed.compressionRatio
      }

      // Store in all appropriate tiers
      const results = await Promise.all([
        this.setInMemory(tenantKey, entry),
        this.setInLocalStorage(tenantKey, entry),
        this.setInSessionStorage(tenantKey, entry)
      ])

      const success = results.some(result => result.success)

      if (success) {
        this.updateAccessOrder(tenantKey)
        this.enforceMemoryLimits()
      }

      return { success, cached: true }
    } catch (error) {
      return {
        success: false,
        cached: false,
        error: `Cache set operation failed: ${error}`
      }
    }
  }

  /**
   * Set in memory cache
   */
  private setInMemory(key: string, entry: CacheEntry): CacheOperationResult<void> {
    this.entries.set(key, entry)
    this.updateStats('memory', 'set', 0, entry.size)
    return { success: true, cached: true }
  }

  /**
   * Set in localStorage
   */
  private setInLocalStorage(key: string, entry: CacheEntry): CacheOperationResult<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, cached: false }
    }

    try {
      localStorage.setItem(key, JSON.stringify(entry))
      this.updateStats('localStorage', 'set', 0, entry.size)
      return { success: true, cached: true }
    } catch (error) {
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.evictFromLocalStorage()
        try {
          localStorage.setItem(key, JSON.stringify(entry))
          return { success: true, cached: true }
        } catch {
          return { success: false, cached: false, error: 'LocalStorage quota exceeded' }
        }
      }
      return { success: false, cached: false, error: String(error) }
    }
  }

  /**
   * Set in sessionStorage
   */
  private setInSessionStorage(key: string, entry: CacheEntry): CacheOperationResult<void> {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return { success: false, cached: false }
    }

    try {
      sessionStorage.setItem(key, JSON.stringify(entry))
      this.updateStats('sessionStorage', 'set', 0, entry.size)
      return { success: true, cached: true }
    } catch (error) {
      return { success: false, cached: false, error: String(error) }
    }
  }

  /**
   * Delete from cache
   */
  public async delete(key: string): Promise<CacheOperationResult<void>> {
    const tenantKey = getCacheKeyWithTenant(this.tenant_id, key)

    try {
      // Remove from all tiers
      this.entries.delete(tenantKey)
      this.removeFromAccessOrder(tenantKey)

      if (typeof window !== 'undefined') {
        localStorage.removeItem(tenantKey)
        sessionStorage.removeItem(tenantKey)
      }

      return { success: true, cached: false }
    } catch (error) {
      return {
        success: false,
        cached: false,
        error: `Cache delete operation failed: ${error}`
      }
    }
  }

  /**
   * Clear cache with pattern support
   */
  public async clear(pattern?: string): Promise<CacheOperationResult<void>> {
    try {
      if (pattern) {
        return await this.clearByPattern(pattern)
      }

      // Clear all caches for this tenant
      const tenantPrefix = `tenant:${this.tenant_id}:`

      // Clear memory cache
      const keysToDelete = Array.from(this.entries.keys()).filter(key => key.startsWith(tenantPrefix))
      keysToDelete.forEach(key => {
        this.entries.delete(key)
        this.removeFromAccessOrder(key)
      })

      // Clear browser storage
      if (typeof window !== 'undefined') {
        const localStorageKeys = Object.keys(localStorage).filter(key => key.startsWith(tenantPrefix))
        localStorageKeys.forEach(key => localStorage.removeItem(key))

        const sessionStorageKeys = Object.keys(sessionStorage).filter(key => key.startsWith(tenantPrefix))
        sessionStorageKeys.forEach(key => sessionStorage.removeItem(key))
      }

      return { success: true, cached: false }
    } catch (error) {
      return {
        success: false,
        cached: false,
        error: `Cache clear operation failed: ${error}`
      }
    }
  }

  /**
   * Clear cache by pattern
   */
  private async clearByPattern(pattern: string): Promise<CacheOperationResult<void>> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    const tenantPrefix = `tenant:${this.tenant_id}:`

    // Clear from memory
    const keysToDelete = Array.from(this.entries.keys())
      .filter(key => key.startsWith(tenantPrefix) && regex.test(key.replace(tenantPrefix, '')))

    keysToDelete.forEach(key => {
      this.entries.delete(key)
      this.removeFromAccessOrder(key)
    })

    // Clear from browser storage
    if (typeof window !== 'undefined') {
      Object.keys(localStorage)
        .filter(key => key.startsWith(tenantPrefix) && regex.test(key.replace(tenantPrefix, '')))
        .forEach(key => localStorage.removeItem(key))

      Object.keys(sessionStorage)
        .filter(key => key.startsWith(tenantPrefix) && regex.test(key.replace(tenantPrefix, '')))
        .forEach(key => sessionStorage.removeItem(key))
    }

    // Update invalidation tracking
    this.invalidationPatterns.set(pattern, {
      pattern,
      lastInvalidation: new Date().toISOString(),
      invalidationCount: (this.invalidationPatterns.get(pattern)?.invalidationCount || 0) + 1
    })

    return { success: true, cached: false }
  }

  /**
   * Get cache statistics
   */
  public getStats(tier?: CacheTier): CacheStats | Map<CacheTier, CacheStats> {
    if (tier) {
      return this.stats.get(tier) || this.createEmptyStats(tier)
    }
    return new Map(this.stats)
  }

  /**
   * Compression utilities
   */
  private compress(data: any): { data: any; size: number; compressionRatio?: number } {
    if (!this.compressionEnabled) {
      const serialized = JSON.stringify(data)
      return {
        data: serialized,
        size: new Blob([serialized]).size
      }
    }

    try {
      const serialized = JSON.stringify(data)
      const originalSize = new Blob([serialized]).size

      // Simple LZ-style compression simulation
      const compressed = serialized.replace(/(.)\1+/g, (match, char) => {
        return `${char}${match.length > 2 ? match.length : match}`
      })

      const compressedSize = new Blob([compressed]).size
      const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1

      return {
        data: compressed,
        size: compressedSize,
        compressionRatio
      }
    } catch (error) {
      const serialized = JSON.stringify(data)
      return {
        data: serialized,
        size: new Blob([serialized]).size
      }
    }
  }

  private decompress<T>(data: any): T {
    if (!this.compressionEnabled) {
      return typeof data === 'string' ? JSON.parse(data) : data
    }

    try {
      // Reverse the simple compression
      const decompressed = String(data).replace(/(.)\d+/g, (match, char) => {
        const count = parseInt(match.slice(1)) || 1
        return char.repeat(count)
      })

      return JSON.parse(decompressed)
    } catch (error) {
      return typeof data === 'string' ? JSON.parse(data) : data
    }
  }

  /**
   * Utility methods
   */
  private getConfigForKey(key: string, override?: Partial<CacheConfig>): CacheConfig {
    // Find matching pattern
    for (const [pattern, config] of this.configs) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))
      if (regex.test(key)) {
        return { ...config, ...override }
      }
    }

    return { ...DEFAULT_CACHE_CONFIG, key, ...override }
  }

  private isExpired(entry: CacheEntry): boolean {
    return new Date() > new Date(entry.expires_at)
  }

  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.removeFromAccessOrder(key)

    // Add to front (most recently used)
    this.accessOrder.unshift(key)

    // Limit access order tracking
    if (this.accessOrder.length > 10000) {
      this.accessOrder = this.accessOrder.slice(0, 5000)
    }
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  private enforceMemoryLimits(): void {
    let currentSize = 0
    this.entries.forEach(entry => currentSize += entry.size)

    if (currentSize > this.maxMemorySize) {
      this.evictLeastRecentlyUsed()
    }
  }

  private evictLeastRecentlyUsed(): void {
    const evictCount = Math.ceil(this.accessOrder.length * 0.1) // Evict 10%
    const keysToEvict = this.accessOrder.slice(-evictCount)

    keysToEvict.forEach(key => {
      this.entries.delete(key)
      this.removeFromAccessOrder(key)
    })

    this.updateStats('memory', 'eviction', 0, 0, keysToEvict.length)
  }

  private evictFromLocalStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return

    const tenantPrefix = `tenant:${this.tenant_id}:`
    const keys = Object.keys(localStorage).filter(key => key.startsWith(tenantPrefix))

    // Remove oldest 25% of entries
    const keysToRemove = keys.slice(0, Math.ceil(keys.length * 0.25))
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  private updateStats(
    tier: CacheTier,
    operation: 'hit' | 'miss' | 'set' | 'eviction',
    responseTime: number = 0,
    size: number = 0,
    count: number = 1
  ): void {
    const stats = this.stats.get(tier)
    if (!stats) return

    switch (operation) {
      case 'hit':
        stats.hit_rate = (stats.hit_rate + 1) / 2 // Simple moving average
        stats.average_response_time = (stats.average_response_time + responseTime) / 2
        break
      case 'miss':
        stats.miss_rate = (stats.miss_rate + 1) / 2
        break
      case 'set':
        stats.total_entries += count
        stats.total_size += size
        stats.peak_memory_usage = Math.max(stats.peak_memory_usage, stats.total_size)
        break
      case 'eviction':
        stats.eviction_rate = (stats.eviction_rate + count) / 2
        break
    }

    stats.recorded_at = new Date().toISOString()
  }

  private createEmptyStats(tier: CacheTier): CacheStats {
    return {
      tenant_id: this.tenant_id,
      cache_type: tier,
      total_entries: 0,
      total_size: 0,
      hit_rate: 0,
      miss_rate: 0,
      eviction_rate: 0,
      average_response_time: 0,
      peak_memory_usage: 0,
      stats_period_start: new Date().toISOString(),
      stats_period_end: new Date().toISOString(),
      recorded_at: new Date().toISOString()
    }
  }

  private revalidateInBackground(key: string): void {
    // Placeholder for background revalidation
    // In real implementation, this would trigger network request
    setTimeout(() => {
      console.log(`Background revalidation for key: ${key}`)
    }, 100)
  }

  private setupPeriodicCleanup(): void {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries()
    }, 5 * 60 * 1000)
  }

  private cleanupExpiredEntries(): void {
    const expiredKeys: string[] = []

    this.entries.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => {
      this.entries.delete(key)
      this.removeFromAccessOrder(key)
    })

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`)
    }
  }

  /**
   * Public API methods
   */
  public async invalidate(request: CacheInvalidationRequest): Promise<CacheOperationResult<void>> {
    try {
      switch (request.strategy) {
        case 'key':
          if (request.keys) {
            await Promise.all(request.keys.map(key => this.delete(key)))
          }
          break
        case 'pattern':
          if (request.patterns) {
            await Promise.all(request.patterns.map(pattern => this.clearByPattern(pattern)))
          }
          break
        case 'tag':
          if (request.tags) {
            await this.clearByTags(request.tags)
          }
          break
        case 'all':
          await this.clear()
          break
      }

      return { success: true, cached: false }
    } catch (error) {
      return {
        success: false,
        cached: false,
        error: `Cache invalidation failed: ${error}`
      }
    }
  }

  private async clearByTags(tags: string[]): Promise<void> {
    const keysToDelete: string[] = []

    this.entries.forEach((entry, key) => {
      if (entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => {
      this.entries.delete(key)
      this.removeFromAccessOrder(key)
    })
  }

  public setCompressionEnabled(enabled: boolean): void {
    this.compressionEnabled = enabled
  }

  public getMemoryUsage(): { used: number; total: number; percentage: number } {
    let used = 0
    this.entries.forEach(entry => used += entry.size)

    return {
      used,
      total: this.maxMemorySize,
      percentage: Math.round((used / this.maxMemorySize) * 100)
    }
  }

  public destroy(): void {
    this.entries.clear()
    this.accessOrder = []
    this.stats.clear()
    this.configs.clear()
    this.invalidationPatterns.clear()
  }
}

/**
 * Factory function to create caching service
 */
export function createCachingService(tenant_id: string, maxMemorySize?: number): CachingService {
  return new CachingService(tenant_id, maxMemorySize)
}

/**
 * Global caching service instance
 */
let globalCachingService: CachingService | null = null

export function getGlobalCachingService(tenant_id: string): CachingService {
  if (!globalCachingService) {
    globalCachingService = createCachingService(tenant_id)
  }
  return globalCachingService
}