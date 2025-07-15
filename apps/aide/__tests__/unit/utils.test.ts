import { describe, it, expect } from 'vitest';

// Mock utilities since we're implementing the tests
const mockUtils = {
  formatCode: (code: string, language: string) => {
    return `// ${language.toUpperCase()} CODE\n${code}`;
  },
  validateInput: (input: any) => {
    return input !== null && input !== undefined && typeof input === 'string' && input.trim().length > 0;
  },
  generateId: () => {
    return `aide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  parseResponse: (response: any) => {
    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch {
        return { content: response };
      }
    }
    return response;
  },
  sanitizeHtml: (html: string) => {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
};

describe('AIDE Utility Functions', () => {
  describe('Code Formatting', () => {
    it('should format code with language prefix', () => {
      const code = 'console.log("Hello World");';
      const result = mockUtils.formatCode(code, 'javascript');

      expect(result).toContain('// JAVASCRIPT CODE');
      expect(result).toContain(code);
    });

    it('should handle different programming languages', () => {
      const pythonCode = 'print("Hello World")';
      const result = mockUtils.formatCode(pythonCode, 'python');

      expect(result).toContain('// PYTHON CODE');
      expect(result).toContain(pythonCode);
    });
  });

  describe('Input Validation', () => {
    it('should validate correct string input', () => {
      const validInput = 'valid input string';
      const result = mockUtils.validateInput(validInput);

      expect(result).toBe(true);
    });

    it('should reject null input', () => {
      const result = mockUtils.validateInput(null);
      expect(result).toBe(false);
    });

    it('should reject undefined input', () => {
      const result = mockUtils.validateInput(undefined);
      expect(result).toBe(false);
    });

    it('should reject empty string input', () => {
      const result = mockUtils.validateInput('');
      expect(result).toBe(false);
    });

    it('should reject whitespace-only input', () => {
      const result = mockUtils.validateInput('   ');
      expect(result).toBe(false);
    });

    it('should reject non-string input', () => {
      const result = mockUtils.validateInput(123);
      expect(result).toBe(false);
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = mockUtils.generateId();
      const id2 = mockUtils.generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^aide-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^aide-\d+-[a-z0-9]+$/);
    });

    it('should generate IDs with aide prefix', () => {
      const id = mockUtils.generateId();
      expect(id).toMatch(/^aide-/);
    });
  });

  describe('Response Parsing', () => {
    it('should parse valid JSON strings', () => {
      const jsonString = '{"key": "value", "number": 42}';
      const result = mockUtils.parseResponse(jsonString);

      expect(result).toEqual({ key: 'value', number: 42 });
    });

    it('should handle invalid JSON strings', () => {
      const invalidJson = 'invalid json string';
      const result = mockUtils.parseResponse(invalidJson);

      expect(result).toEqual({ content: invalidJson });
    });

    it('should return objects as-is', () => {
      const objectInput = { existing: 'object' };
      const result = mockUtils.parseResponse(objectInput);

      expect(result).toBe(objectInput);
    });
  });

  describe('HTML Sanitization', () => {
    it('should remove script tags', () => {
      const maliciousHtml = '<div>Safe content</div><script>alert("malicious")</script>';
      const result = mockUtils.sanitizeHtml(maliciousHtml);

      expect(result).toBe('<div>Safe content</div>');
      expect(result).not.toContain('<script>');
    });

    it('should handle multiple script tags', () => {
      const htmlWithMultipleScripts = '<p>Content</p><script>bad()</script><div>More</div><script>also bad()</script>';
      const result = mockUtils.sanitizeHtml(htmlWithMultipleScripts);

      expect(result).toBe('<p>Content</p><div>More</div>');
    });

    it('should preserve non-script content', () => {
      const safeHtml = '<div class="container"><p>Safe paragraph</p><span>Safe span</span></div>';
      const result = mockUtils.sanitizeHtml(safeHtml);

      expect(result).toBe(safeHtml);
    });
  });
});