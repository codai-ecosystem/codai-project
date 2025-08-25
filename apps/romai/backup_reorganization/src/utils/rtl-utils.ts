/**
 * @fileoverview RTL Utility Functions
 * @description Utilities for RTL layout and text handling
 */

import { RTL_LOCALES } from '../../../../i18n/shared-config';

/**
 * Check if a locale is RTL
 */
export const isRTLLocale = (locale: string): boolean => {
  return RTL_LOCALES.includes(locale);
};

/**
 * Get direction for a locale
 */
export const getDirection = (locale: string): 'rtl' | 'ltr' => {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
};

/**
 * Get opposite direction
 */
export const getOppositeDirection = (direction: 'rtl' | 'ltr'): 'rtl' | 'ltr' => {
  return direction === 'rtl' ? 'ltr' : 'rtl';
};

/**
 * RTL-aware class name utilities
 */
export class RTLClassNames {
  private isRTL: boolean;

  constructor(isRTL: boolean) {
    this.isRTL = isRTL;
  }

  /**
   * Get margin class (left/right)
   */
  margin(side: 'left' | 'right', size: string): string {
    const actualSide = this.isRTL && side === 'left' ? 'right' : 
                      this.isRTL && side === 'right' ? 'left' : side;
    return `m${actualSide[0]}-${size}`;
  }

  /**
   * Get padding class (left/right)
   */
  padding(side: 'left' | 'right', size: string): string {
    const actualSide = this.isRTL && side === 'left' ? 'right' : 
                       this.isRTL && side === 'right' ? 'left' : side;
    return `p${actualSide[0]}-${size}`;
  }

  /**
   * Get text alignment class
   */
  textAlign(align: 'left' | 'right' | 'center'): string {
    if (align === 'center') return 'text-center';
    const actualAlign = this.isRTL && align === 'left' ? 'right' : 
                        this.isRTL && align === 'right' ? 'left' : align;
    return `text-${actualAlign}`;
  }

  /**
   * Get border class (left/right)
   */
  border(side: 'left' | 'right', width: string = ''): string {
    const actualSide = this.isRTL && side === 'left' ? 'right' : 
                       this.isRTL && side === 'right' ? 'left' : side;
    return width ? `border-${actualSide[0]}-${width}` : `border-${actualSide[0]}`;
  }

  /**
   * Get rounded corner class
   */
  rounded(corner: 'tl' | 'tr' | 'bl' | 'br' | 'l' | 'r', size: string = ''): string {
    let actualCorner = corner;
    
    if (this.isRTL) {
      const cornerMap: Record<string, string> = {
        'tl': 'tr',
        'tr': 'tl',
        'bl': 'br',
        'br': 'bl',
        'l': 'r',
        'r': 'l'
      };
      actualCorner = cornerMap[corner] || corner;
    }
    
    return size ? `rounded-${actualCorner}-${size}` : `rounded-${actualCorner}`;
  }

  /**
   * Get position class (left/right)
   */
  position(side: 'left' | 'right', value: string): string {
    const actualSide = this.isRTL && side === 'left' ? 'right' : 
                       this.isRTL && side === 'right' ? 'left' : side;
    return `${actualSide}-${value}`;
  }

  /**
   * Get flex direction class
   */
  flexDirection(direction: 'row' | 'row-reverse' | 'col' | 'col-reverse'): string {
    if (direction.includes('col')) return `flex-${direction}`;
    
    const actualDirection = this.isRTL && direction === 'row' ? 'row-reverse' : 
                            this.isRTL && direction === 'row-reverse' ? 'row' : direction;
    return `flex-${actualDirection}`;
  }
}

/**
 * RTL-aware CSS property utilities
 */
export class RTLCSSProperties {
  private isRTL: boolean;

  constructor(isRTL: boolean) {
    this.isRTL = isRTL;
  }

  /**
   * Get logical property for margin/padding
   */
  logicalProperty(property: 'margin' | 'padding', side: 'start' | 'end', value: string): Record<string, string> {
    const actualSide = side === 'start' 
      ? (this.isRTL ? 'right' : 'left')
      : (this.isRTL ? 'left' : 'right');
    
    return { [`${property}-${actualSide}`]: value };
  }

  /**
   * Get transform for RTL
   */
  transform(transforms: string[]): Record<string, string> {
    const rtlTransforms = this.isRTL 
      ? ['scaleX(-1)', ...transforms]
      : transforms;
    
    return { transform: rtlTransforms.join(' ') };
  }

  /**
   * Get text direction properties
   */
  textDirection(): Record<string, string> {
    return {
      direction: this.isRTL ? 'rtl' : 'ltr',
      textAlign: this.isRTL ? 'right' : 'left'
    };
  }
}

/**
 * Text processing utilities for RTL
 */
export class RTLTextUtils {
  /**
   * Detect if text contains RTL characters
   */
  static hasRTLCharacters(text: string): boolean {
    const rtlRegex = /[֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
    return rtlRegex.test(text);
  }

  /**
   * Auto-detect text direction
   */
  static detectTextDirection(text: string): 'rtl' | 'ltr' {
    return this.hasRTLCharacters(text) ? 'rtl' : 'ltr';
  }

  /**
   * Wrap text with directional marks
   */
  static wrapWithDirectionalMarks(text: string, direction?: 'rtl' | 'ltr'): string {
    const detectedDirection = direction || this.detectTextDirection(text);
    const lrm = '\u200E'; // Left-to-right mark
    const rlm = '\u200F'; // Right-to-left mark
    
    if (detectedDirection === 'rtl') {
      return rlm + text + rlm;
    } else {
      return lrm + text + lrm;
    }
  }

  /**
   * Remove directional marks from text
   */
  static removeDirectionalMarks(text: string): string {
    return text.replace(/[‎‏‪-‮]/g, '');
  }

  /**
   * Normalize text for consistent display
   */
  static normalizeText(text: string): string {
    return this.removeDirectionalMarks(text).trim();
  }

  /**
   * Get appropriate quote marks for locale
   */
  static getQuoteMarks(locale: string): { open: string; close: string } {
    const quoteMaps: Record<string, { open: string; close: string }> = {
      ar: { open: '«', close: '»' },
      he: { open: '"', close: '"' },
      fa: { open: '«', close: '»' },
      ur: { open: '"', close: '"' }
    };

    return quoteMaps[locale] || { open: '"', close: '"' };
  }

  /**
   * Format text with proper quotes
   */
  static formatWithQuotes(text: string, locale: string): string {
    const quotes = this.getQuoteMarks(locale);
    return `${quotes.open}${text}${quotes.close}`;
  }
}

/**
 * Number formatting utilities for RTL locales
 */
export class RTLNumberUtils {
  /**
   * Format number for RTL display
   */
  static formatNumber(
    number: number, 
    locale: string, 
    options?: Intl.NumberFormatOptions
  ): string {
    try {
      return new Intl.NumberFormat(locale, options).format(number);
    } catch (error) {
      console.warn('Error formatting number:', error);
      return number.toString();
    }
  }

  /**
   * Format percentage for RTL display
   */
  static formatPercentage(number: number, locale: string): string {
    return this.formatNumber(number, locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  /**
   * Format currency for RTL display
   */
  static formatCurrency(
    amount: number, 
    locale: string, 
    currency: string
  ): string {
    return this.formatNumber(amount, locale, {
      style: 'currency',
      currency: currency
    });
  }

  /**
   * Convert Western Arabic numerals to Eastern Arabic numerals
   */
  static toEasternArabicNumerals(text: string): string {
    const westernToEastern: Record<string, string> = {
      '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
      '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };

    return text.replace(/[0-9]/g, digit => westernToEastern[digit] || digit);
  }

  /**
   * Convert Eastern Arabic numerals to Western Arabic numerals
   */
  static toWesternArabicNumerals(text: string): string {
    const easternToWestern: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };

    return text.replace(/[٠-٩]/g, digit => easternToWestern[digit] || digit);
  }
}

/**
 * Date formatting utilities for RTL locales
 */
export class RTLDateUtils {
  /**
   * Format date for RTL display
   */
  static formatDate(
    date: Date | string | number,
    locale: string,
    options?: Intl.DateTimeFormatOptions
  ): string {
    try {
      return new Intl.DateTimeFormat(locale, options).format(new Date(date));
    } catch (error) {
      console.warn('Error formatting date:', error);
      return new Date(date).toLocaleDateString();
    }
  }

  /**
   * Get calendar system for locale
   */
  static getCalendarSystem(locale: string): string {
    const calendarSystems: Record<string, string> = {
      ar: 'islamic',
      he: 'hebrew',
      fa: 'persian',
      th: 'buddhist'
    };

    return calendarSystems[locale] || 'gregorian';
  }

  /**
   * Format date with appropriate calendar system
   */
  static formatDateWithCalendar(
    date: Date | string | number,
    locale: string,
    calendar?: string
  ): string {
    const calendarSystem = calendar || this.getCalendarSystem(locale);
    
    return this.formatDate(date, locale, {
      calendar: calendarSystem,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

/**
 * Create RTL utility functions for a given locale/direction
 */
export const createRTLUtils = (isRTL: boolean) => ({
  classNames: new RTLClassNames(isRTL),
  cssProperties: new RTLCSSProperties(isRTL),
  isRTL,
  direction: isRTL ? 'rtl' as const : 'ltr' as const
});

export default {
  isRTLLocale,
  getDirection,
  getOppositeDirection,
  RTLClassNames,
  RTLCSSProperties,
  RTLTextUtils,
  RTLNumberUtils,
  RTLDateUtils,
  createRTLUtils
};