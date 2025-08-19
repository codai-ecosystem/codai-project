// Export all performance monitoring and optimization modules
export { default as PerformanceMonitor, performanceMonitor, performanceMiddleware } from './PerformanceMonitor';
export { DatabasePerformanceOptimizer } from './DatabaseOptimizer';

// Re-export types from DatabaseOptimizer
export type {
    QueryMetrics,
    QueryCacheOptions,
    ConnectionPoolStats
} from './DatabaseOptimizer';

// Version and metadata
export const version = '1.0.0';
export const name = '@memorai/performance';
