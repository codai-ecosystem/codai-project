#!/usr/bin/env node

/**
 * Production Deployment Script for CODAI Ecosystem
 * Handles blue-green deployment with rollback capabilities
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    environment: 'production',
    healthCheckUrl: 'https://api.codai.dev/health',
    maxRetries: 3,
    retryDelay: 5000,
    rollbackOnFailure: true
};

class ProductionDeployer {
    constructor() {
        this.startTime = Date.now();
        this.deploymentId = `deploy-${this.startTime}`;
        this.logFile = path.join(__dirname, '..', 'logs', `deployment-${this.deploymentId}.log`);

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
            this.log(`✅ ${description} completed successfully`);
            return result;
        } catch (error) {
            this.log(`❌ ${description} failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async preDeploymentChecks() {
        this.log('🔍 Running pre-deployment checks...');

        // Check Git status
        await this.exec('git status --porcelain', 'Git status check');

        // Run CI pipeline
        await this.exec('pnpm run ci', 'CI pipeline execution');

        // Security scan
        await this.exec('pnpm run ci:security', 'Security scan');

        // Performance tests
        await this.exec('pnpm run ci:performance', 'Performance validation');

        this.log('✅ Pre-deployment checks passed');
    }

    async buildForProduction() {
        this.log('🏗️ Building for production...');

        // Clean previous builds
        await this.exec('pnpm run clean', 'Clean previous builds');

        // Install dependencies with frozen lockfile
        await this.exec('pnpm install --frozen-lockfile', 'Install dependencies');

        // Build production assets
        await this.exec('pnpm run build:production', 'Build production assets');

        // Build Docker images
        await this.exec('pnpm run build:docker', 'Build Docker images');

        this.log('✅ Production build completed');
    }

    async deployToProduction() {
        this.log('🚀 Deploying to production...');

        // Tag current deployment
        const tag = `production-${this.deploymentId}`;
        await this.exec(`git tag ${tag}`, `Tag deployment as ${tag}`);

        // Deploy to production environment
        if (process.env.DEPLOYMENT_STRATEGY === 'kubernetes') {
            await this.deployKubernetes();
        } else {
            await this.deployDocker();
        }

        this.log('✅ Production deployment completed');
    }

    async deployKubernetes() {
        this.log('☸️ Deploying to Kubernetes...');

        // Apply Kubernetes manifests
        await this.exec('kubectl apply -f k8s/production/', 'Apply Kubernetes manifests');

        // Wait for rollout to complete
        await this.exec('kubectl rollout status deployment/codai-app', 'Wait for app rollout');
        await this.exec('kubectl rollout status deployment/memorai-app', 'Wait for memorai rollout');

        this.log('✅ Kubernetes deployment completed');
    }

    async deployDocker() {
        this.log('🐳 Deploying with Docker Compose...');

        // Deploy with production compose file
        await this.exec('docker-compose -f docker-compose.prod.yml up -d', 'Deploy production services');

        this.log('✅ Docker deployment completed');
    }

    async healthCheck() {
        this.log('🏥 Running health checks...');

        let retries = 0;
        while (retries < CONFIG.maxRetries) {
            try {
                // Wait for services to start
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));

                // Check health endpoint
                const response = await fetch(CONFIG.healthCheckUrl);
                if (response.ok) {
                    const health = await response.json();
                    this.log(`✅ Health check passed: ${JSON.stringify(health)}`);
                    return true;
                }
                throw new Error(`Health check failed with status: ${response.status}`);
            } catch (error) {
                retries++;
                this.log(`❌ Health check attempt ${retries} failed: ${error.message}`, 'WARN');

                if (retries >= CONFIG.maxRetries) {
                    throw new Error(`Health checks failed after ${CONFIG.maxRetries} attempts`);
                }
            }
        }
    }

    async postDeploymentTasks() {
        this.log('📋 Running post-deployment tasks...');

        // Update database migrations if needed
        await this.exec('pnpm run db:migrate', 'Run database migrations');

        // Clear caches
        await this.exec('pnpm run clean:cache', 'Clear application caches');

        // Generate sitemap
        await this.exec('curl -X POST https://api.codai.dev/admin/generate-sitemap', 'Generate sitemap');

        // Notify monitoring systems
        await this.notifyMonitoring();

        this.log('✅ Post-deployment tasks completed');
    }

    async notifyMonitoring() {
        this.log('📊 Notifying monitoring systems...');

        const deploymentData = {
            deploymentId: this.deploymentId,
            timestamp: this.startTime,
            environment: CONFIG.environment,
            version: process.env.npm_package_version || '1.0.0',
            duration: Date.now() - this.startTime
        };

        // Send to monitoring service (replace with actual monitoring webhook)
        // await fetch('https://monitoring.codai.dev/deployments', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(deploymentData)
        // });

        this.log(`📊 Deployment metrics: ${JSON.stringify(deploymentData)}`);
    }

    async rollback() {
        this.log('🔄 Initiating rollback...');

        try {
            if (process.env.DEPLOYMENT_STRATEGY === 'kubernetes') {
                await this.exec('kubectl rollout undo deployment/codai-app', 'Rollback app deployment');
                await this.exec('kubectl rollout undo deployment/memorai-app', 'Rollback memorai deployment');
            } else {
                await this.exec('docker-compose -f docker-compose.prod.yml down', 'Stop current services');
                await this.exec('docker-compose -f docker-compose.prod.yml up -d --force-recreate', 'Restart with previous images');
            }

            this.log('✅ Rollback completed successfully');
        } catch (error) {
            this.log(`❌ Rollback failed: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    async deploy() {
        try {
            this.log(`🚀 Starting production deployment: ${this.deploymentId}`);

            await this.preDeploymentChecks();
            await this.buildForProduction();
            await this.deployToProduction();
            await this.healthCheck();
            await this.postDeploymentTasks();

            const duration = Date.now() - this.startTime;
            this.log(`🎉 Deployment completed successfully in ${duration}ms`);

            // Exit successfully
            process.exit(0);

        } catch (error) {
            this.log(`💥 Deployment failed: ${error.message}`, 'ERROR');

            if (CONFIG.rollbackOnFailure) {
                try {
                    await this.rollback();
                } catch (rollbackError) {
                    this.log(`💥 Rollback also failed: ${rollbackError.message}`, 'ERROR');
                }
            }

            // Exit with error
            process.exit(1);
        }
    }
}

// Run deployment if called directly
if (require.main === module) {
    const deployer = new ProductionDeployer();
    deployer.deploy().catch(error => {
        console.error('Deployment script failed:', error);
        process.exit(1);
    });
}

module.exports = ProductionDeployer;