/**
 * @fileoverview Search Results Cache with LRU eviction
 * @author Cautai Team
 * @version 1.0.0
 */

import type { CacheEntry, SearchResponse } from './types.js';

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'ttl';
}

export type { CacheConfig };

export class SearchCache {
  private cache: Map<string, CacheEntry<SearchResponse>> = new Map();
  private accessOrder: string[] = []; // For LRU tracking
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0
  };

  constructor(private config: CacheConfig) {}

  /**
   * Get cached search response
   */
  public get(key: string): SearchResponse | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }

    // Update access tracking
    entry.metadata.lastAccessed = new Date();
    entry.metadata.accessCount++;
    this.updateAccessOrder(key);
    this.stats.hits++;

    return entry.value;
  }

  /**
   * Set cached search response
   */
  public set(key: string, value: SearchResponse, ttl?: number): void {
    if (!this.config.enabled) return;

    const expiresAt = new Date(Date.now() + (ttl || this.config.ttl));
    const now = new Date();

    const entry: CacheEntry<SearchResponse> = {
      key,
      value,
      expiresAt,
      metadata: {
        createdAt: now,
        lastAccessed: now,
        accessCount: 1,
        tags: [value.query, `total:${value.total}`]
      }
    };

    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key);
    }

    // Evict if at capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
    this.accessOrder.push(key);
    this.stats.size = this.cache.size;
  }

  /**
   * Clear all cached entries
   */
  public clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats.evictions += this.stats.size;
    this.stats.size = 0;
  }

  /**
   * Remove expired entries
   */
  public cleanup(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt < now) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.evictions++;
    }

    this.stats.size = this.cache.size;
  }

  /**
   * Get cache statistics
   */
  public getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? this.stats.hits / (this.stats.hits + this.stats.misses) 
      : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      config: this.config
    };
  }

  /**
   * Get cache entries by tag
   */
  public getByTag(tag: string): SearchResponse[] {
    const results: SearchResponse[] = [];
    
    for (const entry of this.cache.values()) {
      if (entry.metadata.tags.includes(tag) && entry.expiresAt > new Date()) {
        results.push(entry.value);
      }
    }

    return results;
  }

  /**
   * Invalidate cache entries by tag
   */
  public invalidateByTag(tag: string): void {
    const keysToRemove: string[] = [];

    for (const [key, entry] of this.cache) {
      if (entry.metadata.tags.includes(tag)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.evictions++;
    }

    this.stats.size = this.cache.size;
  }

  private evictOldest(): void {
    switch (this.config.strategy) {
      case 'lru':
        this.evictLRU();
        break;
      case 'fifo':
        this.evictFIFO();
        break;
      case 'ttl':
        this.evictByTTL();
        break;
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;
    
    const oldestKey = this.accessOrder[0];
    this.cache.delete(oldestKey);
    this.accessOrder.shift();
    this.stats.evictions++;
  }

  private evictFIFO(): void {
    const oldestEntry = this.cache.entries().next();
    if (oldestEntry.done) return;
    
    const [key] = oldestEntry.value;
    this.cache.delete(key);
    this.removeFromAccessOrder(key);
    this.stats.evictions++;
  }

  private evictByTTL(): void {
    let oldestKey: string | null = null;
    let oldestTime = new Date();

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt < oldestTime) {
        oldestTime = entry.expiresAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.removeFromAccessOrder(oldestKey);
      this.stats.evictions++;
    }
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}