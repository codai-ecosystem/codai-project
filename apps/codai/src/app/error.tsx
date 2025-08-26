'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong!
          </h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Try again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="block w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Go back to home
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <details className="mt-4 p-3 bg-muted rounded-md text-left">
            <summary className="cursor-pointer text-sm font-medium">
              Error Details
            </summary>
            <pre className="mt-2 text-xs overflow-auto">
              {error.message}
              {error.stack && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {error.stack}
                </div>
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}