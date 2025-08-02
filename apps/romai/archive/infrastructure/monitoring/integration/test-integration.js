#!/usr/bin/env node

/**
 * ROMAI Day 21 Integration Test Runner
 * Executes comprehensive integration tests for the complete monitoring ecosystem
 */

const { IntegrationTestController } = require('./integration-controller.js');

class IntegrationTestRunner {
  constructor() {
    this.controller = new IntegrationTestController();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.controller.on('integration-started', (data) => {
      console.log(`🚀 Integration Testing Started - ${data.totalTests} tests queued`);
      console.log(`⏰ Timestamp: ${data.timestamp}`);
      console.log('═'.repeat(80));
    });

    this.controller.on('test-completed', (data) => {
      const { test } = data;
      const status = test.status === 'passed' ? '✅' : '❌';
      const duration = test.duration ? `(${test.duration}ms)` : '';
      console.log(`${status} ${test.name} ${duration}`);

      if (test.status === 'failed') {
        console.log(`   Error: ${test.error}`);
      }
    });

    this.controller.on('integration-completed', (data) => {
      console.log('═'.repeat(80));
      console.log(`🎉 Integration Testing Completed Successfully!`);
      console.log(`⏱️  Total Duration: ${Math.round(data.duration / 1000)}s`);
      console.log(`📊 Results: ${data.results.passed}/${data.results.totalTests} tests passed`);
      console.log(`💯 Success Rate: ${data.results.successRate}%`);
      console.log('═'.repeat(80));
    });

    this.controller.on('integration-failed', (data) => {
      console.log('═'.repeat(80));
      console.log(`❌ Integration Testing Failed!`);
      console.log(`⏱️  Duration: ${Math.round(data.duration / 1000)}s`);
      console.log(`💥 Error: ${data.error}`);
      console.log('═'.repeat(80));
    });
  }

  async run() {
    try {
      console.log('🎯 ROMAI Day 21: Integration & Testing Suite');
      console.log('📅 Phase 4 Week 3 - Complete Monitoring Ecosystem Validation');
      console.log('🔍 Testing: ELK Stack + Analytics + Performance Optimization');
      console.log('');

      await this.controller.runIntegrationTests();

      const results = this.controller.getTestResults();
      const health = this.controller.getSystemHealth();

      // Generate detailed report
      this.generateDetailedReport(results, health);

      return {
        success: results.successRate >= 80 && health.overall.score >= 70,
        results,
        health
      };

    } catch (error) {
      console.error('💥 Integration test runner failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateDetailedReport(results, health) {
    console.log('\n📋 DETAILED INTEGRATION REPORT');
    console.log('═'.repeat(80));

    // Test Results Summary
    console.log('🧪 TEST RESULTS SUMMARY:');
    console.log(`   Total Tests Executed: ${results.totalTests}`);
    console.log(`   Tests Passed: ${results.passed}`);
    console.log(`   Tests Failed: ${results.failed}`);
    console.log(`   Overall Success Rate: ${results.successRate}%`);
    console.log('');

    // Test Categories
    const categories = {
      connectivity: results.tests.filter(t => t.id.includes('connectivity')),
      integration: results.tests.filter(t => t.id.includes('integration') || t.id.includes('sync')),
      performance: results.tests.filter(t => t.id.includes('load') || t.id.includes('throughput')),
      stress: results.tests.filter(t => t.id.includes('stress') || t.id.includes('failover'))
    };

    console.log('📊 TEST RESULTS BY CATEGORY:');
    Object.entries(categories).forEach(([category, tests]) => {
      const passed = tests.filter(t => t.status === 'passed').length;
      const total = tests.length;
      const rate = total > 0 ? Math.round((passed / total) * 100) : 0;
      console.log(`   ${category.toUpperCase()}: ${passed}/${total} passed (${rate}%)`);
    });
    console.log('');

    // System Health Summary
    console.log('🏥 SYSTEM HEALTH SUMMARY:');
    console.log(`   Overall Health Score: ${health.overall.score}/100`);
    console.log(`   System Status: ${health.overall.status.toUpperCase()}`);
    console.log(`   System Uptime: ${Math.round(health.overall.uptime / 1000)}s`);
    console.log('');

    console.log('📡 ELK STACK HEALTH:');
    Object.entries(health.elkStack).forEach(([component, status]) => {
      const icon = status ? '✅' : '❌';
      console.log(`   ${icon} ${component}: ${status ? 'HEALTHY' : 'UNAVAILABLE'}`);
    });
    console.log('');

    console.log('🖥️  MONITORING SERVERS HEALTH:');
    Object.entries(health.monitoring).forEach(([server, status]) => {
      const icon = status ? '✅' : '❌';
      const description = {
        simpleServer: 'Simple WebSocket Server (8765)',
        analyticsServer: 'Analytics Server (8766)',
        performanceServer: 'Performance Optimization Server (8767)'
      }[server];
      console.log(`   ${icon} ${description}: ${status ? 'HEALTHY' : 'UNAVAILABLE'}`);
    });
    console.log('');

    // Performance Highlights
    const performanceTest = results.tests.find(t => t.id === 'concurrent-load-test');
    if (performanceTest?.result) {
      console.log('⚡ PERFORMANCE HIGHLIGHTS:');
      console.log(`   Concurrent Connections: ${performanceTest.result.concurrentConnections}`);
      console.log(`   Average Response Time: ${performanceTest.result.averageResponseTime}`);
      console.log(`   System Throughput: ${performanceTest.result.throughput}`);
      console.log(`   Error Rate: ${performanceTest.result.errorRate}`);
      console.log(`   CPU Usage: ${performanceTest.result.cpuUsage}`);
      console.log(`   Memory Usage: ${performanceTest.result.memoryUsage}`);
      console.log('');
    }

    // Integration Success Metrics
    const integrationTest = results.tests.find(t => t.id === 'analytics-performance-sync');
    if (integrationTest?.result) {
      console.log('🔄 INTEGRATION SUCCESS METRICS:');
      console.log(`   Analytics Predictions: ${integrationTest.result.analyticsPredictions}`);
      console.log(`   Performance Optimizations: ${integrationTest.result.performanceOptimizations}`);
      console.log(`   Sync Success Rate: ${integrationTest.result.syncSuccessRate}%`);
      console.log(`   Average Latency: ${integrationTest.result.latency}`);
      console.log(`   Data Consistency: ${integrationTest.result.dataConsistency ? 'MAINTAINED' : 'ISSUES DETECTED'}`);
      console.log('');
    }

    // Final Assessment
    console.log('🎯 FINAL ASSESSMENT:');
    if (results.successRate >= 90 && health.overall.score >= 85) {
      console.log('   🏆 EXCELLENT: System exceeds enterprise standards');
    } else if (results.successRate >= 80 && health.overall.score >= 70) {
      console.log('   ✅ GOOD: System meets production requirements');
    } else if (results.successRate >= 70 && health.overall.score >= 60) {
      console.log('   ⚠️  ACCEPTABLE: System needs optimization');
    } else {
      console.log('   ❌ NEEDS ATTENTION: System requires immediate fixes');
    }

    console.log('═'.repeat(80));
  }
}

// CLI execution
if (require.main === module) {
  const runner = new IntegrationTestRunner();

  runner.run()
    .then((result) => {
      if (result.success) {
        console.log('🏆 Day 21 Integration & Testing: COMPLETED SUCCESSFULLY');
        process.exit(0);
      } else {
        console.log('⚠️ Day 21 Integration & Testing: REQUIRES ATTENTION');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Integration test execution failed:', error.message);
      process.exit(1);
    });
}

module.exports = { IntegrationTestRunner };
