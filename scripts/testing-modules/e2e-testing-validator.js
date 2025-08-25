/**
 * E2E Testing Validator Module
 * Validates end-to-end testing with Playwright for real user scenarios
 */

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function applyCoverageValidation() {
  console.log('      🎭 Validating E2E testing infrastructure...');

  const validationResults = {
    framework: 'Playwright/Cypress',
    e2eTestCount: 0,
    userScenarios: 0,
    crossBrowserTests: 0,
    mobileTests: 0,
    realUserFlows: 0,
    issues: [],
    recommendations: []
  };

  try {
    // Validate E2E test coverage
    await validateE2ETests(validationResults);

    // Check user scenario coverage
    await validateUserScenarios(validationResults);

    // Validate cross-browser testing
    await validateCrossBrowserTests(validationResults);

    // Check mobile testing
    await validateMobileTesting(validationResults);

    // Run E2E test suite
    await runE2ETests(validationResults);

    console.log(`        ✅ E2E tests: ${validationResults.e2eTestCount} found, ${validationResults.realUserFlows} real user flows`);

    return validationResults;

  } catch (error) {
    console.error(`        ❌ E2E testing validation failed: ${error.message}`);
    validationResults.issues.push(error.message);
    return validationResults;
  }
}

async function validateE2ETests(results) {
  const e2eTestPaths = [
    'tests/e2e',
    'tests/integration',
    'apps/*/tests/e2e',
    'apps/*/e2e'
  ];

  let totalTests = 0;

  for (const testPath of e2eTestPaths) {
    try {
      const fullPath = path.resolve(testPath);

      if (await directoryExists(fullPath)) {
        const testFiles = await findE2ETestFiles(fullPath);
        totalTests += testFiles.length;

        // Analyze each test file
        for (const testFile of testFiles) {
          await analyzeE2ETestFile(testFile, results);
        }
      }
    } catch (error) {
      results.issues.push(`Cannot access E2E test path ${testPath}: ${error.message}`);
    }
  }

  results.e2eTestCount = totalTests;

  if (totalTests === 0) {
    results.issues.push('No E2E tests found - critical for user experience validation');
    results.recommendations.push('Implement comprehensive E2E testing with Playwright');
  }

  // Check for Playwright configuration
  await validatePlaywrightConfig(results);
}

async function validatePlaywrightConfig(results) {
  const configPaths = [
    'playwright.config.ts',
    'playwright.config.js',
    'tests/playwright.config.ts',
    'tests/integration/playwright.config.ts'
  ];

  let hasConfig = false;

  for (const configPath of configPaths) {
    try {
      if (await fileExists(configPath)) {
        hasConfig = true;
        const content = await fs.readFile(configPath, 'utf8');
        await analyzePlaywrightConfig(content, results);
        break;
      }
    } catch (error) {
      // Config might not exist
    }
  }

  if (!hasConfig) {
    results.issues.push('No Playwright configuration found');
    results.recommendations.push('Set up Playwright configuration with proper browser targets');
  }
}

async function analyzePlaywrightConfig(content, results) {
  // Check for browser coverage
  const browsers = ['chromium', 'firefox', 'webkit'];
  let configuredBrowsers = 0;

  browsers.forEach(browser => {
    if (content.includes(browser)) {
      configuredBrowsers++;
    }
  });

  results.crossBrowserTests = configuredBrowsers;

  if (configuredBrowsers < 3) {
    results.recommendations.push('Enable all browsers (Chromium, Firefox, Safari) for comprehensive testing');
  }

  // Check for mobile configuration
  if (content.includes('Mobile') || content.includes('mobile')) {
    results.mobileTests++;
  } else {
    results.recommendations.push('Add mobile device testing configuration');
  }

  // Check for other best practices
  if (!content.includes('screenshot')) {
    results.recommendations.push('Enable screenshots on failure for debugging');
  }

  if (!content.includes('video')) {
    results.recommendations.push('Enable video recording for failed tests');
  }

  if (!content.includes('trace')) {
    results.recommendations.push('Enable trace recording for comprehensive debugging');
  }
}

async function validateUserScenarios(results) {
  console.log('        👤 Validating user scenario coverage...');

  const userScenarios = [
    'authentication',
    'navigation',
    'form-submission',
    'data-creation',
    'data-editing',
    'data-deletion',
    'search',
    'filter',
    'upload',
    'download'
  ];

  let scenarioCount = 0;

  for (const scenario of userScenarios) {
    const hasScenarioTest = await hasUserScenarioTest(scenario);

    if (hasScenarioTest) {
      scenarioCount++;
    } else {
      results.recommendations.push(`Add E2E test for user scenario: ${scenario}`);
    }
  }

  results.userScenarios = scenarioCount;

  if (scenarioCount < userScenarios.length / 2) {
    results.issues.push('Insufficient user scenario coverage in E2E tests');
  }
}

async function hasUserScenarioTest(scenario) {
  const testPaths = [
    'tests/e2e',
    'tests/integration',
    'tests'
  ];

  for (const testPath of testPaths) {
    try {
      if (await directoryExists(testPath)) {
        const testFiles = await findE2ETestFiles(testPath);

        for (const testFile of testFiles) {
          const content = await fs.readFile(testFile, 'utf8');

          if (content.toLowerCase().includes(scenario)) {
            return true;
          }
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }

  return false;
}

async function validateCrossBrowserTests(results) {
  console.log('        🌐 Validating cross-browser testing...');

  // Check if tests are configured to run on multiple browsers
  const projectConfigs = await findPlaywrightProjects();

  results.crossBrowserTests = projectConfigs.length;

  if (projectConfigs.length < 3) {
    results.issues.push('Cross-browser testing not properly configured');
    results.recommendations.push('Configure tests to run on Chrome, Firefox, and Safari');
  }

  // Validate browser-specific test files
  const browserTestCount = await countBrowserSpecificTests();

  if (browserTestCount === 0) {
    results.recommendations.push('Add browser-specific tests for critical functionality');
  }
}

async function validateMobileTesting(results) {
  console.log('        📱 Validating mobile testing...');

  const mobileTestPatterns = [
    'mobile',
    'responsive',
    'touch',
    'viewport'
  ];

  let mobileTestCount = 0;

  for (const pattern of mobileTestPatterns) {
    const hasMobileTests = await hasTestsContaining(pattern);
    if (hasMobileTests) {
      mobileTestCount++;
    }
  }

  results.mobileTests = mobileTestCount;

  if (mobileTestCount === 0) {
    results.issues.push('No mobile-specific E2E tests found');
    results.recommendations.push('Add mobile device testing for responsive behavior');
  }
}

async function runE2ETests(results) {
  console.log('        🧪 Running E2E test suite...');

  const testCommands = [
    { cmd: 'npx playwright test', cwd: 'tests' },
    { cmd: 'npx playwright test', cwd: 'tests/integration' },
    { cmd: 'pnpm test:e2e', cwd: '.' }
  ];

  for (const { cmd, cwd } of testCommands) {
    try {
      const testPath = path.resolve(cwd);

      if (await directoryExists(testPath)) {
        const { stdout, stderr } = await execAsync(cmd, {
          cwd: testPath,
          timeout: 600000 // 10 minutes for E2E tests
        });

        parseE2ETestResults(stdout, results);
        break;
      }
    } catch (error) {
      // E2E tests might fail due to service availability
      console.warn(`        ⚠️ E2E tests not run: ${error.message}`);
      results.recommendations.push('Ensure all services are running before E2E tests');
    }
  }
}

function parseE2ETestResults(output, results) {
  // Parse Playwright output
  const passedMatch = output.match(/(\d+)\s+passed/);
  const failedMatch = output.match(/(\d+)\s+failed/);
  const skippedMatch = output.match(/(\d+)\s+skipped/);

  if (passedMatch) {
    results.passedTests = parseInt(passedMatch[1]);
  }

  if (failedMatch) {
    results.failedTests = parseInt(failedMatch[1]);
    results.issues.push(`${results.failedTests} E2E tests are failing`);
  }

  if (skippedMatch) {
    results.skippedTests = parseInt(skippedMatch[1]);
    if (results.skippedTests > 0) {
      results.recommendations.push('Investigate why E2E tests are being skipped');
    }
  }

  // Check for browser coverage in output
  if (output.includes('chromium')) results.browsers = (results.browsers || 0) + 1;
  if (output.includes('firefox')) results.browsers = (results.browsers || 0) + 1;
  if (output.includes('webkit')) results.browsers = (results.browsers || 0) + 1;
}

async function analyzeE2ETestFile(filePath, results) {
  try {
    const content = await fs.readFile(filePath, 'utf8');

    // Analyze test quality
    const analysis = analyzeE2ETestQuality(content);

    if (analysis.hasRealUserFlow) {
      results.realUserFlows++;
    }

    // Add recommendations based on analysis
    if (!analysis.hasPageObjects) {
      results.recommendations.push(`Consider using Page Object pattern in: ${filePath}`);
    }

    if (!analysis.hasWaits) {
      results.recommendations.push(`Add proper waits for stability in: ${filePath}`);
    }

    if (!analysis.hasErrorHandling) {
      results.recommendations.push(`Add error handling in: ${filePath}`);
    }

  } catch (error) {
    results.issues.push(`Cannot analyze E2E test ${filePath}: ${error.message}`);
  }
}

function analyzeE2ETestQuality(content) {
  return {
    hasRealUserFlow: hasRealUserInteractions(content),
    hasPageObjects: content.includes('page.') || content.includes('Page'),
    hasWaits: content.includes('waitFor') || content.includes('expect'),
    hasErrorHandling: content.includes('try') && content.includes('catch'),
    hasAssertions: content.includes('expect') || content.includes('toHave'),
    hasNavigation: content.includes('goto') || content.includes('navigate'),
    hasInteractions: content.includes('click') || content.includes('fill') || content.includes('type')
  };
}

function hasRealUserInteractions(content) {
  const userInteractionPatterns = [
    /page\.click/g,
    /page\.fill/g,
    /page\.type/g,
    /page\.select/g,
    /page\.check/g,
    /page\.upload/g,
    /user\.click/g,
    /user\.type/g
  ];

  return userInteractionPatterns.some(pattern => pattern.test(content));
}

async function findPlaywrightProjects() {
  const projects = [];

  try {
    const configPath = await findPlaywrightConfigFile();

    if (configPath) {
      const content = await fs.readFile(configPath, 'utf8');

      // Simple project detection
      const projectMatches = content.match(/projects:\s*\[([\s\S]*?)\]/);
      if (projectMatches) {
        const projectSection = projectMatches[1];
        const projectNames = projectSection.match(/name:\s*['"`]([^'"`]+)['"`]/g);

        if (projectNames) {
          projects.push(...projectNames.map(match => match.match(/['"`]([^'"`]+)['"`]/)[1]));
        }
      }
    }
  } catch (error) {
    // Config might not exist
  }

  return projects;
}

async function findPlaywrightConfigFile() {
  const configPaths = [
    'playwright.config.ts',
    'playwright.config.js',
    'tests/playwright.config.ts',
    'tests/integration/playwright.config.ts'
  ];

  for (const configPath of configPaths) {
    if (await fileExists(configPath)) {
      return configPath;
    }
  }

  return null;
}

async function countBrowserSpecificTests() {
  let count = 0;

  const browserKeywords = ['chrome', 'firefox', 'safari', 'webkit', 'chromium'];

  for (const keyword of browserKeywords) {
    const hasTests = await hasTestsContaining(keyword);
    if (hasTests) count++;
  }

  return count;
}

async function hasTestsContaining(keyword) {
  const testPaths = ['tests/e2e', 'tests/integration', 'tests'];

  for (const testPath of testPaths) {
    try {
      if (await directoryExists(testPath)) {
        const testFiles = await findE2ETestFiles(testPath);

        for (const testFile of testFiles) {
          const content = await fs.readFile(testFile, 'utf8');
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            return true;
          }
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }

  return false;
}

// Utility functions
async function findE2ETestFiles(dirPath) {
  const files = [];

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        const subFiles = await findE2ETestFiles(fullPath);
        files.push(...subFiles);
      } else if (item.isFile() && isE2ETestFile(item.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist
  }

  return files;
}

function isE2ETestFile(filename) {
  return /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(filename) ||
    /\.e2e\.(js|jsx|ts|tsx)$/.test(filename);
}

async function directoryExists(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
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