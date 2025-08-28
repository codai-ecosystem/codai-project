/**
 * @fileoverview English Language Pack
 * @author Cautai Team
 * @version 1.0.0
 */

import type { TranslationKeys, LanguageConfig } from '../types';

export const enConfig: LanguageConfig = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  direction: 'ltr',
  region: 'US',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: 'hh:mm A',
  numberFormat: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
};

export const enTranslations: TranslationKeys = {
  common: {
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    clear: 'Clear',
    settings: 'Settings',
    language: 'Language',
    help: 'Help',
    about: 'About',
    version: 'Version',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    continue: 'Continue',
    finish: 'Finish'
  },

  search: {
    placeholder: 'Search for anything...',
    button: 'Search',
    noResults: 'No results found',
    resultsCount: '{{count}} results found',
    filtering: 'Filtering results',
    sortBy: 'Sort by',
    relevance: 'Relevance',
    date: 'Date',
    quality: 'Quality',
    searchAgain: 'Search again',
    refineSearch: 'Refine search',
    suggestions: 'Suggestions',
    recent: 'Recent searches',
    popular: 'Popular searches',
    advanced: 'Advanced search',
    filters: 'Filters',
    dateRange: 'Date range',
    contentType: 'Content type',
    domain: 'Domain',
    language: 'Language',
    region: 'Region'
  },

  results: {
    title: 'Results',
    snippet: 'Snippet',
    source: 'Source',
    readMore: 'Read more',
    openLink: 'Open link',
    cached: 'Cached',
    similar: 'Similar',
    related: 'Related',
    metadata: 'Metadata',
    wordCount: 'Word count',
    readingTime: 'Reading time',
    publishedAt: 'Published',
    lastModified: 'Last modified',
    author: 'Author',
    category: 'Category',
    tags: 'Tags',
    score: 'Score',
    relevanceScore: 'Relevance score',
    qualityScore: 'Quality score'
  },

  contentTypes: {
    article: 'Article',
    video: 'Video',
    pdf: 'PDF',
    news: 'News',
    blog: 'Blog',
    documentation: 'Documentation',
    reference: 'Reference',
    code: 'Code',
    academic: 'Academic',
    social: 'Social'
  },

  errors: {
    networkError: 'Network connection error',
    searchFailed: 'Search failed',
    invalidQuery: 'Invalid search query',
    rateLimited: 'Too many requests. Please wait.',
    timeout: 'Request timed out',
    unavailable: 'Service unavailable',
    forbidden: 'Access forbidden',
    notFound: 'Not found',
    serverError: 'Server error',
    unknownError: 'Unknown error occurred',
    tryAgain: 'Please try again',
    checkConnection: 'Check your internet connection'
  },

  mcp: {
    serverStarted: 'MCP server started',
    serverStopped: 'MCP server stopped',
    toolExecuting: 'Executing tool...',
    toolCompleted: 'Tool completed successfully',
    toolFailed: 'Tool execution failed',
    connectionLost: 'Connection lost',
    reconnecting: 'Reconnecting...',
    connected: 'Connected',
    disconnected: 'Disconnected'
  },

  cli: {
    welcome: 'Welcome to Cautai CLI',
    enterQuery: 'Enter your search query:',
    searchResults: 'Search Results',
    selectResult: 'Select a result to open',
    openResult: 'Opening result...',
    copyUrl: 'URL copied to clipboard',
    newSearch: 'Start new search',
    exitPrompt: 'Press Ctrl+C to exit',
    help: 'Help',
    usage: 'Usage: cautai [query]',
    examples: 'Examples',
    options: 'Options'
  },

  vscode: {
    searchTitle: 'Cautai Search',
    searchPlaceholder: 'Search with Cautai...',
    historyTitle: 'Search History',
    favoritesTitle: 'Favorites',
    settingsTitle: 'Settings',
    openInBrowser: 'Open in Browser',
    copyToClipboard: 'Copy to Clipboard',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    clearHistory: 'Clear History',
    exportResults: 'Export Results',
    importSettings: 'Import Settings',
    extensionName: 'Cautai Search Extension',
    extensionDescription: 'AI-powered search for developers'
  },

  web: {
    hero: {
      title: 'Cautai',
      subtitle: 'AI-First Search Engine',
      description: 'Discover information with intelligent search powered by AI. Get precise answers, not just links.',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      watchDemo: 'Watch Demo'
    },
    features: {
      title: 'Powerful Features',
      aiPowered: {
        title: 'AI-Powered Results',
        description: 'Advanced algorithms provide intelligent ranking and contextual answers'
      },
      privacyFirst: {
        title: 'Privacy First',
        description: 'No tracking, no ads, no personal data collection'
      },
      multiInterface: {
        title: 'Multiple Interfaces',
        description: 'Web, CLI, VS Code extension, and MCP server integration'
      },
      realTime: {
        title: 'Real-Time Search',
        description: 'Fast, responsive search with instant results and suggestions'
      },
      customizable: {
        title: 'Customizable',
        description: 'Personalize your search experience with filters and preferences'
      },
      openSource: {
        title: 'Open Source',
        description: 'Transparent, community-driven development on GitHub'
      }
    },
    footer: {
      copyright: '© 2025 Cautai. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact',
      documentation: 'Documentation',
      github: 'GitHub'
    },
    navigation: {
      home: 'Home',
      search: 'Search',
      documentation: 'Docs',
      api: 'API',
      pricing: 'Pricing',
      contact: 'Contact',
      login: 'Login',
      signup: 'Sign Up'
    }
  },

  time: {
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    years: 'years',
    ago: 'ago',
    just_now: 'just now',
    yesterday: 'yesterday',
    today: 'today',
    tomorrow: 'tomorrow'
  },

  formatting: {
    thousand: 'K',
    million: 'M',
    billion: 'B',
    decimal_separator: '.',
    thousands_separator: ','
  }
};