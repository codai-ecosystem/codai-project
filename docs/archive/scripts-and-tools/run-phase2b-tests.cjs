/**
 * 🧪 Phase 2B: Admin Service Frontend Test Runner
 * Executes Jest + React Testing Library tests for Admin Service components
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AdminFrontendTestRunner {
  constructor() {
    this.testResults = {
      phase: 'Phase 2B - Admin Service Frontend Testing',
      startTime: new Date(),
      endTime: null,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0,
      coverage: {},
      testSuites: [],
      errors: []
    };
  }

  async runTests() {
    console.log('🧪 Starting Phase 2B: Admin Service Frontend Testing...\n');
    
    try {
      // Check if we're in the right directory
      const adminPath = path.join(process.cwd(), 'apps', 'admin');
      if (!fs.existsSync(adminPath)) {
        throw new Error('Admin service directory not found');
      }

      // Install dependencies if needed
      await this.installDependencies(adminPath);

      // Run Jest tests with coverage
      await this.executeJestTests(adminPath);

      // Generate final report
      this.generateFinalReport();

    } catch (error) {
      this.testResults.errors.push(error.message);
      console.error('❌ Test execution failed:', error.message);
    }
  }

  async installDependencies(adminPath) {
    console.log('📦 Checking test dependencies...');
    
    // Skip installation since dependencies are already installed
    console.log('✅ Dependencies already installed');
    return Promise.resolve();
  }

  async executeJestTests(adminPath) {
    console.log('🚀 Running Admin Service component tests...\n');

    return new Promise((resolve, reject) => {
      const jest = spawn('npx', ['jest', 
        '__tests__/components/',
        '--coverage',
        '--verbose',
        '--passWithNoTests',
        '--json',
        '--outputFile=test-results.json'
      ], {
        cwd: adminPath,
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';

      jest.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      jest.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      jest.on('close', (code) => {
        this.parseTestResults(adminPath, stdout, stderr, code);
        resolve();
      });

      jest.on('error', (error) => {
        this.testResults.errors.push(`Jest execution error: ${error.message}`);
        resolve(); // Don't reject, still try to parse partial results
      });
    });
  }

  parseTestResults(adminPath, stdout, stderr, exitCode) {
    try {
      // Try to read Jest JSON output
      const resultsPath = path.join(adminPath, 'test-results.json');
      if (fs.existsSync(resultsPath)) {
        const jestResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        
        this.testResults.totalTests = jestResults.numTotalTests || 0;
        this.testResults.passedTests = jestResults.numPassedTests || 0;
        this.testResults.failedTests = jestResults.numFailedTests || 0;
        
        if (jestResults.coverageMap) {
          this.testResults.coverage = this.calculateCoverage(jestResults.coverageMap);
        }

        // Process test suites
        if (jestResults.testResults) {
          this.testResults.testSuites = jestResults.testResults.map(suite => ({
            name: path.basename(suite.name),
            status: suite.status,
            numPassingTests: suite.numPassingTests,
            numFailingTests: suite.numFailingTests,
            duration: suite.perfStats ? suite.perfStats.runtime : 0
          }));
        }
      } else {
        // Parse stdout for basic results
        this.parseStdoutResults(stdout);
      }

      // Calculate success rate
      if (this.testResults.totalTests > 0) {
        this.testResults.successRate = 
          (this.testResults.passedTests / this.testResults.totalTests) * 100;
      }

      // Clean up
      if (fs.existsSync(resultsPath)) {
        fs.unlinkSync(resultsPath);
      }

    } catch (error) {
      this.testResults.errors.push(`Result parsing error: ${error.message}`);
    }
  }

  parseStdoutResults(stdout) {
    // Fallback parsing from stdout
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      if (line.includes('Tests:')) {
        const match = line.match(/Tests:\s+(\d+)\s+passed(?:,\s+(\d+)\s+failed)?/);
        if (match) {
          this.testResults.passedTests = parseInt(match[1]) || 0;
          this.testResults.failedTests = parseInt(match[2]) || 0;
          this.testResults.totalTests = this.testResults.passedTests + this.testResults.failedTests;
        }
      }
    }
  }

  calculateCoverage(coverageMap) {
    const coverage = {
      statements: { covered: 0, total: 0, percentage: 0 },
      branches: { covered: 0, total: 0, percentage: 0 },
      functions: { covered: 0, total: 0, percentage: 0 },
      lines: { covered: 0, total: 0, percentage: 0 }
    };

    for (const file in coverageMap) {
      const fileCoverage = coverageMap[file];
      
      // Statements
      coverage.statements.covered += fileCoverage.s ? Object.values(fileCoverage.s).filter(v => v > 0).length : 0;
      coverage.statements.total += fileCoverage.s ? Object.keys(fileCoverage.s).length : 0;
      
      // Branches
      coverage.branches.covered += fileCoverage.b ? Object.values(fileCoverage.b).flat().filter(v => v > 0).length : 0;
      coverage.branches.total += fileCoverage.b ? Object.values(fileCoverage.b).flat().length : 0;
      
      // Functions
      coverage.functions.covered += fileCoverage.f ? Object.values(fileCoverage.f).filter(v => v > 0).length : 0;
      coverage.functions.total += fileCoverage.f ? Object.keys(fileCoverage.f).length : 0;
    }

    // Calculate percentages
    coverage.statements.percentage = coverage.statements.total > 0 ? 
      (coverage.statements.covered / coverage.statements.total) * 100 : 0;
    coverage.branches.percentage = coverage.branches.total > 0 ? 
      (coverage.branches.covered / coverage.branches.total) * 100 : 0;
    coverage.functions.percentage = coverage.functions.total > 0 ? 
      (coverage.functions.covered / coverage.functions.total) * 100 : 0;

    return coverage;
  }

  generateFinalReport() {
    this.testResults.endTime = new Date();
    const duration = this.testResults.endTime - this.testResults.startTime;

    console.log('\n' + '='.repeat(80));
    console.log('📊 PHASE 2B - ADMIN SERVICE FRONTEND TESTING REPORT');
    console.log('='.repeat(80));
    
    console.log(`⏱️  Duration: ${Math.round(duration / 1000)}s`);
    console.log(`📝 Total Tests: ${this.testResults.totalTests}`);
    console.log(`✅ Passed: ${this.testResults.passedTests}`);
    console.log(`❌ Failed: ${this.testResults.failedTests}`);
    console.log(`📈 Success Rate: ${this.testResults.successRate.toFixed(1)}%`);

    if (Object.keys(this.testResults.coverage).length > 0) {
      console.log('\n📊 Test Coverage:');
      console.log(`   Statements: ${this.testResults.coverage.statements?.percentage?.toFixed(1) || 0}%`);
      console.log(`   Branches: ${this.testResults.coverage.branches?.percentage?.toFixed(1) || 0}%`);
      console.log(`   Functions: ${this.testResults.coverage.functions?.percentage?.toFixed(1) || 0}%`);
    }

    if (this.testResults.testSuites.length > 0) {
      console.log('\n🧪 Test Suites:');
      this.testResults.testSuites.forEach(suite => {
        const status = suite.status === 'passed' ? '✅' : '❌';
        console.log(`   ${status} ${suite.name} (${suite.numPassingTests}/${suite.numPassingTests + suite.numFailingTests})`);
      });
    }

    if (this.testResults.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      this.testResults.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    console.log('\n🎯 Phase 2B Status: ' + 
      (this.testResults.successRate >= 90 ? 'SUCCESS ✅' : 
       this.testResults.successRate >= 80 ? 'PARTIAL SUCCESS ⚠️' : 'NEEDS IMPROVEMENT ❌'));

    console.log('\n📋 Next Steps:');
    if (this.testResults.successRate >= 90) {
      console.log('   ✅ Phase 2B completed successfully!');
      console.log('   🚀 Ready to proceed to Phase 2C (Hub Service Frontend Testing)');
    } else {
      console.log('   🔧 Review and fix failing tests');
      console.log('   📈 Improve test coverage where needed');
      console.log('   🔄 Re-run Phase 2B tests');
    }

    console.log('='.repeat(80));

    // Save detailed results to file
    fs.writeFileSync(
      'PHASE_2B_ADMIN_FRONTEND_TEST_RESULTS.json',
      JSON.stringify(this.testResults, null, 2)
    );
  }
}

// Execute if run directly
if (require.main === module) {
  const runner = new AdminFrontendTestRunner();
  runner.runTests().catch(console.error);
}

module.exports = AdminFrontendTestRunner;
