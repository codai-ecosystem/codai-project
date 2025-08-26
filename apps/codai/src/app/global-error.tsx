'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Application Error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                Application Error
              </h1>
              <p className="text-gray-600">
                A critical error occurred. Please refresh the page or contact support.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
              >
                Try again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="block w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Go to home page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && error.message && (
              <details className="mt-4 p-3 bg-gray-100 rounded-md text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {error.message}
                  {error.stack && (
                    <div className="mt-2 text-xs text-gray-500">
                      {error.stack}
                    </div>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}