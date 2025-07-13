'use client';

import Link from 'next/link';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reportError } from '@/lib/error-reporting';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number | boolean | undefined | null>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Root Error Boundary
 * Catches all unhandled errors in the application
 */
export class RootErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | undefined = undefined;

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
    // Report error to monitoring service
    reportError(error, {
      ...errorInfo,
      boundary: 'RootErrorBoundary',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    });

    // Call custom error handler
    if (this.props.onError !== undefined) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  override componentDidUpdate(prevProps: Props): void {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError === true && prevProps.resetKeys !== resetKeys) {
      if (
        resetKeys?.some((item, idx) => item !== prevProps.resetKeys?.[idx]) ===
        true
      ) {
        this.resetErrorBoundary();
      }
    }

    if (
      hasError === true &&
      resetOnPropsChange === true &&
      prevProps.children !== this.props.children
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    if (this.resetTimeoutId !== undefined) {
      window.clearTimeout(this.resetTimeoutId);
    }
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
      });
    }, 100);
  };

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError === true) {
      if (fallback !== undefined) {
        return fallback;
      }

      return (
        <RootErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
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

function RootErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps): React.ReactElement {
  const handleReload = (): void => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
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

        <h1 className="mb-2 text-center text-xl font-semibold text-gray-900">
          Something went wrong
        </h1>

        <p className="mb-6 text-center text-gray-600">
          We&apos;re sorry! An unexpected error occurred. Our team has been
          notified.
        </p>

        {process.env.NODE_ENV === 'development' && error !== undefined ? (
          <details className="mb-4 rounded bg-gray-100 p-3 text-sm">
            <summary className="mb-2 cursor-pointer font-medium text-gray-700">
              Error Details (Development Only)
            </summary>
            <pre className="overflow-auto text-xs text-gray-600">
              {error.toString()}
              {error.stack !== undefined && error.stack !== ''
                ? `\n\n${error.stack}`
                : null}
            </pre>
          </details>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try again
          </button>
          <button
            onClick={handleReload}
            className="flex-1 rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            Reload page
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
