import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { translations } from './translations';

export const defaultLanguage = 'en';
export const supportedLanguages = ['en', 'ro'];

export const i18nConfig = {
    fallbackLng: defaultLanguage,
    lng: defaultLanguage,
    supportedLngs: supportedLanguages,

    interpolation: {
        escapeValue: false, // React already does escaping
    },

    resources: translations,

    detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
    },

    react: {
        useSuspense: false,
    },
};

export const initI18n = async () => {
    if (!i18n.isInitialized) {
        await i18n
            .use(LanguageDetector)
            .use(initReactI18next)
            .init(i18nConfig);
    }
    return i18n;
};

export { i18n };
