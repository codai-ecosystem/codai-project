'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { LogAI } from '@codai/logai-universal';

interface LogAIContextProps {
  logger: LogAI;
}

const LogAIContext = createContext<LogAIContextProps | undefined>(undefined);

export function LogAIProvider({
  children,
  appName = 'donai'
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
    logger.info('DonAI application initialized', {
      appName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language
    });

    // Track donation platform metrics
    logger.trackPerformance('donation-platform-startup', Date.now());
    logger.info('Blockchain donation platform ready for transparent giving');

    return () => {
      logger.info('DonAI application cleanup');
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
