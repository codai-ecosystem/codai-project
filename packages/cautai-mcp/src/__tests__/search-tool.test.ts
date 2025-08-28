/**
 * @file Search Tool Tests
 * @description Comprehensive tests for the search tool implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SearchTool } from '../tools/search.js';
import { CautaiConfig } from '../config.js';
import { SearchOptions, SearchResult } from '../types.js';

describe('SearchTool', () => {
  let searchTool: SearchTool;
  let mockConfig: CautaiConfig;

  beforeEach(() => {
    mockConfig = {
      maxResults: 10,
      defaultLanguage: 'en' as const,
      enableSnippets: true,
      enableCitations: true,
    } as CautaiConfig;
    
    searchTool = new SearchTool(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Search Execution', () => {
    it('should handle basic web search with default parameters', async () => {
      const args = {
        query: 'test search query'
      };

      const result = await searchTool.execute(args);

      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult).toHaveProperty('query', 'test search query');
      expect(parsedResult).toHaveProperty('results');
      expect(parsedResult).toHaveProperty('totalResults');
      expect(parsedResult).toHaveProperty('language', 'en');
    });

    it('should respect custom maxResults parameter', async () => {
      const args = {
        query: 'test query',
        maxResults: 1
      };

      const result = await searchTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.results).toHaveLength(1);
      expect(parsedResult.totalResults).toBe(1);
    });

    it('should handle custom language parameter', async () => {
      const args = {
        query: 'test query',
        language: 'ro'
      };

      const result = await searchTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.language).toBe('ro');
      expect(parsedResult.results[0].language).toBe('ro');
    });

    it('should return properly formatted search results', async () => {
      const args = {
        query: 'formatting test'
      };

      const result = await searchTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.results).toBeInstanceOf(Array);
      expect(parsedResult.results[0]).toHaveProperty('id');
      expect(parsedResult.results[0]).toHaveProperty('title');
      expect(parsedResult.results[0]).toHaveProperty('url');
      expect(parsedResult.results[0]).toHaveProperty('snippet');
      expect(parsedResult.results[0]).toHaveProperty('relevanceScore');
      expect(parsedResult.results[0]).toHaveProperty('domain');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing query parameter gracefully', async () => {
      const args = {};

      const result = await searchTool.execute(args);
      
      expect(result.content[0].text).not.toContain('Error searching:');
      // Should still work with undefined query, converted to string
    });

    it('should handle invalid maxResults parameter', async () => {
      const args = {
        query: 'test',
        maxResults: 'invalid' as any
      };

      const result = await searchTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      // Should fallback to config default
      expect(parsedResult.totalResults).toBeLessThanOrEqual(mockConfig.maxResults);
    });

    it('should handle search errors and return error message', async () => {
      // Mock the private searchWeb method to throw an error
      const originalSearchWeb = (searchTool as any).searchWeb;
      (searchTool as any).searchWeb = vi.fn().mockRejectedValue(new Error('Search service unavailable'));

      const args = {
        query: 'test query'
      };

      const result = await searchTool.execute(args);
      
      expect(result.content[0].text).toContain('Error searching: Search service unavailable');
      
      // Restore original method
      (searchTool as any).searchWeb = originalSearchWeb;
    });
  });

  describe('Configuration Integration', () => {
    it('should use config maxResults when not specified in args', async () => {
      const customConfig = {
        ...mockConfig,
        maxResults: 5
      };
      const customSearchTool = new SearchTool(customConfig);

      const args = {
        query: 'config test'
      };

      const result = await customSearchTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.results).toHaveLength(2); // Mock returns 2, limited by slice
    });

    it('should use config defaultLanguage when not specified in args', async () => {
      const customConfig = {
        ...mockConfig,
        defaultLanguage: 'ro' as const
      };
      const customSearchTool = new SearchTool(customConfig);

      const args = {
        query: 'language test'
      };

      const result = await customSearchTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      expect(parsedResult.language).toBe('ro');
    });
  });

  describe('Result Structure Validation', () => {
    it('should return results with all required SearchResult fields', async () => {
      const args = {
        query: 'structure validation test'
      };

      const result = await searchTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      parsedResult.results.forEach((searchResult: SearchResult) => {
        expect(searchResult).toHaveProperty('id');
        expect(searchResult).toHaveProperty('title');
        expect(searchResult).toHaveProperty('url');
        expect(searchResult).toHaveProperty('snippet');
        expect(searchResult).toHaveProperty('language');
        expect(searchResult).toHaveProperty('relevanceScore');
        expect(searchResult).toHaveProperty('domain');
        
        expect(typeof searchResult.id).toBe('string');
        expect(typeof searchResult.title).toBe('string');
        expect(typeof searchResult.url).toBe('string');
        expect(typeof searchResult.snippet).toBe('string');
        expect(typeof searchResult.language).toBe('string');
        expect(typeof searchResult.relevanceScore).toBe('number');
        expect(typeof searchResult.domain).toBe('string');
      });
    });

    it('should return relevance scores within valid range', async () => {
      const args = {
        query: 'relevance test'
      };

      const result = await searchTool.execute(args);
      const parsedResult = JSON.parse(result.content[0].text);
      
      parsedResult.results.forEach((searchResult: SearchResult) => {
        expect(searchResult.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(searchResult.relevanceScore).toBeLessThanOrEqual(1);
      });
    });
  });
});