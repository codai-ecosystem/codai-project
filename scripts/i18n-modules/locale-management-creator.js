/**
 * @fileoverview Locale Management Creator
 * @description Creates locale switching and detection systems
 */

import fs from 'fs';
import path from 'path';

export default function createLocaleManagement(dirs, appName) {
    createLocaleSelector(dirs.componentsDir, appName);
    createLocaleDetection(dirs.utilsDir, appName);
    createLocaleStorage(dirs.utilsDir, appName);
    createLocaleMiddleware(dirs.middlewareDir || dirs.utilsDir, appName);
    console.log(`🌍 Locale management created for ${appName}`);
}

function createLocaleSelector(componentsDir, appName) {
    const selectorContent = `/**
 * @fileoverview Locale Selector Component
 * @description Language switching component
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { SUPPORTED_LOCALES } from '../../../../i18n/shared-config';
import { useI18n } from './I18nProvider';

interface LocaleSelectorProps {
  className?: string;
  showLabel?: boolean;
  showFlag?: boolean;
  variant?: 'dropdown' | 'inline' | 'modal';
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({
  className = '',
  showLabel = true,
  showFlag = true,
  variant = 'dropdown',
  placement = 'bottom'
}) => {
  const { t } = useTranslation('common');
  const { currentLocale, supportedLocales, changeLanguage, isLoading } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (locale: string) => {
    setIsOpen(false);
    await changeLanguage(locale);
  };

  const getPlacementClasses = () => {
    switch (placement) {
      case 'top': return 'bottom-full mb-2';
      case 'left': return 'right-full mr-2';
      case 'right': return 'left-full ml-2';
      default: return 'top-full mt-2';
    }
  };

  if (variant === 'inline') {
    return (
      <div className={\`flex flex-wrap gap-2 \${className}\`}>
        {Object.entries(supportedLocales).map(([code, locale]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code)}
            disabled={isLoading}
            className={\`
              flex items-center space-x-2 px-3 py-1 rounded-md text-sm
              transition-colors duration-200
              \${currentLocale.code === code
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }
              \${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            \`}
          >
            {showFlag && <span className="text-lg">{locale.flag}</span>}
            {showLabel && <span>{locale.nativeName}</span>}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          disabled={isLoading}
          className={\`
            flex items-center space-x-2 px-4 py-2 rounded-lg
            bg-white border border-gray-300 shadow-sm
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-colors duration-200
            \${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            \${className}
          \`}
        >
          {showFlag && <span className="text-lg">{currentLocale.flag}</span>}
          <GlobeAltIcon className="w-4 h-4" />
          {showLabel && <span>{currentLocale.nativeName}</span>}
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('language')}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(supportedLocales).map(([code, locale]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={\`
                      flex items-center space-x-3 px-4 py-3 rounded-lg
                      text-left w-full transition-colors duration-200
                      \${currentLocale.code === code
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                      }
                    \`}
                  >
                    <span className="text-2xl">{locale.flag}</span>
                    <div>
                      <div className="font-medium">{locale.nativeName}</div>
                      <div className="text-sm text-gray-500">{locale.name}</div>
                    </div>
                    {currentLocale.code === code && (
                      <div className="ml-auto">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default dropdown variant
  return (
    <div className={\`relative \${className}\`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={\`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          bg-white border border-gray-300 shadow-sm
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors duration-200
          \${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        \`}
      >
        {showFlag && <span className="text-lg">{currentLocale.flag}</span>}
        {showLabel && <span className="text-sm font-medium">{currentLocale.nativeName}</span>}
        <ChevronDownIcon className={\`w-4 h-4 transition-transform duration-200 \${isOpen ? 'rotate-180' : ''}\`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={\`
            absolute \${getPlacementClasses()} left-0 z-20
            bg-white rounded-lg shadow-lg border border-gray-200
            min-w-max max-h-64 overflow-y-auto
          \`}>
            {Object.entries(supportedLocales).map(([code, locale]) => (
              <button
                key={code}
                onClick={() => handleLanguageChange(code)}
                className={\`
                  flex items-center space-x-3 px-4 py-2 text-left w-full
                  hover:bg-gray-50 transition-colors duration-200
                  first:rounded-t-lg last:rounded-b-lg
                  \${currentLocale.code === code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                \`}
              >
                <span className="text-lg">{locale.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{locale.nativeName}</div>
                  <div className="text-xs text-gray-500">{locale.name}</div>
                </div>
                {currentLocale.code === code && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface CompactLocaleSelectorProps {
  className?: string;
}

export const CompactLocaleSelector: React.FC<CompactLocaleSelectorProps> = ({
  className = ''
}) => {
  return (
    <LocaleSelector
      className={className}
      showLabel={false}
      showFlag={true}
      variant="dropdown"
    />
  );
};

interface LocaleSelectorListProps {
  className?: string;
  onLanguageChange?: (locale: string) => void;
}

export const LocaleSelectorList: React.FC<LocaleSelectorListProps> = ({
  className = '',
  onLanguageChange
}) => {
  const { currentLocale, supportedLocales, changeLanguage } = useI18n();

  const handleLanguageChange = async (locale: string) => {
    await changeLanguage(locale);
    onLanguageChange?.(locale);
  };

  return (
    <div className={\`space-y-2 \${className}\`}>
      {Object.entries(supportedLocales).map(([code, locale]) => (
        <label
          key={code}
          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
        >
          <input
            type="radio"
            name="language"
            value={code}
            checked={currentLocale.code === code}
            onChange={() => handleLanguageChange(code)}
            className="sr-only"
          />
          <div className={\`
            w-4 h-4 rounded-full border-2 transition-colors duration-200
            \${currentLocale.code === code
              ? 'border-blue-600 bg-blue-600'
              : 'border-gray-300'
            }
          \`}>
            {currentLocale.code === code && (
              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
            )}
          </div>
          <span className="text-2xl">{locale.flag}</span>
          <div>
            <div className="font-medium">{locale.nativeName}</div>
            <div className="text-sm text-gray-500">{locale.name}</div>
          </div>
        </label>
      ))}
    </div>
  );
};

export default LocaleSelector;`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(componentsDir, 'LocaleSelector.tsx'), selectorContent);
}

function createLocaleDetection(utilsDir, appName) {
    const detectionContent = `/**
 * @fileoverview Locale Detection Utilities
 * @description Intelligent locale detection and management
 */

import { SUPPORTED_LOCALES, DEFAULT_LOCALE, RTL_LOCALES } from '../../../../i18n/shared-config';

export interface LocaleDetectionResult {
  locale: string;
  source: 'url' | 'cookie' | 'localStorage' | 'navigator' | 'header' | 'default';
  confidence: number;
}

export interface LocaleDetectionOptions {
  enableUrlDetection?: boolean;
  enableCookieDetection?: boolean;
  enableStorageDetection?: boolean;
  enableNavigatorDetection?: boolean;
  enableHeaderDetection?: boolean;
  cookieName?: string;
  storageKey?: string;
  urlParameter?: string;
  urlPathIndex?: number;
  fallbackLocale?: string;
  supportedLocales?: string[];
}

/**
 * Comprehensive locale detection system
 */
export class LocaleDetector {
  private options: Required<LocaleDetectionOptions>;

  constructor(options: LocaleDetectionOptions = {}) {
    this.options = {
      enableUrlDetection: true,
      enableCookieDetection: true,
      enableStorageDetection: true,
      enableNavigatorDetection: true,
      enableHeaderDetection: false,
      cookieName: '${appName}_locale',
      storageKey: '${appName}_locale',
      urlParameter: 'lang',
      urlPathIndex: 0,
      fallbackLocale: DEFAULT_LOCALE,
      supportedLocales: Object.keys(SUPPORTED_LOCALES),
      ...options
    };
  }

  /**
   * Detect the best locale based on multiple sources
   */
  detect(): LocaleDetectionResult {
    const detectionMethods = [
      this.detectFromUrl.bind(this),
      this.detectFromCookie.bind(this),
      this.detectFromLocalStorage.bind(this),
      this.detectFromNavigator.bind(this),
      this.detectFromHeaders.bind(this)
    ];

    for (const method of detectionMethods) {
      try {
        const result = method();
        if (result && this.isValidLocale(result.locale)) {
          return result;
        }
      } catch (error) {
        console.warn('Locale detection error:', error);
      }
    }

    return {
      locale: this.options.fallbackLocale,
      source: 'default',
      confidence: 1.0
    };
  }

  /**
   * Detect locale from URL parameters or path
   */
  private detectFromUrl(): LocaleDetectionResult | null {
    if (!this.options.enableUrlDetection || typeof window === 'undefined') {
      return null;
    }

    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const paramLocale = urlParams.get(this.options.urlParameter);
    if (paramLocale && this.isValidLocale(paramLocale)) {
      return {
        locale: paramLocale,
        source: 'url',
        confidence: 0.9
      };
    }

    // Check URL path
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > this.options.urlPathIndex) {
      const pathLocale = pathSegments[this.options.urlPathIndex];
      if (this.isValidLocale(pathLocale)) {
        return {
          locale: pathLocale,
          source: 'url',
          confidence: 0.8
        };
      }
    }

    return null;
  }

  /**
   * Detect locale from cookie
   */
  private detectFromCookie(): LocaleDetectionResult | null {
    if (!this.options.enableCookieDetection || typeof document === 'undefined') {
      return null;
    }

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    const cookieLocale = cookies[this.options.cookieName];
    if (cookieLocale && this.isValidLocale(cookieLocale)) {
      return {
        locale: cookieLocale,
        source: 'cookie',
        confidence: 0.7
      };
    }

    return null;
  }

  /**
   * Detect locale from localStorage
   */
  private detectFromLocalStorage(): LocaleDetectionResult | null {
    if (!this.options.enableStorageDetection || typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const storageLocale = localStorage.getItem(this.options.storageKey);
      if (storageLocale && this.isValidLocale(storageLocale)) {
        return {
          locale: storageLocale,
          source: 'localStorage',
          confidence: 0.6
        };
      }
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
    }

    return null;
  }

  /**
   * Detect locale from browser navigator
   */
  private detectFromNavigator(): LocaleDetectionResult | null {
    if (!this.options.enableNavigatorDetection || typeof navigator === 'undefined') {
      return null;
    }

    const browserLocales = [
      navigator.language,
      ...navigator.languages
    ].filter(Boolean);

    for (const browserLocale of browserLocales) {
      // Try exact match
      if (this.isValidLocale(browserLocale)) {
        return {
          locale: browserLocale,
          source: 'navigator',
          confidence: 0.5
        };
      }

      // Try language-only match (e.g., 'en' from 'en-US')
      const languageOnly = browserLocale.split('-')[0];
      if (this.isValidLocale(languageOnly)) {
        return {
          locale: languageOnly,
          source: 'navigator',
          confidence: 0.4
        };
      }
    }

    return null;
  }

  /**
   * Detect locale from HTTP headers (server-side)
   */
  private detectFromHeaders(): LocaleDetectionResult | null {
    if (!this.options.enableHeaderDetection) {
      return null;
    }

    // This would typically be used server-side with request headers
    // For client-side, we can't access Accept-Language directly
    return null;
  }

  /**
   * Check if a locale is valid and supported
   */
  private isValidLocale(locale: string): boolean {
    return this.options.supportedLocales.includes(locale);
  }

  /**
   * Get the best matching locale from a list
   */
  getBestMatch(requestedLocales: string[]): string {
    for (const locale of requestedLocales) {
      if (this.isValidLocale(locale)) {
        return locale;
      }
      
      // Try language-only match
      const languageOnly = locale.split('-')[0];
      if (this.isValidLocale(languageOnly)) {
        return languageOnly;
      }
    }

    return this.options.fallbackLocale;
  }
}

/**
 * Default locale detector instance
 */
export const defaultLocaleDetector = new LocaleDetector();

/**
 * Simple locale detection function
 */
export const detectLocale = (options?: LocaleDetectionOptions): string => {
  const detector = options ? new LocaleDetector(options) : defaultLocaleDetector;
  return detector.detect().locale;
};

/**
 * Check if a locale is RTL
 */
export const isRTLLocale = (locale: string): boolean => {
  return RTL_LOCALES.includes(locale);
};

/**
 * Get locale direction
 */
export const getLocaleDirection = (locale: string): 'ltr' | 'rtl' => {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
};

/**
 * Normalize locale code (e.g., 'en_US' -> 'en-US')
 */
export const normalizeLocale = (locale: string): string => {
  return locale.replace('_', '-');
};

/**
 * Extract language from locale (e.g., 'en-US' -> 'en')
 */
export const getLanguageFromLocale = (locale: string): string => {
  return locale.split('-')[0];
};

/**
 * Extract region from locale (e.g., 'en-US' -> 'US')
 */
export const getRegionFromLocale = (locale: string): string | null => {
  const parts = locale.split('-');
  return parts.length > 1 ? parts[1] : null;
};

/**
 * Check if two locales are compatible (same language)
 */
export const areLocalesCompatible = (locale1: string, locale2: string): boolean => {
  return getLanguageFromLocale(locale1) === getLanguageFromLocale(locale2);
};

/**
 * Get supported locales with their information
 */
export const getSupportedLocalesInfo = () => {
  return Object.entries(SUPPORTED_LOCALES).map(([code, info]) => ({
    code,
    ...info,
    isRTL: isRTLLocale(code),
    direction: getLocaleDirection(code)
  }));
};

/**
 * Server-side locale detection from request headers
 */
export const detectLocaleFromHeaders = (acceptLanguage: string): LocaleDetectionResult => {
  if (!acceptLanguage) {
    return {
      locale: DEFAULT_LOCALE,
      source: 'default',
      confidence: 1.0
    };
  }

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qValue] = lang.trim().split(';q=');
      return {
        locale: locale.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);

  const detector = new LocaleDetector({ enableHeaderDetection: true });

  for (const { locale, quality } of languages) {
    const bestMatch = detector.getBestMatch([locale]);
    if (bestMatch !== DEFAULT_LOCALE) {
      return {
        locale: bestMatch,
        source: 'header',
        confidence: quality
      };
    }
  }

  return {
    locale: DEFAULT_LOCALE,
    source: 'default',
    confidence: 1.0
  };
};

export default LocaleDetector;`;

    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(utilsDir, 'locale-detection.ts'), detectionContent);
}

function createLocaleStorage(utilsDir, appName) {
    const storageContent = `/**
 * @fileoverview Locale Storage Management
 * @description Persistent locale preference storage
 */

import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../../../../i18n/shared-config';

export interface LocaleStorage {
  get(): string | null;
  set(locale: string): boolean;
  remove(): boolean;
  isSupported(): boolean;
}

/**
 * localStorage-based locale storage
 */
export class LocalStorageLocaleStorage implements LocaleStorage {
  private readonly key: string;

  constructor(key: string = '${appName}_locale') {
    this.key = key;
  }

  get(): string | null {
    try {
      if (!this.isSupported()) return null;
      const stored = localStorage.getItem(this.key);
      return stored && this.isValidLocale(stored) ? stored : null;
    } catch (error) {
      console.warn('Error reading locale from localStorage:', error);
      return null;
    }
  }

  set(locale: string): boolean {
    try {
      if (!this.isSupported() || !this.isValidLocale(locale)) {
        return false;
      }
      localStorage.setItem(this.key, locale);
      return true;
    } catch (error) {
      console.warn('Error saving locale to localStorage:', error);
      return false;
    }
  }

  remove(): boolean {
    try {
      if (!this.isSupported()) return false;
      localStorage.removeItem(this.key);
      return true;
    } catch (error) {
      console.warn('Error removing locale from localStorage:', error);
      return false;
    }
  }

  isSupported(): boolean {
    try {
      return typeof Storage !== 'undefined' && typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  private isValidLocale(locale: string): boolean {
    return Object.keys(SUPPORTED_LOCALES).includes(locale);
  }
}

/**
 * Cookie-based locale storage
 */
export class CookieLocaleStorage implements LocaleStorage {
  private readonly cookieName: string;
  private readonly maxAge: number;
  private readonly path: string;
  private readonly domain?: string;
  private readonly secure: boolean;
  private readonly sameSite: 'strict' | 'lax' | 'none';

  constructor(options: {
    cookieName?: string;
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}) {
    this.cookieName = options.cookieName || '${appName}_locale';
    this.maxAge = options.maxAge || 365 * 24 * 60 * 60; // 1 year in seconds
    this.path = options.path || '/';
    this.domain = options.domain;
    this.secure = options.secure ?? (typeof location !== 'undefined' && location.protocol === 'https:');
    this.sameSite = options.sameSite || 'lax';
  }

  get(): string | null {
    try {
      if (!this.isSupported()) return null;
      
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {} as Record<string, string>);

      const stored = cookies[this.cookieName];
      return stored && this.isValidLocale(stored) ? stored : null;
    } catch (error) {
      console.warn('Error reading locale from cookies:', error);
      return null;
    }
  }

  set(locale: string): boolean {
    try {
      if (!this.isSupported() || !this.isValidLocale(locale)) {
        return false;
      }

      const cookieOptions = [
        \`\${this.cookieName}=\${encodeURIComponent(locale)}\`,
        \`max-age=\${this.maxAge}\`,
        \`path=\${this.path}\`
      ];

      if (this.domain) {
        cookieOptions.push(\`domain=\${this.domain}\`);
      }

      if (this.secure) {
        cookieOptions.push('secure');
      }

      cookieOptions.push(\`samesite=\${this.sameSite}\`);

      document.cookie = cookieOptions.join('; ');
      return true;
    } catch (error) {
      console.warn('Error saving locale to cookies:', error);
      return false;
    }
  }

  remove(): boolean {
    try {
      if (!this.isSupported()) return false;

      const cookieOptions = [
        \`\${this.cookieName}=\`,
        'expires=Thu, 01 Jan 1970 00:00:00 GMT',
        \`path=\${this.path}\`
      ];

      if (this.domain) {
        cookieOptions.push(\`domain=\${this.domain}\`);
      }

      document.cookie = cookieOptions.join('; ');
      return true;
    } catch (error) {
      console.warn('Error removing locale from cookies:', error);
      return false;
    }
  }

  isSupported(): boolean {
    return typeof document !== 'undefined' && typeof document.cookie !== 'undefined';
  }

  private isValidLocale(locale: string): boolean {
    return Object.keys(SUPPORTED_LOCALES).includes(locale);
  }
}

/**
 * Multi-storage locale manager
 */
export class MultiStorageLocaleManager {
  private storages: LocaleStorage[];
  private primaryStorage: LocaleStorage;

  constructor(storages: LocaleStorage[] = []) {
    this.storages = storages.length > 0 ? storages : [
      new LocalStorageLocaleStorage(),
      new CookieLocaleStorage()
    ];
    this.primaryStorage = this.storages[0];
  }

  /**
   * Get locale from the first available storage
   */
  getLocale(): string {
    for (const storage of this.storages) {
      try {
        const locale = storage.get();
        if (locale) {
          return locale;
        }
      } catch (error) {
        console.warn('Error reading from storage:', error);
      }
    }
    return DEFAULT_LOCALE;
  }

  /**
   * Set locale in all supported storages
   */
  setLocale(locale: string): boolean {
    if (!this.isValidLocale(locale)) {
      console.warn(\`Invalid locale: \${locale}\`);
      return false;
    }

    let success = false;
    for (const storage of this.storages) {
      try {
        if (storage.set(locale)) {
          success = true;
        }
      } catch (error) {
        console.warn('Error writing to storage:', error);
      }
    }

    return success;
  }

  /**
   * Remove locale from all storages
   */
  removeLocale(): boolean {
    let success = false;
    for (const storage of this.storages) {
      try {
        if (storage.remove()) {
          success = true;
        }
      } catch (error) {
        console.warn('Error removing from storage:', error);
      }
    }

    return success;
  }

  /**
   * Check if any storage is supported
   */
  isSupported(): boolean {
    return this.storages.some(storage => storage.isSupported());
  }

  /**
   * Sync locale across all storages
   */
  syncLocale(): string {
    const currentLocale = this.getLocale();
    this.setLocale(currentLocale);
    return currentLocale;
  }

  private isValidLocale(locale: string): boolean {
    return Object.keys(SUPPORTED_LOCALES).includes(locale);
  }
}

/**
 * Default locale storage manager
 */
export const defaultLocaleStorage = new MultiStorageLocaleManager();

/**
 * Utility functions
 */
export const getStoredLocale = (): string => {
  return defaultLocaleStorage.getLocale();
};

export const setStoredLocale = (locale: string): boolean => {
  return defaultLocaleStorage.setLocale(locale);
};

export const removeStoredLocale = (): boolean => {
  return defaultLocaleStorage.removeLocale();
};

export const syncStoredLocale = (): string => {
  return defaultLocaleStorage.syncLocale();
};

/**
 * React hook for locale storage
 */
export const useLocaleStorage = () => {
  const getLocale = (): string => {
    return getStoredLocale();
  };

  const setLocale = (locale: string): boolean => {
    const success = setStoredLocale(locale);
    if (success) {
      // Trigger storage event for cross-tab synchronization
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: '${appName}_locale',
          newValue: locale,
          storageArea: localStorage
        }));
      }
    }
    return success;
  };

  const removeLocale = (): boolean => {
    const success = removeStoredLocale();
    if (success && typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', {
        key: '${appName}_locale',
        newValue: null,
        storageArea: localStorage
      }));
    }
    return success;
  };

  return {
    getLocale,
    setLocale,
    removeLocale,
    syncLocale: syncStoredLocale,
    isSupported: () => defaultLocaleStorage.isSupported()
  };
};

export default MultiStorageLocaleManager;`;

    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(utilsDir, 'locale-storage.ts'), storageContent);
}

function createLocaleMiddleware(middlewareDir, appName) {
    const middlewareContent = `/**
 * @fileoverview Locale Middleware
 * @description Next.js middleware for locale handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../../i18n/shared-config';

const SUPPORTED_LOCALE_CODES = Object.keys(SUPPORTED_LOCALES);

/**
 * Locale detection middleware for Next.js
 */
export function localeMiddleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the pathname has a locale
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = SUPPORTED_LOCALE_CODES.some(
    locale => pathname.startsWith(\`/\${locale}/\`) || pathname === \`/\${locale}\`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Detect locale from various sources
  const detectedLocale = detectLocaleFromRequest(request);

  // Redirect to localized URL
  const localizedUrl = new URL(\`/\${detectedLocale}\${pathname}\`, request.url);
  
  // Preserve search parameters
  localizedUrl.search = request.nextUrl.search;

  return NextResponse.redirect(localizedUrl);
}

/**
 * Detect locale from request
 */
function detectLocaleFromRequest(request: NextRequest): string {
  // 1. Check URL parameter
  const urlLocale = request.nextUrl.searchParams.get('lang');
  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale;
  }

  // 2. Check cookie
  const cookieLocale = request.cookies.get('${appName}_locale')?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const headerLocale = detectFromAcceptLanguage(acceptLanguage);
    if (headerLocale) {
      return headerLocale;
    }
  }

  // 4. Fallback to default
  return DEFAULT_LOCALE;
}

/**
 * Parse Accept-Language header and find best match
 */
function detectFromAcceptLanguage(acceptLanguage: string): string | null {
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qValue] = lang.trim().split(';q=');
      return {
        locale: locale.trim(),
        quality: qValue ? parseFloat(qValue) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of languages) {
    // Try exact match
    if (isValidLocale(locale)) {
      return locale;
    }
    
    // Try language-only match (e.g., 'en' from 'en-US')
    const languageOnly = locale.split('-')[0];
    if (isValidLocale(languageOnly)) {
      return languageOnly;
    }
  }

  return null;
}

/**
 * Check if locale is supported
 */
function isValidLocale(locale: string): boolean {
  return SUPPORTED_LOCALE_CODES.includes(locale);
}

/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  return firstSegment && isValidLocale(firstSegment) ? firstSegment : null;
}

/**
 * Remove locale from pathname
 */
export function removeLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname;
  
  const withoutLocale = pathname.replace(\`/\${locale}\`, '') || '/';
  return withoutLocale;
}

/**
 * Add locale to pathname
 */
export function addLocaleToPathname(pathname: string, locale: string): string {
  if (!isValidLocale(locale)) return pathname;
  
  const cleanPathname = removeLocaleFromPathname(pathname);
  return \`/\${locale}\${cleanPathname === '/' ? '' : cleanPathname}\`;
}

/**
 * Custom matcher configuration for Next.js middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

/**
 * Locale-aware URL rewriter
 */
export class LocaleURLRewriter {
  private baseUrl: string;
  private defaultLocale: string;

  constructor(baseUrl: string, defaultLocale: string = DEFAULT_LOCALE) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultLocale = defaultLocale;
  }

  /**
   * Rewrite URL to include locale
   */
  rewrite(url: string, locale: string): string {
    if (!isValidLocale(locale)) {
      locale = this.defaultLocale;
    }

    const urlObj = new URL(url, this.baseUrl);
    const currentLocale = getLocaleFromPathname(urlObj.pathname);

    if (currentLocale === locale) {
      return url; // Already has correct locale
    }

    // Remove current locale and add new one
    const cleanPathname = removeLocaleFromPathname(urlObj.pathname);
    urlObj.pathname = addLocaleToPathname(cleanPathname, locale);

    return urlObj.toString();
  }

  /**
   * Get canonical URL without locale
   */
  getCanonical(url: string): string {
    const urlObj = new URL(url, this.baseUrl);
    urlObj.pathname = removeLocaleFromPathname(urlObj.pathname);
    return urlObj.toString();
  }

  /**
   * Get all localized versions of a URL
   */
  getAllLocalizedVersions(url: string): Record<string, string> {
    const canonical = this.getCanonical(url);
    const result: Record<string, string> = {};

    for (const locale of SUPPORTED_LOCALE_CODES) {
      result[locale] = this.rewrite(canonical, locale);
    }

    return result;
  }
}

export default localeMiddleware;`;

    if (!fs.existsSync(middlewareDir)) {
        fs.mkdirSync(middlewareDir, { recursive: true });
    }
    fs.writeFileSync(path.join(middlewareDir, 'locale-middleware.ts'), middlewareContent);
}