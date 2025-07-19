'use client'

import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "./Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card"
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react"

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

export interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{
        error?: Error
        resetError: () => void
        errorInfo?: React.ErrorInfo
    }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    className?: string
    showDetails?: boolean
    showRetry?: boolean
    showHome?: boolean
    title?: string
    description?: string
    resetKeys?: Array<string | number>
}

const DefaultErrorFallback: React.FC<{
    error?: Error
    resetError: () => void
    errorInfo?: React.ErrorInfo
    showDetails?: boolean
    showRetry?: boolean
    showHome?: boolean
    title?: string
    description?: string
    className?: string
}> = ({
    error,
    resetError,
    errorInfo,
    showDetails = false,
    showRetry = true,
    showHome = true,
    title = "Something went wrong",
    description = "An unexpected error occurred. Please try again or contact support if the problem persists.",
    className
}) => {
        const [showErrorDetails, setShowErrorDetails] = React.useState(false)

        return (
            <div className={cn(
                "flex items-center justify-center min-h-[400px] p-4",
                className
            )}>
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <CardTitle className="text-xl">{title}</CardTitle>
                        <CardDescription className="text-center">
                            {description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                            {showRetry && (
                                <Button onClick={resetError} className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                            )}
                            {showHome && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/'}
                                    className="gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Go Home
                                </Button>
                            )}
                        </div>

                        {(showDetails && error) && (
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                                    className="gap-2 text-xs"
                                >
                                    <Bug className="h-3 w-3" />
                                    {showErrorDetails ? 'Hide' : 'Show'} Error Details
                                </Button>

                                {showErrorDetails && (
                                    <div className="rounded-md bg-muted p-3 text-xs font-mono">
                                        <div className="text-destructive font-semibold mb-2">
                                            {error.name}: {error.message}
                                        </div>
                                        {error.stack && (
                                            <pre className="whitespace-pre-wrap text-muted-foreground overflow-auto max-h-32">
                                                {error.stack}
                                            </pre>
                                        )}
                                        {errorInfo?.componentStack && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-muted-foreground">
                                                    Component Stack
                                                </summary>
                                                <pre className="whitespace-pre-wrap text-muted-foreground text-xs mt-1">
                                                    {errorInfo.componentStack}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    }

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private resetTimeoutId?: number

    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        })

        // Call onError prop if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        const { resetKeys } = this.props
        const { hasError } = this.state

        if (hasError && prevProps.resetKeys !== resetKeys) {
            if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
                this.resetError()
            }
        }
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
        })
    }

    render() {
        const { hasError, error, errorInfo } = this.state
        const {
            children,
            fallback: Fallback,
            className,
            showDetails = false,
            showRetry = true,
            showHome = true,
            title,
            description
        } = this.props

        if (hasError) {
            if (Fallback) {
                return <Fallback error={error} resetError={this.resetError} errorInfo={errorInfo} />
            }

            return (
                <DefaultErrorFallback
                    error={error}
                    resetError={this.resetError}
                    errorInfo={errorInfo}
                    showDetails={showDetails}
                    showRetry={showRetry}
                    showHome={showHome}
                    title={title}
                    description={description}
                    className={className}
                />
            )
        }

        return children
    }
}

export { ErrorBoundary, DefaultErrorFallback }
