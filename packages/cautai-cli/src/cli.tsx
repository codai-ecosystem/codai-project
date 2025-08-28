/**
 * @fileoverview Cautai CLI implementation with React Ink TUI
 * @author Cautai Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { InteractiveSearch } from './components/search.js';
import { SearchResults } from './components/results.js';

interface AppState {
  currentView: 'search' | 'results';
  query: string;
  results: any[];
  loading: boolean;
}

export const CautaiCLI: React.FC = () => {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({
    currentView: 'search',
    query: '',
    results: [],
    loading: false,
  });

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
    
    if (key.escape && state.currentView === 'results') {
      setState(prev => ({ ...prev, currentView: 'search' }));
    }
  });

  const handleSearch = async (query: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, query }));
    
    try {
      // Mock search for walking skeleton
      // TODO: Connect to actual MCP server via stdio transport
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const mockResults = [
        {
          id: '1',
          title: `Search result for: ${query}`,
          url: 'https://example.com/result1',
          snippet: `This is a mock result for "${query}". The CLI is working!`,
        },
        {
          id: '2',
          title: `Another result for: ${query}`,
          url: 'https://example.org/result2',
          snippet: `Another mock result showing the interactive CLI interface.`,
        },
      ];
      
      setState(prev => ({
        ...prev,
        currentView: 'results',
        results: mockResults,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        results: [{
          id: 'error',
          title: 'Search Error',
          url: '',
          snippet: error instanceof Error ? error.message : 'Unknown error occurred',
        }],
        currentView: 'results',
      }));
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color="cyan" bold>
          🔍 Cautai - AI-first search engine
        </Text>
      </Box>
      
      {state.currentView === 'search' && (
        <InteractiveSearch
          onSearch={handleSearch}
          loading={state.loading}
        />
      )}
      
      {state.currentView === 'results' && (
        <SearchResults
          query={state.query}
          results={state.results}
          onBack={() => setState(prev => ({ ...prev, currentView: 'search' }))}
        />
      )}
      
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Press Ctrl+C to exit{state.currentView === 'results' ? ' • ESC to go back' : ''}
        </Text>
      </Box>
    </Box>
  );
};