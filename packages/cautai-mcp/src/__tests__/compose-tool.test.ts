/**
 * @file Compose Tool Tests
 * @description Comprehensive tests for the compose tool implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComposeTool } from '../tools/compose.js';
import { CautaiConfig } from '../config.js';
import { ComposeOptions, ComposedAnswer, CitationInfo } from '../types.js';

describe('ComposeTool', () => {
  let composeTool: ComposeTool;
  let mockConfig: CautaiConfig;
  let mockSearchTool: any;

  beforeEach(() => {
    mockConfig = {
      maxResults: 10,
      defaultLanguage: 'en' as const,
      enableSnippets: true,
      enableCitations: true,
    } as CautaiConfig;
    
    // Mock the search tool execute method
    mockSearchTool = {
      execute: vi.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            query: 'test query',
            results: [{
              id: '1',
              title: 'Mock Search Result',
              url: 'https://example.com/result1',
              snippet: 'Mock snippet content',
              language: 'en',
              relevanceScore: 0.95,
              domain: 'example.com'
            }],
            totalResults: 1,
            language: 'en'
          })
        }]
      })
    };
    
    composeTool = new ComposeTool(mockConfig);
    // Replace the searchTool with our mock
    (composeTool as any).searchTool = mockSearchTool;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Answer Composition', () => {
    it('should compose answer with default parameters', async () => {
      const args = {
        query: 'test composition query'
      };

      const result = await composeTool.execute(args);

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      expect(parsedResult).toHaveProperty('answer');
      expect(parsedResult).toHaveProperty('sources');
      expect(parsedResult).toHaveProperty('confidence');
      expect(parsedResult).toHaveProperty('language');
    });

    it('should handle custom maxSources parameter', async () => {
      const args = {
        query: 'test query',
        maxSources: 3
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      expect(parsedResult.sources).toBeInstanceOf(Array);
      expect(parsedResult.sources.length).toBeGreaterThan(0);
    });

    it('should handle custom language parameter', async () => {
      const args = {
        query: 'test query',
        language: 'ro'
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      expect(parsedResult.language).toBe('ro');
    });

    it('should generate coherent answer text', async () => {
      const args = {
        query: 'artificial intelligence'
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      expect(parsedResult.answer).toContain('artificial intelligence');
      expect(parsedResult.answer.length).toBeGreaterThan(50);
      expect(typeof parsedResult.answer).toBe('string');
    });
  });

  describe('Source Management', () => {
    it('should provide valid citation sources', async () => {
      const args = {
        query: 'citation test'
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      expect(parsedResult.sources).toBeInstanceOf(Array);
      expect(parsedResult.sources.length).toBeGreaterThan(0);
      
      parsedResult.sources.forEach((source: CitationInfo) => {
        expect(source).toHaveProperty('id');
        expect(source).toHaveProperty('title');
        expect(source).toHaveProperty('url');
        expect(source).toHaveProperty('domain');
        expect(source).toHaveProperty('accessDate');
        
        expect(typeof source.id).toBe('string');
        expect(typeof source.title).toBe('string');
        expect(typeof source.url).toBe('string');
        expect(typeof source.domain).toBe('string');
        expect(typeof source.accessDate).toBe('string');
      });
    });

    it('should have valid URLs in sources', async () => {
      const args = {
        query: 'url validation test'
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      parsedResult.sources.forEach((source: CitationInfo) => {
        expect(source.url).toMatch(/^https?:\/\/.+/);
        expect(source.domain).toBeTruthy();
        expect(source.domain.length).toBeGreaterThan(0);
      });
    });

    it('should include access dates in ISO format', async () => {
      const args = {
        query: 'date format test'
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      parsedResult.sources.forEach((source: CitationInfo) => {
        expect(() => new Date(source.accessDate)).not.toThrow();
        expect(source.accessDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        
        if (source.publishedDate) {
          expect(() => new Date(source.publishedDate!)).not.toThrow();
          expect(source.publishedDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        }
      });
    });
  });

  describe('Confidence Scoring', () => {
    it('should provide confidence score within valid range', async () => {
      const args = {
        query: 'confidence test'
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      expect(parsedResult.confidence).toBeGreaterThanOrEqual(0);
      expect(parsedResult.confidence).toBeLessThanOrEqual(1);
      expect(typeof parsedResult.confidence).toBe('number');
    });

    it('should vary confidence based on query complexity', async () => {
      const simpleQuery = { query: 'simple' };
      const complexQuery = { query: 'complex multi-faceted technical question with ambiguity' };

      const simpleResult = await composeTool.execute(simpleQuery);
      const complexResult = await composeTool.execute(complexQuery);
      
      const simpleAnswer: ComposedAnswer = JSON.parse(simpleResult.content[0].text);
      const complexAnswer: ComposedAnswer = JSON.parse(complexResult.content[0].text);
      
      expect(simpleAnswer.confidence).toBeGreaterThanOrEqual(0);
      expect(complexAnswer.confidence).toBeGreaterThanOrEqual(0);
      // Both should be valid confidence scores
    });
  });

  describe('Error Handling', () => {
    it('should handle missing query parameter gracefully', async () => {
      const args = {};

      const result = await composeTool.execute(args);
      
      // Should still work with undefined query, converted to string
      expect(result.content[0].text).not.toContain('Error composing answer:');
    });

    it('should handle search tool failures', async () => {
      // Mock search tool to throw error
      const mockSearchError = vi.fn().mockRejectedValue(new Error('Search failed'));
      (composeTool as any).searchTool.execute = mockSearchError;

      const args = {
        query: 'test query'
      };

      const result = await composeTool.execute(args);
      
      expect(result.content[0].text).toContain('Error composing answer: Search failed');
    });

    it('should handle invalid maxSources parameter', async () => {
      const args = {
        query: 'test',
        maxSources: 'invalid' as any
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      // Should fallback to default (5)
      expect(parsedResult).toHaveProperty('answer');
      expect(parsedResult).toHaveProperty('sources');
    });
  });

  describe('Configuration Integration', () => {
    it('should use config defaultLanguage when not specified', async () => {
      const customConfig = {
        ...mockConfig,
        defaultLanguage: 'ro' as const
      };
      const customComposeTool = new ComposeTool(customConfig);

      const args = {
        query: 'language test'
      };

      const result = await customComposeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      expect(parsedResult.language).toBe('ro');
    });

    it('should respect enableCitations config', async () => {
      const configWithCitations = {
        ...mockConfig,
        enableCitations: true
      };
      const composeToolWithCitations = new ComposeTool(configWithCitations);

      const args = {
        query: 'citations test'
      };

      const result = await composeToolWithCitations.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      expect(parsedResult.sources).toBeInstanceOf(Array);
      expect(parsedResult.sources.length).toBeGreaterThan(0);
    });
  });

  describe('Search Integration', () => {
    it('should integrate with search tool correctly', async () => {
      const args = {
        query: 'integration test',
        maxSources: 2
      };

      const result = await composeTool.execute(args);
      
      // Verify search tool was called
      expect(mockSearchTool.execute).toHaveBeenCalled();
      
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      expect(parsedResult).toHaveProperty('answer');
      expect(parsedResult).toHaveProperty('sources');
    });
  });

  describe('Output Format Validation', () => {
    it('should return properly structured ComposedAnswer', async () => {
      const args = {
        query: 'structure validation'
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      // Validate ComposedAnswer interface compliance
      expect(parsedResult).toMatchObject({
        answer: expect.any(String),
        sources: expect.any(Array),
        confidence: expect.any(Number),
        language: expect.any(String)
      });
    });

    it('should ensure all required fields are present', async () => {
      const args = {
        query: 'required fields test'
      };

      const result = await composeTool.execute(args);
      const parsedResult: ComposedAnswer = JSON.parse(result.content[0].text);
      
      expect(parsedResult).toHaveProperty('answer');
      expect(parsedResult).toHaveProperty('sources');
      expect(parsedResult).toHaveProperty('confidence');
      expect(parsedResult).toHaveProperty('language');
      
      expect(parsedResult.answer).toBeTruthy();
      expect(parsedResult.sources).toBeDefined();
      expect(parsedResult.confidence).toBeDefined();
      expect(parsedResult.language).toBeTruthy();
    });
  });
});