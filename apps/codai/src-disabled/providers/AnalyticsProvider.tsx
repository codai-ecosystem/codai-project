'use client';

import { usePathname } from 'next/navigation';
import type { JSX } from 'react';
import { useEffect, type ReactNode } from 'react';

import { logger } from '@/lib/logger';

// Note: We dynamically import because this hook uses browser-only Firebase features
let useAnalytics:
  | (() => {
      trackPageView: (pagePath: string, pageTitle?: string) => void;
      trackEvent: (name: string, parameters?: Record<string, unknown>) => void;
      trackAuthentication: (method: string, success: boolean) => void;
      trackFormSubmission: (
        formName: string,
        success: boolean,
        error?: string
      ) => void;
      trackError: (error: Error, context?: Record<string, unknown>) => void;
      trackFeatureUsage: (
        feature: string,
        action: string,
        value?: number
      ) => void;
    })
  | null = null;
if (typeof window !== 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const hooks = require('@/hooks') as { useAnalytics: typeof useAnalytics };
    useAnalytics = hooks.useAnalytics;
  } catch (error: unknown) {
    logger.warn('Could not load analytics hooks', { context: { error } });
  }
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({
  children,
}: AnalyticsProviderProps): JSX.Element {
  const pathname = usePathname(); // Always call hooks at the top level
  const analytics = useAnalytics?.();

  // Track page views when the route changes
  useEffect(() => {
    if (!analytics) return;

    // Use pathname from Next.js router
    const pagePath = pathname || '';
    // Extract page title based on the last segment of the path
    // e.g., "/dashboard/settings" becomes "Settings"
    const segments = pagePath.split('/').filter(Boolean);
    const pageTitle =
      segments.length > 0
        ? (segments[segments.length - 1] ?? '').charAt(0).toUpperCase() +
          (segments[segments.length - 1] ?? '').slice(1)
        : 'Home';

    // Track the page view
    analytics.trackPageView(pagePath, pageTitle); // Log in development mode
    if (process.env['NODE_ENV'] === 'development') {
      logger.info('Analytics page view tracked', {
        context: { pageTitle, pagePath },
      });
    }
  }, [pathname, analytics]);

  return <>{children}</>;
}
