import * as fs from 'node:fs';
import * as path from 'node:path';

import admin from 'firebase-admin';

import { env } from './env';

const FIREBASE_NOT_INITIALIZED_ERROR =
  'Firebase Admin not initialized. Call initializeApp() first.';

class FirebaseAdmin {
  private app: admin.app.App | null = null;

  initializeApp(): admin.app.App {
    if (this.app) {
      return this.app;
    }

    // Check if Firebase is enabled
    if (!env.FIREBASE_ENABLED) {
      throw new Error('Firebase is disabled in environment configuration');
    }

    try {
      // Initialize Firebase Admin with credentials
      const credential = this.getCredential();

      this.app = admin.initializeApp({
        credential,
        projectId: env.FIREBASE_PROJECT_ID!,
      });

      console.log('Firebase Admin initialized successfully');
      return this.app;
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw error;
    }
  }

  private getCredential(): admin.credential.Credential {
    // First priority: Use service account JSON file from secrets folder
    // Check both backend/secrets and project root/secrets folders
    const localSecretsPath = path.resolve(
      process.cwd(),
      'secrets',
      'metu-template-firebase-adminsdk-fbsvc-fb58a97ab5.json'
    );
    const rootSecretsPath = path.resolve(
      process.cwd(),
      '..',
      '..',
      'secrets',
      'metu-template-firebase-adminsdk-fbsvc-fb58a97ab5.json'
    );

    if (fs.existsSync(localSecretsPath)) {
      console.log('Using service account from local secrets folder:', localSecretsPath);
      return admin.credential.cert(localSecretsPath);
    }

    if (fs.existsSync(rootSecretsPath)) {
      console.log('Using service account from root secrets folder:', rootSecretsPath);
      return admin.credential.cert(rootSecretsPath);
    }

    // Second priority: Use GOOGLE_APPLICATION_CREDENTIALS environment variable
    if (env.GOOGLE_APPLICATION_CREDENTIALS != null) {
      console.log('Using GOOGLE_APPLICATION_CREDENTIALS:', env.GOOGLE_APPLICATION_CREDENTIALS);
      return admin.credential.applicationDefault();
    }

    // Third priority: Use environment variables for service account
    if (
      env.FIREBASE_CLIENT_EMAIL != null &&
      env.FIREBASE_PRIVATE_KEY != null &&
      env.FIREBASE_PROJECT_ID != null
    ) {
      console.log('Using Firebase credentials from environment variables');
      return admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    }

    // Last resort: Default to application default credentials
    console.log('Using application default credentials');
    return admin.credential.applicationDefault();
  }

  auth(): admin.auth.Auth {
    if (!this.app) {
      throw new Error(FIREBASE_NOT_INITIALIZED_ERROR);
    }
    return admin.auth(this.app);
  }

  firestore(): admin.firestore.Firestore {
    if (!this.app) {
      throw new Error(FIREBASE_NOT_INITIALIZED_ERROR);
    }
    return admin.firestore(this.app);
  }

  storage(): admin.storage.Storage {
    if (!this.app) {
      throw new Error(FIREBASE_NOT_INITIALIZED_ERROR);
    }
    return admin.storage(this.app);
  }
}

export const firebaseAdmin = new FirebaseAdmin();
