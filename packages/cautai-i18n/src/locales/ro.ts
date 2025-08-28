/**
 * @fileoverview Romanian Language Pack
 * @author Cautai Team
 * @version 1.0.0
 */

import type { TranslationKeys, LanguageConfig } from '../types';

export const roConfig: LanguageConfig = {
  code: 'ro',
  name: 'Romanian',
  nativeName: 'Română',
  direction: 'ltr',
  region: 'RO',
  dateFormat: 'DD.MM.YYYY',
  timeFormat: 'HH:mm',
  numberFormat: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
};

export const roTranslations: TranslationKeys = {
  common: {
    search: 'Caută',
    loading: 'Se încarcă...',
    error: 'Eroare',
    retry: 'Reîncearcă',
    cancel: 'Anulează',
    clear: 'Șterge',
    settings: 'Setări',
    language: 'Limbă',
    help: 'Ajutor',
    about: 'Despre',
    version: 'Versiune',
    close: 'Închide',
    save: 'Salvează',
    delete: 'Șterge',
    edit: 'Editează',
    back: 'Înapoi',
    next: 'Următorul',
    previous: 'Precedentul',
    continue: 'Continuă',
    finish: 'Finalizează'
  },

  search: {
    placeholder: 'Caută orice...',
    button: 'Caută',
    noResults: 'Niciun rezultat găsit',
    resultsCount: '{{count}} rezultate găsite',
    filtering: 'Se filtrează rezultatele',
    sortBy: 'Sortează după',
    relevance: 'Relevanță',
    date: 'Dată',
    quality: 'Calitate',
    searchAgain: 'Caută din nou',
    refineSearch: 'Rafinează căutarea',
    suggestions: 'Sugestii',
    recent: 'Căutări recente',
    popular: 'Căutări populare',
    advanced: 'Căutare avansată',
    filters: 'Filtre',
    dateRange: 'Intervalul de timp',
    contentType: 'Tipul de conținut',
    domain: 'Domeniu',
    language: 'Limbă',
    region: 'Regiune'
  },

  results: {
    title: 'Rezultate',
    snippet: 'Fragment',
    source: 'Sursă',
    readMore: 'Citește mai mult',
    openLink: 'Deschide linkul',
    cached: 'În cache',
    similar: 'Similar',
    related: 'Conexe',
    metadata: 'Metadate',
    wordCount: 'Numărul de cuvinte',
    readingTime: 'Timpul de lectură',
    publishedAt: 'Publicat',
    lastModified: 'Ultima modificare',
    author: 'Autor',
    category: 'Categorie',
    tags: 'Etichete',
    score: 'Scor',
    relevanceScore: 'Scorul de relevanță',
    qualityScore: 'Scorul de calitate'
  },

  contentTypes: {
    article: 'Articol',
    video: 'Video',
    pdf: 'PDF',
    news: 'Știri',
    blog: 'Blog',
    documentation: 'Documentație',
    reference: 'Referință',
    code: 'Cod',
    academic: 'Academic',
    social: 'Social'
  },

  errors: {
    networkError: 'Eroare de conexiune la rețea',
    searchFailed: 'Căutarea a eșuat',
    invalidQuery: 'Interogare de căutare invalidă',
    rateLimited: 'Prea multe cereri. Vă rugăm să așteptați.',
    timeout: 'Cererea a expirat',
    unavailable: 'Serviciul nu este disponibil',
    forbidden: 'Acces interzis',
    notFound: 'Nu a fost găsit',
    serverError: 'Eroare de server',
    unknownError: 'A apărut o eroare necunoscută',
    tryAgain: 'Vă rugăm să încercați din nou',
    checkConnection: 'Verificați conexiunea la internet'
  },

  mcp: {
    serverStarted: 'Serverul MCP a pornit',
    serverStopped: 'Serverul MCP s-a oprit',
    toolExecuting: 'Se execută instrumentul...',
    toolCompleted: 'Instrumentul s-a executat cu succes',
    toolFailed: 'Execuția instrumentului a eșuat',
    connectionLost: 'Conexiunea s-a pierdut',
    reconnecting: 'Se reconectează...',
    connected: 'Conectat',
    disconnected: 'Deconectat'
  },

  cli: {
    welcome: 'Bun venit la Cautai CLI',
    enterQuery: 'Introduceți interogarea de căutare:',
    searchResults: 'Rezultate căutare',
    selectResult: 'Selectați un rezultat pentru a-l deschide',
    openResult: 'Se deschide rezultatul...',
    copyUrl: 'URL copiat în clipboard',
    newSearch: 'Începe o căutare nouă',
    exitPrompt: 'Apăsați Ctrl+C pentru a ieși',
    help: 'Ajutor',
    usage: 'Utilizare: cautai [interogare]',
    examples: 'Exemple',
    options: 'Opțiuni'
  },

  vscode: {
    searchTitle: 'Cautai Căutare',
    searchPlaceholder: 'Caută cu Cautai...',
    historyTitle: 'Istoric căutări',
    favoritesTitle: 'Favorite',
    settingsTitle: 'Setări',
    openInBrowser: 'Deschide în browser',
    copyToClipboard: 'Copiază în clipboard',
    addToFavorites: 'Adaugă la favorite',
    removeFromFavorites: 'Elimină din favorite',
    clearHistory: 'Șterge istoricul',
    exportResults: 'Exportă rezultatele',
    importSettings: 'Importă setările',
    extensionName: 'Extensia Cautai Search',
    extensionDescription: 'Căutare alimentată de AI pentru dezvoltatori'
  },

  web: {
    hero: {
      title: 'Cautai',
      subtitle: 'Motor de căutare AI-First',
      description: 'Descoperă informații cu căutare inteligentă alimentată de AI. Obține răspunsuri precise, nu doar linkuri.',
      getStarted: 'Începe',
      learnMore: 'Află mai multe',
      watchDemo: 'Urmărește demo-ul'
    },
    features: {
      title: 'Funcționalități puternice',
      aiPowered: {
        title: 'Rezultate alimentate de AI',
        description: 'Algoritmi avansați oferă clasificare inteligentă și răspunsuri contextuale'
      },
      privacyFirst: {
        title: 'Intimitatea pe primul loc',
        description: 'Fără urmărire, fără reclame, fără colectarea datelor personale'
      },
      multiInterface: {
        title: 'Interfețe multiple',
        description: 'Web, CLI, extensie VS Code și integrare server MCP'
      },
      realTime: {
        title: 'Căutare în timp real',
        description: 'Căutare rapidă și reactivă cu rezultate și sugestii instantanee'
      },
      customizable: {
        title: 'Personalizabil',
        description: 'Personalizează-ți experiența de căutare cu filtre și preferințe'
      },
      openSource: {
        title: 'Open Source',
        description: 'Dezvoltare transparentă, condusă de comunitate pe GitHub'
      }
    },
    footer: {
      copyright: '© 2025 Cautai. Toate drepturile rezervate.',
      privacy: 'Politica de confidențialitate',
      terms: 'Termeni și condiții',
      contact: 'Contact',
      documentation: 'Documentație',
      github: 'GitHub'
    },
    navigation: {
      home: 'Acasă',
      search: 'Caută',
      documentation: 'Documentație',
      api: 'API',
      pricing: 'Prețuri',
      contact: 'Contact',
      login: 'Autentificare',
      signup: 'Înregistrare'
    }
  },

  time: {
    seconds: 'secunde',
    minutes: 'minute',
    hours: 'ore',
    days: 'zile',
    weeks: 'săptămâni',
    months: 'luni',
    years: 'ani',
    ago: 'în urmă',
    just_now: 'acum',
    yesterday: 'ieri',
    today: 'azi',
    tomorrow: 'mâine'
  },

  formatting: {
    thousand: 'mii',
    million: 'mil',
    billion: 'mld',
    decimal_separator: ',',
    thousands_separator: '.'
  }
};