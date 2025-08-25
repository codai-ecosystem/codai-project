/**
 * @fileoverview I18n Configuration Creator
 * @description Creates comprehensive i18n configuration for applications
 */

import fs from 'fs';
import path from 'path';

export default function createI18nConfig(dirs, appName) {
    createI18nSetup(dirs.srcDir, appName);
    createI18nProvider(dirs.componentsDir, appName);
    createI18nHooks(dirs.utilsDir, appName);
    createNextI18nConfig(dirs.appDir, appName);
    console.log(`🌐 I18n configuration created for ${appName}`);
}

function createI18nSetup(srcDir, appName) {
    const i18nSetupContent = `/**
 * @fileoverview I18n Setup Configuration
 * @description React-i18next configuration for ${appName}
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
      lookupCookie: '${appName}_locale',
      lookupLocalStorage: '${appName}_locale',
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
        console.warn(\`Missing translation key: \${key}\`);
      }
      return \`Missing: \${key}\`;
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
    localStorage.setItem('${appName}_locale', lng);
    document.cookie = \`${appName}_locale=\${lng}; path=/; max-age=31536000\`;
    
    // Emit custom event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lng, locale } }));
  }
});

// Loading state handlers
i18n.on('loaded', (loaded) => {
  console.log('I18n resources loaded:', loaded);
});

i18n.on('failedLoading', (lng, ns, msg) => {
  console.error(\`Failed to load i18n resources: \${lng}/\${ns}\`, msg);
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
});`;

    fs.writeFileSync(path.join(srcDir, 'i18n.ts'), i18nSetupContent);
}

function createI18nProvider(componentsDir, appName) {
    const providerContent = `/**
 * @fileoverview I18n Provider Component
 * @description Provides i18n context to the application
 */

import React, { Suspense, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { getCurrentLocale, isRTL } from '../i18n';
import { SUPPORTED_LOCALES } from '../../../../i18n/shared-config';

interface I18nProviderProps {
  children: React.ReactNode;
  locale?: string;
}

interface I18nContextType {
  currentLocale: typeof SUPPORTED_LOCALES[keyof typeof SUPPORTED_LOCALES];
  supportedLocales: typeof SUPPORTED_LOCALES;
  changeLanguage: (lng: string) => Promise<boolean>;
  isLoading: boolean;
  isRTL: boolean;
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading translations...</span>
  </div>
);

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, locale }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocale, setCurrentLocale] = useState(() => getCurrentLocale());
  const [rtl, setRTL] = useState(() => isRTL());

  useEffect(() => {
    const handleLanguageChanged = (event: CustomEvent) => {
      const { lng, locale: newLocale } = event.detail;
      setCurrentLocale(newLocale);
      setRTL(isRTL(lng));
    };

    window.addEventListener('languageChanged', handleLanguageChanged as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChanged as EventListener);
    };
  }, []);

  useEffect(() => {
    if (locale && locale !== i18n.language) {
      i18n.changeLanguage(locale).then(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [locale]);

  const changeLanguage = async (lng: string): Promise<boolean> => {
    if (!SUPPORTED_LOCALES[lng]) {
      console.warn(\`Unsupported locale: \${lng}\`);
      return false;
    }

    setIsLoading(true);
    
    try {
      await i18n.changeLanguage(lng);
      setCurrentLocale(SUPPORTED_LOCALES[lng]);
      setRTL(isRTL(lng));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      setIsLoading(false);
      return false;
    }
  };

  const contextValue: I18nContextType = {
    currentLocale,
    supportedLocales: SUPPORTED_LOCALES,
    changeLanguage,
    isLoading,
    isRTL: rtl
  };

  return (
    <I18nextProvider i18n={i18n}>
      <I18nContext.Provider value={contextValue}>
        <Suspense fallback={<LoadingFallback />}>
          <div className={\`\${rtl ? 'rtl' : 'ltr'}\`} dir={rtl ? 'rtl' : 'ltr'}>
            {children}
          </div>
        </Suspense>
      </I18nContext.Provider>
    </I18nextProvider>
  );
};

export default I18nProvider;`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(componentsDir, 'I18nProvider.tsx'), providerContent);
}

function createI18nHooks(utilsDir, appName) {
    const hooksContent = `/**
 * @fileoverview I18n React Hooks
 * @description Custom hooks for internationalization
 */

import { useTranslation, UseTranslationOptions } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { NAMESPACES, SUPPORTED_LOCALES } from '../../../../i18n/shared-config';
import { getCurrentLocale, isRTL } from '../i18n';

/**
 * Enhanced useTranslation hook with namespace support
 */
export const useT = (ns: string = NAMESPACES.COMMON, options?: UseTranslationOptions) => {
  const { t, i18n } = useTranslation(ns, options);
  
  const tWithFallback = useCallback((key: string, options?: any) => {
    const translation = t(key, options);
    
    // If translation is the same as key, it might be missing
    if (translation === key && process.env.NODE_ENV === 'development') {
      console.warn(\`Missing translation for key: \${key} in namespace: \${ns}\`);
    }
    
    return translation;
  }, [t, ns]);

  return {
    t: tWithFallback,
    i18n,
    ready: i18n.isInitialized
  };
};

/**
 * Hook for locale information and management
 */
export const useLocale = () => {
  const [locale, setLocale] = useState(() => getCurrentLocale());
  const [rtl, setRTL] = useState(() => isRTL());

  useEffect(() => {
    const handleLanguageChange = () => {
      setLocale(getCurrentLocale());
      setRTL(isRTL());
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  return {
    locale,
    isRTL: rtl,
    supportedLocales: Object.values(SUPPORTED_LOCALES)
  };
};

/**
 * Hook for formatting numbers according to current locale
 */
export const useNumberFormat = () => {
  const { locale } = useLocale();

  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale.numberFormat, options).format(value);
  }, [locale]);

  const formatCurrency = useCallback((value: number, currency?: string) => {
    return new Intl.NumberFormat(locale.numberFormat, {
      style: 'currency',
      currency: currency || locale.currency
    }).format(value);
  }, [locale]);

  const formatPercent = useCallback((value: number) => {
    return new Intl.NumberFormat(locale.numberFormat, {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(value);
  }, [locale]);

  return {
    formatNumber,
    formatCurrency,
    formatPercent
  };
};

/**
 * Hook for formatting dates according to current locale
 */
export const useDateFormat = () => {
  const { locale } = useLocale();

  const formatDate = useCallback((date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(locale.numberFormat, options).format(new Date(date));
  }, [locale]);

  const formatDateTime = useCallback((date: Date | string | number) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [formatDate]);

  const formatRelativeTime = useCallback((date: Date | string | number) => {
    const rtf = new Intl.RelativeTimeFormat(locale.numberFormat, { numeric: 'auto' });
    const diffInMs = new Date(date).getTime() - Date.now();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (Math.abs(diffInHours) < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return rtf.format(diffInMinutes, 'minute');
      }
      return rtf.format(diffInHours, 'hour');
    }
    
    return rtf.format(diffInDays, 'day');
  }, [locale]);

  return {
    formatDate,
    formatDateTime,
    formatRelativeTime
  };
};

/**
 * Hook for pluralization support
 */
export const usePlural = (ns: string = NAMESPACES.COMMON) => {
  const { t } = useT(ns);

  const plural = useCallback((key: string, count: number, options?: any) => {
    return t(key, { count, ...options });
  }, [t]);

  return plural;
};

/**
 * Hook for loading additional namespaces dynamically
 */
export const useNamespaceLoader = () => {
  const { i18n } = useTranslation();
  const [loadingNamespaces, setLoadingNamespaces] = useState<Set<string>>(new Set());

  const loadNamespace = useCallback(async (ns: string | string[]) => {
    const namespaces = Array.isArray(ns) ? ns : [ns];
    
    setLoadingNamespaces(prev => {
      const newSet = new Set(prev);
      namespaces.forEach(n => newSet.add(n));
      return newSet;
    });

    try {
      await i18n.loadNamespaces(namespaces);
      return true;
    } catch (error) {
      console.error('Failed to load namespace(s):', namespaces, error);
      return false;
    } finally {
      setLoadingNamespaces(prev => {
        const newSet = new Set(prev);
        namespaces.forEach(n => newSet.delete(n));
        return newSet;
      });
    }
  }, [i18n]);

  return {
    loadNamespace,
    isLoading: (ns: string) => loadingNamespaces.has(ns)
  };
};

/**
 * Hook for translation key extraction (development only)
 */
export const useTranslationExtractor = () => {
  const extractedKeys = useState<Set<string>>(new Set())[0];

  const extractKey = useCallback((key: string, ns?: string) => {
    if (process.env.NODE_ENV === 'development') {
      const fullKey = ns ? \`\${ns}:\${key}\` : key;
      extractedKeys.add(fullKey);
      
      // Log to console for development
      console.log('Translation key extracted:', fullKey);
    }
  }, [extractedKeys]);

  const getExtractedKeys = useCallback(() => {
    return Array.from(extractedKeys);
  }, [extractedKeys]);

  return {
    extractKey,
    getExtractedKeys
  };
};`;

    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(utilsDir, 'i18n-hooks.ts'), hooksContent);
}

function createNextI18nConfig(appDir, appName) {
    const nextConfigContent = `/**
 * @fileoverview Next.js I18n Configuration
 * @description Next.js internationalization configuration for ${appName}
 */

const { SUPPORTED_LOCALES, DEFAULT_LOCALE } = require('./i18n/shared-config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: Object.keys(SUPPORTED_LOCALES),
    defaultLocale: DEFAULT_LOCALE,
    localeDetection: true,
    domains: [
      // Add domain-based locale routing if needed
      // {
      //   domain: 'example.com',
      //   defaultLocale: 'en',
      // },
      // {
      //   domain: 'example.es',
      //   defaultLocale: 'es',
      // },
    ],
  },
  
  // Webpack configuration for i18n
  webpack: (config, { dev, isServer }) => {
    // Add any custom webpack configuration for i18n here
    return config;
  },

  // Additional configuration for i18n
  experimental: {
    // Enable experimental features if needed
  },

  // Headers for i18n
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Accept-Language',
            value: Object.keys(SUPPORTED_LOCALES).join(', '),
          },
        ],
      },
    ];
  },

  // Redirects for i18n
  async redirects() {
    return [
      // Add locale-based redirects if needed
    ];
  },

  // Rewrites for i18n
  async rewrites() {
    return [
      // Add locale-based rewrites if needed
    ];
  },
};

module.exports = nextConfig;`;

    // Only create Next.js config if it doesn't exist
    const configPath = path.join(appDir, 'next-i18n.config.js');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, nextConfigContent);
    }
}