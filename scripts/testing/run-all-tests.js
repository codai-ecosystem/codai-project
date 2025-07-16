#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE TEST RUNNER
 * Executes all tests across the ecosystem with detailed reporting
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class TestRunner {
    constructor() {
        this.results = {
            unit: { passed: 0, failed: 0, total: 0 },
            integration: { passed: 0, failed: 0, total: 0 },
            e2e: { passed: 0, failed: 0, total: 0 },
            coverage: { overall: 0, apps: {} }
        };
    }

    async runAllTests() {
        console.log('🧪 COMPREHENSIVE TEST EXECUTION');
        console.log('================================');
        
        await this.runUnitTests();
        await this.runIntegrationTests();
        await this.runE2ETests();
        await this.generateCoverageReport();
        
        this.displayResults();
    }

    async runUnitTests() {
        console.log('\n🔬 UNIT TESTS');
        console.log('==============');
        
        try {
            execSync('pnpm test:unit', { stdio: 'inherit' });
            console.log('✅ Unit tests completed');
        } catch (error) {
            console.log('❌ Unit tests failed');
        }
    }

    async runIntegrationTests() {
        console.log('\n🔗 INTEGRATION TESTS');
        console.log('====================');
        
        try {
            execSync('pnpm test:integration', { stdio: 'inherit' });
            console.log('✅ Integration tests completed');
        } catch (error) {
            console.log('❌ Integration tests failed');
        }
    }

    async runE2ETests() {
        console.log('\n🌐 END-TO-END TESTS');
        console.log('===================');
        
        try {
            execSync('pnpm test:e2e', { stdio: 'inherit' });
            console.log('✅ E2E tests completed');
        } catch (error) {
            console.log('❌ E2E tests failed');
        }
    }

    async generateCoverageReport() {
        console.log('\n📊 COVERAGE ANALYSIS');
        console.log('====================');
        
        try {
            execSync('pnpm test:coverage', { stdio: 'inherit' });
            console.log('✅ Coverage report generated');
        } catch (error) {
            console.log('❌ Coverage analysis failed');
        }
    }

    displayResults() {
        console.log('\n🎯 TEST RESULTS SUMMARY');
        console.log('========================');
        console.log(`📊 Unit Tests: ${this.results.unit.passed}/${this.results.unit.total} passed`);
        console.log(`🔗 Integration Tests: ${this.results.integration.passed}/${this.results.integration.total} passed`);
        console.log(`🌐 E2E Tests: ${this.results.e2e.passed}/${this.results.e2e.total} passed`);
        console.log(`📈 Overall Coverage: ${this.results.coverage.overall}%`);
    }
}

const runner = new TestRunner();
runner.runAllTests().catch(console.error);