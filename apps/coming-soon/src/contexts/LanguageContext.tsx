'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type SupportedLanguage = 'en' | 'ro';
export type LanguageDirection = 'ltr' | 'rtl';

interface LanguageContextType {
    language: SupportedLanguage;
    direction: LanguageDirection;
    setLanguage: (lang: SupportedLanguage) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    formatDate: (date: Date) => string;
    formatNumber: (num: number) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

// Basic translation dictionary - In production, this would be loaded from separate files
const translations: Record<SupportedLanguage, Record<string, string>> = {
    en: {
        // Navigation
        'nav.skipToContent': 'Skip to content',
        'nav.toggleTheme': 'Toggle theme',
        'nav.toggleLanguage': 'Toggle language',
        'nav.toggleMotion': 'Toggle animation',
        'nav.menu': 'Menu',
        
        // Chapters
        'chapter.intro.title': 'The Dawn of CODAI',
        'chapter.foundation.title': 'Foundation Technologies',
        'chapter.revolution.title': 'The AI Revolution',
        'chapter.infrastructure.title': 'Smart Infrastructure',
        'chapter.developers.title': 'Developer Ecosystem',
        'chapter.finance.title': 'Financial Innovation',
        'chapter.blockchain.title': 'Blockchain Infrastructure',
        'chapter.society.title': 'Society & Culture',
        'chapter.creativity.title': 'Creative Renaissance',
        'chapter.lifestyle.title': 'Digital Lifestyle',
        'chapter.constellation.title': 'AI Constellation',
        'chapter.future.title': 'The Future Begins',
        
        // Common
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.retry': 'Try again',
        'common.close': 'Close',
        'common.next': 'Next',
        'common.previous': 'Previous',
        
        // Accessibility
        'a11y.scrollToNext': 'Scroll to next section',
        'a11y.scrollToPrevious': 'Scroll to previous section',
        'a11y.playAnimation': 'Play animation',
        'a11y.pauseAnimation': 'Pause animation',
        'a11y.reducedMotionEnabled': 'Reduced motion is enabled',
    },
    ro: {
        // Navigation
        'nav.skipToContent': 'Sari la conținut',
        'nav.toggleTheme': 'Comutare temă',
        'nav.toggleLanguage': 'Comutare limbă',
        'nav.toggleMotion': 'Comutare animație',
        'nav.menu': 'Meniu',
        
        // Chapters
        'chapter.intro.title': 'Zorii CODAI',
        'chapter.foundation.title': 'Tehnologii de Bază',
        'chapter.revolution.title': 'Revoluția AI',
        'chapter.infrastructure.title': 'Infrastructură Inteligentă',
        'chapter.developers.title': 'Ecosistemul Dezvoltatorilor',
        'chapter.finance.title': 'Inovația Financiară',
        'chapter.blockchain.title': 'Infrastructura Blockchain',
        'chapter.society.title': 'Societate și Cultură',
        'chapter.creativity.title': 'Renașterea Creativă',
        'chapter.lifestyle.title': 'Stilul de Viață Digital',
        'chapter.constellation.title': 'Constelația AI',
        'chapter.future.title': 'Viitorul Începe',
        
        // Common
        'common.loading': 'Se încarcă...',
        'common.error': 'A apărut o eroare',
        'common.retry': 'Încearcă din nou',
        'common.close': 'Închide',
        'common.next': 'Următorul',
        'common.previous': 'Precedentul',
        
        // Accessibility
        'a11y.scrollToNext': 'Derulează la următoarea secțiune',
        'a11y.scrollToPrevious': 'Derulează la secțiunea anterioară',
        'a11y.playAnimation': 'Redă animația',
        'a11y.pauseAnimation': 'Întrerupe animația',
        'a11y.reducedMotionEnabled': 'Mișcarea redusă este activată',
    },
};

interface LanguageProviderProps {
    children: ReactNode;
    defaultLanguage?: SupportedLanguage;
}

export function LanguageProvider({ 
    children, 
    defaultLanguage = 'en' 
}: LanguageProviderProps) {
    const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);

    // Initialize language from localStorage and browser preference
    useEffect(() => {
        try {
            // Check localStorage first
            const stored = localStorage.getItem('language') as SupportedLanguage | null;
            if (stored && ['en', 'ro'].includes(stored)) {
                setLanguageState(stored);
                return;
            }

            // Fallback to browser language
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith('ro')) {
                setLanguageState('ro');
            } else {
                setLanguageState('en');
            }
        } catch (error) {
            console.error('Error initializing language:', error);
            setLanguageState(defaultLanguage);
        }
    }, [defaultLanguage]);

    // Update document attributes when language changes
    useEffect(() => {
        try {
            document.documentElement.setAttribute('lang', language);
            document.documentElement.setAttribute('dir', language === 'en' ? 'ltr' : 'ltr'); // Both are LTR
        } catch (error) {
            console.error('Error updating language attributes:', error);
        }
    }, [language]);

    const setLanguage = (lang: SupportedLanguage) => {
        try {
            setLanguageState(lang);
            localStorage.setItem('language', lang);
        } catch (error) {
            console.error('Error saving language:', error);
            setLanguageState(lang);
        }
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        try {
            let translation = translations[language]?.[key] || translations['en']?.[key] || key;
            
            // Replace parameters if provided
            if (params) {
                Object.entries(params).forEach(([paramKey, paramValue]) => {
                    translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
                });
            }
            
            return translation;
        } catch (error) {
            console.error('Translation error for key:', key, error);
            return key;
        }
    };

    const formatDate = (date: Date): string => {
        try {
            return new Intl.DateTimeFormat(language === 'ro' ? 'ro-RO' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (error) {
            console.error('Date formatting error:', error);
            return date.toLocaleDateString();
        }
    };

    const formatNumber = (num: number): string => {
        try {
            return new Intl.NumberFormat(language === 'ro' ? 'ro-RO' : 'en-US').format(num);
        } catch (error) {
            console.error('Number formatting error:', error);
            return num.toString();
        }
    };

    const direction: LanguageDirection = 'ltr'; // Both languages are left-to-right
    const isRTL = false; // Both supported languages are LTR

    const value: LanguageContextType = {
        language,
        direction,
        setLanguage,
        t,
        formatDate,
        formatNumber,
        isRTL,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export { LanguageContext, type LanguageContextType };