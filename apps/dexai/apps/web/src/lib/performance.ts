import React from 'react';

/**
 * Advanced Performance Optimization System
 * Enterprise-grade performance enhancement and caching strategies
 */

// Performance optimization utilities
export class PerformanceOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Memoize expensive operations with TTL
   */
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    options: { ttl?: number; key?: (...args: Parameters<T>) => string } = {}
  ): T {
    const { ttl = this.defaultTTL, key = (...args) => JSON.stringify(args) } = options;

    return ((...args: Parameters<T>) => {
      const cacheKey = `memo_${fn.name}_${key(...args)}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }

      const result = fn(...args);
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl
      });

      return result;
    }) as T;
  }

  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    }) as T;
  }

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(fn: T, delay: number): T {
    let isThrottled = false;
    
    return ((...args: Parameters<T>) => {
      if (!isThrottled) {
        fn(...args);
        isThrottled = true;
        setTimeout(() => { isThrottled = false; }, delay);
      }
    }) as T;
  }

  /**
   * Batch multiple operations
   */
  batch<T>(operations: (() => T)[], batchSize: number = 10): Promise<T[]> {
    return new Promise((resolve) => {
      const results: T[] = [];
      let index = 0;

      const processBatch = () => {
        const batch = operations.slice(index, index + batchSize);
        batch.forEach(op => results.push(op()));
        index += batchSize;

        if (index < operations.length) {
          requestIdleCallback(processBatch);
        } else {
          resolve(results);
        }
      };

      processBatch();
    });
  }

  /**
   * Lazy load resources
   */
  async lazyLoad<T>(loader: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(async () => {
          try {
            const result = await loader();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(async () => {
          try {
            const result = await loader();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
    });
  }

  /**
   * Preload critical resources
   */
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script'): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      switch (type) {
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
        case 'image':
          link.as = 'image';
          break;
        case 'font':
          link.as = 'font';
          link.crossOrigin = 'anonymous';
          break;
      }

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload ${url}`));
      
      document.head.appendChild(link);
    });
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Bundle optimization utilities
export class BundleOptimizer {
  /**
   * Dynamic import with error handling
   */
  static async importWithFallback<T>(
    primary: () => Promise<{ default: T }>,
    fallback?: () => T
  ): Promise<T> {
    try {
      const module = await primary();
      return module.default;
    } catch (error) {
      console.warn('Failed to load primary module, using fallback:', error);
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Code splitting utility
   */
  static createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ): React.LazyExoticComponent<T> {
    const LazyComponent = React.lazy(importFn);
    
    if (fallback) {
      return React.lazy(async () => {
        try {
          return await importFn();
        } catch {
          return { default: fallback as T };
        }
      });
    }
    
    return LazyComponent;
  }

  /**
   * Prefetch routes
   */
  static prefetchRoute(route: string): void {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }
  }
}

// Image optimization utilities
export class ImageOptimizer {
  /**
   * Generate responsive image sources
   */
  static generateSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map(size => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');
  }

  /**
   * Generate sizes attribute
   */
  static generateSizes(breakpoints: { [key: string]: string }): string {
    return Object.entries(breakpoints)
      .map(([media, size]) => `${media} ${size}`)
      .join(', ');
  }

  /**
   * Lazy load images with intersection observer
   */
  static lazyLoadImage(img: HTMLImageElement, src: string): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              img.src = src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = src;
    }
  }

  /**
   * Convert to WebP if supported
   */
  static async getOptimalFormat(src: string): Promise<string> {
    if (typeof window === 'undefined') return src;

    // Check WebP support
    const webpSupported = await new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => resolve(webP.height === 2);
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });

    if (webpSupported && !src.includes('.webp')) {
      return src.replace(/\.(jpg|jpeg|png)$/, '.webp');
    }

    return src;
  }
}

// Memory optimization utilities
export class MemoryOptimizer {
  private static observers = new Set<any>();

  /**
   * Clean up event listeners
   */
  static cleanup(target: EventTarget, events: string[], listeners: EventListener[]): () => void {
    events.forEach((event, index) => {
      target.addEventListener(event, listeners[index]);
    });

    return () => {
      events.forEach((event, index) => {
        target.removeEventListener(event, listeners[index]);
      });
    };
  }

  /**
   * Dispose of observers
   */
  static addObserver(observer: any): void {
    this.observers.add(observer);
  }

  static cleanupObservers(): void {
    this.observers.forEach(observer => {
      if (observer.disconnect) {
        observer.disconnect();
      }
    });
    this.observers.clear();
  }

  /**
   * Weak map for object associations
   */
  static createWeakCache<K extends object, V>(): WeakMap<K, V> {
    return new WeakMap<K, V>();
  }
}

// Export optimizers
export const performanceOptimizer = new PerformanceOptimizer();

// React hooks for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastUpdated = React.useRef<number>(0);

  React.useEffect(() => {
    const now = Date.now();
    
    if (now - lastUpdated.current >= delay) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, delay - (now - lastUpdated.current));

      return () => clearTimeout(timeoutId);
    }
  }, [value, delay]);

  return throttledValue;
}

export function useIdleCallback(callback: () => void, deps: React.DependencyList = []): void {
  React.useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback);
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, 0);
      return () => clearTimeout(id);
    }
  }, deps);
}

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): IntersectionObserverEntry | null {
  const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(null);

  React.useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      options
    );

    observer.observe(ref.current);
    MemoryOptimizer.addObserver(observer);

    return () => {
      observer.disconnect();
    };
  }, [ref, options.threshold, options.root, options.rootMargin]);

  return entry;
}
