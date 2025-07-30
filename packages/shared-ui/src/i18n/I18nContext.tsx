'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';

import { defaultLanguage, supportedLanguages, initI18n } from './config';

export type Locale = 'en' | 'ro';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => Promise<void>;
    isLoading: boolean;
    t: (key: string, options?: any) => string;

    // Legacy compatibility
    currentLanguage: string;
    setLanguage: (language: string) => Promise<void>;
    availableLanguages: string[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
    children: ReactNode;
    initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLanguage as Locale);
    const { i18n, t } = useI18nextTranslation();

    // Initialize i18n
    useEffect(() => {
        const init = async () => {
            try {
                await initI18n();

                // Set initial language
                const savedLocale = localStorage.getItem('i18nextLng') as Locale;
                const initialLang = savedLocale || initialLocale || defaultLanguage as Locale;

                if (supportedLanguages.includes(initialLang)) {
                    setLocaleState(initialLang);
                    await i18n.changeLanguage(initialLang);
                }
            } catch (error) {
                console.error('Failed to initialize i18n:', error);
            } finally {
                setIsLoading(false);
            }
        };

        void init();
    }, [i18n, initialLocale]);

    const setLocale = async (newLocale: Locale) => {
        if (!supportedLanguages.includes(newLocale)) {
            console.warn(`Unsupported locale: ${newLocale}`);
            return;
        }

        setIsLoading(true);
        try {
            await i18n.changeLanguage(newLocale);
            setLocaleState(newLocale);
            localStorage.setItem('i18nextLng', newLocale);
        } catch (error) {
            console.error('Failed to change language:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Legacy compatibility functions
    const setLanguage = async (language: string) => {
        if (language === 'en' || language === 'ro') {
            await setLocale(language);
        }
    };

    const contextValue: I18nContextType = {
        locale,
        setLocale,
        isLoading,
        t,

        // Legacy compatibility
        currentLanguage: locale,
        setLanguage,
        availableLanguages: supportedLanguages,
    };

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);
    if (context === undefined) {
        // Fallback for SSR or when provider is not available
        return {
            locale: 'en' as Locale,
            setLocale: () => Promise.resolve(),
            isLoading: false,
            t: (key: string) => key,
            currentLanguage: 'en',
            setLanguage: () => Promise.resolve(),
            availableLanguages: ['en', 'ro']
        }
    }
    return context;
}

// Alias for useI18n for compatibility
export const useTranslation = useI18n;
