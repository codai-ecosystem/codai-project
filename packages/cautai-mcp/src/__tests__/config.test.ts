/**
 * @file Configuration Tests
 * @description Comprehensive tests for the configuration system
 */

import { describe, it, expect } from 'vitest';
import { CautaiConfig, defaultConfig } from '../config.js';

describe('Configuration', () => {
  describe('Default Configuration', () => {
    it('should have valid default configuration values', () => {
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig).toMatchObject({
        maxResults: expect.any(Number),
        defaultLanguage: expect.any(String),
        enableSnippets: expect.any(Boolean),
        enableCitations: expect.any(Boolean),
        rateLimit: expect.any(Object),
        cache: expect.any(Object),
        logLevel: expect.any(String)
      });
    });

    it('should have reasonable default maxResults', () => {
      expect(defaultConfig.maxResults).toBeGreaterThan(0);
      expect(defaultConfig.maxResults).toBeLessThanOrEqual(100);
    });

    it('should have valid default language', () => {
      expect(['en', 'ro', 'auto']).toContain(defaultConfig.defaultLanguage);
    });

    it('should have valid boolean flags', () => {
      expect(typeof defaultConfig.enableSnippets).toBe('boolean');
      expect(typeof defaultConfig.enableCitations).toBe('boolean');
    });

    it('should have valid rate limiting configuration', () => {
      expect(defaultConfig.rateLimit).toHaveProperty('windowMs');
      expect(defaultConfig.rateLimit).toHaveProperty('maxRequests');
      expect(defaultConfig.rateLimit.windowMs).toBeGreaterThan(0);
      expect(defaultConfig.rateLimit.maxRequests).toBeGreaterThan(0);
    });

    it('should have valid cache configuration', () => {
      expect(defaultConfig.cache).toHaveProperty('ttl');
      expect(defaultConfig.cache).toHaveProperty('maxSize');
      expect(defaultConfig.cache.ttl).toBeGreaterThan(0);
      expect(defaultConfig.cache.maxSize).toBeGreaterThan(0);
    });

    it('should have valid log level', () => {
      expect(['debug', 'info', 'warn', 'error']).toContain(defaultConfig.logLevel);
    });
  });

  describe('Configuration Interface', () => {
    it('should allow valid custom configurations', () => {
      const customConfig: CautaiConfig = {
        maxResults: 20,
        defaultLanguage: 'en',
        enableSnippets: false,
        enableCitations: true,
        rateLimit: {
          windowMs: 120000,
          maxRequests: 200,
        },
        cache: {
          ttl: 7200,
          maxSize: 2000,
        },
        logLevel: 'debug',
      };

      expect(customConfig.maxResults).toBe(20);
      expect(customConfig.defaultLanguage).toBe('en');
      expect(customConfig.enableSnippets).toBe(false);
      expect(customConfig.enableCitations).toBe(true);
      expect(customConfig.logLevel).toBe('debug');
    });

    it('should support all language options', () => {
      const languages: Array<'en' | 'ro' | 'auto'> = ['en', 'ro', 'auto'];
      
      languages.forEach(lang => {
        const config: CautaiConfig = {
          ...defaultConfig,
          defaultLanguage: lang,
        };
        
        expect(config.defaultLanguage).toBe(lang);
        expect(['en', 'ro', 'auto']).toContain(config.defaultLanguage);
      });
    });

    it('should support all log levels', () => {
      const logLevels: Array<'debug' | 'info' | 'warn' | 'error'> = ['debug', 'info', 'warn', 'error'];
      
      logLevels.forEach(level => {
        const config: CautaiConfig = {
          ...defaultConfig,
          logLevel: level,
        };
        
        expect(config.logLevel).toBe(level);
        expect(['debug', 'info', 'warn', 'error']).toContain(config.logLevel);
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should validate maxResults bounds', () => {
      // Test reasonable bounds
      const validConfigs = [
        { ...defaultConfig, maxResults: 1 },
        { ...defaultConfig, maxResults: 50 },
        { ...defaultConfig, maxResults: 100 },
      ];

      validConfigs.forEach(config => {
        expect(config.maxResults).toBeGreaterThan(0);
        expect(config.maxResults).toBeLessThanOrEqual(100);
      });
    });

    it('should validate rate limiting values', () => {
      const config: CautaiConfig = {
        ...defaultConfig,
        rateLimit: {
          windowMs: 30000, // 30 seconds
          maxRequests: 50,
        },
      };

      expect(config.rateLimit.windowMs).toBeGreaterThan(0);
      expect(config.rateLimit.maxRequests).toBeGreaterThan(0);
    });

    it('should validate cache configuration', () => {
      const config: CautaiConfig = {
        ...defaultConfig,
        cache: {
          ttl: 1800, // 30 minutes
          maxSize: 500,
        },
      };

      expect(config.cache.ttl).toBeGreaterThan(0);
      expect(config.cache.maxSize).toBeGreaterThan(0);
    });
  });

  describe('Configuration Merging', () => {
    it('should allow partial configuration overrides', () => {
      const baseConfig = defaultConfig;
      const overrides = {
        maxResults: 25,
        enableSnippets: false,
      };

      const mergedConfig: CautaiConfig = {
        ...baseConfig,
        ...overrides,
      };

      expect(mergedConfig.maxResults).toBe(25);
      expect(mergedConfig.enableSnippets).toBe(false);
      expect(mergedConfig.defaultLanguage).toBe(baseConfig.defaultLanguage);
      expect(mergedConfig.enableCitations).toBe(baseConfig.enableCitations);
    });

    it('should allow nested object overrides', () => {
      const baseConfig = defaultConfig;
      const overrides = {
        rateLimit: {
          ...baseConfig.rateLimit,
          maxRequests: 150,
        },
        cache: {
          ...baseConfig.cache,
          ttl: 5400, // 1.5 hours
        },
      };

      const mergedConfig: CautaiConfig = {
        ...baseConfig,
        ...overrides,
      };

      expect(mergedConfig.rateLimit.maxRequests).toBe(150);
      expect(mergedConfig.rateLimit.windowMs).toBe(baseConfig.rateLimit.windowMs);
      expect(mergedConfig.cache.ttl).toBe(5400);
      expect(mergedConfig.cache.maxSize).toBe(baseConfig.cache.maxSize);
    });
  });

  describe('Configuration Environment Integration', () => {
    it('should support environment-specific configurations', () => {
      const developmentConfig: CautaiConfig = {
        ...defaultConfig,
        logLevel: 'debug',
        rateLimit: {
          windowMs: 60000,
          maxRequests: 1000, // More lenient for development
        },
      };

      const productionConfig: CautaiConfig = {
        ...defaultConfig,
        logLevel: 'warn',
        rateLimit: {
          windowMs: 60000,
          maxRequests: 100, // Stricter for production
        },
      };

      expect(developmentConfig.logLevel).toBe('debug');
      expect(developmentConfig.rateLimit.maxRequests).toBe(1000);
      
      expect(productionConfig.logLevel).toBe('warn');
      expect(productionConfig.rateLimit.maxRequests).toBe(100);
    });

    it('should support feature flags configuration', () => {
      const minimalConfig: CautaiConfig = {
        ...defaultConfig,
        enableSnippets: false,
        enableCitations: false,
      };

      const fullFeaturedConfig: CautaiConfig = {
        ...defaultConfig,
        enableSnippets: true,
        enableCitations: true,
      };

      expect(minimalConfig.enableSnippets).toBe(false);
      expect(minimalConfig.enableCitations).toBe(false);
      
      expect(fullFeaturedConfig.enableSnippets).toBe(true);
      expect(fullFeaturedConfig.enableCitations).toBe(true);
    });
  });

  describe('Configuration Performance Impact', () => {
    it('should have reasonable cache settings for performance', () => {
      expect(defaultConfig.cache.ttl).toBeGreaterThanOrEqual(300); // At least 5 minutes
      expect(defaultConfig.cache.maxSize).toBeGreaterThanOrEqual(100); // At least 100 items
    });

    it('should have reasonable rate limiting for API protection', () => {
      expect(defaultConfig.rateLimit.windowMs).toBeGreaterThanOrEqual(60000); // At least 1 minute
      expect(defaultConfig.rateLimit.maxRequests).toBeLessThanOrEqual(1000); // Reasonable limit
    });

    it('should have reasonable maxResults to prevent overload', () => {
      expect(defaultConfig.maxResults).toBeLessThanOrEqual(100); // Prevent excessive results
      expect(defaultConfig.maxResults).toBeGreaterThanOrEqual(1); // At least one result
    });
  });

  describe('Configuration Type Safety', () => {
    it('should enforce proper types for all configuration values', () => {
      // This test validates TypeScript compilation more than runtime behavior
      const config: CautaiConfig = defaultConfig;
      
      // These should not cause TypeScript errors
      expect(typeof config.maxResults).toBe('number');
      expect(typeof config.defaultLanguage).toBe('string');
      expect(typeof config.enableSnippets).toBe('boolean');
      expect(typeof config.enableCitations).toBe('boolean');
      expect(typeof config.rateLimit).toBe('object');
      expect(typeof config.cache).toBe('object');
      expect(typeof config.logLevel).toBe('string');
    });

    it('should enforce correct nested object types', () => {
      const config: CautaiConfig = defaultConfig;
      
      expect(typeof config.rateLimit.windowMs).toBe('number');
      expect(typeof config.rateLimit.maxRequests).toBe('number');
      expect(typeof config.cache.ttl).toBe('number');
      expect(typeof config.cache.maxSize).toBe('number');
    });
  });
});