/**
 * Test utilities for consistent test setup and teardown
 */

import { SimpleAuthService } from '../src/services/simple-auth';
import type { CreateUserData } from '../src/services/simple-auth';

let testCounter = 0;

export function generateUniqueEmail(baseEmail = 'test'): string {
  testCounter++;
  return `${baseEmail}-${Date.now()}-${testCounter}@test.com`;
}

export function generateTestUser(overrides: Partial<CreateUserData> = {}): CreateUserData {
  return {
    username: `testuser-${testCounter}`,
    email: generateUniqueEmail(),
    password: 'TestPassword123!', // Meets all security requirements: 8+ chars, uppercase, lowercase, numbers, special chars
    profile: { name: 'Test User' },
    ...overrides
  };
}

export async function setupTestAuthService(): Promise<SimpleAuthService> {
  const authService = new SimpleAuthService();
  await authService.initialize();
  await authService.clearAllData(); // Clear any existing test data
  return authService;
}

export async function createTestAdmin(authService: SimpleAuthService): Promise<{
  user: any;
  credentials: { email: string; password: string }
}> {
  const adminData = generateTestUser({
    username: 'admin',
    email: generateUniqueEmail('admin'),
    password: 'AdminPass123!', // Strong password that meets all security requirements
    profile: { name: 'Admin User' }
  });

  const user = await authService.createUser(adminData);

  return {
    user,
    credentials: {
      email: adminData.email,
      password: adminData.password
    }
  };
}

export function increaseTestTimeout() {
  return 15000; // 15 seconds for performance tests
}
