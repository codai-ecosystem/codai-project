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

export class RouteErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Route error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                    <h3 className="text-sm font-medium text-red-800">
                        Route Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                        There was an error loading this page.
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
