// Populate database with Romanian dictionary entries
const firebaseConfig = {
    apiKey: 'AIzaSyBlZipS3ZUsKLPeWvGgAGl7gXFUWzXtA24',
    authDomain: 'dexai-dictionary.firebaseapp.com',
    projectId: 'dexai-dictionary',
    storageBucket: 'dexai-dictionary.firebasestorage.app',
    messagingSenderId: '999076628712',
    appId: '1:999076628712:web:5f2a1e09c12f41ad3a215d'
};

const romanianEntries = [
    {
        word: 'casa',
        definition: 'Clădire destinată locuirii; locuință, cămin.',
        partOfSpeech: 'substantiv',
        etymology: 'Din latină casa',
        pronunciation: '[ˈka.sa]',
        frequency: 9.1,
        examples: [
            'Casa noastră este pe strada principală.',
            'Îmi place să stau acasă în weekend.'
        ],
        synonyms: ['locuință', 'cămin', 'domiciliu'],
        antonyms: ['stradă', 'exterior'],
        rhymes: ['masă', 'clasă', 'pasă']
    },
    {
        word: 'dragoste',
        definition: 'Sentiment puternic de atracție și afecțiune față de o persoană.',
        partOfSpeech: 'substantiv',
        etymology: 'Din slavona dragostь',
        pronunciation: '[draˈɡos.te]',
        frequency: 7.2,
        examples: [
            'Dragostea lor a durat o viață întreagă.',
            'Prima dragoste nu se uită niciodată.'
        ],
        synonyms: ['iubire', 'afecțiune', 'pasiune'],
        antonyms: ['ură', 'dispreț'],
        rhymes: ['povestă', 'cinstă', 'tristă']
    },
    {
        word: 'carte',
        definition: 'Ansamblu de foi de hârtie tipărite și legate împreună.',
        partOfSpeech: 'substantiv',
        etymology: 'Din latină charta, din greaca χάρτης',
        pronunciation: '[ˈkar.te]',
        frequency: 8.5,
        examples: [
            'Am citit o carte foarte interesantă ieri.',
            'Biblioteca are mii de cărți valoroase.'
        ],
        synonyms: ['volum', 'lucrare', 'operă'],
        antonyms: ['manuscris'],
        rhymes: ['parte', 'artă', 'hartă']
    },
    {
        word: 'prietenie',
        definition: 'Relație de afecțiune și încredere între prieteni.',
        partOfSpeech: 'substantiv',
        etymology: 'Din franceză amitié',
        pronunciation: '[priˈe.te.ni.e]',
        frequency: 6.8,
        examples: [
            'Prietenia lor durează de peste 20 de ani.',
            'Prietenia adevărată este o comoară.'
        ],
        synonyms: ['camaraderie', 'amiciție'],
        antonyms: ['dușmănie', 'inimiciție'],
        rhymes: ['bucurie', 'mângâiere']
    },
    {
        word: 'frumos',
        definition: 'Care este plăcut la vedere; care produce o impresie estetică favorabilă.',
        partOfSpeech: 'adjectiv',
        etymology: 'Din latină formosus',
        pronunciation: '[fruˈmos]',
        frequency: 8.9,
        examples: [
            'Peisajul din munți este foarte frumos.',
            'Ea poartă o rochie frumoasă.'
        ],
        synonyms: ['plăcut', 'atrăgător', 'minunat'],
        antonyms: ['urât', 'respingător'],
        rhymes: ['dumos', 'spumos']
    }
];

try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');

    console.log('🚀 Populating Firebase with Romanian dictionary entries...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const dictCollection = collection(db, 'dictionary_entries');

    for (const entry of romanianEntries) {
        const docRef = await addDoc(dictCollection, entry);
        console.log(`✅ Added "${entry.word}" with ID: ${docRef.id}`);
    }

    console.log('\n🎉 Database populated successfully with Romanian dictionary entries!');

} catch (error) {
    console.error('❌ Population failed:', error.message);
}
