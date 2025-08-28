'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Zap, Timer, Eye, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface WebVitalsMetrics {
  CLS: number | null;
  FCP: number | null;
  FID: number | null;
  LCP: number | null;
  TTFB: number | null;
}

interface PerformanceMetrics {
  animationFrames: number;
  memoryUsage: number | null;
  loadTime: number;
  domInteractive: number;
  domComplete: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [webVitals, setWebVitals] = useState<WebVitalsMetrics>({
    CLS: null,
    FCP: null,
    FID: null,
    LCP: null,
    TTFB: null,
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    animationFrames: 0,
    memoryUsage: null,
    loadTime: 0,
    domInteractive: 0,
    domComplete: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor Web Vitals
    const observeWebVitals = () => {
      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setWebVitals(prev => ({ ...prev, LCP: lastEntry.startTime }));
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Fallback for unsupported browsers
        console.log('LCP monitoring not supported');
      }

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          setWebVitals(prev => ({ ...prev, FCP: fcpEntry.startTime }));
        }
      });

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.log('FCP monitoring not supported');
      }

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setWebVitals(prev => ({ ...prev, CLS: clsValue }));
          }
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.log('CLS monitoring not supported');
      }

      return () => {
        observer.disconnect();
        fcpObserver.disconnect();
        clsObserver.disconnect();
      };
    };

    // Monitor Performance Metrics
    const monitorPerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      setPerformanceMetrics(prev => ({
        ...prev,
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
      }));

      // Monitor Memory Usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setPerformanceMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / (1024 * 1024), // Convert to MB
        }));
      }

      // Monitor Animation Frame Rate
      let frameCount = 0;
      let lastTime = performance.now();

      const countFrames = () => {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
          setPerformanceMetrics(prev => ({ ...prev, animationFrames: frameCount }));
          frameCount = 0;
          lastTime = currentTime;
        }

        requestAnimationFrame(countFrames);
      };

      requestAnimationFrame(countFrames);
    };

    const cleanup = observeWebVitals();
    monitorPerformance();

    return cleanup;
  }, []);

  const getScoreColor = (metric: string, value: number | null): string => {
    if (value === null) return 'text-gray-400';

    switch (metric) {
      case 'LCP':
        return value <= 2500 ? 'text-green-500' : value <= 4000 ? 'text-yellow-500' : 'text-red-500';
      case 'FCP':
        return value <= 1800 ? 'text-green-500' : value <= 3000 ? 'text-yellow-500' : 'text-red-500';
      case 'CLS':
        return value <= 0.1 ? 'text-green-500' : value <= 0.25 ? 'text-yellow-500' : 'text-red-500';
      case 'FPS':
        return value >= 55 ? 'text-green-500' : value >= 30 ? 'text-yellow-500' : 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getScoreIcon = (metric: string, value: number | null) => {
    if (value === null) return <Timer className="w-4 h-4" />;

    const isGood = (metric === 'LCP' && value <= 2500) ||
      (metric === 'FCP' && value <= 1800) ||
      (metric === 'CLS' && value <= 0.1) ||
      (metric === 'FPS' && value >= 55);

    const isOk = (metric === 'LCP' && value <= 4000) ||
      (metric === 'FCP' && value <= 3000) ||
      (metric === 'CLS' && value <= 0.25) ||
      (metric === 'FPS' && value >= 30);

    if (isGood) return <CheckCircle className="w-4 h-4" />;
    if (isOk) return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Monitor
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Core Web Vitals */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Core Web Vitals</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">LCP</span>
                  <div className={getScoreColor('LCP', webVitals.LCP)}>
                    {getScoreIcon('LCP', webVitals.LCP)}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${getScoreColor('LCP', webVitals.LCP)}`}>
                  {webVitals.LCP ? `${(webVitals.LCP / 1000).toFixed(2)}s` : 'Loading...'}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">FCP</span>
                  <div className={getScoreColor('FCP', webVitals.FCP)}>
                    {getScoreIcon('FCP', webVitals.FCP)}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${getScoreColor('FCP', webVitals.FCP)}`}>
                  {webVitals.FCP ? `${(webVitals.FCP / 1000).toFixed(2)}s` : 'Loading...'}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">CLS</span>
                  <div className={getScoreColor('CLS', webVitals.CLS)}>
                    {getScoreIcon('CLS', webVitals.CLS)}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${getScoreColor('CLS', webVitals.CLS)}`}>
                  {webVitals.CLS !== null ? webVitals.CLS.toFixed(3) : 'Loading...'}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">FPS</span>
                  <div className={getScoreColor('FPS', performanceMetrics.animationFrames)}>
                    {getScoreIcon('FPS', performanceMetrics.animationFrames)}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${getScoreColor('FPS', performanceMetrics.animationFrames)}`}>
                  {performanceMetrics.animationFrames}
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Additional Metrics</h4>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Load Time:</span>
                <span className="font-medium">{(performanceMetrics.loadTime / 1000).toFixed(2)}s</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">DOM Interactive:</span>
                <span className="font-medium">{(performanceMetrics.domInteractive / 1000).toFixed(2)}s</span>
              </div>

              {performanceMetrics.memoryUsage && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Memory Usage:</span>
                  <span className="font-medium">{performanceMetrics.memoryUsage.toFixed(1)} MB</span>
                </div>
              )}
            </div>

            {/* Performance Tips */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">Performance Tips:</h5>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• GPU-accelerated animations active</li>
                <li>• Reduced motion support enabled</li>
                <li>• Intersection Observer optimizations</li>
                <li>• Memory-efficient particle system</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};