/**
 * Test utilities for working with real Firebase services
 * These utilities help create real test data and tokens without mocking
 */
import { sign } from 'jsonwebtoken';

import { env } from '../src/lib/env';
import { firebaseAdmin } from '../src/lib/firebase-admin';

import type { PathLike } from 'node:fs';

type PathModule = {
  resolve: (...paths: string[]) => string;
};

type FsModule = {
  existsSync: (path: PathLike) => boolean;
};

export interface TestUser {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
}

/**
 * Create a JWT token for testing (compatible with auth middleware)
 */
export function createTestFirebaseToken(uid: string = 'test-user-id'): string {
  // For testing, always create a JWT token that matches what the auth middleware expects
  // This ensures compatibility with the backend's authenticate middleware
  return createTestJwtToken({ uid });
}

/**
 * Create a real JWT token for testing
 */
export function createTestJwtToken(payload: Record<string, string> = { uid: 'test-user-id' }): string {
  return sign(payload, env.JWT_SECRET, { expiresIn: parseInt(env.JWT_EXPIRES_IN) });
}

/**
 * Check if Firebase credentials are properly configured
 */
function checkFirebaseCredentials(): boolean {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL,
    GOOGLE_APPLICATION_CREDENTIALS,
    FIREBASE_ENABLED,
  } = env;

  // First check if Firebase is enabled
  if (!FIREBASE_ENABLED) {
    return false;
  }

  // Check if service account file exists in secrets folder (same path as Firebase Admin uses)
  // eslint-disable-next-line unicorn/prefer-module, @typescript-eslint/no-var-requires -- required for dynamic path resolution
  const path = require('node:path') as PathModule;
  // eslint-disable-next-line unicorn/prefer-module, @typescript-eslint/no-var-requires -- required for file system access
  const fs = require('node:fs') as FsModule;
  // eslint-disable-next-line unicorn/prefer-module -- required for dynamic path resolution
  const serviceAccountPath = path.resolve(__dirname, '../../../..', 'secrets', 'metu-template-firebase-adminsdk-fbsvc-fb58a97ab5.json');

  const hasServiceAccountFile = fs.existsSync(serviceAccountPath);

  // Check if we have either service account env vars or service account file
  const hasEnvCredentials = Boolean(
    FIREBASE_PROJECT_ID != null &&
    FIREBASE_PRIVATE_KEY != null &&
    FIREBASE_CLIENT_EMAIL != null &&
    typeof FIREBASE_PROJECT_ID === 'string' &&
    typeof FIREBASE_PRIVATE_KEY === 'string' &&
    typeof FIREBASE_CLIENT_EMAIL === 'string' &&
    !FIREBASE_PROJECT_ID.includes('your-') && // Not placeholder
    !FIREBASE_PRIVATE_KEY.includes('YOUR_ACTUAL_KEY') // Not placeholder
  );

  const hasFileCredentials = Boolean(
    GOOGLE_APPLICATION_CREDENTIALS != null &&
    typeof GOOGLE_APPLICATION_CREDENTIALS === 'string' &&
    GOOGLE_APPLICATION_CREDENTIALS.length > 0
  );

  return Boolean(hasEnvCredentials || hasFileCredentials || hasServiceAccountFile);
}

/**
 * Initialize Firebase Admin with credential validation
 */
async function initializeFirebaseForTesting(): Promise<boolean> {
  const hasValidCredentials = checkFirebaseCredentials();

  if (!hasValidCredentials) {
    console.warn('Firebase credentials not configured - using fallback mode');
    return false;
  }

  firebaseAdmin.initializeApp();

  // Test Firebase permissions with a quick operation first
  try {
    await firebaseAdmin.auth().listUsers(1);
    return true;
  } catch (permissionError) {
    if (
      permissionError instanceof Error &&
      permissionError.message.includes('PERMISSION_DENIED')
    ) {
      console.warn('Firebase permissions insufficient - using mock mode for testing');
      console.warn(
        'To fix: Grant service account the roles/serviceusage.serviceUsageConsumer role in Firebase Console'
      );
      return false;
    }
    throw permissionError;
  }
}

export async function createTestUser(userData: Partial<TestUser> = {}): Promise<TestUser> {
  const defaultUser: TestUser = {
    uid: `test-user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    displayName: 'Test User',
    emailVerified: true,
    ...userData,
  };

  try {
    const isFirebaseReady = await initializeFirebaseForTesting();

    if (!isFirebaseReady) {
      return defaultUser;
    }

    // Create user in Firebase Auth
    const createRequest = {
      uid: defaultUser.uid,
      email: defaultUser.email,
      ...(defaultUser.displayName != null && defaultUser.displayName.length > 0 ? { displayName: defaultUser.displayName } : {}),
      ...(defaultUser.emailVerified !== undefined ? { emailVerified: defaultUser.emailVerified } : {}),
    };

    const userRecord = await firebaseAdmin.auth().createUser(createRequest);

    return {
      uid: userRecord.uid,
      email: userRecord.email ?? defaultUser.email,
      displayName: userRecord.displayName ?? defaultUser.displayName ?? '',
      emailVerified: userRecord.emailVerified,
    };
  } catch (error) {
    console.error('Failed to create test user:', error);
    console.warn('Falling back to mock test user for testing');
    // Return mock user as fallback
    return defaultUser;
  }
}

/**
 * Delete a test user from Firebase Auth
 */
export async function deleteTestUser(uid: string): Promise<void> {
  try {
    const isFirebaseReady = await initializeFirebaseForTesting();

    if (!isFirebaseReady) {
      console.warn('Firebase not ready - skipping user deletion');
      return;
    }

    await firebaseAdmin.auth().deleteUser(uid);
  } catch (error) {
    console.error('Failed to delete test user:', error);
    // Don't throw error for cleanup operations
  }
}

/**
 * Clean up all test users (users with email containing 'test-')
 */
export async function cleanupTestUsers(): Promise<void> {
  try {
    firebaseAdmin.initializeApp();

    // List users and delete those with test emails
    const listUsersResult = await firebaseAdmin.auth().listUsers();
    const testUsers = listUsersResult.users.filter(
      user => user.email?.includes('test-') ?? false
    );

    // Delete test users in parallel
    await Promise.all(testUsers.map(user => deleteTestUser(user.uid)));

    console.log(`Cleaned up ${testUsers.length} test users`);
  } catch (error) {
    console.error('Failed to cleanup test users:', error);
  }
}

/**
 * Create test data in Firestore
 */
export async function createTestDocument(
  collection: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    firebaseAdmin.initializeApp();
    await firebaseAdmin.firestore().collection(collection).doc(docId).set(data);
  } catch (error) {
    console.error('Failed to create test document:', error);
    throw new Error('Could not create test document in Firestore');
  }
}

/**
 * Delete test data from Firestore
 */
export async function deleteTestDocument(collection: string, docId: string): Promise<void> {
  try {
    firebaseAdmin.initializeApp();
    await firebaseAdmin.firestore().collection(collection).doc(docId).delete();
  } catch (error) {
    console.error('Failed to delete test document:', error);
    // Don't throw error for cleanup operations
  }
}

/**
 * Clean up all test documents in a collection
 */
export async function cleanupTestCollection(collection: string): Promise<void> {
  try {
    firebaseAdmin.initializeApp();

    const collectionRef = firebaseAdmin.firestore().collection(collection);
    const snapshot = await collectionRef.where('isTestData', '==', true).get();

    const batch = firebaseAdmin.firestore().batch();
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
    }

    await batch.commit();
    console.log(`Cleaned up ${snapshot.docs.length} test documents from ${collection}`);
  } catch (error) {
    console.error(`Failed to cleanup test collection ${collection}:`, error);
  }
}
