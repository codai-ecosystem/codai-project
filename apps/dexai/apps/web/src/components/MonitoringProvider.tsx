/**
 * Monitoring Provider Component
 * Initializes monitoring and provides context to the application
 */

'use client';

import React from 'react';
import { setupGlobalErrorHandling } from './ErrorBoundary';

interface MonitoringContextType {
  isEnabled: boolean;
  sessionId: string;
}

const MonitoringContext = React.createContext<MonitoringContextType | null>(null);

interface MonitoringProviderProps {
  children: React.ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  const [isEnabled] = React.useState(process.env.NODE_ENV === 'production');
  const [sessionId] = React.useState(() => 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  React.useEffect(() => {
    // Initialize global error handling
    setupGlobalErrorHandling();

    // Initialize performance monitoring
    if (typeof window !== 'undefined' && isEnabled) {
      console.log('🚀 Production monitoring initialized');
    } else {
      console.log('🔧 Development mode - monitoring disabled');
    }
  }, [isEnabled]);

  const contextValue: MonitoringContextType = {
    isEnabled,
    sessionId
  };

  return (
    <MonitoringContext.Provider value={contextValue}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoringContext(): MonitoringContextType {
  const context = React.useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoringContext must be used within a MonitoringProvider');
  }
  return context;
}
