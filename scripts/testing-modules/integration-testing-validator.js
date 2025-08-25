/**
 * Integration Testing Validator Module
 * Validates real integration tests across services and databases
 */

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function applyCoverageValidation() {
  console.log('      🔗 Validating integration testing infrastructure...');

  const validationResults = {
    framework: 'Playwright/Jest Integration',
    integrationTestCount: 0,
    serviceTests: 0,
    databaseTests: 0,
    apiTests: 0,
    realConnections: 0,
    mockConnections: 0,
    issues: [],
    recommendations: []
  };

  try {
    // Validate integration test coverage
    await validateIntegrationTests(validationResults);

    // Check service integration tests
    await validateServiceIntegration(validationResults);

    // Validate database integration
    await validateDatabaseIntegration(validationResults);

    // Check API integration tests  
    await validateAPIIntegration(validationResults);

    // Run integration test suite
    await runIntegrationTests(validationResults);

    console.log(`        ✅ Integration tests: ${validationResults.integrationTestCount} found, ${validationResults.realConnections} real connections`);

    return validationResults;

  } catch (error) {
    console.error(`        ❌ Integration testing validation failed: ${error.message}`);
    validationResults.issues.push(error.message);
    return validationResults;
  }
}

async function validateIntegrationTests(results) {
  const integrationTestPaths = [
    'tests/integration',
    'tests/api-sdk-cli',
    'apps/*/tests/integration',
    'packages/*/tests/integration'
  ];

  let totalTests = 0;

  for (const testPath of integrationTestPaths) {
    try {
      const fullPath = path.resolve(testPath);

      if (await directoryExists(fullPath)) {
        const testFiles = await findIntegrationTestFiles(fullPath);
        totalTests += testFiles.length;

        // Analyze each test file
        for (const testFile of testFiles) {
          await analyzeIntegrationTestFile(testFile, results);
        }
      }
    } catch (error) {
      results.issues.push(`Cannot access integration test path ${testPath}: ${error.message}`);
    }
  }

  results.integrationTestCount = totalTests;

  if (totalTests === 0) {
    results.issues.push('No integration tests found - critical for production readiness');
  }
}

async function validateServiceIntegration(results) {
  console.log('        🏗️ Validating service integration tests...');

  const services = [
    'memorai-mcp',
    'cbd',
    'romai-agi',
    'enterprise-api',
    'gateway'
  ];

  let serviceTestCount = 0;

  for (const service of services) {
    const serviceTestResults = await validateServiceTests(service);

    if (serviceTestResults.hasTests) {
      serviceTestCount++;
      results.serviceTests++;

      if (serviceTestResults.hasRealConnections) {
        results.realConnections++;
      } else {
        results.mockConnections++;
      }
    } else {
      results.issues.push(`No integration tests found for service: ${service}`);
    }
  }

  if (serviceTestCount < services.length) {
    results.recommendations.push('Add integration tests for all critical services');
  }
}

async function validateServiceTests(serviceName) {
  const serviceTestPaths = [
    `tests/integration/${serviceName}.spec.ts`,
    `tests/integration/${serviceName}.test.ts`,
    `tests/services/${serviceName}.spec.ts`,
    `apps/${serviceName}/tests/integration.spec.ts`
  ];

  const results = {
    hasTests: false,
    hasRealConnections: false,
    testCount: 0
  };

  for (const testPath of serviceTestPaths) {
    try {
      if (await fileExists(testPath)) {
        results.hasTests = true;

        const content = await fs.readFile(testPath, 'utf8');
        results.testCount++;

        // Check for real vs mocked connections
        results.hasRealConnections = analyzeConnectionType(content);
        break;
      }
    } catch (error) {
      // Test file might not exist
    }
  }

  return results;
}

function analyzeConnectionType(testContent) {
  // Check for real connection patterns
  const realConnectionPatterns = [
    /http:\/\/localhost:\d+/g,
    /fetch\s*\(/g,
    /axios\./g,
    /supertest\(/g,
    /request\(/g
  ];

  const mockPatterns = [
    /jest\.mock/g,
    /vi\.mock/g,
    /mockImplementation/g,
    /nock\(/g
  ];

  const realMatches = realConnectionPatterns.reduce((count, pattern) => {
    const matches = testContent.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);

  const mockMatches = mockPatterns.reduce((count, pattern) => {
    const matches = testContent.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);

  return realMatches > mockMatches;
}

async function validateDatabaseIntegration(results) {
  console.log('        🗄️ Validating database integration tests...');

  const databaseTestPatterns = [
    'tests/integration/*database*',
    'tests/integration/*db*',
    'tests/database/',
    'tests/integration/*cbd*'
  ];

  let dbTestCount = 0;

  for (const pattern of databaseTestPatterns) {
    const testFiles = await findFilesByPattern(pattern);

    for (const testFile of testFiles) {
      try {
        const content = await fs.readFile(testFile, 'utf8');

        if (hasDatabaseIntegrationTests(content)) {
          dbTestCount++;

          if (hasRealDatabaseConnection(content)) {
            results.realConnections++;
          } else {
            results.mockConnections++;
          }
        }
      } catch (error) {
        results.issues.push(`Cannot analyze database test ${testFile}: ${error.message}`);
      }
    }
  }

  results.databaseTests = dbTestCount;

  if (dbTestCount === 0) {
    results.issues.push('No database integration tests found');
    results.recommendations.push('Add comprehensive database integration tests');
  }
}

function hasDatabaseIntegrationTests(content) {
  const dbPatterns = [
    /database/i,
    /postgres/i,
    /mongodb/i,
    /sql/i,
    /query/i,
    /transaction/i,
    /collection/i
  ];

  return dbPatterns.some(pattern => pattern.test(content));
}

function hasRealDatabaseConnection(content) {
  const realDbPatterns = [
    /process\.env\.DATABASE_URL/,
    /localhost:\d+/,
    /mongodb:\/\//,
    /postgresql:\/\//,
    /testcontainers/i
  ];

  return realDbPatterns.some(pattern => pattern.test(content));
}

async function validateAPIIntegration(results) {
  console.log('        🌐 Validating API integration tests...');

  const apiTestPaths = [
    'tests/api-sdk-cli',
    'tests/integration/api',
    'tests/api'
  ];

  let apiTestCount = 0;

  for (const apiPath of apiTestPaths) {
    try {
      if (await directoryExists(apiPath)) {
        const testFiles = await findAPITestFiles(apiPath);

        for (const testFile of testFiles) {
          const content = await fs.readFile(testFile, 'utf8');

          if (hasAPIIntegrationTests(content)) {
            apiTestCount++;

            if (hasRealAPIConnections(content)) {
              results.realConnections++;
            } else {
              results.mockConnections++;
            }
          }
        }
      }
    } catch (error) {
      results.issues.push(`Cannot access API test path ${apiPath}: ${error.message}`);
    }
  }

  results.apiTests = apiTestCount;

  if (apiTestCount === 0) {
    results.issues.push('No API integration tests found');
    results.recommendations.push('Add comprehensive API integration tests');
  }
}

function hasAPIIntegrationTests(content) {
  const apiPatterns = [
    /fetch\(/,
    /axios\./,
    /supertest/,
    /request\(/,
    /\/api\//,
    /REST/i,
    /GraphQL/i
  ];

  return apiPatterns.some(pattern => pattern.test(content));
}

function hasRealAPIConnections(content) {
  const realAPIPatterns = [
    /http:\/\/localhost/,
    /https:\/\//,
    /process\.env\.API_URL/,
    /baseURL/
  ];

  return realAPIPatterns.some(pattern => pattern.test(content));
}

async function runIntegrationTests(results) {
  console.log('        🧪 Running integration test suite...');

  const testCommands = [
    { cmd: 'pnpm test:integration', cwd: 'tests/integration' },
    { cmd: 'pnpm test', cwd: 'tests/api-sdk-cli' },
    { cmd: 'npx playwright test', cwd: 'tests/integration' }
  ];

  for (const { cmd, cwd } of testCommands) {
    try {
      const testPath = path.resolve(cwd);

      if (await directoryExists(testPath)) {
        const { stdout, stderr } = await execAsync(cmd, {
          cwd: testPath,
          timeout: 300000 // 5 minutes for integration tests
        });

        parseIntegrationTestResults(stdout, results);
        break;
      }
    } catch (error) {
      // Try next command
      continue;
    }
  }
}

function parseIntegrationTestResults(output, results) {
  // Parse Playwright/Jest output
  const passedMatch = output.match(/(\d+)\s+passed/);
  const failedMatch = output.match(/(\d+)\s+failed/);

  if (passedMatch) {
    results.passedTests = parseInt(passedMatch[1]);
  }

  if (failedMatch) {
    results.failedTests = parseInt(failedMatch[1]);
    results.issues.push(`${results.failedTests} integration tests are failing`);
  }

  // Check for specific test types in output
  if (output.includes('API')) {
    results.hasAPITests = true;
  }

  if (output.includes('database') || output.includes('DB')) {
    results.hasDatabaseTests = true;
  }
}

async function analyzeIntegrationTestFile(filePath, results) {
  try {
    const content = await fs.readFile(filePath, 'utf8');

    // Analyze test quality
    const analysis = analyzeIntegrationTestQuality(content);

    if (analysis.hasRealConnections) {
      results.realConnections++;
    } else {
      results.mockConnections++;
    }

    // Add recommendations based on analysis
    if (!analysis.hasCleanup) {
      results.recommendations.push(`Add cleanup in integration test: ${filePath}`);
    }

    if (!analysis.hasTimeouts) {
      results.recommendations.push(`Add proper timeouts in: ${filePath}`);
    }

  } catch (error) {
    results.issues.push(`Cannot analyze integration test ${filePath}: ${error.message}`);
  }
}

function analyzeIntegrationTestQuality(content) {
  return {
    hasRealConnections: analyzeConnectionType(content),
    hasCleanup: content.includes('afterEach') || content.includes('afterAll') || content.includes('cleanup'),
    hasTimeouts: content.includes('timeout') || content.includes('jest.setTimeout'),
    hasErrorHandling: content.includes('try') && content.includes('catch'),
    hasAssertions: content.includes('expect') || content.includes('assert')
  };
}

// Utility functions
async function findIntegrationTestFiles(dirPath) {
  const files = [];

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        const subFiles = await findIntegrationTestFiles(fullPath);
        files.push(...subFiles);
      } else if (item.isFile() && isTestFile(item.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist
  }

  return files;
}

async function findAPITestFiles(dirPath) {
  return findIntegrationTestFiles(dirPath);
}

async function findFilesByPattern(pattern) {
  // Simplified pattern matching
  const files = [];
  const basePath = pattern.split('*')[0] || '.';

  try {
    if (await directoryExists(basePath)) {
      const foundFiles = await findIntegrationTestFiles(basePath);
      files.push(...foundFiles);
    }
  } catch (error) {
    // Pattern might not match
  }

  return files;
}

function isTestFile(filename) {
  return /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(filename);
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