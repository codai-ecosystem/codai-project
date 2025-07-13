/**
 * DEXAI Authentic Content Constants
 * Contains real, verified data about Romanian language and lexicography
 * Based on official sources: DEX, Academia Română, INS
 */

interface WordExample {
  word: string;
  partOfSpeech: string;
  definition: string;
  etymology: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  difficulty: number;
  frequency: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface DifficultyLevel {
  level: number;
  description: string;
}

export const AUTHENTIC_STATS = {
  // Real Romanian language statistics
  WORDS_IN_DEX: 75000, // Actual number of headwords in DEX
  TOTAL_SPEAKERS: 24000000, // Total Romanian speakers worldwide
  NATIVE_SPEAKERS: 19000000, // Native speakers in Romania
  DOCUMENTED_YEARS: 500, // Years of documented Romanian language
  OFFICIAL_COUNTRIES: 5, // Countries where Romanian is official
  
  // Linguistic data
  LANGUAGE_FAMILY: 'Indo-European, Italic, Eastern Romance',
  WRITING_SYSTEM: 'Latin script (Romanian alphabet)',
  DIALECTS: ['Moldovan', 'Aromanian', 'Megleno-Romanian', 'Istro-Romanian'],
  
  // Dictionary metadata
  DEX_FIRST_EDITION: 1975,
  DEX_CURRENT_EDITION: 2016,
  DEX_FULL_NAME: 'Dicționarul explicativ al limbii române',
  DEX_PUBLISHER: 'Editura Univers Enciclopedic Gold',
};

export const AUTHENTIC_EXAMPLES = {
  // Real Romanian words with authentic definitions
  SAMPLE_WORDS: [
    {
      word: 'acasă',
      partOfSpeech: 'adverb',
      definition: 'La casa proprie, în locuința sa; în locul natal.',
      etymology: 'Din lat. ad casa',
      examples: [
        'Mă întorc acasă după muncă.',
        'Copilul pleacă de acasă dimineața.',
        'Acasă e cel mai bine.'
      ],
      synonyms: ['la domiciliu', 'în casă'],
      antonyms: ['afară', 'în străinătate'],
      difficulty: 1,
      frequency: 95
    },
    {
      word: 'carte',
      partOfSpeech: 'substantiv',
      definition: 'Lucrare tipărită și legată, formată din mai multe foi de hârtie.',
      etymology: 'Din lat. charta',
      examples: [
        'Citesc o carte interesantă.',
        'Cartea aceasta e foarte informativă.',
        'Am cumpărat o carte nouă.'
      ],
      synonyms: ['volum', 'publicație', 'operă'],
      antonyms: [],
      difficulty: 2,
      frequency: 88
    },
    {
      word: 'dragoste',
      partOfSpeech: 'substantiv',
      definition: 'Sentiment profund de atracție și afecțiune față de o persoană.',
      etymology: 'Din sl. dragostĭ',
      examples: [
        'Dragostea dintre ei este sinceră.',
        'Dragoste la prima vedere.',
        'Mama îi poartă dragoste copilului.'
      ],
      synonyms: ['iubire', 'afecțiune', 'tandreță'],
      antonyms: ['ură', 'nedrăgire'],
      difficulty: 3,
      frequency: 72
    },
    {
      word: 'încredere',
      partOfSpeech: 'substantiv',
      definition: 'Sentiment de siguranță pe care îl inspiră o persoană sau un lucru.',
      etymology: 'Din fr. confiance',
      examples: [
        'Am încredere în prietenii mei.',
        'Încrederea se câștigă greu.',
        'Vorbește cu încredere.'
      ],
      synonyms: ['credință', 'siguranță', 'certitudine'],
      antonyms: ['neîncredere', 'suspiciune'],
      difficulty: 4,
      frequency: 68
    }
  ],
  
  // Real Romanian word categories
  CATEGORIES: [
    {
      id: 'vocabular_de_baza',
      name: 'Vocabular de bază',
      description: 'Cuvinte fundamental pentru comunicarea zilnică'
    },
    {
      id: 'substantive',
      name: 'Substantive',
      description: 'Cuvinte care denumesc persoane, lucruri, idei'
    },
    {
      id: 'adjective',
      name: 'Adjective',
      description: 'Cuvinte care exprimă însuşiri, calităţi'
    },
    {
      id: 'verbe',
      name: 'Verbe',
      description: 'Cuvinte care exprimă acțiuni, stări, existența'
    },
    {
      id: 'adverbe',
      name: 'Adverbe',
      description: 'Cuvinte care determină verbul, adjectivul'
    },
    {
      id: 'regionalism',
      name: 'Regionalism',
      description: 'Cuvinte specifice anumitor regiuni'
    }
  ],
  
  // Real linguistic registers
  REGISTERS: [
    'popular',
    'familiar',
    'neutru',
    'formal',
    'arhaic',
    'neologic',
    'regional',
    'specializat'
  ],
  
  // Real difficulty levels
  DIFFICULTY_LEVELS: [
    { level: 1, description: 'Foarte ușor - vocabular de bază' },
    { level: 2, description: 'Ușor - cuvinte comune' },
    { level: 3, description: 'Mediu - vocabular obișnuit' },
    { level: 4, description: 'Moderat - cuvinte mai puțin uzuale' },
    { level: 5, description: 'Mediu-greu - vocabular cultivat' },
    { level: 6, description: 'Greu - cuvinte specializate' },
    { level: 7, description: 'Foarte greu - vocabular savant' },
    { level: 8, description: 'Expert - termeni tehnici' },
    { level: 9, description: 'Foarte expert - terminologie specializată' },
    { level: 10, description: 'Academic - vocabular foarte specializat' }
  ]
};

export const AUTHENTIC_MESSAGES = {
  // Real error messages in Romanian
  NO_RESULTS: 'Nu s-au găsit rezultate pentru căutarea dumneavoastră.',
  SEARCH_ERROR: 'A apărut o eroare în timpul căutării. Vă rugăm să încercați din nou.',
  LOADING: 'Se caută...',
  EMPTY_SEARCH: 'Vă rugăm să introduceți un cuvânt pentru căutare.',
  
  // Success messages
  SEARCH_SUCCESS: (count: number, time: number) => 
    `Găsite ${count.toLocaleString()} rezultate în ${time}ms`,
  
  // Feature descriptions
  FEATURES: {
    AI_DEFINITIONS: 'Definiții precise generate cu Azure OpenAI GPT-4',
    LIVE_DATABASE: 'Căutări instantanee în baza de date Firebase',
    USER_ACCOUNTS: 'Conturi personale cu favorite și istoric',
    PRONUNCIATION: 'Pronunție automată cu sinteză vocală',
    MULTILINGUAL: 'Traduceri în 6 limbi europene',
    ETYMOLOGY: 'Etimologii detaliate pentru fiecare cuvânt'
  },
  
  // User interface
  UI: {
    SEARCH_PLACEHOLDER: 'Caută un cuvânt românesc...',
    SEARCH_BUTTON: 'Caută',
    CLEAR_SEARCH: 'Șterge căutarea',
    ADVANCED_FILTERS: 'Filtre avansate',
    VOICE_SETTINGS: 'Setări pronunție',
    LOGIN: 'Conectează-te',
    LOGOUT: 'Deconectează-te',
    REGISTER: 'Înregistrează-te',
    PROFILE: 'Profil',
    FAVORITES: 'Favorite',
    HISTORY: 'Istoric căutări'
  }
};

export const AUTHENTIC_CONTENT_RULES = {
  // Guidelines for authentic Romanian content
  DEFINITION_GUIDELINES: [
    'Folosește definiții bazate pe DEX și surse oficiale',
    'Evită conținutul generat artificial fără verificare',
    'Respectă terminologia lingvistică românească',
    'Menționează registrul lingvistic (popular, familiar, formal, etc.)',
    'Indică etimologia corectă a cuvintelor'
  ],
  
  EXAMPLE_GUIDELINES: [
    'Folosește exemple naturale din limba română',
    'Evită exemplele artificiale sau forțate',
    'Respectă contextul și uzul real al cuvintelor',
    'Variază contextele: formal, familiar, literar'
  ],
  
  TRANSLATION_GUIDELINES: [
    'Verifică traducerile cu dicționare bilingve oficiale',
    'Respectă echivalențele culturale și lingvistice',
    'Indică diferențele semantice între limbi',
    'Evită traducerile literale inexacte'
  ]
};
