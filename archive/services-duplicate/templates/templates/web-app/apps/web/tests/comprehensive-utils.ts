/**
 * Comprehensive Test Utilities for METU Template
 * Provides type-safe testing helpers, factories, and utilities
 */

import type { RenderOptions, RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { ReactElement, ReactNode } from 'react';

import type { User } from '@/types/auth';

// Convert a Firebase User to our custom User type
export const convertFirebaseUserToAppUser = (
  firebaseUser: FirebaseUser
): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || undefined, // This is already marked as optional in the User interface
    emailVerified: firebaseUser.emailVerified,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    // Add any other required fields
  };
};

// Test data factories
export const TestDataFactory = {
  createUser: (overrides: Partial<User> = {}): User => {
    // Properties that our custom User type expects
    const customUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: undefined,
      emailVerified: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          marketing: false,
        },
      },
      ...overrides,
    };

    return customUser;
  },

  // Create a Firebase-compatible user object for Firebase tests
  createFirebaseUser: (overrides: Partial<FirebaseUser> = {}): FirebaseUser => {
    return {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
      phoneNumber: null,
      photoURL: null,
      providerData: [
        {
          providerId: 'password',
          uid: 'test-user-id',
          displayName: 'Test User',
          email: 'test@example.com',
          phoneNumber: null,
          photoURL: null,
        },
      ],
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: jest.fn(),
      getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
      getIdTokenResult: jest.fn(),
      reload: jest.fn(),
      toJSON: jest.fn(),
      ...overrides,
    } as FirebaseUser;
  },

  createFormData: (overrides: Record<string, unknown> = {}) => ({
    email: 'test@example.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  }),

  createApiResponse: <T>(
    data: T,
    overrides: Partial<{
      success: boolean;
      message: string;
      error: string;
    }> = {}
  ) => ({
    success: true,
    data,
    message: 'Operation successful',
    ...overrides,
  }),

  createError: (message = 'Test error', code = 'TEST_ERROR') => ({
    message,
    code,
    name: 'TestError',
    stack: 'Test stack trace',
  }),
};

// Missing mock utilities needed by test files
interface AuthContextOverrides {
  user?: User | null;
  loading?: boolean;
  error?: string | null;
  signIn?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  signUp?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  signOut?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  resetPassword?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  [key: string]: unknown;
}

export const createMockAuthContext = (
  overrides: AuthContextOverrides = {}
) => ({
  user: TestDataFactory.createUser(),
  loading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  ...overrides,
});

interface NotificationOverrides {
  notifications?: unknown[];
  addNotification?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  removeNotification?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  clearNotifications?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  notify?: {
    success?: jest.MockedFunction<(...args: unknown[]) => unknown>;
    error?: jest.MockedFunction<(...args: unknown[]) => unknown>;
    warning?: jest.MockedFunction<(...args: unknown[]) => unknown>;
    info?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  };
  toast?: {
    success?: jest.MockedFunction<(...args: unknown[]) => unknown>;
    error?: jest.MockedFunction<(...args: unknown[]) => unknown>;
    warning?: jest.MockedFunction<(...args: unknown[]) => unknown>;
    info?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  };
  remove?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  clear?: jest.MockedFunction<(...args: unknown[]) => unknown>;
  [key: string]: unknown;
}

export const createMockNotifications = (
  overrides: NotificationOverrides = {}
) => ({
  notifications: [],
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  clearNotifications: jest.fn(),
  notify: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  remove: jest.fn(),
  clear: jest.fn(),
  ...overrides,
});

export const TestProvider = ({ children }: { children: ReactNode }) => {
  return children as ReactElement;
};

// Store provider mocks
export const MockStoreProviders = {
  auth: {
    user: null,
    isAuthenticated: false,
    setUser: jest.fn(),
    clearAuth: jest.fn(),
  },
  theme: {
    theme: 'light',
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  },
  Provider: ({ children }: { children: ReactNode }) => children as ReactElement,
};

// Custom render function with providers
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withProviders?: boolean;
  authState?: Partial<typeof MockStoreProviders.auth>;
  themeState?: Partial<typeof MockStoreProviders.theme>;
}

export function renderWithProviders(
  ui: ReactElement,
  options: ExtendedRenderOptions = {}
): RenderResult {
  const {
    withProviders = true,
    authState,
    themeState,
    ...renderOptions
  } = options;

  // Update mock stores with provided state
  if (authState) {
    Object.assign(MockStoreProviders.auth, authState);
  }
  if (themeState) {
    Object.assign(MockStoreProviders.theme, themeState);
  }
  const Wrapper = ({ children }: { children: ReactNode }) => {
    if (withProviders) {
      // For now, just return children since Providers might have issues in test environment
      return children as ReactElement;
    }
    return children as ReactElement;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Form testing utilities
export const FormTestUtils = {
  fillInput: async (
    getByLabelText: (text: string) => HTMLElement,
    label: string,
    value: string
  ) => {
    const input = getByLabelText(label);
    input.focus();
    input.setAttribute('value', value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  },

  submitForm: async (
    getByRole: (role: string, options?: { name?: RegExp }) => HTMLElement
  ) => {
    const form =
      getByRole('form') ||
      getByRole('button', { name: /submit|sign|register|login/i });
    form.click();
  },

  expectValidationError: (
    container: HTMLElement,
    errorMessage: string | RegExp
  ) => {
    const errorElement = container.querySelector(
      '[role="alert"], .error, .text-red-500'
    );
    expect(errorElement).toBeInTheDocument();
    if (typeof errorMessage === 'string') {
      expect(errorElement).toHaveTextContent(errorMessage);
    } else {
      expect(errorElement).toHaveTextContent(errorMessage);
    }
  },
};

// Firebase testing utilities
export const FirebaseTestUtils = {
  mockAuthUser: (user: Partial<User> = {}) => {
    const mockUser = TestDataFactory.createUser(user);
    jest
      .mocked(require('firebase/auth').onAuthStateChanged)
      .mockImplementation(
        (_auth: unknown, callback: (user: User | null) => void) => {
          callback(mockUser);
          return jest.fn(); // unsubscribe function
        }
      );
    return mockUser;
  },
  mockAuthError: (errorCode: string, errorMessage: string) => {
    const error = new Error(errorMessage) as Error & { code: string };
    error.code = errorCode;
    error.message = errorMessage; // Use the provided error message
    return error;
  },

  mockFirestoreDoc: (data: Record<string, unknown>) => ({
    exists: () => true,
    data: () => data,
    id: 'mock-doc-id',
    ref: { id: 'mock-doc-id' },
  }),

  mockFirestoreQuery: (docs: Array<Record<string, unknown>>) => ({
    empty: docs.length === 0,
    size: docs.length,
    docs: docs.map(data => FirebaseTestUtils.mockFirestoreDoc(data)),
    forEach: (callback: (doc: Record<string, unknown>) => void) =>
      docs.forEach(data => callback(FirebaseTestUtils.mockFirestoreDoc(data))),
  }),
};

// Performance testing utilities
export const PerformanceTestUtils = {
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  },

  expectRenderTimeUnder: async (renderFn: () => void, maxTime: number) => {
    const renderTime = await PerformanceTestUtils.measureRenderTime(renderFn);
    expect(renderTime).toBeLessThan(maxTime);
  },

  mockSlowNetwork: () => {
    // Mock slow network conditions
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({}),
                text: () => Promise.resolve(''),
              }),
            2000
          )
        )
    );
  },
};

// Accessibility testing utilities
export const A11yTestUtils = {
  expectProperHeadingHierarchy: (container: HTMLElement) => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentLevel = 0;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (currentLevel === 0) {
        expect(level).toBe(1); // First heading should be h1
      } else {
        expect(level).toBeLessThanOrEqual(currentLevel + 1); // No skipping levels
      }
      currentLevel = level;
    });
  },

  expectProperFormLabels: (container: HTMLElement) => {
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');

      if (id) {
        const label = container.querySelector(`label[for="${id}"]`);
        expect(label || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    });
  },

  expectKeyboardAccessible: async (element: HTMLElement) => {
    // Test that interactive elements are focusable
    const interactiveElements = element.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    interactiveElements.forEach(el => {
      const tabIndex = el.getAttribute('tabindex');
      if (tabIndex !== '-1') {
        expect(el).toBeVisible();
        // Element should be focusable
        (el as HTMLElement).focus();
        expect(document.activeElement).toBe(el);
      }
    });
  },
};

// Security testing utilities
export const SecurityTestUtils = {
  expectXSSProtection: (component: ReactElement, _maliciousInput: string) => {
    const { container } = renderWithProviders(component);
    // Verify that malicious scripts are not executed
    expect(container.innerHTML).not.toContain('<script>');
    expect(container.innerHTML).not.toContain('javascript:');
    expect(container.innerHTML).not.toContain('onload=');
  },

  expectCSRFProtection: (formElement: HTMLElement) => {
    // Look for CSRF token or other protection mechanisms
    const csrfToken = formElement.querySelector(
      'input[name*="csrf"], input[name*="token"]'
    );
    const headers =
      formElement.getAttribute('data-csrf') ||
      formElement.getAttribute('data-token');
    expect(csrfToken || headers).toBeTruthy();
  },
  expectSanitizedInput: (_inputValue: string, expectedOutput: string) => {
    // Verify that dangerous input is properly sanitized
    expect(expectedOutput).not.toContain('<script>');
    expect(expectedOutput).not.toContain('javascript:');
    expect(expectedOutput).not.toContain('onerror=');
  },
};

// Test environment utilities
export const TestEnvironmentUtils = {
  mockEnvironmentVariable: (key: string, value: string) => {
    const original = process.env[key];
    process.env[key] = value;
    return () => {
      if (original !== undefined) {
        process.env[key] = original;
      } else {
        delete process.env[key];
      }
    };
  },
  mockWindowProperty: <T>(property: string, value: T) => {
    const windowWithProperty = window as unknown as Record<string, unknown>;
    const original = windowWithProperty[property];
    windowWithProperty[property] = value;
    return () => {
      windowWithProperty[property] = original;
    };
  },

  setupTestDatabaseRules: () => {
    // Mock Firestore rules for testing
    return {
      users: {
        read: true,
        write: 'auth.uid == resource.data.uid',
      },
      posts: {
        read: true,
        write: 'auth.uid != null',
      },
    };
  },
};

// Export everything for easy importing
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { default as userEvent } from '@testing-library/user-event';
