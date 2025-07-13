'use client';

import type { JSX, ReactNode } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

import { AnalyticsProvider } from './AnalyticsProvider';
import { NotificationProvider } from './NotificationProvider';
import { PWAProvider } from './PWAProvider';
import { ToastProvider } from './ToastProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <PWAProvider>
                <AnalyticsProvider>{children}</AnalyticsProvider>
              </PWAProvider>
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
