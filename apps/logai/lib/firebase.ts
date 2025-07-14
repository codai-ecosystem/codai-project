// Firebase Configuration for LOGAI Authentication
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Firebase configuration - In production, these should be environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "logai-demo.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "logai-demo",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "logai-demo.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:demo",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DEMO"
}

// Initialize Firebase (avoid multiple initialization)
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
} else {
    app = getApps()[0]
}

// Initialize Firebase services
export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics (only in browser environment)
export let analytics: any = null;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

// Auth persistence configuration
auth.settings.appVerificationDisabledForTesting = process.env.NODE_ENV === 'development'

export default app
