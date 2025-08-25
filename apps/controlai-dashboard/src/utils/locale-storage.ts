/**
 * @fileoverview Locale Storage Management
 * @description Persistent locale preference storage
 */

import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../../../../i18n/shared-config';

export interface LocaleStorage {
  get(): string | null;
  set(locale: string): boolean;
  remove(): boolean;
  isSupported(): boolean;
}

/**
 * localStorage-based locale storage
 */
export class LocalStorageLocaleStorage implements LocaleStorage {
  private readonly key: string;

  constructor(key: string = 'controlai-dashboard_locale') {
    this.key = key;
  }

  get(): string | null {
    try {
      if (!this.isSupported()) return null;
      const stored = localStorage.getItem(this.key);
      return stored && this.isValidLocale(stored) ? stored : null;
    } catch (error) {
      console.warn('Error reading locale from localStorage:', error);
      return null;
    }
  }

  set(locale: string): boolean {
    try {
      if (!this.isSupported() || !this.isValidLocale(locale)) {
        return false;
      }
      localStorage.setItem(this.key, locale);
      return true;
    } catch (error) {
      console.warn('Error saving locale to localStorage:', error);
      return false;
    }
  }

  remove(): boolean {
    try {
      if (!this.isSupported()) return false;
      localStorage.removeItem(this.key);
      return true;
    } catch (error) {
      console.warn('Error removing locale from localStorage:', error);
      return false;
    }
  }

  isSupported(): boolean {
    try {
      return typeof Storage !== 'undefined' && typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  private isValidLocale(locale: string): boolean {
    return Object.keys(SUPPORTED_LOCALES).includes(locale);
  }
}

/**
 * Cookie-based locale storage
 */
export class CookieLocaleStorage implements LocaleStorage {
  private readonly cookieName: string;
  private readonly maxAge: number;
  private readonly path: string;
  private readonly domain?: string;
  private readonly secure: boolean;
  private readonly sameSite: 'strict' | 'lax' | 'none';

  constructor(options: {
    cookieName?: string;
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}) {
    this.cookieName = options.cookieName || 'controlai-dashboard_locale';
    this.maxAge = options.maxAge || 365 * 24 * 60 * 60; // 1 year in seconds
    this.path = options.path || '/';
    this.domain = options.domain;
    this.secure = options.secure ?? (typeof location !== 'undefined' && location.protocol === 'https:');
    this.sameSite = options.sameSite || 'lax';
  }

  get(): string | null {
    try {
      if (!this.isSupported()) return null;
      
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {} as Record<string, string>);

      const stored = cookies[this.cookieName];
      return stored && this.isValidLocale(stored) ? stored : null;
    } catch (error) {
      console.warn('Error reading locale from cookies:', error);
      return null;
    }
  }

  set(locale: string): boolean {
    try {
      if (!this.isSupported() || !this.isValidLocale(locale)) {
        return false;
      }

      const cookieOptions = [
        `${this.cookieName}=${encodeURIComponent(locale)}`,
        `max-age=${this.maxAge}`,
        `path=${this.path}`
      ];

      if (this.domain) {
        cookieOptions.push(`domain=${this.domain}`);
      }

      if (this.secure) {
        cookieOptions.push('secure');
      }

      cookieOptions.push(`samesite=${this.sameSite}`);

      document.cookie = cookieOptions.join('; ');
      return true;
    } catch (error) {
      console.warn('Error saving locale to cookies:', error);
      return false;
    }
  }

  remove(): boolean {
    try {
      if (!this.isSupported()) return false;

      const cookieOptions = [
        `${this.cookieName}=`,
        'expires=Thu, 01 Jan 1970 00:00:00 GMT',
        `path=${this.path}`
      ];

      if (this.domain) {
        cookieOptions.push(`domain=${this.domain}`);
      }

      document.cookie = cookieOptions.join('; ');
      return true;
    } catch (error) {
      console.warn('Error removing locale from cookies:', error);
      return false;
    }
  }

  isSupported(): boolean {
    return typeof document !== 'undefined' && typeof document.cookie !== 'undefined';
  }

  private isValidLocale(locale: string): boolean {
    return Object.keys(SUPPORTED_LOCALES).includes(locale);
  }
}

/**
 * Multi-storage locale manager
 */
export class MultiStorageLocaleManager {
  private storages: LocaleStorage[];
  private primaryStorage: LocaleStorage;

  constructor(storages: LocaleStorage[] = []) {
    this.storages = storages.length > 0 ? storages : [
      new LocalStorageLocaleStorage(),
      new CookieLocaleStorage()
    ];
    this.primaryStorage = this.storages[0];
  }

  /**
   * Get locale from the first available storage
   */
  getLocale(): string {
    for (const storage of this.storages) {
      try {
        const locale = storage.get();
        if (locale) {
          return locale;
        }
      } catch (error) {
        console.warn('Error reading from storage:', error);
      }
    }
    return DEFAULT_LOCALE;
  }

  /**
   * Set locale in all supported storages
   */
  setLocale(locale: string): boolean {
    if (!this.isValidLocale(locale)) {
      console.warn(`Invalid locale: ${locale}`);
      return false;
    }

    let success = false;
    for (const storage of this.storages) {
      try {
        if (storage.set(locale)) {
          success = true;
        }
      } catch (error) {
        console.warn('Error writing to storage:', error);
      }
    }

    return success;
  }

  /**
   * Remove locale from all storages
   */
  removeLocale(): boolean {
    let success = false;
    for (const storage of this.storages) {
      try {
        if (storage.remove()) {
          success = true;
        }
      } catch (error) {
        console.warn('Error removing from storage:', error);
      }
    }

    return success;
  }

  /**
   * Check if any storage is supported
   */
  isSupported(): boolean {
    return this.storages.some(storage => storage.isSupported());
  }

  /**
   * Sync locale across all storages
   */
  syncLocale(): string {
    const currentLocale = this.getLocale();
    this.setLocale(currentLocale);
    return currentLocale;
  }

  private isValidLocale(locale: string): boolean {
    return Object.keys(SUPPORTED_LOCALES).includes(locale);
  }
}

/**
 * Default locale storage manager
 */
export const defaultLocaleStorage = new MultiStorageLocaleManager();

/**
 * Utility functions
 */
export const getStoredLocale = (): string => {
  return defaultLocaleStorage.getLocale();
};

export const setStoredLocale = (locale: string): boolean => {
  return defaultLocaleStorage.setLocale(locale);
};

export const removeStoredLocale = (): boolean => {
  return defaultLocaleStorage.removeLocale();
};

export const syncStoredLocale = (): string => {
  return defaultLocaleStorage.syncLocale();
};

/**
 * React hook for locale storage
 */
export const useLocaleStorage = () => {
  const getLocale = (): string => {
    return getStoredLocale();
  };

  const setLocale = (locale: string): boolean => {
    const success = setStoredLocale(locale);
    if (success) {
      // Trigger storage event for cross-tab synchronization
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'controlai-dashboard_locale',
          newValue: locale,
          storageArea: localStorage
        }));
      }
    }
    return success;
  };

  const removeLocale = (): boolean => {
    const success = removeStoredLocale();
    if (success && typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'controlai-dashboard_locale',
        newValue: null,
        storageArea: localStorage
      }));
    }
    return success;
  };

  return {
    getLocale,
    setLocale,
    removeLocale,
    syncLocale: syncStoredLocale,
    isSupported: () => defaultLocaleStorage.isSupported()
  };
};

export default MultiStorageLocaleManager;