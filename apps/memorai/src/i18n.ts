/**
 * @fileoverview I18n Setup Configuration
 * @description React-i18next configuration for memorai
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18N_CONFIG, SUPPORTED_LOCALES, NAMESPACES } from '../../../i18n/shared-config';

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ...I18N_CONFIG,
    
    // Backend configuration
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
      crossDomain: true,
    },

    // Language detection configuration
    detection: {
      ...I18N_CONFIG.detection,
      lookupCookie: 'memorai_locale',
      lookupLocalStorage: 'memorai_locale',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },

    // Default namespaces to load
    defaultNS: NAMESPACES.COMMON,
    ns: Object.values(NAMESPACES),

    // Resources (fallback for SSR)
    resources: {},

    // Interpolation options
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
      format: (value, format, lng) => {
        const locale = SUPPORTED_LOCALES[lng] || SUPPORTED_LOCALES.en;
        
        if (format === 'number') {
          return new Intl.NumberFormat(locale.numberFormat).format(value);
        }
        
        if (format === 'currency') {
          return new Intl.NumberFormat(locale.numberFormat, {
            style: 'currency',
            currency: locale.currency
          }).format(value);
        }
        
        if (format === 'date') {
          return new Intl.DateTimeFormat(locale.numberFormat).format(new Date(value));
        }
        
        if (format === 'dateTime') {
          return new Intl.DateTimeFormat(locale.numberFormat, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(value));
        }
        
        if (format === 'relative') {
          const rtf = new Intl.RelativeTimeFormat(locale.numberFormat, { numeric: 'auto' });
          const diffInDays = Math.floor((new Date(value) - new Date()) / (1000 * 60 * 60 * 24));
          return rtf.format(diffInDays, 'day');
        }
        
        return value;
      }
    },

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // React options
    react: {
      ...I18N_CONFIG.react,
      transWrapTextNodes: 'span'
    },

    // Save missing translations
    saveMissing: process.env.NODE_ENV === 'development',
    saveMissingTo: 'current',

    // Performance
    load: 'languageOnly', // Load only language code, not region
    preload: ['en'], // Always preload English

    // Custom functions
    parseMissingKeyHandler: (key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key}`);
      }
      return `Missing: ${key}`;
    }
  });

// Language changed event handler
i18n.on('languageChanged', (lng) => {
  const locale = SUPPORTED_LOCALES[lng];
  
  if (locale) {
    // Update document direction for RTL languages
    document.documentElement.dir = locale.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    
    // Store language preference
    localStorage.setItem('memorai_locale', lng);
    document.cookie = `memorai_locale=${lng}; path=/; max-age=31536000`;
    
    // Emit custom event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lng, locale } }));
  }
});

// Loading state handlers
i18n.on('loaded', (loaded) => {
  console.log('I18n resources loaded:', loaded);
});

i18n.on('failedLoading', (lng, ns, msg) => {
  console.error(`Failed to load i18n resources: ${lng}/${ns}`, msg);
});

export default i18n;

// Utility functions
export const getCurrentLocale = () => {
  const currentLang = i18n.language || i18n.options.fallbackLng;
  return SUPPORTED_LOCALES[currentLang] || SUPPORTED_LOCALES.en;
};

export const isRTL = (lng = i18n.language) => {
  const locale = SUPPORTED_LOCALES[lng];
  return locale ? locale.rtl : false;
};

export const changeLanguage = async (lng) => {
  try {
    await i18n.changeLanguage(lng);
    return true;
  } catch (error) {
    console.error('Failed to change language:', error);
    return false;
  }
};

export const loadNamespace = async (ns) => {
  try {
    await i18n.loadNamespaces(ns);
    return true;
  } catch (error) {
    console.error('Failed to load namespace:', error);
    return false;
  }
};

// Preload critical namespaces
const preloadNamespaces = [NAMESPACES.COMMON, NAMESPACES.AUTH, NAMESPACES.NAVIGATION];
preloadNamespaces.forEach(ns => {
  i18n.loadNamespaces(ns);
});