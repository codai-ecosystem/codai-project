/**
 * Firebase Testing Utilities
 *
 * This module provides utilities for testing Firebase-related functionality
 * with proper mocking and test environment setup.
 */

import type { Auth, User as FirebaseUser } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

// Jest mock function types
type MockFunction<
  T extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown,
> = T & {
  mockClear: () => void;
  mockReset: () => void;
  mockRestore: () => void;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockImplementationOnce: (fn: T) => MockFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockReturnValueOnce: (value: ReturnType<T>) => MockFunction<T>;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockFunction<T>;
  mockResolvedValueOnce: (value: Awaited<ReturnType<T>>) => MockFunction<T>;
  mockRejectedValue: (value: unknown) => MockFunction<T>;
  mockRejectedValueOnce: (value: unknown) => MockFunction<T>;
  mock: {
    calls: Parameters<T>[];
    instances: ThisParameterType<T>[];
    invocationCallOrder: number[];
    results: Array<{ type: 'return' | 'throw'; value: ReturnType<T> | Error }>;
  };
};

// Jest global interface
interface JestGlobal {
  fn: <T extends (...args: unknown[]) => unknown>(
    implementation?: T
  ) => MockFunction<T>;
  mock: (
    moduleName: string,
    factory?: () => unknown,
    options?: { virtual?: boolean }
  ) => void;
  unmock: (moduleName: string) => void;
  clearAllMocks: () => void;
  resetAllMocks: () => void;
  restoreAllMocks: () => void;
  resetModules: () => void;
  spyOn: <T extends object, M extends keyof T>(
    object: T,
    method: M
  ) => MockFunction<
    T[M] extends (...args: unknown[]) => unknown ? T[M] : () => unknown
  >;
}

// Jest is available globally in test environment
declare const jest: JestGlobal;

/**
 * Mock Firebase user for testing
 */
export const createMockFirebaseUser = (
  overrides: Partial<FirebaseUser> = {}
): FirebaseUser => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  photoURL: null,
  phoneNumber: null,
  providerId: 'firebase',
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: jest.fn(() => Promise.resolve()),
  getIdToken: jest.fn(() => Promise.resolve('mock-id-token')),
  getIdTokenResult: jest.fn(() =>
    Promise.resolve({
      token: 'mock-id-token',
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      signInProvider: 'password',
      claims: {},
      signInSecondFactor: null,
    })
  ),
  reload: jest.fn(() => Promise.resolve()),
  toJSON: jest.fn(() => ({})),
  ...overrides,
});

/**
 * Mock Firebase Auth for testing
 * Note: Using 'unknown' types for Firebase internal objects in test mocks is acceptable
 */
export const createMockAuth = (
  user: FirebaseUser | null = null
): Partial<Auth> => ({
  app: {
    name: 'test-app',
    options: {},
    automaticDataCollectionEnabled: false,
  } as unknown as Auth['app'],
  name: 'default',
  config: {
    apiKey: 'test-key',
    apiHost: 'test-host',
    apiScheme: 'https',
    tokenApiHost: 'test-token-host',
    sdkClientVersion: 'test-version',
  } as unknown as Auth['config'],
  currentUser: user,
  languageCode: 'en',
  tenantId: null,
  settings: {
    appVerificationDisabledForTesting: true,
  } as unknown as Auth['settings'],
  onAuthStateChanged: jest.fn(
    () => () => void 0
  ) as unknown as Auth['onAuthStateChanged'],
  onIdTokenChanged: jest.fn(
    () => () => void 0
  ) as unknown as Auth['onIdTokenChanged'],
  beforeAuthStateChanged: jest.fn(
    () => () => void 0
  ) as unknown as Auth['beforeAuthStateChanged'],
  updateCurrentUser: jest.fn(() =>
    Promise.resolve()
  ) as unknown as Auth['updateCurrentUser'],
  useDeviceLanguage: jest.fn() as unknown as Auth['useDeviceLanguage'],
  signOut: jest.fn(() => Promise.resolve()) as unknown as Auth['signOut'],
  setPersistence: jest.fn(() =>
    Promise.resolve()
  ) as unknown as Auth['setPersistence'],
  authStateReady: jest.fn(() =>
    Promise.resolve()
  ) as unknown as Auth['authStateReady'],
  emulatorConfig: null,
});

/**
 * Mock Firestore for testing
 */
export const createMockFirestore = (): Partial<Firestore> => ({
  app: {
    name: 'test-app',
    options: {},
    automaticDataCollectionEnabled: false,
  } as unknown as Firestore['app'],
  type: 'firestore-lite',
  toJSON: jest.fn(() => ({})),
});

/**
 * Mock Firebase Storage for testing
 */
export const createMockStorage = (): Partial<FirebaseStorage> => ({
  app: {
    name: 'test-app',
    options: {},
    automaticDataCollectionEnabled: false,
  } as unknown as FirebaseStorage['app'],
  maxOperationRetryTime: 120000,
  maxUploadRetryTime: 600000,
});

/**
 * Setup Firebase mocks for testing
 */
export function setupFirebaseMocks(): {
  mockUser: FirebaseUser;
  mockAuth: Partial<Auth>;
  mockFirestore: Partial<Firestore>;
  mockStorage: Partial<FirebaseStorage>;
} {
  const mockUser = createMockFirebaseUser();
  const mockAuth = createMockAuth(mockUser);
  const mockFirestore = createMockFirestore();
  const mockStorage = createMockStorage();

  // Mock Firebase modules
  jest.mock('@/lib/firebase', () => ({
    auth: mockAuth,
    db: mockFirestore,
    storage: mockStorage,
    isFirebaseInitialized: () => true,
    isMessagingAvailable: () => false,
    isAnalyticsAvailable: () => false,
    isRemoteConfigAvailable: () => false,
  }));

  // Mock Firebase hooks
  jest.mock('react-firebase-hooks/auth', () => ({
    useAuthState: () => [mockUser, false, null] as const,
    useCreateUserWithEmailAndPassword: () =>
      [
        jest.fn(() => Promise.resolve({ user: mockUser })),
        null,
        false,
        null,
      ] as const,
    useSignInWithEmailAndPassword: () =>
      [
        jest.fn(() => Promise.resolve({ user: mockUser })),
        null,
        false,
        null,
      ] as const,
    useSignInWithGoogle: () =>
      [
        jest.fn(() => Promise.resolve({ user: mockUser })),
        null,
        false,
        null,
      ] as const,
  }));

  return {
    mockUser,
    mockAuth,
    mockFirestore,
    mockStorage,
  };
}

/**
 * Clean up Firebase mocks after testing
 */
export function cleanupFirebaseMocks(): void {
  jest.clearAllMocks();
  jest.resetModules();
}

/**
 * Create a test wrapper for Firebase-dependent components
 */
export function createFirebaseTestWrapper(mocks = setupFirebaseMocks()): {
  mockUser: FirebaseUser;
  mockAuth: Partial<Auth>;
  mockFirestore: Partial<Firestore>;
  mockStorage: Partial<FirebaseStorage>;
  cleanup: () => void;
} {
  return {
    ...mocks,
    cleanup: cleanupFirebaseMocks,
  };
}
