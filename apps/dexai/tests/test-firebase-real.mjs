// Test script to verify Firebase connectivity
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the web app's .env.local
config({ path: resolve('.env.local') });

console.log('🔧 Environment Variables Check:');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 20) + '...');
console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

// Try to initialize Firebase
try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    console.log('\n🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase initialized successfully!');

    // Try to read from the dictionary collection
    console.log('\n📚 Testing Firestore access...');
    const dictCollection = collection(db, 'dictionary_entries');
    const snapshot = await getDocs(dictCollection);

    console.log(`📊 Dictionary collection size: ${snapshot.size}`);

    if (snapshot.size > 0) {
        console.log('\n📖 Sample entries:');
        snapshot.docs.slice(0, 3).forEach(doc => {
            const data = doc.data();
            console.log(`- ${doc.id}: ${data.word || 'No word field'}`);
        });
    } else {
        console.log('⚠️  Dictionary collection is empty!');
    }

} catch (error) {
    console.error('❌ Firebase test failed:', error.message);
}
