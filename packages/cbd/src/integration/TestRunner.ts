import { IntegrationTestExecutionEngine } from './TestExecutionEngine';
import { CBD_INTEGRATION_TEST_CONFIG } from './TestConfiguration';

/**
 * CBD Database Integration Test Runner
 * 
 * Main orchestration system for executing comprehensive integration tests.
 * Based on 2025 enterprise testing best practices and Microsoft Azure Well-Architected Framework.
 * 
 * @version 1.0.0
 * @description CBD Phase 9: System Integration Test Runner
 */

export interface TestRunnerOptions {
  environment?: string;
  suiteId?: string;
  verbose?: boolean;
  generateReport?: boolean;
  outputPath?: string;
  failFast?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export class IntegrationTestRunner {
  private executionEngine: IntegrationTestExecutionEngine;
  private options: Required<TestRunnerOptions>;

  constructor(options: TestRunnerOptions = {}) {
    this.options = {
      environment: options.environment || 'development',
      suiteId: options.suiteId || 'CBD_COMPLETE_INTEGRATION_TEST',
      verbose: options.verbose ?? true,
      generateReport: options.generateReport ?? true,
      outputPath: options.outputPath || './test-reports',
      failFast: options.failFast ?? false,
      maxRetries: options.maxRetries || 3,
      timeout: options.timeout || 300000 // 5 minutes default
    };

    this.executionEngine = new IntegrationTestExecutionEngine(
      CBD_INTEGRATION_TEST_CONFIG,
      this.options.verbose ? this.logHandler.bind(this) : undefined
    );
  }

  /**
   * Execute complete integration test suite
   */
  async run(): Promise<void> {
    console.log('🚀 CBD Database System Integration Tests');
    console.log('========================================');
    console.log(`Environment: ${this.options.environment}`);
    console.log(`Suite ID: ${this.options.suiteId}`);
    console.log(`Verbose: ${this.options.verbose}`);
    console.log(`Generate Report: ${this.options.generateReport}`);
    console.log('========================================\n');

    try {
      // Execute test suite with retries
      let lastError: Error | null = null;
      let attempt = 1;

      while (attempt <= this.options.maxRetries) {
        try {
          console.log(`📋 Test Execution Attempt ${attempt}/${this.options.maxRetries}`);
          
          const report = await Promise.race([
            this.executionEngine.executeCompleteTestSuite(
              this.options.suiteId,
              this.options.environment
            ),
            this.createTimeoutPromise()
          ]);

          // Test execution successful
          await this.handleTestResults(report);
          return;

        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.error(`❌ Test execution failed (attempt ${attempt}): ${lastError.message}`);
          
          if (attempt < this.options.maxRetries) {
            console.log(`⏳ Retrying in 30 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 30000));
          }
          
          attempt++;
        }
      }

      // All retries exhausted
      console.error(`🚨 Test execution failed after ${this.options.maxRetries} attempts`);
      throw lastError || new Error('Test execution failed');

    } catch (error) {
      console.error('🚨 Critical test execution error:', error);
      process.exit(1);
    }
  }

  /**
   * Handle test results and generate reports
   */
  private async handleTestResults(report: any): Promise<void> {
    console.log('\n📊 Test Execution Complete');
    console.log('============================');
    console.log(`Duration: ${report.totalDuration}ms`);
    console.log(`Scenarios Executed: ${report.scenariosExecuted}`);
    console.log(`Scenarios Passed: ${report.scenariosPassed}`);
    console.log(`Scenarios Failed: ${report.scenariosFailed}`);
    console.log(`Scenarios Skipped: ${report.scenariosSkipped}`);
    console.log(`Overall Status: ${report.overallStatus}`);

    // Display success rate with color coding
    const successRate = (report.scenariosPassed / report.scenariosExecuted) * 100;
    const successColor = successRate >= 95 ? '🟢' : successRate >= 80 ? '🟡' : '🔴';
    console.log(`Success Rate: ${successColor} ${successRate.toFixed(1)}%`);

    // Display summary scores
    console.log('\n🎯 System Readiness Scores:');
    console.log(`Performance: ${report.summary.performanceScore.toFixed(1)}/100`);
    console.log(`Reliability: ${report.summary.reliabilityScore.toFixed(1)}/100`);
    console.log(`Security: ${report.summary.securityScore.toFixed(1)}/100`);
    console.log(`Overall Readiness: ${report.summary.readinessScore.toFixed(1)}/100`);

    // Display critical issues
    if (report.summary.criticalIssues > 0) {
      console.log(`\n🚨 Critical Issues: ${report.summary.criticalIssues}`);
    }

    // Display key findings
    console.log('\n📋 Key Findings:');
    report.summary.keyFindings.forEach((finding: string, index: number) => {
      console.log(`  ${index + 1}. ${finding}`);
    });

    // Display failed scenarios
    const failedScenarios = report.scenarioResults.filter((result: any) => result.status === 'FAILED');
    if (failedScenarios.length > 0) {
      console.log('\n❌ Failed Scenarios:');
      failedScenarios.forEach((scenario: any) => {
        console.log(`  • ${scenario.scenarioId}: ${scenario.scenarioName}`);
        if (scenario.errorMessage) {
          console.log(`    Error: ${scenario.errorMessage}`);
        }
      });
    }

    // Display recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec: any, index: number) => {
        const severityIcon = rec.severity === 'CRITICAL' ? '🚨' : 
                           rec.severity === 'HIGH' ? '🔴' : 
                           rec.severity === 'MEDIUM' ? '🟡' : '🟢';
        console.log(`  ${severityIcon} [${rec.category}] ${rec.title}`);
        console.log(`     ${rec.description}`);
        console.log(`     Impact: ${rec.impact}`);
        console.log(`     Effort: ${rec.effort}`);
      });
    }

    // Generate detailed report if requested
    if (this.options.generateReport) {
      await this.generateDetailedReport(report);
    }

    // Exit with appropriate code
    if (report.overallStatus === 'FAILED') {
      console.log('\n🚨 Integration tests failed. System is not ready for production.');
      if (this.options.failFast) {
        process.exit(1);
      }
    } else if (report.overallStatus === 'WARNING') {
      console.log('\n⚠️ Integration tests completed with warnings. Review recommendations before production.');
    } else {
      console.log('\n✅ Integration tests passed! System is ready for production deployment.');
    }
  }

  /**
   * Generate detailed test report
   */
  private async generateDetailedReport(report: any): Promise<void> {
    console.log('\n📄 Generating detailed test report...');
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Ensure output directory exists
      await fs.mkdir(this.options.outputPath, { recursive: true });
      
      // Generate JSON report
      const jsonReportPath = path.join(this.options.outputPath, `integration-test-report-${Date.now()}.json`);
      await fs.writeFile(jsonReportPath, JSON.stringify(report, null, 2));
      
      // Generate HTML report
      const htmlReportPath = path.join(this.options.outputPath, `integration-test-report-${Date.now()}.html`);
      const htmlContent = this.generateHtmlReport(report);
      await fs.writeFile(htmlReportPath, htmlContent);
      
      // Generate markdown summary
      const mdReportPath = path.join(this.options.outputPath, `integration-test-summary-${Date.now()}.md`);
      const mdContent = this.generateMarkdownReport(report);
      await fs.writeFile(mdReportPath, mdContent);
      
      console.log(`📁 Reports generated in: ${this.options.outputPath}`);
      console.log(`   • JSON Report: ${jsonReportPath}`);
      console.log(`   • HTML Report: ${htmlReportPath}`);
      console.log(`   • Markdown Summary: ${mdReportPath}`);
      
    } catch (error) {
      console.error('⚠️ Failed to generate detailed report:', error);
    }
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(report: any): string {
    const successRate = (report.scenariosPassed / report.scenariosExecuted) * 100;
    const statusColor = report.overallStatus === 'PASSED' ? '#4CAF50' : 
                       report.overallStatus === 'WARNING' ? '#FF9800' : '#F44336';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CBD Database Integration Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { display: inline-block; padding: 8px 16px; border-radius: 4px; color: white; font-weight: bold; background-color: ${statusColor}; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 4px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .metric-label { color: #666; margin-top: 5px; }
        .scenario-results { margin-top: 30px; }
        .scenario { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .scenario.passed { background-color: #d4edda; border-left: 4px solid #28a745; }
        .scenario.failed { background-color: #f8d7da; border-left: 4px solid #dc3545; }
        .scenario.skipped { background-color: #fff3cd; border-left: 4px solid #ffc107; }
        .recommendations { margin-top: 30px; }
        .recommendation { margin: 10px 0; padding: 15px; border-radius: 4px; background-color: #e7f3ff; border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CBD Database Integration Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <div class="status">${report.overallStatus}</div>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${successRate.toFixed(1)}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.totalDuration}ms</div>
                <div class="metric-label">Total Duration</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.scenariosExecuted}</div>
                <div class="metric-label">Scenarios Executed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.readinessScore.toFixed(1)}/100</div>
                <div class="metric-label">Readiness Score</div>
            </div>
        </div>

        <div class="scenario-results">
            <h2>Scenario Results</h2>
            ${report.scenarioResults.map((scenario: any) => `
                <div class="scenario ${scenario.status.toLowerCase()}">
                    <strong>${scenario.scenarioId}</strong>: ${scenario.scenarioName}
                    <br>Duration: ${scenario.duration}ms | Status: ${scenario.status}
                    ${scenario.errorMessage ? `<br><em>Error: ${scenario.errorMessage}</em>` : ''}
                </div>
            `).join('')}
        </div>

        ${report.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>Recommendations</h2>
            ${report.recommendations.map((rec: any) => `
                <div class="recommendation">
                    <strong>[${rec.category}] ${rec.title}</strong>
                    <p>${rec.description}</p>
                    <p><strong>Impact:</strong> ${rec.impact}</p>
                    <p><strong>Effort:</strong> ${rec.effort}</p>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(report: any): string {
    const successRate = (report.scenariosPassed / report.scenariosExecuted) * 100;
    const statusEmoji = report.overallStatus === 'PASSED' ? '✅' : 
                       report.overallStatus === 'WARNING' ? '⚠️' : '❌';

    return `# CBD Database Integration Test Report

${statusEmoji} **Overall Status:** ${report.overallStatus}

**Generated:** ${new Date().toLocaleString()}

## Executive Summary

- **Success Rate:** ${successRate.toFixed(1)}%
- **Total Duration:** ${report.totalDuration}ms
- **Scenarios Executed:** ${report.scenariosExecuted}
- **Scenarios Passed:** ${report.scenariosPassed}
- **Scenarios Failed:** ${report.scenariosFailed}
- **Scenarios Skipped:** ${report.scenariosSkipped}

## System Readiness Scores

| Metric | Score |
|--------|-------|
| Performance | ${report.summary.performanceScore.toFixed(1)}/100 |
| Reliability | ${report.summary.reliabilityScore.toFixed(1)}/100 |
| Security | ${report.summary.securityScore.toFixed(1)}/100 |
| **Overall Readiness** | **${report.summary.readinessScore.toFixed(1)}/100** |

## Key Findings

${report.summary.keyFindings.map((finding: string) => `- ${finding}`).join('\n')}

## Scenario Results

${report.scenarioResults.map((scenario: any) => {
  const statusEmoji = scenario.status === 'PASSED' ? '✅' : 
                     scenario.status === 'FAILED' ? '❌' : '⏭️';
  return `### ${statusEmoji} ${scenario.scenarioId}: ${scenario.scenarioName}
- **Status:** ${scenario.status}
- **Duration:** ${scenario.duration}ms
${scenario.errorMessage ? `- **Error:** ${scenario.errorMessage}` : ''}
`;
}).join('\n')}

${report.recommendations.length > 0 ? `## Recommendations

${report.recommendations.map((rec: any) => {
  const severityEmoji = rec.severity === 'CRITICAL' ? '🚨' : 
                       rec.severity === 'HIGH' ? '🔴' : 
                       rec.severity === 'MEDIUM' ? '🟡' : '🟢';
  return `### ${severityEmoji} [${rec.category}] ${rec.title}

${rec.description}

- **Impact:** ${rec.impact}
- **Effort:** ${rec.effort}
- **Action Items:**
${rec.actionItems.map((item: string) => `  - ${item}`).join('\n')}
`;
}).join('\n')}` : ''}

## Conclusion

${report.overallStatus === 'PASSED' ? 
  '✅ **System is ready for production deployment.** All critical tests passed successfully.' :
  report.overallStatus === 'WARNING' ?
  '⚠️ **System requires attention before production deployment.** Review recommendations and address warnings.' :
  '❌ **System is not ready for production deployment.** Critical issues must be resolved.'}

---

*Report generated by CBD Database Integration Test Suite v1.0.0*
`;
  }

  /**
   * Create timeout promise for test execution
   */
  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Test execution timed out after ${this.options.timeout}ms`));
      }, this.options.timeout);
    });
  }

  /**
   * Log handler for test execution events
   */
  private logHandler(log: any): void {
    if (this.options.verbose) {
      const timestamp = log.timestamp.toISOString();
      const level = log.level.padEnd(5);
      const category = log.category.padEnd(20);
      console.log(`[${timestamp}] ${level} [${category}] ${log.message}`);
      
      if (log.metadata && Object.keys(log.metadata).length > 0) {
        console.log('  Metadata:', JSON.stringify(log.metadata, null, 2));
      }
    }
  }
}

/**
 * CLI interface for running integration tests
 */
export async function runIntegrationTests(options?: TestRunnerOptions): Promise<void> {
  const runner = new IntegrationTestRunner(options);
  await runner.run();
}

// Export for direct usage
export default IntegrationTestRunner;