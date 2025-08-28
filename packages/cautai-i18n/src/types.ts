/**
 * @fileoverview Internationalization Types
 * @author Cautai Team  
 * @version 1.0.0
 */

export interface TranslationKeys {
  // Common UI elements
  common: {
    search: string;
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    clear: string;
    settings: string;
    language: string;
    help: string;
    about: string;
    version: string;
    close: string;
    save: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    previous: string;
    continue: string;
    finish: string;
  };

  // Search functionality
  search: {
    placeholder: string;
    button: string;
    noResults: string;
    resultsCount: string;
    filtering: string;
    sortBy: string;
    relevance: string;
    date: string;
    quality: string;
    searchAgain: string;
    refineSearch: string;
    suggestions: string;
    recent: string;
    popular: string;
    advanced: string;
    filters: string;
    dateRange: string;
    contentType: string;
    domain: string;
    language: string;
    region: string;
  };

  // Results and content
  results: {
    title: string;
    snippet: string;
    source: string;
    readMore: string;
    openLink: string;
    cached: string;
    similar: string;
    related: string;
    metadata: string;
    wordCount: string;
    readingTime: string;
    publishedAt: string;
    lastModified: string;
    author: string;
    category: string;
    tags: string;
    score: string;
    relevanceScore: string;
    qualityScore: string;
  };

  // Content types
  contentTypes: {
    article: string;
    video: string;
    pdf: string;
    news: string;
    blog: string;
    documentation: string;
    reference: string;
    code: string;
    academic: string;
    social: string;
  };

  // Error messages
  errors: {
    networkError: string;
    searchFailed: string;
    invalidQuery: string;
    rateLimited: string;
    timeout: string;
    unavailable: string;
    forbidden: string;
    notFound: string;
    serverError: string;
    unknownError: string;
    tryAgain: string;
    checkConnection: string;
  };

  // MCP specific
  mcp: {
    serverStarted: string;
    serverStopped: string;
    toolExecuting: string;
    toolCompleted: string;
    toolFailed: string;
    connectionLost: string;
    reconnecting: string;
    connected: string;
    disconnected: string;
  };

  // CLI specific
  cli: {
    welcome: string;
    enterQuery: string;
    searchResults: string;
    selectResult: string;
    openResult: string;
    copyUrl: string;
    newSearch: string;
    exitPrompt: string;
    help: string;
    usage: string;
    examples: string;
    options: string;
  };

  // VS Code extension specific
  vscode: {
    searchTitle: string;
    searchPlaceholder: string;
    historyTitle: string;
    favoritesTitle: string;
    settingsTitle: string;
    openInBrowser: string;
    copyToClipboard: string;
    addToFavorites: string;
    removeFromFavorites: string;
    clearHistory: string;
    exportResults: string;
    importSettings: string;
    extensionName: string;
    extensionDescription: string;
  };

  // Web frontend specific
  web: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      getStarted: string;
      learnMore: string;
      watchDemo: string;
    };
    features: {
      title: string;
      aiPowered: {
        title: string;
        description: string;
      };
      privacyFirst: {
        title: string;
        description: string;
      };
      multiInterface: {
        title: string;
        description: string;
      };
      realTime: {
        title: string;
        description: string;
      };
      customizable: {
        title: string;
        description: string;
      };
      openSource: {
        title: string;
        description: string;
      };
    };
    footer: {
      copyright: string;
      privacy: string;
      terms: string;
      contact: string;
      documentation: string;
      github: string;
    };
    navigation: {
      home: string;
      search: string;
      documentation: string;
      api: string;
      pricing: string;
      contact: string;
      login: string;
      signup: string;
    };
  };

  // Time and date formatting
  time: {
    seconds: string;
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
    ago: string;
    just_now: string;
    yesterday: string;
    today: string;
    tomorrow: string;
  };

  // Numbers and formatting
  formatting: {
    thousand: string;
    million: string;
    billion: string;
    decimal_separator: string;
    thousands_separator: string;
  };
}

export type Language = 'en' | 'ro';
export type TranslationFunction = (key: string, params?: Record<string, any>) => string;
export type LanguageDirection = 'ltr' | 'rtl';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  direction: LanguageDirection;
  region?: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}

export interface I18nConfig {
  defaultLanguage: Language;
  fallbackLanguage: Language;
  supportedLanguages: Language[];
  storageKey: string;
  detectBrowserLanguage: boolean;
  interpolation: {
    prefix: string;
    suffix: string;
    escapeValue: boolean;
  };
}

export interface I18nContext {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationFunction;
  isLoading: boolean;
  error: string | null;
}