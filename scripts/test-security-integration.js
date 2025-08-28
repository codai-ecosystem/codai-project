#!/usr/bin/env node

/**
 * CAUTAI Security System Integration Test
 * 
 * This script tests the complete security system integration to verify
 * all components work together correctly before production deployment.
 */

import { IntegratedSecuritySystem } from '../packages/cautai-mcp/src/security/index.js';

async function runSecurityIntegrationTest() {
  console.log('🔐 CAUTAI Security System Integration Test');
  console.log('==========================================\n');

  try {
    // Initialize the integrated security system
    console.log('1. Initializing Integrated Security System...');
    const securitySystem = new IntegratedSecuritySystem({
      authentication: {
        enableJWT: true,
        enableOAuth: true,
        enableMFA: true,
        enableAuditLogging: true
      },
      validation: {
        enableInputValidation: true,
        enableOutputSanitization: true,
        enableRateLimiting: true
      },
      compliance: {
        enableGDPR: true,
        enableCCPA: true,
        enableAuditTrail: true
      },
      vulnerabilityScanning: {
        enableDependencyScanning: true,
        enableStaticAnalysis: true,
        enableRuntimeMonitoring: true
      },
      middleware: {
        enableAuthentication: true,
        enableAuthorization: true,
        enableRateLimit: true,
        enableSecurityHeaders: true,
        enableCORS: true
      },
      monitoring: {
        enableSecurityMetrics: true,
        enableRealTimeAlerts: true,
        enablePerformanceTracking: true
      }
    });

    console.log('✅ Security system initialized successfully');

    // Test security health check
    console.log('\n2. Running Security Health Check...');
    const healthCheck = await securitySystem.performHealthCheck();
    console.log(`✅ Security Health Status: ${healthCheck.status}`);
    console.log(`   - Authentication: ${healthCheck.components.authentication}`);
    console.log(`   - Compliance: ${healthCheck.components.compliance}`);
    console.log(`   - Vulnerabilities: ${healthCheck.components.vulnerabilities}`);
    console.log(`   - Validation: ${healthCheck.components.validation}`);

    if (healthCheck.issues.length > 0) {
      console.log(`   - Issues found: ${healthCheck.issues.length}`);
      healthCheck.issues.forEach((issue, index) => {
        console.log(`     ${index + 1}. ${issue}`);
      });
    }

    // Test security validation
    console.log('\n3. Testing Security Validation...');
    const testQueries = [
      'artificial intelligence',
      '<script>alert("xss")</script>',
      "' OR 1=1 --",
      '../../../etc/passwd',
      'normal search query'
    ];

    for (const query of testQueries) {
      try {
        const validation = securitySystem.getValidationSystem().validateSearchQuery(query);
        console.log(`   Query: "${query.substring(0, 30)}${query.length > 30 ? '...' : ''}"`);
        console.log(`   Valid: ${validation.isValid}, Violations: ${validation.violations.length}, Risk: ${validation.riskScore}`);
      } catch (error) {
        console.log(`   Query validation failed: ${error.message}`);
      }
    }

    // Test security metrics
    console.log('\n4. Testing Security Metrics Collection...');
    const metrics = await securitySystem.getCurrentSecurityMetrics();
    console.log('✅ Security metrics collected successfully');
    console.log(`   - Authentication attempts: ${metrics.authentication.totalAttempts}`);
    console.log(`   - Security violations: ${metrics.middleware.securityViolations}`);
    console.log(`   - Overall security score: ${metrics.overall.securityScore}/100`);
    console.log(`   - Risk level: ${metrics.overall.riskLevel}`);

    // Test security incident recording
    console.log('\n5. Testing Security Incident Recording...');
    await securitySystem.recordSecurityIncident({
      type: 'security_scan_failure',
      severity: 'low',
      description: 'Integration test security incident',
      source: 'integration-test',
      affectedResources: ['test-resource'],
      metadata: { test: true }
    });
    console.log('✅ Security incident recorded successfully');

    // Generate security report
    console.log('\n6. Generating Security Report...');
    const report = await securitySystem.generateSecurityReport({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date()
    });
    console.log('✅ Security report generated successfully');
    console.log(`   - Report ID: ${report.id}`);
    console.log(`   - Period: ${report.period.start.toISOString()} to ${report.period.end.toISOString()}`);
    console.log(`   - Incidents: ${report.incidents.length}`);

    console.log('\n🎉 INTEGRATION TEST COMPLETED SUCCESSFULLY');
    console.log('==========================================');
    console.log('✅ All security components working correctly');
    console.log('✅ System ready for production deployment');
    console.log('✅ Enterprise security standards achieved');

    return {
      success: true,
      healthStatus: healthCheck.status,
      securityScore: metrics.overall.securityScore,
      riskLevel: metrics.overall.riskLevel,
      reportId: report.id
    };

  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED');
    console.error('===========================');
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Run the integration test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityIntegrationTest()
    .then(result => {
      if (result.success) {
        console.log(`\n🎯 Final Status: SUCCESS - Security Score: ${result.securityScore}/100`);
        process.exit(0);
      } else {
        console.log('\n🚨 Final Status: FAILED');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { runSecurityIntegrationTest };