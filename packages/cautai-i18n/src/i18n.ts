/**
 * @fileoverview Core i18n Implementation
 * @author Cautai Team
 * @version 1.0.0
 */

import type { Language, TranslationFunction, I18nConfig, LanguageConfig } from './types';
import { translations, languageConfigs, defaultLanguage, fallbackLanguage, supportedLanguages } from './locales';

class I18n {
  private currentLanguage: Language = defaultLanguage;
  private config: I18nConfig;
  private listeners: Set<(language: Language) => void> = new Set();

  constructor(config?: Partial<I18nConfig>) {
    this.config = {
      defaultLanguage,
      fallbackLanguage,
      supportedLanguages,
      storageKey: 'cautai_language',
      detectBrowserLanguage: true,
      interpolation: {
        prefix: '{{',
        suffix: '}}',
        escapeValue: true
      },
      ...config
    };

    this.initialize();
  }

  private initialize(): void {
    // Try to restore language from storage
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored && this.isLanguageSupported(stored as Language)) {
        this.currentLanguage = stored as Language;
        return;
      }
    }

    // Detect browser language if enabled
    if (this.config.detectBrowserLanguage && typeof navigator !== 'undefined') {
      const browserLang = this.detectBrowserLanguage();
      if (browserLang) {
        this.currentLanguage = browserLang;
        return;
      }
    }
  }

  private detectBrowserLanguage(): Language | null {
    const languages = navigator.languages || [navigator.language];
    
    for (const lang of languages) {
      // Extract language code (e.g., 'en-US' -> 'en')
      const code = lang.split('-')[0] as Language;
      if (this.isLanguageSupported(code)) {
        return code;
      }
    }
    
    return null;
  }

  private isLanguageSupported(language: string): boolean {
    return this.config.supportedLanguages.includes(language as Language);
  }

  public getLanguage(): Language {
    return this.currentLanguage;
  }

  public setLanguage(language: Language): void {
    if (!this.isLanguageSupported(language)) {
      console.warn(`Language "${language}" is not supported. Falling back to ${this.config.fallbackLanguage}.`);
      language = this.config.fallbackLanguage;
    }

    this.currentLanguage = language;

    // Save to storage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.config.storageKey, language);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(language));
  }

  public getLanguageConfig(): LanguageConfig {
    return languageConfigs[this.currentLanguage];
  }

  public getSupportedLanguages(): Language[] {
    return [...this.config.supportedLanguages];
  }

  public onLanguageChange(listener: (language: Language) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public t: TranslationFunction = (key: string, params?: Record<string, any>): string => {
    try {
      // Get translation from current language
      let translation = this.getNestedProperty(translations[this.currentLanguage], key);
      
      // Fallback to default language if not found
      if (translation === undefined && this.currentLanguage !== this.config.fallbackLanguage) {
        translation = this.getNestedProperty(translations[this.config.fallbackLanguage], key);
      }
      
      // Return key if no translation found
      if (translation === undefined) {
        console.warn(`Translation missing for key: "${key}" in language "${this.currentLanguage}"`);
        return key;
      }

      // Interpolate parameters
      if (params) {
        return this.interpolate(translation, params);
      }

      return translation;
    } catch (error) {
      console.error(`Error translating key "${key}":`, error);
      return key;
    }
  };

  private getNestedProperty(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private interpolate(template: string, params: Record<string, any>): string {
    return template.replace(
      new RegExp(`${this.escapeRegex(this.config.interpolation.prefix)}([^}]+)${this.escapeRegex(this.config.interpolation.suffix)}`, 'g'),
      (match, key) => {
        const value = params[key.trim()];
        if (value !== undefined) {
          const stringValue = String(value);
          return this.config.interpolation.escapeValue ? this.escapeHtml(stringValue) : stringValue;
        }
        return match; // Return original if parameter not found
      }
    );
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Utility methods for formatting
  public formatNumber(value: number): string {
    const config = this.getLanguageConfig();
    return new Intl.NumberFormat(config.code + (config.region ? '-' + config.region : ''), 
      config.numberFormat).format(value);
  }

  public formatDate(date: Date): string {
    const config = this.getLanguageConfig();
    return new Intl.DateTimeFormat(config.code + (config.region ? '-' + config.region : '')).format(date);
  }

  public formatTime(date: Date): string {
    const config = this.getLanguageConfig();
    return new Intl.DateTimeFormat(config.code + (config.region ? '-' + config.region : ''), {
      timeStyle: 'short'
    }).format(date);
  }

  public formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return this.t('time.just_now');
    if (diffInSeconds < 3600) return this.t('time.ago', { count: Math.floor(diffInSeconds / 60), unit: this.t('time.minutes') });
    if (diffInSeconds < 86400) return this.t('time.ago', { count: Math.floor(diffInSeconds / 3600), unit: this.t('time.hours') });
    if (diffInSeconds < 2592000) return this.t('time.ago', { count: Math.floor(diffInSeconds / 86400), unit: this.t('time.days') });
    if (diffInSeconds < 31536000) return this.t('time.ago', { count: Math.floor(diffInSeconds / 2592000), unit: this.t('time.months') });
    
    return this.t('time.ago', { count: Math.floor(diffInSeconds / 31536000), unit: this.t('time.years') });
  }

  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  public formatShortNumber(value: number): string {
    if (value < 1000) return this.formatNumber(value);
    if (value < 1000000) return `${this.formatNumber(value / 1000)}${this.t('formatting.thousand')}`;
    if (value < 1000000000) return `${this.formatNumber(value / 1000000)}${this.t('formatting.million')}`;
    return `${this.formatNumber(value / 1000000000)}${this.t('formatting.billion')}`;
  }
}

// Global instance
export const i18n = new I18n();

// Initialize function for custom configuration
export function initI18n(config?: Partial<I18nConfig>): I18n {
  return new I18n(config);
}