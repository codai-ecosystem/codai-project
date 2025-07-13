/**
 * Performance Optimization Module for METU Template
 * Comprehensive performance monitoring, analysis, and optimization tools
 */

import React from 'react';

// Type definitions for performance module
// interface BundleAnalysis {
//   bundleSize: BundleSizeInfo | null;
//   chunkAnalysis: ChunkAnalysis;
//   duplicateDependencies: string[];
//   unusedCode: string[];
//   optimizationSuggestions: string[];
// }

// interface BundleSizeInfo {
//   totalSizeBytes: number;
//   compressedSizeBytes: number;
//   mainBundleSizeBytes: number;
//   chunkSizes: { [key: string]: number };
//   thresholdExceeded: boolean;
//   fileSizes: { [key: string]: number };
// }

// interface ChunkAnalysis {
//   totalChunks: number;
//   dynamicChunks: number;
//   asyncChunks: number;
//   duplicatedModules: string[];
//   largeBundles: string[];
// }

interface WebVitalsMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  INP: number; // Interaction to Next Paint
}

interface PerformanceMetric {
  type: string;
  value: number | string | Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface MetricSummary {
  count: number;
  total: number;
  min: number;
  max: number;
  avg: number;
}

interface ResourceTiming extends Record<string, unknown> {
  name: string;
  type: string;
  duration: number;
  size: number;
  cached: boolean;
  timing: {
    dns: number;
    tcp: number;
    request: number;
    response: number;
  };
}

interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  once?: boolean;
}

interface IntersectionObserverOptions {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
}

interface BudgetViolation {
  metric: string;
  value: number;
  budget: number;
  exceeded: number;
  percentage: number;
}

interface BudgetResult {
  passed: boolean;
  violations: BudgetViolation[];
  score: number;
}

// Extended Web API types for better type safety
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

// Bundle Analysis and Optimization
export class BundleOptimizer {
  // Static analysis results cache (currently unused)
  // private static analysisResults: BundleAnalysis | null = null;

  /**
   * Analyze bundle composition and identify optimization opportunities
   */
  static async analyzeBundles() {
    // TODO: Implement webpack bundle analysis
    // const webpack = require('webpack');
    // const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

    const analysis = {
      bundleSize: await this.measureBundleSize(),
      chunkAnalysis: await this.analyzeChunks(),
      duplicateDependencies: await this.findDuplicates(),
      unusedCode: await this.detectDeadCode(),
      optimizationSuggestions: [],
    };

    // TODO: Store analysis results
    // this.analysisResults = analysis;
    return analysis;
  }

  /**
   * Implement code splitting strategies
   */
  static getCodeSplittingConfig() {
    return {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor libraries
          vendor: {
            test: /[/\\]node_modules[/\\]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Common UI components
          ui: {
            test: /[/\\]src[/\\]components[/\\]ui[/\\]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 20,
          },
          // Utilities and helpers
          utils: {
            test: /[/\\]src[/\\](lib|utils|helpers)[/\\]/,
            name: 'utilities',
            chunks: 'all',
            priority: 15,
          },
          // Page-specific code
          pages: {
            test: /[/\\]src[/\\]app[/\\]/,
            name: 'pages',
            chunks: 'all',
            priority: 5,
          },
        },
      },
    };
  }

  private static async measureBundleSize() {
    // TODO: Implement filesystem operations
    // const fs = require('fs').promises;
    const path = require('node:path');

    try {
      const buildDir = path.join(process.cwd(), '.next');
      const stats = await this.getBuildStats(buildDir);

      return {
        totalSize: stats.totalSize,
        jsSize: stats.jsSize,
        cssSize: stats.cssSize,
        imageSize: stats.imageSize,
        compression: {
          gzip: stats.gzipSize,
          brotli: stats.brotliSize,
        },
      };
    } catch (error: unknown) {
      console.warn('Bundle size analysis failed:', error);
      return null;
    }
  }

  private static async analyzeChunks() {
    // Implementation for chunk analysis
    return {
      entryChunks: [],
      vendorChunks: [],
      asyncChunks: [],
      sharedChunks: [],
    };
  }

  private static async findDuplicates() {
    // Implementation for finding duplicate dependencies
    return [];
  }

  private static async detectDeadCode() {
    // Implementation for dead code detection
    return [];
  }

  private static async getBuildStats(_buildDir: string) {
    // Implementation for build statistics
    return {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      gzipSize: 0,
      brotliSize: 0,
    };
  }
}

// Image Optimization Service
export class ImageOptimizer {
  /**
   * Optimize images for different devices and formats
   */
  static getOptimizationConfig() {
    return {
      formats: ['webp', 'avif', 'jpeg'],
      sizes: [320, 640, 768, 1024, 1366, 1920],
      quality: {
        webp: 85,
        avif: 80,
        jpeg: 85,
        png: 90,
      },
      progressive: true,
      mozjpeg: true,
      oxipng: true,
    };
  }

  /**
   * Generate responsive image configurations
   */
  static generateResponsiveConfig(imagePath: string) {
    const config = this.getOptimizationConfig();

    return {
      src: imagePath,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      srcSet: config.sizes.map(size => ({
        width: size,
        format: 'webp',
        quality: config.quality.webp,
      })),
      placeholder: 'blur',
      blurDataURL: this.generateBlurDataURL(imagePath),
    };
  } /**
   * Create optimized image loaders
   */
  static createImageLoader() {
    return ({ src, width, quality }: ImageLoaderParams) => {
      const params = new URLSearchParams({
        url: src,
        w: width.toString(),
        q: (quality || 75).toString(),
      });
      return `/_next/image?${params}`;
    };
  }

  private static generateBlurDataURL(_imagePath: string): string {
    // Generate a low-quality placeholder for blur effect
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
  }
}

// Performance Monitoring
export class PerformanceMonitor {
  private static readonly metrics: PerformanceMetric[] = []; /**
   * Monitor Core Web Vitals
   */
  static initWebVitalsMonitoring() {
    if (typeof window === 'undefined') return;

    const vitals: WebVitalsMetrics = {
      FCP: 0, // First Contentful Paint
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
      TTFB: 0, // Time to First Byte
      INP: 0, // Interaction to Next Paint
    };

    // Observe LCP
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry != null) {
        vitals.LCP = lastEntry.startTime;
        this.reportMetric('LCP', vitals.LCP);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe FID
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const perfEntry = entry as PerformanceEventTiming;
        vitals.FID = perfEntry.processingStart - perfEntry.startTime;
        this.reportMetric('FID', vitals.FID);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Observe CLS
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const layoutShift = entry as LayoutShift;
        if (!layoutShift.hadRecentInput) {
          vitals.CLS += layoutShift.value;
          this.reportMetric('CLS', vitals.CLS);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });

    return vitals;
  }

  /**
   * Monitor JavaScript performance
   */
  static monitorJSPerformance() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.entryType === 'measure') {
          this.reportMetric('custom-timing', entry.duration, {
            name: entry.name,
            startTime: entry.startTime,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['measure', 'navigation'] });

    // Custom performance markers
    return {
      mark: (name: string) => performance.mark(name),
      measure: (name: string, start: string, end?: string) => {
        performance.measure(name, start, end);
      },
      clearMarks: () => performance.clearMarks(),
      clearMeasures: () => performance.clearMeasures(),
    };
  } /**
   * Monitor resource loading performance
   */
  static monitorResourcePerformance() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const resourceEntry = entry as PerformanceResourceTiming;
        const resourceData: ResourceTiming = {
          name: resourceEntry.name,
          type: resourceEntry.initiatorType,
          duration: resourceEntry.duration,
          size: resourceEntry.transferSize,
          cached:
            (resourceEntry.transferSize === 0) != null &&
            resourceEntry.decodedBodySize > 0,
          timing: {
            dns:
              resourceEntry.domainLookupEnd - resourceEntry.domainLookupStart,
            tcp: resourceEntry.connectEnd - resourceEntry.connectStart,
            request: resourceEntry.responseStart - resourceEntry.requestStart,
            response: resourceEntry.responseEnd - resourceEntry.responseStart,
          },
        };

        this.reportMetric('resource-performance', resourceData);
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Generate performance report
   */
  static generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.calculateSummary(),
      recommendations: this.generateRecommendations(),
    };

    return report;
  }
  private static reportMetric(
    type: string,
    value: number | string | Record<string, unknown>,
    metadata?: Record<string, unknown>
  ) {
    this.metrics.push({
      type,
      value,
      metadata: metadata || {},
      timestamp: Date.now(),
    });

    // Send to analytics if configured
    if (typeof window !== 'undefined') {
      const windowWithGtag = window as unknown as {
        gtag?: (...args: unknown[]) => void;
      };
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag('event', 'performance_metric', {
          metric_type: type,
          metric_value: typeof value === 'number' ? Math.round(value) : value,
        });
      }
    }
  }
  private static calculateSummary() {
    const summary: Record<string, MetricSummary> = {};

    for (const metric of this.metrics) {
      if (!summary[metric.type]) {
        summary[metric.type] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0,
        };
      }

      const stats = summary[metric.type];
      if (stats != null && typeof metric.value === 'number') {
        stats.count++;
        stats.total += metric.value;
        stats.min = Math.min(stats.min, metric.value);
        stats.max = Math.max(stats.max, metric.value);
        stats.avg = stats.total / stats.count;
      }
    }

    return summary;
  }

  private static generateRecommendations() {
    const recommendations: string[] = [];
    const summary = this.calculateSummary();

    if (summary['LCP'] && summary['LCP'].avg > 2500) {
      recommendations.push(
        'Optimize Largest Contentful Paint: Consider lazy loading images and optimizing critical resources'
      );
    }

    if (summary['FID'] && summary['FID'].avg > 100) {
      recommendations.push(
        'Improve First Input Delay: Reduce JavaScript execution time and defer non-critical scripts'
      );
    }

    if (summary['CLS'] && summary['CLS'].avg > 0.25) {
      recommendations.push(
        'Fix Cumulative Layout Shift: Set explicit dimensions for images and avoid dynamic content insertion'
      );
    }

    return recommendations;
  }
}

// Service Worker for Caching
export class CacheStrategy {
  /**
   * Generate service worker configuration
   */
  static getServiceWorkerConfig() {
    return {
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 5 * 60, // 5 minutes
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
        {
          urlPattern: /\.(?:js|css)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            },
          },
        },
      ],
      skipWaiting: true,
      clientsClaim: true,
    };
  }

  /**
   * Implement intelligent cache strategies
   */
  static getCacheStrategies() {
    return {
      // Critical resources - cache first
      critical: {
        strategy: 'CacheFirst',
        resources: ['/fonts/', '/icons/', '/manifest.json'],
        maxAge: 365 * 24 * 60 * 60, // 1 year
      },

      // API responses - network first with fallback
      api: {
        strategy: 'NetworkFirst',
        resources: ['/api/'],
        maxAge: 5 * 60, // 5 minutes
        networkTimeoutSeconds: 3,
      },

      // Static assets - stale while revalidate
      static: {
        strategy: 'StaleWhileRevalidate',
        resources: ['/_next/static/'],
        maxAge: 7 * 24 * 60 * 60, // 7 days
      },

      // Pages - network first with offline fallback
      pages: {
        strategy: 'NetworkFirst',
        resources: ['/'],
        maxAge: 60 * 60, // 1 hour
        offlineFallback: '/offline',
      },
    };
  }
}

// Lazy Loading Utilities
export class LazyLoadingManager {
  /**
   * Implement component lazy loading
   */
  static createLazyComponent(
    importFunction: () => Promise<{
      default: React.ComponentType<Record<string, unknown>>;
    }>,
    options: LazyLoadOptions = {}
  ) {
    const { lazy, Suspense } = require('react');

    const LazyComponent = lazy(importFunction);

    return function LazyWrapper(props: Record<string, unknown>) {
      return React.createElement(
        Suspense,
        {
          fallback:
            options.fallback ?? React.createElement('div', null, 'Loading...'),
        },
        React.createElement(LazyComponent, props)
      );
    };
  } /**
   * Implement intersection observer for content
   */
  static createIntersectionObserver(options: IntersectionObserverOptions = {}) {
    if (typeof window === 'undefined') return null;

    const defaultOptions = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    };

    return new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;

          // Trigger lazy loading
          if (element.dataset['src']) {
            element.setAttribute('src', element.dataset['src']);
            element.removeAttribute('data-src');
          }

          // Add loaded class for animations
          element.classList.add('loaded');

          // Stop observing
          if (options.once !== false) {
            observer.unobserve(element);
          }
        }
      }
    }, defaultOptions);
  }

  /**
   * Preload critical resources
   */
  static preloadCriticalResources() {
    if (typeof window === 'undefined') return;

    const criticalResources = [
      { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
      { href: '/icons/sprite.svg', as: 'image' },
      { href: '/_next/static/css/app.css', as: 'style' },
    ];

    for (const { href, as, type } of criticalResources) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }
}

// Performance Budget Monitor
export class PerformanceBudget {
  private static readonly budgets = {
    // Size budgets (in KB)
    javascript: 250,
    css: 100,
    images: 500,
    fonts: 100,
    total: 1000,

    // Performance budgets (in ms)
    FCP: 1200,
    LCP: 2500,
    FID: 100,
    CLS: 0.25,
    TTFB: 600,
  }; /**
   * Check if current metrics exceed budget
   */
  static checkBudget(metrics: Record<string, number>): BudgetResult {
    const violations: BudgetViolation[] = [];

    for (const [key, budget] of Object.entries(this.budgets)) {
      const value = metrics[key];
      if (value != null && value > budget) {
        violations.push({
          metric: key,
          value,
          budget,
          exceeded: value - budget,
          percentage: Math.round(((value - budget) / budget) * 100),
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      score: Math.max(0, 100 - violations.length * 10),
    };
  }

  /**
   * Generate budget report
   */
  static generateBudgetReport(metrics: Record<string, number>) {
    const budgetCheck = this.checkBudget(metrics);

    return {
      timestamp: new Date().toISOString(),
      budgets: this.budgets,
      metrics,
      results: budgetCheck,
      recommendations: this.getBudgetRecommendations(budgetCheck.violations),
    };
  }

  private static getBudgetRecommendations(violations: BudgetViolation[]) {
    const recommendations: string[] = [];

    for (const violation of violations) {
      switch (violation.metric) {
        case 'javascript':
          recommendations.push(
            'Reduce JavaScript bundle size by code splitting and tree shaking'
          );
          break;
        case 'css':
          recommendations.push(
            'Optimize CSS by removing unused styles and using critical CSS'
          );
          break;
        case 'images':
          recommendations.push(
            'Optimize images using modern formats (WebP, AVIF) and compression'
          );
          break;
        case 'LCP':
          recommendations.push(
            'Improve Largest Contentful Paint by optimizing critical resource loading'
          );
          break;
        case 'FID':
          recommendations.push(
            'Reduce First Input Delay by optimizing JavaScript execution'
          );
          break;
        default:
          recommendations.push(`Optimize ${violation.metric} performance`);
      }
    }

    return recommendations;
  }
}
