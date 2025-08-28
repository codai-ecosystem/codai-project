/**
 * @fileoverview Cultural Hooks
 * @description React hooks for cultural adaptation
 */

import { useMemo } from 'react';
import { useI18n } from '../lib/i18n';

/**
 * Hook to get cultural preferences for current locale
 */
export const useCulturalPreferences = () => {
  const { currentLocale } = useI18n();
  
  return useMemo(() => {
    // Default cultural preferences
    return {
      weekStart: 1, // Monday
      weekend: [0, 6], // Saturday, Sunday
      dateFormat: currentLocale === 'ro' ? 'DD/MM/YYYY' : 'MM/DD/YYYY',
      timeFormat: '24h',
      currency: currentLocale === 'ro' ? 'RON' : 'USD'
    };
  }, [currentLocale]);
};

/**
 * Hook to get cultural formatter for current locale
 */
export const useCulturalFormatter = () => {
  const { currentLocale } = useI18n();
  
  return useMemo(() => {
    // Default cultural formatter
    return {
      formatDate: (date: Date, options: Intl.DateTimeFormatOptions) => {
        return new Intl.DateTimeFormat(currentLocale, options).format(date);
      },
      formatNumber: (number: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(currentLocale, options).format(number);
      },
      formatCurrency: (amount: number, currency?: string) => {
        return new Intl.NumberFormat(currentLocale, { 
          style: 'currency', 
          currency: currency || (currentLocale === 'ro' ? 'RON' : 'USD')
        }).format(amount);
      }
    };
  }, [currentLocale]);
};

/**
 * Hook for cultural calendar utilities
 */
export const useCulturalCalendar = () => {
  const formatter = useCulturalFormatter();
  const preferences = useCulturalPreferences();
  const { currentLocale } = useI18n();
  
  const getWeekendDays = () => [0, 6]; // Default: Saturday, Sunday
  const isWeekend = (dayOfWeek: number) => [0, 6].includes(dayOfWeek);
  const getWeekStart = () => 1; // Default: Monday
  
  const getMonthNames = () => {
    const months = [];
    const intlFormatter = new Intl.DateTimeFormat(currentLocale, { month: 'long' });
    for (let i = 0; i < 12; i++) {
      const date = new Date(2024, i, 1);
      months.push(intlFormatter.format(date));
    }
    return months;
  };
  
  const getDayNames = (format: 'short' | 'long' = 'long') => {
    const days = [];
    const intlFormatter = new Intl.DateTimeFormat(currentLocale, { weekday: format });
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(2024, 0, 1 + i); // Start from January 1, 2024 (Monday)
      days.push(intlFormatter.format(date));
    }
    
    return days;
  };
  
  return {
    getWeekendDays,
    isWeekend,
    getWeekStart,
    getMonthNames,
    getDayNames
  };
};
