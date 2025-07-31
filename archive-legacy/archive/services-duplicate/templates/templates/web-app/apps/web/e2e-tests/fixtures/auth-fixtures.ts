import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';

type MockAuthFn = (
  userData: Partial<{
    id: string;
    email: string;
    displayName: string;
  }>
) => Promise<void>;

// Define our test fixtures
type TestFixtures = {
  authenticatedPage: Page;
  mockAuthState: MockAuthFn;
};

/**
 * Extend the basic test with authentication capabilities
 * This adds authentication helpers to allow tests to easily sign in
 */
export const test = base.extend<TestFixtures>({
  // Authentication helper that injects auth state to simulate a logged-in user
  authenticatedPage: async ({ page }, use) => {
    // Navigate to any page first
    await page.goto('/');

    // Set localStorage to simulate authenticated state
    await page.evaluate(() => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              displayName: 'Test User',
              emailVerified: true,
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            },
            isAuthenticated: true,
          },
          version: 0,
        })
      );
    });

    // Also set a flag to indicate we're in test mode
    await page.evaluate(() => {
      window.localStorage.setItem('testMode', 'true');
    });

    // Reload to apply auth state
    await page.reload();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);

    // Clean up after each test - optional if shared auth state is okay
    await page.evaluate(() => {
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('testMode');
    });
  },
  // Set up mock auth data without going through login form
  mockAuthState: async ({ page }, use) => {
    // Helper function for tests to mock auth state
    const mockAuth = async (
      userData: Partial<{
        id: string;
        email: string;
        displayName: string;
      }>
    ) => {
      // First navigate to a page in the app to ensure we're in the right context
      await page.goto('/');

      // Now set the localStorage in the correct security context
      await page.evaluate(user => {
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({
            state: {
              user: {
                id: user.id || 'test-user-id',
                email: user.email || 'test@example.com',
                displayName: user.displayName || 'Test User',
                photoURL: null,
                emailVerified: true,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              },
              isAuthenticated: true,
            },
            version: 0,
          })
        );
      }, userData);
    };

    // Pass the helper function to the test
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(mockAuth);
  },
});

export { expect } from '@playwright/test';
