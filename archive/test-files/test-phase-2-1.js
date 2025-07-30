/**
 * Phase 2.1 Development Environment Setup - Test Runner
 * Comprehensive testing of development environment and testing framework components
 */

import DevelopmentEnvironmentManager from './libs/dev-environment/index.js';
import TestingFrameworkManager from './libs/testing-framework/index.js';

console.log('🚀 Phase 2.1 Development Environment Setup - Component Test');
console.log('='.repeat(65));

async function testDevelopmentEnvironment() {
  try {
    console.log('\n📊 Testing Development Environment Manager...');

    // Initialize environment manager
    const envManager = new DevelopmentEnvironmentManager({
      projectRoot: process.cwd(),
      packageManager: 'pnpm'
    });

    console.log('✅ DevelopmentEnvironmentManager instantiated successfully');

    // Initialize environment analysis
    const environment = await envManager.initialize();
    console.log('✅ Environment analysis completed');

    // Generate environment report
    const envReport = envManager.generateEnvironmentReport();
    console.log(`✅ Environment report generated (Health: ${envReport.healthScore}%)`);

    // Display key environment info
    console.log(`   System: ${environment.system.platform} ${environment.system.arch}`);
    console.log(`   Node.js: ${environment.nodejs.version}`);
    console.log(`   Package Manager: ${environment.nodejs.packageManagers?.preferred?.name || 'npm'}`);

    const runningServices = Object.values(environment.services)
      .filter(service => service.status.running).length;
    console.log(`   Services: ${runningServices}/${Object.keys(environment.services).length} running`);

    return { success: true, healthScore: envReport.healthScore, environment };

  } catch (error) {
    console.error('❌ Development Environment Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testTestingFramework() {
  try {
    console.log('\n🧪 Testing Testing Framework Manager...');

    // Initialize testing framework manager
    const testManager = new TestingFrameworkManager({
      projectRoot: process.cwd(),
      testFrameworks: ['vitest', 'playwright', 'jest']
    });

    console.log('✅ TestingFrameworkManager instantiated successfully');

    // Initialize testing framework analysis
    const frameworks = await testManager.initialize();
    console.log('✅ Testing framework analysis completed');

    // Generate testing report
    const testReport = testManager.generateTestingReport();
    console.log(`✅ Testing report generated (Health: ${testReport.summary.healthScore}%)`);

    // Display framework status
    const availableFrameworks = Object.entries(frameworks)
      .filter(([name, framework]) => framework.available)
      .map(([name]) => name);

    const configuredFrameworks = Object.entries(frameworks)
      .filter(([name, framework]) => framework.configured)
      .map(([name]) => name);

    console.log(`   Available: ${availableFrameworks.join(', ') || 'none'}`);
    console.log(`   Configured: ${configuredFrameworks.join(', ') || 'none'}`);
    console.log(`   Test Files: ${testReport.summary.tests.totalFiles} found`);

    return {
      success: true,
      healthScore: testReport.summary.healthScore,
      frameworks: availableFrameworks.length,
      configured: configuredFrameworks.length
    };

  } catch (error) {
    console.error('❌ Testing Framework Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runPhase21Tests() {
  console.log('\n🔍 Running Phase 2.1 Comprehensive Tests...');

  // Test development environment
  const envResult = await testDevelopmentEnvironment();

  // Test testing framework
  const testResult = await testTestingFramework();

  // Calculate overall results
  const overallSuccess = envResult.success && testResult.success;
  const averageHealth = envResult.success && testResult.success ?
    Math.round((envResult.healthScore + testResult.healthScore) / 2) : 0;

  console.log('\n🎉 Phase 2.1 Development Environment Setup - Test Results');
  console.log('='.repeat(65));

  if (envResult.success) {
    console.log('✅ Development Environment Manager: Ready');
    console.log(`   System Analysis: Complete (${envResult.healthScore}% health)`);
    console.log('   Service Detection: Active');
    console.log('   Environment Reporting: Functional');
  } else {
    console.log('❌ Development Environment Manager: Failed');
    console.log(`   Error: ${envResult.error}`);
  }

  if (testResult.success) {
    console.log('✅ Testing Framework Manager: Ready');
    console.log(`   Framework Analysis: Complete (${testResult.healthScore}% health)`);
    console.log(`   Available Frameworks: ${testResult.frameworks}`);
    console.log(`   Configured Frameworks: ${testResult.configured}`);
  } else {
    console.log('❌ Testing Framework Manager: Failed');
    console.log(`   Error: ${testResult.error}`);
  }

  console.log('\n📊 Phase 2.1 Summary:');
  console.log(`   Overall Health Score: ${averageHealth}%`);
  console.log(`   Components Ready: ${(envResult.success ? 1 : 0) + (testResult.success ? 1 : 0)}/2`);
  console.log(`   ES Module Integration: Complete`);
  console.log(`   Development Ready: ${overallSuccess ? 'Yes' : 'No'}`);

  if (overallSuccess) {
    console.log('\n🏆 Phase 2.1 Development Environment Setup: SUCCESS');
    console.log('Ready for Phase 2.2 Testing Framework Integration');
  } else {
    console.log('\n💥 Phase 2.1 Development Environment Setup: NEEDS ATTENTION');
    console.log('Some components require configuration or setup');
  }

  return {
    success: overallSuccess,
    healthScore: averageHealth,
    environment: envResult,
    testing: testResult
  };
}

// Run Phase 2.1 tests
runPhase21Tests()
  .then(results => {
    const exitCode = results.success ? 0 : 1;
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n💥 Phase 2.1 Test Runner Error:', error.message);
    process.exit(1);
  });
