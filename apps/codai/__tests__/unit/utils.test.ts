import { describe, it, expect, beforeEach } from 'vitest';

// Mock utility functions for testing
const utils = {
  generateId: () => Math.random().toString(36).substr(2, 9),
  formatDate: (date: Date) => date.toISOString().split('T')[0],
  validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  sanitizeInput: (input: string) => input.trim().replace(/[<>]/g, ''),
  debounce: (fn: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(null, args), delay);
    };
  },
  deepClone: (obj: any) => JSON.parse(JSON.stringify(obj)),
  isEmpty: (value: any) => {
    if (value == null) return true;
    if (typeof value === 'string') return value.length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },
  getNestedProperty: (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
};

describe('Utility Functions Tests', () => {
  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = utils.generateId();
      const id2 = utils.generateId();
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate IDs of consistent length', () => {
      const ids = Array.from({ length: 10 }, () => utils.generateId());
      
      ids.forEach(id => {
        expect(id.length).toBe(9);
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = utils.formatDate(date);
      
      expect(formatted).toBe('2024-01-15');
    });

    it('should handle different date formats', () => {
      const dates = [
        new Date('2024-12-31T23:59:59Z'),
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-06-15T12:00:00Z')
      ];

      const formatted = dates.map(utils.formatDate);
      
      expect(formatted).toEqual([
        '2024-12-31',
        '2024-01-01',
        '2024-06-15'
      ]);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@company.org'
      ];

      validEmails.forEach(email => {
        expect(utils.validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user space@domain.com',
        'user@domain'
      ];

      invalidEmails.forEach(email => {
        expect(utils.validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should remove dangerous characters', () => {
      const dangerousInput = '<script>alert("xss")</script>';
      const sanitized = utils.sanitizeInput(dangerousInput);
      
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).toBe('scriptalert("xss")/script');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const sanitized = utils.sanitizeInput(input);
      
      expect(sanitized).toBe('hello world');
    });

    it('should handle empty and null inputs', () => {
      expect(utils.sanitizeInput('')).toBe('');
      expect(utils.sanitizeInput('   ')).toBe('');
    });
  });

  describe('Debounce Function', () => {
    it('should delay function execution', async () => {
      let callCount = 0;
      const debouncedFn = utils.debounce(() => callCount++, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });

    it('should cancel previous calls', async () => {
      let callCount = 0;
      const debouncedFn = utils.debounce(() => callCount++, 100);

      debouncedFn();
      setTimeout(() => debouncedFn(), 50);
      setTimeout(() => debouncedFn(), 80);

      await new Promise(resolve => setTimeout(resolve, 200));
      expect(callCount).toBe(1);
    });
  });

  describe('Deep Clone', () => {
    it('should create independent copies of objects', () => {
      const original = {
        name: 'test',
        nested: { value: 42 },
        array: [1, 2, 3]
      };

      const cloned = utils.deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.nested).not.toBe(original.nested);
    });

    it('should handle null and primitive values', () => {
      expect(utils.deepClone(null)).toBe(null);
      expect(utils.deepClone(42)).toBe(42);
      expect(utils.deepClone('string')).toBe('string');
    });
  });

  describe('isEmpty Check', () => {
    it('should identify empty values correctly', () => {
      expect(utils.isEmpty(null)).toBe(true);
      expect(utils.isEmpty(undefined)).toBe(true);
      expect(utils.isEmpty('')).toBe(true);
      expect(utils.isEmpty([])).toBe(true);
      expect(utils.isEmpty({})).toBe(true);
    });

    it('should identify non-empty values correctly', () => {
      expect(utils.isEmpty('text')).toBe(false);
      expect(utils.isEmpty([1])).toBe(false);
      expect(utils.isEmpty({ key: 'value' })).toBe(false);
      expect(utils.isEmpty(0)).toBe(false);
      expect(utils.isEmpty(false)).toBe(false);
    });
  });

  describe('Nested Property Access', () => {
    it('should retrieve nested properties', () => {
      const obj = {
        user: {
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark'
            }
          }
        }
      };

      expect(utils.getNestedProperty(obj, 'user.profile.name')).toBe('John Doe');
      expect(utils.getNestedProperty(obj, 'user.profile.settings.theme')).toBe('dark');
    });

    it('should handle missing properties gracefully', () => {
      const obj = { user: { name: 'John' } };

      expect(utils.getNestedProperty(obj, 'user.age')).toBeUndefined();
      expect(utils.getNestedProperty(obj, 'user.profile.settings')).toBeUndefined();
      expect(utils.getNestedProperty(null, 'any.path')).toBeUndefined();
    });

    it('should handle single-level properties', () => {
      const obj = { name: 'test', value: 42 };

      expect(utils.getNestedProperty(obj, 'name')).toBe('test');
      expect(utils.getNestedProperty(obj, 'value')).toBe(42);
    });
  });
});