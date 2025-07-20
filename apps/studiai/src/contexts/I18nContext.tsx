'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface I18nContextType {
    locale: string;
    setLocale: (locale: string) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    isLoading: boolean;
    availableLocales: string[];
}

interface Translation {
    [key: string]: string | Translation;
}

interface Translations {
    [locale: string]: Translation;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
    children: ReactNode;
    defaultLocale?: string;
}

// Mock translations - in a real app, these would be loaded from files
const translations: Translations = {
    en: {
        common: {
            welcome: 'Welcome',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            create: 'Create',
            back: 'Back',
            next: 'Next',
            previous: 'Previous',
            submit: 'Submit'
        },
        auth: {
            signIn: 'Sign In',
            signUp: 'Sign Up',
            signOut: 'Sign Out',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            forgotPassword: 'Forgot Password?',
            rememberMe: 'Remember me',
            welcomeBack: 'Welcome back!',
            createAccount: 'Create your account'
        },
        study: {
            session: 'Study Session',
            sessions: 'Study Sessions',
            plan: 'Study Plan',
            plans: 'Study Plans',
            goal: 'Goal',
            goals: 'Goals',
            progress: 'Progress',
            materials: 'Materials',
            notes: 'Notes',
            quiz: 'Quiz',
            flashcards: 'Flashcards',
            subjects: 'Subjects',
            topics: 'Topics'
        }
    },
    ro: {
        common: {
            welcome: 'Bun venit',
            loading: 'Se încarcă...',
            error: 'Eroare',
            success: 'Succes',
            cancel: 'Anulează',
            save: 'Salvează',
            delete: 'Șterge',
            edit: 'Editează',
            create: 'Creează',
            back: 'Înapoi',
            next: 'Următorul',
            previous: 'Anterior',
            submit: 'Trimite'
        },
        auth: {
            signIn: 'Conectare',
            signUp: 'Înregistrare',
            signOut: 'Deconectare',
            email: 'Email',
            password: 'Parolă',
            confirmPassword: 'Confirmă parola',
            forgotPassword: 'Ai uitat parola?',
            rememberMe: 'Ține-mă minte',
            welcomeBack: 'Bine ai revenit!',
            createAccount: 'Creează-ți contul'
        },
        study: {
            session: 'Sesiune de studiu',
            sessions: 'Sesiuni de studiu',
            plan: 'Plan de studiu',
            plans: 'Planuri de studiu',
            goal: 'Obiectiv',
            goals: 'Obiective',
            progress: 'Progres',
            materials: 'Materiale',
            notes: 'Notițe',
            quiz: 'Quiz',
            flashcards: 'Carduri de memorare',
            subjects: 'Materii',
            topics: 'Teme'
        }
    }
};

export function I18nProvider({ children, defaultLocale = 'en' }: I18nProviderProps) {
    const [locale, setLocaleState] = useState(defaultLocale);
    const [isLoading, setIsLoading] = useState(false);
    const availableLocales = Object.keys(translations);

    const setLocale = async (newLocale: string) => {
        if (!availableLocales.includes(newLocale)) {
            console.warn(`Locale ${newLocale} is not available`);
            return;
        }

        setIsLoading(true);

        // Simulate loading delay for fetching translations
        await new Promise(resolve => setTimeout(resolve, 100));

        setLocaleState(newLocale);
        setIsLoading(false);

        // Persist locale preference
        if (typeof window !== 'undefined') {
            localStorage.setItem('studiai_locale', newLocale);
        }
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: any = translations[locale];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if key not found
                value = translations.en;
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = value[fallbackKey];
                    } else {
                        return key; // Return key as fallback
                    }
                }
                break;
            }
        }

        let result = typeof value === 'string' ? value : key;

        // Replace parameters
        if (params) {
            Object.entries(params).forEach(([param, val]) => {
                result = result.replace(`{${param}}`, String(val));
            });
        }

        return result;
    };

    // Load saved locale on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('studiai_locale');
            if (savedLocale && availableLocales.includes(savedLocale)) {
                setLocaleState(savedLocale);
            }
        }
    }, []);

    const value: I18nContextType = {
        locale,
        setLocale,
        t,
        isLoading,
        availableLocales
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

// Convenience hook for translation
export function useTranslation() {
    const { t } = useI18n();
    return { t };
}
