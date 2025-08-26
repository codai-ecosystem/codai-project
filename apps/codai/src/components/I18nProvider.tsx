/**
 * @fileoverview I18n Provider Component
 * @description Provides i18n context to the application
 */

import React, { Suspense, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { SUPPORTED_LOCALES, SupportedLanguage, isRTL } from '../lib/i18n/constants';

interface I18nProviderProps {
  children: React.ReactNode;
  locale?: string;
}

interface I18nContextType {
  currentLocale: SupportedLanguage;
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
  const [currentLocale, setCurrentLocale] = useState<SupportedLanguage>('en');
  const [rtlMode, setRTLMode] = useState(false);

  useEffect(() => {
    const handleLanguageChanged = (event: CustomEvent) => {
      const { lng } = event.detail;
      if (lng in SUPPORTED_LOCALES) {
        setCurrentLocale(lng as SupportedLanguage);
        setRTLMode(isRTL(lng as SupportedLanguage));
      }
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
    if (!SUPPORTED_LOCALES[lng as keyof typeof SUPPORTED_LOCALES]) {
      console.warn(`Unsupported locale: ${lng}`);
      return false;
    }

    setIsLoading(true);
    
    try {
      await i18n.changeLanguage(lng);
      setCurrentLocale(lng as SupportedLanguage);
      setRTLMode(isRTL(lng as SupportedLanguage));
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
    isRTL: rtlMode
  };

  return (
    <I18nextProvider i18n={i18n}>
      <I18nContext.Provider value={contextValue}>
        <Suspense fallback={<LoadingFallback />}>
          <div className={`${rtlMode ? 'rtl' : 'ltr'}`} dir={rtlMode ? 'rtl' : 'ltr'}>
            {children}
          </div>
        </Suspense>
      </I18nContext.Provider>
    </I18nextProvider>
  );
};

export default I18nProvider;