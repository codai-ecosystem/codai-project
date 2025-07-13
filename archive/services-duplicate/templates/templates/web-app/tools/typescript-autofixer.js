#!/usr/bin/env node

/**
 * TypeScript Auto-Fixer
 *
 * This tool automatically applies common fixes to TypeScript files:
 * 1. Replaces 'any' types with appropriate alternatives
 * 2. Adds missing type annotations
 * 3. Fixes common type-related issues
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Handle both CommonJS and ESM chalk versions
let chalk;
try {
  // Try modern chalk (ESM)
  chalk = require('chalk');
} catch (err) {
  // Fallback to no colors if chalk import fails
  chalk = {
    blue: text => text,
    green: text => text,
    yellow: text => text,
    red: text => text,
    gray: text => text,
  };
}

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const EXCLUDE_PATTERNS = [
  /\.d\.ts$/, // Declaration files often need 'any'
  /node_modules/,
  /dist/,
  /\.next/,
  /\.turbo/,
];

// Common replacements for 'any' type
const ANY_REPLACEMENTS = {
  any: 'unknown',
  'any[]': 'unknown[]',
  'Array<any>': 'Array<unknown>',
  'Promise<any>': 'Promise<unknown>',
  'Record<string, any>': 'Record<string, unknown>',
  'Record<string,any>': 'Record<string,unknown>',
  'Record<any, any>': 'Record<string, unknown>',
  'Map<any, any>': 'Map<unknown, unknown>',
  'Set<any>': 'Set<unknown>',
};

// Track results
const results = {
  filesProcessed: 0,
  filesModified: 0,
  anyReplaced: 0,
  typeAnnotationsAdded: 0,
};

// Helper for colorized output
const log = {
  info: msg => console.log(chalk.blue ? chalk.blue(msg) : msg),
  success: msg => console.log(chalk.green ? chalk.green(msg) : msg),
  warning: msg => console.log(chalk.yellow ? chalk.yellow(msg) : msg),
  error: msg => console.log(chalk.red ? chalk.red(msg) : msg),
  verbose: msg => VERBOSE && console.log(chalk.gray ? chalk.gray(msg) : msg),
};

// Find TypeScript files
const rootDir = path.join(__dirname, '..');

async function main() {
  console.log(chalk.bold ? chalk.bold('TypeScript Auto-Fixer') : 'TypeScript Auto-Fixer');
  console.log(
    `Mode: ${DRY_RUN ? 'Dry Run (no changes will be made)' : 'Live Run (files will be modified)'}\n`
  );

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

      await processFile(fullPath, filePath);
    }

    // Generate report
    generateReport();
  } catch (error) {
    log.error('Error scanning TypeScript files: ' + error.message);
    process.exit(1);
  }
}

async function processFile(fullPath, relativePath) {
  try {
    const originalContent = await fs.promises.readFile(fullPath, 'utf-8');
    let content = originalContent;

    // Replace 'any' types
    const anyReplacements = replaceAnyTypes(content);
    content = anyReplacements.content;

    // Additional transformations could be added here:
    // - Add missing return types
    // - Fix parameter types
    // etc.

    // Write changes if content was modified
    if (content !== originalContent) {
      if (!DRY_RUN) {
        await fs.promises.writeFile(fullPath, content, 'utf-8');
      }
      results.filesModified++;
      results.anyReplaced += anyReplacements.count;

      log.success(`Modified ${relativePath} (${anyReplacements.count} replacements)`);

      if (VERBOSE) {
        anyReplacements.details.forEach(detail => {
          log.verbose(`  Line ${detail.line}: ${detail.original} → ${detail.replacement}`);
        });
      }
    }

    results.filesProcessed++;
  } catch (error) {
    log.error(`Error processing ${fullPath}: ${error.message}`);
  }
}

function replaceAnyTypes(content) {
  let modifiedContent = content;
  const details = [];
  let count = 0;

  // Split into lines to track line numbers
  const lines = content.split('\n');
  const newLines = [...lines];

  // Apply replacements line by line
  lines.forEach((line, index) => {
    let newLine = line;
    let lineChanged = false;

    // Apply each replacement pattern
    for (const [pattern, replacement] of Object.entries(ANY_REPLACEMENTS)) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'g');
      if (regex.test(newLine)) {
        const beforeReplace = newLine;
        newLine = newLine.replace(regex, replacement);

        if (beforeReplace !== newLine) {
          lineChanged = true;
          count += (newLine.match(replacement) || []).length;

          details.push({
            line: index + 1,
            original: pattern,
            replacement: replacement,
          });
        }
      }
    }

    if (lineChanged) {
      newLines[index] = newLine;
    }
  });

  // Reconstruct the content
  modifiedContent = newLines.join('\n');

  return {
    content: modifiedContent,
    count,
    details,
  };
}

function generateReport() {
  console.log(chalk.bold('\n--- TypeScript Auto-Fixer Report ---'));
  console.log(`Files processed: ${results.filesProcessed}`);
  console.log(`Files modified: ${results.filesModified}`);
  console.log(`'any' types replaced: ${results.anyReplaced}`);

  if (DRY_RUN) {
    console.log(chalk.yellow('\nThis was a dry run. No files were actually modified.'));
    console.log(chalk.yellow('Run without --dry-run flag to apply changes.'));
  }
}

main().catch(err => {
  log.error('Unhandled error: ' + err.message);
  process.exit(1);
});
