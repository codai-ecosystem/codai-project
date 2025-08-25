/**
 * @fileoverview Cultural Hooks
 * @description React hooks for cultural adaptation
 */

import { useMemo } from 'react';
import { useI18n } from '../components/I18nProvider';
import { getCulturalPreferences, CulturalPreferences } from './cultural-config';
import { createCulturalFormatter, CulturalFormatter } from './cultural-formatters';

/**
 * Hook to get cultural preferences for current locale
 */
export const useCulturalPreferences = (): CulturalPreferences => {
  const { currentLocale } = useI18n();
  
  return useMemo(() => {
    return getCulturalPreferences(currentLocale.code);
  }, [currentLocale.code]);
};

/**
 * Hook to get cultural formatter for current locale
 */
export const useCulturalFormatter = (): CulturalFormatter => {
  const { currentLocale } = useI18n();
  
  return useMemo(() => {
    return createCulturalFormatter(currentLocale.code);
  }, [currentLocale.code]);
};

/**
 * Hook for cultural number formatting
 */
export const useCulturalNumber = () => {
  const formatter = useCulturalFormatter();
  
  const formatNumber = (
    value: number,
    options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      useGrouping?: boolean;
    }
  ) => formatter.formatNumber(value, options);
  
  const formatCurrency = (
    amount: number,
    currency?: string,
    options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    }
  ) => formatter.formatCurrency(amount, currency, options);
  
  const formatPercentage = (
    value: number,
    options?: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    }
  ) => formatter.formatPercentage(value, options);
  
  return {
    formatNumber,
    formatCurrency,
    formatPercentage
  };
};

/**
 * Hook for cultural date and time formatting
 */
export const useCulturalDateTime = () => {
  const formatter = useCulturalFormatter();
  
  const formatDate = (
    date: Date | string | number,
    options?: {
      dateStyle?: 'full' | 'long' | 'medium' | 'short';
      timeStyle?: 'full' | 'long' | 'medium' | 'short';
      includeTime?: boolean;
      calendar?: string;
    }
  ) => formatter.formatDate(date, options);
  
  const formatTime = (
    time: Date | string | number,
    options?: {
      includeSeconds?: boolean;
      timeStyle?: 'full' | 'long' | 'medium' | 'short';
    }
  ) => formatter.formatTime(time, options);
  
  const formatRelativeTime = (date: Date | string | number) => 
    formatter.formatRelativeTime(date);
  
  return {
    formatDate,
    formatTime,
    formatRelativeTime
  };
};

/**
 * Hook for cultural text formatting
 */
export const useCulturalText = () => {
  const formatter = useCulturalFormatter();
  
  const formatPhone = (phoneNumber: string) => 
    formatter.formatPhoneNumber(phoneNumber);
  
  const formatName = (firstName: string, lastName: string, honorific?: string) => 
    formatter.formatName(firstName, lastName, honorific);
  
  const formatAddress = (address: {
    street?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
  }) => formatter.formatAddress(address);
  
  const getHonorifics = () => formatter.getHonorifics();
  
  return {
    formatPhone,
    formatName,
    formatAddress,
    getHonorifics
  };
};

/**
 * Hook for cultural calendar utilities
 */
export const useCulturalCalendar = () => {
  const formatter = useCulturalFormatter();
  const preferences = useCulturalPreferences();
  
  const getWeekendDays = () => formatter.getWeekendDays();
  const isWeekend = (dayOfWeek: number) => formatter.isWeekend(dayOfWeek);
  const getWeekStart = () => formatter.getWeekStart();
  
  const getMonthNames = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2024, i, 1);
      months.push(formatter.formatDate(date, { month: 'long' }));
    }
    return months;
  };
  
  const getDayNames = (format: 'long' | 'short' | 'narrow' = 'long') => {
    const days = [];
    const baseDate = new Date(2024, 0, preferences.weekStart);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      days.push(formatter.formatDate(date, { weekday: format }));
    }
    
    return days;
  };
  
  return {
    getWeekendDays,
    isWeekend,
    getWeekStart,
    getMonthNames,
    getDayNames,
    calendarType: preferences.calendar.type,
    weekendDays: preferences.calendar.weekendDays
  };
};

/**
 * Hook for cultural color preferences
 */
export const useCulturalColors = () => {
  const preferences = useCulturalPreferences();
  
  return {
    colors: preferences.colors,
    primary: preferences.colors.primary,
    secondary: preferences.colors.secondary,
    danger: preferences.colors.danger,
    warning: preferences.colors.warning,
    success: preferences.colors.success
  };
};

/**
 * Hook for cultural typography preferences
 */
export const useCulturalTypography = () => {
  const preferences = useCulturalPreferences();
  
  const getTypographyStyles = () => ({
    fontFamily: preferences.typography.fontFamily,
    fontSize: preferences.typography.fontSize.base,
    lineHeight: preferences.typography.lineHeight.base
  });
  
  const getLargeTypographyStyles = () => ({
    fontFamily: preferences.typography.fontFamily,
    fontSize: preferences.typography.fontSize.large,
    lineHeight: preferences.typography.lineHeight.large
  });
  
  return {
    ...preferences.typography,
    getTypographyStyles,
    getLargeTypographyStyles
  };
};

/**
 * Hook for cultural icons preferences
 */
export const useCulturalIcons = () => {
  const preferences = useCulturalPreferences();
  
  const shouldFlipIcon = () => preferences.icons.direction === 'rtl';
  
  const getIconStyle = (shouldFlip: boolean = true) => {
    if (!shouldFlip || preferences.icons.direction !== 'rtl') {
      return {};
    }
    
    return {
      transform: 'scaleX(-1)'
    };
  };
  
  return {
    ...preferences.icons,
    shouldFlipIcon,
    getIconStyle
  };
};

/**
 * Hook for creating cultural CSS variables
 */
export const useCulturalCSSVariables = () => {
  const preferences = useCulturalPreferences();
  
  const cssVariables = useMemo(() => ({
    '--cultural-primary-color': preferences.colors.primary,
    '--cultural-secondary-color': preferences.colors.secondary,
    '--cultural-danger-color': preferences.colors.danger,
    '--cultural-warning-color': preferences.colors.warning,
    '--cultural-success-color': preferences.colors.success,
    '--cultural-font-family': preferences.typography.fontFamily,
    '--cultural-font-size-base': preferences.typography.fontSize.base,
    '--cultural-font-size-large': preferences.typography.fontSize.large,
    '--cultural-line-height-base': preferences.typography.lineHeight.base,
    '--cultural-line-height-large': preferences.typography.lineHeight.large,
    '--cultural-direction': preferences.icons.direction || 'ltr'
  }), [preferences]);
  
  return cssVariables;
};

/**
 * Hook for cultural validation patterns
 */
export const useCulturalValidation = () => {
  const preferences = useCulturalPreferences();
  
  const getPhonePattern = () => {
    // Convert format to regex pattern
    const pattern = preferences.phoneFormat
      .replace(/+/g, '\\+')
      .replace(/#/g, '\\d')
      .replace(/s/g, '\\s?')
      .replace(/(/g, '\\(')
      .replace(/)/g, '\\)')
      .replace(/-/g, '-?');
    
    return new RegExp(`^${pattern}$`);
  };
  
  const validatePhone = (phone: string): boolean => {
    const pattern = getPhonePattern();
    return pattern.test(phone);
  };
  
  const getDatePattern = () => {
    switch (preferences.dateFormat) {
      case 'mdy':
        return /^(0?[1-9]|1[0-2])\/([0-2]?[0-9]|3[0-1])\/(19|20)\d{2}$/;
      case 'dmy':
        return /^([0-2]?[0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/(19|20)\d{2}$/;
      case 'ymd':
        return /^(19|20)\d{2}\/(0?[1-9]|1[0-2])\/([0-2]?[0-9]|3[0-1])$/;
      default:
        return /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    }
  };
  
  const validateDate = (date: string): boolean => {
    const pattern = getDatePattern();
    return pattern.test(date);
  };
  
  return {
    getPhonePattern,
    validatePhone,
    getDatePattern,
    validateDate,
    phoneFormat: preferences.phoneFormat,
    dateFormat: preferences.dateFormat
  };
};

/**
 * Hook for cultural form utilities
 */
export const useCulturalForm = () => {
  const validation = useCulturalValidation();
  const formatter = useCulturalFormatter();
  
  const formatFormValue = (field: string, value: any) => {
    switch (field) {
      case 'phone':
        return formatter.formatPhoneNumber(value);
      case 'date':
        return formatter.formatDate(value);
      case 'currency':
        return formatter.formatCurrency(value);
      case 'number':
        return formatter.formatNumber(value);
      default:
        return value;
    }
  };
  
  const validateFormField = (field: string, value: any): boolean => {
    switch (field) {
      case 'phone':
        return validation.validatePhone(value);
      case 'date':
        return validation.validateDate(value);
      default:
        return true;
    }
  };
  
  return {
    formatFormValue,
    validateFormField,
    ...validation
  };
};

export default {
  useCulturalPreferences,
  useCulturalFormatter,
  useCulturalNumber,
  useCulturalDateTime,
  useCulturalText,
  useCulturalCalendar,
  useCulturalColors,
  useCulturalTypography,
  useCulturalIcons,
  useCulturalCSSVariables,
  useCulturalValidation,
  useCulturalForm
};