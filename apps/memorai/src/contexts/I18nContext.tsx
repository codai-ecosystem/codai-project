'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  availableLanguages: string[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Alias for compatibility
export const useTranslation = useI18n;

interface I18nProviderProps {
  children: React.ReactNode;
}

// Simple translations for production
const translations: Record<string, Record<string, string>> = {
  en: {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'memory.create': 'Create Memory',
    'memory.search': 'Search Memories',
  },
  ro: {
    'common.loading': 'Se încarcă...',
    'common.error': 'Eroare',
    'common.success': 'Succes',
    'auth.login': 'Conectează-te',
    'auth.register': 'Înregistrează-te',
    'auth.logout': 'Deconectează-te',
    'memory.create': 'Creează Memorie',
    'memory.search': 'Caută Memorii',
  },
};

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const availableLanguages = ['en', 'ro'];

  useEffect(() => {
    // Try to get language from localStorage or browser
    const savedLanguage = localStorage.getItem('memorai-language');
    const browserLanguage = navigator.language.split('-')[0];

    const preferredLanguage = savedLanguage || browserLanguage;
    if (availableLanguages.includes(preferredLanguage)) {
      setLanguage(preferredLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    if (availableLanguages.includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('memorai-language', lang);
    }
  };

  const t = (key: string, params?: Record<string, any>): string => {
    const translation = translations[language]?.[key] || translations.en[key] || key;

    if (!params) {
      return translation;
    }

    // Simple parameter replacement
    return Object.keys(params).reduce(
      (result, param) => result.replace(`{{${param}}}`, String(params[param])),
      translation
    );
  };

  const value: I18nContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    availableLanguages,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
