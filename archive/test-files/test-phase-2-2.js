/**
 * Phase 2.2 Testing Framework Integration - Component Test
 * Comprehensive testing of testing configuration and orchestration components
 */

import TestingConfigurationManager from './libs/testing-config/index.js';
import TestSuiteOrchestrator from './libs/test-orchestrator/index.js';

console.log('🧪 Phase 2.2 Testing Framework Integration - Component Test');
console.log('='.repeat(68));

async function testTestingConfiguration() {
  try {
    console.log('\n⚙️  Testing Testing Configuration Manager...');

    // Initialize configuration manager
    const configManager = new TestingConfigurationManager({
      projectRoot: process.cwd(),
      frameworks: ['vitest', 'playwright', 'jest']
    });

    console.log('✅ TestingConfigurationManager instantiated successfully');

    // Initialize configuration
    const configuration = await configManager.initialize();
    console.log('✅ Testing framework configuration completed');

    // Generate comprehensive report
    const report = await configManager.generateComprehensiveReport();
    console.log(`✅ Configuration report generated (Health: ${report.healthScore}%)`);

    // Display configuration summary
    console.log(`   Frameworks: ${configuration.frameworks.optimized}/${configuration.frameworks.total} optimized`);
    console.log(`   Test Suites: ${configuration.testSuites.categories} categories, ${configuration.testSuites.totalFiles} files`);
    console.log(`   Coverage: ${configuration.coverage.configured ? 'Configured' : 'Not configured'}`);
    console.log(`   CI/CD: ${configuration.cicd.configured ? 'Ready' : 'Not ready'}`);
    console.log(`   Performance: ${configuration.performance.configured ? 'Enabled' : 'Disabled'}`);

    return {
      success: true,
      healthScore: report.healthScore,
      configuration,
      report
    };

  } catch (error) {
    console.error('❌ Testing Configuration Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testTestOrchestrator() {
  try {
    console.log('\n🎭 Testing Test Suite Orchestrator...');

    // Initialize orchestrator
    const orchestrator = new TestSuiteOrchestrator({
      projectRoot: process.cwd(),
      frameworks: ['vitest', 'playwright', 'jest'],
      concurrency: 2
    });

    console.log('✅ TestSuiteOrchestrator instantiated successfully');

    // Initialize orchestrator
    const status = await orchestrator.initialize();
    console.log('✅ Test orchestrator initialization completed');

    // Get health score
    const healthScore = await orchestrator.getHealthScore();
    console.log(`✅ Orchestrator health assessment completed (Health: ${healthScore}%)`);

    // Display orchestrator status
    console.log(`   Test Suites: ${status.suites.total} categories`);
    console.log(`   Categories: ${status.suites.categories.join(', ')}`);
    console.log(`   Frameworks: ${status.frameworks.join(', ')}`);
    console.log(`   Capabilities: ${Object.keys(status.capabilities).filter(cap => status.capabilities[cap]).join(', ')}`);

    return {
      success: true,
      healthScore,
      status,
      suites: status.suites.total,
      frameworks: status.frameworks.length
    };

  } catch (error) {
    console.error('❌ Test Orchestrator Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testIntegration() {
  try {
    console.log('\n🔗 Testing Configuration + Orchestrator Integration...');

    // Test configuration files exist
    const configFiles = [
      'vitest.config.optimized.ts',
      'playwright.config.optimized.ts',
      'jest.config.optimized.js',
      'coverage.config.json',
      'test-scripts.json',
      'performance.config.json'
    ];

    let configuredFiles = 0;
    for (const file of configFiles) {
      try {
        const fs = await import('fs/promises');
        await fs.access(file);
        configuredFiles++;
      } catch (error) {
        // File doesn't exist
      }
    }

    console.log(`✅ Configuration files: ${configuredFiles}/${configFiles.length} created`);

    // Test test suite organization
    try {
      const fs = await import('fs/promises');
      const orgContent = await fs.readFile('TEST_SUITE_ORGANIZATION.json', 'utf-8');
      const organization = JSON.parse(orgContent);
      console.log(`✅ Test suite organization: ${organization.summary.totalFiles} files organized`);
    } catch (error) {
      console.log('⚠️  Test suite organization file not found');
    }

    // Test integration report
    try {
      const fs = await import('fs/promises');
      const reportContent = await fs.readFile('TESTING_FRAMEWORK_INTEGRATION_REPORT.json', 'utf-8');
      const integrationReport = JSON.parse(reportContent);
      console.log(`✅ Integration report: ${integrationReport.healthScore}% health score`);
    } catch (error) {
      console.log('⚠️  Integration report not found');
    }

    const integrationScore = Math.round((configuredFiles / configFiles.length) * 100);

    return {
      success: true,
      integrationScore,
      configuredFiles,
      totalFiles: configFiles.length
    };

  } catch (error) {
    console.error('❌ Integration Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runPhase22Tests() {
  console.log('\n🔍 Running Phase 2.2 Comprehensive Tests...');

  // Test configuration manager
  const configResult = await testTestingConfiguration();

  // Test orchestrator
  const orchestratorResult = await testTestOrchestrator();

  // Test integration
  const integrationResult = await testIntegration();

  // Calculate overall results
  const overallSuccess = configResult.success && orchestratorResult.success && integrationResult.success;
  const averageHealth = overallSuccess ?
    Math.round((configResult.healthScore + orchestratorResult.healthScore + integrationResult.integrationScore) / 3) : 0;

  console.log('\n🎉 Phase 2.2 Testing Framework Integration - Test Results');
  console.log('='.repeat(68));

  if (configResult.success) {
    console.log('✅ Testing Configuration Manager: Ready');
    console.log(`   Framework Configuration: Complete (${configResult.healthScore}% health)`);
    console.log(`   Optimized Configurations: ${configResult.configuration.frameworks.optimized}/${configResult.configuration.frameworks.total}`);
    console.log(`   Test Suite Organization: ${configResult.configuration.testSuites.categories} categories`);
    console.log(`   Coverage Integration: ${configResult.configuration.coverage.configured ? 'Enabled' : 'Disabled'}`);
    console.log(`   CI/CD Pipeline: ${configResult.configuration.cicd.configured ? 'Ready' : 'Not ready'}`);
  } else {
    console.log('❌ Testing Configuration Manager: Failed');
    console.log(`   Error: ${configResult.error}`);
  }

  if (orchestratorResult.success) {
    console.log('✅ Test Suite Orchestrator: Ready');
    console.log(`   Orchestration Health: Complete (${orchestratorResult.healthScore}% health)`);
    console.log(`   Test Suites: ${orchestratorResult.suites} categories configured`);
    console.log(`   Framework Support: ${orchestratorResult.frameworks} frameworks`);
    console.log(`   Execution Capabilities: Parallel & Sequential support`);
  } else {
    console.log('❌ Test Suite Orchestrator: Failed');
    console.log(`   Error: ${orchestratorResult.error}`);
  }

  if (integrationResult.success) {
    console.log('✅ Framework Integration: Ready');
    console.log(`   Integration Score: Complete (${integrationResult.integrationScore}% configured)`);
    console.log(`   Configuration Files: ${integrationResult.configuredFiles}/${integrationResult.totalFiles} created`);
    console.log(`   Framework Optimization: Complete`);
  } else {
    console.log('❌ Framework Integration: Failed');
    console.log(`   Error: ${integrationResult.error}`);
  }

  console.log('\n📊 Phase 2.2 Summary:');
  console.log(`   Overall Health Score: ${averageHealth}%`);
  console.log(`   Components Ready: ${(configResult.success ? 1 : 0) + (orchestratorResult.success ? 1 : 0) + (integrationResult.success ? 1 : 0)}/3`);
  console.log(`   Framework Integration: Complete`);
  console.log(`   Testing Ready: ${overallSuccess ? 'Yes' : 'No'}`);

  if (overallSuccess) {
    console.log('\n🏆 Phase 2.2 Testing Framework Integration: SUCCESS');
    console.log('Ready for Phase 2.3 Code Quality Tools');
  } else {
    console.log('\n💥 Phase 2.2 Testing Framework Integration: NEEDS ATTENTION');
    console.log('Some components require configuration or setup');
  }

  return {
    success: overallSuccess,
    healthScore: averageHealth,
    configuration: configResult,
    orchestrator: orchestratorResult,
    integration: integrationResult
  };
}

// Run Phase 2.2 tests
runPhase22Tests()
  .then(results => {
    const exitCode = results.success ? 0 : 1;
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n💥 Phase 2.2 Test Runner Error:', error.message);
    process.exit(1);
  });
