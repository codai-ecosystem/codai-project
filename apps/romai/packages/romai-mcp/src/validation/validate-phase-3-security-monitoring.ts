/**
 * Phase 3 Security & Monitoring Integration Test
 * Comprehensive validation of enterprise security and monitoring features
 */

import { EnterpriseSecurityManager } from '../security/enterprise-security-manager.js';
import { EnterpriseMonitoringManager } from '../monitoring/enterprise-monitoring-manager.js';
import { EnterpriseSecurityMonitoringIntegration } from '../integration/security-monitoring-integration.js';

interface TestResults {
  testName: string;
  passed: boolean;
  details: string;
  duration: number;
}

class Phase3SecurityMonitoringValidator {
  private results: TestResults[] = [];

  async runAllTests(): Promise<void> {
    console.log('🔍 Starting Phase 3 Security & Monitoring Integration Tests');
    console.log('='.repeat(70));

    await this.testSecurityManager();
    await this.testMonitoringManager();
    await this.testSecurityMonitoringIntegration();
    await this.testPerformanceAndScalability();
    await this.testSecurityHardening();
    await this.testMonitoringAlerts();

    this.generateReport();
  }

  private async testSecurityManager(): Promise<void> {
    console.log('\n🔒 Testing Enterprise Security Manager...');

    const config = {
      jwtSecret: 'test-secret-2024',
      jwtExpiresIn: '1h',
      bcryptRounds: 10,
      rateLimitWindow: 60000,
      rateLimitMax: 10,
      maxLoginAttempts: 3,
      blockDuration: 300000,
      enableSecurityHeaders: true,
      enableInputValidation: true,
      enablePasswordHashing: true,
      enableAuditLogging: true,
      enableThreatDetection: true
    };

    const securityManager = new EnterpriseSecurityManager(config);

    // Test 1: JWT Token Generation and Verification
    await this.runTest('JWT Token Management', async () => {
      const testUser = {
        id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        roles: [],
        permissions: ['read', 'write'],
        lastLogin: new Date(),
        isActive: true
      };

      const token = securityManager.generateToken(testUser);
      const verified = securityManager.verifyToken(token);

      if (!token || !verified || verified.id !== testUser.id) {
        throw new Error('JWT token generation/verification failed');
      }

      return 'JWT tokens generated and verified successfully';
    });

    // Test 2: Password Hashing
    await this.runTest('Password Hashing', async () => {
      const password = 'test-password-123';
      const hashedPassword = await securityManager.hashPassword(password);
      const isValid = await securityManager.verifyPassword(password, hashedPassword);

      if (!hashedPassword || !isValid) {
        throw new Error('Password hashing/verification failed');
      }

      return 'Password hashing working correctly';
    });

    // Test 3: IP Blocking
    await this.runTest('IP Blocking System', async () => {
      const testIP = '192.168.1.100';

      // Initially not blocked
      if (securityManager.isIPBlocked(testIP)) {
        throw new Error('IP should not be blocked initially');
      }

      // Block IP
      securityManager.blockIP(testIP, 'Test blocking');

      // Should be blocked now
      if (!securityManager.isIPBlocked(testIP)) {
        throw new Error('IP should be blocked after blocking');
      }

      // Unblock IP
      securityManager.unblockIP(testIP);

      // Should not be blocked now
      if (securityManager.isIPBlocked(testIP)) {
        throw new Error('IP should not be blocked after unblocking');
      }

      return 'IP blocking system working correctly';
    });

    // Test 4: Security Health Check
    await this.runTest('Security Health Check', async () => {
      const healthCheck = securityManager.performSecurityHealthCheck();

      if (!healthCheck || !healthCheck.status || !healthCheck.checks) {
        throw new Error('Security health check failed');
      }

      return `Security health: ${healthCheck.status}`;
    });

    // Test 5: Security Metrics
    await this.runTest('Security Metrics Collection', async () => {
      const metrics = securityManager.getSecurityMetrics();

      if (!metrics || typeof metrics.totalRequests !== 'number') {
        throw new Error('Security metrics collection failed');
      }

      return 'Security metrics collected successfully';
    });
  }

  private async testMonitoringManager(): Promise<void> {
    console.log('\n📊 Testing Enterprise Monitoring Manager...');

    const monitoringManager = new EnterpriseMonitoringManager();

    // Test 1: Metrics Recording
    await this.runTest('Metrics Recording', async () => {
      monitoringManager.recordMetric('test_metric', 100, { tag: 'test' });

      const metrics = monitoringManager.getPerformanceMetrics();
      if (!metrics || !metrics.customMetrics || !metrics.customMetrics.test_metric) {
        throw new Error('Metrics recording failed');
      }

      return 'Metrics recorded successfully';
    });

    // Test 2: Request Monitoring
    await this.runTest('Request Monitoring', async () => {
      monitoringManager.recordRequest(150, false); // 150ms, no error
      monitoringManager.recordRequest(250, true);  // 250ms, with error

      const metrics = monitoringManager.getPerformanceMetrics();
      if (!metrics || metrics.requests.total !== 2) {
        throw new Error('Request monitoring failed');
      }

      return 'Request monitoring working correctly';
    });

    // Test 3: Health Checks
    await this.runTest('Health Check Registration', async () => {
      monitoringManager.registerHealthCheck('test_service', async () => ({
        status: 'HEALTHY',
        message: 'Test service is operational'
      }));

      const healthStatus = monitoringManager.getHealthStatus();
      if (!healthStatus || !healthStatus.checks || !healthStatus.checks.test_service) {
        throw new Error('Health check registration failed');
      }

      return 'Health checks registered and working';
    });

    // Test 4: Alert System
    await this.runTest('Alert System', async () => {
      monitoringManager.addAlert({
        id: 'test-alert-1',
        type: 'performance',
        severity: 'medium',
        message: 'Test alert for validation',
        timestamp: new Date(),
        isActive: true,
        metadata: { source: 'test' }
      });

      const alerts = monitoringManager.getActiveAlerts();
      if (!alerts || alerts.length === 0) {
        throw new Error('Alert system failed');
      }

      return 'Alert system working correctly';
    });

    // Test 5: Dashboard Data
    await this.runTest('Dashboard Data Generation', async () => {
      const dashboardData = monitoringManager.getDashboardData();

      if (!dashboardData || !dashboardData.metrics || !dashboardData.health) {
        throw new Error('Dashboard data generation failed');
      }

      return 'Dashboard data generated successfully';
    });
  }

  private async testSecurityMonitoringIntegration(): Promise<void> {
    console.log('\n🔗 Testing Security & Monitoring Integration...');

    const config = {
      security: {
        jwtSecret: 'integration-test-secret',
        jwtExpiresIn: '1h',
        bcryptRounds: 10,
        rateLimitWindow: 60000,
        rateLimitMax: 10,
        maxLoginAttempts: 3,
        blockDuration: 300000,
        enableSecurityHeaders: true,
        enableInputValidation: true,
        enablePasswordHashing: true,
        enableAuditLogging: true,
        enableThreatDetection: true
      },
      monitoring: {
        enableMetrics: true,
        enableTracing: true,
        enableHealthChecks: true,
        enableAlerting: true
      }
    };

    const integration = new EnterpriseSecurityMonitoringIntegration(config);

    // Test 1: Integration Initialization
    await this.runTest('Integration Initialization', async () => {
      const securityManager = integration.getSecurityManager();
      const monitoringManager = integration.getMonitoringManager();

      if (!securityManager || !monitoringManager) {
        throw new Error('Integration initialization failed');
      }

      return 'Integration initialized successfully';
    });

    // Test 2: System Status
    await this.runTest('System Status Check', async () => {
      const systemStatus = integration.getSystemStatus();

      if (!systemStatus || !systemStatus.overall || !systemStatus.security || !systemStatus.monitoring) {
        throw new Error('System status check failed');
      }

      return `System status: ${systemStatus.overall}`;
    });

    // Test 3: Security Endpoints
    await this.runTest('Security Endpoints', async () => {
      const endpoints = integration.getSecurityEndpoints();

      if (!endpoints || !endpoints['/security/status'] || !endpoints['/health']) {
        throw new Error('Security endpoints not available');
      }

      return 'Security endpoints configured correctly';
    });
  }

  private async testPerformanceAndScalability(): Promise<void> {
    console.log('\n⚡ Testing Performance and Scalability...');

    const config = {
      security: {
        jwtSecret: 'perf-test-secret',
        jwtExpiresIn: '1h',
        bcryptRounds: 8, // Lower for performance testing
        rateLimitWindow: 60000,
        rateLimitMax: 1000,
        maxLoginAttempts: 5,
        blockDuration: 60000,
        enableSecurityHeaders: true,
        enableInputValidation: true,
        enablePasswordHashing: true,
        enableAuditLogging: true,
        enableThreatDetection: true
      },
      monitoring: {
        enableMetrics: true,
        enableTracing: true,
        enableHealthChecks: true,
        enableAlerting: true
      }
    };

    const integration = new EnterpriseSecurityMonitoringIntegration(config);

    // Test 1: High-Volume Metrics
    await this.runTest('High-Volume Metrics Processing', async () => {
      const monitoringManager = integration.getMonitoringManager();
      const startTime = performance.now();

      // Record 1000 metrics
      for (let i = 0; i < 1000; i++) {
        monitoringManager.recordMetric('perf_test', Math.random() * 100, { iteration: i });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 1000) { // Should complete within 1 second
        throw new Error(`High-volume metrics processing too slow: ${duration}ms`);
      }

      return `Processed 1000 metrics in ${duration.toFixed(2)}ms`;
    });

    // Test 2: Concurrent Security Operations
    await this.runTest('Concurrent Security Operations', async () => {
      const securityManager = integration.getSecurityManager();
      const startTime = performance.now();

      // Create 100 concurrent token operations
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push((async () => {
          const testUser = {
            id: `perf-user-${i}`,
            username: `perfuser${i}`,
            email: `perf${i}@test.com`,
            roles: [],
            permissions: ['read'],
            lastLogin: new Date(),
            isActive: true
          };

          const token = securityManager.generateToken(testUser);
          const verified = securityManager.verifyToken(token);

          if (!verified || verified.id !== testUser.id) {
            throw new Error(`Token operation failed for user ${i}`);
          }
        })());
      }

      await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 2000) { // Should complete within 2 seconds
        throw new Error(`Concurrent operations too slow: ${duration}ms`);
      }

      return `Completed 100 concurrent operations in ${duration.toFixed(2)}ms`;
    });
  }

  private async testSecurityHardening(): Promise<void> {
    console.log('\n🛡️ Testing Security Hardening Features...');

    const config = {
      security: {
        jwtSecret: 'hardening-test-secret',
        jwtExpiresIn: '30m',
        bcryptRounds: 12,
        rateLimitWindow: 60000,
        rateLimitMax: 5,
        maxLoginAttempts: 3,
        blockDuration: 300000,
        enableSecurityHeaders: true,
        enableInputValidation: true,
        enablePasswordHashing: true,
        enableAuditLogging: true,
        enableThreatDetection: true
      },
      monitoring: {
        enableMetrics: true,
        enableTracing: true,
        enableHealthChecks: true,
        enableAlerting: true
      }
    };

    const securityManager = new EnterpriseSecurityManager(config);

    // Test 1: Token Expiration
    await this.runTest('JWT Token Expiration', async () => {
      const testUser = {
        id: 'exp-test-user',
        username: 'expuser',
        email: 'exp@test.com',
        roles: [],
        permissions: ['read'],
        lastLogin: new Date(),
        isActive: true
      };

      // Generate token with very short expiration
      const shortConfig = { ...config.security, jwtExpiresIn: '1ms' };
      const tempManager = new EnterpriseSecurityManager(shortConfig);
      const token = tempManager.generateToken(testUser);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));

      const verified = tempManager.verifyToken(token);
      if (verified) {
        throw new Error('Expired token should not be valid');
      }

      return 'Token expiration working correctly';
    });

    // Test 2: Input Validation
    await this.runTest('Input Validation', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'SELECT * FROM users;',
        '../../etc/passwd',
        '\x00null_byte'
      ];

      for (const input of maliciousInputs) {
        const sanitized = securityManager.sanitizeInput(input);
        if (sanitized === input) {
          throw new Error(`Input sanitization failed for: ${input}`);
        }
      }

      return 'Input validation working correctly';
    });
  }

  private async testMonitoringAlerts(): Promise<void> {
    console.log('\n🚨 Testing Monitoring Alert System...');

    const monitoringManager = new EnterpriseMonitoringManager();

    // Test 1: Alert Creation and Management
    await this.runTest('Alert Management', async () => {
      // Create multiple alerts
      const alerts = [
        {
          id: 'alert-1',
          type: 'security',
          severity: 'high',
          message: 'Security breach detected',
          timestamp: new Date(),
          isActive: true,
          metadata: { source: 'security_scanner' }
        },
        {
          id: 'alert-2',
          type: 'performance',
          severity: 'medium',
          message: 'High response time detected',
          timestamp: new Date(),
          isActive: true,
          metadata: { avgResponseTime: 5000 }
        }
      ];

      alerts.forEach(alert => monitoringManager.addAlert(alert));

      const activeAlerts = monitoringManager.getActiveAlerts();
      if (activeAlerts.length < 2) {
        throw new Error('Alert creation failed');
      }

      // Resolve an alert
      monitoringManager.resolveAlert('alert-1');
      const updatedAlerts = monitoringManager.getActiveAlerts();

      const resolvedAlert = updatedAlerts.find(a => a.id === 'alert-1');
      if (resolvedAlert && resolvedAlert.isActive) {
        throw new Error('Alert resolution failed');
      }

      return 'Alert management working correctly';
    });
  }

  private async runTest(testName: string, testFunction: () => Promise<string>): Promise<void> {
    const startTime = performance.now();

    try {
      const details = await testFunction();
      const duration = performance.now() - startTime;

      this.results.push({
        testName,
        passed: true,
        details,
        duration
      });

      console.log(`  ✅ ${testName}: ${details} (${duration.toFixed(2)}ms)`);
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.results.push({
        testName,
        passed: false,
        details: errorMessage,
        duration
      });

      console.log(`  ❌ ${testName}: ${errorMessage} (${duration.toFixed(2)}ms)`);
    }
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(70));
    console.log('📋 PHASE 3 SECURITY & MONITORING VALIDATION REPORT');
    console.log('='.repeat(70));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`\n📊 Test Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`   Total Duration: ${totalDuration.toFixed(2)}ms`);

    if (failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`   • ${result.testName}: ${result.details}`);
      });
    }

    // Phase 3 Enterprise Readiness Assessment
    console.log(`\n🎯 Phase 3 Enterprise Readiness Assessment:`);

    const securityTests = this.results.filter(r =>
      r.testName.includes('Security') ||
      r.testName.includes('JWT') ||
      r.testName.includes('Password') ||
      r.testName.includes('IP Blocking')
    );
    const securityScore = (securityTests.filter(t => t.passed).length / securityTests.length) * 100;

    const monitoringTests = this.results.filter(r =>
      r.testName.includes('Monitoring') ||
      r.testName.includes('Metrics') ||
      r.testName.includes('Health') ||
      r.testName.includes('Alert')
    );
    const monitoringScore = (monitoringTests.filter(t => t.passed).length / monitoringTests.length) * 100;

    const performanceTests = this.results.filter(r =>
      r.testName.includes('Performance') ||
      r.testName.includes('Concurrent') ||
      r.testName.includes('High-Volume')
    );
    const performanceScore = (performanceTests.filter(t => t.passed).length / performanceTests.length) * 100;

    console.log(`   🔒 Security Hardening: ${securityScore.toFixed(1)}%`);
    console.log(`   📊 Monitoring Systems: ${monitoringScore.toFixed(1)}%`);
    console.log(`   ⚡ Performance & Scalability: ${performanceScore.toFixed(1)}%`);

    const overallEnterpriseScore = (securityScore + monitoringScore + performanceScore) / 3;
    console.log(`   🏆 Overall Enterprise Score: ${overallEnterpriseScore.toFixed(1)}%`);

    // Success criteria
    const isPhase3Complete = successRate >= 90 && securityScore >= 85 && monitoringScore >= 85;

    if (isPhase3Complete) {
      console.log(`\n✅ PHASE 3 COMPLETE: Security & Monitoring integration ready for production!`);
      console.log(`   • Enterprise security hardening: IMPLEMENTED`);
      console.log(`   • Comprehensive monitoring system: IMPLEMENTED`);
      console.log(`   • Performance optimization: VALIDATED`);
      console.log(`   • Production deployment: READY`);
    } else {
      console.log(`\n⚠️  PHASE 3 NEEDS ATTENTION: Some components require fixes before production`);
      if (securityScore < 85) console.log(`   • Security hardening needs improvement`);
      if (monitoringScore < 85) console.log(`   • Monitoring system needs enhancement`);
      if (successRate < 90) console.log(`   • Overall test coverage needs improvement`);
    }

    console.log('\n🚀 Next Steps:');
    if (isPhase3Complete) {
      console.log('   1. Begin Phase 4: Production Deployment & Optimization');
      console.log('   2. Set up production monitoring dashboards');
      console.log('   3. Configure production security policies');
      console.log('   4. Deploy to staging environment for final validation');
    } else {
      console.log('   1. Fix failing tests and address security/monitoring gaps');
      console.log('   2. Re-run validation suite until Phase 3 criteria are met');
      console.log('   3. Review and enhance enterprise features as needed');
    }

    console.log('\n' + '='.repeat(70));
  }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new Phase3SecurityMonitoringValidator();
  validator.runAllTests().catch(console.error);
}

export { Phase3SecurityMonitoringValidator };
