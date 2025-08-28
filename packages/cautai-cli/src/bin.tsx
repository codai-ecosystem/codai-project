#!/usr/bin/env node

/**
 * @fileoverview Cautai CLI entry point
 * @author Cautai Team
 * @version 1.0.0
 */

import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { CautaiCLI } from './cli.js';

const program = new Command();

program
  .name('cautai')
  .description('Cautai - AI-first search engine for agents and humans')
  .version('1.0.0');

program
  .command('search', { isDefault: true })
  .description('Start interactive search')
  .action(() => {
    // Start the React Ink application
    const { unmount } = render(<CautaiCLI />);
    
    // Handle cleanup
    process.on('SIGINT', () => {
      unmount();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      unmount();
      process.exit(0);
    });
  });

program
  .command('quick')
  .description('Quick search without interactive mode')
  .argument('<query>', 'Search query')
  .option('-n, --max-results <number>', 'Maximum number of results', '5')
  .option('-l, --language <lang>', 'Language preference (en|ro|auto)', 'auto')
  .action(async (query, options) => {
    console.log(`🔍 Searching for: ${query}`);
    console.log(`   Max results: ${options.maxResults}`);
    console.log(`   Language: ${options.language}`);
    
    // Mock quick search for walking skeleton
    console.log('\n📊 Quick Search Results:');
    console.log('1. Mock result for quick search');
    console.log('   https://example.com/quick-result');
    console.log('   This would be a real search result in the full implementation.\n');
  });

// Only run if this is the main module
if (process.argv[1] && process.argv[1].endsWith('cautai') || process.argv[1].endsWith('index.js')) {
  program.parse();
}