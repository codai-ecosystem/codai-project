/**
 * @fileoverview Search results component for Cautai CLI
 * @author Cautai Team
 * @version 1.0.0
 */

import React from 'react';
import { Box, Text, useInput } from 'ink';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
}

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  onBack: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  onBack,
}) => {
  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'b')) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text>
          🔍 Results for: <Text bold color="yellow">{query}</Text>
        </Text>
      </Box>
      
      {results.length === 0 ? (
        <Box>
          <Text color="red">No results found.</Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          {results.map((result, index) => (
            <Box key={result.id} flexDirection="column" marginBottom={1}>
              <Box>
                <Text color="cyan" bold>
                  {index + 1}. {result.title}
                </Text>
              </Box>
              
              {result.url && (
                <Box marginLeft={3}>
                  <Text color="green" underline>
                    {result.url}
                  </Text>
                </Box>
              )}
              
              <Box marginLeft={3} marginTop={0}>
                <Text color="gray">
                  {result.snippet}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </Text>
      </Box>
    </Box>
  );
};