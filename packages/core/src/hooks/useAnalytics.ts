import { useEffect, useState, useCallback } from 'react';
import { analyticsService, TrackingEvent } from '../services/analytics';

export interface AnalyticsData {
  pageViews: number;
  uniqueUsers: number;
  sessions: number;
  avgSessionDuration: number;
  topPages: Array<{ path: string; views: number }>;
  userFlow: Array<{ from: string; to: string; count: number }>;
  aiInteractions: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  };
  performanceMetrics: {
    loadTime: number;
    renderTime: number;
    apiResponseTime: number;
  };
}

export function useAnalytics() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  // Track page view
  const trackPageView = useCallback((path: string, title?: string) => {
    if (!isEnabled) return;

    analyticsService.track({
      name: 'page_view',
      properties: {
        path,
        title,
        timestamp: Date.now(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        referrer: typeof window !== 'undefined' ? document.referrer : ''
      }
    });
  }, [isEnabled]);

  // Track custom event
  const trackEvent = useCallback((event: TrackingEvent) => {
    if (!isEnabled) return;

    analyticsService.track({
      ...event,
      timestamp: Date.now()
    });
  }, [isEnabled]);

  // Track AI interaction
  const trackAIInteraction = useCallback((
    type: 'chat' | 'completion' | 'review',
    provider: string,
    success: boolean,
    responseTime?: number,
    error?: string
  ) => {
    if (!isEnabled) return;

    trackEvent({
      name: 'ai_interaction',
      properties: {
        type,
        provider,
        success,
        responseTime,
        error,
        timestamp: Date.now()
      }
    });
  }, [isEnabled, trackEvent]);

  // Track user action
  const trackUserAction = useCallback((
    action: string,
    context?: Record<string, any>
  ) => {
    if (!isEnabled) return;

    trackEvent({
      name: 'user_action',
      properties: {
        action,
        ...context,
        timestamp: Date.now()
      }
    });
  }, [isEnabled, trackEvent]);

  // Track performance metric
  const trackPerformance = useCallback((
    metric: string,
    value: number,
    unit: string = 'ms'
  ) => {
    if (!isEnabled) return;

    trackEvent({
      name: 'performance_metric',
      properties: {
        metric,
        value,
        unit,
        timestamp: Date.now()
      }
    });
  }, [isEnabled, trackEvent]);

  // Get analytics data
  const getAnalyticsData = useCallback(async (
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ) => {
    if (!isEnabled) return null;

    setLoading(true);
    try {
      const analyticsData = await analyticsService.getInsights(timeRange);
      setData(analyticsData);
      return analyticsData;
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isEnabled]);

  // Auto-track page views in React Router or Next.js
  useEffect(() => {
    if (typeof window === 'undefined' || !isEnabled) return;

    const currentPath = window.location.pathname;
    trackPageView(currentPath, document.title);

    // Listen for navigation changes (for SPA)
    const handleNavigation = () => {
      const newPath = window.location.pathname;
      trackPageView(newPath, document.title);
    };

    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [isEnabled, trackPageView]);

  return {
    isEnabled,
    setIsEnabled,
    data,
    loading,
    trackPageView,
    trackEvent,
    trackAIInteraction,
    trackUserAction,
    trackPerformance,
    getAnalyticsData
  };
}

// Hook for real-time analytics dashboard
export function useAnalyticsDashboard() {
  const { data, loading, getAnalyticsData } = useAnalytics();
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh analytics data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      getAnalyticsData();
    }, refreshInterval);

    // Initial load
    getAnalyticsData();

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, getAnalyticsData]);

  const refreshNow = useCallback(() => {
    getAnalyticsData();
  }, [getAnalyticsData]);

  return {
    data,
    loading,
    refreshInterval,
    setRefreshInterval,
    autoRefresh,
    setAutoRefresh,
    refreshNow
  };
}

// Hook for A/B testing
export function useABTest(testName: string, variants: string[]) {
  const [variant, setVariant] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Simple hash-based variant assignment
    const userId = localStorage.getItem('userId') || 'anonymous';
    const hash = btoa(testName + userId).split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const variantIndex = Math.abs(hash) % variants.length;
    const selectedVariant = variants[variantIndex];

    setVariant(selectedVariant);

    // Track A/B test assignment
    trackEvent({
      name: 'ab_test_assignment',
      properties: {
        testName,
        variant: selectedVariant,
        userId
      }
    });
  }, [testName, variants, trackEvent]);

  const trackConversion = useCallback((conversionType: string, value?: number) => {
    if (!variant) return;

    trackEvent({
      name: 'ab_test_conversion',
      properties: {
        testName,
        variant,
        conversionType,
        value
      }
    });
  }, [testName, variant, trackEvent]);

  return {
    variant,
    trackConversion
  };
}
