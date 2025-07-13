/**
 * Enterprise Monitoring System
 * Real-time performance tracking and analytics
 */

import React from 'react';

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
  lineNumber?: number;
  columnNumber?: number;
  timestamp: number;
  userAgent: string;
  userId?: string;
}

export interface UserAnalytics {
  sessionId: string;
  userId?: string;
  pageViews: number;
  interactions: number;
  timeOnSite: number;
  bounceRate: number;
}

class MonitoringService {
  private metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0
  };

  private errors: ErrorReport[] = [];
  private analytics: UserAnalytics = {
    sessionId: this.generateSessionId(),
    pageViews: 0,
    interactions: 0,
    timeOnSite: Date.now(),
    bounceRate: 0
  };

  constructor() {
    this.initializeWebVitals();
    this.initializeErrorTracking();
    this.initializeUserTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private initializeWebVitals() {
    if (typeof window === 'undefined') return;

    // Web Vitals tracking - graceful fallback if not available
    try {
      // Mock web vitals for demo - replace with real web-vitals in production
      const mockWebVitals = () => {
        setTimeout(() => {
          this.metrics.fcp = Math.random() * 1000;
          this.metrics.lcp = Math.random() * 2000;
          this.metrics.fid = Math.random() * 100;
          this.metrics.cls = Math.random() * 0.1;
          this.metrics.ttfb = Math.random() * 500;
          
          this.reportMetric('fcp', this.metrics.fcp);
          this.reportMetric('lcp', this.metrics.lcp);
          this.reportMetric('fid', this.metrics.fid);
          this.reportMetric('cls', this.metrics.cls);
          this.reportMetric('ttfb', this.metrics.ttfb);
        }, 1000);
      };
      
      mockWebVitals();
    } catch (error) {
      console.log('Web Vitals not available, using mock data');
    }
  }

  private initializeErrorTracking() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    });
  }

  private initializeUserTracking() {
    if (typeof window === 'undefined') return;

    // Track page views
    this.analytics.pageViews++;

    // Track interactions
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.analytics.interactions++;
      }, { passive: true });
    });

    // Track time on site
    window.addEventListener('beforeunload', () => {
      this.analytics.timeOnSite = Date.now() - this.analytics.timeOnSite;
      this.reportAnalytics();
    });
  }

  private reportMetric(name: string, value: number) {
    if (typeof window === 'undefined') return;

    // Send to analytics endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'performance',
        metric: name,
        value,
        timestamp: Date.now(),
        url: window.location.href
      })
    }).catch(() => {
      // Silent fail for analytics
    });
  }

  public reportError(error: ErrorReport) {
    this.errors.push(error);

    // Send to analytics endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'error',
        error,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Silent fail for analytics
    });
  }

  private reportAnalytics() {
    if (typeof window === 'undefined') return;

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'analytics',
        data: this.analytics,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Silent fail for analytics
    });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  public getAnalytics(): UserAnalytics {
    return { ...this.analytics };
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService();

// React hooks for monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(monitoring.getMetrics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(monitoring.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

export function useErrorMonitoring() {
  const [errors, setErrors] = React.useState<ErrorReport[]>(monitoring.getErrors());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setErrors(monitoring.getErrors());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return errors;
}

export default monitoring;
