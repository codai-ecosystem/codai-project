/**
 * @fileoverview Interactive search component for Cautai CLI
 * @author Cautai Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface InteractiveSearchProps {
  onSearch: (query: string) => Promise<void>;
  loading: boolean;
}

export const InteractiveSearch: React.FC<InteractiveSearchProps> = ({
  onSearch,
  loading,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = async (): Promise<void> => {
    if (query.trim() && !loading) {
      await onSearch(query.trim());
    }
  };

  useInput((input, key) => {
    if (key.return && !loading) {
      handleSubmit();
    }
  });

  if (loading) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text>🔍 Searching for: <Text bold color="yellow">{query}</Text></Text>
        </Box>
        <Box>
          <Text color="cyan">⏳ Loading...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text>Enter your search query:</Text>
      </Box>
      
      <Box>
        <Text color="green">❯ </Text>
        <TextInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          placeholder="Type your search query and press Enter..."
        />
      </Box>
      
      {query.trim() && (
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            Press Enter to search for "{query}"
          </Text>
        </Box>
      )}
    </Box>
  );
};