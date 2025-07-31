#!/usr/bin/env node

/**
 * Enhanced TypeScript Any Detector
 *
 * An improved tool for analyzing TypeScript files to detect and fix 'any' types
 * with better reporting and automated fix suggestions.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Simple color functions for terminal output
const colors = {
  red: text => `\x1b[31m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  blue: text => `\x1b[34m${text}\x1b[0m`,
  magenta: text => `\x1b[35m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`,
  bold: text => `\x1b[1m${text}\x1b[0m`,
  dim: text => `\x1b[2m${text}\x1b[0m`,
};

// Configuration
const SEVERITY_THRESHOLD = 3; // Files with more than this many 'any' types are severe
const ERROR_THRESHOLD = 10; // Exit with error if more than this many severe files
const EXCLUDE_PATTERNS = [
  /\.d\.ts$/, // Declaration files often need 'any'
  /node_modules/,
  /dist/,
  /\.next/,
  /\.turbo/,
  /test-results/,
  /playwright-report/,
  /coverage/,
];

// Common replacements for 'any' type
const COMMON_REPLACEMENTS = {
  object: 'Record<string, unknown>',
  array: 'unknown[]',
  function: '(...args: unknown[]) => unknown',
  event: 'React.SyntheticEvent',
  reactNode: 'React.ReactNode',
  promise: 'Promise<unknown>',
  error: 'Error | unknown',
};

// Results storage
const results = {
  totalAny: 0,
  severeFiles: 0,
  files: {},
  suggestions: {},
};

// Find TypeScript files
const rootDir = path.join(__dirname, '..');

async function main() {
  console.log(colors.bold('Enhanced TypeScript Any Detector'));
  console.log("Scanning project for 'any' types...\n");

  try {
    const tsFiles = await glob('**/*.{ts,tsx}', {
      cwd: rootDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.turbo/**'],
    });

    for (const filePath of tsFiles) {
      const fullPath = path.join(rootDir, filePath);

      // Skip excluded files
      if (EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
        continue;
      }

      await analyzeFile(fullPath, filePath);
    }

    // Generate report
    generateReport();

    // Exit with error if too many severe files
    if (results.severeFiles > ERROR_THRESHOLD) {
      console.log(
        colors.red(`\n❌ Too many files (${results.severeFiles}) with excessive 'any' usage!`)
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(colors.red('Error scanning TypeScript files:'), error);
    process.exit(1);
  }
}

async function analyzeFile(fullPath, relativePath) {
  try {
    const fileContent = await fs.promises.readFile(fullPath, 'utf-8');
    const lines = fileContent.split('\n');
    const anyInstances = [];

    // Different patterns to detect 'any' types
    const patterns = [
      { regex: /: any(\[\])?(?![a-zA-Z0-9_])/g, name: 'explicit any' },
      { regex: /as any(\[\])?(?![a-zA-Z0-9_])/g, name: 'type assertion' },
      { regex: /<any(\[\])?>/g, name: 'generic any' },
    ];

    lines.forEach((line, index) => {
      patterns.forEach(pattern => {
        const matches = [...line.matchAll(pattern.regex)];
        if (matches.length > 0) {
          matches.forEach(match => {
            anyInstances.push({
              line: index + 1,
              column: match.index,
              context: line.trim(),
              type: pattern.name,
              isArray: match[0].includes('[]'),
            });
          });
        }
      });
    });

    if (anyInstances.length > 0) {
      results.totalAny += anyInstances.length;
      results.files[relativePath] = anyInstances;

      if (anyInstances.length > SEVERITY_THRESHOLD) {
        results.severeFiles++;
      }

      // Generate fix suggestions
      results.suggestions[relativePath] = generateFixSuggestions(fileContent, anyInstances);
    }
  } catch (error) {
    console.error(colors.red(`Error analyzing ${fullPath}:`), error);
  }
}

function generateFixSuggestions(fileContent, anyInstances) {
  const suggestions = [];

  // Analyze the context to guess appropriate types
  for (const instance of anyInstances) {
    const line = instance.context;
    let suggestedType = 'unknown';

    // Try to guess the appropriate type based on context
    if (line.includes('[]') || line.includes('Array')) {
      suggestedType = instance.isArray ? 'unknown[]' : 'Array<unknown>';
    } else if (line.includes('object') || line.includes('{')) {
      suggestedType = 'Record<string, unknown>';
    } else if (line.includes('function') || line.includes('=>')) {
      suggestedType = '(...args: unknown[]) => unknown';
    } else if (line.includes('event') || line.includes('Event')) {
      suggestedType = 'React.SyntheticEvent';
    } else if (line.includes('Promise') || line.includes('async')) {
      suggestedType = 'Promise<unknown>';
    } else if (line.includes('error') || line.includes('Error')) {
      suggestedType = 'Error | unknown';
    }

    suggestions.push({
      line: instance.line,
      currentType: 'any',
      suggestedType,
      context: line,
    });
  }

  return suggestions;
}

function generateReport() {
  console.log(
    colors.bold(
      `Found ${results.totalAny} instances of 'any' in ${Object.keys(results.files).length} files`
    )
  );
  console.log(
    colors.bold(
      `${results.severeFiles} files have excessive usage (>${SEVERITY_THRESHOLD} instances)\n`
    )
  );

  // Sort files by number of 'any' instances
  const sortedFiles = Object.entries(results.files).sort((a, b) => b[1].length - a[1].length);

  // Print the top files with most 'any' types
  console.log(colors.bold("Top files with most 'any' types:"));
  for (let i = 0; i < Math.min(10, sortedFiles.length); i++) {
    const [file, instances] = sortedFiles[i];
    const color = instances.length > SEVERITY_THRESHOLD ? colors.red : colors.yellow;
    console.log(color(`${file}: ${instances.length} instances`));

    // Print sample suggestions for the first few instances
    if (results.suggestions[file]?.length > 0) {
      console.log(colors.blue('  Example fixes:'));
      const maxSuggestions = Math.min(3, results.suggestions[file].length);
      for (let j = 0; j < maxSuggestions; j++) {
        const suggestion = results.suggestions[file][j];
        console.log(`  Line ${suggestion.line}: Replace 'any' with '${suggestion.suggestedType}'`);
        console.log(`    ${colors.cyan(suggestion.context)}`);
      }
      console.log('');
    }
  }

  // Print summary of fixes
  console.log(colors.bold("\nCommon replacements for 'any' types:"));
  for (const [key, value] of Object.entries(COMMON_REPLACEMENTS)) {
    console.log(`  ${colors.yellow(key)}: ${colors.green(value)}`);
  }
}

main().catch(err => {
  console.error(colors.red('Unhandled error:'), err);
  process.exit(1);
});
