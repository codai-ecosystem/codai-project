import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Performance Hook Types
export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fps: number; // Frames per second
  memoryUsage: number;
  bundleSize: number;
  renderTime: number;
  interactionLatency: number;
}

export interface PerformanceThresholds {
  fcp: { good: number; poor: number };
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  ttfb: { good: number; poor: number };
  fps: { good: number; poor: number };
  memoryUsage: { good: number; poor: number };
  renderTime: { good: number; poor: number };
  interactionLatency: { good: number; poor: number };
}

export interface PerformanceOptimization {
  id: string;
  name: string;
  description: string;
  type: 'lazy-loading' | 'code-splitting' | 'caching' | 'compression' | 'prefetch' | 'preload';
  priority: 'high' | 'medium' | 'low';
  impact: number; // Expected performance improvement (0-100)
  implementation: () => void;
  condition?: (metrics: PerformanceMetrics) => boolean;
  active: boolean;
}

// Default thresholds based on Core Web Vitals
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
  fps: { good: 55, poor: 30 },
  memoryUsage: { good: 50, poor: 80 }, // MB
  renderTime: { good: 16, poor: 50 }, // ms per frame
  interactionLatency: { good: 50, poor: 200 },
};

// Performance Monitoring Hook
export const usePerformanceMonitoring = (
  thresholds: Partial<PerformanceThresholds> = {},
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
) => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [optimizations, setOptimizations] = useState<Map<string, PerformanceOptimization>>(new Map());
  const observerRef = useRef<PerformanceObserver | null>(null);
  const frameRef = useRef<number>();
  const fpsCounterRef = useRef({ frames: 0, lastTime: performance.now() });

  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // Measure Core Web Vitals
  const measureCoreWebVitals = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
        } else if (entry.entryType === 'first-input') {
          setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
        } else if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
            setMetrics(prev => ({ 
              ...prev, 
              cls: (prev.cls || 0) + (entry as any).value 
            }));
          }
        } else if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({ 
            ...prev, 
            ttfb: navEntry.responseStart - navEntry.requestStart 
          }));
        }
      });
    });

    try {
      observer.observe({ type: 'paint', buffered: true });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'first-input', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
      observer.observe({ type: 'navigation', buffered: true });
    } catch (e) {
      // Fallback for unsupported entry types
      console.warn('Some performance entry types not supported');
    }

    observerRef.current = observer;
  }, []);

  // Measure FPS
  const measureFPS = useCallback(() => {
    const measureFrame = () => {
      const now = performance.now();
      fpsCounterRef.current.frames++;

      if (now >= fpsCounterRef.current.lastTime + 1000) {
        const fps = Math.round(
          (fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime)
        );
        
        setMetrics(prev => ({ ...prev, fps }));
        
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
      }

      frameRef.current = requestAnimationFrame(measureFrame);
    };

    frameRef.current = requestAnimationFrame(measureFrame);
  }, []);

  // Measure memory usage
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // Measure render time
  const measureRenderTime = useCallback(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
    };
  }, []);

  // Get performance score
  const getPerformanceScore = useCallback((currentMetrics: Partial<PerformanceMetrics>) => {
    let score = 100;
    let totalWeight = 0;

    const weights = {
      fcp: 0.15,
      lcp: 0.25,
      fid: 0.25,
      cls: 0.25,
      ttfb: 0.1,
    };

    Object.entries(weights).forEach(([metric, weight]) => {
      const value = currentMetrics[metric as keyof PerformanceMetrics];
      if (value !== undefined) {
        const threshold = finalThresholds[metric as keyof PerformanceThresholds];
        let metricScore = 100;

        if (value <= threshold.good) {
          metricScore = 100;
        } else if (value <= threshold.poor) {
          metricScore = 100 - ((value - threshold.good) / (threshold.poor - threshold.good)) * 50;
        } else {
          metricScore = 50 - Math.min(50, (value - threshold.poor) / threshold.poor * 50);
        }

        score -= (100 - metricScore) * weight;
        totalWeight += weight;
      }
    });

    return Math.max(0, Math.round(score));
  }, [finalThresholds]);

  // Auto-apply optimizations
  const applyOptimizations = useCallback((currentMetrics: PerformanceMetrics) => {
    optimizations.forEach((optimization) => {
      if (!optimization.active && optimization.condition?.(currentMetrics)) {
        optimization.implementation();
        setOptimizations(prev => new Map(prev).set(optimization.id, { ...optimization, active: true }));
      }
    });
  }, [optimizations]);

  // Register optimization
  const registerOptimization = useCallback((optimization: PerformanceOptimization) => {
    setOptimizations(prev => new Map(prev).set(optimization.id, optimization));
  }, []);

  // Update metrics
  useEffect(() => {
    const currentMetrics = metrics as PerformanceMetrics;
    if (Object.keys(currentMetrics).length > 0) {
      onMetricsUpdate?.(currentMetrics);
      applyOptimizations(currentMetrics);
    }
  }, [metrics, onMetricsUpdate, applyOptimizations]);

  // Initialize measurements
  useEffect(() => {
    measureCoreWebVitals();
    measureFPS();
    
    const memoryInterval = setInterval(measureMemoryUsage, 5000);

    return () => {
      observerRef.current?.disconnect();
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      clearInterval(memoryInterval);
    };
  }, [measureCoreWebVitals, measureFPS, measureMemoryUsage]);

  return {
    metrics: metrics as PerformanceMetrics,
    thresholds: finalThresholds,
    score: getPerformanceScore(metrics),
    registerOptimization,
    measureRenderTime,
    optimizations: Array.from(optimizations.values()),
  };
};

// Lazy Loading Hook
export const useLazyLoading = <T>(
  loader: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (loading || data) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Loading failed'));
    } finally {
      setLoading(false);
    }
  }, [loader, loading, data]);

  useEffect(() => {
    load();
  }, dependencies);

  return { data, loading, error, reload: load };
};

// Virtual Scrolling Hook
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(visibleStart, visibleEnd).map((item, index) => ({
    item,
    index: visibleStart + index,
    style: {
      position: 'absolute' as const,
      top: (visibleStart + index) * itemHeight,
      height: itemHeight,
      width: '100%',
    },
  }));

  const totalHeight = items.length * itemHeight;

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    onScroll,
    visibleStart,
    visibleEnd,
  };
};

// Image Optimization Hook
export const useImageOptimization = () => {
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const [avifSupported, setAvifSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Check WebP support
    const webpImage = new Image();
    webpImage.onload = webpImage.onerror = () => {
      setWebpSupported(webpImage.height === 2);
    };
    webpImage.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

    // Check AVIF support
    const avifImage = new Image();
    avifImage.onload = avifImage.onerror = () => {
      setAvifSupported(avifImage.height === 2);
    };
    avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  }, []);

  const getOptimalImageFormat = useCallback((originalSrc: string) => {
    if (avifSupported) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.avif');
    }
    if (webpSupported) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return originalSrc;
  }, [webpSupported, avifSupported]);

  const getOptimalImageSizes = useCallback((width: number, height: number) => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const screenWidth = window.screen.width;
    
    const sizes = [];
    
    // Generate different sizes for responsive images
    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    
    breakpoints.forEach(breakpoint => {
      if (breakpoint <= screenWidth * devicePixelRatio) {
        const scale = breakpoint / width;
        sizes.push({
          width: Math.round(width * scale),
          height: Math.round(height * scale),
          descriptor: `${breakpoint}w`,
        });
      }
    });

    return sizes;
  }, []);

  return {
    webpSupported,
    avifSupported,
    getOptimalImageFormat,
    getOptimalImageSizes,
  };
};

// Bundle Analysis Hook
export const useBundleAnalysis = () => {
  const [bundleInfo, setBundleInfo] = useState<{
    totalSize: number;
    gzippedSize: number;
    modules: Array<{ name: string; size: number; gzippedSize: number }>;
  } | null>(null);

  useEffect(() => {
    // This would integrate with webpack-bundle-analyzer or similar
    // For now, we'll simulate bundle information
    if (process.env.NODE_ENV === 'development') {
      const mockBundleInfo = {
        totalSize: 1024 * 500, // 500KB
        gzippedSize: 1024 * 150, // 150KB
        modules: [
          { name: 'react', size: 1024 * 42, gzippedSize: 1024 * 13 },
          { name: 'lodash', size: 1024 * 70, gzippedSize: 1024 * 25 },
          { name: 'app', size: 1024 * 200, gzippedSize: 1024 * 60 },
        ],
      };
      setBundleInfo(mockBundleInfo);
    }
  }, []);

  const getLargestModules = useCallback((limit = 10) => {
    if (!bundleInfo) return [];
    
    return bundleInfo.modules
      .sort((a, b) => b.size - a.size)
      .slice(0, limit);
  }, [bundleInfo]);

  const getCompressionRatio = useCallback(() => {
    if (!bundleInfo) return 0;
    
    return bundleInfo.gzippedSize / bundleInfo.totalSize;
  }, [bundleInfo]);

  return {
    bundleInfo,
    getLargestModules,
    getCompressionRatio,
  };
};

// Performance Optimized Component
export interface PerformanceOptimizedProps {
  children: React.ReactNode;
  enableVirtualScrolling?: boolean;
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  performanceThresholds?: Partial<PerformanceThresholds>;
  className?: string;
}

export const PerformanceOptimized: React.FC<PerformanceOptimizedProps> = ({
  children,
  enableVirtualScrolling = false,
  enableLazyLoading = false,
  enableImageOptimization = false,
  performanceThresholds = {},
  className = '',
}) => {
  const { metrics, score, measureRenderTime } = usePerformanceMonitoring(
    performanceThresholds
  );

  const { getOptimalImageFormat } = useImageOptimization();

  useEffect(() => {
    const endMeasurement = measureRenderTime();
    return endMeasurement;
  }, [measureRenderTime]);

  // Apply image optimization if enabled
  const optimizedChildren = enableImageOptimization
    ? React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'img') {
          const optimizedSrc = getOptimalImageFormat(child.props.src);
          return React.cloneElement(child, { src: optimizedSrc });
        }
        return child;
      })
    : children;

  return (
    <div 
      className={`performance-optimized ${className}`}
      data-performance-score={score}
      data-render-time={metrics.renderTime}
    >
      {optimizedChildren}
    </div>
  );
};

// Performance Metrics Display
export interface PerformanceMetricsDisplayProps {
  showDetails?: boolean;
  className?: string;
}

export const PerformanceMetricsDisplay: React.FC<PerformanceMetricsDisplayProps> = ({
  showDetails = false,
  className = '',
}) => {
  const { metrics, score, thresholds } = usePerformanceMonitoring();

  const getMetricStatus = (value: number, metric: keyof PerformanceThresholds) => {
    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const formatMetric = (value: number, unit: string) => {
    return `${Math.round(value)}${unit}`;
  };

  if (!showDetails) {
    return (
      <div className={`performance-score ${className}`}>
        <div className={`score score-${score >= 90 ? 'good' : score >= 50 ? 'needs-improvement' : 'poor'}`}>
          {score}
        </div>
      </div>
    );
  }

  return (
    <div className={`performance-metrics ${className}`}>
      <div className="performance-score">
        <h3>Performance Score</h3>
        <div className={`score score-${score >= 90 ? 'good' : score >= 50 ? 'needs-improvement' : 'poor'}`}>
          {score}
        </div>
      </div>

      <div className="core-web-vitals">
        <h4>Core Web Vitals</h4>
        
        {metrics.fcp && (
          <div className={`metric metric-${getMetricStatus(metrics.fcp, 'fcp')}`}>
            <span className="metric-name">First Contentful Paint</span>
            <span className="metric-value">{formatMetric(metrics.fcp, 'ms')}</span>
          </div>
        )}

        {metrics.lcp && (
          <div className={`metric metric-${getMetricStatus(metrics.lcp, 'lcp')}`}>
            <span className="metric-name">Largest Contentful Paint</span>
            <span className="metric-value">{formatMetric(metrics.lcp, 'ms')}</span>
          </div>
        )}

        {metrics.fid && (
          <div className={`metric metric-${getMetricStatus(metrics.fid, 'fid')}`}>
            <span className="metric-name">First Input Delay</span>
            <span className="metric-value">{formatMetric(metrics.fid, 'ms')}</span>
          </div>
        )}

        {metrics.cls && (
          <div className={`metric metric-${getMetricStatus(metrics.cls, 'cls')}`}>
            <span className="metric-name">Cumulative Layout Shift</span>
            <span className="metric-value">{metrics.cls.toFixed(3)}</span>
          </div>
        )}
      </div>

      <div className="additional-metrics">
        <h4>Additional Metrics</h4>
        
        {metrics.fps && (
          <div className={`metric metric-${getMetricStatus(metrics.fps, 'fps')}`}>
            <span className="metric-name">FPS</span>
            <span className="metric-value">{formatMetric(metrics.fps, ' fps')}</span>
          </div>
        )}

        {metrics.memoryUsage && (
          <div className={`metric metric-${getMetricStatus(metrics.memoryUsage, 'memoryUsage')}`}>
            <span className="metric-name">Memory Usage</span>
            <span className="metric-value">{formatMetric(metrics.memoryUsage, 'MB')}</span>
          </div>
        )}

        {metrics.renderTime && (
          <div className={`metric metric-${getMetricStatus(metrics.renderTime, 'renderTime')}`}>
            <span className="metric-name">Render Time</span>
            <span className="metric-value">{formatMetric(metrics.renderTime, 'ms')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  usePerformanceMonitoring,
  useLazyLoading,
  useVirtualScrolling,
  useImageOptimization,
  useBundleAnalysis,
  PerformanceOptimized,
  PerformanceMetricsDisplay,
};
