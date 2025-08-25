/**
 * @fileoverview Cultural Formatters
 * @description Locale-aware formatting utilities for different cultural contexts
 */

import { getCulturalPreferences, CulturalPreferences } from './cultural-config';

export class CulturalFormatter {
  private preferences: CulturalPreferences;
  private locale: string;

  constructor(locale: string) {
    this.locale = locale;
    this.preferences = getCulturalPreferences(locale);
  }

  /**
   * Format number according to cultural preferences
   */
  formatNumber(
    number: number, 
    options: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      useGrouping?: boolean;
    } = {}
  ): string {
    try {
      const formatter = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: options.minimumFractionDigits || 0,
        maximumFractionDigits: options.maximumFractionDigits || 2,
        useGrouping: options.useGrouping !== false
      });
      
      return formatter.format(number);
    } catch (error) {
      // Fallback formatting
      return this.fallbackNumberFormat(number, options);
    }
  }

  /**
   * Format currency according to cultural preferences
   */
  formatCurrency(
    amount: number,
    currency?: string,
    options: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    } = {}
  ): string {
    const currencyCode = currency || this.preferences.currency;
    
    try {
      const formatter = new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: options.minimumFractionDigits || 2,
        maximumFractionDigits: options.maximumFractionDigits || 2
      });
      
      return formatter.format(amount);
    } catch (error) {
      // Fallback formatting
      return this.fallbackCurrencyFormat(amount, currencyCode);
    }
  }

  /**
   * Format date according to cultural preferences
   */
  formatDate(
    date: Date | string | number,
    options: {
      dateStyle?: 'full' | 'long' | 'medium' | 'short';
      timeStyle?: 'full' | 'long' | 'medium' | 'short';
      includeTime?: boolean;
      calendar?: string;
    } = {}
  ): string {
    const dateObj = new Date(date);
    
    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        calendar: options.calendar || this.preferences.calendar.type
      };

      if (options.dateStyle) {
        formatOptions.dateStyle = options.dateStyle;
      } else {
        // Use cultural date format preference
        switch (this.preferences.dateFormat) {
          case 'mdy':
            formatOptions.month = 'short';
            formatOptions.day = 'numeric';
            formatOptions.year = 'numeric';
            break;
          case 'dmy':
            formatOptions.day = 'numeric';
            formatOptions.month = 'short';
            formatOptions.year = 'numeric';
            break;
          case 'ymd':
            formatOptions.year = 'numeric';
            formatOptions.month = 'short';
            formatOptions.day = 'numeric';
            break;
        }
      }

      if (options.includeTime || options.timeStyle) {
        if (options.timeStyle) {
          formatOptions.timeStyle = options.timeStyle;
        } else {
          formatOptions.hour = '2-digit';
          formatOptions.minute = '2-digit';
          formatOptions.hour12 = this.preferences.timeFormat === '12';
        }
      }

      if (this.preferences.calendar.era) {
        formatOptions.era = 'short';
      }

      const formatter = new Intl.DateTimeFormat(this.locale, formatOptions);
      return formatter.format(dateObj);
    } catch (error) {
      return this.fallbackDateFormat(dateObj, options);
    }
  }

  /**
   * Format time according to cultural preferences
   */
  formatTime(
    time: Date | string | number,
    options: {
      includeSeconds?: boolean;
      timeStyle?: 'full' | 'long' | 'medium' | 'short';
    } = {}
  ): string {
    const dateObj = new Date(time);
    
    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: this.preferences.timeFormat === '12'
      };

      if (options.includeSeconds) {
        formatOptions.second = '2-digit';
      }

      if (options.timeStyle) {
        formatOptions.timeStyle = options.timeStyle;
      }

      const formatter = new Intl.DateTimeFormat(this.locale, formatOptions);
      return formatter.format(dateObj);
    } catch (error) {
      return this.fallbackTimeFormat(dateObj, options);
    }
  }

  /**
   * Format relative time (e.g., "2 days ago")
   */
  formatRelativeTime(date: Date | string | number): string {
    const dateObj = new Date(date);
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    
    try {
      const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });
      
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      if (Math.abs(diffYears) >= 1) {
        return rtf.format(diffYears, 'year');
      } else if (Math.abs(diffMonths) >= 1) {
        return rtf.format(diffMonths, 'month');
      } else if (Math.abs(diffWeeks) >= 1) {
        return rtf.format(diffWeeks, 'week');
      } else if (Math.abs(diffDays) >= 1) {
        return rtf.format(diffDays, 'day');
      } else if (Math.abs(diffHours) >= 1) {
        return rtf.format(diffHours, 'hour');
      } else if (Math.abs(diffMinutes) >= 1) {
        return rtf.format(diffMinutes, 'minute');
      } else {
        return rtf.format(diffSeconds, 'second');
      }
    } catch (error) {
      return this.fallbackRelativeTimeFormat(dateObj);
    }
  }

  /**
   * Format percentage according to cultural preferences
   */
  formatPercentage(
    number: number,
    options: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    } = {}
  ): string {
    try {
      const formatter = new Intl.NumberFormat(this.locale, {
        style: 'percent',
        minimumFractionDigits: options.minimumFractionDigits || 0,
        maximumFractionDigits: options.maximumFractionDigits || 1
      });
      
      return formatter.format(number);
    } catch (error) {
      return `${(number * 100).toFixed(1)}%`;
    }
  }

  /**
   * Format phone number according to cultural preferences
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/D/g, '');
    const format = this.preferences.phoneFormat;
    
    let formatted = format;
    let digitIndex = 0;
    
    for (let i = 0; i < format.length; i++) {
      if (format[i] === '#') {
        if (digitIndex < cleaned.length) {
          formatted = formatted.replace('#', cleaned[digitIndex]);
          digitIndex++;
        } else {
          formatted = formatted.replace('#', '');
        }
      }
    }
    
    return formatted.trim();
  }

  /**
   * Format name according to cultural preferences
   */
  formatName(firstName: string, lastName: string, honorific?: string): string {
    const parts: string[] = [];
    
    if (honorific) {
      parts.push(honorific);
    }
    
    if (this.preferences.nameOrder === 'first-last') {
      parts.push(firstName, lastName);
    } else {
      parts.push(lastName, firstName);
    }
    
    return parts.filter(Boolean).join(' ');
  }

  /**
   * Format address according to cultural preferences
   */
  formatAddress(address: {
    street?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
  }): string {
    const parts: string[] = [];
    
    for (const field of this.preferences.addressFormat) {
      if (address[field as keyof typeof address]) {
        parts.push(address[field as keyof typeof address]!);
      }
    }
    
    return parts.join(', ');
  }

  /**
   * Get available honorifics for the culture
   */
  getHonorifics(): string[] {
    return [...this.preferences.honorifics];
  }

  /**
   * Get weekend days for the culture
   */
  getWeekendDays(): number[] {
    return [...this.preferences.calendar.weekendDays];
  }

  /**
   * Check if a day is weekend
   */
  isWeekend(dayOfWeek: number): boolean {
    return this.preferences.calendar.weekendDays.includes(dayOfWeek);
  }

  /**
   * Get week start day
   */
  getWeekStart(): number {
    return this.preferences.weekStart;
  }

  /**
   * Fallback number formatting
   */
  private fallbackNumberFormat(
    number: number, 
    options: { minimumFractionDigits?: number; maximumFractionDigits?: number; useGrouping?: boolean }
  ): string {
    const decimals = options.maximumFractionDigits || 2;
    let formatted = number.toFixed(decimals);
    
    if (options.useGrouping !== false) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/(d)(?=(d{3})+(?!d))/g, `$1${this.preferences.thousandsSeparator}`);
      formatted = parts.join(this.preferences.decimalSeparator);
    } else if (this.preferences.decimalSeparator !== '.') {
      formatted = formatted.replace('.', this.preferences.decimalSeparator);
    }
    
    return formatted;
  }

  /**
   * Fallback currency formatting
   */
  private fallbackCurrencyFormat(amount: number, currency: string): string {
    const formatted = this.fallbackNumberFormat(amount, { maximumFractionDigits: 2 });
    const symbol = this.preferences.currencySymbol;
    
    return this.preferences.currencyPosition === 'before' 
      ? `${symbol}${formatted}`
      : `${formatted} ${symbol}`;
  }

  /**
   * Fallback date formatting
   */
  private fallbackDateFormat(date: Date, options: any): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    switch (this.preferences.dateFormat) {
      case 'mdy':
        return `${pad(month)}/${pad(day)}/${year}`;
      case 'dmy':
        return `${pad(day)}/${pad(month)}/${year}`;
      case 'ymd':
        return `${year}/${pad(month)}/${pad(day)}`;
      default:
        return date.toLocaleDateString();
    }
  }

  /**
   * Fallback time formatting
   */
  private fallbackTimeFormat(time: Date, options: any): string {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    if (this.preferences.timeFormat === '12') {
      const displayHours = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const timeStr = options.includeSeconds 
        ? `${displayHours}:${pad(minutes)}:${pad(seconds)} ${ampm}`
        : `${displayHours}:${pad(minutes)} ${ampm}`;
      return timeStr;
    } else {
      const timeStr = options.includeSeconds
        ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(hours)}:${pad(minutes)}`;
      return timeStr;
    }
  }

  /**
   * Fallback relative time formatting
   */
  private fallbackRelativeTimeFormat(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  }
}

/**
 * Create a cultural formatter for a locale
 */
export const createCulturalFormatter = (locale: string): CulturalFormatter => {
  return new CulturalFormatter(locale);
};

/**
 * Quick formatting functions
 */
export const formatters = {
  number: (value: number, locale: string, options?: any) => 
    new CulturalFormatter(locale).formatNumber(value, options),
    
  currency: (value: number, locale: string, currency?: string, options?: any) => 
    new CulturalFormatter(locale).formatCurrency(value, currency, options),
    
  date: (value: Date | string | number, locale: string, options?: any) => 
    new CulturalFormatter(locale).formatDate(value, options),
    
  time: (value: Date | string | number, locale: string, options?: any) => 
    new CulturalFormatter(locale).formatTime(value, options),
    
  relativeTime: (value: Date | string | number, locale: string) => 
    new CulturalFormatter(locale).formatRelativeTime(value),
    
  percentage: (value: number, locale: string, options?: any) => 
    new CulturalFormatter(locale).formatPercentage(value, options),
    
  phone: (value: string, locale: string) => 
    new CulturalFormatter(locale).formatPhoneNumber(value),
    
  name: (firstName: string, lastName: string, locale: string, honorific?: string) => 
    new CulturalFormatter(locale).formatName(firstName, lastName, honorific),
    
  address: (address: any, locale: string) => 
    new CulturalFormatter(locale).formatAddress(address)
};

export default CulturalFormatter;