'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { LogAI } from '@codai/logai-universal';

interface LogAIContextProps {
  logger: LogAI;
}

const LogAIContext = createContext<LogAIContextProps | undefined>(undefined);

export function LogAIProvider({
  children,
  appName = 'dexai'
}: {
  children: ReactNode;
  appName?: string;
}) {
  const logger = new LogAI({
    app: appName,
    version: '2.0.0',
    environment: 'development',
    endpoint: 'ws://localhost:8080/logai',
    realtimeEnabled: true,
    batchSize: 50,
    flushInterval: 5000,
    locale: 'ro-RO',
    features: ['real-time', 'analytics', 'romanian-nlp']
  });

  useEffect(() => {
    // Log app initialization
    logger.info('DexAI application initialized', {
      appName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language
    });

    // Track page performance
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        logger.trackPerformance('page-load-time', perfData.loadEventEnd - perfData.loadEventStart);
        logger.trackPerformance('dom-content-loaded', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
      }
    }

    return () => {
      logger.info('DexAI application cleanup');
    };
  }, [logger, appName]);

  return (
    <LogAIContext.Provider value={{ logger }}>
      {children}
    </LogAIContext.Provider>
  );
}

export function useLogAI() {
  const context = useContext(LogAIContext);
  if (!context) {
    throw new Error('useLogAI must be used within a LogAIProvider');
  }
  return context.logger;
}
