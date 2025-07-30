import i18n from 'i18next';
import { initReactI18next, useTranslation as useReactI18nextTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import * as React from 'react';

// Import translation files
import enCommon from '../../locales/en/common.json';
import roCommon from '../../locales/ro/common.json';

export interface TranslationService {
    initialize(): Promise<void>;
    changeLanguage(language: string): Promise<void>;
    getCurrentLanguage(): string;
    getSupportedLanguages(): string[];
    isLanguageSupported(language: string): boolean;
    t(key: string, options?: any): string;
}

class TranslationServiceImpl implements TranslationService {
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;

        await i18n
            .use(Backend)
            .use(LanguageDetector)
            .use(initReactI18next)
            .init({
                fallbackLng: 'en',
                debug: process.env.NODE_ENV === 'development',

                interpolation: {
                    escapeValue: false, // React already escapes by default
                },

                resources: {
                    en: {
                        common: enCommon,
                    },
                    ro: {
                        common: roCommon,
                    },
                },

                defaultNS: 'common',
                ns: ['common'],

                detection: {
                    order: ['localStorage', 'navigator', 'htmlTag'],
                    caches: ['localStorage'],
                    lookupLocalStorage: 'i18nextLng',
                },

                backend: {
                    loadPath: '/locales/{{lng}}/{{ns}}.json',
                },
            });

        this.initialized = true;
    }

    async changeLanguage(language: string): Promise<void> {
        if (!this.isLanguageSupported(language)) {
            throw new Error(`Language ${language} is not supported`);
        }

        await i18n.changeLanguage(language);

        // Store preference
        if (typeof window !== 'undefined') {
            localStorage.setItem('i18nextLng', language);
        }
    }

    getCurrentLanguage(): string {
        return i18n.language || 'en';
    }

    getSupportedLanguages(): string[] {
        return ['en', 'ro'];
    }

    isLanguageSupported(language: string): boolean {
        return this.getSupportedLanguages().includes(language);
    }

    t(key: string, options?: any): string {
        return i18n.t(key, options) as string;
    }

    // Helper methods for common translations
    getAppTitle(assistantName: string = 'METU'): string {
        return this.t('app.title', { assistantName });
    }

    getVoiceState(state: 'idle' | 'listening' | 'processing' | 'speaking'): string {
        return this.t(`voice.states.${state}`);
    }

    getErrorMessage(error: string): string {
        return this.t(`errors.${error}`, { defaultValue: this.t('errors.general') });
    }

    // Romanian-specific helpers
    getRomanianContext(): {
        culturalGreeting: string;
        businessHours: string;
        formalAddress: string;
    } {
        const currentLang = this.getCurrentLanguage();

        if (currentLang === 'ro') {
            return {
                culturalGreeting: 'Bună ziua! Cum vă pot ajuta astăzi?',
                businessHours: 'Programul de lucru: Luni-Vineri, 09:00-18:00',
                formalAddress: 'Domnule/Doamnă',
            };
        }

        return {
            culturalGreeting: 'Good day! How can I help you today?',
            businessHours: 'Business hours: Monday-Friday, 09:00-18:00',
            formalAddress: 'Sir/Madam',
        };
    }

    // Dynamic content translation
    translateDynamicContent(content: string, targetLanguage?: string): Promise<string> {
        // This would integrate with a translation API for dynamic content
        // For now, return the original content
        return Promise.resolve(content);
    }

    // Cultural context adaptation
    adaptContentForCulture(content: string, culture: 'romanian' | 'international'): string {
        if (culture === 'romanian') {
            // Apply Romanian cultural context
            return content
                .replace(/\bHello\b/g, 'Bună ziua')
                .replace(/\bThanks\b/g, 'Mulțumesc')
                .replace(/\bPlease\b/g, 'Vă rog');
        }

        return content;
    }
}

// Singleton instance
export const translationService = new TranslationServiceImpl();

// React hook for translations
export const useTranslation = (): {
    t: (key: string, options?: any) => string;
    changeLanguage: (lang: string) => Promise<void>;
    currentLanguage: string;
    getSupportedLanguages: () => string[];
    isRomanian: boolean;
    isEnglish: boolean;
} => {
    const { t, i18n } = useReactI18nextTranslation();

    return {
        t: (key: string, options?: any) => t(key, options) as string,
        changeLanguage: (lang: string) => translationService.changeLanguage(lang),
        currentLanguage: i18n.language,
        getSupportedLanguages: () => translationService.getSupportedLanguages(),
        isRomanian: i18n.language === 'ro',
        isEnglish: i18n.language === 'en',
    };
};

// Higher-order component for translation
export const withTranslation = <P extends object>(
    Component: React.ComponentType<P>
) => {
    const WrappedComponent = (props: P) => {
        const translation = useTranslation();
        return React.createElement(Component, { ...props, translation });
    };

    WrappedComponent.displayName = `withTranslation(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
};

export default translationService;
