import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { logger } from '../../lib/logger';

import { PWAProvider } from '../PWAProvider';

// Mock the PWA hooks
vi.mock('../../hooks/usePWA', () => ({
  usePWA: vi.fn(() => ({
    canInstall: true,
    install: vi.fn(),
    isInstalling: false,
    isOnline: true,
  })),
  useServiceWorker: vi.fn(() => ({
    hasUpdate: false,
    updateServiceWorker: vi.fn(),
  })),
}));

// Mock the notification store
vi.mock('../../stores/notifications', () => ({
  useNotificationStore: vi.fn(() => ({
    addNotification: vi.fn(),
  })),
}));

// Mock the logger
vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('PWAProvider', () => {
  // Mock window properties for PWA support
  let originalIsSecureContext: boolean;
  let originalServiceWorker: any;
  beforeEach(() => {
    // Store original values
    originalIsSecureContext = window.isSecureContext;
    originalServiceWorker = navigator.serviceWorker;

    // Setup document with manifest
    document.head.innerHTML = '<link rel="manifest" href="/manifest.json" />';

    // Use mocks without redefining properties
    window.isSecureContext = true;
    // @ts-ignore - mock serviceWorker
    navigator.serviceWorker = {
      addEventListener: vi.fn(),
      register: vi.fn().mockResolvedValue({
        scope: '/',
        waiting: null,
        update: vi.fn().mockResolvedValue(undefined),
      }),
    };
  });

  afterEach(() => {
    // Restore original values
    window.isSecureContext = originalIsSecureContext;
    // @ts-ignore - restore serviceWorker
    navigator.serviceWorker = originalServiceWorker;
    document.head.innerHTML = '';
    vi.clearAllMocks();
  });

  it('should render children and PWA components when supported', () => {
    render(
      <PWAProvider>
        <div data-testid="test-child">Test Child</div>
      </PWAProvider>
    );

    // Check that children are rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument();

    // Check that PWA components are rendered
    expect(screen.getByTestId('pwa-installer')).toBeInTheDocument();
    expect(screen.getByTestId('service-worker-provider')).toBeInTheDocument();
  });

  it('should not render PWA installer when disableInstaller is true', () => {
    render(
      <PWAProvider disableInstaller>
        <div data-testid="test-child">Test Child</div>
      </PWAProvider>
    );

    // Child should be rendered
    expect(screen.getByTestId('test-child')).toBeInTheDocument();

    // ServiceWorkerProvider should still be rendered
    expect(screen.getByTestId('service-worker-provider')).toBeInTheDocument();

    // PWA installer should not be rendered
    expect(screen.queryByTestId('pwa-installer')).not.toBeInTheDocument();
  });
  it('should only render children when PWA is not supported', () => {
    // Mock PWA not supported
    window.isSecureContext = false;

    render(
      <PWAProvider>
        <div data-testid="test-child">Test Child</div>
      </PWAProvider>
    );

    // Children should still render
    expect(screen.getByTestId('test-child')).toBeInTheDocument();

    // PWA components should not render
    expect(screen.queryByTestId('pwa-installer')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('service-worker-provider')
    ).not.toBeInTheDocument();

    // Logger should be called
    expect(logger.info).toHaveBeenCalledWith(
      'PWA features not fully supported in this environment',
      expect.any(Object)
    );
  });
});
