'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reportError } from '@/lib/error-reporting';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Route Error Boundary
 * Catches errors within specific routes/pages
 */
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, {
      ...errorInfo,
      boundary: 'RouteErrorBoundary',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    });

    if (this.props.onError !== undefined) {
      this.props.onError(error, errorInfo);
    }
  }

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError === true) {
      if (fallback !== undefined) {
        return fallback;
      }

      return (
        <RouteErrorFallback
          error={error}
          resetErrorBoundary={() => this.setState({ hasError: false })}
        />
      );
    }

    return children;
  }
}

interface FallbackProps {
  error?: Error | undefined;
  resetErrorBoundary: () => void;
}

function RouteErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps): React.ReactElement {
  const handleGoBack = (): void => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <svg
            className="h-8 w-8 text-yellow-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-gray-900">Page Error</h2>

        <p className="mb-4 text-gray-600">
          This page encountered an error. Please try refreshing or go back.
        </p>

        {process.env.NODE_ENV === 'development' && error !== undefined ? (
          <details className="mb-4 rounded bg-gray-100 p-3 text-left text-sm">
            <summary className="mb-2 cursor-pointer font-medium text-gray-700">
              Error Details
            </summary>
            <pre className="overflow-auto text-xs text-gray-600">
              {error.toString()}
            </pre>
          </details>
        ) : null}

        <div className="flex justify-center gap-3">
          <button
            onClick={resetErrorBoundary}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={handleGoBack}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
