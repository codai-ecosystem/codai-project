/**
 * Utility functions for CODAI SDK
 */

// HTTP utilities
export class HttpUtils {
  /**
   * Create axios instance with common configuration
   */
  static createHttpClient(baseURL: string, options: any = {}) {
    // Placeholder for axios instance creation
    return {
      baseURL,
      ...options,
      get: async (url: string) => ({ data: null }),
      post: async (url: string, data: any) => ({ data: null }),
      put: async (url: string, data: any) => ({ data: null }),
      delete: async (url: string) => ({ data: null })
    };
  }

  /**
   * Build query string from object
   */
  static buildQueryString(params: Record<string, any>): string {
    return new URLSearchParams(
      Object.entries(params).filter(([, value]) => value != null)
    ).toString();
  }

  /**
   * Parse response data
   */
  static parseResponse<T>(response: any): T {
    return response.data || response;
  }
}

// Storage utilities
export class StorageUtils {
  /**
   * Safe localStorage operations
   */
  static setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}

// Encryption utilities
export class CryptoUtils {
  /**
   * Generate random string
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Simple base64 encoding
   */
  static encode(data: string): string {
    try {
      return btoa(data);
    } catch (error) {
      console.warn('Failed to encode data:', error);
      return data;
    }
  }

  /**
   * Simple base64 decoding
   */
  static decode(data: string): string {
    try {
      return atob(data);
    } catch (error) {
      console.warn('Failed to decode data:', error);
      return data;
    }
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Validation utilities
export class ValidationUtils {
  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate UUID
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input.replace(/[<>\"']/g, '');
  }

  /**
   * Validate required fields
   */
  static validateRequired(data: any, fields: string[]): void {
    for (const field of fields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        throw new Error(`Required field '${field}' is missing or empty`);
      }
    }
  }

  /**
   * Validate positive number
   */
  static validatePositiveNumber(value: number, fieldName: string): void {
    if (typeof value !== 'number' || value <= 0) {
      throw new Error(`${fieldName} must be a positive number`);
    }
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
  }

  /**
   * Validate currency code
   */
  static validateCurrency(currency: string): boolean {
    const currencyRegex = /^[A-Z]{3}$/;
    return currencyRegex.test(currency);
  }

  /**
   * Validate phone number
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }
}

// Date utilities
export class DateUtils {
  /**
   * Format date to ISO string
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse ISO string to date
   */
  static fromISOString(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Get timestamp
   */
  static timestamp(): number {
    return Date.now();
  }

  /**
   * Add time to date
   */
  static addTime(date: Date, milliseconds: number): Date {
    return new Date(date.getTime() + milliseconds);
  }

  /**
   * Check if date is expired
   */
  static isExpired(date: Date): boolean {
    return date.getTime() < Date.now();
  }
}

// Error utilities
export class ErrorUtils {
  /**
   * Create standardized error
   */
  static createError(
    message: string,
    code?: string,
    details?: any
  ): Error & { code?: string; details?: any } {
    const error = new Error(message) as Error & { code?: string; details?: any };
    if (code) error.code = code;
    if (details) error.details = details;
    return error;
  }

  /**
   * Handle async errors
   */
  static async handleAsync<T>(
    promise: Promise<T>
  ): Promise<[Error | null, T | null]> {
    try {
      const result = await promise;
      return [null, result];
    } catch (error) {
      return [error as Error, null];
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// Performance utilities
export class PerformanceUtils {
  /**
   * Measure execution time
   */
  static async measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    return { result, duration };
  }

  /**
   * Debounce function
   */
  static debounce<T extends any[]>(
    fn: (...args: T) => void,
    delay: number
  ): (...args: T) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle function
   */
  static throttle<T extends any[]>(
    fn: (...args: T) => void,
    limit: number
  ): (...args: T) => void {
    let inThrottle: boolean;

    return (...args: T) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}
