/**
 * Unit Testing Validator Module
 * Ensures high-quality unit tests with real implementations
 */

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function applyCoverageValidation() {
  console.log('      🧪 Validating unit testing infrastructure...');

  const validationResults = {
    framework: 'Jest/Vitest',
    coverage: 0,
    testCount: 0,
    realTests: 0,
    mockedTests: 0,
    issues: [],
    recommendations: []
  };

  try {
    // Validate unit test quality
    await validateUnitTestQuality(validationResults);

    // Check for real vs mocked tests
    await analyzeTestRealism(validationResults);

    // Verify test coverage
    await verifyTestCoverage(validationResults);

    // Run unit tests
    await runUnitTests(validationResults);

    console.log(`        ✅ Unit tests: ${validationResults.testCount} found, ${validationResults.realTests} real tests`);

    return validationResults;

  } catch (error) {
    console.error(`        ❌ Unit testing validation failed: ${error.message}`);
    validationResults.issues.push(error.message);
    return validationResults;
  }
}

async function validateUnitTestQuality(results) {
  const testPatterns = [
    'apps/**/src/**/*.test.{js,jsx,ts,tsx}',
    'apps/**/__tests__/**/*.{js,jsx,ts,tsx}',
    'packages/**/src/**/*.test.{js,jsx,ts,tsx}',
    'packages/**/__tests__/**/*.{js,jsx,ts,tsx}'
  ];

  let totalTests = 0;
  let realTests = 0;
  let mockedTests = 0;

  for (const pattern of testPatterns) {
    const files = await findTestFiles(pattern);

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        totalTests++;

        // Analyze test quality
        const analysis = analyzeTestFile(content);

        if (analysis.isReal) {
          realTests++;
        } else {
          mockedTests++;
        }

        // Check for best practices
        validateTestBestPractices(content, file, results);

      } catch (error) {
        results.issues.push(`Cannot read test file ${file}: ${error.message}`);
      }
    }
  }

  results.testCount = totalTests;
  results.realTests = realTests;
  results.mockedTests = mockedTests;

  // Quality recommendations
  if (mockedTests > realTests) {
    results.recommendations.push('Consider reducing mocking in favor of real implementations');
  }

  if (totalTests < 100) {
    results.recommendations.push('Increase unit test coverage - aim for comprehensive test suite');
  }
}

function analyzeTestFile(content) {
  const analysis = {
    isReal: true,
    hasArrangeActAssert: false,
    usesBestPractices: false,
    mockCount: 0
  };

  // Count mocks
  const mockPatterns = [
    /jest\.mock\(/g,
    /vi\.mock\(/g,
    /mockImplementation/g,
    /mockReturnValue/g,
    /jest\.fn\(\)/g,
    /vi\.fn\(\)/g
  ];

  mockPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      analysis.mockCount += matches.length;
    }
  });

  // Determine if test is "real" (limited mocking)
  analysis.isReal = analysis.mockCount <= 3; // Allow some infrastructure mocking

  // Check for AAA pattern
  analysis.hasArrangeActAssert =
    content.includes('// Arrange') ||
    content.includes('// Act') ||
    content.includes('// Assert') ||
    (content.includes('describe') && content.includes('it') && content.includes('expect'));

  // Check for best practices
  analysis.usesBestPractices =
    content.includes('@testing-library') ||
    content.includes('screen.') ||
    content.includes('userEvent') ||
    content.includes('fireEvent');

  return analysis;
}

function validateTestBestPractices(content, filePath, results) {
  const issues = [];

  // Check for descriptive test names
  const testNames = content.match(/(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g);
  if (testNames) {
    testNames.forEach(testName => {
      if (testName.length < 20) {
        issues.push(`Short test name in ${filePath}: ${testName}`);
      }
    });
  }

  // Check for setup/teardown
  if (!content.includes('beforeEach') && !content.includes('afterEach') && content.includes('describe')) {
    results.recommendations.push(`Consider adding setup/teardown in ${filePath}`);
  }

  // Check for async testing best practices
  if (content.includes('async') && !content.includes('await')) {
    issues.push(`Async test without await in ${filePath}`);
  }

  results.issues.push(...issues);
}

async function analyzeTestRealism(results) {
  // Analyze how many tests use real implementations vs mocks
  const realTestPercentage = results.testCount > 0 ?
    (results.realTests / results.testCount) * 100 : 0;

  results.realismScore = realTestPercentage;

  if (realTestPercentage < 60) {
    results.issues.push('Too many mocked tests - consider integration testing approach');
  }

  results.recommendations.push('Aim for 80% real tests with minimal mocking');
  results.recommendations.push('Use Test Containers for database testing');
  results.recommendations.push('Implement in-memory implementations for external services');
}

async function verifyTestCoverage(results) {
  try {
    // Try to get coverage from existing reports
    const coverageFiles = [
      'coverage/coverage-summary.json',
      'apps/*/coverage/coverage-summary.json',
      'packages/*/coverage/coverage-summary.json'
    ];

    let totalCoverage = 0;
    let coverageCount = 0;

    for (const pattern of coverageFiles) {
      const files = await findTestFiles(pattern);

      for (const file of files) {
        try {
          const coverage = JSON.parse(await fs.readFile(file, 'utf8'));
          if (coverage.total && coverage.total.lines) {
            totalCoverage += coverage.total.lines.pct;
            coverageCount++;
          }
        } catch (error) {
          // Coverage file might not exist
        }
      }
    }

    results.coverage = coverageCount > 0 ? totalCoverage / coverageCount : 0;

    if (results.coverage < 80) {
      results.issues.push('Test coverage below 80% - increase unit test coverage');
    }

  } catch (error) {
    results.recommendations.push('Set up code coverage reporting');
  }
}

async function runUnitTests(results) {
  const testCommands = [
    'pnpm test:unit --passWithNoTests --coverage',
    'npm run test --passWithNoTests --coverage',
    'yarn test --passWithNoTests --coverage'
  ];

  for (const command of testCommands) {
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000,
        cwd: process.cwd()
      });

      // Parse test results
      parseTestResults(stdout, results);
      break;

    } catch (error) {
      // Try next command
      continue;
    }
  }
}

function parseTestResults(output, results) {
  // Parse Jest/Vitest output
  const passedMatch = output.match(/(\d+)\s+passed/);
  const failedMatch = output.match(/(\d+)\s+failed/);
  const coverageMatch = output.match(/All files[^|]*\|\s*(\d+\.?\d*)/);

  if (passedMatch) {
    results.passedTests = parseInt(passedMatch[1]);
  }

  if (failedMatch) {
    results.failedTests = parseInt(failedMatch[1]);
    results.issues.push(`${results.failedTests} unit tests are failing`);
  }

  if (coverageMatch) {
    results.coverage = parseFloat(coverageMatch[1]);
  }
}

async function findTestFiles(pattern) {
  // Simplified file finding - in production would use proper glob
  const files = [];

  try {
    // Convert glob pattern to directory search
    const basePath = pattern.split('**')[0] || '.';

    if (await fileExists(basePath)) {
      const foundFiles = await searchDirectoryRecursive(basePath, pattern);
      files.push(...foundFiles);
    }
  } catch (error) {
    // Pattern might not match any files
  }

  return files;
}

async function searchDirectoryRecursive(dir, pattern) {
  const files = [];

  try {
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        const subFiles = await searchDirectoryRecursive(fullPath, pattern);
        files.push(...subFiles);
      } else if (item.isFile() && matchesGlobPattern(item.name, pattern)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not be accessible
  }

  return files;
}

function matchesGlobPattern(filename, pattern) {
  // Simple glob matching - in production would use proper glob library
  const regexPattern = pattern
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\./g, '\\.')
    .replace(/\{([^}]+)\}/g, '($1)'.replace(/,/g, '|'));

  const regex = new RegExp(regexPattern);
  return regex.test(filename);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export default { applyCoverageValidation };