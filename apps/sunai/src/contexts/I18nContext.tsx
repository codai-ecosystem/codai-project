'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface I18nContextType {
    currentLanguage: string;
    availableLanguages: string[];
    setLanguage: (language: string) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    locale: string;
    setLocale: (locale: string) => void;
    isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

export function useTranslation() {
    const { t } = useI18n();
    return { t };
}

interface I18nProviderProps {
    children: ReactNode;
    defaultLanguage?: string;
}

// Mock translations
const translations: Record<string, Record<string, string>> = {
    en: {
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'auth.signIn': 'Sign In',
        'auth.signOut': 'Sign Out',
        'nav.home': 'Home',
        'nav.dashboard': 'Dashboard',
        'nav.settings': 'Settings',
    },
    ro: {
        'common.loading': 'Se încarcă...',
        'common.error': 'Eroare',
        'common.save': 'Salvează',
        'common.cancel': 'Anulează',
        'auth.signIn': 'Autentificare',
        'auth.signOut': 'Deconectare',
        'nav.home': 'Acasă',
        'nav.dashboard': 'Panou',
        'nav.settings': 'Setări',
    },
};

export function I18nProvider({ children, defaultLanguage = 'en' }: I18nProviderProps) {
    const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
    const availableLanguages = Object.keys(translations);

    const setLanguage = (language: string) => {
        if (availableLanguages.includes(language)) {
            setCurrentLanguage(language);
            localStorage.setItem('language', language);
        }
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        const languageTranslations = translations[currentLanguage] || translations[defaultLanguage];
        let translation = languageTranslations[key] || key;

        if (params) {
            Object.entries(params).forEach(([param, value]) => {
                translation = translation.replace(`{{${param}}}`, String(value));
            });
        }

        return translation;
    };

    useEffect(() => {
        // Load language from localStorage
        const storedLanguage = localStorage.getItem('language');
        if (storedLanguage && availableLanguages.includes(storedLanguage)) {
            setCurrentLanguage(storedLanguage);
        }
    }, []);

    const value: I18nContextType = {
        currentLanguage,
        availableLanguages,
        setLanguage,
        t,
        locale: currentLanguage,
        setLocale: setLanguage,
        isLoading: false,
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}
