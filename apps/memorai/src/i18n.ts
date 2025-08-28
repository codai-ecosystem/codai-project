/**
 * @fileoverview Next-Intl Configuration for MemorAI
 * @description Modern internationalization setup for Next.js 15 with App Router
 */

import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Supported locales configuration
export const locales = ['en', 'ro'] as const;
export type Locale = typeof locales[number];

// Locale-specific configuration
export const localeConfig = {
  en: {
    name: 'English',
    dir: 'ltr',
    currency: 'USD',
    numberFormat: 'en-US',
    dateFormat: 'MM/dd/yyyy',
    timeZone: 'America/New_York',
  },
  ro: {
    name: 'Română',
    dir: 'ltr',
    currency: 'RON',
    numberFormat: 'ro-RO',
    dateFormat: 'dd.MM.yyyy',
    timeZone: 'Europe/Bucharest',
  },
} as const;

// Default locale
export const defaultLocale: Locale = 'en';

// Utility functions
export function getCurrentLocale(): Locale {
  // This would typically get the current locale from context or cookies
  return 'en'; // Default fallback
}

export function isRTL(locale?: Locale): boolean {
  // Currently all locales are LTR, return false
  return false;
}

// Next-intl request configuration
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  } as any; // Type assertion to work around next-intl type issues
});

// Utility functions for client-side usage
export const getLocaleConfig = (locale: Locale) => localeConfig[locale];

export const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};

export const getDefaultLocale = () => defaultLocale;