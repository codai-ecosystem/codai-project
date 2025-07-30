/**
 * METU Translation Service - i18n Implementation
 * 
 * Provides internationalization support for English and Romanian languages
 * with context-aware translations and dynamic language switching.
 */

import { en } from './locales/en';
import { ro } from './locales/ro';
import { UserSettings } from '../database/schema';

export type Language = 'en' | 'ro';
export type TranslationKey = keyof typeof en;

// Available translations
const translations = {
    en,
    ro,
} as const;

class TranslationService {
    private currentLanguage: Language = 'en';
    private fallbackLanguage: Language = 'en';

    constructor() {
        this.detectSystemLanguage();
        console.log(`🌐 Translation service initialized with language: ${this.currentLanguage}`);
    }

    /**
     * Detect system language and set as default
     */
    private detectSystemLanguage(): void {
        try {
            const systemLanguage = navigator.language.toLowerCase();
            if (systemLanguage.startsWith('ro')) {
                this.currentLanguage = 'ro';
            } else {
                this.currentLanguage = 'en';
            }
        } catch (error) {
            console.warn('Could not detect system language, using English as default');
            this.currentLanguage = 'en';
        }
    }

    /**
     * Set current language
     */
    setLanguage(language: Language): void {
        if (language in translations) {
            this.currentLanguage = language;
            console.log(`🌐 Language changed to: ${language}`);

            // Dispatch language change event
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language }
            }));
        } else {
            console.error(`Unsupported language: ${language}`);
        }
    }

    /**
     * Get current language
     */
    getCurrentLanguage(): Language {
        return this.currentLanguage;
    }

    /**
     * Get available languages
     */
    getAvailableLanguages(): Language[] {
        return Object.keys(translations) as Language[];
    }

    /**
     * Translate a key to current language
     */
    translate(keyPath: string, replacements?: Record<string, string>): string {
        try {
            const value = this.getNestedValue(
                translations[this.currentLanguage],
                keyPath
            );

            if (value === undefined) {
                // Try fallback language
                const fallbackValue = this.getNestedValue(
                    translations[this.fallbackLanguage],
                    keyPath
                );

                if (fallbackValue === undefined) {
                    console.warn(`Translation missing for key: ${keyPath}`);
                    return keyPath; // Return key as fallback
                }

                return this.applyReplacements(fallbackValue, replacements);
            }

            return this.applyReplacements(value, replacements);
        } catch (error) {
            console.error(`Translation error for key ${keyPath}:`, error);
            return keyPath;
        }
    }

    /**
     * Short alias for translate
     */
    t(keyPath: string, replacements?: Record<string, string>): string {
        return this.translate(keyPath, replacements);
    }

    /**
     * Get nested value from object using dot notation
     */
    private getNestedValue(obj: any, path: string): string | undefined {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Apply string replacements using {{key}} syntax
     */
    private applyReplacements(text: string, replacements?: Record<string, string>): string {
        if (!replacements) return text;

        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return replacements[key] || match;
        });
    }

    /**
     * Get all translations for current language (useful for debugging)
     */
    getAllTranslations(): any {
        return translations[this.currentLanguage];
    }

    /**
     * Check if translation exists
     */
    hasTranslation(keyPath: string): boolean {
        const value = this.getNestedValue(
            translations[this.currentLanguage],
            keyPath
        );
        return value !== undefined;
    }

    /**
     * Get language display name
     */
    getLanguageDisplayName(language?: Language): string {
        const lang = language || this.currentLanguage;
        switch (lang) {
            case 'en':
                return 'English';
            case 'ro':
                return 'Română';
            default:
                return 'Unknown';
        }
    }

    /**
     * Load user language preference from settings
     */
    loadUserLanguage(userSettings: UserSettings): void {
        if (userSettings.language && userSettings.language !== this.currentLanguage) {
            this.setLanguage(userSettings.language);
        }
    }

    /**
     * Get direction for current language (LTR/RTL)
     */
    getTextDirection(): 'ltr' | 'rtl' {
        // Both English and Romanian are LTR languages
        return 'ltr';
    }

    /**
     * Format date according to current language
     */
    formatDate(date: Date): string {
        try {
            const locale = this.currentLanguage === 'ro' ? 'ro-RO' : 'en-US';
            return new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch (error) {
            console.error('Date formatting error:', error);
            return date.toLocaleString();
        }
    }

    /**
     * Format relative time (e.g., "2 minutes ago")
     */
    formatRelativeTime(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) {
            return this.t('time.now');
        } else if (diffMinutes < 60) {
            return `${diffMinutes} ${this.t('time.minutes')}`;
        } else if (diffHours < 24) {
            return `${diffHours} ${this.t('time.hours')}`;
        } else if (diffDays === 1) {
            return this.t('time.yesterday');
        } else if (diffDays < 7) {
            return `${diffDays} ${this.t('time.days')}`;
        } else {
            return this.formatDate(date);
        }
    }

    /**
     * Get pluralized translation (basic implementation)
     */
    pluralize(keyPath: string, count: number, replacements?: Record<string, string>): string {
        const baseTranslation = this.translate(keyPath, {
            ...replacements,
            count: count.toString()
        });

        // Simple pluralization rules (can be enhanced for Romanian)
        if (count === 1) {
            return baseTranslation;
        } else {
            // For now, just add 's' for English or use Romanian rules if needed
            return baseTranslation;
        }
    }
}

// Export singleton instance
export const translationService = new TranslationService();

// Export convenience function
export const t = (keyPath: string, replacements?: Record<string, string>): string => {
    return translationService.translate(keyPath, replacements);
};

// React hook for translations (if needed)
export const useTranslation = () => {
    return {
        t: translationService.translate.bind(translationService),
        language: translationService.getCurrentLanguage(),
        setLanguage: translationService.setLanguage.bind(translationService),
        availableLanguages: translationService.getAvailableLanguages(),
    };
};
