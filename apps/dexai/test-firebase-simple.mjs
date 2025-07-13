// Direct Firebase test without dotenv
console.log('🔧 Environment Variables Check:');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('API_KEY present:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

const firebaseConfig = {
    apiKey: 'AIzaSyAu2B10s2GHj3gBtLVx50ehGgCaT71Targ',
    authDomain: 'aide-dev-461602.firebaseapp.com',
    projectId: 'aide-dev-461602',
    storageBucket: 'aide-dev-461602.firebasestorage.app',
    messagingSenderId: '1066635474984',
    appId: '1:1066635474984:web:45e3d2a792298f78b7dd1d',
    measurementId: 'G-J504BTY646'
};

try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');

    console.log('\n🚀 Initializing Firebase with hardcoded config...');
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
    console.error('Full error:', error);
}
