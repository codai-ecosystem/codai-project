/**
 * @file Citation Tool Tests
 * @description Comprehensive tests for the citation tool implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CitationTool } from '../tools/citations.js';
import { CautaiConfig } from '../config.js';

describe('CitationTool', () => {
  let citationTool: CitationTool;
  let mockConfig: CautaiConfig;

  beforeEach(() => {
    mockConfig = {
      maxResults: 10,
      defaultLanguage: 'en' as const,
      enableSnippets: true,
      enableCitations: true,
    } as CautaiConfig;
    
    citationTool = new CitationTool(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Citation Generation', () => {
    it('should generate APA citations by default', async () => {
      const args = {
        urls: ['https://example.com/article1', 'https://example.org/article2']
      };

      const result = await citationTool.execute(args);

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult).toHaveProperty('format', 'apa');
      expect(parsedResult).toHaveProperty('citations');
      expect(parsedResult).toHaveProperty('totalCitations', 2);
      expect(parsedResult.citations).toHaveLength(2);
    });

    it('should generate MLA format citations when specified', async () => {
      const args = {
        urls: ['https://example.com/article'],
        format: 'mla'
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.format).toBe('mla');
      expect(parsedResult.citations[0]).toContain('Author, First.');
      expect(parsedResult.citations[0]).toContain('Accessed');
    });

    it('should generate Chicago format citations when specified', async () => {
      const args = {
        urls: ['https://example.com/article'],
        format: 'chicago'
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.format).toBe('chicago');
      expect(parsedResult.citations[0]).toContain('Author, First.');
      expect(parsedResult.citations[0]).toContain('Accessed');
    });

    it('should generate IEEE format citations when specified', async () => {
      const args = {
        urls: ['https://example.com/article'],
        format: 'ieee'
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.format).toBe('ieee');
      expect(parsedResult.citations[0]).toContain('[Online]');
      expect(parsedResult.citations[0]).toContain('[Accessed:');
    });

    it('should handle case insensitive format parameters', async () => {
      const args = {
        urls: ['https://example.com/article'],
        format: 'APA'
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.format).toBe('APA');
      expect(parsedResult.citations[0]).toContain('Author, A.');
    });

    it('should use default format for unknown citation styles', async () => {
      const args = {
        urls: ['https://example.com/article'],
        format: 'unknown-format'
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.format).toBe('unknown-format');
      expect(parsedResult.citations[0]).toContain('example.com');
      expect(parsedResult.citations[0]).toContain('accessed');
    });
  });

  describe('URL Processing', () => {
    it('should handle multiple URLs correctly', async () => {
      const urls = [
        'https://example.com/article1',
        'https://example.org/article2',
        'https://test.net/resource3'
      ];
      const args = { urls };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.totalCitations).toBe(3);
      expect(parsedResult.citations).toHaveLength(3);
      expect(parsedResult.citations[0]).toContain('example.com');
      expect(parsedResult.citations[1]).toContain('example.org');
      expect(parsedResult.citations[2]).toContain('test.net');
    });

    it('should extract domain names correctly', async () => {
      const args = {
        urls: ['https://www.github.com/user/repo']
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.citations[0]).toContain('www.github.com');
    });

    it('should handle URLs with paths and parameters', async () => {
      const args = {
        urls: ['https://example.com/path/to/article?param=value&other=123']
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.citations[0]).toContain('example.com');
      expect(parsedResult.citations[0]).toContain('https://example.com/path/to/article?param=value&other=123');
    });

    it('should handle malformed URLs gracefully', async () => {
      const args = {
        urls: ['not-a-url', 'also-invalid']
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.citations[0]).toContain('unknown-domain');
      expect(parsedResult.citations[1]).toContain('unknown-domain');
    });
  });

  describe('Date Handling', () => {
    it('should include current access date in citations', async () => {
      const args = {
        urls: ['https://example.com/article']
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      const currentYear = new Date().getFullYear();
      expect(parsedResult.citations[0]).toContain(currentYear.toString());
    });

    it('should format dates appropriately for each citation style', async () => {
      const testCases = [
        { format: 'apa', expectedPattern: /Retrieved \d{1,2}\/\d{1,2}\/\d{4}/ },
        { format: 'mla', expectedPattern: /Accessed \d{1,2}\/\d{1,2}\/\d{4}/ },
        { format: 'chicago', expectedPattern: /Accessed \d{1,2}\/\d{1,2}\/\d{4}/ },
        { format: 'ieee', expectedPattern: /\[Accessed: \d{1,2}\/\d{1,2}\/\d{4}\]/ },
      ];

      for (const testCase of testCases) {
        const args = {
          urls: ['https://example.com/article'],
          format: testCase.format
        };

        const result = await citationTool.execute(args);
        const parsedResult = JSON.parse(result.content[0].text);
        
        expect(parsedResult.citations[0]).toMatch(testCase.expectedPattern);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty URL array', async () => {
      const args = {
        urls: []
      };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.totalCitations).toBe(0);
      expect(parsedResult.citations).toHaveLength(0);
    });

    it('should handle missing urls parameter gracefully', async () => {
      const args = {};

      const result = await citationTool.execute(args);
      
      // Should handle undefined urls
      expect(result.content[0].text).toContain('Error generating citations:');
    });

    it('should handle null URLs in array', async () => {
      const args = {
        urls: ['https://example.com', null, 'https://test.com'] as any
      };

      const result = await citationTool.execute(args);
      
      // Should handle gracefully without crashing
      expect(result).toHaveProperty('content');
    });

    it('should provide meaningful error messages', async () => {
      // Mock the private generateCitations method to throw an error
      const originalMethod = (citationTool as any).generateCitations;
      (citationTool as any).generateCitations = vi.fn().mockRejectedValue(new Error('Citation service unavailable'));

      const args = {
        urls: ['https://example.com']
      };

      const result = await citationTool.execute(args);
      
      expect(result.content[0].text).toContain('Error generating citations: Citation service unavailable');
      
      // Restore original method
      (citationTool as any).generateCitations = originalMethod;
    });
  });

  describe('Citation Format Validation', () => {
    const testUrls = ['https://example.com/test-article'];

    it('should include all required APA elements', async () => {
      const args = { urls: testUrls, format: 'apa' };
      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      const citation = parsedResult.citations[0];
      expect(citation).toContain('Author, A.');
      expect(citation).toContain('(2024)');
      expect(citation).toContain('example.com');
      expect(citation).toContain('Retrieved');
      expect(citation).toContain('https://example.com/test-article');
    });

    it('should include all required MLA elements', async () => {
      const args = { urls: testUrls, format: 'mla' };
      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      const citation = parsedResult.citations[0];
      expect(citation).toContain('Author, First.');
      expect(citation).toContain('example.com');
      expect(citation).toContain('Accessed');
      expect(citation).toContain('https://example.com/test-article');
    });

    it('should include all required Chicago elements', async () => {
      const args = { urls: testUrls, format: 'chicago' };
      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      const citation = parsedResult.citations[0];
      expect(citation).toContain('Author, First.');
      expect(citation).toContain('example.com');
      expect(citation).toContain('Accessed');
      expect(citation).toContain('https://example.com/test-article');
    });

    it('should include all required IEEE elements', async () => {
      const args = { urls: testUrls, format: 'ieee' };
      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      const citation = parsedResult.citations[0];
      expect(citation).toContain('Author');
      expect(citation).toContain('[Online]');
      expect(citation).toContain('Available:');
      expect(citation).toContain('[Accessed:');
      expect(citation).toContain('https://example.com/test-article');
    });
  });

  describe('Output Structure Validation', () => {
    it('should return consistent output structure', async () => {
      const args = {
        urls: ['https://example.com/article'],
        format: 'apa'
      };

      const result = await citationTool.execute(args);
      
      expect(result).toMatchObject({
        content: expect.arrayContaining([
          expect.objectContaining({
            type: 'text',
            text: expect.any(String)
          })
        ])
      });
    });

    it('should return valid JSON in content text', async () => {
      const args = {
        urls: ['https://example.com/article1', 'https://example.com/article2'],
        format: 'mla'
      };

      const result = await citationTool.execute(args);
      
      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult).toHaveProperty('format');
      expect(parsedResult).toHaveProperty('citations');
      expect(parsedResult).toHaveProperty('totalCitations');
    });

    it('should maintain totalCitations consistency', async () => {
      const urls = ['https://site1.com', 'https://site2.com', 'https://site3.com'];
      const args = { urls };

      const result = await citationTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.totalCitations).toBe(parsedResult.citations.length);
      expect(parsedResult.totalCitations).toBe(urls.length);
    });
  });
});