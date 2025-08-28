/**
 * Security Integration Tests Main Export
 */

export { SecurityTestRunner } from './test-runner';
export { SecurityReportGenerator } from './report-generator';
export { SecurityMonitor } from './monitor';
export * from './types';
export * from './config';

// Main function for programmatic usage
export async function runSecurityTests() {
  const { SecurityTestRunner } = await import('./test-runner');
  const runner = new SecurityTestRunner();
  return await runner.runAllTests();
}