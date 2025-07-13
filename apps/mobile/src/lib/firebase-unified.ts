/**
 * Firebase Configuration Module
 *
 * Centralized, secure, and type-safe Firebase initialization
 * with comprehensive error handling and environment validation.
 */

import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  type Analytics,
} from 'firebase/analytics';
import {
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
  connectDatabaseEmulator,
  getDatabase,
  type Database,
} from 'firebase/database';
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from 'firebase/functions';
import {
  getMessaging,
  isSupported as isMessagingSupported,
  type Messaging,
} from 'firebase/messaging';
import { getRemoteConfig, type RemoteConfig } from 'firebase/remote-config';
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from 'firebase/storage';

// Environment and validation utilities
import {
  getFirebaseConfig as getEnvFirebaseConfig,
  isFirebaseConfigComplete,
} from '@/lib/env';
import { logger } from '@/lib/logger';

/**
 * Firebase service instances
 */
interface FirebaseServices {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  database: Database | null;
  storage: FirebaseStorage | null;
  functions: Functions | null;
  messaging: Messaging | null;
  analytics: Analytics | null;
  remoteConfig: RemoteConfig | null;
}

/**
 * Firebase initialization state
 */
interface FirebaseState {
  initialized: boolean;
  services: FirebaseServices;
  errors: string[];
}

// Global Firebase state
const firebaseState: FirebaseState = {
  initialized: false,
  services: {
    app: null,
    auth: null,
    db: null,
    database: null,
    storage: null,
    functions: null,
    messaging: null,
    analytics: null,
    remoteConfig: null,
  },
  errors: [],
};

/**
 * Get validated Firebase configuration
 */
function getFirebaseConfig(): FirebaseOptions | null {
  try {
    if (!isFirebaseConfigComplete()) {
      // In production, we should fail fast rather than use mock values
      if (process.env['NODE_ENV'] === 'production') {
        logger.error(
          'Firebase configuration incomplete in production environment'
        );
        throw new Error(
          'Firebase configuration is incomplete. Please ensure all required environment variables are set in production.'
        );
      }

      logger.warn(
        'Firebase configuration incomplete, using mock values for development'
      );
      return {
        apiKey: 'mock-api-key-for-development',
        authDomain: 'mock-project-dev.firebaseapp.com',
        projectId: 'mock-project-dev',
        storageBucket: 'mock-project-dev.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:mock-dev',
        measurementId: 'G-MOCK-DEV',
      };
    }

    // Use the validated config from the environment module
    const envConfig = getEnvFirebaseConfig();

    // Handle the case where Firebase is disabled
    if (!envConfig) {
      console.warn(
        'Firebase configuration not available - Firebase is disabled or not configured'
      );
      return null;
    }

    // Convert to FirebaseOptions format with proper type handling
    const config: FirebaseOptions = {
      apiKey: envConfig.apiKey,
      authDomain: envConfig.authDomain,
      projectId: envConfig.projectId,
      storageBucket: envConfig.storageBucket,
      messagingSenderId: envConfig.messagingSenderId,
      appId: envConfig.appId,
    };

    // Add optional properties only if they exist
    if (envConfig.measurementId != null && envConfig.measurementId !== '') {
      config.measurementId = envConfig.measurementId;
    }

    if (envConfig.databaseURL != null && envConfig.databaseURL !== '') {
      config.databaseURL = envConfig.databaseURL;
    }

    return config;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to get Firebase configuration', {
      error: errorMessage,
    });
    return null;
  }
}

/**
 * Interface defining emulator host configuration
 */
interface EmulatorHosts {
  auth: string;
  firestore: string;
  storage: string;
  database: string;
  functions: string;
}

/**
 * Get emulator host configuration from environment variables
 * This reads from standard Firebase emulator environment variables
 * and falls back to default values if not defined
 */
function getEmulatorHosts(): EmulatorHosts {
  return {
    auth: process.env['FIREBASE_AUTH_EMULATOR_HOST'] || 'localhost:9099',
    firestore: process.env['FIRESTORE_EMULATOR_HOST'] || 'localhost:8080',
    storage: process.env['FIREBASE_STORAGE_EMULATOR_HOST'] || 'localhost:9199',
    database:
      process.env['FIREBASE_DATABASE_EMULATOR_HOST'] || 'localhost:9000',
    functions:
      process.env['FIREBASE_FUNCTIONS_EMULATOR_HOST'] || 'localhost:5001',
  };
}

/**
 * Connect to Firebase emulators in development mode
 */
function connectEmulators(
  auth: Auth,
  db: Firestore,
  storage: FirebaseStorage,
  app: FirebaseApp
): void {
  if (typeof window === 'undefined') {
    logger.info('Firebase emulators skipped on server-side');
    return;
  }

  // Only enable emulators in development by default
  const isDevEnv = process.env['NODE_ENV'] === 'development';

  const useEmulators =
    process.env['NEXT_PUBLIC_USE_EMULATORS'] === 'true' ||
    (isDevEnv && process.env['NEXT_PUBLIC_USE_EMULATORS'] !== 'false');

  if (!useEmulators) {
    logger.info('Firebase emulators disabled');
    return;
  }

  try {
    // Check if emulators are already connected (simplified check)
    const authConfig = auth.config as { emulator?: unknown };
    if (authConfig.emulator != null) {
      logger.info('Firebase emulators already connected');
      return;
    }

    // Get emulator hosts from environment
    const emulatorHosts = getEmulatorHosts();

    // Parse host and port for each emulator
    const parseHostPort = (
      hostPortString: string
    ): { host: string; port: number } => {
      const [host, portStr] = hostPortString.split(':');
      return {
        host: host || 'localhost',
        port: Number(portStr || '0'),
      };
    };

    // Connect to Auth emulator
    try {
      const { host, port } = parseHostPort(emulatorHosts.auth);
      connectAuthEmulator(auth, `http://${host}:${port}`, {
        disableWarnings: true,
      });
      logger.info('Firebase Auth emulator connected', {
        context: { host, port },
      });
    } catch (authError) {
      logger.warn('Auth emulator connection failed', {
        context: { error: String(authError) },
      });
    }

    // Connect to Firestore emulator
    try {
      const { host, port } = parseHostPort(emulatorHosts.firestore);
      connectFirestoreEmulator(db, host, port);
      logger.info('Firebase Firestore emulator connected', {
        context: { host, port },
      });
    } catch (firestoreError) {
      logger.warn('Firestore emulator connection failed', {
        context: { error: String(firestoreError) },
      });
    }

    // Connect to Storage emulator
    try {
      const { host, port } = parseHostPort(emulatorHosts.storage);
      connectStorageEmulator(storage, host, port);
      logger.info('Firebase Storage emulator connected', {
        context: { host, port },
      });
    } catch (storageError) {
      logger.warn('Storage emulator connection failed', {
        context: { error: String(storageError) },
      });
    }

    // Connect to Realtime Database emulator (if exists)
    try {
      const database = getDatabase(app);
      if (database) {
        const { host, port } = parseHostPort(emulatorHosts.database);
        connectDatabaseEmulator(database, host, port);
        // Add to global state since we're initializing it here
        firebaseState.services.database = database;
        logger.info('Firebase Database emulator connected', {
          context: { host, port },
        });
      }
    } catch (dbError) {
      logger.warn('Database emulator connection skipped', {
        context: { error: String(dbError) },
      });
    }

    // Connect to Functions emulator (if exists)
    try {
      const functions = getFunctions(app);
      if (functions) {
        const { host, port } = parseHostPort(emulatorHosts.functions);
        connectFunctionsEmulator(functions, host, port);
        // Add to global state since we're initializing it here
        firebaseState.services.functions = functions;
        logger.info('Firebase Functions emulator connected', {
          context: { host, port },
        });
      }
    } catch (functionsError) {
      logger.warn('Functions emulator connection skipped', {
        context: { error: String(functionsError) },
      });
    }

    logger.info('Firebase emulators connected successfully');
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Failed to connect Firebase emulators', {
      context: { error: errorMessage },
    });
  }
}

/**
 * Initialize Firebase services
 */
async function initializeFirebase(): Promise<void> {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    logger.warn('Firebase initialization skipped on server-side');
    return;
  }

  // Prevent double initialization
  if (firebaseState.initialized) {
    logger.info('Firebase already initialized');
    return;
  }

  try {
    // Get Firebase configuration
    const config = getFirebaseConfig();
    if (config == null) {
      throw new Error('Firebase configuration is invalid');
    }

    // Initialize Firebase app
    const existingApps = getApps();
    const app =
      existingApps.length === 0 ? initializeApp(config) : existingApps[0];

    if (app == null) {
      throw new Error('Failed to initialize Firebase app');
    }

    // Initialize core services
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    // Initialize additional services if needed
    let database: Database | null = null;
    let functions: Functions | null = null;
    let remoteConfig: RemoteConfig | null = null;

    // Initialize database if databaseURL is provided
    if (config.databaseURL) {
      try {
        database = getDatabase(app);
        logger.info('Firebase database initialized');
      } catch (dbError) {
        logger.warn('Failed to initialize Firebase database', {
          context: { error: String(dbError) },
        });
      }
    }

    // Initialize functions
    try {
      functions = getFunctions(app);
      logger.info('Firebase functions initialized');
    } catch (funcError) {
      logger.warn('Failed to initialize Firebase functions', {
        context: { error: String(funcError) },
      });
    }

    // Initialize Remote Config
    try {
      remoteConfig = getRemoteConfig(app);
      // Configure Remote Config
      remoteConfig.settings = {
        minimumFetchIntervalMillis: 3600000, // 1 hour
        fetchTimeoutMillis: 60000, // 1 minute
      };
      logger.info('Firebase remote config initialized');
    } catch (rcError) {
      logger.warn('Failed to initialize Firebase remote config', {
        context: { error: String(rcError) },
      });
    }

    // Connect emulators in development
    connectEmulators(auth, db, storage, app);

    // Initialize optional services
    let messaging: Messaging | null = null;
    let analytics: Analytics | null = null;

    // Messaging (only if supported)
    try {
      const messagingSupported = await isMessagingSupported();
      if (messagingSupported) {
        messaging = getMessaging(app);
        logger.info('Firebase messaging initialized');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.warn('Firebase messaging not available', {
        context: { error: errorMessage },
      });
    }

    // Analytics (only if supported and in production)
    try {
      const analyticsSupported = await isAnalyticsSupported();
      if (analyticsSupported && process.env['NODE_ENV'] === 'production') {
        analytics = getAnalytics(app);
        logger.info('Firebase analytics initialized');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.warn('Firebase analytics not available', {
        context: { error: errorMessage },
      });
    }

    // Update global state
    firebaseState.services = {
      app,
      auth,
      db,
      database,
      storage,
      functions,
      messaging,
      analytics,
      remoteConfig,
    };
    firebaseState.initialized = true;
    firebaseState.errors = [];
    logger.info('Firebase initialized successfully', {
      context: {
        services: {
          auth: Boolean(auth),
          firestore: Boolean(db),
          database: Boolean(database),
          storage: Boolean(storage),
          functions: Boolean(functions),
          messaging: Boolean(messaging),
          analytics: Boolean(analytics),
          remoteConfig: Boolean(remoteConfig),
        },
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Firebase initialization failed', { error: errorMessage });

    firebaseState.errors.push(errorMessage);
    firebaseState.initialized = false;
  }
}

/**
 * Get Firebase service with error handling
 */
function getFirebaseService<T extends keyof FirebaseServices>(
  serviceName: T
): FirebaseServices[T] {
  if (!firebaseState.initialized) {
    // Only log warning if we're not in the initial loading phase (client-side)
    if (typeof window !== 'undefined') {
      // Give a short grace period for initialization
      setTimeout(() => {
        if (!firebaseState.initialized) {
          logger.warn(
            `Firebase ${serviceName} requested before initialization`
          );
        }
      }, 500);
    }
    return null;
  }

  const service = firebaseState.services[serviceName];
  if (service == null) {
    logger.warn(`Firebase ${serviceName} is not available`);
  }

  return service;
}

// Initialize Firebase on client-side
if (typeof window !== 'undefined') {
  // Initialize immediately to avoid "requested before initialization" warnings
  // Use this pattern to ensure Firebase is initialized before any hooks try to use it
  const initializeFirebasePromise = initializeFirebase();

  // Expose the promise for components that need to wait for initialization
  (
    window as unknown as { __FIREBASE_INIT_PROMISE__: Promise<void> }
  ).__FIREBASE_INIT_PROMISE__ = initializeFirebasePromise;
}

// Service getters with type safety
export const getFirebaseApp = (): FirebaseApp | null =>
  getFirebaseService('app');
export const getFirebaseAuth = (): Auth | null => getFirebaseService('auth');
export const getFirestoreDb = (): Firestore | null => getFirebaseService('db');
export const getFirebaseDatabase = (): Database | null =>
  getFirebaseService('database');
export const getFirebaseStorage = (): FirebaseStorage | null =>
  getFirebaseService('storage');
export const getFirebaseFunctions = (): Functions | null =>
  getFirebaseService('functions');
export const getFirebaseMessaging = (): Messaging | null =>
  getFirebaseService('messaging');
export const getFirebaseAnalytics = (): Analytics | null =>
  getFirebaseService('analytics');
export const getFirebaseRemoteConfig = (): RemoteConfig | null =>
  getFirebaseService('remoteConfig');

// Status checkers
export const isFirebaseInitialized = (): boolean => firebaseState.initialized;
export const isMessagingAvailable = (): boolean =>
  Boolean(firebaseState.services.messaging);
export const isAnalyticsAvailable = (): boolean =>
  Boolean(firebaseState.services.analytics);
export const isRemoteConfigAvailable = (): boolean =>
  Boolean(firebaseState.services.remoteConfig);

// Error handling
export const getFirebaseErrors = (): string[] => [...firebaseState.errors];
export const hasFirebaseErrors = (): boolean => firebaseState.errors.length > 0;

// Legacy exports for backward compatibility
// Use getters for lazy initialization and hydration compatibility
export const app = typeof window !== 'undefined' ? getFirebaseApp() : null;
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null;
export const db = typeof window !== 'undefined' ? getFirestoreDb() : null;
export const database =
  typeof window !== 'undefined' ? getFirebaseDatabase() : null;
export const storage =
  typeof window !== 'undefined' ? getFirebaseStorage() : null;
export const functions =
  typeof window !== 'undefined' ? getFirebaseFunctions() : null;
export const messaging =
  typeof window !== 'undefined' ? getFirebaseMessaging() : null;
export const analytics =
  typeof window !== 'undefined' ? getFirebaseAnalytics() : null;
export const remoteConfig =
  typeof window !== 'undefined' ? getFirebaseRemoteConfig() : null;

// Re-initialize function for testing
export const reinitializeFirebase = async (): Promise<void> => {
  firebaseState.initialized = false;
  firebaseState.services = {
    app: null,
    auth: null,
    db: null,
    database: null,
    storage: null,
    functions: null,
    messaging: null,
    analytics: null,
    remoteConfig: null,
  };
  firebaseState.errors = [];
  await initializeFirebase();
};

export type { FirebaseServices, FirebaseState };
