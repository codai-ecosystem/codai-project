/**
 * Test Results Processor for Enhanced Reporting
 * Processes Jest test results for better CI/CD integration
 */

const fs = require('fs');
const path = require('path');

module.exports = results => {
  // Create test results summary
  const summary = {
    timestamp: new Date().toISOString(),
    success: results.success,
    numTotalTests: results.numTotalTests,
    numPassedTests: results.numPassedTests,
    numFailedTests: results.numFailedTests,
    numPendingTests: results.numPendingTests,
    testResults: results.testResults.map(testResult => ({
      testFilePath: testResult.testFilePath,
      numFailingTests: testResult.numFailingTests,
      numPassingTests: testResult.numPassingTests,
      numPendingTests: testResult.numPendingTests,
      failureMessage: testResult.failureMessage,
      coverage: testResult.coverage,
    })),
  };

  // Write summary to file for CI/CD
  const reportDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportDir, 'jest-results.json'),
    JSON.stringify(summary, null, 2)
  );

  return results;
};
