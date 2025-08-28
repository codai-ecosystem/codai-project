/**
 * @fileoverview React Context Provider for i18n
 * @author Cautai Team
 * @version 1.0.0
 */

import React, { useState, useEffect, ReactNode, createContext } from 'react';
import type { Language, I18nContext, I18nConfig } from './types';
import { i18n, initI18n } from './i18n';

// Create context
const I18nReactContext = createContext<I18nContext | null>(null);

interface TranslationProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
  config?: Partial<I18nConfig>;
  fallbackComponent?: ReactNode;
}

export function TranslationProvider(props: TranslationProviderProps) {
  const { 
    children,
    initialLanguage,
    config,
    fallbackComponent = React.createElement('div', {}, 'Loading translations...')
  } = props;

  const [i18nInstance] = useState(() => config ? initI18n(config) : i18n);
  const [language, setLanguage] = useState<Language>(
    initialLanguage || i18nInstance.getLanguage()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set initial language if provided
  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      handleLanguageChange(initialLanguage);
    }
  }, [initialLanguage]);

  // Subscribe to language changes
  useEffect(() => {
    const unsubscribe = i18nInstance.onLanguageChange((newLang) => {
      setLanguage(newLang);
      setError(null);
    });

    return unsubscribe;
  }, [i18nInstance]);

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate async loading if needed (e.g., for dynamic imports)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      i18nInstance.setLanguage(newLanguage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change language');
      console.error('Language change error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: I18nContext = {
    language,
    setLanguage: handleLanguageChange,
    t: i18nInstance.t,
    isLoading,
    error
  };

  // Show fallback component while loading
  if (isLoading && fallbackComponent) {
    return React.createElement(React.Fragment, {}, fallbackComponent);
  }

  // Show error state if needed
  if (error) {
    return React.createElement('div', 
      { style: { padding: '20px', background: '#fee', border: '1px solid #fcc' } },
      React.createElement('h3', {}, 'Translation Error'),
      React.createElement('p', {}, error),
      React.createElement('button', { onClick: () => setError(null) }, 'Dismiss')
    );
  }

  return React.createElement(I18nReactContext.Provider, { value: contextValue }, children);
}

// Export context for custom usage
export { I18nReactContext };