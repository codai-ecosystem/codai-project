// Core i18n setup
export { default as i18n } from './i18n'
export { resources, supportedLanguages, defaultNS } from './i18n'
export type { SupportedLanguage } from './i18n'

// Hooks and utilities
export { useTranslation, useLanguage, useI18n } from './hooks'
export type { TranslationKey } from './hooks'

// Translation namespaces
export const namespaces = {
  common: 'common',
} as const
