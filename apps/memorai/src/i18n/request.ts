/**
 * @fileoverview Next-Intl Request Configuration for MemorAI
 * @description Request-specific configuration for internationalization
 */

import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Supported locales
export const locales = ['en', 'ro'] as const;

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});