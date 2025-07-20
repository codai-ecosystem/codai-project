// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studiai-placeholder.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studiai-placeholder",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studiai-placeholder.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:placeholder",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PLACEHOLDER",
};

// Initialize Firebase only if we have a valid API key
let firebaseApp: any = null;
let firestoreDB: any = null;
let firebaseAuth: any = null;
let firebaseStorage: any = null;

// Helper functions for safe Firebase usage
export const getFirebaseAuth = () => {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth not initialized. Please check your configuration.');
  }
  return firebaseAuth;
};

export const getFirestoreDB = () => {
  if (!firestoreDB) {
    throw new Error('Firestore not initialized. Please check your configuration.');
  }
  return firestoreDB;
};

export const getFirebaseStorage = () => {
  if (!firebaseStorage) {
    throw new Error('Firebase Storage not initialized. Please check your configuration.');
  }
  return firebaseStorage;
};

export const isFirebaseInitialized = () => {
  return firebaseApp !== null && firebaseAuth !== null && firestoreDB !== null && firebaseStorage !== null;
};

try {
  if (firebaseConfig.apiKey !== "placeholder-api-key") {
    firebaseApp = initializeApp(firebaseConfig);
    firestoreDB = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
  } else {
    console.warn("Firebase not properly configured - using placeholder values");
  }
} catch (error) {
  console.warn("Firebase initialization failed:", error);
}

export { firebaseApp, firestoreDB, firebaseAuth, firebaseStorage };
