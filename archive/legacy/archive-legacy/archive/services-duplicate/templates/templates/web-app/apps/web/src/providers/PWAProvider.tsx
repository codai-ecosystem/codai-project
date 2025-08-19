'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { PWAInstaller, ServiceWorkerProvider } from '@/components/pwa';
import { logger } from '@/lib/logger';

interface PWAProviderProps {
  children: ReactNode;
  disableInstaller?: boolean;
}

export function PWAProvider({
  children,
  disableInstaller = false,
}: PWAProviderProps): JSX.Element {
  const [isPWASupported, setIsPWASupported] = useState<boolean | null>(null);
  const [environment, setEnvironment] = useState<
    'development' | 'production' | 'test' | 'unknown'
  >('unknown');

  // Check if PWA is supported in this environment
  useEffect(() => {
    // Determine environment
    const detectEnvironment = () => {
      if (process.env.NODE_ENV === 'production') return 'production';
      if (process.env.NODE_ENV === 'development') return 'development';
      if (process.env.NODE_ENV === 'test') return 'test';
      return 'unknown';
    };

    const env = detectEnvironment();
    setEnvironment(env);

    const checkPWASupport = (): boolean => {
      const isSecureContext = window.isSecureContext;
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = !!document.querySelector('link[rel="manifest"]');
      // Log the manifest URL for debugging if it exists
      if (hasManifest) {
        const manifestUrl =
          document
            .querySelector('link[rel="manifest"]')
            ?.getAttribute('href') || '';
        logger.debug('PWA manifest detected', { context: { manifestUrl } });
      }

      // Always enable in production, check for support in other environments
      const isProdEnvironment = env === 'production';

      return (
        (isProdEnvironment || isSecureContext) &&
        hasServiceWorker &&
        hasManifest
      );
    };

    if (typeof window !== 'undefined') {
      try {
        const isPWASupported = checkPWASupport();
        setIsPWASupported(isPWASupported);
        logger.info('PWA environment detected', {
          context: {
            environment: env,
            isSupported: isPWASupported,
            isSecureContext: window.isSecureContext,
            hasServiceWorker: 'serviceWorker' in navigator,
            hasManifest: !!document.querySelector('link[rel="manifest"]'),
            manifestUrl:
              document
                .querySelector('link[rel="manifest"]')
                ?.getAttribute('href') || 'none',
          },
        });

        if (!isPWASupported) {
          logger.info('PWA features not fully supported in this environment', {
            context: {
              environment: env,
              isSecureContext: window.isSecureContext,
              hasServiceWorker: 'serviceWorker' in navigator,
              hasManifest: !!document.querySelector('link[rel="manifest"]'),
            },
          });
        }
      } catch (error) {
        logger.error('Error checking PWA support', { context: { error } });
        setIsPWASupported(false);
      }
    }
  }, []);

  // Don't render PWA components in development unless supported
  if (isPWASupported === false && environment !== 'production') {
    // PWA not supported, but still render children
    return <>{children}</>;
  }

  return (
    <ServiceWorkerProvider>
      <>
        {children}
        {!disableInstaller && <PWAInstaller />}
      </>
    </ServiceWorkerProvider>
  );
}
