'use client';

import { type ReactNode } from 'react';

import { DevStatusIndicator } from '@/components/dev/DevStatusIndicator';

interface DevToolsProviderProps {
  children: ReactNode;
}

/**
 * DevToolsProvider - A provider that adds development tools to the app
 * Only visible in development mode
 */
export function DevToolsProvider({ children }: DevToolsProviderProps) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <>
      {children}
      {isDev && <DevStatusIndicator />}
    </>
  );
}
