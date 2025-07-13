'use client';

import React, { createContext, useContext } from 'react';

// Stub I18n Context for build compatibility
// TODO: Implement proper internationalization system

interface I18nContextType {
  language: string;
  locale: string;
  setLanguage: (lang: string) => void;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  languages: Array<{
    code: string;
    name: string;
    nativeName: string;
  }>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const value: I18nContextType = {
    language: 'en',
    locale: 'en',
    setLanguage: () => { },
    setLocale: () => { },
    t: (key: string) => key, // Just return the key as a fallback
    isLoading: false,
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ro', name: 'Romanian', nativeName: 'Română' },
    ],
  };

  return (
    <I18nContext.Provider value={value}>
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

// Alias for compatibility
export const useTranslation = useI18n;
