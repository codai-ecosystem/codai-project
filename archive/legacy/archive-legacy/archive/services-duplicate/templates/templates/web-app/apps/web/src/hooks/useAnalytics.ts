'use client';

import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { getApp } from 'firebase/app';
import { useCallback, useEffect } from 'react';

import { useAuthStore } from '@/stores/auth';

// Keep a single instance of analytics
let analytics: Analytics | null = null;

interface UseAnalyticsReturn {
  trackPageView: (pagePath: string, pageTitle?: string) => void;
  trackEvent: (
    eventName: string,
    eventParams?: Record<string, string | number | boolean>
  ) => void;
  trackAuthentication: (method: string, success: boolean) => void;
  trackFormSubmission: (
    formName: string,
    success: boolean,
    formType?: string
  ) => void;
  trackError: (
    errorMessage: string,
    errorCode?: string,
    errorContext?: string
  ) => void;
  trackFeatureUsage: (featureName: string, featureCategory?: string) => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const { user } = useAuthStore();

  // Initialize analytics
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      analytics = getAnalytics(getApp());

      if (user !== null) {
        setUserId(analytics, user.id); // Set user properties
        setUserProperties(analytics, {
          user_id: user.id,
          user_email_verified: user.emailVerified,
        });
      }
    } catch (error: unknown) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }, [user]);

  // Track page views
  const trackPageView = useCallback((pagePath: string, pageTitle?: string) => {
    if (!analytics) return;

    try {
      logEvent(analytics, 'page_view', {
        page_path: pagePath,
        page_title: pageTitle ?? pagePath,
        page_location:
          typeof window !== 'undefined' ? window.location.href : '',
      });
    } catch (error: unknown) {
      console.error('Failed to track page view:', error);
    }
  }, []); // Track custom events
  const trackEvent = useCallback(
    (
      eventName: string,
      eventParams?: Record<string, string | number | boolean>
    ) => {
      if (!analytics) return;

      try {
        logEvent(analytics, eventName, eventParams);
      } catch (error: unknown) {
        console.error(`Failed to track event "${eventName}":`, error);
      }
    },
    []
  );

  // Track user authentication
  const trackAuthentication = useCallback(
    (method: string, success: boolean) => {
      if (!analytics) return;

      try {
        logEvent(analytics, 'login', {
          method,
          success,
        });
      } catch (error: unknown) {
        console.error('Failed to track authentication:', error);
      }
    },
    []
  );

  // Track form submissions
  const trackFormSubmission = useCallback(
    (formName: string, success: boolean, formType?: string) => {
      if (!analytics) return;

      try {
        logEvent(analytics, 'form_submit', {
          form_name: formName,
          success,
          form_type: formType ?? 'default',
        });
      } catch (error: unknown) {
        console.error('Failed to track form submission:', error);
      }
    },
    []
  );

  // Track errors
  const trackError = useCallback(
    (errorMessage: string, errorCode?: string, errorContext?: string) => {
      if (!analytics) return;

      try {
        logEvent(analytics, 'app_error', {
          error_message: errorMessage,
          error_code: errorCode ?? 'unknown',
          error_context: errorContext ?? 'unknown',
          timestamp: new Date().toISOString(),
        });
      } catch (error: unknown) {
        console.error('Failed to track error:', error);
      }
    },
    []
  );

  // Track feature usage
  const trackFeatureUsage = useCallback(
    (featureName: string, featureCategory?: string) => {
      if (!analytics) return;

      try {
        logEvent(analytics, 'feature_use', {
          feature_name: featureName,
          feature_category: featureCategory ?? 'uncategorized',
        });
      } catch (error: unknown) {
        console.error('Failed to track feature usage:', error);
      }
    },
    []
  );

  return {
    trackPageView,
    trackEvent,
    trackAuthentication,
    trackFormSubmission,
    trackError,
    trackFeatureUsage,
  };
}
