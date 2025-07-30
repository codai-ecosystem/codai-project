'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'ro'

interface I18nContextType {
    language: Language
    setLanguage: (language: Language) => void
    t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Translation keys and values
type TranslationKey = string
type TranslationDict = Record<TranslationKey, string>

const translations: Record<Language, TranslationDict> = {
    en: {
        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.create': 'Create',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.sort': 'Sort',
        'common.settings': 'Settings',
        'common.profile': 'Profile',
        'common.dashboard': 'Dashboard',
        'common.welcome': 'Welcome',
        'common.goodbye': 'Goodbye',

        // Header
        'header.search': 'Search',
        'header.notifications': 'Notifications',
        'header.lightMode': 'Switch to light mode',
        'header.darkMode': 'Switch to dark mode',
        'header.changeLanguage': 'Change language',
        'header.userMenu': 'User menu',
        'header.menu.profile': 'Profile',
        'header.menu.settings': 'Settings',
        'header.menu.signOut': 'Sign Out',

        // Footer
        'footer.allRightsReserved': 'All rights reserved',
        'footer.privacyPolicy': 'Privacy Policy',
        'footer.termsOfService': 'Terms of Service',
        'footer.contact': 'Contact',
        'footer.about': 'About',
        'footer.help': 'Help',
        'footer.support': 'Support',

        // Navigation
        'nav.home': 'Home',
        'nav.dashboard': 'Dashboard',
        'nav.features': 'Features',
        'nav.pricing': 'Pricing',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'nav.blog': 'Blog',
        'nav.docs': 'Documentation',
        'nav.api': 'API',
        'nav.community': 'Community',

        // Auth
        'auth.signIn': 'Sign In',
        'auth.signUp': 'Sign Up',
        'auth.signOut': 'Sign Out',
        'auth.forgotPassword': 'Forgot Password',
        'auth.resetPassword': 'Reset Password',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.rememberMe': 'Remember me',
        'auth.createAccount': 'Create Account',
        'auth.alreadyHaveAccount': 'Already have an account?',
        'auth.dontHaveAccount': "Don't have an account?",

        // Language
        'language.english': 'English',
        'language.romanian': 'Romanian',

        // App specific
        'app.description': 'Intelligent AI platform for modern businesses',
        'app.tagline': 'Empowering the future with AI',
        'app.getStarted': 'Get Started',
        'app.learnMore': 'Learn More',
        'app.tryNow': 'Try Now',
        'app.freeTrial': 'Free Trial',
        'app.signUpFree': 'Sign Up Free',

        // Status
        'status.online': 'Online',
        'status.offline': 'Offline',
        'status.connecting': 'Connecting...',
        'status.connected': 'Connected',
        'status.disconnected': 'Disconnected',
    },
    ro: {
        // Common
        'common.loading': 'Se încarcă...',
        'common.error': 'Eroare',
        'common.success': 'Succes',
        'common.cancel': 'Anulează',
        'common.save': 'Salvează',
        'common.delete': 'Șterge',
        'common.edit': 'Editează',
        'common.create': 'Creează',
        'common.back': 'Înapoi',
        'common.next': 'Următorul',
        'common.previous': 'Precedent',
        'common.search': 'Caută',
        'common.filter': 'Filtrează',
        'common.sort': 'Sortează',
        'common.settings': 'Setări',
        'common.profile': 'Profil',
        'common.dashboard': 'Tablou de bord',
        'common.welcome': 'Bun venit',
        'common.goodbye': 'La revedere',

        // Header
        'header.search': 'Caută',
        'header.notifications': 'Notificări',
        'header.lightMode': 'Mod luminos',
        'header.darkMode': 'Mod întunecat',
        'header.changeLanguage': 'Schimbă limba',
        'header.userMenu': 'Meniul utilizatorului',
        'header.menu.profile': 'Profil',
        'header.menu.settings': 'Setări',
        'header.menu.signOut': 'Deconectare',

        // Footer
        'footer.allRightsReserved': 'Toate drepturile rezervate',
        'footer.privacyPolicy': 'Politica de confidențialitate',
        'footer.termsOfService': 'Termeni și condiții',
        'footer.contact': 'Contact',
        'footer.about': 'Despre',
        'footer.help': 'Ajutor',
        'footer.support': 'Suport',

        // Navigation
        'nav.home': 'Acasă',
        'nav.dashboard': 'Tablou de bord',
        'nav.features': 'Funcționalități',
        'nav.pricing': 'Prețuri',
        'nav.about': 'Despre',
        'nav.contact': 'Contact',
        'nav.blog': 'Blog',
        'nav.docs': 'Documentație',
        'nav.api': 'API',
        'nav.community': 'Comunitate',

        // Auth
        'auth.signIn': 'Conectare',
        'auth.signUp': 'Înregistrare',
        'auth.signOut': 'Deconectare',
        'auth.forgotPassword': 'Am uitat parola',
        'auth.resetPassword': 'Resetează parola',
        'auth.email': 'Email',
        'auth.password': 'Parolă',
        'auth.confirmPassword': 'Confirmă parola',
        'auth.rememberMe': 'Ține-mă minte',
        'auth.createAccount': 'Creează cont',
        'auth.alreadyHaveAccount': 'Ai deja un cont?',
        'auth.dontHaveAccount': 'Nu ai un cont?',

        // Language
        'language.english': 'Engleză',
        'language.romanian': 'Română',

        // App specific
        'app.description': 'Platformă AI inteligentă pentru afaceri moderne',
        'app.tagline': 'Împuternicind viitorul cu AI',
        'app.getStarted': 'Începe acum',
        'app.learnMore': 'Află mai mult',
        'app.tryNow': 'Încearcă acum',
        'app.freeTrial': 'Încercare gratuită',
        'app.signUpFree': 'Înregistrează-te gratuit',

        // Status
        'status.online': 'Online',
        'status.offline': 'Offline',
        'status.connecting': 'Se conectează...',
        'status.connected': 'Conectat',
        'status.disconnected': 'Deconectat',
    }
}

interface I18nProviderProps {
    children: ReactNode
    defaultLanguage?: Language
}

export function I18nProvider({ children, defaultLanguage = 'en' }: I18nProviderProps) {
    const [language, setLanguage] = useState<Language>(defaultLanguage)

    // Load language preference from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('language') as Language
            if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ro')) {
                setLanguage(savedLanguage)
            }
        }
    }, [])

    // Save language preference to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', language)
        }
    }, [language])

    const t = (key: string, params?: Record<string, string | number>): string => {
        const languageTranslations = translations[language] as TranslationDict
        const fallbackTranslations = translations['en'] as TranslationDict

        let translation = languageTranslations[key] || fallbackTranslations[key] || key

        // Replace parameters in translation
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                translation = translation.replace(`{${paramKey}}`, String(paramValue))
            })
        }

        return translation
    }

    const value = {
        language,
        setLanguage,
        t
    }

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider')
    }
    return context
}

export default I18nProvider
