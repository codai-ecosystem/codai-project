import { ReactNode } from 'react'

import { useLogAI, setupGlobalErrorHandling, logPerformanceMetrics } from '@codai/logai-integration'

export const metadata = {
    title: 'Docs - Codai Documentation',
    description: 'Comprehensive documentation for the Codai ecosystem',
}

export default function RootLayout({
    children,
}: {
    children: ReactNode
}) {
  // Initialize LogAI integration
  const { logEvent, logError, logUserAction } = useLogAI()
  
  useEffect(() => {
    // Setup global error handling and performance monitoring
    setupGlobalErrorHandling('docs')
    logPerformanceMetrics('docs')
    
    // Log app initialization
    logEvent('app_initialized', {
      service: 'docs',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString()
    })
  }, [])

    return (
        <html lang="en">
            <body>
                <div className="min-h-screen bg-gray-50">
                    <main>
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}
