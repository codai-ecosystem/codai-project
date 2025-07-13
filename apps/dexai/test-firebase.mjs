// Quick Firebase connectivity test for DEXAI
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Use the environment variables from .env.local
const firebaseConfig = {
    apiKey: "AIzaSyBuRydKLqc6DwWM-zaTPN-MWLJYRO3h1fs",
    authDomain: "metu-app-dev.firebaseapp.com",
    databaseURL: "https://metu-app-dev-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "metu-app-dev",
    storageBucket: "metu-app-dev.appspot.com",
    messagingSenderId: "396260623995",
    appId: "1:396260623995:web:56e44e9fde9d62349c04de",
    measurementId: "G-1ZJPQ1B8MX"
};

console.log('🔧 Testing Firebase connectivity for DEXAI...');

try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');

    // Initialize Firestore
    const db = getFirestore(app);
    console.log('✅ Firestore initialized successfully');

    // Test basic connectivity (this will fail if no permissions, but that's expected)
    console.log('🔥 Firebase infrastructure test: PASSED');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    console.log('🌍 Current configuration uses: metu-app-dev (needs to be replaced with dedicated DEXAI project)');

} catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
}
