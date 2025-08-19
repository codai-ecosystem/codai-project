'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { JSX } from 'react';
import type { ReactNode } from 'react';

import type { I18nContextType, Locale, TranslationKeys } from '@/types/i18n';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Translation cache
const translationCache = new Map<Locale, TranslationKeys>();

// Default locale
const DEFAULT_LOCALE: Locale = 'en';

// Browser locale detection
function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'ro' || browserLang === 'en'
    ? (browserLang as Locale)
    : DEFAULT_LOCALE;
}

// Storage key
const LOCALE_STORAGE_KEY = 'metu-locale';

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({
  children,
  defaultLocale,
}: I18nProviderProps): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(
    defaultLocale ?? DEFAULT_LOCALE
  );
  const [translations, setTranslations] = useState<TranslationKeys | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load translations for a locale
  const loadTranslations = useCallback(
    async (targetLocale: Locale): Promise<TranslationKeys> => {
      // Check cache first
      if (translationCache.has(targetLocale)) {
        return translationCache.get(targetLocale)!;
      }

      try {
        const response = await fetch(`/locales/${targetLocale}/common.json`);
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${targetLocale}`);
        }

        const data = (await response.json()) as TranslationKeys;
        translationCache.set(targetLocale, data);
        return data;
      } catch (error: unknown) {
        console.error(`Error loading translations for ${targetLocale}:`, error);

        // Fallback to default locale if not already trying it
        if (targetLocale !== DEFAULT_LOCALE) {
          return loadTranslations(DEFAULT_LOCALE);
        }

        // Return empty translations as last resort
        return {} as TranslationKeys;
      }
    },
    []
  );

  // Set locale with persistence
  const setLocale = useCallback(
    async (newLocale: Locale) => {
      setIsLoading(true);

      try {
        const newTranslations = await loadTranslations(newLocale);
        setTranslations(newTranslations);
        setLocaleState(newLocale);

        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
        }
      } catch (error: unknown) {
        console.error('Error changing locale:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [loadTranslations]
  );

  // Translation function with nested key support and interpolation
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!translations) return key; // Navigate nested keys (e.g., "auth.signIn")
    const keys = key.split('.');
    let value: unknown = translations;
    for (const k of keys) {
      if (value != null && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Simple interpolation
    if (params != null) {
      return Object.entries(params).reduce(
        (text, [paramKey, paramValue]) =>
          text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue)),
        value
      );
    }

    return value;
  };

  // Initialize locale on mount
  useEffect(() => {
    let initialLocale = defaultLocale ?? DEFAULT_LOCALE;

    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (
        savedLocale !== null &&
        (savedLocale === 'en' || savedLocale === 'ro')
      ) {
        initialLocale = savedLocale as Locale;
      } else if (defaultLocale === undefined) {
        // Detect browser locale if no saved locale and no default provided
        initialLocale = detectBrowserLocale();
      }
    }
    void setLocale(initialLocale);
  }, [defaultLocale, setLocale]);

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    isLoading,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);

  // During SSR or when outside provider, return default values
  if (context === undefined) {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      // SSR fallback
      return {
        locale: 'en' as Locale,
        setLocale: async (_locale: Locale): Promise<void> => {},
        t: (key: string) => key,
        isLoading: false,
      };
    }
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Convenience hook for just the translation function
export function useTranslation(): { t: (key: string) => string } {
  const { t } = useI18n();
  return { t };
}
