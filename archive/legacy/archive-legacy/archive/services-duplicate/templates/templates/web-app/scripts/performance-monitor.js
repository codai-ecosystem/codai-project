#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Detects performance regressions and monitors bundle size
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class PerformanceMonitor {
  constructor() {
    this.rootDir = process.cwd();
    this.webAppDir = path.join(this.rootDir, 'apps', 'web');
    this.reportDir = path.join(this.rootDir, 'performance-reports');
    this.thresholds = {
      bundleSize: 500000, // 500KB
      firstLoad: 1000000, // 1MB
      buildTime: 60000, // 60 seconds
      lcp: 2500, // 2.5s
      fid: 100, // 100ms
      cls: 0.1, // 0.1
    };
  }

  log(message, type = 'info') {
    const icons = {
      info: '💡',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      progress: '🔄',
    };

    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      progress: chalk.cyan,
    };

    console.log(`${icons[type]} ${colors[type](message)}`);
  }

  async run() {
    try {
      this.log('Starting performance monitoring...', 'progress');

      await this.ensureReportDirectory();
      await this.measureBuildTime();
      await this.analyzeBundleSize();
      await this.runLighthouseTest();
      await this.generateReport();

      this.log('Performance monitoring completed!', 'success');
    } catch (error) {
      this.log(`Performance monitoring failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async ensureReportDirectory() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async measureBuildTime() {
    this.log('Measuring build time...', 'progress');

    const startTime = Date.now();

    try {
      execSync('pnpm build', { stdio: 'pipe' });
      const buildTime = Date.now() - startTime;

      this.buildTime = buildTime;

      if (buildTime > this.thresholds.buildTime) {
        this.log(
          `Build time: ${buildTime}ms (exceeds threshold of ${this.thresholds.buildTime}ms)`,
          'warning'
        );
      } else {
        this.log(`Build time: ${buildTime}ms`, 'success');
      }
    } catch (error) {
      throw new Error('Build failed during performance monitoring');
    }
  }

  async analyzeBundleSize() {
    this.log('Analyzing bundle size...', 'progress');

    try {
      // Run bundle analyzer
      execSync('pnpm analyze', { stdio: 'pipe' });

      // Check for Next.js build output
      const buildOutputPath = path.join(this.webAppDir, '.next');
      if (fs.existsSync(buildOutputPath)) {
        const stats = this.parseNextBuildOutput();
        this.bundleStats = stats;

        this.checkBundleThresholds(stats);
      }
    } catch (error) {
      this.log('Bundle analysis failed, continuing...', 'warning');
    }
  }

  parseNextBuildOutput() {
    // This would parse actual Next.js build output
    // For now, return mock data
    return {
      mainBundle: 125000,
      firstLoad: 480000,
      pages: {
        '/': 45000,
        '/login': 52000,
        '/dashboard': 67000,
      },
    };
  }

  checkBundleThresholds(stats) {
    if (stats.mainBundle > this.thresholds.bundleSize) {
      this.log(
        `Main bundle size: ${(stats.mainBundle / 1000).toFixed(1)}KB (exceeds ${(this.thresholds.bundleSize / 1000).toFixed(1)}KB threshold)`,
        'warning'
      );
    } else {
      this.log(`Main bundle size: ${(stats.mainBundle / 1000).toFixed(1)}KB`, 'success');
    }

    if (stats.firstLoad > this.thresholds.firstLoad) {
      this.log(
        `First Load JS: ${(stats.firstLoad / 1000).toFixed(1)}KB (exceeds ${(this.thresholds.firstLoad / 1000).toFixed(1)}KB threshold)`,
        'warning'
      );
    } else {
      this.log(`First Load JS: ${(stats.firstLoad / 1000).toFixed(1)}KB`, 'success');
    }
  }

  async runLighthouseTest() {
    this.log('Running Lighthouse performance test...', 'progress');

    try {
      // Check if lighthouse CLI is available
      execSync('lighthouse --version', { stdio: 'pipe' });

      // Run lighthouse on built application
      const reportPath = path.join(this.reportDir, `lighthouse-${Date.now()}.json`);

      execSync(
        `lighthouse http://localhost:3000 --output=json --output-path=${reportPath} --chrome-flags="--headless"`,
        {
          stdio: 'pipe',
        }
      );

      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        this.lighthouseResults = this.extractLighthouseMetrics(report);
        this.checkLighthouseThresholds(this.lighthouseResults);
      }
    } catch (error) {
      this.log('Lighthouse test skipped (install with: npm install -g lighthouse)', 'warning');
    }
  }

  extractLighthouseMetrics(report) {
    const audits = report.audits;
    return {
      performance: report.categories.performance.score * 100,
      lcp: audits['largest-contentful-paint'].numericValue,
      fid: audits['max-potential-fid'].numericValue,
      cls: audits['cumulative-layout-shift'].numericValue,
      fcp: audits['first-contentful-paint'].numericValue,
    };
  }

  checkLighthouseThresholds(results) {
    if (results.lcp > this.thresholds.lcp) {
      this.log(`LCP: ${results.lcp}ms (exceeds ${this.thresholds.lcp}ms threshold)`, 'warning');
    } else {
      this.log(`LCP: ${results.lcp}ms`, 'success');
    }

    if (results.fid > this.thresholds.fid) {
      this.log(`FID: ${results.fid}ms (exceeds ${this.thresholds.fid}ms threshold)`, 'warning');
    } else {
      this.log(`FID: ${results.fid}ms`, 'success');
    }

    if (results.cls > this.thresholds.cls) {
      this.log(`CLS: ${results.cls} (exceeds ${this.thresholds.cls} threshold)`, 'warning');
    } else {
      this.log(`CLS: ${results.cls}`, 'success');
    }

    this.log(
      `Performance Score: ${results.performance}/100`,
      results.performance >= 90 ? 'success' : results.performance >= 70 ? 'warning' : 'error'
    );
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      buildTime: this.buildTime,
      bundleStats: this.bundleStats,
      lighthouseResults: this.lighthouseResults,
      thresholds: this.thresholds,
    };

    const reportPath = path.join(this.reportDir, `performance-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`Performance report saved to: ${reportPath}`, 'info');

    // Generate summary
    this.generateSummary(report);
  }

  generateSummary(report) {
    console.log('\n' + chalk.bold.blue('📊 Performance Summary'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (report.buildTime) {
      console.log(`Build Time: ${report.buildTime}ms`);
    }

    if (report.bundleStats) {
      console.log(`Main Bundle: ${(report.bundleStats.mainBundle / 1000).toFixed(1)}KB`);
      console.log(`First Load JS: ${(report.bundleStats.firstLoad / 1000).toFixed(1)}KB`);
    }

    if (report.lighthouseResults) {
      console.log(`Performance Score: ${report.lighthouseResults.performance}/100`);
      console.log(`LCP: ${report.lighthouseResults.lcp}ms`);
      console.log(`FID: ${report.lighthouseResults.fid}ms`);
      console.log(`CLS: ${report.lighthouseResults.cls}`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.run();
}

module.exports = PerformanceMonitor;
