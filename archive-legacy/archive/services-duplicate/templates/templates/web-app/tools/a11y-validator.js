#!/usr/bin/env node

/**
 * A11Y Component Validator
 *
 * This script analyzes React components for common accessibility issues
 * and provides recommendations for improvements.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Common accessibility issues to check for
const a11yChecks = {
  imageWithoutAlt: {
    pattern: /<(?:img|Image)[^>]*(?!alt=)[^>]*>/g,
    message: 'Image without alt attribute',
    severity: 'error',
  },
  divWithClick: {
    pattern: /<div[^>]*onClick=[^>]*>/g,
    message:
      'Div with onClick handler (use button instead or add role and keyboard event handlers)',
    severity: 'error',
  },
  headerWithoutContent: {
    pattern: /<h[1-6][^>]*>\s*<\/h[1-6]>/g,
    message: 'Header without content',
    severity: 'error',
  },
  autoFocus: {
    pattern: /autoFocus/g,
    message: 'autoFocus attribute used (can cause accessibility issues)',
    severity: 'warning',
  },
  ariaHidden: {
    pattern: /aria-hidden={true}/g,
    message: 'Check if aria-hidden element has no focusable content',
    severity: 'warning',
  },
  tabIndexPositive: {
    pattern: /tabIndex={\s*[1-9][0-9]*\s*}/g,
    message: 'Positive tabIndex can create unpredictable tab order',
    severity: 'warning',
  },
  unescapedEntities: {
    pattern: /([<>])(?=[^<]*>)/g,
    message: 'Potentially unescaped entity in JSX',
    severity: 'warning',
  },
  hardcodedStrings: {
    pattern: /"[^"]{10,}"/g,
    message: 'Consider extracting long hardcoded string for i18n',
    severity: 'info',
  },
};

// Component directories to scan
const componentDirs = [path.join(__dirname, '../apps/web/src/components')];

// Results storage
const results = {
  errors: 0,
  warnings: 0,
  info: 0,
  files: {},
};

// Process each component file
componentDirs.forEach(dir => {
  const files = glob.sync(path.join(dir, '**/*.{jsx,tsx}'));

  files.forEach(file => {
    const relativePath = path.relative(path.join(__dirname, '..'), file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    results.files[relativePath] = {
      issues: [],
    };

    // Check each line for a11y issues
    lines.forEach((line, lineNumber) => {
      Object.entries(a11yChecks).forEach(([checkName, check]) => {
        const matches = line.match(check.pattern);
        if (matches) {
          matches.forEach(() => {
            results.files[relativePath].issues.push({
              line: lineNumber + 1,
              column: line.indexOf(matches[0]) + 1,
              message: check.message,
              severity: check.severity,
              code: line.trim(),
            });

            if (check.severity === 'error') results.errors++;
            if (check.severity === 'warning') results.warnings++;
            if (check.severity === 'info') results.info++;
          });
        }
      });
    });
  });
});

// Output results
console.log(chalk.bold('\n📊 Accessibility Check Results\n'));

Object.entries(results.files).forEach(([file, data]) => {
  if (data.issues.length > 0) {
    console.log(chalk.underline(file));

    data.issues.forEach(issue => {
      const severityColor =
        issue.severity === 'error'
          ? chalk.red
          : issue.severity === 'warning'
            ? chalk.yellow
            : chalk.blue;

      console.log(
        `  ${severityColor(issue.severity.toUpperCase())} Line ${issue.line}:${issue.column} - ${issue.message}`
      );
      console.log(`    ${chalk.gray(issue.code)}`);
    });
    console.log();
  }
});

// Summary
console.log(chalk.bold('\n📋 Summary\n'));
console.log(`${chalk.red('Errors')}: ${results.errors}`);
console.log(`${chalk.yellow('Warnings')}: ${results.warnings}`);
console.log(`${chalk.blue('Info')}: ${results.info}`);

// Exit code based on errors
process.exit(results.errors > 0 ? 1 : 0);
