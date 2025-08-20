/**
 * Translation Provider Component
 * Provides comprehensive i18n functionality for the CODAI ecosystem
 * Supports English/Romanian with extensible architecture
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export type Locale = 'en' | 'ro'

export interface TranslationContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string, params?: Record<string, string | number>) => string
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string
    formatCurrency: (amount: number, currency?: string) => string
    isRTL: boolean
    direction: 'ltr' | 'rtl'
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
    children: ReactNode
    defaultLocale?: Locale
    translations: Record<Locale, Record<string, any>>
    enableSystemDetection?: boolean
    enablePersistence?: boolean
}

export function TranslationProvider({
    children,
    defaultLocale = 'en',
    translations,
    enableSystemDetection = true,
    enablePersistence = true
}: TranslationProviderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [locale, setLocaleState] = useState<Locale>(defaultLocale)

    // Initialize locale from various sources
    useEffect(() => {
        let initialLocale = defaultLocale

        // 1. Check URL path for locale
        const pathLocale = pathname.split('/')[1] as Locale
        if (pathLocale && ['en', 'ro'].includes(pathLocale)) {
            initialLocale = pathLocale
        }
        // 2. Check localStorage if persistence enabled
        else if (enablePersistence && typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('codai-locale') as Locale
            if (savedLocale && ['en', 'ro'].includes(savedLocale)) {
                initialLocale = savedLocale
            }
        }
        // 3. Check system language if detection enabled
        else if (enableSystemDetection && typeof window !== 'undefined') {
            const systemLang = navigator.language.toLowerCase()
            if (systemLang.startsWith('ro')) {
                initialLocale = 'ro'
            }
        }

        setLocaleState(initialLocale)
    }, [pathname, defaultLocale, enableSystemDetection, enablePersistence])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)

        // Persist to localStorage
        if (enablePersistence && typeof window !== 'undefined') {
            localStorage.setItem('codai-locale', newLocale)
        }

        // Update URL if needed
        const currentPathLocale = pathname.split('/')[1]
        if (['en', 'ro'].includes(currentPathLocale)) {
            const newPath = pathname.replace(`/${currentPathLocale}`, `/${newLocale}`)
            router.push(newPath)
        } else {
            router.push(`/${newLocale}${pathname}`)
        }
    }

    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.')
        let value: any = translations[locale]

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k]
            } else {
                // Fallback to English if key not found in current locale
                value = translations.en
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object') {
                        value = value[fallbackKey]
                    } else {
                        value = undefined
                        break
                    }
                }
                break
            }
        }

        if (typeof value !== 'string') {
            console.warn(`Translation key "${key}" not found for locale "${locale}"`)
            return key // Return key as fallback
        }

        // Replace parameters in translation
        if (params) {
            return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
                return params[param]?.toString() || match
            })
        }

        return value
    }

    const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
        return new Intl.DateTimeFormat(locale === 'ro' ? 'ro-RO' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        }).format(date)
    }

    const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
        return new Intl.NumberFormat(locale === 'ro' ? 'ro-RO' : 'en-US', options).format(number)
    }

    const formatCurrency = (amount: number, currency = 'EUR'): string => {
        return new Intl.NumberFormat(locale === 'ro' ? 'ro-RO' : 'en-US', {
            style: 'currency',
            currency
        }).format(amount)
    }

    const isRTL = false // Romanian is LTR like English
    const direction = 'ltr'

    const value: TranslationContextType = {
        locale,
        setLocale,
        t,
        formatDate,
        formatNumber,
        formatCurrency,
        isRTL,
        direction
    }

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(TranslationContext)
    if (context === undefined) {
        throw new Error('useTranslation must be used within a TranslationProvider')
    }
    return context
}

// Language Selector Component
interface LanguageSelectorProps {
    className?: string
    showLabel?: boolean
}

export function LanguageSelector({ className, showLabel = false }: LanguageSelectorProps) {
    const { locale, setLocale, t } = useTranslation()

    const languages = [
        { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
        { code: 'ro' as Locale, name: 'Română', flag: '🇷🇴' }
    ]

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showLabel && <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.language')}</span>}
            <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

// Translation key validation helper
export function validateTranslationKeys(
    translations: Record<Locale, Record<string, any>>,
    requiredKeys: string[]
): { valid: boolean; missingKeys: Record<Locale, string[]> } {
    const missingKeys: Record<Locale, string[]> = { en: [], ro: [] }

    for (const locale of ['en', 'ro'] as Locale[]) {
        for (const key of requiredKeys) {
            const keys = key.split('.')
            let value: any = translations[locale]

            for (const k of keys) {
                if (value && typeof value === 'object') {
                    value = value[k]
                } else {
                    value = undefined
                    break
                }
            }

            if (value === undefined) {
                missingKeys[locale].push(key)
            }
        }
    }

    const valid = missingKeys.en.length === 0 && missingKeys.ro.length === 0

    return { valid, missingKeys }
}
