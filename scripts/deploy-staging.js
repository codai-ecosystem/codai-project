#!/usr/bin/env node

/**
 * Staging Deployment Script for CODAI Ecosystem
 * Handles deployment to staging environment with validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    environment: 'staging',
    healthCheckUrl: 'https://staging-api.codai.dev/health',
    frontendUrl: 'https://staging.codai.dev',
    maxRetries: 3,
    retryDelay: 3000
};

class StagingDeployer {
    constructor() {
        this.startTime = Date.now();
        this.deploymentId = `staging-${this.startTime}`;
        this.logFile = path.join(__dirname, '..', 'logs', `staging-${this.deploymentId}.log`);

        // Ensure logs directory exists
        fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(this.logFile, logMessage + '\n');
    }

    async exec(command, description) {
        this.log(`Executing: ${description}`);
        try {
            const result = execSync(command, {
                encoding: 'utf8',
                stdio: ['inherit', 'pipe', 'pipe']
            });
            this.log(`✅ ${description} completed`);
            return result;
        } catch (error) {
            this.log(`❌ ${description} failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async preStagingChecks() {
        this.log('🔍 Running pre-staging checks...');

        // Check current branch
        const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        this.log(`Current branch: ${branch}`);

        if (branch !== 'develop' && !branch.startsWith('feature/') && !branch.startsWith('hotfix/')) {
            throw new Error(`Invalid branch for staging deployment: ${branch}`);
        }

        // Run fast CI checks
        await this.exec('pnpm run ci:fast', 'Fast CI validation');

        this.log('✅ Pre-staging checks passed');
    }

    async buildForStaging() {
        this.log('🏗️ Building for staging...');

        // Clean and install
        await this.exec('pnpm run clean', 'Clean workspace');
        await this.exec('pnpm install --frozen-lockfile', 'Install dependencies');

        // Build with staging environment
        await this.exec('NODE_ENV=staging pnpm run build', 'Build staging assets');

        this.log('✅ Staging build completed');
    }

    async deployToStaging() {
        this.log('🚀 Deploying to staging...');

        const deploymentStrategy = process.env.STAGING_STRATEGY || 'docker';

        if (deploymentStrategy === 'kubernetes') {
            await this.deployKubernetesStaging();
        } else if (deploymentStrategy === 'azure') {
            await this.deployAzureStaging();
        } else {
            await this.deployDockerStaging();
        }

        this.log('✅ Staging deployment completed');
    }

    async deployDockerStaging() {
        this.log('🐳 Deploying with Docker to staging...');

        // Build staging images
        await this.exec('docker-compose -f docker-compose.staging.yml build', 'Build staging images');

        // Deploy to staging
        await this.exec('docker-compose -f docker-compose.staging.yml up -d', 'Deploy staging services');

        // Wait for services to stabilize
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    async deployKubernetesStaging() {
        this.log('☸️ Deploying to Kubernetes staging...');

        // Apply staging manifests
        await this.exec('kubectl apply -f k8s/staging/ --namespace=staging', 'Apply staging manifests');

        // Wait for deployments
        await this.exec('kubectl rollout status deployment/codai-app --namespace=staging', 'Wait for app rollout');
    }

    async deployAzureStaging() {
        this.log('☁️ Deploying to Azure staging...');

        // Deploy to Azure Container Apps
        await this.exec('az containerapp update --name codai-staging --resource-group codai-staging-rg', 'Deploy to Azure');
    }

    async healthCheck() {
        this.log('🏥 Running staging health checks...');

        let retries = 0;
        while (retries < CONFIG.maxRetries) {
            try {
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));

                // Check API health
                const response = await fetch(CONFIG.healthCheckUrl);
                if (!response.ok) {
                    throw new Error(`API health check failed: ${response.status}`);
                }

                const health = await response.json();
                this.log(`✅ API health check passed: ${JSON.stringify(health)}`);

                // Check frontend
                const frontendResponse = await fetch(CONFIG.frontendUrl);
                if (!frontendResponse.ok) {
                    throw new Error(`Frontend check failed: ${frontendResponse.status}`);
                }

                this.log('✅ Frontend health check passed');
                return true;

            } catch (error) {
                retries++;
                this.log(`❌ Health check attempt ${retries} failed: ${error.message}`, 'WARN');

                if (retries >= CONFIG.maxRetries) {
                    throw new Error(`Health checks failed after ${CONFIG.maxRetries} attempts`);
                }
            }
        }
    }

    async runSmokeTests() {
        this.log('💨 Running smoke tests...');

        try {
            // Run E2E smoke tests against staging
            await this.exec(`STAGING_URL=${CONFIG.frontendUrl} pnpm run test:e2e:smoke`, 'E2E smoke tests');

            // Run API integration tests
            await this.exec(`API_BASE_URL=${CONFIG.healthCheckUrl} pnpm run test:integration:smoke`, 'API smoke tests');

            this.log('✅ Smoke tests passed');
        } catch (error) {
            this.log(`❌ Smoke tests failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async performanceValidation() {
        this.log('⚡ Running performance validation...');

        try {
            // Run Lighthouse against staging
            await this.exec(`lighthouse ${CONFIG.frontendUrl} --output json --output-path ./reports/staging-lighthouse.json`, 'Lighthouse performance test');

            // Load testing (if configured)
            if (process.env.ENABLE_LOAD_TESTING === 'true') {
                await this.exec(`artillery run test/load/staging-load-test.yml`, 'Load testing');
            }

            this.log('✅ Performance validation passed');
        } catch (error) {
            this.log(`⚠️ Performance validation failed: ${error.message}`, 'WARN');
            // Don't fail deployment for performance issues, just warn
        }
    }

    async postStagingTasks() {
        this.log('📋 Running post-staging tasks...');

        // Update database with test data
        await this.exec('NODE_ENV=staging pnpm run db:seed:staging', 'Seed staging database');

        // Clear staging caches
        await this.exec('NODE_ENV=staging pnpm run clean:cache', 'Clear staging caches');

        // Notify team
        await this.notifyTeam();

        this.log('✅ Post-staging tasks completed');
    }

    async notifyTeam() {
        this.log('📢 Notifying team...');

        const deploymentInfo = {
            deploymentId: this.deploymentId,
            environment: 'staging',
            branch: execSync('git branch --show-current', { encoding: 'utf8' }).trim(),
            commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 8),
            deployedBy: process.env.USER || 'unknown',
            timestamp: new Date().toISOString(),
            stagingUrl: CONFIG.frontendUrl,
            duration: Date.now() - this.startTime
        };

        // Log deployment info
        this.log(`📋 Deployment info: ${JSON.stringify(deploymentInfo, null, 2)}`);

        // Send to Slack/Teams webhook (replace with actual webhook)
        // await fetch(process.env.SLACK_WEBHOOK_URL, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     text: `🚀 Staging deployment completed: ${deploymentInfo.deploymentId}`,
        //     attachments: [{
        //       color: 'good',
        //       fields: [
        //         { title: 'Branch', value: deploymentInfo.branch, short: true },
        //         { title: 'Commit', value: deploymentInfo.commit, short: true },
        //         { title: 'URL', value: deploymentInfo.stagingUrl, short: false }
        //       ]
        //     }]
        //   })
        // });
    }

    async deploy() {
        try {
            this.log(`🚀 Starting staging deployment: ${this.deploymentId}`);

            await this.preStagingChecks();
            await this.buildForStaging();
            await this.deployToStaging();
            await this.healthCheck();
            await this.runSmokeTests();
            await this.performanceValidation();
            await this.postStagingTasks();

            const duration = Date.now() - this.startTime;
            this.log(`🎉 Staging deployment completed successfully in ${duration}ms`);

            console.log(`\n🌐 Staging Environment Ready:`);
            console.log(`   Frontend: ${CONFIG.frontendUrl}`);
            console.log(`   API: ${CONFIG.healthCheckUrl}`);
            console.log(`   Logs: ${this.logFile}`);

            process.exit(0);

        } catch (error) {
            this.log(`💥 Staging deployment failed: ${error.message}`, 'ERROR');

            console.log(`\n❌ Staging deployment failed. Check logs: ${this.logFile}`);
            process.exit(1);
        }
    }
}

// Run deployment if called directly
if (require.main === module) {
    const deployer = new StagingDeployer();
    deployer.deploy().catch(error => {
        console.error('Staging deployment script failed:', error);
        process.exit(1);
    });
}

module.exports = StagingDeployer;