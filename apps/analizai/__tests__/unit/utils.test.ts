// Utility function tests for analizai
import { describe, it, expect } from 'vitest';

// Mock utility functions
const utils = {
  formatCurrency: (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatPercentage: (value: number, decimals = 2) => {
    return `${value.toFixed(decimals)}%`;
  },

  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  sanitizeString: (input: string) => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  },

  debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
};

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(utils.formatCurrency(1234.56)).toBe('€1,234.56');
      expect(utils.formatCurrency(1000)).toBe('€1,000.00');
    });

    it('handles different currencies', () => {
      expect(utils.formatCurrency(1000, 'USD')).toBe('$1,000.00');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentages correctly', () => {
      expect(utils.formatPercentage(12.345)).toBe('12.35%');
      expect(utils.formatPercentage(100)).toBe('100.00%');
    });

    it('respects decimal places', () => {
      expect(utils.formatPercentage(12.345, 1)).toBe('12.3%');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(utils.validateEmail('test@example.com')).toBe(true);
      expect(utils.validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(utils.validateEmail('invalid-email')).toBe(false);
      expect(utils.validateEmail('test@')).toBe(false);
      expect(utils.validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('removes script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello';
      expect(utils.sanitizeString(malicious)).toBe('Hello');
    });

    it('preserves safe content', () => {
      const safe = '<p>Safe content</p>';
      expect(utils.sanitizeString(safe)).toBe(safe);
    });
  });

  describe('debounce', () => {
    it('debounces function calls', (done) => {
      let callCount = 0;
      const debouncedFn = utils.debounce(() => {
        callCount++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });
});