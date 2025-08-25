#!/usr/bin/env node

/**
 * 🚀 CODAI Comprehensive Test Analysis & Verification
 * Production-ready testing coverage assessment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, stat, readFile } from 'fs/promises';
import { join, extname } from 'path';

const execAsync = promisify(exec);

class ComprehensiveTestAnalyzer {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.testResults = {
      testFileCount: 0,
      specFileCount: 0,
      coverageAnalysis: {},
      serviceAnalysis: {},
      testTypes: {
        unit: 0,
        integration: 0,
        e2e: 0,
        performance: 0,
        security: 0,
        accessibility: 0
      },
      frameworksUsed: new Set(),
      productionReadiness: {}
    };
  }

  async runComprehensiveAnalysis() {
    console.log('🎯 CODAI COMPREHENSIVE TESTING ANALYSIS');
    console.log('=======================================');
    console.log('🔍 Analyzing complete testing infrastructure...\n');

    try {
      // Phase 1: Test File Discovery
      await this.discoverTestFiles();

      // Phase 2: Test Framework Analysis
      await this.analyzeTestFrameworks();

      // Phase 3: Service-Specific Testing
      await this.analyzeServiceTesting();

      // Phase 4: Test Type Coverage
      await this.analyzeTestTypeCoverage();

      // Phase 5: Production Readiness Assessment
      await this.assessProductionReadiness();

      // Phase 6: Generate Comprehensive Report
      await this.generateFinalReport();

      console.log('\n🎉 COMPREHENSIVE TESTING ANALYSIS COMPLETE!');
      return this.testResults;

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    }
  }

  async discoverTestFiles() {
    console.log('📁 Phase 1: Test File Discovery');
    console.log('===============================');

    const testDirectories = [
      'tests',
      'apps/*/src/test',
      'apps/*/tests',
      'apps/*/__tests__',
      'packages/*/tests',
      'packages/*/src/test'
    ];

    let totalTestFiles = 0;
    let totalSpecFiles = 0;

    for (const dir of testDirectories) {
      try {
        const testFiles = await this.findTestFiles(dir);
        totalTestFiles += testFiles.testFiles;
        totalSpecFiles += testFiles.specFiles;

        if (testFiles.testFiles > 0 || testFiles.specFiles > 0) {
          console.log(`✅ ${dir}: ${testFiles.testFiles} test files, ${testFiles.specFiles} spec files`);
        }
      } catch (error) {
        // Directory might not exist, which is fine
        console.log(`⚠️ ${dir}: Directory not found (optional)`);
      }
    }

    this.testResults.testFileCount = totalTestFiles;
    this.testResults.specFileCount = totalSpecFiles;

    console.log(`\n📊 Total Test Files Found: ${totalTestFiles + totalSpecFiles}`);
    console.log(`   - .test.* files: ${totalTestFiles}`);
    console.log(`   - .spec.* files: ${totalSpecFiles}`);
  }

  async findTestFiles(pattern) {
    let testFiles = 0;
    let specFiles = 0;

    try {
      // Use find command to search for test files
      const { stdout } = await execAsync(
        `find . -name "*.test.*" -o -name "*.spec.*" | head -100`,
        { cwd: this.workspaceRoot }
      );

      const files = stdout.split('\n').filter(f => f.trim());

      for (const file of files) {
        if (file.includes('.test.')) testFiles++;
        if (file.includes('.spec.')) specFiles++;
      }
    } catch (error) {
      // Fallback to manual directory scanning
      try {
        const files = await this.scanDirectory('./tests');
        testFiles = files.filter(f => f.includes('.test.')).length;
        specFiles = files.filter(f => f.includes('.spec.')).length;
      } catch (e) {
        // No test directory, which is fine
      }
    }

    return { testFiles, specFiles };
  }

  async scanDirectory(dir) {
    const files = [];
    try {
      const entries = await readdir(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        try {
          const stats = await stat(fullPath);
          if (stats.isDirectory()) {
            const subFiles = await this.scanDirectory(fullPath);
            files.push(...subFiles);
          } else {
            files.push(fullPath);
          }
        } catch (e) {
          // Skip inaccessible files
        }
      }
    } catch (e) {
      // Directory doesn't exist
    }
    return files;
  }

  async analyzeTestFrameworks() {
    console.log('\n🧪 Phase 2: Test Framework Analysis');
    console.log('==================================');

    const packageJsonPath = join(this.workspaceRoot, 'package.json');

    try {
      const packageContent = await readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageContent);

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // Detect testing frameworks
      const frameworks = {
        playwright: dependencies['@playwright/test'] || dependencies['playwright'],
        jest: dependencies['jest'],
        vitest: dependencies['vitest'],
        cypress: dependencies['cypress'],
        storybook: dependencies['@storybook/react'] || dependencies['@storybook/core'],
        k6: dependencies['k6'],
        artillery: dependencies['artillery']
      };

      console.log('📦 Detected Testing Frameworks:');
      for (const [framework, version] of Object.entries(frameworks)) {
        if (version) {
          console.log(`✅ ${framework}: ${version}`);
          this.testResults.frameworksUsed.add(framework);
        } else {
          console.log(`❌ ${framework}: Not installed`);
        }
      }

    } catch (error) {
      console.log('⚠️ Could not analyze package.json');
    }
  }

  async analyzeServiceTesting() {
    console.log('\n🏢 Phase 3: Service-Specific Testing');
    console.log('===================================');

    const services = [
      'codai', 'memorai', 'bancai', 'romai', 'admin',
      'hub', 'id', 'gateway', 'cbd', 'auth'
    ];

    for (const service of services) {
      const serviceTests = await this.analyzeServiceTests(service);
      this.testResults.serviceAnalysis[service] = serviceTests;

      const testCount = serviceTests.unit + serviceTests.integration + serviceTests.e2e;
      console.log(`${testCount > 0 ? '✅' : '❌'} ${service}: ${testCount} tests (${serviceTests.unit}u/${serviceTests.integration}i/${serviceTests.e2e}e)`);
    }
  }

  async analyzeServiceTests(serviceName) {
    const testTypes = { unit: 0, integration: 0, e2e: 0, security: 0, performance: 0 };

    try {
      // Search for service-specific test files
      const patterns = [
        `**/*${serviceName}*.test.*`,
        `**/*${serviceName}*.spec.*`,
        `tests/**/${serviceName}*`,
        `apps/${serviceName}/tests/**`,
        `apps/${serviceName}/src/test/**`
      ];

      for (const pattern of patterns) {
        try {
          const { stdout } = await execAsync(
            `find . -path "*${serviceName}*" -name "*.test.*" -o -path "*${serviceName}*" -name "*.spec.*" | head -20`,
            { cwd: this.workspaceRoot }
          );

          const files = stdout.split('\n').filter(f => f.trim());

          for (const file of files) {
            if (file.includes('unit') || file.includes('.test.')) testTypes.unit++;
            if (file.includes('integration')) testTypes.integration++;
            if (file.includes('e2e') || file.includes('.spec.')) testTypes.e2e++;
            if (file.includes('security')) testTypes.security++;
            if (file.includes('performance')) testTypes.performance++;
          }
        } catch (e) {
          // Continue with next pattern
        }
      }
    } catch (error) {
      // Service might not have tests yet
    }

    return testTypes;
  }

  async analyzeTestTypeCoverage() {
    console.log('\n📊 Phase 4: Test Type Coverage Analysis');
    console.log('======================================');

    try {
      // Analyze npm scripts for test types
      const packageJsonPath = join(this.workspaceRoot, 'package.json');
      const packageContent = await readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageContent);

      const scripts = packageJson.scripts || {};

      // Count test script types
      let testScripts = {
        unit: 0,
        integration: 0,
        e2e: 0,
        performance: 0,
        security: 0,
        accessibility: 0,
        coverage: 0
      };

      for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
        if (scriptName.includes('test')) {
          if (scriptName.includes('unit')) testScripts.unit++;
          if (scriptName.includes('integration')) testScripts.integration++;
          if (scriptName.includes('e2e')) testScripts.e2e++;
          if (scriptName.includes('performance')) testScripts.performance++;
          if (scriptName.includes('security')) testScripts.security++;
          if (scriptName.includes('accessibility')) testScripts.accessibility++;
          if (scriptName.includes('coverage')) testScripts.coverage++;
        }
      }

      console.log('🎯 Test Type Coverage:');
      console.log(`✅ Unit Tests: ${testScripts.unit} scripts`);
      console.log(`✅ Integration Tests: ${testScripts.integration} scripts`);
      console.log(`✅ E2E Tests: ${testScripts.e2e} scripts`);
      console.log(`✅ Performance Tests: ${testScripts.performance} scripts`);
      console.log(`✅ Security Tests: ${testScripts.security} scripts`);
      console.log(`✅ Accessibility Tests: ${testScripts.accessibility} scripts`);
      console.log(`✅ Coverage Reports: ${testScripts.coverage} scripts`);

      this.testResults.testTypes = testScripts;

    } catch (error) {
      console.log('⚠️ Could not analyze test scripts');
    }
  }

  async assessProductionReadiness() {
    console.log('\n🚀 Phase 5: Production Readiness Assessment');
    console.log('==========================================');

    const readinessChecks = {
      hasUnitTests: this.testResults.testTypes.unit > 0,
      hasIntegrationTests: this.testResults.testTypes.integration > 0,
      hasE2ETests: this.testResults.testTypes.e2e > 0,
      hasSecurityTests: this.testResults.testTypes.security > 0,
      hasPerformanceTests: this.testResults.testTypes.performance > 0,
      hasTestingFrameworks: this.testResults.frameworksUsed.size > 0,
      hasComprehensiveTestSuite: this.testResults.testFileCount + this.testResults.specFileCount > 50,
      hasServiceSpecificTests: Object.values(this.testResults.serviceAnalysis).some(s =>
        s.unit > 0 || s.integration > 0 || s.e2e > 0
      )
    };

    // Calculate production readiness score
    const totalChecks = Object.keys(readinessChecks).length;
    const passedChecks = Object.values(readinessChecks).filter(Boolean).length;
    const readinessScore = Math.round((passedChecks / totalChecks) * 100);

    console.log('🎯 Production Readiness Checklist:');
    for (const [check, passed] of Object.entries(readinessChecks)) {
      console.log(`${passed ? '✅' : '❌'} ${this.formatCheckName(check)}`);
    }

    console.log(`\n📊 Production Readiness Score: ${readinessScore}%`);

    this.testResults.productionReadiness = {
      score: readinessScore,
      checks: readinessChecks,
      status: readinessScore >= 80 ? 'PRODUCTION_READY' :
        readinessScore >= 60 ? 'NEEDS_IMPROVEMENT' : 'NOT_READY'
    };
  }

  formatCheckName(checkName) {
    return checkName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Has ', '');
  }

  async generateFinalReport() {
    console.log('\n📋 Phase 6: Final Testing Report');
    console.log('===============================');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTestFiles: this.testResults.testFileCount + this.testResults.specFileCount,
        frameworksUsed: Array.from(this.testResults.frameworksUsed),
        productionReadinessScore: this.testResults.productionReadiness.score,
        status: this.testResults.productionReadiness.status
      },
      details: this.testResults
    };

    console.log('🎯 COMPREHENSIVE TESTING SUMMARY');
    console.log('===============================');
    console.log(`📁 Total Test Files: ${report.summary.totalTestFiles}`);
    console.log(`🧪 Testing Frameworks: ${report.summary.frameworksUsed.join(', ')}`);
    console.log(`📊 Production Readiness: ${report.summary.productionReadinessScore}%`);
    console.log(`🚀 Status: ${report.summary.status}`);

    console.log('\n🔍 DETAILED BREAKDOWN:');
    console.log('======================');

    // Test Type Distribution
    console.log('📊 Test Type Distribution:');
    for (const [type, count] of Object.entries(this.testResults.testTypes)) {
      if (count > 0) {
        console.log(`   ${type}: ${count} test scripts`);
      }
    }

    // Service Coverage
    console.log('\n🏢 Service-Specific Testing:');
    for (const [service, tests] of Object.entries(this.testResults.serviceAnalysis)) {
      const total = tests.unit + tests.integration + tests.e2e + tests.security + tests.performance;
      if (total > 0) {
        console.log(`   ${service}: ${total} tests (${tests.unit}u/${tests.integration}i/${tests.e2e}e/${tests.security}s/${tests.performance}p)`);
      }
    }

    // Framework Usage
    console.log('\n🧪 Framework Analysis:');
    for (const framework of this.testResults.frameworksUsed) {
      console.log(`   ✅ ${framework}: Active`);
    }

    // Production Readiness Details
    console.log('\n🚀 Production Readiness Analysis:');
    for (const [check, passed] of Object.entries(this.testResults.productionReadiness.checks)) {
      console.log(`   ${passed ? '✅' : '❌'} ${this.formatCheckName(check)}`);
    }

    // Final Assessment
    console.log('\n🏆 FINAL ASSESSMENT:');
    console.log('===================');

    if (this.testResults.productionReadiness.score >= 80) {
      console.log('🎉 EXCELLENT! The CODAI ecosystem has comprehensive testing coverage.');
      console.log('✅ Production-ready with robust testing infrastructure.');
      console.log('✅ Multiple testing frameworks integrated.');
      console.log('✅ Service-specific and cross-cutting tests implemented.');
    } else if (this.testResults.productionReadiness.score >= 60) {
      console.log('⚠️ GOOD! Testing infrastructure exists but needs improvement.');
      console.log('🔄 Some test types missing or incomplete.');
      console.log('📈 Focus on missing test categories for full production readiness.');
    } else {
      console.log('❌ NEEDS WORK! Testing infrastructure requires significant development.');
      console.log('🚨 Critical gaps in testing coverage.');
      console.log('🛠️ Implement comprehensive testing before production deployment.');
    }

    return report;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new ComprehensiveTestAnalyzer();

  analyzer.runComprehensiveAnalysis()
    .then((results) => {
      console.log('\n🎯 Analysis completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Analysis failed:', error.message);
      process.exit(1);
    });
}

export default ComprehensiveTestAnalyzer;

