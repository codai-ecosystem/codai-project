/**
 * @fileoverview React Hooks for i18n
 * @author Cautai Team
 * @version 1.0.0
 */

import { useState, useEffect, useContext, createContext } from 'react';
import type { Language, TranslationFunction, I18nContext } from './types';
import { i18n } from './i18n';

// React Context for i18n
const I18nReactContext = createContext<I18nContext | null>(null);

// Custom hook to use translation
export function useTranslation(): {
  t: TranslationFunction;
  language: Language;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
  error: string | null;
} {
  const context = useContext(I18nReactContext);
  
  if (context) {
    return {
      t: context.t,
      language: context.language,
      setLanguage: context.setLanguage,
      isLoading: context.isLoading,
      error: context.error
    };
  }

  // Fallback to direct i18n usage if no provider
  const [language, setLanguageState] = useState<Language>(i18n.getLanguage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLanguage = (lang: Language) => {
    try {
      setIsLoading(true);
      setError(null);
      i18n.setLanguage(lang);
      setLanguageState(lang);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Language change failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = i18n.onLanguageChange((newLang) => {
      setLanguageState(newLang);
    });

    return unsubscribe;
  }, []);

  return {
    t: i18n.t,
    language,
    setLanguage,
    isLoading,
    error
  };
}

// Custom hook to get i18n instance and utilities
export function useI18n() {
  const { language, setLanguage } = useTranslation();
  
  return {
    language,
    setLanguage,
    formatNumber: i18n.formatNumber.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatTime: i18n.formatTime.bind(i18n),
    formatRelativeTime: i18n.formatRelativeTime.bind(i18n),
    formatFileSize: i18n.formatFileSize.bind(i18n),
    formatShortNumber: i18n.formatShortNumber.bind(i18n),
    getLanguageConfig: i18n.getLanguageConfig.bind(i18n),
    getSupportedLanguages: i18n.getSupportedLanguages.bind(i18n)
  };
}