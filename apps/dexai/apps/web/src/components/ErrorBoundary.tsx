/**
 * Advanced Error Boundary Component
 * Enterprise-grade error handling with monitoring integration
 */

'use client';

import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react';
import React from 'react';
import { monitoring } from '../lib/monitoring';

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface ErrorDisplayProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
  onRetry: () => void;
  showDetails: boolean;
  level: 'page' | 'component' | 'critical';
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = this.generateEventId();
    
    this.setState({
      errorInfo,
      eventId
    });

    // Track error with monitoring system
    monitoring.trackError({
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: Date.now(),
      sessionId: monitoring.getSessionInfo().sessionId
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Event ID:', eventId);
      console.groupEnd();
    }
  }

  private generateEventId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null
      });

      // Track retry attempt
      monitoring.trackEvent('error_retry', {
        attempt: this.retryCount,
        maxRetries: this.maxRetries,
        error: this.state.error?.message
      });
    }
  };

  private handleReset = () => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            reset={this.handleReset}
          />
        );
      }

      // Default error display
      return (
        <ErrorDisplay
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          eventId={this.state.eventId}
          onRetry={this.handleRetry}
          showDetails={this.props.showDetails ?? process.env.NODE_ENV === 'development'}
          level={this.props.level ?? 'component'}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorDisplay({ 
  error, 
  errorInfo, 
  eventId, 
  onRetry, 
  showDetails, 
  level 
}: ErrorDisplayProps) {
  const [showStack, setShowStack] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopyError = async () => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      eventId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.log('Error report:', errorReport);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const getErrorSeverityColor = () => {
    switch (level) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'page':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-yellow-500 bg-yellow-50';
    }
  };

  const getErrorIcon = () => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
      case 'page':
        return <AlertTriangle className="h-8 w-8 text-orange-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${getErrorSeverityColor()}`}>
      <div className="flex items-start space-x-4">
        {getErrorIcon()}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {level === 'critical' 
              ? 'Critical Error Occurred'
              : level === 'page'
              ? 'Page Error'
              : 'Something went wrong'
            }
          </h3>
          
          <p className="text-gray-600 mb-4">
            {level === 'critical' 
              ? 'A critical error has occurred that prevents the application from functioning properly.'
              : level === 'page'
              ? 'An error occurred while loading this page.'
              : 'An unexpected error occurred in this component.'
            }
          </p>

          {showDetails && (
            <div className="space-y-3">
              <div className="bg-white rounded p-3 border">
                <p className="font-mono text-sm text-red-600 break-all">
                  {error.message}
                </p>
              </div>

              {eventId && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Error ID:</span> {eventId}
                </div>
              )}

              {error.stack && (
                <div>
                  <button
                    onClick={() => setShowStack(!showStack)}
                    className="text-sm text-blue-600 hover:text-blue-800 mb-2"
                  >
                    {showStack ? 'Hide' : 'Show'} Stack Trace
                  </button>
                  
                  {showStack && (
                    <div className="bg-gray-100 rounded p-3 overflow-x-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>

            {level === 'page' && (
              <button
                onClick={handleReload}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </button>
            )}

            {level !== 'component' && (
              <button
                onClick={handleGoHome}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </button>
            )}

            {showDetails && (
              <button
                onClick={handleCopyError}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Bug className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Error'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for error reporting
export function useErrorHandler() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    monitoring.trackError({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: monitoring.getSessionInfo().sessionId
    });

    monitoring.trackEvent('manual_error_report', {
      context: context || 'unknown',
      error: error.message
    });
  }, []);

  return { reportError };
}

// Global error handler setup
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    monitoring.trackError({
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: monitoring.getSessionInfo().sessionId
    });

    console.error('Unhandled promise rejection:', event.reason);
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    monitoring.trackError({
      message: event.message,
      stack: event.error?.stack,
      url: event.filename || window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: monitoring.getSessionInfo().sessionId
    });
  });

  console.log('🛡️ Global error handling initialized');
}
