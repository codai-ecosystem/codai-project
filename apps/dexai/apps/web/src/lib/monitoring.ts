import React from 'react';

/**
 * Production Monitoring and Analytics System
 * Enterprise-grade performance tracking and error monitoring
 */

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface UserAnalytics {
  pageView: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  referrer: string;
  duration?: number;
}

class MonitoringService {
  private sessionId: string;
  private startTime: number;
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeErrorTracking();
      this.initializeUserTracking();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initializeWebVitals(): void {
    // Track performance metrics
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric('lcp', entry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric('fid', (entry as any).processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.trackMetric('cls', clsValue);
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.trackMetric('ttfb', navigation.responseStart - navigation.requestStart);
      this.trackMetric('fcp', navigation.loadEventEnd - navigation.fetchStart);
      
      this.sendPerformanceReport({
        fcp: navigation.loadEventEnd - navigation.fetchStart,
        lcp: 0, // Will be updated by observer
        fid: 0, // Will be updated by observer
        cls: 0, // Will be updated by observer
        ttfb: navigation.responseStart - navigation.requestStart
      });
    });
  }

  /**
   * Initialize error tracking
   */
  private initializeErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });
    });

    // React error boundary integration
    (window as any).__REACT_ERROR_OVERLAY__ = false;
  }

  /**
   * Initialize user tracking
   */
  private initializeUserTracking(): void {
    // Page view tracking
    this.trackPageView(window.location.pathname);

    // User engagement tracking
    let isActive = true;
    let lastActivity = Date.now();

    const trackActivity = () => {
      lastActivity = Date.now();
      if (!isActive) {
        isActive = true;
        this.trackEvent('user_active', { sessionId: this.sessionId });
      }
    };

    // Track user interactions
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, trackActivity, { passive: true });
    });

    // Track session duration
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        duration: Date.now() - this.startTime,
        sessionId: this.sessionId
      });
    });

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isActive = false;
        this.trackEvent('page_hidden', { sessionId: this.sessionId });
      } else {
        isActive = true;
        this.trackEvent('page_visible', { sessionId: this.sessionId });
      }
    });
  }

  /**
   * Track performance metrics
   */
  private trackMetric(name: string, value: number): void {
    if (!this.isProduction) {
      console.log(`📊 Performance: ${name} = ${value.toFixed(2)}ms`);
      return;
    }

    // Send to analytics service
    this.sendAnalytics('performance', {
      metric: name,
      value,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  /**
   * Track errors
   */
  trackError(error: ErrorReport): void {
    if (!this.isProduction) {
      console.error('🚨 Error tracked:', error);
      return;
    }

    this.sendAnalytics('error', error);
  }

  /**
   * Track page views
   */
  trackPageView(path: string): void {
    const analytics: UserAnalytics = {
      pageView: path,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      referrer: document.referrer
    };

    if (!this.isProduction) {
      console.log('📄 Page view:', analytics);
      return;
    }

    this.sendAnalytics('pageview', analytics);
  }

  /**
   * Track custom events
   */
  trackEvent(event: string, data: Record<string, any>): void {
    const eventData = {
      event,
      data,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    if (!this.isProduction) {
      console.log('🎯 Event:', eventData);
      return;
    }

    this.sendAnalytics('event', eventData);
  }

  /**
   * Send performance report
   */
  private sendPerformanceReport(metrics: PerformanceMetrics): void {
    if (!this.isProduction) {
      console.log('📈 Performance Report:', metrics);
      return;
    }

    this.sendAnalytics('performance_report', {
      ...metrics,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  /**
   * Send analytics data
   */
  private async sendAnalytics(type: string, data: any): Promise<void> {
    try {
      if (!this.isProduction) return;

      // In production, send to analytics service
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  /**
   * Get session information
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime
    };
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// React hook for monitoring
export function useMonitoring() {
  return {
    trackEvent: monitoring.trackEvent.bind(monitoring),
    trackPageView: monitoring.trackPageView.bind(monitoring),
    trackError: monitoring.trackError.bind(monitoring),
    getSessionInfo: monitoring.getSessionInfo.bind(monitoring)
  };
}

// Higher-order component for error boundaries
export function withMonitoring<P extends object>(Component: React.ComponentType<P>) {
  return function MonitoredComponent(props: P) {
    React.useEffect(() => {
      const originalError = console.error;
      console.error = (...args) => {
        monitoring.trackError({
          message: args.join(' '),
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          sessionId: monitoring.getSessionInfo().sessionId
        });
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    }, []);

    return React.createElement(Component, props);
  };
}
