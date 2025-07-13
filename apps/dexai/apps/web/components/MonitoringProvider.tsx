/**
 * Monitoring Provider Component
 * Context provider for enterprise monitoring system
 */

'use client';

import React from 'react';
import { ErrorReport, monitoring, PerformanceMetrics, UserAnalytics } from '../lib/monitoring';

interface MonitoringContextType {
  metrics: PerformanceMetrics;
  errors: ErrorReport[];
  analytics: UserAnalytics;
  reportError: (error: ErrorReport) => void;
  clearErrors: () => void;
}

const MonitoringContext = React.createContext<MonitoringContextType | undefined>(undefined);

interface MonitoringProviderProps {
  children: React.ReactNode;
  enableReporting?: boolean;
  reportingInterval?: number;
}

export function MonitoringProvider({ 
  children, 
  enableReporting = true,
  reportingInterval = 30000 
}: MonitoringProviderProps) {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(monitoring.getMetrics());
  const [errors, setErrors] = React.useState<ErrorReport[]>(monitoring.getErrors());
  const [analytics, setAnalytics] = React.useState<UserAnalytics>(monitoring.getAnalytics());

  // Update monitoring data periodically
  React.useEffect(() => {
    if (!enableReporting) return;

    const interval = setInterval(() => {
      setMetrics(monitoring.getMetrics());
      setErrors(monitoring.getErrors());
      setAnalytics(monitoring.getAnalytics());
    }, reportingInterval);

    return () => clearInterval(interval);
  }, [enableReporting, reportingInterval]);

  // Initialize monitoring on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set up global error handlers
    const handleUnhandledError = (event: ErrorEvent) => {
      monitoring.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      monitoring.reportError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    };

    // Add listeners
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const reportError = React.useCallback((error: ErrorReport) => {
    monitoring.reportError(error);
    setErrors(monitoring.getErrors());
  }, []);

  const clearErrors = React.useCallback(() => {
    // This would clear errors from the monitoring system
    // For now, we'll just update our local state
    setErrors([]);
  }, []);

  const contextValue = React.useMemo(() => ({
    metrics,
    errors,
    analytics,
    reportError,
    clearErrors
  }), [metrics, errors, analytics, reportError, clearErrors]);

  return (
    <MonitoringContext.Provider value={contextValue}>
      {children}
    </MonitoringContext.Provider>
  );
}

// Hook to use monitoring context
export function useMonitoring(): MonitoringContextType {
  const context = React.useContext(MonitoringContext);
  
  if (context === undefined) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  
  return context;
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  const { metrics } = useMonitoring();
  
  return {
    ...metrics,
    getPerformanceScore: () => {
      const { fcp, lcp, fid, cls } = metrics;
      
      // Calculate a simple performance score (0-100)
      let score = 100;
      
      // FCP penalty (good < 1800ms)
      if (fcp > 1800) score -= Math.min(20, (fcp - 1800) / 100);
      
      // LCP penalty (good < 2500ms)
      if (lcp > 2500) score -= Math.min(25, (lcp - 2500) / 200);
      
      // FID penalty (good < 100ms)
      if (fid > 100) score -= Math.min(25, (fid - 100) / 10);
      
      // CLS penalty (good < 0.1)
      if (cls > 0.1) score -= Math.min(30, (cls - 0.1) * 100);
      
      return Math.max(0, Math.round(score));
    }
  };
}

// Hook for error monitoring
export function useErrorMonitoring() {
  const { errors, reportError, clearErrors } = useMonitoring();
  
  return {
    errors,
    reportError,
    clearErrors,
    errorCount: errors.length,
    hasErrors: errors.length > 0,
    latestError: errors[errors.length - 1] || null
  };
}

// Hook for analytics
export function useAnalytics() {
  const { analytics } = useMonitoring();
  
  const trackEvent = React.useCallback((eventName: string, properties?: Record<string, any>) => {
    // Send custom event to analytics
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event',
          event: eventName,
          properties,
          timestamp: Date.now(),
          url: window.location.href
        })
      }).catch(() => {
        // Silent fail for analytics
      });
    }
  }, []);
  
  const trackPageView = React.useCallback((pageName?: string) => {
    trackEvent('page_view', {
      page: pageName || window.location.pathname,
      title: document.title
    });
  }, [trackEvent]);
  
  return {
    ...analytics,
    trackEvent,
    trackPageView
  };
}

export default MonitoringProvider;
