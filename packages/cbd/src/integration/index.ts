/**
 * CBD Database Phase 9: System Integration & Testing
 * Main Orchestration Entry Point
 * 
 * Comprehensive system integration testing based on 2025 enterprise best practices
 * and Microsoft Azure Well-Architected Framework guidelines.
 * 
 * @version 1.0.0
 * @description Main entry point for CBD database system integration testing
 */

export { SystemIntegrationTestSuite } from './SystemIntegrationTestSuite';
export { IntegrationTestExecutionEngine } from './TestExecutionEngine';
export { IntegrationTestRunner, runIntegrationTests } from './TestRunner';
export { 
  CBD_INTEGRATION_TEST_CONFIG,
  TestEnvironment,
  TestScenario,
  TestDataSet,
  PerformanceBenchmarks,
  SecurityTestConfig,
  ComplianceTestConfig
} from './TestConfiguration';
export { ALL_TEST_SCENARIOS } from './TestScenarios';

// Re-export types for external usage
export type {
  TestResult,
  TestSuite,
  TestStep,
  SuccessCriterion,
  TestConfiguration,
  TestExecutionContext,
  TestStepResult,
  TestMetrics,
  TestLog,
  TestExecutionReport,
  TestRecommendation,
  TestExecutionSummary
} from './TestExecutionEngine';

export type {
  TestRunnerOptions
} from './TestRunner';

/**
 * Quick start function for running complete integration test suite
 */
export async function runCompleteIntegrationTestSuite(): Promise<void> {
  console.log('🚀 Starting CBD Database Complete Integration Test Suite');
  console.log('=====================================================');
  console.log('Based on 2025 enterprise testing best practices');
  console.log('Microsoft Azure Well-Architected Framework compliance');
  console.log('=====================================================\n');
  
  const { runIntegrationTests } = await import('./TestRunner');
  
  await runIntegrationTests({
    environment: 'development',
    suiteId: 'CBD_COMPLETE_INTEGRATION_TEST_2025',
    verbose: true,
    generateReport: true,
    outputPath: './integration-test-reports',
    failFast: false,
    maxRetries: 3,
    timeout: 600000 // 10 minutes for complete suite
  });
}

/**
 * Performance-focused integration test suite
 */
export async function runPerformanceIntegrationTestSuite(): Promise<void> {
  console.log('⚡ Starting CBD Database Performance Integration Test Suite');
  console.log('========================================================');
  
  const { runIntegrationTests } = await import('./TestRunner');
  
  await runIntegrationTests({
    environment: 'staging',
    suiteId: 'CBD_PERFORMANCE_INTEGRATION_TEST_2025',
    verbose: false,
    generateReport: true,
    outputPath: './performance-test-reports',
    failFast: true,
    maxRetries: 1,
    timeout: 900000 // 15 minutes for performance tests
  });
}

/**
 * Security-focused integration test suite
 */
export async function runSecurityIntegrationTestSuite(): Promise<void> {
  console.log('🔒 Starting CBD Database Security Integration Test Suite');
  console.log('======================================================');
  
  const { runIntegrationTests } = await import('./TestRunner');
  
  await runIntegrationTests({
    environment: 'staging',
    suiteId: 'CBD_SECURITY_INTEGRATION_TEST_2025',
    verbose: true,
    generateReport: true,
    outputPath: './security-test-reports',
    failFast: true,
    maxRetries: 2,
    timeout: 450000 // 7.5 minutes for security tests
  });
}

/**
 * Production readiness validation suite
 */
export async function runProductionReadinessValidation(): Promise<void> {
  console.log('🎯 Starting CBD Database Production Readiness Validation');
  console.log('======================================================');
  
  const { runIntegrationTests } = await import('./TestRunner');
  
  await runIntegrationTests({
    environment: 'production',
    suiteId: 'CBD_PRODUCTION_READINESS_VALIDATION_2025',
    verbose: true,
    generateReport: true,
    outputPath: './production-readiness-reports',
    failFast: true,
    maxRetries: 1,
    timeout: 1200000 // 20 minutes for production validation
  });
}

/**
 * CLI interface for different test suites
 */
export const CLI_COMMANDS = {
  'complete': runCompleteIntegrationTestSuite,
  'performance': runPerformanceIntegrationTestSuite,
  'security': runSecurityIntegrationTestSuite,
  'production': runProductionReadinessValidation
};

/**
 * Main CLI entry point
 */
export async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'complete';
  
  if (command in CLI_COMMANDS) {
    console.log(`Executing command: ${command}`);
    await CLI_COMMANDS[command as keyof typeof CLI_COMMANDS]();
  } else {
    console.log('Available commands:');
    console.log('  complete    - Run complete integration test suite (default)');
    console.log('  performance - Run performance-focused integration tests');
    console.log('  security    - Run security-focused integration tests');
    console.log('  production  - Run production readiness validation');
    console.log('');
    console.log('Usage: npm run test:integration [command]');
    process.exit(1);
  }
}

// Auto-execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Integration test execution failed:', error);
    process.exit(1);
  });
}