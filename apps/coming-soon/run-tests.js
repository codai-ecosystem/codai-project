#!/usr/bin/env node

/**
 * CODAI Coming Soon Page - Test Suite Runner
 * Comprehensive test execution script following TDD methodology
 * 
 * This script runs all test suites created for the redesign project:
 * - Unit tests (Jest + React Testing Library)
 * - Integration tests
 * - E2E tests (Playwright)
 * - Performance tests
 * - Accessibility tests
 * - Responsive design tests
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

function log(message, color = colors.white) {
    console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
    log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    log(`${colors.bright}${colors.cyan}${message}${colors.reset}`);
    log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function logSection(message) {
    log(`\n${colors.bright}${colors.yellow}${message}${colors.reset}`);
    log(`${colors.yellow}${'-'.repeat(40)}${colors.reset}`);
}

function logSuccess(message) {
    log(`${colors.bright}${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
    log(`${colors.bright}${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
    log(`${colors.bright}${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
    log(`${colors.bright}${colors.blue}ℹ️  ${message}${colors.reset}`);
}

class TestSuiteRunner {
    constructor() {
        this.results = {
            unit: { passed: false, duration: 0, coverage: 0 },
            integration: { passed: false, duration: 0 },
            e2e: { passed: false, duration: 0 },
            accessibility: { passed: false, duration: 0 },
            performance: { passed: false, duration: 0 },
            responsive: { passed: false, duration: 0 },
        };
        this.startTime = Date.now();
    }

    async runCommand(command, description) {
        const startTime = Date.now();
        log(`\n${colors.dim}Running: ${command}${colors.reset}`);

        try {
            const output = execSync(command, {
                cwd: process.cwd(),
                stdio: 'pipe',
                encoding: 'utf8',
                timeout: 120000 // 2 minutes timeout
            });

            const duration = Date.now() - startTime;
            logSuccess(`${description} completed in ${duration}ms`);

            return { success: true, output, duration };
        } catch (error) {
            const duration = Date.now() - startTime;
            logError(`${description} failed after ${duration}ms`);
            if (error.stdout) log(`${colors.dim}STDOUT: ${error.stdout}${colors.reset}`);
            if (error.stderr) log(`${colors.dim}STDERR: ${error.stderr}${colors.reset}`);

            return { success: false, output: error.stderr || error.message, duration };
        }
    }

    async checkPrerequisites() {
        logSection('Checking Prerequisites');

        // Check if package.json exists
        if (!fs.existsSync('package.json')) {
            logError('package.json not found. Are you in the correct directory?');
            return false;
        }

        // Check if node_modules exists
        if (!fs.existsSync('node_modules')) {
            logWarning('node_modules not found. Installing dependencies...');
            const result = await this.runCommand('pnpm install', 'Dependency installation');
            if (!result.success) return false;
        }

        // Check for required test dependencies
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const devDeps = packageJson.devDependencies || {};

        const requiredDeps = ['jest', '@testing-library/react', '@testing-library/jest-dom'];
        const missingDeps = requiredDeps.filter(dep => !devDeps[dep]);

        if (missingDeps.length > 0) {
            logWarning(`Missing test dependencies: ${missingDeps.join(', ')}`);
            logInfo('Installing missing dependencies...');
            const installCmd = `pnpm add -D ${missingDeps.join(' ')}`;
            const result = await this.runCommand(installCmd, 'Test dependency installation');
            if (!result.success) return false;
        }

        logSuccess('Prerequisites check completed');
        return true;
    }

    async runUnitTests() {
        logSection('Running Unit Tests (Jest + React Testing Library)');

        const result = await this.runCommand(
            'pnpm run test -- --coverage --passWithNoTests --testPathPattern="__tests__/(components|utils|hooks)" --verbose',
            'Unit tests'
        );

        this.results.unit.passed = result.success;
        this.results.unit.duration = result.duration;

        // Extract coverage information if available
        if (result.output.includes('Coverage')) {
            const coverageMatch = result.output.match(/All files\s+\|\s+(\d+\.?\d*)/);
            if (coverageMatch) {
                this.results.unit.coverage = parseFloat(coverageMatch[1]);
                logInfo(`Test coverage: ${this.results.unit.coverage}%`);
            }
        }

        return result.success;
    }

    async runIntegrationTests() {
        logSection('Running Integration Tests');

        const result = await this.runCommand(
            'pnpm run test -- --testPathPattern="__tests__/integration" --passWithNoTests --verbose',
            'Integration tests'
        );

        this.results.integration.passed = result.success;
        this.results.integration.duration = result.duration;

        return result.success;
    }

    async runAccessibilityTests() {
        logSection('Running Accessibility Tests (WCAG 2.1 AA)');

        // Install jest-axe if not present
        if (!fs.existsSync('node_modules/jest-axe')) {
            logInfo('Installing jest-axe for accessibility testing...');
            const installResult = await this.runCommand('pnpm add -D jest-axe @types/jest-axe', 'jest-axe installation');
            if (!installResult.success) {
                logError('Failed to install jest-axe. Skipping accessibility tests.');
                return false;
            }
        }

        const result = await this.runCommand(
            'pnpm run test -- --testPathPattern="__tests__/accessibility" --passWithNoTests --verbose',
            'Accessibility tests'
        );

        this.results.accessibility.passed = result.success;
        this.results.accessibility.duration = result.duration;

        return result.success;
    }

    async runPerformanceTests() {
        logSection('Running Performance Tests');

        const result = await this.runCommand(
            'pnpm run test -- --testPathPattern="__tests__/performance" --passWithNoTests --verbose',
            'Performance tests'
        );

        this.results.performance.passed = result.success;
        this.results.performance.duration = result.duration;

        return result.success;
    }

    async runResponsiveTests() {
        logSection('Running Responsive Design Tests');

        const result = await this.runCommand(
            'pnpm run test -- --testPathPattern="__tests__/responsive" --passWithNoTests --verbose',
            'Responsive design tests'
        );

        this.results.responsive.passed = result.success;
        this.results.responsive.duration = result.duration;

        return result.success;
    }

    async runE2ETests() {
        logSection('Running End-to-End Tests (Playwright)');

        // Check if Playwright is installed
        if (!fs.existsSync('node_modules/@playwright/test')) {
            logInfo('Installing Playwright for E2E testing...');
            const installResult = await this.runCommand('pnpm add -D @playwright/test', 'Playwright installation');
            if (!installResult.success) {
                logError('Failed to install Playwright. Skipping E2E tests.');
                return false;
            }

            // Install browsers
            logInfo('Installing Playwright browsers...');
            const browsersResult = await this.runCommand('npx playwright install', 'Playwright browsers installation');
            if (!browsersResult.success) {
                logWarning('Failed to install Playwright browsers. E2E tests may fail.');
            }
        }

        // Check if development server is running
        logInfo('Starting development server for E2E tests...');

        // Try to run Playwright tests
        const result = await this.runCommand(
            'npx playwright test --config=playwright.config.ts',
            'End-to-end tests'
        );

        this.results.e2e.passed = result.success;
        this.results.e2e.duration = result.duration;

        return result.success;
    }

    async runLintCheck() {
        logSection('Running Code Quality Checks');

        // Run ESLint if configured
        if (fs.existsSync('.eslintrc.js') || fs.existsSync('.eslintrc.json') || fs.existsSync('eslint.config.js')) {
            const result = await this.runCommand('npx eslint . --ext .ts,.tsx,.js,.jsx', 'ESLint check');
            if (!result.success) {
                logWarning('ESLint found issues. Please review and fix before deployment.');
            }
        }

        // Run TypeScript check
        if (fs.existsSync('tsconfig.json')) {
            const result = await this.runCommand('npx tsc --noEmit', 'TypeScript check');
            if (!result.success) {
                logError('TypeScript compilation errors found.');
                return false;
            }
            logSuccess('TypeScript check passed');
        }

        return true;
    }

    generateReport() {
        logHeader('TEST SUITE EXECUTION REPORT');

        const totalDuration = Date.now() - this.startTime;
        const passedTests = Object.values(this.results).filter(r => r.passed).length;
        const totalTests = Object.keys(this.results).length;

        log(`${colors.bright}📊 Overall Results:${colors.reset}`);
        log(`   Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
        log(`   Test Suites Passed: ${passedTests}/${totalTests}`);
        log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        if (this.results.unit.coverage > 0) {
            log(`   Code Coverage: ${this.results.unit.coverage}%`);
        }

        log(`\n${colors.bright}📋 Detailed Results:${colors.reset}`);

        Object.entries(this.results).forEach(([testType, result]) => {
            const status = result.passed ?
                `${colors.green}✅ PASSED${colors.reset}` :
                `${colors.red}❌ FAILED${colors.reset}`;

            const duration = `${colors.dim}(${result.duration}ms)${colors.reset}`;
            const testName = testType.charAt(0).toUpperCase() + testType.slice(1);

            log(`   ${testName.padEnd(15)} ${status} ${duration}`);
        });

        // Success criteria evaluation
        log(`\n${colors.bright}🎯 Success Criteria:${colors.reset}`);

        const criteriaResults = [
            { name: 'All unit tests pass', passed: this.results.unit.passed },
            { name: 'Integration tests pass', passed: this.results.integration.passed },
            { name: 'Accessibility compliance', passed: this.results.accessibility.passed },
            { name: 'Performance standards', passed: this.results.performance.passed },
            { name: 'Responsive design', passed: this.results.responsive.passed },
            { name: 'Code coverage >80%', passed: this.results.unit.coverage >= 80 },
        ];

        criteriaResults.forEach(criteria => {
            const status = criteria.passed ?
                `${colors.green}✅${colors.reset}` :
                `${colors.red}❌${colors.reset}`;
            log(`   ${status} ${criteria.name}`);
        });

        const allCriteriaMet = criteriaResults.every(c => c.passed);

        if (allCriteriaMet) {
            log(`\n${colors.bright}${colors.green}🎉 SUCCESS: All quality criteria met! Ready for implementation.${colors.reset}`);
            return true;
        } else {
            log(`\n${colors.bright}${colors.red}⚠️  ATTENTION: Some quality criteria not met. Please address issues before proceeding.${colors.reset}`);
            return false;
        }
    }

    async run() {
        logHeader('CODAI COMING SOON - COMPREHENSIVE TEST SUITE');
        logInfo('Following TDD methodology: Tests First, Implementation Second');
        logInfo('This suite validates all redesign requirements before implementation.');

        try {
            // Check prerequisites
            const prereqsPassed = await this.checkPrerequisites();
            if (!prereqsPassed) {
                logError('Prerequisites check failed. Cannot continue.');
                process.exit(1);
            }

            // Run code quality checks first
            await this.runLintCheck();

            // Run all test suites
            await this.runUnitTests();
            await this.runIntegrationTests();
            await this.runAccessibilityTests();
            await this.runPerformanceTests();
            await this.runResponsiveTests();

            // Run E2E tests (optional - requires dev server)
            logInfo('E2E tests require development server. Skipping for now...');
            // await this.runE2ETests();

            // Generate final report
            const success = this.generateReport();

            if (success) {
                log(`\n${colors.bright}${colors.green}✅ All tests completed successfully!${colors.reset}`);
                log(`${colors.bright}${colors.green}🚀 Ready to proceed with implementation phase.${colors.reset}`);
                process.exit(0);
            } else {
                log(`\n${colors.bright}${colors.yellow}⚠️  Some tests need attention before implementation.${colors.reset}`);
                process.exit(1);
            }

        } catch (error) {
            logError(`Test suite execution failed: ${error.message}`);
            process.exit(1);
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const runner = new TestSuiteRunner();
    runner.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = TestSuiteRunner;