/**
 * Performance optimization utilities for METU Template
 */

import React, { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';

import { logger } from './logger';

/**
 * Higher-order component for lazy loading with error boundaries
 */
export function withLazyLoading<P extends Record<string, unknown>>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(importFunc);

  return function LazyLoadedComponent(props: P) {
    return React.createElement(
      Suspense,
      {
        fallback: fallback
          ? React.createElement(fallback)
          : React.createElement('div', {}, 'Loading...'),
      },
      React.createElement(LazyComponent, props)
    );
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (inThrottle == null) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoization utility with TTL support
 */
export function memoizeWithTTL<TArgs extends readonly unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): (...args: TArgs) => TReturn {
  const cache = new Map<string, { value: TReturn; expiry: number }>();

  return (...args: TArgs): TReturn => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached != null && now < cached.expiry) {
      return cached.value;
    }

    const result = func(...args);
    cache.set(key, { value: result, expiry: now + ttl });

    // Clean up expired entries
    for (const [k, v] of cache.entries()) {
      if (now >= v.expiry) {
        cache.delete(k);
      }
    }
    return result;
  };
}

/**
 * Image optimization helpers
 */
export const imageOptimization = {
  /**
   * Get optimized image URL with proper sizing
   */
  getOptimizedUrl(
    src: string,
    width: number,
    height?: number,
    quality: number = 75
  ): string {
    if (
      src.startsWith('http') &&
      !src.includes('vercel.app') &&
      !src.includes('localhost')
    ) {
      return src; // External images
    }

    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: quality.toString(),
    });

    if (height != null) {
      params.set('h', height.toString());
    }

    return `/_next/image?${params.toString()}`;
  },

  /**
   * Generate responsive image sizes
   */
  generateSizes(
    breakpoints: { [key: string]: number } = {
      mobile: 640,
      tablet: 768,
      desktop: 1024,
      large: 1280,
    }
  ): string {
    return `${Object.entries(breakpoints)
      .map(([_, width]) => `(max-width: ${width}px) ${width}px`)
      .join(', ')}, 100vw`;
  },
};

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  /**
   * Dynamic import with error handling
   */
  async dynamicImport<T>(
    importFunc: () => Promise<T>,
    fallback?: T
  ): Promise<T> {
    try {
      return await importFunc();
    } catch (error: unknown) {
      console.warn('Dynamic import failed:', error);
      if (fallback != null) {
        return fallback;
      }
      throw error;
    }
  },
};

/**
 * Web Vitals tracking
 */
export function trackWebVitals(): void {
  if (typeof window !== 'undefined') {
    import('web-vitals')
      .then(webVitals => {
        webVitals.onCLS(metric =>
          logger.info('CLS metric', { context: { metric } })
        );
        webVitals.onINP(metric =>
          logger.info('INP metric', { context: { metric } })
        ); // Replaced FID with INP
        webVitals.onFCP(metric =>
          logger.info('FCP metric', { context: { metric } })
        );
        webVitals.onLCP(metric =>
          logger.info('LCP metric', { context: { metric } })
        );
        webVitals.onTTFB(metric =>
          logger.info('TTFB metric', { context: { metric } })
        );
      })
      .catch(error => {
        logger.warn('Failed to load web-vitals', { context: { error } });
      });
  }
}
