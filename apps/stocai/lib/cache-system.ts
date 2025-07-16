// Node.js performance API compatibility for browser/test environments
const performance = (() => {
    if (typeof window !== 'undefined' && window.performance) {
        return window.performance
    } else if (typeof global !== 'undefined' && global.performance) {
        return global.performance
    } else {
        // Fallback for environments without performance API
        return {
            now: () => Date.now()
        }
    }
})()

// Advanced caching system for STOCAI production
export interface CacheEntry<T> {
    value: T
    timestamp: number
    ttl: number
    accessCount: number
    lastAccessed: number
    size: number
}

export interface CacheStats {
    hits: number
    misses: number
    evictions: number
    totalSize: number
    entryCount: number
    hitRate: number
    averageAccessTime: number
}

export class STOCAICache<T = any> {
    private cache: Map<string, CacheEntry<T>> = new Map()
    private stats: CacheStats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalSize: 0,
        entryCount: 0,
        hitRate: 0,
        averageAccessTime: 0
    }
    private maxSize: number
    private defaultTTL: number
    private cleanupInterval: NodeJS.Timeout | null = null

    constructor(maxSize: number = 1000, defaultTTL: number = 300000) { // 5 minutes default
        this.maxSize = maxSize
        this.defaultTTL = defaultTTL
        this.startCleanupInterval()
    }

    // Set cache entry with optional TTL
    set(key: string, value: T, ttl?: number): void {
        const now = Date.now()
        const entryTTL = ttl || this.defaultTTL

        // Calculate approximate size
        const size = this.calculateSize(value)

        // Remove existing entry if it exists
        if (this.cache.has(key)) {
            const existing = this.cache.get(key)!
            this.stats.totalSize -= existing.size
        }

        // Check if we need to evict entries AFTER removing existing
        while (this.cache.size >= this.maxSize) {
            this.evictLRU()
        }

        const entry: CacheEntry<T> = {
            value,
            timestamp: now,
            ttl: entryTTL,
            accessCount: 0,
            lastAccessed: now,
            size
        }

        this.cache.set(key, entry)
        this.stats.totalSize += size
        this.stats.entryCount = this.cache.size
    }

    // Get cache entry
    get(key: string): T | null {
        const startTime = performance.now()
        const entry = this.cache.get(key)

        if (!entry) {
            this.stats.misses++
            this.updateStats(performance.now() - startTime)
            return null
        }

        // Check if expired
        if (this.isExpired(entry)) {
            this.delete(key)
            this.stats.misses++
            this.updateStats(performance.now() - startTime)
            return null
        }

        // Update access statistics
        entry.accessCount++
        entry.lastAccessed = Date.now()

        this.stats.hits++
        this.updateStats(performance.now() - startTime)

        return entry.value
    }

    // Delete cache entry
    delete(key: string): boolean {
        const entry = this.cache.get(key)
        if (entry) {
            this.stats.totalSize -= entry.size
            this.cache.delete(key)
            this.stats.entryCount = this.cache.size
            return true
        }
        return false
    }

    // Check if entry exists and is not expired
    has(key: string): boolean {
        const entry = this.cache.get(key)
        if (!entry) return false

        if (this.isExpired(entry)) {
            this.delete(key)
            return false
        }

        return true
    }

    // Clear all cache entries
    clear(): void {
        this.cache.clear()
        this.stats.totalSize = 0
        this.stats.entryCount = 0
    }

    // Get cache statistics
    getStats(): CacheStats {
        const totalRequests = this.stats.hits + this.stats.misses
        return {
            ...this.stats,
            hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0
        }
    }

    // Get cache keys
    keys(): string[] {
        return Array.from(this.cache.keys())
    }

    // Get cache size
    size(): number {
        return this.cache.size
    }

    // Get memory usage
    getMemoryUsage(): {
        totalSize: number
        entryCount: number
        averageEntrySize: number
    } {
        return {
            totalSize: this.stats.totalSize,
            entryCount: this.stats.entryCount,
            averageEntrySize: this.stats.entryCount > 0 ? this.stats.totalSize / this.stats.entryCount : 0
        }
    }

    // Private methods
    private isExpired(entry: CacheEntry<T>): boolean {
        return Date.now() - entry.timestamp > entry.ttl
    }

    private evictLRU(): void {
        let oldestKey: string | null = null
        let oldestTime = Date.now()

        for (const [key, entry] of this.cache) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed
                oldestKey = key
            }
        }

        if (oldestKey) {
            this.delete(oldestKey)
            this.stats.evictions++
        }
    }

    private calculateSize(value: T): number {
        try {
            return JSON.stringify(value).length * 2 // Approximate size in bytes
        } catch {
            return 1000 // Default size for non-serializable objects
        }
    }

    private updateStats(accessTime: number): void {
        const totalRequests = this.stats.hits + this.stats.misses
        this.stats.averageAccessTime =
            (this.stats.averageAccessTime * (totalRequests - 1) + accessTime) / totalRequests
    }

    private startCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanup()
        }, 60000) // Clean up every minute
    }

    private cleanup(): void {
        const now = Date.now()
        const expiredKeys: string[] = []

        for (const [key, entry] of this.cache) {
            if (now - entry.timestamp > entry.ttl) {
                expiredKeys.push(key)
            }
        }

        expiredKeys.forEach(key => this.delete(key))
    }

    // Cleanup resources
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
        }
        this.clear()
    }
}

// Specialized cache instances
export class DatasetCache extends STOCAICache<any> {
    constructor() {
        super(500, 600000) // 10 minutes TTL for datasets
    }

    // Cache dataset with smart key generation
    cacheDataset(dataset: any): void {
        const key = `dataset_${dataset.id}`
        this.set(key, dataset)
    }

    // Get dataset by ID
    getDataset(id: string): any | null {
        return this.get(`dataset_${id}`)
    }

    // Cache dataset list with pagination
    cacheDatasetList(params: any, datasets: any[]): void {
        const key = `datasets_${JSON.stringify(params)}`
        this.set(key, datasets, 300000) // 5 minutes for lists
    }

    // Get cached dataset list
    getDatasetList(params: any): any[] | null {
        const key = `datasets_${JSON.stringify(params)}`
        return this.get(key)
    }
}

export class FileCache extends STOCAICache<any> {
    constructor() {
        super(1000, 900000) // 15 minutes TTL for files
    }

    // Cache file metadata
    cacheFileMetadata(fileId: string, metadata: any): void {
        const key = `file_meta_${fileId}`
        this.set(key, metadata)
    }

    // Get file metadata
    getFileMetadata(fileId: string): any | null {
        return this.get(`file_meta_${fileId}`)
    }

    // Cache file content (for small files)
    cacheFileContent(fileId: string, content: any): void {
        const key = `file_content_${fileId}`
        this.set(key, content, 1800000) // 30 minutes for content
    }

    // Get file content
    getFileContent(fileId: string): any | null {
        return this.get(`file_content_${fileId}`)
    }
}

export class AIAnalysisCache extends STOCAICache<string> {
    constructor() {
        super(200, 1800000) // 30 minutes TTL for AI analysis
    }

    // Cache AI analysis with content hash
    cacheAnalysis(contentHash: string, analysis: string): void {
        const key = `ai_analysis_${contentHash}`
        this.set(key, analysis)
    }

    // Get cached AI analysis
    getAnalysis(contentHash: string): string | null {
        return this.get(`ai_analysis_${contentHash}`)
    }

    // Generate content hash
    generateContentHash(content: string): string {
        // Simple hash function for demo - use crypto.createHash in production
        let hash = 0
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32-bit integer
        }
        return hash.toString(36)
    }
}

// Global cache instances
export const datasetCache = new DatasetCache()
export const fileCache = new FileCache()
export const aiAnalysisCache = new AIAnalysisCache()

// Cache middleware for API routes
export function withCache<T>(
    cache: STOCAICache<T>,
    keyGenerator: (req: any) => string,
    ttl?: number
) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (req: any, ...args: any[]) {
            const cacheKey = keyGenerator(req)

            // Try to get from cache first
            const cachedResult = cache.get(cacheKey)
            if (cachedResult) {
                return cachedResult
            }

            // Execute original method
            const result = await originalMethod.apply(this, [req, ...args])

            // Cache the result
            cache.set(cacheKey, result, ttl)

            return result
        }

        return descriptor
    }
}

// Alternative function-based cache wrapper
export function createCachedFunction<T extends (...args: any[]) => any>(
    fn: T,
    cache: STOCAICache<any>,
    keyGenerator: (...args: Parameters<T>) => string,
    ttl?: number
): T {
    return ((...args: Parameters<T>) => {
        const cacheKey = keyGenerator(...args)

        // Try to get from cache first
        const cachedResult = cache.get(cacheKey)
        if (cachedResult) {
            return cachedResult
        }

        // Execute original function
        const result = fn(...args)

        // Handle async results
        if (result && typeof result.then === 'function') {
            return result.then((asyncResult: any) => {
                cache.set(cacheKey, asyncResult, ttl)
                return asyncResult
            })
        }

        // Cache synchronous result
        cache.set(cacheKey, result, ttl)
        return result
    }) as T
}

// Cache monitoring and reporting
export class CacheMonitor {
    private caches: Map<string, STOCAICache<any>> = new Map()

    registerCache(name: string, cache: STOCAICache<any>): void {
        this.caches.set(name, cache)
    }

    getOverallStats(): Record<string, CacheStats> {
        const stats: Record<string, CacheStats> = {}

        for (const [name, cache] of this.caches) {
            stats[name] = cache.getStats()
        }

        return stats
    }

    generateReport(): string {
        const stats = this.getOverallStats()
        let report = `# STOCAI Cache Performance Report\nGenerated: ${new Date().toISOString()}\n\n`

        for (const [name, cacheStats] of Object.entries(stats)) {
            report += `## ${name} Cache\n`
            report += `- Hit Rate: ${cacheStats.hitRate.toFixed(2)}%\n`
            report += `- Total Requests: ${cacheStats.hits + cacheStats.misses}\n`
            report += `- Cache Hits: ${cacheStats.hits}\n`
            report += `- Cache Misses: ${cacheStats.misses}\n`
            report += `- Evictions: ${cacheStats.evictions}\n`
            report += `- Entry Count: ${cacheStats.entryCount}\n`
            report += `- Total Size: ${(cacheStats.totalSize / 1024).toFixed(2)} KB\n`
            report += `- Average Access Time: ${cacheStats.averageAccessTime.toFixed(2)}ms\n\n`
        }

        return report
    }
}

// Global cache monitor
export const cacheMonitor = new CacheMonitor()

// Register default caches
cacheMonitor.registerCache('datasets', datasetCache)
cacheMonitor.registerCache('files', fileCache)
cacheMonitor.registerCache('ai_analysis', aiAnalysisCache)
