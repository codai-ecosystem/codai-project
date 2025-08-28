/**
 * Custom i18n hooks for memorai
 * Provides type-safe translations and language management
 */
import { useTranslation as useI18nextTranslation, UseTranslationOptions } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, changeLanguage, getCurrentLanguage, isLanguageSupported } from '../lib/i18n/config';

/**
 * Enhanced useTranslation hook with type safety
 */
export function useTranslation<TKPrefix extends string | undefined = undefined>(ns?: string | string[], options?: UseTranslationOptions<TKPrefix>) {
  const { t, i18n, ready } = useI18nextTranslation(ns, options);
  
  return {
    t,
    i18n,
    ready,
    language: getCurrentLanguage(),
    isReady: ready,
  };
}

/**
 * Language management hook
 */
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getCurrentLanguage());
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = useCallback(async (newLanguage: SupportedLanguage) => {
    if (!isLanguageSupported(newLanguage) || newLanguage === currentLanguage) {
      return;
    }

    setIsChanging(true);
    try {
      await changeLanguage(newLanguage);
      setCurrentLanguage(newLanguage);
      
      // Store preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('codai-language', newLanguage);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  }, [currentLanguage]);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageDetected = (lng: string) => {
      if (isLanguageSupported(lng) && lng !== currentLanguage) {
        setCurrentLanguage(lng);
      }
    };

    // Subscribe to i18next language changes
    const i18n = require('../lib/i18n/config').default;
    i18n.on('languageChanged', handleLanguageDetected);

    return () => {
      i18n.off('languageChanged', handleLanguageDetected);
    };
  }, [currentLanguage]);

  return {
    currentLanguage,
    changeLanguage: handleLanguageChange,
    isChanging,
    availableLanguages: ['en', 'ro'] as const,
    isRTL: false, // Neither English nor Romanian are RTL
  };
}

/**
 * Formatted message hook for complex translations
 */
export function useFormattedMessage() {
  const { t } = useTranslation();
  
  const formatMessage = useCallback((
    key: string, 
    values?: Record<string, string | number>,
    options?: { defaultMessage?: string }
  ) => {
    try {
      return t(key, { ...values, defaultValue: options?.defaultMessage });
    } catch (error) {
      console.warn(`Translation key not found: ${key}`, error);
      return options?.defaultMessage || key;
    }
  }, [t]);

  return { formatMessage };
}

/**
 * Locale detection hook
 */
export function useLocaleDetection() {
  const [detectedLocale, setDetectedLocale] = useState<SupportedLanguage>('en');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectLocale = () => {
      setIsDetecting(true);
      
      // Priority order for locale detection
      const sources = [
        () => localStorage.getItem('codai-language'),
        () => new URLSearchParams(window.location.search).get('lng'),
        () => navigator.language.split('-')[0],
        () => navigator.languages?.[0]?.split('-')[0],
      ];

      for (const getLocale of sources) {
        try {
          const locale = getLocale();
          if (locale && isLanguageSupported(locale)) {
            setDetectedLocale(locale);
            setIsDetecting(false);
            return;
          }
        } catch (error) {
          console.warn('Error detecting locale:', error);
        }
      }

      // Fallback to default
      setDetectedLocale('en');
      setIsDetecting(false);
    };

    if (typeof window !== 'undefined') {
      detectLocale();
    } else {
      setDetectedLocale('en');
      setIsDetecting(false);
    }
  }, []);

  return { detectedLocale, isDetecting };
}
