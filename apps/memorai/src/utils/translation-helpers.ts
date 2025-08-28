/**
 * @fileoverview Translation Helpers
 * @description Utility functions for translation management
 */

import { TFunction } from 'i18next';
import { SUPPORTED_LOCALES } from '../../../../i18n/shared-config';

export interface TranslationParams {
  [key: string]: string | number | Date;
}

export interface PluralOptions {
  count: number;
  [key: string]: any;
}

/**
 * Safe translation function with fallback
 */
export const safeTranslate = (
  t: TFunction,
  key: string,
  fallback?: string,
  params?: TranslationParams
): string => {
  try {
    const translation = t(key, params);
    
    // If translation equals the key, it might be missing
    if (translation === key) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation for key: ${key}`);
      }
      return fallback || key.split('.').pop() || key;
    }
    
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return fallback || key;
  }
};

/**
 * Translate with HTML content support
 */
export const translateHTML = (
  t: TFunction,
  key: string,
  params?: TranslationParams
): string => {
  return t(key, {
    ...params,
    interpolation: { escapeValue: false }
  });
};

/**
 * Translate with plural support
 */
export const translatePlural = (
  t: TFunction,
  key: string,
  count: number,
  params?: TranslationParams
): string => {
  return t(key, {
    count,
    ...params
  });
};

/**
 * Get all available translations for a namespace
 */
export const getNamespaceTranslations = (
  t: TFunction,
  namespace: string,
  locale?: string
): Record<string, string> => {
  try {
    const translations = t('', { returnObjects: true, ns: namespace, lng: locale });
    return translations as Record<string, string>;
  } catch (error) {
    console.error('Error getting namespace translations:', error);
    return {};
  }
};

/**
 * Check if a translation key exists
 */
export const hasTranslation = (
  t: TFunction,
  key: string,
  namespace?: string
): boolean => {
  try {
    const translation = t(key, { ns: namespace });
    return translation !== key;
  } catch {
    return false;
  }
};

/**
 * Get missing translation keys for a namespace
 */
export const getMissingKeys = (
  t: TFunction,
  keys: string[],
  namespace?: string
): string[] => {
  return keys.filter(key => !hasTranslation(t, key, namespace));
};

/**
 * Translation key generator for forms
 */
export const getFormTranslationKeys = (formName: string): {
  title: string;
  subtitle: string;
  submit: string;
  cancel: string;
  reset: string;
  field: (fieldName: string) => {
    label: string;
    placeholder: string;
    error: string;
    help: string;
  };
} => ({
  title: `forms.${formName}.title`,
  subtitle: `forms.${formName}.subtitle`,
  submit: `forms.${formName}.submit`,
  cancel: `forms.${formName}.cancel`,
  reset: `forms.${formName}.reset`,
  field: (fieldName: string) => ({
    label: `forms.${formName}.fields.${fieldName}.label`,
    placeholder: `forms.${formName}.fields.${fieldName}.placeholder`,
    error: `forms.${formName}.fields.${fieldName}.error`,
    help: `forms.${formName}.fields.${fieldName}.help`
  })
});

/**
 * Translation key generator for dashboard
 */
export const getDashboardTranslationKeys = (sectionName: string) => ({
  title: `dashboard.${sectionName}.title`,
  description: `dashboard.${sectionName}.description`,
  action: `dashboard.${sectionName}.action`,
  empty: `dashboard.${sectionName}.empty`,
  loading: `dashboard.${sectionName}.loading`,
  error: `dashboard.${sectionName}.error`
});

/**
 * Translation key generator for navigation
 */
export const getNavigationTranslationKeys = () => ({
  home: 'navigation.home',
  dashboard: 'navigation.dashboard',
  settings: 'navigation.settings',
  profile: 'navigation.profile',
  logout: 'navigation.logout',
  menu: 'navigation.menu',
  search: 'navigation.search'
});

/**
 * Error translation helper
 */
export const translateError = (
  t: TFunction,
  errorCode: string,
  fallbackMessage?: string
): string => {
  const key = `errors.${errorCode}`;
  const translation = t(key);
  
  if (translation === key) {
    return fallbackMessage || `Error: ${errorCode}`;
  }
  
  return translation;
};

/**
 * Success message translation helper
 */
export const translateSuccess = (
  t: TFunction,
  actionKey: string,
  params?: TranslationParams
): string => {
  return t(`success.${actionKey}`, params);
};

/**
 * Validation message translation helper
 */
export const translateValidation = (
  t: TFunction,
  validationType: string,
  fieldName: string,
  params?: TranslationParams
): string => {
  return t(`validation.${validationType}`, {
    field: t(`fields.${fieldName}`),
    ...params
  });
};

/**
 * Format currency with locale support
 */
export const formatCurrencyWithLocale = (
  amount: number,
  locale: string,
  currency?: string
): string => {
  const localeConfig = (SUPPORTED_LOCALES as any)[locale];
  if (!localeConfig) {
    return amount.toString();
  }

  return new Intl.NumberFormat(localeConfig.numberFormat, {
    style: 'currency',
    currency: currency || localeConfig.currency
  }).format(amount);
};

/**
 * Format date with locale support
 */
export const formatDateWithLocale = (
  date: Date | string | number,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const localeConfig = (SUPPORTED_LOCALES as any)[locale];
  if (!localeConfig) {
    return new Date(date).toLocaleDateString();
  }

  return new Intl.DateTimeFormat(localeConfig.numberFormat, options).format(new Date(date));
};

/**
 * Translation interpolation helper for complex templates
 */
export const interpolateTranslation = (
  template: string,
  params: Record<string, any>
): string => {
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    const value = params[key.trim()];
    return value !== undefined ? String(value) : match;
  });
};

/**
 * Lazy load translation namespace
 */
export const loadTranslationNamespace = async (
  namespace: string,
  locale: string
): Promise<Record<string, any> | null> => {
  try {
    const response = await fetch(`/locales/${locale}/${namespace}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${namespace} for ${locale}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading translation namespace:', error);
    return null;
  }
};

/**
 * Translation completeness checker
 */
export const checkTranslationCompleteness = (
  baseTranslations: Record<string, any>,
  targetTranslations: Record<string, any>
): {
  missing: string[];
  extra: string[];
  completeness: number;
} => {
  const baseKeys = flattenKeys(baseTranslations);
  const targetKeys = flattenKeys(targetTranslations);
  
  const missing = baseKeys.filter(key => !targetKeys.includes(key));
  const extra = targetKeys.filter(key => !baseKeys.includes(key));
  
  const completeness = baseKeys.length > 0 
    ? ((baseKeys.length - missing.length) / baseKeys.length) * 100 
    : 100;

  return { missing, extra, completeness };
};

/**
 * Flatten nested object keys
 */
function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}