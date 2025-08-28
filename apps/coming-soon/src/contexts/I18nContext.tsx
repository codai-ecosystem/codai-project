'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'

interface I18nContextType {
  t: ReturnType<typeof useTranslation>['t']
  i18n: typeof i18n
  ready: boolean
  language: string
  changeLanguage: (lng: string) => Promise<void>
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <I18nContextProvider>{children}</I18nContextProvider>
    </I18nextProvider>
  )
}

function I18nContextProvider({ children }: I18nProviderProps) {
  const { t, i18n: i18nInstance, ready } = useTranslation()

  const changeLanguage = async (lng: string) => {
    await i18nInstance.changeLanguage(lng)
  }

  const value: I18nContextType = {
    t,
    i18n: i18nInstance,
    ready,
    language: i18nInstance.language,
    changeLanguage,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export default I18nProvider