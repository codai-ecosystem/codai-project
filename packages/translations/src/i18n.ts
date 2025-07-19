import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// Import translation files
import enCommon from '../locales/en/common.json'
import roCommon from '../locales/ro/common.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    common: enCommon,
  },
  ro: {
    common: roCommon,
  },
} as const

export const supportedLanguages = ['en', 'ro'] as const
export type SupportedLanguage = typeof supportedLanguages[number]

// Configuration for i18next
const i18nConfig = {
  fallbackLng: 'en',
  defaultNS,
  supportedLngs: supportedLanguages,

  // Resources
  resources,

  // Detection options
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
  },

  // Interpolation
  interpolation: {
    escapeValue: false, // React already escapes values
  },

  // Development options
  debug: process.env.NODE_ENV === 'development',

  // React options
  react: {
    useSuspense: false,
  },
}

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig)

export default i18n
