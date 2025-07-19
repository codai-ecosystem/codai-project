/**
 * Cache Service - Production Implementation
 * Supports in-memory caching with optional Redis backend
 */

import { EventEmitter } from 'events'
import { createHash } from 'crypto'
import type { CacheOptions, CacheStats, MemoraiConfig } from '../types'

interface CacheItem<T = any> {
  value: T
  expiresAt: Date
  createdAt: Date
  tags: string[]
  hits: number
  metadata?: Record<string, any>
}

export class CacheService extends EventEmitter {
  private cache = new Map<string, CacheItem>()
  private isInitialized = false
  private cleanupInterval?: NodeJS.Timeout
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    expired: 0
  }

  constructor(private config: MemoraiConfig['cache']) {
    super()
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Redis connection if configured
      if (this.config.provider === 'redis' && this.config.url) {
        await this.initializeRedis()
      }
      
      // Start cleanup interval for expired items
      this.startCleanupInterval()
      
      this.isInitialized = true
      this.emit('initialized')
      console.log('💾 Cache Service initialized')
      
    } catch (error) {
      console.error('Failed to initialize cache service:', error)
      this.emit('error', error)
      throw error
    }
  }

  async shutdown(): Promise<void> {
    if (this.isInitialized) {
      // Stop cleanup interval
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval)
      }
      
      // Clean up connections
      this.isInitialized = false
      this.cache.clear()
      this.emit('shutdown')
      console.log('💾 Cache Service shutdown')
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isInitialized) {
      throw new Error('Cache service not initialized')
    }

    try {
      const item = this.cache.get(key)
      
      if (!item) {
        this.stats.misses++
        this.emit('cache:miss', { key })
        return null
      }

      // Check expiration
      if (item.expiresAt < new Date()) {
        this.cache.delete(key)
        this.stats.expired++
        this.stats.misses++
        this.emit('cache:expired', { key })
        return null
      }

      // Update hit statistics
      item.hits++
      this.stats.hits++
      this.emit('cache:hit', { key, hits: item.hits })

      return item.value as T
      
    } catch (error) {
      console.error('Cache get error:', error)
      this.emit('cache:error', { operation: 'get', key, error })
      return null
    }
  }

  async set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Cache service not initialized')
    }

    try {
      // Check cache size limit
      if (this.cache.size >= this.config.maxSize) {
        await this.evictLRU()
      }

      const ttl = options?.ttl || this.config.ttl
      const expiresAt = new Date(Date.now() + ttl * 1000)
      const tags = options?.tags || []
      const metadata = options?.metadata

      const item: CacheItem<T> = {
        value,
        expiresAt,
        createdAt: new Date(),
        tags,
        hits: 0,
        metadata
      }

      this.cache.set(key, item)
      this.stats.sets++
      
      this.emit('cache:set', { key, ttl, tags })
      
    } catch (error) {
      console.error('Cache set error:', error)
      this.emit('cache:error', { operation: 'set', key, error })
      throw error
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Cache service not initialized')
    }

    try {
      const deleted = this.cache.delete(key)
      
      if (deleted) {
        this.stats.deletes++
        this.emit('cache:delete', { key })
      }
      
      return deleted
      
    } catch (error) {
      console.error('Cache delete error:', error)
      this.emit('cache:error', { operation: 'delete', key, error })
      return false
    }
  }

  async clear(pattern?: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Cache service not initialized')
    }

    try {
      if (!pattern) {
        const size = this.cache.size
        this.cache.clear()
        this.emit('cache:clear', { count: size })
        return size
      }

      // Pattern matching with support for wildcards
      let cleared = 0
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key)
          cleared++
        }
      }
      
      this.emit('cache:clear', { count: cleared, pattern })
      
      return cleared
      
    } catch (error) {
      console.error('Cache clear error:', error)
      this.emit('cache:error', { operation: 'clear', pattern, error })
      return 0
    }
  }

  async clearByTag(tag: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Cache service not initialized')
    }

    let cleared = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key)
        cleared++
      }
    }
    
    this.emit('cache:clear_by_tag', { tag, count: cleared })
    
    return cleared
  }

  async has(key: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Cache service not initialized')
    }

    const item = this.cache.get(key)
    
    if (!item) return false
    
    // Check expiration
    if (item.expiresAt < new Date()) {
      this.cache.delete(key)
      this.stats.expired++
      return false
    }
    
    return true
  }

  async keys(pattern?: string): Promise<string[]> {
    if (!this.isInitialized) {
      throw new Error('Cache service not initialized')
    }

    const keys = Array.from(this.cache.keys())
    
    if (!pattern) return keys
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return keys.filter(key => regex.test(key))
  }

  async getStats(): Promise<CacheStats> {
    const totalRequests = this.stats.hits + this.stats.misses
    
    return {
      totalKeys: this.cache.size,
      memoryUsage: this.calculateMemoryUsage(),
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      evictionCount: this.stats.evictions,
      expiredCount: this.stats.expired
    }
  }

  async getHealth(): Promise<{ status: string; details?: any }> {
    if (!this.isInitialized) {
      return { status: 'unhealthy', details: { initialized: false } }
    }

    try {
      const stats = await this.getStats()
      
      return {
        status: 'healthy',
        details: {
          initialized: true,
          provider: this.config.provider,
          stats,
          maxSize: this.config.maxSize,
          currentSize: this.cache.size
        }
      }
      
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async initializeRedis(): Promise<void> {
    // TODO: Initialize Redis connection
    // This would use ioredis or similar library
    console.log('Redis cache backend not yet implemented, using in-memory cache')
  }

  private startCleanupInterval(): void {
    // Clean up expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired()
    }, 60 * 1000)
  }

  private cleanupExpired(): void {
    const now = new Date()
    let expired = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(key)
        expired++
      }
    }
    
    if (expired > 0) {
      this.stats.expired += expired
      this.emit('cache:cleanup', { expired })
    }
  }

  private async evictLRU(): Promise<void> {
    // Find least recently used item (lowest hits, oldest creation)
    let lruKey: string | null = null
    let lruScore = Infinity
    
    for (const [key, item] of this.cache.entries()) {
      // Score based on hits and age (lower is better for eviction)
      const age = Date.now() - item.createdAt.getTime()
      const score = item.hits - (age / 1000 / 60 / 60) // Hits minus hours of age
      
      if (score < lruScore) {
        lruScore = score
        lruKey = key
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey)
      this.stats.evictions++
      this.emit('cache:evict', { key: lruKey, score: lruScore })
    }
  }

  private calculateMemoryUsage(): number {
    // Rough estimate of memory usage
    let size = 0
    
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2 // String is 2 bytes per character
      size += JSON.stringify(item).length * 2 // Rough estimate of object size
    }
    
    return size
  }
}
