#!/usr/bin/env node

/**
 * OWASP ZAP Security Scanner Automation
 * Automated vulnerability scanning for CODAI ecosystem
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OWASPZAPScanner {
  constructor() {
    this.zapPath = process.env.ZAP_PATH || 'zaproxy';
    this.targetUrls = [
      'https://memorai.codai.ro',
      'https://admin.codai.ro',
      'https://hub.codai.ro',
      'https://control.codai.ro',
      'https://romai.codai.ro',
      'https://bancai.codai.ro',
      'https://id.codai.ro',
      'https://apps.codai.ro',
      'https://api.codai.ro',
      'https://gateway.codai.ro'
    ];
    this.outputDir = path.join(__dirname, '../../reports/security');
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create output directory:', error);
    }
  }

  async runSpiderScan(targetUrl) {
    return new Promise((resolve, reject) => {
      console.log(`🕷️ Starting spider scan for ${targetUrl}...`);

      const zapProcess = spawn(this.zapPath, [
        '-daemon',
        '-host', '127.0.0.1',
        '-port', '8080',
        '-config', 'api.addrs.addr.name=.*',
        '-config', 'api.addrs.addr.regex=true'
      ]);

      setTimeout(async () => {
        try {
          // Spider scan via API
          const spiderUrl = `http://127.0.0.1:8080/JSON/spider/action/scan/?url=${encodeURIComponent(targetUrl)}`;
          const fetch = (await import('node-fetch')).default;

          const response = await fetch(spiderUrl);
          const result = await response.json();

          console.log(`✅ Spider scan completed for ${targetUrl}`);
          resolve(result);
        } catch (error) {
          console.error(`❌ Spider scan failed for ${targetUrl}:`, error);
          reject(error);
        }
      }, 5000);
    });
  }

  async runActiveScan(targetUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`🔍 Starting active scan for ${targetUrl}...`);

        const fetch = (await import('node-fetch')).default;
        const activeScanUrl = `http://127.0.0.1:8080/JSON/ascan/action/scan/?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(activeScanUrl);
        const result = await response.json();

        console.log(`✅ Active scan completed for ${targetUrl}`);
        resolve(result);
      } catch (error) {
        console.error(`❌ Active scan failed for ${targetUrl}:`, error);
        reject(error);
      }
    });
  }

  async generateReport(scanId, targetUrl) {
    try {
      const fetch = (await import('node-fetch')).default;
      const reportUrl = `http://127.0.0.1:8080/OTHER/core/other/htmlreport/`;

      const response = await fetch(reportUrl);
      const htmlReport = await response.text();

      const sanitizedUrl = targetUrl.replace(/[^a-zA-Z0-9]/g, '_');
      const reportPath = path.join(this.outputDir, `zap_report_${sanitizedUrl}.html`);

      await fs.writeFile(reportPath, htmlReport);
      console.log(`📄 Report generated: ${reportPath}`);

      return reportPath;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  async runSecurityScan() {
    console.log('🔒 Starting OWASP ZAP Security Scan for CODAI Ecosystem');
    console.log('='.repeat(60));

    await this.ensureOutputDir();

    const results = [];

    for (const targetUrl of this.targetUrls) {
      try {
        console.log(`\n🎯 Scanning: ${targetUrl}`);

        // Spider scan
        const spiderResult = await this.runSpiderScan(targetUrl);

        // Active scan
        const activeScanResult = await this.runActiveScan(targetUrl);

        // Generate report
        const reportPath = await this.generateReport(activeScanResult.scan, targetUrl);

        results.push({
          url: targetUrl,
          status: 'completed',
          spiderResult,
          activeScanResult,
          reportPath
        });

      } catch (error) {
        console.error(`❌ Scan failed for ${targetUrl}:`, error);
        results.push({
          url: targetUrl,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Generate summary report
    await this.generateSummaryReport(results);

    return results;
  }

  async generateSummaryReport(results) {
    const timestamp = new Date().toISOString();
    const summary = {
      timestamp,
      totalUrls: this.targetUrls.length,
      successful: results.filter(r => r.status === 'completed').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    };

    const summaryPath = path.join(this.outputDir, 'security_scan_summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    console.log('\n📊 Security Scan Summary:');
    console.log(`Total URLs: ${summary.totalUrls}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Summary report: ${summaryPath}`);

    return summary;
  }
}

// Alternative security testing without ZAP
class BasicSecurityTester {
  constructor() {
    this.targetUrls = [
      'https://memorai.codai.ro',
      'https://admin.codai.ro',
      'https://hub.codai.ro',
      'https://control.codai.ro',
      'https://romai.codai.ro',
      'https://bancai.codai.ro',
      'https://id.codai.ro',
      'https://apps.codai.ro',
      'https://api.codai.ro',
      'https://gateway.codai.ro'
    ];
  }

  async checkSecurityHeaders(url) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url, { method: 'HEAD' });

      const headers = response.headers;
      const securityHeaders = {
        'strict-transport-security': headers.get('strict-transport-security'),
        'content-security-policy': headers.get('content-security-policy'),
        'x-frame-options': headers.get('x-frame-options'),
        'x-content-type-options': headers.get('x-content-type-options'),
        'referrer-policy': headers.get('referrer-policy'),
        'permissions-policy': headers.get('permissions-policy')
      };

      const score = Object.values(securityHeaders).filter(h => h).length;

      return {
        url,
        headers: securityHeaders,
        score,
        maxScore: 6,
        grade: this.calculateGrade(score, 6)
      };
    } catch (error) {
      return {
        url,
        error: error.message,
        score: 0,
        maxScore: 6,
        grade: 'F'
      };
    }
  }

  calculateGrade(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  async runBasicSecurityTest() {
    console.log('🔒 Running Basic Security Header Tests');
    console.log('='.repeat(50));

    const results = [];

    for (const url of this.targetUrls) {
      console.log(`Testing: ${url}`);
      const result = await this.checkSecurityHeaders(url);
      results.push(result);

      if (result.error) {
        console.log(`❌ ${url} - Error: ${result.error}`);
      } else {
        console.log(`${result.grade === 'A+' || result.grade === 'A' ? '✅' : '⚠️'} ${url} - Grade: ${result.grade} (${result.score}/${result.maxScore})`);
      }
    }

    // Generate summary
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgGrade = this.calculateGrade(avgScore, 6);

    console.log('\n📊 Security Test Summary:');
    console.log(`Average Score: ${avgScore.toFixed(1)}/6`);
    console.log(`Average Grade: ${avgGrade}`);

    return { results, avgScore, avgGrade };
  }
}

// Main execution
async function main(): any {
  const args = process.argv.slice(2);
  const useZAP = args.includes('--zap');

  if (useZAP) {
    const scanner = new OWASPZAPScanner();
    await scanner.runSecurityScan();
  } else {
    const tester = new BasicSecurityTester();
    await tester.runBasicSecurityTest();
  }
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { OWASPZAPScanner, BasicSecurityTester };

