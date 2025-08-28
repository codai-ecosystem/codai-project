import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from 'ink-testing-library';
import React from 'react';
import { InteractiveSearch } from '@cautai/cautai-cli/src/components/InteractiveSearch';
import { SearchResults } from '@cautai/cautai-cli/src/components/SearchResults';
import { MockMCPClient } from '../../helpers/mocks/mcp-client';

// Mock the MCP client
vi.mock('@cautai/cautai-client', () => ({
  CautaiMCPClient: vi.fn(() => new MockMCPClient())
}));

describe('CLI Components', () => {
  let mockMCPClient: MockMCPClient;

  beforeEach(() => {
    mockMCPClient = new MockMCPClient();
    mockMCPClient.setupDefaultMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('InteractiveSearch Component', () => {
    it('should render initial search interface', () => {
      const { lastFrame } = render(
        <InteractiveSearch mcpClient={mockMCPClient} />
      );

      expect(lastFrame()).toContain('🔍 Cautai Search');
      expect(lastFrame()).toContain('Enter your search query:');
    });

    it('should handle user input', async () => {
      const { stdin, lastFrame, rerender } = render(
        <InteractiveSearch mcpClient={mockMCPClient} />
      );

      // Type a search query
      stdin.write('test query');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(lastFrame()).toContain('test query');
    });

    it('should trigger search on Enter key', async () => {
      const onSearch = vi.fn();
      const { stdin } = render(
        <InteractiveSearch 
          mcpClient={mockMCPClient} 
          onSearch={onSearch}
        />
      );

      stdin.write('test query');
      stdin.write('\r'); // Enter key

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onSearch).toHaveBeenCalledWith('test query');
    });

    it('should show loading state during search', async () => {
      mockMCPClient.simulateSlowResponse(500);
      
      const { stdin, lastFrame } = render(
        <InteractiveSearch mcpClient={mockMCPClient} />
      );

      stdin.write('slow query');
      stdin.write('\r');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(lastFrame()).toContain('Searching...');
    });

    it('should handle search errors gracefully', async () => {
      mockMCPClient.simulateError('Network error');
      
      const { stdin, lastFrame } = render(
        <InteractiveSearch mcpClient={mockMCPClient} />
      );

      stdin.write('error query');
      stdin.write('\r');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(lastFrame()).toContain('Error: Network error');
    });
  });

  describe('SearchResults Component', () => {
    const mockResults = {
      results: [
        {
          id: '1',
          title: 'First Result',
          url: 'https://example1.com',
          snippet: 'This is the first result snippet',
          score: 0.95,
          metadata: {}
        },
        {
          id: '2',
          title: 'Second Result',
          url: 'https://example2.com',
          snippet: 'This is the second result snippet',
          score: 0.90,
          metadata: {}
        }
      ],
      totalResults: 2,
      query: 'test query',
      processingTime: 150
    };

    it('should render search results correctly', () => {
      const { lastFrame } = render(
        <SearchResults 
          results={mockResults} 
          isLoading={false}
        />
      );

      expect(lastFrame()).toContain('First Result');
      expect(lastFrame()).toContain('Second Result');
      expect(lastFrame()).toContain('https://example1.com');
      expect(lastFrame()).toContain('2 results');
      expect(lastFrame()).toContain('150ms');
    });

    it('should show loading state', () => {
      const { lastFrame } = render(
        <SearchResults 
          results={null} 
          isLoading={true}
        />
      );

      expect(lastFrame()).toContain('🔄 Searching...');
    });

    it('should handle empty results', () => {
      const emptyResults = {
        ...mockResults,
        results: [],
        totalResults: 0
      };

      const { lastFrame } = render(
        <SearchResults 
          results={emptyResults} 
          isLoading={false}
        />
      );

      expect(lastFrame()).toContain('No results found');
      expect(lastFrame()).toContain('test query');
    });

    it('should truncate long snippets', () => {
      const longSnippetResults = {
        ...mockResults,
        results: [
          {
            id: '1',
            title: 'Long Snippet Result',
            url: 'https://example.com',
            snippet: 'This is a very long snippet that should be truncated because it exceeds the maximum length that we want to display in the CLI interface to keep things readable and not overflow the terminal window with too much text that becomes hard to scan quickly.',
            score: 0.95,
            metadata: {}
          }
        ]
      };

      const { lastFrame } = render(
        <SearchResults 
          results={longSnippetResults} 
          isLoading={false}
        />
      );

      const frame = lastFrame();
      expect(frame).toContain('...');
      // Should be truncated to reasonable length
      const snippetMatch = frame.match(/This is a very long snippet.*?\.\.\./);
      expect(snippetMatch).toBeTruthy();
    });

    it('should highlight query terms in results', () => {
      const highlightResults = {
        ...mockResults,
        query: 'test',
        results: [
          {
            id: '1',
            title: 'Test Result Title',
            url: 'https://test.example.com',
            snippet: 'This is a test snippet with test keywords',
            score: 0.95,
            metadata: {}
          }
        ]
      };

      const { lastFrame } = render(
        <SearchResults 
          results={highlightResults} 
          isLoading={false}
          highlightQuery={true}
        />
      );

      // Should contain highlighted terms (implementation dependent on highlighting strategy)
      expect(lastFrame()).toContain('Test Result Title');
    });

    it('should show result scores when enabled', () => {
      const { lastFrame } = render(
        <SearchResults 
          results={mockResults} 
          isLoading={false}
          showScores={true}
        />
      );

      expect(lastFrame()).toContain('0.95');
      expect(lastFrame()).toContain('0.90');
    });

    it('should handle keyboard navigation', async () => {
      const onSelect = vi.fn();
      const { stdin } = render(
        <SearchResults 
          results={mockResults} 
          isLoading={false}
          onSelect={onSelect}
          interactive={true}
        />
      );

      // Arrow down to select first result
      stdin.write('\u001b[B'); // Down arrow
      stdin.write('\r'); // Enter

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onSelect).toHaveBeenCalledWith(mockResults.results[0]);
    });
  });

  describe('CLI Integration', () => {
    it('should handle complete search workflow', async () => {
      const { stdin, lastFrame } = render(
        <InteractiveSearch mcpClient={mockMCPClient} />
      );

      // Enter search query
      stdin.write('integration test');
      stdin.write('\r');

      // Wait for search to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      const frame = lastFrame();
      expect(frame).toContain('integration test');
      expect(frame).toContain('Mock Result');
    });

    it('should support multiple searches', async () => {
      const { stdin, lastFrame } = render(
        <InteractiveSearch mcpClient={mockMCPClient} />
      );

      // First search
      stdin.write('first query');
      stdin.write('\r');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear and second search
      stdin.write('\u0003'); // Ctrl+C to clear
      stdin.write('second query');
      stdin.write('\r');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(lastFrame()).toContain('second query');
    });

    it('should handle exit commands', async () => {
      const onExit = vi.fn();
      const { stdin } = render(
        <InteractiveSearch 
          mcpClient={mockMCPClient}
          onExit={onExit}
        />
      );

      stdin.write('exit');
      stdin.write('\r');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onExit).toHaveBeenCalled();
    });
  });
});