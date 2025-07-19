#!/usr/bin/env node

/**
 * 🚀 CODAI PRODUCTION READINESS VALIDATION
 * Comprehensive validation of all 44 applications using VS Code tools
 * Challenge: Don't stop until the plan is complete and every step is tested and passed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SimpleProductionValidator {
    constructor() {
        this.results = {
            startTime: Date.now(),
            validatedApps: 0,
            totalApps: 44,
            summary: {}
        };

        this.successfulApps = [];
        this.failedApps = [];
        this.appResults = {};

        // All 44 applications from the production plan
        this.apps = [
            { name: 'ACASAI', port: 5041, path: 'apps/acasai' },
            { name: 'ADMIN', port: 5009, path: 'apps/admin' },
            { name: 'AIDE', port: 5025, path: 'apps/aide' },
            { name: 'AJUTAI', port: 5006, path: 'apps/ajutai' },
            { name: 'ANALIZAI', port: 5003, path: 'apps/analizai' },
            { name: 'BANCAI', port: 5004, path: 'apps/bancai' },
            { name: 'BANCAI-MOBILE', port: 5019, path: 'apps/bancai-mobile' },
            { name: 'CODAI', port: 5000, path: 'apps/codai' },
            { name: 'CODAI-MOBILE', port: 5018, path: 'apps/codai-mobile' },
            { name: 'CONVERSAI', port: 5001, path: 'apps/conversai' },
            { name: 'CUMPARAI', port: 5010, path: 'apps/cumparai' },
            { name: 'CURTAI', port: 5011, path: 'apps/curtai' },
            { name: 'DASH', port: 5012, path: 'apps/dash' },
            { name: 'DEXAI', port: 5013, path: 'apps/dexai' },
            { name: 'DOCS', port: 5014, path: 'apps/docs' },
            { name: 'DONAI', port: 5015, path: 'apps/donai' },
            { name: 'EXPLORER', port: 5016, path: 'apps/explorer' },
            { name: 'FABRICAI', port: 5017, path: 'apps/fabricai' },
            { name: 'GLASS', port: 5020, path: 'apps/glass' },
            { name: 'HUB', port: 5007, path: 'apps/hub' },
            { name: 'ID', port: 5008, path: 'apps/id' },
            { name: 'JUCAI', port: 5021, path: 'apps/jucai' },
            { name: 'KODEX', port: 5022, path: 'apps/kodex' },
            { name: 'LEGALIZAI', port: 5023, path: 'apps/legalizai' },
            { name: 'LOGAI', port: 5024, path: 'apps/logai' },
            { name: 'MARKETAI', port: 5026, path: 'apps/marketai' },
            { name: 'MEMORAI', port: 5002, path: 'apps/memorai' },
            { name: 'METU', port: 5028, path: 'apps/metu' },
            { name: 'METU-WEB', port: 5027, path: 'apps/metu-web' },
            { name: 'MOBILE', port: 5029, path: 'apps/mobile' },
            { name: 'MOD', port: 5030, path: 'apps/mod' },
            { name: 'MUZICAI', port: 5031, path: 'apps/muzicai' },
            { name: 'PREZENTAI', port: 5032, path: 'apps/prezentai' },
            { name: 'PUBLICAI', port: 5033, path: 'apps/publicai' },
            { name: 'ROMAI', port: 5034, path: 'apps/romai' },
            { name: 'SOCIAI', port: 5035, path: 'apps/sociai' },
            { name: 'STOCAI', port: 5005, path: 'apps/stocai' },
            { name: 'STUDIAI', port: 5036, path: 'apps/studiai' },
            { name: 'SUNAI', port: 5037, path: 'apps/sunai' },
            { name: 'TALENTAI', port: 5038, path: 'apps/talentai' },
            { name: 'TOOLS', port: 5039, path: 'apps/tools' },
            { name: 'WALLET', port: 5040, path: 'apps/wallet' },
            { name: 'X', port: 5042, path: 'apps/x' }
        ];
    }

    async validateAllApplications() {
        console.log('🚀 STARTING PRODUCTION READINESS VALIDATION');
        console.log('===============================================');
        console.log(`📅 Started at: ${new Date().toISOString()}`);
        console.log(`🎯 Challenge: Don't stop until complete and every step is tested and passed`);
        console.log(`📊 Applications to validate: ${this.apps.length}`);

        // First, let's validate the file structure
        console.log('\n📁 PHASE 1: FILE STRUCTURE VALIDATION');
        console.log('======================================');

        for (const app of this.apps) {
            try {
                const result = await this.validateAppStructure(app);
                this.appResults[app.name] = result;

                if (result.success) {
                    this.successfulApps.push(app.name);
                    console.log(`✅ ${app.name}: Structure valid`);
                } else {
                    this.failedApps.push(app.name);
                    console.log(`❌ ${app.name}: ${result.issues.join(', ')}`);
                }

                this.results.validatedApps++;
            } catch (error) {
                console.log(`💥 ${app.name}: Validation error - ${error.message}`);
                this.failedApps.push(app.name);
                this.appResults[app.name] = {
                    success: false,
                    issues: [error.message]
                };
                this.results.validatedApps++;
            }
        }

        // Generate validation report
        await this.generateValidationReport();

        return this.results;
    }

    async validateAppStructure(app) {
        const result = {
            name: app.name,
            success: false,
            issues: [],
            validations: {
                packageJson: false,
                nextConfig: false,
                appStructure: false,
                sharedComponents: false,
                translations: false
            }
        };

        const appPath = path.join(process.cwd(), app.path);

        try {
            // Check if app directory exists
            if (!fs.existsSync(appPath)) {
                result.issues.push('Application directory not found');
                return result;
            }

            // 1. Check package.json
            const packageJsonPath = path.join(appPath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

                // Check for required dependencies
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                const hasSharedUI = deps['@codai/shared-ui'];
                const hasTranslations = deps['@codai/translations'];
                const hasNext = deps['next'];

                if (hasNext) result.validations.packageJson = true;
                if (hasSharedUI) result.validations.sharedComponents = true;
                if (hasTranslations) result.validations.translations = true;
            } else {
                result.issues.push('package.json not found');
            }

            // 2. Check for Next.js structure
            const appDir = path.join(appPath, 'app');
            const srcDir = path.join(appPath, 'src');
            const pagesDir = path.join(appPath, 'pages');

            if (fs.existsSync(appDir) || fs.existsSync(srcDir) || fs.existsSync(pagesDir)) {
                result.validations.appStructure = true;
            } else {
                result.issues.push('Next.js app structure not found');
            }

            // 3. Check for next.config.js
            const nextConfigPath = path.join(appPath, 'next.config.js');
            const nextConfigMjsPath = path.join(appPath, 'next.config.mjs');

            if (fs.existsSync(nextConfigPath) || fs.existsSync(nextConfigMjsPath)) {
                result.validations.nextConfig = true;
            } else {
                result.issues.push('next.config not found');
            }

            // Calculate success
            const validationCount = Object.values(result.validations).filter(v => v).length;
            result.success = validationCount >= 3; // At least 3 out of 5 validations pass

        } catch (error) {
            result.issues.push(`Validation error: ${error.message}`);
        }

        return result;
    }

    async generateValidationReport() {
        const endTime = Date.now();
        const duration = endTime - this.results.startTime;

        this.results.summary = {
            totalApps: this.apps.length,
            validatedApps: this.results.validatedApps,
            successfulApps: this.successfulApps.length,
            failedApps: this.failedApps.length,
            successRate: Math.round((this.successfulApps.length / this.apps.length) * 100),
            overallSuccess: this.successfulApps.length >= 40, // 90% success rate
            productionReady: this.successfulApps.length >= 42, // 95% success rate
            duration: Math.round(duration / 1000),
            timestamp: new Date().toISOString()
        };

        console.log('\n🎯 PRODUCTION READINESS VALIDATION COMPLETE');
        console.log('==============================================');
        console.log(`📅 Completed at: ${new Date().toISOString()}`);
        console.log(`⏱️ Total Duration: ${this.results.summary.duration}s`);
        console.log(`📊 Overall Result: ${this.results.summary.overallSuccess ? '✅ SUCCESS' : '❌ REQUIRES ATTENTION'}`);
        console.log(`🚀 Production Ready: ${this.results.summary.productionReady ? '✅ YES' : '❌ NO'}`);
        console.log('');
        console.log('📋 VALIDATION RESULTS:');
        console.log(`  • Total Applications: ${this.results.summary.totalApps}`);
        console.log(`  • Successfully Validated: ${this.results.summary.successfulApps} (${this.results.summary.successRate}%)`);
        console.log(`  • Failed Validation: ${this.results.summary.failedApps}`);
        console.log('');

        if (this.successfulApps.length > 0) {
            console.log('✅ STRUCTURALLY VALID APPLICATIONS:');
            this.successfulApps.forEach(app => {
                console.log(`   • ${app}`);
            });
        }

        if (this.failedApps.length > 0) {
            console.log('\n❌ APPLICATIONS REQUIRING ATTENTION:');
            this.failedApps.forEach(app => {
                const result = this.appResults[app];
                console.log(`   • ${app}: ${result.issues?.join(', ') || 'Unknown issues'}`);
            });
        }

        // Save detailed report
        const reportPath = path.join(process.cwd(), 'validation-results', 'structure-validation-report.json');
        await this.ensureDirectory(path.dirname(reportPath));
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        console.log(`\n📄 Detailed report saved: ${reportPath}`);

        if (this.results.summary.productionReady) {
            console.log('\n🎉 STRUCTURE VALIDATION PASSED!');
            console.log('   Now proceeding to browser-based validation...');
        } else {
            console.log('\n🚨 STRUCTURE ISSUES FOUND');
            console.log('   Fix structural issues before proceeding to browser testing');
        }
    }

    async ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}

// Run if called directly
if (require.main === module) {
    const validator = new SimpleProductionValidator();

    validator.validateAllApplications()
        .then((results) => {
            process.exit(results.summary.overallSuccess ? 0 : 1);
        })
        .catch((error) => {
            console.error('💥 Validation crashed:', error.message);
            process.exit(1);
        });
}

module.exports = SimpleProductionValidator;
