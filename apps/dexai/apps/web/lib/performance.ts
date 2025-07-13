/**
 * Enterprise Performance Optimization System
 * Advanced caching, lazy loading, and optimization utilities
 */

import React from 'react';

// Performance optimization utilities
export class PerformanceOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private observers = new Map<string, IntersectionObserver>();

  // Memoization with TTL
  memoize<T>(fn: (...args: any[]) => T, ttl = 5 * 60 * 1000): (...args: any[]) => T {
    const cache = new Map<string, { result: T; timestamp: number }>();
    
    return (...args: any[]): T => {
      const key = JSON.stringify(args);
      const cached = cache.get(key);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < ttl) {
        return cached.result;
      }
      
      const result = fn(...args);
      cache.set(key, { result, timestamp: now });
      
      // Cleanup old entries
      if (cache.size > 100) {
        const entries = Array.from(cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        entries.slice(0, 50).forEach(([key]) => cache.delete(key));
      }
      
      return result;
    };
  }

  // Debounce function calls
  debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    }) as T;
  }

  // Throttle function calls
  throttle<T extends (...args: any[]) => any>(fn: T, limit: number): T {
    let inThrottle: boolean;
    
    return ((...args: any[]) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }

  // Cache management
  setCache(key: string, data: any, ttl = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Lazy loading with intersection observer
  createLazyLoader(callback: (entry: IntersectionObserverEntry) => void): IntersectionObserver {
    if (typeof window === 'undefined') {
      // Return mock observer for SSR
      return {
        observe: () => {},
        unobserve: () => {},
        disconnect: () => {},
        root: null,
        rootMargin: '',
        thresholds: [],
        takeRecords: () => []
      } as unknown as IntersectionObserver;
    }

    return new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback(entry);
          }
        });
      },
      { threshold: 0.1 }
    );
  }
}

// Bundle optimization utilities
export class BundleOptimizer {
  // Dynamic import with error handling
  static async importModule<T>(moduleFactory: () => Promise<T>): Promise<T | null> {
    try {
      return await moduleFactory();
    } catch (error) {
      console.error('Failed to load module:', error);
      return null;
    }
  }

  // Preload critical resources
  static preloadResource(href: string, as: string): void {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }

  // Prefetch resources
  static prefetchResource(href: string): void {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
}

// Image optimization utilities
export class ImageOptimizer {
  static async compressImage(file: File, quality = 0.8): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  static generateWebPUrl(src: string): string {
    // Convert image URLs to WebP format if supported
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return src;
  }
}

// Memory optimization utilities
export class MemoryOptimizer {
  private cleanupTasks: (() => void)[] = [];

  addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  // Monitor memory usage
  getMemoryUsage(): any {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }
}

// React performance hooks
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

export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

export function useLazyLoad(ref: React.RefObject<Element>): boolean {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
}

export function useMemoryOptimization(): {
  memoryUsage: any;
  addCleanup: (task: () => void) => void;
  cleanup: () => void;
} {
  const [memoryOptimizer] = React.useState(() => new MemoryOptimizer());
  const [memoryUsage, setMemoryUsage] = React.useState<any>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMemoryUsage(memoryOptimizer.getMemoryUsage());
    }, 5000);

    return () => {
      clearInterval(interval);
      memoryOptimizer.cleanup();
    };
  }, [memoryOptimizer]);

  return {
    memoryUsage,
    addCleanup: (task: () => void) => memoryOptimizer.addCleanupTask(task),
    cleanup: () => memoryOptimizer.cleanup()
  };
}

// Global performance instance
export const performanceOptimizer = new PerformanceOptimizer();

export default {
  PerformanceOptimizer,
  BundleOptimizer,
  ImageOptimizer,
  MemoryOptimizer,
  useDebounce,
  useThrottle,
  useLazyLoad,
  useMemoryOptimization
};
