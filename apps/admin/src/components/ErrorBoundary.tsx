'use client';

import { Component, type ReactNode } from 'react';

import { Button } from '@/components/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to analytics service
    // You can add Firebase Analytics logging here
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset !== undefined) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: undefined });
  };

  override render(): React.ReactNode {
    if (this.state.hasError === true) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-4">
          <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
            <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
            <p className="mb-4">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <Button variant="destructive" onClick={this.resetErrorBoundary}>
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}): React.ReactElement {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="mb-4">
          {error.message !== ''
            ? error.message
            : 'An unexpected error occurred.'}
        </p>
        <Button variant="destructive" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </div>
    </div>
  );
}
