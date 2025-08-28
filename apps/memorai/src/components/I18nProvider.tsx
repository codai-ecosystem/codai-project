/**
 * @fileoverview I18n Provider Component
 * @description Provides i18n context to the application
 */

import React, { Suspense, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getCurrentLocale, isRTL, localeConfig, type Locale } from '../i18n';

interface I18nProviderProps {
  children: React.ReactNode;
  locale?: Locale;
  messages?: any;
}

interface I18nContextType {
  currentLocale: Locale;
  localeConfig: typeof localeConfig;
  changeLanguage: (lng: Locale) => Promise<boolean>;
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

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  locale = 'en',
  messages = {} 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => getCurrentLocale());
  const [rtl, setRTL] = useState(() => isRTL());

  useEffect(() => {
    const handleLanguageChanged = (event: CustomEvent) => {
      const { lng } = event.detail;
      if (lng === 'en' || lng === 'ro') {
        setCurrentLocale(lng);
        setRTL(isRTL(lng));
      }
    };

    window.addEventListener('languageChanged', handleLanguageChanged as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChanged as EventListener);
    };
  }, []);

  useEffect(() => {
    if (locale && locale !== currentLocale) {
      setCurrentLocale(locale);
      setRTL(isRTL(locale));
    }
    setIsLoading(false);
  }, [locale, currentLocale]);

  const changeLanguage = async (lng: Locale): Promise<boolean> => {
    if (lng !== 'en' && lng !== 'ro') {
      console.warn(`Unsupported locale: ${lng}`);
      return false;
    }

    setIsLoading(true);
    
    try {
      setCurrentLocale(lng);
      setRTL(isRTL(lng));
      
      // Emit language change event
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { lng, locale: lng } 
      }));
      
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
    localeConfig,
    changeLanguage,
    isLoading,
    isRTL: rtl
  };

  return (
    <NextIntlClientProvider locale={currentLocale} messages={messages}>
      <I18nContext.Provider value={contextValue}>
        <Suspense fallback={<LoadingFallback />}>
          <div className={`${rtl ? 'rtl' : 'ltr'}`} dir={rtl ? 'rtl' : 'ltr'}>
            {children}
          </div>
        </Suspense>
      </I18nContext.Provider>
    </NextIntlClientProvider>
  );
};

export default I18nProvider;