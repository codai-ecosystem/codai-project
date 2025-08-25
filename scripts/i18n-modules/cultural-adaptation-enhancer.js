/**
 * @fileoverview Cultural Adaptation Enhancer
 * @description Enhances applications with cultural adaptations for different locales
 */

import fs from 'fs';
import path from 'path';

export default function enhanceCulturalAdaptation(dirs, appName) {
    createCulturalConfig(dirs.utilsDir, appName);
    createCulturalFormatters(dirs.utilsDir, appName);
    createCulturalComponents(dirs.componentsDir, appName);
    createCulturalHooks(dirs.utilsDir, appName);
    console.log(`🌍 Cultural adaptation enhanced for ${appName}`);
}

function createCulturalConfig(utilsDir, appName) {
    const culturalConfigContent = `/**
 * @fileoverview Cultural Configuration
 * @description Cultural preferences and adaptations for different locales
 */

export interface CulturalPreferences {
  dateFormat: 'mdy' | 'dmy' | 'ymd';
  timeFormat: '12' | '24';
  weekStart: 0 | 1 | 6; // 0 = Sunday, 1 = Monday, 6 = Saturday
  currency: string;
  currencyPosition: 'before' | 'after';
  currencySymbol: string;
  decimalSeparator: '.' | ',';
  thousandsSeparator: ',' | '.' | ' ' | '';
  numberGrouping: number[];
  phoneFormat: string;
  addressFormat: string[];
  nameOrder: 'first-last' | 'last-first';
  honorifics: string[];
  colors: {
    primary: string;
    secondary: string;
    danger: string;
    warning: string;
    success: string;
  };
  icons: {
    direction?: 'rtl' | 'ltr';
    style?: 'outline' | 'solid' | 'cultural';
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      large: string;
    };
    lineHeight: {
      base: string;
      large: string;
    };
  };
  calendar: {
    type: 'gregorian' | 'islamic' | 'hebrew' | 'persian' | 'buddhist' | 'chinese';
    era?: boolean;
    weekendDays: number[];
  };
}

export const CULTURAL_PREFERENCES: Record<string, CulturalPreferences> = {
  en: {
    dateFormat: 'mdy',
    timeFormat: '12',
    weekStart: 0,
    currency: 'USD',
    currencyPosition: 'before',
    currencySymbol: '$',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [3],
    phoneFormat: '+1 (###) ###-####',
    addressFormat: ['street', 'city', 'state', 'zipcode', 'country'],
    nameOrder: 'first-last',
    honorifics: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'],
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },
  
  es: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 1,
    currency: 'EUR',
    currencyPosition: 'after',
    currencySymbol: '€',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    numberGrouping: [3],
    phoneFormat: '+34 ### ### ###',
    addressFormat: ['street', 'zipcode', 'city', 'country'],
    nameOrder: 'first-last',
    honorifics: ['Sr.', 'Sra.', 'Dr.', 'Dra.', 'Prof.'],
    colors: {
      primary: '#dc2626',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },

  ar: {
    dateFormat: 'dmy',
    timeFormat: '12',
    weekStart: 6,
    currency: 'SAR',
    currencyPosition: 'after',
    currencySymbol: 'ر.س',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [3],
    phoneFormat: '+966 ## ### ####',
    addressFormat: ['street', 'city', 'country'],
    nameOrder: 'first-last',
    honorifics: ['الأستاذ', 'الدكتور', 'المهندس', 'الشيخ'],
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'rtl',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Cairo, Amiri, system-ui, sans-serif',
      fontSize: {
        base: '18px',
        large: '20px'
      },
      lineHeight: {
        base: '1.8',
        large: '1.9'
      }
    },
    calendar: {
      type: 'islamic',
      era: true,
      weekendDays: [5, 6]
    }
  },

  zh: {
    dateFormat: 'ymd',
    timeFormat: '24',
    weekStart: 1,
    currency: 'CNY',
    currencyPosition: 'before',
    currencySymbol: '¥',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [4], // Chinese uses 4-digit grouping
    phoneFormat: '+86 ### #### ####',
    addressFormat: ['country', 'city', 'street'],
    nameOrder: 'last-first',
    honorifics: ['先生', '女士', '博士', '教授'],
    colors: {
      primary: '#dc2626',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'PingFang SC, Hiragino Sans GB, Microsoft YaHei, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.6',
        large: '1.7'
      }
    },
    calendar: {
      type: 'chinese',
      era: true,
      weekendDays: [0, 6]
    }
  },

  ja: {
    dateFormat: 'ymd',
    timeFormat: '24',
    weekStart: 0,
    currency: 'JPY',
    currencyPosition: 'before',
    currencySymbol: '¥',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [4],
    phoneFormat: '+81 ## #### ####',
    addressFormat: ['country', 'zipcode', 'city', 'street'],
    nameOrder: 'last-first',
    honorifics: ['さん', '様', '博士', '教授'],
    colors: {
      primary: '#dc2626',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Hiragino Sans, Yu Gothic, Meiryo, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.7',
        large: '1.8'
      }
    },
    calendar: {
      type: 'gregorian',
      era: true,
      weekendDays: [0, 6]
    }
  },

  de: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 1,
    currency: 'EUR',
    currencyPosition: 'after',
    currencySymbol: '€',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    numberGrouping: [3],
    phoneFormat: '+49 ### ### ####',
    addressFormat: ['street', 'zipcode', 'city', 'country'],
    nameOrder: 'first-last',
    honorifics: ['Herr', 'Frau', 'Dr.', 'Prof.'],
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },

  fr: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 1,
    currency: 'EUR',
    currencyPosition: 'after',
    currencySymbol: '€',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    numberGrouping: [3],
    phoneFormat: '+33 # ## ## ## ##',
    addressFormat: ['street', 'zipcode', 'city', 'country'],
    nameOrder: 'first-last',
    honorifics: ['M.', 'Mme', 'Dr.', 'Prof.'],
    colors: {
      primary: '#1e40af',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },

  hi: {
    dateFormat: 'dmy',
    timeFormat: '12',
    weekStart: 0,
    currency: 'INR',
    currencyPosition: 'before',
    currencySymbol: '₹',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    numberGrouping: [3, 2], // Indian numbering system (lakh/crore)
    phoneFormat: '+91 ##### #####',
    addressFormat: ['street', 'city', 'state', 'zipcode', 'country'],
    nameOrder: 'first-last',
    honorifics: ['श्री', 'श्रीमती', 'डॉ.', 'प्रो.'],
    colors: {
      primary: '#f97316',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Noto Sans Devanagari, system-ui, sans-serif',
      fontSize: {
        base: '17px',
        large: '19px'
      },
      lineHeight: {
        base: '1.6',
        large: '1.7'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0]
    }
  },

  pt: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 0,
    currency: 'BRL',
    currencyPosition: 'before',
    currencySymbol: 'R$',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    numberGrouping: [3],
    phoneFormat: '+55 ## #####-####',
    addressFormat: ['street', 'city', 'state', 'zipcode', 'country'],
    nameOrder: 'first-last',
    honorifics: ['Sr.', 'Sra.', 'Dr.', 'Dra.', 'Prof.'],
    colors: {
      primary: '#10b981',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  },

  ru: {
    dateFormat: 'dmy',
    timeFormat: '24',
    weekStart: 1,
    currency: 'RUB',
    currencyPosition: 'after',
    currencySymbol: '₽',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    numberGrouping: [3],
    phoneFormat: '+7 ### ###-##-##',
    addressFormat: ['country', 'zipcode', 'city', 'street'],
    nameOrder: 'first-last',
    honorifics: ['г-н', 'г-жа', 'д-р', 'проф.'],
    colors: {
      primary: '#1e40af',
      secondary: '#6b7280',
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    },
    icons: {
      direction: 'ltr',
      style: 'outline'
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: {
        base: '16px',
        large: '18px'
      },
      lineHeight: {
        base: '1.5',
        large: '1.6'
      }
    },
    calendar: {
      type: 'gregorian',
      era: false,
      weekendDays: [0, 6]
    }
  }
};

/**
 * Get cultural preferences for a locale
 */
export const getCulturalPreferences = (locale: string): CulturalPreferences => {
  return CULTURAL_PREFERENCES[locale] || CULTURAL_PREFERENCES.en;
};

/**
 * Get supported cultural locales
 */
export const getSupportedCulturalLocales = (): string[] => {
  return Object.keys(CULTURAL_PREFERENCES);
};

export default {
  CULTURAL_PREFERENCES,
  getCulturalPreferences,
  getSupportedCulturalLocales
};`;

    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(utilsDir, 'cultural-config.ts'), culturalConfigContent);
}

function createCulturalFormatters(utilsDir, appName) {
    const formattersContent = `/**
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
      return \`\${(number * 100).toFixed(1)}%\`;
    }
  }

  /**
   * Format phone number according to cultural preferences
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
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
      parts[0] = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, \`$1\${this.preferences.thousandsSeparator}\`);
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
      ? \`\${symbol}\${formatted}\`
      : \`\${formatted} \${symbol}\`;
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
        return \`\${pad(month)}/\${pad(day)}/\${year}\`;
      case 'dmy':
        return \`\${pad(day)}/\${pad(month)}/\${year}\`;
      case 'ymd':
        return \`\${year}/\${pad(month)}/\${pad(day)}\`;
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
        ? \`\${displayHours}:\${pad(minutes)}:\${pad(seconds)} \${ampm}\`
        : \`\${displayHours}:\${pad(minutes)} \${ampm}\`;
      return timeStr;
    } else {
      const timeStr = options.includeSeconds
        ? \`\${pad(hours)}:\${pad(minutes)}:\${pad(seconds)}\`
        : \`\${pad(hours)}:\${pad(minutes)}\`;
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
    if (diffDays > 0) return \`In \${diffDays} days\`;
    return \`\${Math.abs(diffDays)} days ago\`;
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

export default CulturalFormatter;`;

    fs.writeFileSync(path.join(utilsDir, 'cultural-formatters.ts'), formattersContent);
}

function createCulturalComponents(componentsDir, appName) {
    const culturalComponentsContent = `/**
 * @fileoverview Cultural Components
 * @description React components that adapt to cultural preferences
 */

import React, { ReactNode } from 'react';
import { useI18n } from './I18nProvider';
import { createCulturalFormatter, CulturalFormatter } from '../utils/cultural-formatters';
import { getCulturalPreferences } from '../utils/cultural-config';

interface CulturalTextProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Text component that applies cultural typography
 */
export const CulturalText: React.FC<CulturalTextProps> = ({
  children,
  className = '',
  style = {}
}) => {
  const { currentLocale } = useI18n();
  const preferences = getCulturalPreferences(currentLocale.code);

  const culturalStyle: React.CSSProperties = {
    fontFamily: preferences.typography.fontFamily,
    fontSize: preferences.typography.fontSize.base,
    lineHeight: preferences.typography.lineHeight.base,
    ...style
  };

  return (
    <span className={className} style={culturalStyle}>
      {children}
    </span>
  );
};

interface CulturalNumberProps {
  value: number;
  className?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

/**
 * Number component with cultural formatting
 */
export const CulturalNumber: React.FC<CulturalNumberProps> = ({
  value,
  className = '',
  minimumFractionDigits,
  maximumFractionDigits,
  useGrouping
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatNumber(value, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalCurrencyProps {
  amount: number;
  currency?: string;
  className?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Currency component with cultural formatting
 */
export const CulturalCurrency: React.FC<CulturalCurrencyProps> = ({
  amount,
  currency,
  className = '',
  minimumFractionDigits,
  maximumFractionDigits
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatCurrency(amount, currency, {
    minimumFractionDigits,
    maximumFractionDigits
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalDateProps {
  date: Date | string | number;
  className?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  includeTime?: boolean;
}

/**
 * Date component with cultural formatting
 */
export const CulturalDate: React.FC<CulturalDateProps> = ({
  date,
  className = '',
  dateStyle,
  timeStyle,
  includeTime
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatDate(date, {
    dateStyle,
    timeStyle,
    includeTime
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalTimeProps {
  time: Date | string | number;
  className?: string;
  includeSeconds?: boolean;
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

/**
 * Time component with cultural formatting
 */
export const CulturalTime: React.FC<CulturalTimeProps> = ({
  time,
  className = '',
  includeSeconds,
  timeStyle
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatTime(time, {
    includeSeconds,
    timeStyle
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalRelativeTimeProps {
  date: Date | string | number;
  className?: string;
}

/**
 * Relative time component (e.g., "2 hours ago")
 */
export const CulturalRelativeTime: React.FC<CulturalRelativeTimeProps> = ({
  date,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatRelativeTime(date);

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalPercentageProps {
  value: number;
  className?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Percentage component with cultural formatting
 */
export const CulturalPercentage: React.FC<CulturalPercentageProps> = ({
  value,
  className = '',
  minimumFractionDigits,
  maximumFractionDigits
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatPercentage(value, {
    minimumFractionDigits,
    maximumFractionDigits
  });

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalPhoneProps {
  phoneNumber: string;
  className?: string;
}

/**
 * Phone number component with cultural formatting
 */
export const CulturalPhone: React.FC<CulturalPhoneProps> = ({
  phoneNumber,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatPhoneNumber(phoneNumber);

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalNameProps {
  firstName: string;
  lastName: string;
  honorific?: string;
  className?: string;
}

/**
 * Name component with cultural formatting
 */
export const CulturalName: React.FC<CulturalNameProps> = ({
  firstName,
  lastName,
  honorific,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatName(firstName, lastName, honorific);

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalAddressProps {
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
  };
  className?: string;
}

/**
 * Address component with cultural formatting
 */
export const CulturalAddress: React.FC<CulturalAddressProps> = ({
  address,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);

  const formattedValue = formatter.formatAddress(address);

  return (
    <CulturalText className={className}>
      {formattedValue}
    </CulturalText>
  );
};

interface CulturalCalendarProps {
  className?: string;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Calendar component with cultural preferences
 */
export const CulturalCalendar: React.FC<CulturalCalendarProps> = ({
  className = '',
  onDateSelect,
  selectedDate,
  minDate,
  maxDate
}) => {
  const { currentLocale } = useI18n();
  const formatter = createCulturalFormatter(currentLocale.code);
  const preferences = getCulturalPreferences(currentLocale.code);

  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return (firstDay - preferences.weekStart + 7) % 7;
  };

  const getDayNames = () => {
    const days = [];
    const baseDate = new Date(2024, 0, preferences.weekStart); // Start from the week start day
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(baseDate);
      day.setDate(baseDate.getDate() + i);
      days.push(formatter.formatDate(day, { weekday: 'short' }));
    }
    
    return days;
  };

  const isWeekend = (dayOfWeek: number) => {
    return formatter.isWeekend(dayOfWeek);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOffset = getFirstDayOfMonth(currentMonth);
  const dayNames = getDayNames();

  const days = [];
  
  // Empty cells for offset
  for (let i = 0; i < firstDayOffset; i++) {
    days.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className={\`cultural-calendar \${className}\`}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ‹
        </button>
        <h3 className="text-lg font-semibold">
          {formatter.formatDate(currentMonth, { year: 'numeric', month: 'long' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ›
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName, index) => (
          <div key={index} className="text-center text-sm font-medium text-gray-600 p-2">
            {dayName}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2"></div>;
          }
          
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dayOfWeek = date.getDay();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
          const isWeekendDay = isWeekend(dayOfWeek);
          
          return (
            <button
              key={day}
              onClick={() => !isDisabled && onDateSelect?.(date)}
              disabled={isDisabled}
              className={\`
                p-2 text-center rounded hover:bg-blue-50 transition-colors
                \${isSelected ? 'bg-blue-500 text-white' : ''}
                \${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900'}
                \${isWeekendDay ? 'text-red-600' : ''}
              \`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface CulturalContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container that applies cultural styling preferences
 */
export const CulturalContainer: React.FC<CulturalContainerProps> = ({
  children,
  className = ''
}) => {
  const { currentLocale } = useI18n();
  const preferences = getCulturalPreferences(currentLocale.code);

  const containerStyle: React.CSSProperties = {
    '--cultural-primary': preferences.colors.primary,
    '--cultural-secondary': preferences.colors.secondary,
    '--cultural-danger': preferences.colors.danger,
    '--cultural-warning': preferences.colors.warning,
    '--cultural-success': preferences.colors.success,
    fontFamily: preferences.typography.fontFamily
  } as React.CSSProperties;

  return (
    <div 
      className={\`cultural-container \${className}\`}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default {
  CulturalText,
  CulturalNumber,
  CulturalCurrency,
  CulturalDate,
  CulturalTime,
  CulturalRelativeTime,
  CulturalPercentage,
  CulturalPhone,
  CulturalName,
  CulturalAddress,
  CulturalCalendar,
  CulturalContainer
};`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(componentsDir, 'CulturalComponents.tsx'), culturalComponentsContent);
}

function createCulturalHooks(utilsDir, appName) {
    const culturalHooksContent = `/**
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
      .replace(/\+/g, '\\\\+')
      .replace(/#/g, '\\\\d')
      .replace(/\s/g, '\\\\s?')
      .replace(/\(/g, '\\\\(')
      .replace(/\)/g, '\\\\)')
      .replace(/-/g, '-?');
    
    return new RegExp(\`^\${pattern}$\`);
  };
  
  const validatePhone = (phone: string): boolean => {
    const pattern = getPhonePattern();
    return pattern.test(phone);
  };
  
  const getDatePattern = () => {
    switch (preferences.dateFormat) {
      case 'mdy':
        return /^(0?[1-9]|1[0-2])\\/([0-2]?[0-9]|3[0-1])\\/(19|20)\\d{2}$/;
      case 'dmy':
        return /^([0-2]?[0-9]|3[0-1])\\/(0?[1-9]|1[0-2])\\/(19|20)\\d{2}$/;
      case 'ymd':
        return /^(19|20)\\d{2}\\/(0?[1-9]|1[0-2])\\/([0-2]?[0-9]|3[0-1])$/;
      default:
        return /^\\d{1,2}\\/\\d{1,2}\\/\\d{4}$/;
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
};`;

    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(utilsDir, 'cultural-hooks.ts'), culturalHooksContent);
}