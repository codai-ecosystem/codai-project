// Test Firebase connectivity with new project
const firebaseConfig = {
    apiKey: 'AIzaSyBlZipS3ZUsKLPeWvGgAGl7gXFUWzXtA24',
    authDomain: 'dexai-dictionary.firebaseapp.com',
    projectId: 'dexai-dictionary',
    storageBucket: 'dexai-dictionary.firebasestorage.app',
    messagingSenderId: '999076628712',
    appId: '1:999076628712:web:5f2a1e09c12f41ad3a215d'
};

try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, addDoc, getDocs } = await import('firebase/firestore');

    console.log('🚀 Initializing Firebase with new DEXAI project...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Firebase initialized successfully!');

    // Test write access by adding a sample dictionary entry
    console.log('\n📝 Testing write access...');
    const dictCollection = collection(db, 'dictionary_entries');

    const sampleEntry = {
        word: 'test',
        definition: 'Un cuvânt de test pentru verificarea funcționalității',
        partOfSpeech: 'substantiv',
        etymology: 'Din engleză test',
        pronunciation: '[test]',
        frequency: 5,
        examples: ['Acesta este un test.'],
        synonyms: ['încercare'],
        antonyms: [],
        rhymes: ['fest', 'vest']
    };

    const docRef = await addDoc(dictCollection, sampleEntry);
    console.log('✅ Sample entry added with ID:', docRef.id);

    // Test read access
    console.log('\n📚 Testing read access...');
    const snapshot = await getDocs(dictCollection);
    console.log(`📊 Dictionary collection size: ${snapshot.size}`);

    if (snapshot.size > 0) {
        console.log('\n📖 Entries found:');
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`- ${doc.id}: ${data.word || 'No word field'}`);
        });
    }

    console.log('\n🎉 Firebase connectivity test SUCCESSFUL!');

} catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    console.error('Full error:', error);
}
