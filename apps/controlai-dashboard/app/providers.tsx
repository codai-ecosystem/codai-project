'use client'

import { ThemeProvider } from 'next-themes'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <Toaster position="top-right" expand={false} richColors />
            </ThemeProvider>
        </ErrorBoundary>
    )
}
