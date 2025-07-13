/**
 * Enterprise Error Boundary Component
 * Advanced error handling with monitoring integration
 */

'use client';

import React from 'react';
import { monitoring } from '../lib/monitoring';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorId: string; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId || `error_${Date.now()}`;
    
    // Report to monitoring system
    monitoring.reportError({
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      // Add React-specific info
      ...(errorInfo.componentStack && { 
        componentStack: errorInfo.componentStack 
      })
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error} 
            errorId={this.state.errorId || 'unknown'} 
            retry={this.retry} 
          />
        );
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorId={this.state.errorId || 'unknown'}
          retry={this.retry}
          isDevelopment={process.env.NODE_ENV === 'development'}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  errorId: string;
  retry: () => void;
  isDevelopment: boolean;
  errorInfo: React.ErrorInfo | null;
}

function DefaultErrorFallback({ 
  error, 
  errorId, 
  retry, 
  isDevelopment, 
  errorInfo 
}: DefaultErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Oops! Something went wrong
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            We're sorry, but something unexpected happened. Our team has been notified.
          </p>
          
          <p className="mt-1 text-xs text-gray-500">
            Error ID: {errorId}
          </p>
        </div>

        <div className="space-y-4">
          {/* Retry Button */}
          <button
            onClick={retry}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>

          {/* Go Home Button */}
          <button
            onClick={() => window.location.href = '/'}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Homepage
          </button>

          {/* Details Toggle (Development only) */}
          {isDevelopment && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {showDetails ? 'Hide' : 'Show'} Error Details
            </button>
          )}
        </div>

        {/* Error Details (Development only) */}
        {isDevelopment && showDetails && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Error Details:</h3>
            <div className="text-xs text-gray-700 space-y-2">
              <div>
                <strong>Message:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
              </div>
              
              {error.stack && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </div>
              )}
              
              {errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Support Message */}
        <div className="text-center text-sm text-gray-500">
          <p>
            If this problem persists, please{' '}
            <a 
              href="mailto:support@dexai.com" 
              className="text-blue-600 hover:text-blue-500"
            >
              contact support
            </a>
            {' '}and include the error ID above.
          </p>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for easy wrapping
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
  return React.useCallback((error: Error, errorInfo?: any) => {
    monitoring.reportError({
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ...errorInfo
    });
  }, []);
}

export default ErrorBoundary;
