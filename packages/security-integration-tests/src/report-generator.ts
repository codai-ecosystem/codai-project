/**
 * Security Report Generator
 * Generate comprehensive security test reports for Essential CodAI Services
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { TestExecution, SecurityFinding } from './types';

export class SecurityReportGenerator {
  /**
   * Generate comprehensive security report
   */
  async generateReport(executions: TestExecution[], outputDir: string): Promise<void> {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Generate JSON report
    await this.generateJsonReport(executions, outputDir);

    // Generate HTML report
    await this.generateHtmlReport(executions, outputDir);
  }

  /**
   * Generate report from existing results file
   */
  async generateReportFromFile(inputFile: string, outputDir: string, format: string): Promise<void> {
    const fs = await import('fs');
    const executions = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    if (format.includes('json')) {
      await this.generateJsonReport(executions, outputDir);
    }

    if (format.includes('html')) {
      await this.generateHtmlReport(executions, outputDir);
    }
  }

  /**
   * Generate JSON report
   */
  private async generateJsonReport(executions: TestExecution[], outputDir: string): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(executions),
      executions,
      findings: this.extractFindings(executions)
    };

    const filePath = join(outputDir, 'security-test-report.json');
    writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Generate HTML report
   */
  private async generateHtmlReport(executions: TestExecution[], outputDir: string): Promise<void> {
    const summary = this.generateSummary(executions);
    const findings = this.extractFindings(executions);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Essential CodAI Services - Security Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .danger { color: #dc3545; }
        .findings { margin: 20px 0; }
        .finding { border: 1px solid #ddd; margin: 10px 0; border-radius: 5px; overflow: hidden; }
        .finding-header { padding: 15px; cursor: pointer; }
        .finding-content { padding: 15px; background: #f8f9fa; display: none; }
        .severity-critical { border-left: 5px solid #dc3545; }
        .severity-high { border-left: 5px solid #fd7e14; }
        .severity-medium { border-left: 5px solid #ffc107; }
        .severity-low { border-left: 5px solid #28a745; }
        .severity-info { border-left: 5px solid #17a2b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Essential CodAI Services</h1>
            <h2>Security Integration Test Report</h2>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${summary.totalExecutions}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value success">${summary.passed}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value danger">${summary.failed}</div>
            </div>
            <div class="metric">
                <h3>Security Findings</h3>
                <div class="value warning">${summary.totalFindings}</div>
            </div>
            <div class="metric">
                <h3>Security Score</h3>
                <div class="value ${summary.securityScore >= 80 ? 'success' : summary.securityScore >= 60 ? 'warning' : 'danger'}">${summary.securityScore}/100</div>
            </div>
        </div>

        <div class="findings">
            <h3>🔍 Security Findings (${findings.length})</h3>
            ${findings.map((finding, index) => `
                <div class="finding severity-${finding.severity}">
                    <div class="finding-header" onclick="toggleFinding(${index})">
                        <strong>[${finding.severity.toUpperCase()}] ${finding.title}</strong>
                        <span style="float: right;">▼</span>
                    </div>
                    <div class="finding-content" id="finding-${index}">
                        <p><strong>Description:</strong> ${finding.description}</p>
                        <p><strong>Impact:</strong> ${finding.impact}</p>
                        <p><strong>Recommendation:</strong> ${finding.recommendation}</p>
                        ${finding.cweId ? `<p><strong>CWE ID:</strong> ${finding.cweId}</p>` : ''}
                        ${finding.cvssScore ? `<p><strong>CVSS Score:</strong> ${finding.cvssScore}</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        function toggleFinding(index) {
            const content = document.getElementById('finding-' + index);
            const header = content.previousElementSibling;
            const arrow = header.querySelector('span');
            
            if (content.style.display === 'none' || content.style.display === '') {
                content.style.display = 'block';
                arrow.textContent = '▲';
            } else {
                content.style.display = 'none';
                arrow.textContent = '▼';
            }
        }
    </script>
</body>
</html>`;

    const filePath = join(outputDir, 'security-test-report.html');
    writeFileSync(filePath, html);
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(executions: TestExecution[]): any {
    const findings = this.extractFindings(executions);

    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;
    const mediumFindings = findings.filter(f => f.severity === 'medium').length;

    const securityScore = Math.max(0, 100 - (criticalFindings * 25) - (highFindings * 10) - (mediumFindings * 5));

    return {
      totalExecutions: executions.length,
      passed: executions.filter(e => e.status === 'passed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      totalFindings: findings.length,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings: findings.filter(f => f.severity === 'low').length,
      infoFindings: findings.filter(f => f.severity === 'info').length,
      securityScore,
      averageResponseTime: executions.reduce((sum, e) => sum + e.metrics.averageResponseTime, 0) / executions.length || 0
    };
  }

  /**
   * Extract all security findings
   */
  private extractFindings(executions: TestExecution[]): SecurityFinding[] {
    return executions.flatMap(execution =>
      execution.results.flatMap(result => result.securityFindings)
    );
  }
}