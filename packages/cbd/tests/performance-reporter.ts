// Module configuration\nexport interface ModuleConfig {\n  [key: string]: any;\n}\n\n/**
 * Performance Reporter for Jest
 * Custom reporter to track and analyze test performance
 */

import fs from 'fs';
import path from 'path';

class PerformanceReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
    this.testResults = [];
    this.performanceMetrics = {
      totalTests: 0,
      totalTime: 0,
      slowTests: [],
      fastTests: [],
      memoryUsage: [],
      coverageData: null
    };
  }

  onRunStart(results, options) {
    console.log('📊 Starting performance monitoring...');
    this.startTime = Date.now();
    this.initialMemory = process.memoryUsage();
  }

  onTestResult(test, testResult, aggregatedResult) {
    // Track individual test performance
    testResult.testResults.forEach(result => {
      const testPerformance = {
        name: result.fullName || result.title,
        duration: result.duration || 0,
        status: result.status,
        file: test.path
      };

      this.testResults.push(testPerformance);

      // Categorize slow/fast tests
      if (testPerformance.duration > 1000) { // > 1 second
        this.performanceMetrics.slowTests.push(testPerformance);
      } else if (testPerformance.duration < 100) { // < 100ms
        this.performanceMetrics.fastTests.push(testPerformance);
      }
    });

    // Track memory usage
    const currentMemory = process.memoryUsage();
    this.performanceMetrics.memoryUsage.push({
      test: test.path,
      heapUsed: currentMemory.heapUsed,
      heapTotal: currentMemory.heapTotal,
      external: currentMemory.external,
      timestamp: Date.now()
    });
  }

  onRunComplete(contexts, results) {
    this.endTime = Date.now();
    this.performanceMetrics.totalTime = this.endTime - this.startTime;
    this.performanceMetrics.totalTests = results.numTotalTests;
    this.performanceMetrics.coverageData = results.coverageMap;

    // Generate performance report
    this.generatePerformanceReport();
    
    // Log performance summary
    this.logPerformanceSummary();
  }

  generatePerformanceReport() {
    const reportData = {
      summary: {
        totalTests: this.performanceMetrics.totalTests,
        totalTime: this.performanceMetrics.totalTime,
        averageTimePerTest: this.performanceMetrics.totalTime / this.performanceMetrics.totalTests,
        slowTestCount: this.performanceMetrics.slowTests.length,
        fastTestCount: this.performanceMetrics.fastTests.length
      },
      slowTests: this.performanceMetrics.slowTests
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10), // Top 10 slowest
      fastTests: this.performanceMetrics.fastTests
        .sort((a, b) => a.duration - b.duration)
        .slice(0, 10), // Top 10 fastest
      memoryAnalysis: this.analyzeMemoryUsage(),
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };

    // Write performance report
    const reportPath = path.join(process.cwd(), 'test-results', 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

    // Generate HTML report
    this.generateHTMLReport(reportData);
  }

  analyzeMemoryUsage() {
    if (this.performanceMetrics.memoryUsage.length === 0) {
      return null;
    }

    const memoryData = this.performanceMetrics.memoryUsage;
    const initialMemory = memoryData[0];
    const finalMemory = memoryData[memoryData.length - 1];

    return {
      initialHeapUsed: initialMemory.heapUsed,
      finalHeapUsed: finalMemory.heapUsed,
      memoryGrowth: finalMemory.heapUsed - initialMemory.heapUsed,
      peakHeapUsed: Math.max(...memoryData.map(m => m.heapUsed)),
      averageHeapUsed: memoryData.reduce((sum, m) => sum + m.heapUsed, 0) / memoryData.length
    };
  }

  generateRecommendations() {
    const recommendations = [];

    // Slow test recommendations
    if (this.performanceMetrics.slowTests.length > 0) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        message: `${this.performanceMetrics.slowTests.length} tests are running slowly (>1s). Consider optimizing these tests.`,
        tests: this.performanceMetrics.slowTests.map(t => t.name)
      });
    }

    // Memory usage recommendations
    const memoryAnalysis = this.analyzeMemoryUsage();
    if (memoryAnalysis && memoryAnalysis.memoryGrowth > 50 * 1024 * 1024) { // 50MB
      recommendations.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory growth detected during test execution. Check for memory leaks.',
        memoryGrowth: memoryAnalysis.memoryGrowth
      });
    }

    // Test coverage recommendations
    if (this.performanceMetrics.coverageData) {
      const coverage = this.performanceMetrics.coverageData.getCoverageSummary();
      if (coverage.lines.pct < 80) {
        recommendations.push({
          type: 'coverage',
          severity: 'medium',
          message: `Line coverage is ${coverage.lines.pct}%, below the 80% threshold.`,
          currentCoverage: coverage.lines.pct
        });
      }
    }

    return recommendations;
  }

  generateHTMLReport(reportData) {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .metric { display: inline-block; margin-right: 20px; }
        .slow-tests { background: #ffe6e6; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .fast-tests { background: #e6ffe6; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .severity-high { color: #d32f2f; }
        .severity-medium { color: #f57c00; }
        .severity-low { color: #388e3c; }
    </style>
</head>
<body>
    <h1>Test Performance Report</h1>
    <p>Generated: ${reportData.timestamp}</p>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric"><strong>Total Tests:</strong> ${reportData.summary.totalTests}</div>
        <div class="metric"><strong>Total Time:</strong> ${(reportData.summary.totalTime / 1000).toFixed(2)}s</div>
        <div class="metric"><strong>Average Time:</strong> ${reportData.summary.averageTimePerTest.toFixed(2)}ms</div>
        <div class="metric"><strong>Slow Tests:</strong> ${reportData.summary.slowTestCount}</div>
        <div class="metric"><strong>Fast Tests:</strong> ${reportData.summary.fastTestCount}</div>
    </div>
    
    <div class="slow-tests">
        <h2>Slowest Tests</h2>
        <table>
            <tr><th>Test Name</th><th>Duration (ms)</th><th>File</th></tr>
            ${reportData.slowTests.map(test => 
              `<tr><td>${test.name}</td><td>${test.duration}</td><td>${test.file}</td></tr>`
            ).join('')}
        </table>
    </div>
    
    <div class="recommendations">
        <h2>Recommendations</h2>
        ${reportData.recommendations.map(rec => 
          `<div class="severity-${rec.severity}"><strong>${rec.type.toUpperCase()}:</strong> ${rec.message}</div>`
        ).join('')}
    </div>
</body>
</html>`;

    const htmlPath = path.join(process.cwd(), 'test-results', 'performance-report.html');
    fs.writeFileSync(htmlPath, htmlTemplate);
  }

  logPerformanceSummary() {
    console.log('\n📊 Performance Summary:');
    console.log(`   Total Tests: ${this.performanceMetrics.totalTests}`);
    console.log(`   Total Time: ${(this.performanceMetrics.totalTime / 1000).toFixed(2)}s`);
    console.log(`   Average Time per Test: ${(this.performanceMetrics.totalTime / this.performanceMetrics.totalTests).toFixed(2)}ms`);
    console.log(`   Slow Tests (>1s): ${this.performanceMetrics.slowTests.length}`);
    console.log(`   Fast Tests (<100ms): ${this.performanceMetrics.fastTests.length}`);

    if (this.performanceMetrics.slowTests.length > 0) {
      console.log('\n⚠️  Slowest Tests:');
      this.performanceMetrics.slowTests
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .forEach(test => {
          console.log(`   ${test.name}: ${test.duration}ms`);
        });
    }

    const memoryAnalysis = this.analyzeMemoryUsage();
    if (memoryAnalysis) {
      console.log('\n🧠 Memory Usage:');
      console.log(`   Memory Growth: ${(memoryAnalysis.memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
      console.log(`   Peak Heap: ${(memoryAnalysis.peakHeapUsed / 1024 / 1024).toFixed(2)}MB`);
    }

    console.log('\n📈 Full report: test-results/performance-report.html\n');
  }
}

export default PerformanceReporter;

