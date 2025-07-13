import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { useLogAI, setupGlobalErrorHandling, logPerformanceMetrics } from '@codai/logai-integration'

export default function App({ Component, pageProps }: AppProps) {
  // Initialize LogAI integration
  const { logEvent, logError, logUserAction } = useLogAI()
  
  useEffect(() => {
    // Setup global error handling and performance monitoring
    setupGlobalErrorHandling('legalizai')
    logPerformanceMetrics('legalizai')
    
    // Log app initialization
    logEvent('app_initialized', {
      service: 'legalizai',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString()
    })
  }, [])

  return <Component {...pageProps} />;
}
