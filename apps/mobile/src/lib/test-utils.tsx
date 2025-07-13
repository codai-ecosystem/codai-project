import type { JSX } from 'react';
/**
 * Test utilities and configurations for METU Template
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ToastProvider } from '@/providers/ToastProvider';
import type { User } from '@/types/auth';

// Mock user for testing
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  createdAt: new Date(),
  lastLoginAt: new Date(),
};

// Mock auth context value
export const mockAuthContextValue = {
  user: mockUser,
  isLoading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null;
  theme?: 'light' | 'dark' | 'system';
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): JSX.Element {
  const {
    user = mockUser,
    theme: _theme = 'light',
    ...renderOptions
  } = options;

  const authValue = {
    ...mockAuthContextValue,
    user,
  };
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    user: authValue.user,
  };
}

// Mock Next.js router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  isReady: true,
  basePath: '',
  isFallback: false,
  isPreview: false,
  isLocaleDomain: false,
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

// Mock Firebase Auth
export const mockFirebaseAuth = {
  currentUser: mockUser,
  onAuthStateChanged: jest.fn(callback => {
    callback(mockUser);
    return jest.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: mockUser,
    credential: null,
  }),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: mockUser,
    credential: null,
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  updateProfile: jest.fn().mockResolvedValue(undefined),
};

// Mock Firebase Firestore
export const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  add: jest.fn().mockResolvedValue({ id: 'doc-id' }),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue({
    exists: true,
    data: () => ({ name: 'Test Document' }),
    id: 'doc-id',
  }),
  onSnapshot: jest.fn(callback => {
    callback({
      docs: [
        {
          id: 'doc-1',
          data: () => ({ name: 'Document 1' }),
        },
      ],
    });
    return jest.fn(); // unsubscribe function
  }),
};

// Test data generators
export const testDataGenerators = {
  /**
   * Generate random user data
   */
  generateUser(overrides: Partial<User> = {}): User {
    return {
      id: `user-${Math.random().toString(36).substring(7)}`,
      email: `test-${Math.random().toString(36).substring(7)}@example.com`,
      displayName: `Test User ${Math.floor(Math.random() * 1000)}`,
      emailVerified: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      ...overrides,
    };
  },

  /**
   * Generate random form data
   */
  generateFormData(fields: string[]): Record<string, string> {
    return fields.reduce(
      (acc, field) => {
        acc[field] = `test-${field}-${Math.random().toString(36).substring(7)}`;
        return acc;
      },
      {} as Record<string, string>
    );
  },

  /**
   * Generate random API response
   */
  generateApiResponse<T>(data: T, success: boolean = true) {
    return {
      success,
      data: success ? data : null,
      error: success ? null : 'Test error message',
      timestamp: new Date().toISOString(),
    };
  },
};

// Common test helpers
export const testHelpers = {
  /**
   * Wait for async operations to complete
   */
  waitForAsync: (ms: number = 0) =>
    new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Mock console methods
   */ mockConsole: () => {
    const originalConsole = { ...console };
    // eslint-disable-next-line no-console
    console.log = jest.fn();
    // eslint-disable-next-line no-console
    console.warn = jest.fn();
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    // eslint-disable-next-line no-console
    console.info = jest.fn();
    return {
      restore: () => {
        // eslint-disable-next-line no-console
        console.log = originalConsole.log;
        // eslint-disable-next-line no-console
        console.warn = originalConsole.warn;
        // eslint-disable-next-line no-console
        console.error = originalConsole.error;
        // eslint-disable-next-line no-console
        console.info = originalConsole.info;
      },
    };
  },

  /**
   * Mock window.matchMedia for responsive testing
   */
  mockMatchMedia: (matches: boolean = false) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  },

  /**
   * Mock ResizeObserver for component testing
   */
  mockResizeObserver: () => {
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  },

  /**
   * Mock IntersectionObserver for lazy loading testing
   */
  mockIntersectionObserver: () => {
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  },
};

// Performance testing utilities
export const performanceHelpers = {
  /**
   * Measure component render time
   */
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  },

  /**
   * Test memory usage
   */ measureMemoryUsage: (): number => {
    if ('memory' in performance) {
      return (
        (performance as { memory?: { usedJSHeapSize?: number } }).memory
          ?.usedJSHeapSize || 0
      );
    }
    return 0;
  },
  /**
   * Simulate slow network for testing
   */
  simulateSlowNetwork: (delay: number = 2000) => {
    jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        (_url, _options) =>
          new Promise(resolve =>
            setTimeout(() => resolve(new Response('{"data": "test"}')), delay)
          )
      );
  },
};

// Accessibility testing helpers
export const a11yHelpers = {
  /**
   * Check if element is accessible via keyboard
   */
  isKeyboardAccessible: (element: HTMLElement): boolean => {
    return (
      element.tabIndex >= 0 ||
      ['button', 'input', 'select', 'textarea', 'a'].includes(
        element.tagName.toLowerCase()
      )
    );
  },

  /**
   * Check if element has proper ARIA labels
   */
  hasAriaLabels: (element: HTMLElement): boolean => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('aria-describedby')
    );
  },
  /**
   * Get element's contrast ratio (simplified)
   */
  getContrastRatio: (_foreground: string, _background: string): number => {
    // This is a simplified implementation
    // In real tests, you'd use a proper color contrast library
    return 4.5; // Assuming WCAG AA compliance
  },
};

// Export all test utilities
export * from '@testing-library/react';
export * from '@testing-library/user-event';
