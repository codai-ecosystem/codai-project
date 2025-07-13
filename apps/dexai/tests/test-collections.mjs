// Test different collection names to see what exists
const firebaseConfig = {
    apiKey: 'AIzaSyAu2B10s2GHj3gBtLVx50ehGgCaT71Targ',
    authDomain: 'aide-dev-461602.firebaseapp.com',
    projectId: 'aide-dev-461602',
    storageBucket: 'aide-dev-461602.firebasestorage.app',
    messagingSenderId: '1066635474984',
    appId: '1:1066635474984:web:45e3d2a792298f78b7dd1d',
    measurementId: 'G-J504BTY646'
};

const collectionsToTest = [
    'dictionary_entries',
    'dictionary',
    'entries',
    'words',
    'dictionaries',
    'romanian_words',
    'metu_words',
    'aide_dictionary'
];

try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs, limit, query } = await import('firebase/firestore');

    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase initialized successfully!');

    for (const collectionName of collectionsToTest) {
        try {
            console.log(`\n📚 Testing collection: ${collectionName}`);
            const coll = collection(db, collectionName);
            const q = query(coll, limit(1)); // Just try to get 1 document
            const snapshot = await getDocs(q);

            console.log(`✅ ${collectionName}: ${snapshot.size} documents (accessible)`);
            if (snapshot.size > 0) {
                const firstDoc = snapshot.docs[0];
                const data = firstDoc.data();
                console.log(`   Sample: ${firstDoc.id} -> ${JSON.stringify(data).substring(0, 100)}...`);
            }
        } catch (error) {
            console.log(`❌ ${collectionName}: ${error.code || error.message}`);
        }
    }

} catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
}
