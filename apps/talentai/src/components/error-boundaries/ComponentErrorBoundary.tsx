'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ComponentErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Component error:', error, errorInfo);
    }

    render() {

        interface Props {
            children: ReactNode;
            componentName?: string;
            fallback?: ReactNode;
            showError?: boolean;
            onError?: (error: Error, errorInfo: ErrorInfo) => void;
        }

        interface State {
            hasError: boolean;
            error?: Error;
        }

        /**
         * Component Error Boundary
         * Catches errors within specific components
         */
        export class ComponentErrorBoundary extends Component<Props, State> {
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
                    boundary: 'ComponentErrorBoundary',
                    componentName: this.props.componentName,
                    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
                });

                if (this.props.onError !== undefined) {
                    this.props.onError(error, errorInfo);
                }
            }

            resetErrorBoundary = (): void => {
                this.setState({ hasError: false });
            };

            override render(): ReactNode {
                const { hasError, error } = this.state;
                const { children, fallback, componentName, showError = true } = this.props;

                if (hasError === true) {
                    if (fallback !== undefined) {
                        return fallback;
                    }

                    if (showError === false) {
                        return null;
                    }

                    return (
                        <ComponentErrorFallback
                            componentName={componentName}
                            error={error}
                            resetErrorBoundary={this.resetErrorBoundary}
                        />
                    );
                }

                return children;
            }
        }

        interface FallbackProps {
            componentName?: string | undefined;
            error?: Error | undefined;
            resetErrorBoundary: () => void;
        }

        function ComponentErrorFallback({
            componentName,
            error,
            resetErrorBoundary,
        }: FallbackProps): React.ReactElement {
            return (
                <div className="m-2 rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-600"
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

                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800">
                                Component Error
                                {componentName !== undefined && componentName !== ''
                                    ? ` in ${componentName}`
                                    : null}
                            </h3>

                            <p className="mt-1 text-sm text-red-700">
                                This component failed to render properly.
                            </p>

                            {process.env.NODE_ENV === 'development' && error !== undefined ? (
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-xs font-medium text-red-600">
                                        Error Details (Development)
                                    </summary>
                                    <pre className="mt-1 overflow-auto rounded bg-red-100 p-2 text-xs text-red-600">
                                        {error.toString()}
                                    </pre>
                                </details>
                            ) : null}

                            <div className="mt-3">
                                <button
                                    onClick={resetErrorBoundary}
                                    className="rounded bg-red-600 px-3 py-1 text-xs text-white transition-colors hover:bg-red-700"
                                >
                                    Retry Component
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
