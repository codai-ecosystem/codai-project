/**
 * Auth Helper for Tests
 * Provides authentication utilities for testing
 */

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface TestAuthToken {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Create a test user for authentication
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: 'test-user-1',
    email: 'test@memorai.com',
    name: 'Test User',
    role: 'user',
    ...overrides
  };
}

/**
 * Generate a mock auth token for testing
 */
export function generateTestAuthToken(user: TestUser): TestAuthToken {
  return {
    token: `test-token-${user.id}`,
    refreshToken: `test-refresh-${user.id}`,
    expiresAt: Date.now() + 3600000 // 1 hour
  };
}

/**
 * Create authenticated test headers
 */
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}