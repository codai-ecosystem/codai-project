'use client'

import { useEffect } from 'react'
import { useLogAI, setupGlobalErrorHandling, logPerformanceMetrics } from '@codai/logai-integration'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Initialize LogAI integration
  const { logEvent, logError, logUserAction } = useLogAI()

  useEffect(() => {
    // Setup global error handling and performance monitoring
    setupGlobalErrorHandling('hub')
    logPerformanceMetrics('hub')

    // Log app initialization
    logEvent('app_initialized', {
      service: 'hub',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString()
    })
  }, [logEvent])

  return <>{children}</>
}
