import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from 'firebase/analytics';
import type { Analytics, AnalyticsCallOptions } from 'firebase/analytics';
import { getApp } from 'firebase/app';

export class AnalyticsService {
  static instance: AnalyticsService | null = null;
  analytics: Analytics | null = null;

  private constructor() {
    try {
      if (typeof window !== 'undefined') {
        this.analytics = getAnalytics(getApp());
      }
    } catch (error: unknown) {
      console.error('Failed to initialize Firebase Analytics:', error);
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  } /**
   * Track a custom event
   */
  public trackEvent(
    eventName: string,
    eventParams?: Record<string, string | number | boolean>,
    options?: AnalyticsCallOptions
  ): void {
    if (!this.analytics) return;

    try {
      logEvent(this.analytics, eventName, eventParams, options);
    } catch (error: unknown) {
      console.error(`Failed to log event "${eventName}":`, error);
    }
  }

  /**
   * Track page view
   */
  public trackPageView(pagePath: string, pageTitle?: string): void {
    this.trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle ?? pagePath,
      page_location: typeof window !== 'undefined' ? window.location.href : '',
    });
  }

  /**
   * Set current user ID for analytics
   */
  public setUserId(userId: string | null): void {
    if (!this.analytics || userId === null || userId.length === 0) return;

    try {
      const analytics = this.analytics; // Type assertion for non-null
      setUserId(analytics, userId);
    } catch (error: unknown) {
      console.error('Failed to set user ID:', error);
    }
  } /**
   * Set user properties
   */
  public setUserProperties(
    properties: Record<string, string | number | boolean>
  ): void {
    if (!this.analytics) return;

    try {
      setUserProperties(this.analytics, properties);
    } catch (error: unknown) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Track user authentication events
   */
  public trackAuthentication(method: string, success: boolean): void {
    this.trackEvent('login', {
      method,
      success,
    });
  }

  /**
   * Track form submission events
   */
  public trackFormSubmission(
    formName: string,
    success: boolean,
    formType?: string
  ): void {
    this.trackEvent('form_submit', {
      form_name: formName,
      success,
      form_type: formType ?? 'default',
    });
  }

  /**
   * Track user interaction with UI elements
   */ public trackInteraction(
    elementName: string,
    interactionType: 'click' | 'hover' | 'scroll' | 'input' | 'focus' | 'blur',
    additionalParams?: Record<string, string | number | boolean>
  ): void {
    this.trackEvent('user_interaction', {
      element_name: elementName,
      interaction_type: interactionType,
      ...additionalParams,
    });
  }

  /**
   * Track errors that occur in the application
   */
  public trackError(
    errorMessage: string,
    errorCode?: string,
    errorContext?: string
  ): void {
    this.trackEvent('app_error', {
      error_message: errorMessage,
      error_code: errorCode ?? 'unknown',
      error_context: errorContext ?? 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track feature usage
   */
  public trackFeatureUsage(
    featureName: string,
    featureCategory?: string
  ): void {
    this.trackEvent('feature_use', {
      feature_name: featureName,
      feature_category: featureCategory ?? 'uncategorized',
    });
  }
}
