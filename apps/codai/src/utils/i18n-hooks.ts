/**
 * @fileoverview I18n React Hooks
 * @description Custom hooks for internationalization
 */

import { useTranslation, UseTranslationOptions } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { NAMESPACES, SUPPORTED_LOCALES } from '../lib/i18n/constants';

/**
 * Enhanced useTranslation hook with namespace support
 */
export const useT = (ns: string = 'common', options?: UseTranslationOptions<string>) => {
  const { t, i18n } = useTranslation(ns, options);
  
  const tWithFallback = useCallback((key: string, options?: any) => {
    const translation = t(key, options);
    
    // If translation is the same as key, it might be missing
    if (translation === key && process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation for key: ${key} in namespace: ${ns}`);
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
  const [locale, setLocale] = useState(() => 'en');
  const [rtl, setRTL] = useState(() => false);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLocale('en'); // Default to English
      setRTL(false); // Default RTL setting
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
    return new Intl.NumberFormat(locale, options).format(value);
  }, [locale]);

  const formatCurrency = useCallback((value: number, currency?: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD'
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
    return new Intl.DateTimeFormat(locale, options).format(new Date(date));
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
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
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
export const usePlural = (ns: string = 'common') => {
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
      const fullKey = ns ? `${ns}:${key}` : key;
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
};