/**
 * @fileoverview Tests for Advanced Cache Manager
 * @author Cautai Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdvancedCacheManager, type CacheConfig } from '../performance/cache-manager.js';
import type { SearchResult, SearchOptions } from '../types.js';

describe('AdvancedCacheManager', () => {
  let cacheManager: AdvancedCacheManager;
  let mockConfig: CacheConfig;

  beforeEach(() => {
    mockConfig = {
      maxSize: 100,
      ttl: 60000, // 1 minute
      maxAge: 300000, // 5 minutes
      updateAgeOnGet: true,
      allowStale: true,
      staleWhileRevalidate: true,
    };

    cacheManager = new AdvancedCacheManager(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Cache Configuration', () => {
    it('should initialize with provided configuration', () => {
      expect(cacheManager).toBeDefined();
      expect(cacheManager.getStats().maxSize).toBe(mockConfig.maxSize);
    });
  });

  describe('Search Result Caching', () => {
    const mockSearchResults: SearchResult[] = [
      {
        id: '1',
        title: 'Test Result 1',
        url: 'https://example.com/1',
        snippet: 'Test snippet 1',
        language: 'en',
        relevanceScore: 0.9,
        domain: 'example.com',
      },
      {
        id: '2',
        title: 'Test Result 2',
        url: 'https://example.com/2',
        snippet: 'Test snippet 2',
        language: 'en',
        relevanceScore: 0.8,
        domain: 'example.com',
      },
    ];

    const mockSearchOptions: SearchOptions = {
      query: 'test query',
      maxResults: 10,
      language: 'en',
    };

    it('should cache search results successfully', async () => {
      cacheManager.setCachedResults('test query', mockSearchOptions, mockSearchResults);
      
      const cached = await cacheManager.getCachedResults('test query', mockSearchOptions);
      expect(cached.results).toEqual(mockSearchResults);
    });

    it('should return null for uncached search queries', async () => {
      const cached = await cacheManager.getCachedResults('uncached query', mockSearchOptions);
      expect(cached.results).toBeNull();
    });

    it('should generate consistent cache keys for identical queries', () => {
      const options1: SearchOptions = { query: 'test', maxResults: 10, language: 'en' };
      const options2: SearchOptions = { query: 'test', maxResults: 10, language: 'en' };

      // Cache the same query twice
      cacheManager.setCachedResults('test', options1, mockSearchResults);
      cacheManager.setCachedResults('test', options2, mockSearchResults);

      // Should be the same cache entry (only one)
      const stats = cacheManager.getStats();
      expect(stats.size).toBe(1);
    });

    it('should handle different query parameters as different cache entries', async () => {
      const options1: SearchOptions = { query: 'test', maxResults: 10, language: 'en' };
      const options2: SearchOptions = { query: 'test', maxResults: 5, language: 'en' };

      cacheManager.setCachedResults('test', options1, mockSearchResults);
      cacheManager.setCachedResults('test', options2, mockSearchResults);

      const stats = cacheManager.getStats();
      expect(stats.size).toBe(2);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', async () => {
      const searchOptions: SearchOptions = { query: 'test', maxResults: 10, language: 'en' };
      const mockResults: SearchResult[] = [];

      // Initial stats
      let stats = cacheManager.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);

      // Cache miss
      await cacheManager.getCachedResults('test', searchOptions);
      stats = cacheManager.getStats();
      expect(stats.misses).toBe(1);

      // Cache the result
      cacheManager.setCachedResults('test', searchOptions, mockResults);

      // Cache hit
      await cacheManager.getCachedResults('test', searchOptions);
      stats = cacheManager.getStats();
      expect(stats.hits).toBe(1);
    });

    it('should calculate hit rate correctly', async () => {
      const searchOptions: SearchOptions = { query: 'test', maxResults: 10, language: 'en' };
      const mockResults: SearchResult[] = [];

      // 1 miss, 0 hits = 0% hit rate
      await cacheManager.getCachedResults('test', searchOptions);
      let stats = cacheManager.getStats();
      expect(stats.hitRate).toBe(0);

      // Cache the result
      cacheManager.setCachedResults('test', searchOptions, mockResults);

      // 1 miss, 1 hit = 50% hit rate
      await cacheManager.getCachedResults('test', searchOptions);
      stats = cacheManager.getStats();
      expect(stats.hitRate).toBe(0.5);

      // 1 miss, 2 hits = 66.7% hit rate
      await cacheManager.getCachedResults('test', searchOptions);
      stats = cacheManager.getStats();
      expect(stats.hitRate).toBeCloseTo(0.667, 2);
    });

    it('should track cache size', async () => {
      const searchOptions: SearchOptions = { query: 'test', maxResults: 10, language: 'en' };
      const mockResults: SearchResult[] = [];

      let stats = cacheManager.getStats();
      expect(stats.size).toBe(0);

      cacheManager.setCachedResults('test', searchOptions, mockResults);
      stats = cacheManager.getStats();
      expect(stats.size).toBe(1);
    });
  });

  describe('Cache Management', () => {
    it('should handle cache evictions when max size is reached', async () => {
      // Create cache with very small size
      const smallCacheConfig: CacheConfig = {
        ...mockConfig,
        maxSize: 2,
      };
      const smallCache = new AdvancedCacheManager(smallCacheConfig);

      // Fill cache beyond capacity
      const queries = ['query1', 'query2', 'query3'];
      for (let i = 0; i < queries.length; i++) {
        const options: SearchOptions = { 
          query: queries[i], 
          maxResults: 10, 
          language: 'en' 
        };
        smallCache.setCachedResults(queries[i], options, []);
      }

      const stats = smallCache.getStats();
      expect(stats.size).toBeLessThanOrEqual(2);
      expect(stats.evictions).toBeGreaterThan(0);
    });

    it('should handle cache operations', async () => {
      const searchOptions: SearchOptions = { query: 'test', maxResults: 10, language: 'en' };
      const mockResults: SearchResult[] = [];

      // Add something to cache
      cacheManager.setCachedResults('test', searchOptions, mockResults);
      expect(cacheManager.getStats().size).toBe(1);

      // Verify cache is working
      const cached = await cacheManager.getCachedResults('test', searchOptions);
      expect(cached.results).toEqual(mockResults);
    });

    it('should handle cache statistics correctly', () => {
      const stats = cacheManager.getStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid search options gracefully', async () => {
      const result = await cacheManager.getCachedResults('test', null as any);
      expect(result.results).toBeNull();
    });

    it('should handle caching empty results gracefully', async () => {
      const searchOptions: SearchOptions = { query: 'test', maxResults: 10, language: 'en' };
      
      // Should not throw when caching empty arrays
      expect(() => cacheManager.setCachedResults('test', searchOptions, [])).not.toThrow();
      
      const cached = await cacheManager.getCachedResults('test', searchOptions);
      expect(cached.results).toEqual([]);
    });
  });

  describe('Stale-While-Revalidate', () => {
    it('should support stale-while-revalidate pattern', async () => {
      // Create cache with very short TTL
      const shortTTLConfig: CacheConfig = {
        ...mockConfig,
        ttl: 10, // 10ms
        maxAge: 20, // 20ms
        staleWhileRevalidate: true,
      };
      const shortTTLCache = new AdvancedCacheManager(shortTTLConfig);

      const searchOptions: SearchOptions = { query: 'test', maxResults: 10, language: 'en' };
      const mockResults: SearchResult[] = [];

      // Cache result
      shortTTLCache.setCachedResults('test', searchOptions, mockResults);
      
      // Should find it immediately
      let cached = await shortTTLCache.getCachedResults('test', searchOptions);
      expect(cached.results).toEqual(mockResults);
      expect(cached.isStale).toBe(false);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 25));

      // Should return stale data with revalidation flag
      cached = await shortTTLCache.getCachedResults('test', searchOptions, async () => mockResults);
      expect(cached.results).toEqual(mockResults);
      expect(cached.isStale).toBe(true);
    });
  });

  describe('Metadata Caching', () => {
    it('should cache metadata separately', () => {
      const metadata = { suggestions: ['test1', 'test2'], trending: true };
      
      expect(() => cacheManager.setCachedMetadata('test-key', metadata)).not.toThrow();
      
      const cached = cacheManager.getCachedMetadata('test-key');
      expect(cached).toEqual(metadata);
    });

    it('should return null for uncached metadata', () => {
      const cached = cacheManager.getCachedMetadata('nonexistent-key');
      expect(cached).toBeNull();
    });
  });
});