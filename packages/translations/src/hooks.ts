import { useTranslation as useI18nTranslation, UseTranslationOptions } from 'react-i18next'
import { defaultNS, type SupportedLanguage } from './i18n'

export function useTranslation(ns?: string | string[], options?: UseTranslationOptions<any>) {
  return useI18nTranslation(ns || defaultNS, options)
}

export function useLanguage() {
  const { i18n } = useTranslation()

  const changeLanguage = (language: SupportedLanguage) => {
    i18n.changeLanguage(language)
  }

  const currentLanguage = i18n.language as SupportedLanguage

  return {
    currentLanguage,
    changeLanguage,
    isRTL: false, // Neither English nor Romanian are RTL
  }
}

export function useI18n() {
  const { i18n } = useTranslation()
  return i18n
}

// Translation key type helpers
export type TranslationKey =
  | 'common.welcome'
  | 'common.getStarted'
  | 'common.signIn'
  | 'common.signOut'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'navigation.home'
  | 'navigation.dashboard'
  | 'navigation.apps'
  | 'auth.email'
  | 'auth.password'
  | 'auth.signIn'
  | 'auth.signUp'
  | 'errors.general'
  | 'errors.network'
  | 'success.saved'
  | 'validation.required'
  | 'validation.email'
// Add more as needed

// Typed translation function
export function t(key: TranslationKey, options?: any): string {
  const { t: translate } = useI18nTranslation()
  return translate(key, options) as string
}
