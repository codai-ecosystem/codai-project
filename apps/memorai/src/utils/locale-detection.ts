/**
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
      cookieName: 'memorai_locale',
      storageKey: 'memorai_locale',
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

export default LocaleDetector;