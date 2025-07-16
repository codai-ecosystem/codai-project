// Test modules setup
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    STOCAICache,
    DatasetCache,
    FileCache,
    AIAnalysisCache,
    datasetCache,
    fileCache,
    aiAnalysisCache,
    CacheMonitor,
    cacheMonitor,
    createCachedFunction
} from '../lib/cache-system'

describe('STOCAI Cache System', () => {
    let cache: STOCAICache<string>

    beforeEach(() => {
        cache = new STOCAICache<string>(100, 1000) // Small cache for testing
    })

    afterEach(() => {
        cache.destroy()
    })

    describe('Basic Cache Operations', () => {
        it('should set and get values correctly', () => {
            cache.set('test-key', 'test-value')
            expect(cache.get('test-key')).toBe('test-value')
        })

        it('should return null for non-existent keys', () => {
            expect(cache.get('non-existent')).toBeNull()
        })

        it('should check if key exists', () => {
            cache.set('test-key', 'test-value')
            expect(cache.has('test-key')).toBe(true)
            expect(cache.has('non-existent')).toBe(false)
        })

        it('should delete entries correctly', () => {
            cache.set('test-key', 'test-value')
            expect(cache.delete('test-key')).toBe(true)
            expect(cache.get('test-key')).toBeNull()
            expect(cache.delete('non-existent')).toBe(false)
        })

        it('should clear all entries', () => {
            cache.set('key1', 'value1')
            cache.set('key2', 'value2')
            cache.clear()
            expect(cache.size()).toBe(0)
            expect(cache.get('key1')).toBeNull()
            expect(cache.get('key2')).toBeNull()
        })

        it('should return correct size', () => {
            expect(cache.size()).toBe(0)
            cache.set('key1', 'value1')
            expect(cache.size()).toBe(1)
            cache.set('key2', 'value2')
            expect(cache.size()).toBe(2)
        })

        it('should return all keys', () => {
            cache.set('key1', 'value1')
            cache.set('key2', 'value2')
            const keys = cache.keys()
            expect(keys).toContain('key1')
            expect(keys).toContain('key2')
            expect(keys.length).toBe(2)
        })
    })

    describe('TTL and Expiration', () => {
        it('should expire entries after TTL', async () => {
            cache.set('test-key', 'test-value', 100) // 100ms TTL
            expect(cache.get('test-key')).toBe('test-value')

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 150))
            expect(cache.get('test-key')).toBeNull()
        })

        it('should use default TTL when not specified', () => {
            cache.set('test-key', 'test-value')
            expect(cache.has('test-key')).toBe(true)
        })

        it('should handle custom TTL correctly', () => {
            cache.set('test-key', 'test-value', 2000) // 2 seconds
            expect(cache.get('test-key')).toBe('test-value')
        })
    })

    describe('Cache Statistics', () => {
        it('should track hits and misses', () => {
            cache.set('key1', 'value1')

            // Hit
            cache.get('key1')

            // Miss
            cache.get('non-existent')

            const stats = cache.getStats()
            expect(stats.hits).toBe(1)
            expect(stats.misses).toBe(1)
            expect(stats.hitRate).toBe(50)
        })

        it('should track access count', () => {
            cache.set('key1', 'value1')
            cache.get('key1')
            cache.get('key1')
            cache.get('key1')

            const stats = cache.getStats()
            expect(stats.hits).toBe(3)
        })

        it('should track memory usage', () => {
            cache.set('key1', 'value1')
            cache.set('key2', 'value2')

            const usage = cache.getMemoryUsage()
            expect(usage.entryCount).toBe(2)
            expect(usage.totalSize).toBeGreaterThan(0)
            expect(usage.averageEntrySize).toBeGreaterThan(0)
        })
    })

    describe('LRU Eviction', () => {
        it('should evict least recently used entries when maxSize is reached', () => {
            const smallCache = new STOCAICache<string>(2, 10000) // Max 2 entries

            smallCache.set('key1', 'value1')
            smallCache.set('key2', 'value2')
            smallCache.set('key3', 'value3') // Should evict key1

            expect(smallCache.get('key1')).toBeNull()
            expect(smallCache.get('key2')).toBe('value2')
            expect(smallCache.get('key3')).toBe('value3')

            smallCache.destroy()
        })

        it('should track evictions in stats', () => {
            const smallCache = new STOCAICache<string>(2, 10000)

            smallCache.set('key1', 'value1')
            smallCache.set('key2', 'value2')
            smallCache.set('key3', 'value3')

            const stats = smallCache.getStats()
            expect(stats.evictions).toBe(1)

            smallCache.destroy()
        })
    })

    describe('DatasetCache', () => {
        let datasetCacheInstance: DatasetCache

        beforeEach(() => {
            datasetCacheInstance = new DatasetCache()
        })

        afterEach(() => {
            datasetCacheInstance.destroy()
        })

        it('should cache and retrieve datasets', () => {
            const dataset = { id: 'test-dataset', name: 'Test Dataset' }
            datasetCacheInstance.cacheDataset(dataset)

            const retrieved = datasetCacheInstance.getDataset('test-dataset')
            expect(retrieved).toEqual(dataset)
        })

        it('should cache and retrieve dataset lists', () => {
            const params = { page: 1, limit: 10 }
            const datasets = [
                { id: 'dataset1', name: 'Dataset 1' },
                { id: 'dataset2', name: 'Dataset 2' }
            ]

            datasetCacheInstance.cacheDatasetList(params, datasets)

            const retrieved = datasetCacheInstance.getDatasetList(params)
            expect(retrieved).toEqual(datasets)
        })

        it('should return null for non-existent datasets', () => {
            expect(datasetCacheInstance.getDataset('non-existent')).toBeNull()
        })
    })

    describe('FileCache', () => {
        let fileCacheInstance: FileCache

        beforeEach(() => {
            fileCacheInstance = new FileCache()
        })

        afterEach(() => {
            fileCacheInstance.destroy()
        })

        it('should cache and retrieve file metadata', () => {
            const metadata = { size: 1024, type: 'text/plain', modified: Date.now() }
            fileCacheInstance.cacheFileMetadata('file-123', metadata)

            const retrieved = fileCacheInstance.getFileMetadata('file-123')
            expect(retrieved).toEqual(metadata)
        })

        it('should cache and retrieve file content', () => {
            const content = 'This is file content'
            fileCacheInstance.cacheFileContent('file-123', content)

            const retrieved = fileCacheInstance.getFileContent('file-123')
            expect(retrieved).toBe(content)
        })

        it('should return null for non-existent files', () => {
            expect(fileCacheInstance.getFileMetadata('non-existent')).toBeNull()
            expect(fileCacheInstance.getFileContent('non-existent')).toBeNull()
        })
    })

    describe('AIAnalysisCache', () => {
        let aiCacheInstance: AIAnalysisCache

        beforeEach(() => {
            aiCacheInstance = new AIAnalysisCache()
        })

        afterEach(() => {
            aiCacheInstance.destroy()
        })

        it('should cache and retrieve AI analysis', () => {
            const analysis = 'This is AI analysis result'
            const contentHash = 'hash-123'

            aiCacheInstance.cacheAnalysis(contentHash, analysis)

            const retrieved = aiCacheInstance.getAnalysis(contentHash)
            expect(retrieved).toBe(analysis)
        })

        it('should generate content hash consistently', () => {
            const content = 'Test content for hashing'
            const hash1 = aiCacheInstance.generateContentHash(content)
            const hash2 = aiCacheInstance.generateContentHash(content)

            expect(hash1).toBe(hash2)
            expect(hash1).toBeTruthy()
        })

        it('should generate different hashes for different content', () => {
            const content1 = 'First content'
            const content2 = 'Second content'

            const hash1 = aiCacheInstance.generateContentHash(content1)
            const hash2 = aiCacheInstance.generateContentHash(content2)

            expect(hash1).not.toBe(hash2)
        })
    })

    describe('Cache Middleware', () => {
        it('should cache function results', async () => {
            const testCache = new STOCAICache<string>(100, 1000)
            let methodCallCount = 0

            const originalMethod = async (req: { id: string }) => {
                methodCallCount++
                return `result-${req.id}`
            }

            const cachedMethod = createCachedFunction(
                originalMethod,
                testCache,
                (req) => `test-${req.id}`
            )

            // First call should execute method
            const result1 = await cachedMethod({ id: 'test' })
            expect(result1).toBe('result-test')
            expect(methodCallCount).toBe(1)

            // Second call should use cache
            const result2 = await cachedMethod({ id: 'test' })
            expect(result2).toBe('result-test')
            expect(methodCallCount).toBe(1) // Should not increment

            testCache.destroy()
        })

        it('should handle synchronous functions', () => {
            const testCache = new STOCAICache<number>(100, 1000)
            let callCount = 0

            const originalFunction = (x: number) => {
                callCount++
                return x * 2
            }

            const cachedFunction = createCachedFunction(
                originalFunction,
                testCache,
                (x) => `multiply-${x}`
            )

            // First call
            expect(cachedFunction(5)).toBe(10)
            expect(callCount).toBe(1)

            // Second call should use cache
            expect(cachedFunction(5)).toBe(10)
            expect(callCount).toBe(1)

            testCache.destroy()
        })
    })

    describe('CacheMonitor', () => {
        let monitor: CacheMonitor

        beforeEach(() => {
            monitor = new CacheMonitor()
        })

        it('should register and monitor caches', () => {
            const testCache = new STOCAICache<string>(100, 1000)
            monitor.registerCache('test', testCache)

            testCache.set('key1', 'value1')
            testCache.get('key1')
            testCache.get('non-existent')

            const stats = monitor.getOverallStats()
            expect(stats.test).toBeDefined()
            expect(stats.test.hits).toBe(1)
            expect(stats.test.misses).toBe(1)

            testCache.destroy()
        })

        it('should generate comprehensive report', () => {
            const testCache = new STOCAICache<string>(100, 1000)
            monitor.registerCache('test', testCache)

            testCache.set('key1', 'value1')
            testCache.get('key1')

            const report = monitor.generateReport()
            expect(report).toContain('STOCAI Cache Performance Report')
            expect(report).toContain('test Cache')
            expect(report).toContain('Hit Rate')
            expect(report).toContain('Total Requests')

            testCache.destroy()
        })
    })

    describe('Global Cache Instances', () => {
        it('should provide global dataset cache', () => {
            expect(datasetCache).toBeInstanceOf(DatasetCache)
        })

        it('should provide global file cache', () => {
            expect(fileCache).toBeInstanceOf(FileCache)
        })

        it('should provide global AI analysis cache', () => {
            expect(aiAnalysisCache).toBeInstanceOf(AIAnalysisCache)
        })

        it('should provide global cache monitor', () => {
            expect(cacheMonitor).toBeInstanceOf(CacheMonitor)
        })
    })

    describe('Error Handling', () => {
        it('should handle non-serializable values gracefully', () => {
            const circular: any = {}
            circular.ref = circular

            expect(() => {
                cache.set('circular', circular)
            }).not.toThrow()
        })

        it('should handle undefined and null values', () => {
            cache.set('undefined', undefined as any)
            cache.set('null', null as any)

            expect(cache.get('undefined')).toBeUndefined()
            expect(cache.get('null')).toBeNull()
        })
    })

    describe('Performance Characteristics', () => {
        it('should handle large number of entries efficiently', () => {
            const largeCache = new STOCAICache<string>(10000, 10000)

            // Add many entries
            for (let i = 0; i < 1000; i++) {
                largeCache.set(`key-${i}`, `value-${i}`)
            }

            expect(largeCache.size()).toBe(1000)

            // Should retrieve quickly
            const start = Date.now()
            for (let i = 0; i < 100; i++) {
                largeCache.get(`key-${i}`)
            }
            const end = Date.now()

            expect(end - start).toBeLessThan(100) // Should be very fast

            largeCache.destroy()
        })

        it('should track average access time', () => {
            cache.set('key1', 'value1')
            cache.get('key1')
            cache.get('key1')

            const stats = cache.getStats()
            expect(stats.averageAccessTime).toBeGreaterThan(0)
        })
    })
})
