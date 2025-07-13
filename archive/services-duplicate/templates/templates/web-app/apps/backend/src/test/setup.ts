// Test setup file
// Add any global test configuration here

import { vi } from 'vitest';

// Test constants
const TEST_USER_ID = 'test-user-id';

// Mock environment variables FIRST
process.env['NODE_ENV'] = 'test';
process.env['FIREBASE_PROJECT_ID'] = 'test-project';
process.env['PORT'] = '3002';
process.env['CORS_ORIGIN'] = 'http://localhost:3000';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-testing';
process.env['JWT_EXPIRES_IN'] = '3600';
process.env['FIREBASE_API_KEY'] = 'test-api-key';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn((_payload, _secret, _options) => 'mock-jwt-token'),
  verify: vi.fn((token, _secret) => {
    if (token === 'valid-token') {
      return { uid: TEST_USER_ID };
    }
    throw new Error('Invalid token');
  }),
  decode: vi.fn(),
}));

// Mock fetch for Firebase API calls
global.fetch = vi.fn();

// Mock Firebase Admin for tests
const mockUserRecord = {
  uid: TEST_USER_ID,
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: '',
  emailVerified: true,
  metadata: {
    creationTime: '2024-01-01T00:00:00.000Z',
    lastSignInTime: '2024-01-01T00:00:00.000Z',
  },
};

const mockAuth = {
  verifyIdToken: vi.fn().mockResolvedValue({ uid: TEST_USER_ID }),
  getUser: vi.fn().mockResolvedValue(mockUserRecord),
  createUser: vi.fn().mockResolvedValue(mockUserRecord),
  updateUser: vi.fn().mockResolvedValue(mockUserRecord),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  createCustomToken: vi.fn().mockResolvedValue('custom-token'),
  listUsers: vi.fn().mockResolvedValue({ users: [mockUserRecord] }),
};

vi.mock('firebase-admin', () => ({
  default: {
    initializeApp: vi.fn(),
    credential: {
      applicationDefault: vi.fn(),
      cert: vi.fn(),
    },
    auth: vi.fn(() => mockAuth),
    firestore: vi.fn(() => ({
      FieldValue: {
        serverTimestamp: vi.fn(),
        increment: vi.fn(),
        arrayUnion: vi.fn(),
        arrayRemove: vi.fn(),
        delete: vi.fn(),
      },
    })),
    storage: vi.fn(),
    apps: [],
  },
  initializeApp: vi.fn(),
  credential: {
    applicationDefault: vi.fn(),
    cert: vi.fn(),
  },
  auth: vi.fn(() => mockAuth),
  firestore: vi.fn(() => ({
    FieldValue: {
      serverTimestamp: vi.fn(),
      increment: vi.fn(),
      arrayUnion: vi.fn(),
      arrayRemove: vi.fn(),
      delete: vi.fn(),
    },
  })),
}));

// Mock Firebase Admin instance for route handlers
vi.mock('../lib/firebase-admin', () => ({
  firebaseAdmin: {
    initializeApp: vi.fn(),
    auth: vi.fn(() => mockAuth),
    credential: {
      applicationDefault: vi.fn(),
      cert: vi.fn(),
    },
    apps: [],
  },
}));
