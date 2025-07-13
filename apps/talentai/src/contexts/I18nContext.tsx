'use client';

import React, { createContext, useContext, type ReactNode } from 'react';

interface I18nContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  availableLanguages: string[];
  locale: string;
  setLocale: (locale: string) => void;
  isLoading: boolean;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const i18nValue: I18nContextType = {
    currentLanguage: 'en',
    setLanguage: (language: string) => {
      console.log('Set language:', language);
    },
    availableLanguages: ['en', 'es', 'fr', 'de'],
    locale: 'en',
    setLocale: (locale: string) => {
      console.log('Set locale:', locale);
    },
    isLoading: false,
    t: (key: string) => key, // Mock translation function
  };

  return (
    <I18nContext.Provider value={i18nValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Alias for useI18n for compatibility
export const useTranslation = useI18n;
