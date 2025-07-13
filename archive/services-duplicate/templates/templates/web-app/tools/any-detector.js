#!/usr/bin/env node

/**
 * TypeScript Any Detector
 *
 * This script analyzes TypeScript files in the project to detect usage of 'any' types
 * and provides recommendations for stronger typing.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

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

// Results storage
const results = {
  totalAny: 0,
  severeFiles: 0,
  files: {},
};

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Find TypeScript files
const rootDir = path.join(__dirname, '..');

async function main() {
  try {
    const tsFiles = await glob(path.join(rootDir, '**/*.{ts,tsx}'));

    // Filter out excluded patterns
    const filteredFiles = tsFiles.filter(file => {
      return !EXCLUDE_PATTERNS.some(pattern => pattern.test(file));
    });

    console.log(`${colors.blue}${colors.bold}🔍 TypeScript Any Type Detector${colors.reset}`);
    console.log(
      `${colors.cyan}Analyzing ${filteredFiles.length} TypeScript files...${colors.reset}\n`
    );

    // Process each file
    filteredFiles.forEach(file => {
      const relativePath = path.relative(rootDir, file);
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      // Track 'any' instances in this file
      const anyInstances = [];

      // Pattern to match 'any' types
      const anyPatterns = [
        /:\s*any\b/g, // : any
        /<any>/g, // <any>
        /<any,/g, // <any,
        /,\s*any>/g, // , any>
        /\(\s*any\s*\)/g, // (any)
        /Array<any>/g, // Array<any>
        /Promise<any>/g, // Promise<any>
        /Record<[^,]+,\s*any>/g, // Record<string, any>
      ];

      lines.forEach((line, index) => {
        // Skip comments and strings where 'any' might appear legitimately
        const cleanLine = line
          .replace(/\/\/.*$/, '') // Remove line comments
          .replace(/\/\*.*?\*\//g, '') // Remove block comments (single line)
          .replace(/'[^']*'/g, '') // Remove single quotes
          .replace(/"[^"]*"/g, ''); // Remove double quotes

        anyPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(cleanLine)) !== null) {
            anyInstances.push({
              line: index + 1,
              code: line.trim(),
              type: 'explicit any',
              match: match[0],
            });
            results.totalAny++;
          }
        });
      });

      if (anyInstances.length > 0) {
        results.files[relativePath] = {
          anyCount: anyInstances.length,
          instances: anyInstances,
          isSevere: anyInstances.length >= SEVERITY_THRESHOLD,
        };

        if (anyInstances.length >= SEVERITY_THRESHOLD) {
          results.severeFiles++;
        }
      }
    });

    // Output results
    console.log(`${colors.bold}📊 TypeScript "any" Detection Results${colors.reset}\n`);

    if (results.totalAny === 0) {
      console.log(
        `${colors.green}${colors.bold}✅ Excellent! No explicit 'any' types found!${colors.reset}`
      );
      console.log(
        `${colors.green}Your TypeScript code maintains strong typing throughout.${colors.reset}\n`
      );
      process.exit(0);
    }

    // Sort files by any count (descending)
    const sortedFiles = Object.entries(results.files).sort(
      ([, a], [, b]) => b.anyCount - a.anyCount
    );

    // Print severe files first
    sortedFiles.forEach(([file, data]) => {
      const severityIndicator = data.isSevere
        ? `${colors.red} ⚠️  HIGH SEVERITY${colors.reset}`
        : '';

      console.log(
        `${colors.cyan}${file}${colors.reset} - ${colors.yellow}${data.anyCount}${colors.reset} any types${severityIndicator}`
      );

      // Group instances by type
      const typeGroups = data.instances.reduce((acc, instance) => {
        acc[instance.type] = acc[instance.type] || [];
        acc[instance.type].push(instance);
        return acc;
      }, {});

      // Print summary by type
      Object.entries(typeGroups).forEach(([type, instances]) => {
        console.log(`  ${colors.magenta}${type}${colors.reset}: ${instances.length} instances`);
      });

      // Print up to 3 examples
      const examples = data.instances.slice(0, 3);
      if (examples.length > 0) {
        console.log(`${colors.cyan}  Examples:${colors.reset}`);
        examples.forEach(instance => {
          console.log(`    Line ${instance.line}: ${instance.code}`);
        });
      }
      console.log();
    });

    // Summary
    console.log(`${colors.bold}Summary:${colors.reset}`);
    console.log(`• Total 'any' types found: ${colors.yellow}${results.totalAny}${colors.reset}`);
    console.log(
      `• Files with 'any' types: ${colors.yellow}${Object.keys(results.files).length}${colors.reset}`
    );
    console.log(
      `• Severe files (${SEVERITY_THRESHOLD}+ any types): ${colors.red}${results.severeFiles}${colors.reset}`
    );

    // Recommendations
    if (results.totalAny > 0) {
      console.log(`\n${colors.bold}🛠️ Recommendations:${colors.reset}`);
      console.log(`• Replace ${colors.yellow}'any'${colors.reset} with specific types`);
      console.log(`• Use ${colors.green}'unknown'${colors.reset} for truly unknown types`);
      console.log(`• Create custom interfaces or types`);
      console.log(`• Use generic types ${colors.green}'<T>'${colors.reset} for reusable code`);
      console.log(
        `• Consider using ${colors.green}'object'${colors.reset}, ${colors.green}'Record<string, unknown>'${colors.reset}, or union types`
      );
    }

    // Exit with error if too many severe files
    const exitCode = results.severeFiles > ERROR_THRESHOLD ? 1 : 0;
    if (exitCode === 1) {
      console.log(
        `\n${colors.red}${colors.bold}❌ Too many severe files with 'any' types. Fix these before proceeding.${colors.reset}`
      );
    }

    process.exit(exitCode);
  } catch (error) {
    console.error(`${colors.red}Error running any detector:${colors.reset}`, error.message);
    process.exit(1);
  }
}

main();
