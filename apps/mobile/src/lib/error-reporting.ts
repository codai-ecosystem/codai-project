/**
 * Error Reporting Utilities
 * Centralized error reporting and analytics
 */

export interface ErrorContext {
  boundary?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  timestamp?: string;
  componentStack?: string | null;
  digest?: string | null;
  [key: string]: unknown;
}

export interface ErrorReport {
  message: string;
  stack: string;
  name: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

interface SentryScope {
  setLevel: (level: string) => void;
  setContext: (key: string, context: Record<string, unknown>) => void;
  setTag: (key: string, value: string) => void;
}

interface SentryInterface {
  withScope: (callback: (scope: SentryScope) => void) => void;
  captureException: (error: Error) => void;
}

interface WindowWithSentry extends Window {
  Sentry?: SentryInterface;
  gtag?: (...args: unknown[]) => void;
}

class ErrorReporter {
  private readonly isDevelopment = process.env['NODE_ENV'] === 'development';
  private readonly isClient = typeof window !== 'undefined';

  /**
   * Report an error with context
   */
  async reportError(error: Error, context: ErrorContext = {}): Promise<void> {
    // Don't report in development unless explicitly enabled
    const enableReporting = process.env['NEXT_PUBLIC_ENABLE_ERROR_REPORTING'];
    if (
      this.isDevelopment &&
      (enableReporting == null ||
        enableReporting === '' ||
        enableReporting === 'false')
    ) {
      console.error('Error (dev mode):', error, context);
      return;
    }
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack ?? '',
      name: error.name,
      context: {
        url: this.isClient ? window.location.href : (context.url ?? ''),
        userAgent: this.isClient
          ? window.navigator.userAgent
          : (context.userAgent ?? ''),
        timestamp: new Date().toISOString(),
        ...context,
      },
      severity:
        'severity' in context
          ? (context['severity'] as ErrorReport['severity'])
          : this.determineSeverity(error, context),
      tags: this.generateTags(error, context),
    };

    // Log to console
    this.logToConsole(errorReport);

    // Report to external services
    await Promise.allSettled([
      this.reportToSentry(errorReport),
      this.reportToAnalytics(errorReport),
      this.reportToCustomEndpoint(errorReport),
    ]);
  }

  /**
   * Report a custom error with context
   */
  async reportCustomError(
    message: string,
    context: ErrorContext = {},
    severity: ErrorReport['severity'] = 'medium'
  ): Promise<void> {
    const error = new Error(message);
    error.name = 'CustomError';

    await this.reportError(error, { ...context, severity });
  }

  /**
   * Report performance issues
   */
  async reportPerformanceIssue(
    metric: string,
    value: number,
    threshold: number,
    context: ErrorContext = {}
  ): Promise<void> {
    const message = `Performance threshold exceeded: ${metric} (${value} > ${threshold})`;
    await this.reportCustomError(
      message,
      {
        ...context,
        metric,
        value,
        threshold,
        type: 'performance',
      },
      'medium'
    );
  }

  /**
   * Report user feedback or issues
   */
  async reportUserIssue(
    description: string,
    category: string,
    context: ErrorContext = {}
  ): Promise<void> {
    await this.reportCustomError(
      description,
      {
        ...context,
        category,
        type: 'user-report',
      },
      'low'
    );
  }

  private determineSeverity(
    error: Error,
    context: ErrorContext
  ): ErrorReport['severity'] {
    // Critical: Authentication or payment errors
    if (error.message.includes('auth') || error.message.includes('payment')) {
      return 'critical';
    }

    // High: Database or API errors
    if (error.message.includes('database') || error.message.includes('API')) {
      return 'high';
    }

    // High: Component render errors in production
    if (context.boundary != null && !this.isDevelopment) {
      return 'high';
    }

    // Medium: Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'medium';
    }

    // Default to medium
    return 'medium';
  }

  private generateTags(error: Error, context: ErrorContext): string[] {
    const tags: string[] = [];

    // Environment tags
    const nodeEnv = 'development';
    tags.push(`env:${nodeEnv}`);

    // Error type tags
    tags.push(`error:${error.name}`);

    // Boundary tags
    if (context.boundary != null && context.boundary !== '') {
      tags.push(`boundary:${context.boundary}`);
    }

    // Browser tags
    if (this.isClient) {
      const browser = this.detectBrowser();
      if (browser != null && browser !== '') {
        tags.push(`browser:${browser}`);
      }
    }

    // Custom context tags
    const contextType = context['type'];
    if (contextType != null && contextType !== '') {
      tags.push(`type:${contextType}`);
    }

    return tags;
  }

  private detectBrowser(): string | null {
    if (!this.isClient) return null;

    const userAgent = window.navigator.userAgent;

    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';

    return 'unknown';
  }

  private logToConsole(errorReport: ErrorReport): void {
    const style = {
      critical: 'color: #dc2626; font-weight: bold;',
      high: 'color: #ea580c; font-weight: bold;',
      medium: 'color: #d97706;',
      low: 'color: #65a30d;',
    }[errorReport.severity];

    console.group(
      `%c🚨 Error Report [${errorReport.severity.toUpperCase()}]`,
      style
    );
    console.error('Message:', errorReport.message);
    console.error('Stack:', errorReport.stack);
    console.log('Context:', errorReport.context);
    console.log('Tags:', errorReport.tags);
    console.groupEnd();
  }

  private reportToSentry(errorReport: ErrorReport): void {
    try {
      if (
        typeof window !== 'undefined' &&
        (window as WindowWithSentry).Sentry
      ) {
        const Sentry = (window as WindowWithSentry).Sentry!;

        Sentry.withScope((scope: SentryScope) => {
          scope.setLevel(errorReport.severity);
          scope.setContext('errorReport', errorReport.context);

          for (const tag of errorReport.tags) {
            const [key, value] = tag.split(':');
            if (key != null && key !== '' && value != null && value !== '') {
              scope.setTag(key, value);
            }
          }

          Sentry.captureException(new Error(errorReport.message));
        });
      }
    } catch (error: unknown) {
      console.error('Failed to report to Sentry:', error);
    }
  }

  private reportToAnalytics(errorReport: ErrorReport): void {
    try {
      if (typeof window !== 'undefined' && (window as WindowWithSentry).gtag) {
        const gtag = (window as WindowWithSentry).gtag!;

        gtag('event', 'exception', {
          description: errorReport.message,
          fatal: errorReport.severity === 'critical',
          custom_map: {
            severity: errorReport.severity,
            error_name: errorReport.name,
          },
        });
      }
    } catch (error: unknown) {
      console.error('Failed to report to Analytics:', error);
    }
  }

  private async reportToCustomEndpoint(
    errorReport: ErrorReport
  ): Promise<void> {
    try {
      const endpoint = process.env['NEXT_PUBLIC_ERROR_ENDPOINT'];
      if (endpoint != null && endpoint !== '') {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport),
        });
      }
    } catch (error: unknown) {
      console.error('Failed to report to custom endpoint:', error);
    }
  }
}

// Export singleton instance
export const errorReporter = new ErrorReporter();

// Export convenience functions
export const reportError = (
  error: Error,
  context?: ErrorContext
): Promise<void> => errorReporter.reportError(error, context);

export const reportCustomError = (
  message: string,
  context?: ErrorContext,
  severity?: ErrorReport['severity']
): Promise<void> => errorReporter.reportCustomError(message, context, severity);

export const reportPerformanceIssue = (
  metric: string,
  value: number,
  threshold: number,
  context?: ErrorContext
): Promise<void> =>
  errorReporter.reportPerformanceIssue(metric, value, threshold, context);

export const reportUserIssue = (
  description: string,
  category: string,
  context?: ErrorContext
): Promise<void> =>
  errorReporter.reportUserIssue(description, category, context);
