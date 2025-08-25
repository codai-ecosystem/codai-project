/**
 * @fileoverview Shared I18n Configuration
 * @description Common internationalization settings for all CODAI applications
 */

export const SUPPORTED_LOCALES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: 'en-US'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'es-ES'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'fr-FR'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    currency: 'EUR',
    dateFormat: 'dd.MM.yyyy',
    numberFormat: 'de-DE'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    currency: 'CNY',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: 'zh-CN'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    currency: 'JPY',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: 'ja-JP'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    currency: 'SAR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'ar-SA'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false,
    currency: 'INR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'hi-IN'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    rtl: false,
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'pt-BR'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    rtl: false,
    currency: 'RUB',
    dateFormat: 'dd.MM.yyyy',
    numberFormat: 'ru-RU'
  }
};

export const DEFAULT_LOCALE = 'en';
export const RTL_LOCALES = Object.values(SUPPORTED_LOCALES)
  .filter(locale => locale.rtl)
  .map(locale => locale.code);

export const I18N_CONFIG = {
  defaultLocale: DEFAULT_LOCALE,
  locales: Object.keys(SUPPORTED_LOCALES),
  rtlLocales: RTL_LOCALES,
  fallbackLng: DEFAULT_LOCALE,
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false
  },
  detection: {
    order: ['cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
    caches: ['cookie', 'localStorage']
  },
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged',
    bindI18nStore: false,
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em']
  }
};

export const NAMESPACES = {
  COMMON: 'common',
  AUTH: 'auth', 
  DASHBOARD: 'dashboard',
  NAVIGATION: 'navigation',
  FORMS: 'forms',
  ERRORS: 'errors',
  VALIDATION: 'validation',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  HELP: 'help'
};