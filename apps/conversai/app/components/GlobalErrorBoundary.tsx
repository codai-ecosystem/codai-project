'use client'

import { ErrorBoundary } from '@codai/shared-ui'
import { ReactNode } from 'react'

interface GlobalErrorBoundaryProps {
  children: ReactNode
}

export default function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log to your preferred logging service
        console.error('Application Error:', error, errorInfo)
        
        // In production, send to analytics/monitoring service
        if (process.env.NODE_ENV === 'production') {
          // Analytics.track('error', { error: error.message, stack: error.stack })
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}