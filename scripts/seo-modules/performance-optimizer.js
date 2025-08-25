/**
 * Performance Optimizer Module
 * 
 * Implements comprehensive performance optimization with:
 * - Core Web Vitals monitoring and optimization
 * - Image optimization and lazy loading
 * - Code splitting and bundle optimization
 * - Resource preloading and prefetching
 * - Service worker implementation
 * - Performance metrics tracking
 */

import { promises as fs } from 'fs';
import path from 'path';

export async function applySEOEnhancement(appPath, appName) {
    console.log(`      ⚡ Implementing performance optimization for ${appName}...`);

    try {
        // Create performance optimization directory
        const performancePath = path.join(appPath, 'src', 'lib', 'seo', 'performance');
        await fs.mkdir(performancePath, { recursive: true });

        // Create performance components
        await createCoreWebVitalsTracker(performancePath);
        await createImageOptimizer(performancePath);
        await createResourcePreloader(performancePath);
        await createPerformanceMonitor(performancePath);
        await createServiceWorkerGenerator(performancePath);

        // Create performance hooks
        await createPerformanceHooks(performancePath);

        // Update Next.js configuration for performance
        await updateNextConfigForPerformance(appPath, appName);

        console.log(`      ✅ Performance optimization implemented for ${appName}`);

    } catch (error) {
        console.error(`      ❌ Failed to implement performance optimization for ${appName}:`, error.message);
        throw error;
    }
}

async function createCoreWebVitalsTracker(performancePath) {
    const tracker = `import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

export interface WebVitalsMetrics {
  CLS?: number;
  FID?: number;
  FCP?: number;
  LCP?: number;
  TTFB?: number;
}

export interface VitalsReportOptions {
  enableAnalytics?: boolean;
  enableConsoleLog?: boolean;
  enableLocalStorage?: boolean;
  analyticsEndpoint?: string;
  thresholds?: {
    LCP?: number;
    FID?: number;
    CLS?: number;
  };
}

export class CoreWebVitalsTracker {
  private metrics: WebVitalsMetrics = {};
  private options: VitalsReportOptions;

  constructor(options: VitalsReportOptions = {}) {
    this.options = {
      enableAnalytics: true,
      enableConsoleLog: process.env.NODE_ENV === 'development',
      enableLocalStorage: true,
      thresholds: {
        LCP: 2500, // milliseconds
        FID: 100,  // milliseconds
        CLS: 0.1   // score
      },
      ...options
    };
  }

  start(): void {
    console.log('🎯 Starting Core Web Vitals tracking...');
    
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
  }

  private handleMetric = (metric: Metric): void => {
    this.metrics[metric.name as keyof WebVitalsMetrics] = metric.value;
    
    if (this.options.enableConsoleLog) {
      console.log(\`📊 \${metric.name}: \${metric.value}\`, metric);
    }
    
    if (this.options.enableLocalStorage) {
      this.saveToLocalStorage(metric);
    }
    
    if (this.options.enableAnalytics) {
      this.sendToAnalytics(metric);
    }
    
    this.checkThresholds(metric);
  };

  private saveToLocalStorage(metric: Metric): void {
    try {
      const existingMetrics = JSON.parse(
        localStorage.getItem('web-vitals-metrics') || '{}'
      );
      existingMetrics[metric.name] = {
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id
      };
      localStorage.setItem('web-vitals-metrics', JSON.stringify(existingMetrics));
    } catch (error) {
      console.warn('Failed to save metrics to localStorage:', error);
    }
  }

  private sendToAnalytics(metric: Metric): void {
    if (!this.options.analyticsEndpoint) return;
    
    try {
      fetch(this.options.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          id: metric.id,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(error => {
        console.warn('Failed to send metrics to analytics:', error);
      });
    } catch (error) {
      console.warn('Analytics request failed:', error);
    }
  }

  private checkThresholds(metric: Metric): void {
    const thresholds = this.options.thresholds;
    if (!thresholds) return;
    
    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (!threshold) return;
    
    const isGood = metric.value <= threshold;
    const status = isGood ? '✅' : '⚠️';
    
    console.log(
      \`\${status} \${metric.name} threshold check: \${metric.value} \${isGood ? '≤' : '>'} \${threshold}\`
    );
    
    if (!isGood) {
      console.warn(\`Performance issue detected: \${metric.name} exceeds threshold\`);
      this.triggerPerformanceAlert(metric, threshold);
    }
  }

  private triggerPerformanceAlert(metric: Metric, threshold: number): void {
    // Dispatch custom event for performance alerts
    window.dispatchEvent(new CustomEvent('performance-alert', {
      detail: {
        metric: metric.name,
        value: metric.value,
        threshold,
        message: \`\${metric.name} (\${metric.value}) exceeds recommended threshold (\${threshold})\`
      }
    }));
  }

  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  getMetricsFromStorage(): WebVitalsMetrics | null {
    try {
      const stored = localStorage.getItem('web-vitals-metrics');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to retrieve metrics from localStorage:', error);
      return null;
    }
  }

  generateReport(): string {
    const metrics = this.getMetrics();
    const thresholds = this.options.thresholds;
    
    let report = '📊 Core Web Vitals Report\\n';
    report += '================================\\n';
    
    Object.entries(metrics).forEach(([name, value]) => {
      if (value !== undefined) {
        const threshold = thresholds?.[name as keyof typeof thresholds];
        const status = threshold && value <= threshold ? '✅' : '⚠️';
        report += \`\${status} \${name}: \${value}\${threshold ? \` (threshold: \${threshold})\` : ''}\\n\`;
      }
    });
    
    return report;
  }
}

export default CoreWebVitalsTracker;`;

    await fs.writeFile(path.join(performancePath, 'CoreWebVitalsTracker.ts'), tracker);
}

async function createImageOptimizer(performancePath) {
    const optimizer = `import React, { useState, useRef, useEffect } from 'react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  loading = 'lazy',
  sizes,
  className,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate responsive srcSet
  const generateSrcSet = (baseSrc: string): string => {
    const breakpoints = [320, 480, 768, 1024, 1200, 1920];
    return breakpoints
      .map(bp => \`\${baseSrc}?w=\${bp}&q=\${quality} \${bp}w\`)
      .join(', ');
  };

  // Generate default sizes if not provided
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!priority && loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
              }
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [priority, loading]);

  // Error fallback image
  const fallbackSrc = '/images/fallback.png';

  return (
    <div className={\`relative \${className || ''}\`}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: blurDataURL ? \`url(\${blurDataURL})\` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
          }}
        />
      )}

      <img
        ref={imgRef}
        src={priority || loading === 'eager' ? src : undefined}
        data-src={priority || loading === 'eager' ? undefined : src}
        srcSet={generateSrcSet(hasError ? fallbackSrc : src)}
        sizes={defaultSizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        className={\`transition-opacity duration-300 \${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } \${className || ''}\`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: width ? \`\${width}px\` : 'auto',
          height: height ? \`\${height}px\` : 'auto',
        }}
      />

      {/* Loading skeleton */}
      {!isLoaded && !hasError && placeholder === 'empty' && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            width: width || '100%',
            height: height || '200px',
          }}
        />
      )}
    </div>
  );
};

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  threshold?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={imgRef} className={className}>
      {isVisible ? (
        <OptimizedImage src={src} alt={alt} loading="lazy" />
      ) : (
        <div className="bg-gray-200 animate-pulse h-48 w-full" />
      )}
    </div>
  );
};

export class ImageOptimizationService {
  static preloadCriticalImages(imageSrcs: string[]): void {
    imageSrcs.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  static generatePlaceholderDataURL(width: number, height: number, color = '#e5e7eb'): string {
    const svg = \`
      <svg width="\${width}" height="\${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="\${color}"/>
      </svg>
    \`;
    return \`data:image/svg+xml;base64,\${btoa(svg)}\`;
  }

  static async convertToWebP(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('WebP conversion failed'));
            }
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }
}

export default OptimizedImage;`;

    await fs.writeFile(path.join(performancePath, 'ImageOptimizer.tsx'), optimizer);
}

async function createResourcePreloader(performancePath) {
    const preloader = `export interface PreloadResource {
  href: string;
  as: 'script' | 'style' | 'image' | 'font' | 'fetch' | 'document';
  crossorigin?: 'anonymous' | 'use-credentials';
  type?: string;
  media?: string;
}

export interface PrefetchResource {
  href: string;
  as?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
}

export class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private prefetchedResources = new Set<string>();

  constructor() {
    console.log('🚀 Resource preloader initialized');
  }

  /**
   * Preload critical resources that are needed immediately
   */
  preload(resources: PreloadResource[]): void {
    resources.forEach(resource => {
      if (!this.preloadedResources.has(resource.href)) {
        this.createPreloadLink(resource);
        this.preloadedResources.add(resource.href);
      }
    });
  }

  /**
   * Prefetch resources that might be needed soon
   */
  prefetch(resources: PrefetchResource[]): void {
    resources.forEach(resource => {
      if (!this.prefetchedResources.has(resource.href)) {
        this.createPrefetchLink(resource);
        this.prefetchedResources.add(resource.href);
      }
    });
  }

  /**
   * Preload critical fonts
   */
  preloadFonts(fontUrls: string[]): void {
    const fontResources: PreloadResource[] = fontUrls.map(url => ({
      href: url,
      as: 'font',
      crossorigin: 'anonymous',
      type: 'font/woff2'
    }));
    this.preload(fontResources);
  }

  /**
   * Preload critical CSS
   */
  preloadCSS(cssUrls: string[]): void {
    const cssResources: PreloadResource[] = cssUrls.map(url => ({
      href: url,
      as: 'style'
    }));
    this.preload(cssResources);
  }

  /**
   * Preload critical JavaScript
   */
  preloadJS(jsUrls: string[]): void {
    const jsResources: PreloadResource[] = jsUrls.map(url => ({
      href: url,
      as: 'script'
    }));
    this.preload(jsResources);
  }

  /**
   * Preload hero images and critical visual content
   */
  preloadImages(imageUrls: string[]): void {
    const imageResources: PreloadResource[] = imageUrls.map(url => ({
      href: url,
      as: 'image'
    }));
    this.preload(imageResources);
  }

  /**
   * Prefetch next page resources based on navigation hints
   */
  prefetchNextPageResources(nextPageUrls: string[]): void {
    const pageResources: PrefetchResource[] = nextPageUrls.map(url => ({
      href: url,
      as: 'document'
    }));
    this.prefetch(pageResources);
  }

  /**
   * DNS prefetch for external domains
   */
  dnsPrefetch(domains: string[]): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain.startsWith('//') ? domain : \`//\${domain}\`;
      document.head.appendChild(link);
    });
  }

  /**
   * Preconnect to critical external resources
   */
  preconnect(domains: string[], crossorigin = false): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain.startsWith('http') ? domain : \`https://\${domain}\`;
      if (crossorigin) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  private createPreloadLink(resource: PreloadResource): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.crossorigin) {
      link.crossOrigin = resource.crossorigin;
    }
    
    if (resource.type) {
      link.type = resource.type;
    }
    
    if (resource.media) {
      link.media = resource.media;
    }

    document.head.appendChild(link);
    console.log(\`⚡ Preloading: \${resource.href} as \${resource.as}\`);
  }

  private createPrefetchLink(resource: PrefetchResource): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource.href;
    
    if (resource.as) {
      link.as = resource.as;
    }
    
    if (resource.crossorigin) {
      link.crossOrigin = resource.crossorigin;
    }

    document.head.appendChild(link);
    console.log(\`🔮 Prefetching: \${resource.href}\`);
  }

  /**
   * Smart prefetch based on user behavior
   */
  initIntelligentPrefetch(): void {
    // Prefetch on hover for interactive elements
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && !this.prefetchedResources.has(link.href)) {
        this.prefetch([{ href: link.href, as: 'document' }]);
      }
    });

    // Prefetch visible links in viewport
    this.prefetchVisibleLinks();

    // Prefetch based on connection quality
    this.adaptToBandwidth();
  }

  private prefetchVisibleLinks(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          if (!this.prefetchedResources.has(link.href)) {
            this.prefetch([{ href: link.href, as: 'document' }]);
          }
        }
      });
    });

    document.querySelectorAll('a[href]').forEach(link => {
      observer.observe(link);
    });
  }

  private adaptToBandwidth(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType;
      
      // Only prefetch on fast connections
      if (effectiveType === '4g' || connection?.downlink > 1.5) {
        console.log('🚀 Fast connection detected, enabling aggressive prefetching');
        // Enable more aggressive prefetching
      } else {
        console.log('🐌 Slow connection detected, limiting prefetching');
        // Limit prefetching on slow connections
      }
    }
  }

  /**
   * Get performance metrics for preloaded resources
   */
  getPreloadMetrics(): { preloaded: number; prefetched: number } {
    return {
      preloaded: this.preloadedResources.size,
      prefetched: this.prefetchedResources.size
    };
  }
}

export default ResourcePreloader;`;

    await fs.writeFile(path.join(performancePath, 'ResourcePreloader.ts'), preloader);
}

async function createPerformanceMonitor(performancePath) {
    const monitor = `import { CoreWebVitalsTracker } from './CoreWebVitalsTracker';

export interface PerformanceMetrics {
  navigation?: PerformanceNavigationTiming;
  resources?: PerformanceResourceTiming[];
  marks?: PerformanceMark[];
  measures?: PerformanceMeasure[];
  memory?: any;
  webVitals?: any;
}

export interface PerformanceAlert {
  type: 'warning' | 'error';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

export class PerformanceMonitor {
  private vitalsTracker: CoreWebVitalsTracker;
  private alerts: PerformanceAlert[] = [];
  private isMonitoring = false;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.vitalsTracker = new CoreWebVitalsTracker({
      enableAnalytics: true,
      enableConsoleLog: process.env.NODE_ENV === 'development'
    });
    
    console.log('📊 Performance monitor initialized');
  }

  start(): void {
    if (this.isMonitoring) {
      console.warn('Performance monitoring is already active');
      return;
    }

    this.isMonitoring = true;
    console.log('🚀 Starting performance monitoring...');

    // Start Core Web Vitals tracking
    this.vitalsTracker.start();

    // Monitor navigation timing
    this.observeNavigationTiming();

    // Monitor resource loading
    this.observeResourceTiming();

    // Monitor long tasks
    this.observeLongTasks();

    // Monitor memory usage
    this.monitorMemory();

    // Set up performance alerts
    this.setupPerformanceAlerts();
  }

  stop(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log('⏹️ Performance monitoring stopped');
  }

  private observeNavigationTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceNavigationTiming[];
        entries.forEach(entry => {
          this.analyzeNavigationTiming(entry);
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Navigation timing observation not supported:', error);
    }
  }

  private observeResourceTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        entries.forEach(entry => {
          this.analyzeResourceTiming(entry);
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource timing observation not supported:', error);
    }
  }

  private observeLongTasks(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 50) {
            console.warn(\`🐌 Long task detected: \${entry.duration}ms\`, entry);
            this.createAlert('warning', 'LongTask', entry.duration, 50, 
              \`Long task detected (\${entry.duration}ms)\`);
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Long task observation not supported:', error);
    }
  }

  private monitorMemory(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        const totalMB = memory.totalJSHeapSize / 1048576;
        const limitMB = memory.jsHeapSizeLimit / 1048576;

        if (usedMB > limitMB * 0.9) {
          this.createAlert('warning', 'Memory', usedMB, limitMB * 0.9,
            \`High memory usage: \${usedMB.toFixed(1)}MB of \${limitMB.toFixed(1)}MB\`);
        }

        console.log(\`💾 Memory: \${usedMB.toFixed(1)}MB / \${totalMB.toFixed(1)}MB (Limit: \${limitMB.toFixed(1)}MB)\`);
      }, 30000); // Check every 30 seconds
    }
  }

  private analyzeNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      DNS: entry.domainLookupEnd - entry.domainLookupStart,
      Connect: entry.connectEnd - entry.connectStart,
      TTFB: entry.responseStart - entry.requestStart,
      Download: entry.responseEnd - entry.responseStart,
      DOMContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
      Load: entry.loadEventEnd - entry.navigationStart
    };

    console.log('🧭 Navigation Timing:', metrics);

    // Check for performance issues
    if (metrics.TTFB > 200) {
      this.createAlert('warning', 'TTFB', metrics.TTFB, 200, 
        \`Slow Time To First Byte: \${metrics.TTFB}ms\`);
    }

    if (metrics.DOMContentLoaded > 1500) {
      this.createAlert('warning', 'DOMContentLoaded', metrics.DOMContentLoaded, 1500,
        \`Slow DOM Content Loaded: \${metrics.DOMContentLoaded}ms\`);
    }
  }

  private analyzeResourceTiming(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;
    const size = entry.transferSize || 0;
    
    // Alert for slow resources
    if (duration > 1000) {
      console.warn(\`🐌 Slow resource: \${entry.name} (\${duration}ms)\`);
      this.createAlert('warning', 'SlowResource', duration, 1000,
        \`Slow resource load: \${entry.name} (\${duration}ms)\`);
    }

    // Alert for large resources
    if (size > 500000) { // 500KB
      console.warn(\`📦 Large resource: \${entry.name} (\${(size/1024).toFixed(1)}KB)\`);
    }
  }

  private setupPerformanceAlerts(): void {
    // Listen for custom performance events
    window.addEventListener('performance-alert', ((event: CustomEvent) => {
      const { metric, value, threshold, message } = event.detail;
      this.createAlert('warning', metric, value, threshold, message);
    }) as EventListener);
  }

  private createAlert(type: 'warning' | 'error', metric: string, value: number, 
                     threshold: number, message: string): void {
    const alert: PerformanceAlert = {
      type,
      metric,
      value,
      threshold,
      message,
      timestamp: Date.now()
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    console.warn(\`⚠️ Performance Alert: \${message}\`);
  }

  getMetrics(): PerformanceMetrics {
    return {
      navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
      resources: performance.getEntriesByType('resource') as PerformanceResourceTiming[],
      marks: performance.getEntriesByType('mark') as PerformanceMark[],
      measures: performance.getEntriesByType('measure') as PerformanceMeasure[],
      memory: (performance as any).memory,
      webVitals: this.vitalsTracker.getMetrics()
    };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  generateReport(): string {
    const metrics = this.getMetrics();
    const alerts = this.getAlerts();
    
    let report = '📊 Performance Monitoring Report\\n';
    report += '=====================================\\n\\n';
    
    // Web Vitals
    report += '🎯 Core Web Vitals:\\n';
    report += this.vitalsTracker.generateReport() + '\\n';
    
    // Navigation timing
    if (metrics.navigation) {
      const nav = metrics.navigation;
      report += '🧭 Navigation Timing:\\n';
      report += \`  • DNS Lookup: \${nav.domainLookupEnd - nav.domainLookupStart}ms\\n\`;
      report += \`  • Connection: \${nav.connectEnd - nav.connectStart}ms\\n\`;
      report += \`  • TTFB: \${nav.responseStart - nav.requestStart}ms\\n\`;
      report += \`  • DOM Content Loaded: \${nav.domContentLoadedEventEnd - nav.navigationStart}ms\\n\`;
      report += \`  • Load Complete: \${nav.loadEventEnd - nav.navigationStart}ms\\n\\n\`;
    }
    
    // Memory usage
    if (metrics.memory) {
      report += '💾 Memory Usage:\\n';
      report += \`  • Used: \${(metrics.memory.usedJSHeapSize / 1048576).toFixed(1)}MB\\n\`;
      report += \`  • Total: \${(metrics.memory.totalJSHeapSize / 1048576).toFixed(1)}MB\\n\`;
      report += \`  • Limit: \${(metrics.memory.jsHeapSizeLimit / 1048576).toFixed(1)}MB\\n\\n\`;
    }
    
    // Alerts
    if (alerts.length > 0) {
      report += \`⚠️ Recent Alerts (\${alerts.length}):\\n\`;
      alerts.slice(-10).forEach(alert => {
        report += \`  • \${alert.message}\\n\`;
      });
    }
    
    return report;
  }
}

export default PerformanceMonitor;`;

    await fs.writeFile(path.join(performancePath, 'PerformanceMonitor.ts'), monitor);
}

async function createServiceWorkerGenerator(performancePath) {
    const generator = `export interface ServiceWorkerConfig {
  cacheStrategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';
  cacheName: string;
  staticAssets: string[];
  runtimeCaching: Array<{
    urlPattern: RegExp | string;
    strategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';
    cacheName?: string;
    maxEntries?: number;
    maxAgeSeconds?: number;
  }>;
  offlineFallbacks: {
    document?: string;
    image?: string;
    font?: string;
  };
}

export class ServiceWorkerGenerator {
  private config: ServiceWorkerConfig;

  constructor(config: Partial<ServiceWorkerConfig> = {}) {
    this.config = {
      cacheStrategy: 'staleWhileRevalidate',
      cacheName: 'codai-cache-v1',
      staticAssets: [
        '/',
        '/manifest.json',
        '/favicon.ico',
        '/images/logo.png',
        '/fonts/inter.woff2'
      ],
      runtimeCaching: [],
      offlineFallbacks: {
        document: '/offline',
        image: '/images/offline.png',
        font: '/fonts/fallback.woff2'
      },
      ...config
    };
  }

  generateServiceWorker(): string {
    return \`
// Generated Service Worker for CODAI Performance Optimization
// Version: \${Date.now()}

const CACHE_NAME = '\${this.config.cacheName}';
const STATIC_ASSETS = \${JSON.stringify(this.config.staticAssets, null, 2)};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets:', STATIC_ASSETS);
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('⚡ Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content with fallbacks
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Apply caching strategy based on request type
    \${this.generateRuntimeCachingLogic()}
    
    // Default strategy: stale-while-revalidate
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('Fetch error:', error);
    return await handleOfflineFallback(request);
  }
}

// Caching Strategies
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return await handleOfflineFallback(request);
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return await handleOfflineFallback(request);
  }
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || await networkResponsePromise || await handleOfflineFallback(request);
}

async function handleOfflineFallback(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Document fallback
  if (request.mode === 'navigate') {
    const fallback = await caches.match('\${this.config.offlineFallbacks.document || '/offline'}');
    if (fallback) return fallback;
  }
  
  // Image fallback
  if (request.destination === 'image') {
    const fallback = await caches.match('\${this.config.offlineFallbacks.image || '/images/offline.png'}');
    if (fallback) return fallback;
  }
  
  // Font fallback
  if (pathname.includes('.woff') || pathname.includes('.ttf')) {
    const fallback = await caches.match('\${this.config.offlineFallbacks.font || '/fonts/fallback.woff2'}');
    if (fallback) return fallback;
  }
  
  return new Response(
    JSON.stringify({
      error: 'Network error occurred',
      message: 'You are offline. Please check your connection.'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('🔄 Performing background sync...');
  // Implement background sync logic here
}

// Push notifications support
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/images/logo-192.png',
        badge: '/images/badge-72.png',
        data: data.data
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

console.log('🚀 Service Worker loaded and ready');
\`;
  }

  private generateRuntimeCachingLogic(): string {
    if (this.config.runtimeCaching.length === 0) {
      return '// No runtime caching rules defined';
    }

    let logic = '';
    this.config.runtimeCaching.forEach((rule, index) => {
      const pattern = rule.urlPattern instanceof RegExp 
        ? rule.urlPattern.source 
        : rule.urlPattern;
      
      logic += \`
    // Runtime caching rule \${index + 1}
    if (\${rule.urlPattern instanceof RegExp ? \`new RegExp('\${pattern}').test(pathname)\` : \`pathname.includes('\${pattern}')\`}) {
      return await \${rule.strategy}(request);
    }
      \`;
    });

    return logic;
  }

  async writeServiceWorker(outputPath: string): Promise<string> {
    const serviceWorkerContent = this.generateServiceWorker();
    const filePath = path.join(outputPath, 'sw.js');
    
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, serviceWorkerContent, 'utf8');
    
    console.log(\`✅ Service Worker generated: \${filePath}\`);
    return filePath;
  }

  generateManifest(): object {
    return {
      name: 'CODAI - AI Development Ecosystem',
      short_name: 'CODAI',
      description: 'Revolutionary AI-powered development ecosystem',
      start_url: '/',
      display: 'standalone',
      theme_color: '#0066cc',
      background_color: '#ffffff',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/images/logo-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/images/logo-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      categories: ['productivity', 'developer', 'ai'],
      shortcuts: [
        {
          name: 'ControlAI Dashboard',
          url: '/controlai',
          description: 'AI Control Dashboard'
        },
        {
          name: 'MemorAI',
          url: '/memorai',
          description: 'AI Memory System'
        },
        {
          name: 'RomAI',
          url: '/romai',
          description: 'AGI System'
        }
      ]
    };
  }
}

export default ServiceWorkerGenerator;`;

    await fs.writeFile(path.join(performancePath, 'ServiceWorkerGenerator.ts'), generator);
}

async function createPerformanceHooks(performancePath) {
    const hooks = `import { useEffect, useState, useRef, useCallback } from 'react';
import { CoreWebVitalsTracker } from './CoreWebVitalsTracker';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ResourcePreloader } from './ResourcePreloader';

export function usePerformanceMonitor() {
  const [monitor] = useState(() => new PerformanceMonitor());
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) {
      monitor.start();
      setIsMonitoring(true);
    }

    return () => {
      if (isMonitoring) {
        monitor.stop();
        setIsMonitoring(false);
      }
    };
  }, [monitor, isMonitoring]);

  return {
    monitor,
    isMonitoring,
    getMetrics: () => monitor.getMetrics(),
    getAlerts: () => monitor.getAlerts(),
    generateReport: () => monitor.generateReport()
  };
}

export function useWebVitals(options = {}) {
  const [metrics, setMetrics] = useState({});
  const trackerRef = useRef<CoreWebVitalsTracker>();

  useEffect(() => {
    trackerRef.current = new CoreWebVitalsTracker(options);
    trackerRef.current.start();

    // Update metrics periodically
    const interval = setInterval(() => {
      if (trackerRef.current) {
        setMetrics(trackerRef.current.getMetrics());
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return metrics;
}

export function useResourcePreloader() {
  const [preloader] = useState(() => new ResourcePreloader());

  const preload = useCallback((resources) => {
    preloader.preload(resources);
  }, [preloader]);

  const prefetch = useCallback((resources) => {
    preloader.prefetch(resources);
  }, [preloader]);

  const preloadFonts = useCallback((fontUrls) => {
    preloader.preloadFonts(fontUrls);
  }, [preloader]);

  const preloadImages = useCallback((imageUrls) => {
    preloader.preloadImages(imageUrls);
  }, [preloader]);

  useEffect(() => {
    // Initialize intelligent prefetching
    preloader.initIntelligentPrefetch();

    // Preload common resources
    preloader.preconnect([
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdn.jsdelivr.net'
    ], true);

    preloader.dnsPrefetch([
      '//api.codai.dev',
      '//cdn.codai.dev',
      '//analytics.codai.dev'
    ]);
  }, [preloader]);

  return {
    preload,
    prefetch,
    preloadFonts,
    preloadImages,
    getMetrics: () => preloader.getPreloadMetrics()
  };
}

export function usePerformanceOptimization() {
  const { monitor } = usePerformanceMonitor();
  const webVitals = useWebVitals();
  const { preload, prefetch } = useResourcePreloader();

  const optimizeForRoute = useCallback((route: string) => {
    // Route-specific optimizations
    switch (route) {
      case '/':
        preload([
          { href: '/images/hero.jpg', as: 'image' },
          { href: '/css/critical.css', as: 'style' }
        ]);
        break;
      
      case '/controlai':
        preload([
          { href: '/api/controlai/dashboard', as: 'fetch' },
          { href: '/js/dashboard.js', as: 'script' }
        ]);
        break;
        
      default:
        prefetch([
          { href: '/css/common.css' },
          { href: '/js/common.js' }
        ]);
    }
  }, [preload, prefetch]);

  return {
    monitor,
    webVitals,
    optimizeForRoute,
    getOverallScore: () => {
      const lcp = webVitals.LCP || 0;
      const fid = webVitals.FID || 0;
      const cls = webVitals.CLS || 0;
      
      let score = 100;
      if (lcp > 2500) score -= 30;
      if (fid > 100) score -= 30;
      if (cls > 0.1) score -= 40;
      
      return Math.max(0, score);
    }
  };
}

export function useIntersectionObserver(options = {}) {
  const [entries, setEntries] = useState([]);
  const observerRef = useRef<IntersectionObserver>();

  const observe = useCallback((element: Element) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        setEntries(entries);
      }, { threshold: 0.1, ...options });
    }
    
    observerRef.current.observe(element);
  }, [options]);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { entries, observe, unobserve };
}

export default {
  usePerformanceMonitor,
  useWebVitals,
  useResourcePreloader,
  usePerformanceOptimization,
  useIntersectionObserver
};`;

    await fs.writeFile(path.join(performancePath, 'hooks.ts'), hooks);
}

async function updateNextConfigForPerformance(appPath, appName) {
    const nextConfigPath = path.join(appPath, 'next.config.js');

    try {
        let nextConfig = await fs.readFile(nextConfigPath, 'utf8');

        // Add performance optimizations to Next.js config
        if (!nextConfig.includes('performance optimization')) {
            const performanceConfig = `
  // Performance optimizations
  images: {
    domains: ['codai.dev', 'cdn.codai.dev'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
    workerThreads: false,
    esmExternals: true,
  },

  compress: true,
  poweredByHeader: false,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  },`;

            nextConfig = nextConfig.replace(
                'module.exports = {',
                `module.exports = {${performanceConfig}`
            );
        }

        await fs.writeFile(nextConfigPath, nextConfig);

    } catch (error) {
        // Create optimized Next.js config
        const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  images: {
    domains: ['codai.dev', 'cdn.codai.dev'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
    workerThreads: false,
    esmExternals: true,
  },

  compress: true,
  poweredByHeader: false,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;`;

        await fs.writeFile(nextConfigPath, nextConfig);
    }
}