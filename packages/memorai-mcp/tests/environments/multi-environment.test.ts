// Multi-Environment Infrastructure Test Suite
// MemorAI MCP Server v9.5.0 - Comprehensive Environment Testing

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { execSync } from 'child_process';

describe('Multi-Environment Infrastructure Tests', () => {
    const environmentsDir = path.join(__dirname, '../../environments');
    let configMaps: any;
    let secrets: any;
    let deployments: any;
    let featureFlags: any;
    let databaseMigrations: any;
    let promotionPipeline: any;
    let environmentValidation: any;

    beforeAll(() => {
        // Load all YAML files for testing
        try {
            const configMapsContent = fs.readFileSync(path.join(environmentsDir, 'configmaps.yaml'), 'utf8');
            configMaps = yaml.loadAll(configMapsContent);

            const secretsContent = fs.readFileSync(path.join(environmentsDir, 'secrets.yaml'), 'utf8');
            secrets = yaml.loadAll(secretsContent);

            const deploymentsContent = fs.readFileSync(path.join(environmentsDir, 'deployments.yaml'), 'utf8');
            deployments = yaml.loadAll(deploymentsContent);

            const featureFlagsContent = fs.readFileSync(path.join(environmentsDir, 'feature-flags.yaml'), 'utf8');
            featureFlags = yaml.loadAll(featureFlagsContent);

            const databaseMigrationsContent = fs.readFileSync(path.join(environmentsDir, 'database-migrations.yaml'), 'utf8');
            databaseMigrations = yaml.loadAll(databaseMigrationsContent);

            const promotionPipelineContent = fs.readFileSync(path.join(environmentsDir, 'promotion-pipeline.yaml'), 'utf8');
            promotionPipeline = yaml.load(promotionPipelineContent);

            const environmentValidationContent = fs.readFileSync(path.join(environmentsDir, 'environment-validation.yaml'), 'utf8');
            environmentValidation = yaml.loadAll(environmentValidationContent);

            console.log('✅ All YAML files loaded successfully for testing');
        } catch (error) {
            console.error('❌ Failed to load YAML files:', error);
            throw error;
        }
    });

    describe('ConfigMaps Validation', () => {
        it('should have valid ConfigMap structure for all environments', () => {
            expect(configMaps).toBeDefined();
            expect(Array.isArray(configMaps)).toBe(true);
            expect(configMaps.length).toBeGreaterThan(0);

            const environments = ['development', 'staging', 'production'];
            const foundEnvs = new Set();

            configMaps.forEach((resource: any) => {
                if (resource.kind === 'ConfigMap' && resource.metadata.name.includes('memorai-env-config-')) {
                    const envName = resource.metadata.name.replace('memorai-env-config-', '');
                    foundEnvs.add(envName);

                    expect(environments).toContain(envName);
                    expect(resource.apiVersion).toBe('v1');
                    expect(resource.metadata.namespace).toBe(`memorai-${envName}`);
                    expect(resource.data).toBeDefined();

                    // Validate essential configuration keys
                    expect(resource.data.NODE_ENV).toBe(envName === 'development' ? 'development' : 'production');
                    expect(resource.data.MEMORAI_MCP_PORT).toBe('4950');
                    expect(resource.data.CBD_BASE_URL).toMatch(/^https?:\/\//);
                }
            });

            expect(foundEnvs.size).toBe(3);
            environments.forEach(env => expect(foundEnvs.has(env)).toBe(true));
        });

        it('should have environment-specific configurations', () => {
            const developmentConfig = configMaps.find((resource: any) =>
                resource.kind === 'ConfigMap' &&
                resource.metadata.name === 'memorai-env-config-development'
            );

            const productionConfig = configMaps.find((resource: any) =>
                resource.kind === 'ConfigMap' &&
                resource.metadata.name === 'memorai-env-config-production'
            );

            expect(developmentConfig).toBeDefined();
            expect(productionConfig).toBeDefined();

            // Development should have debug mode
            expect(developmentConfig.data.ROMAI_LOG_LEVEL).toBe('DEBUG');

            // Production should be optimized
            expect(productionConfig.data.ROMAI_LOG_LEVEL).toBe('INFO');
            expect(productionConfig.data.NODE_ENV).toBe('production');
        });

        it('should have valid database connection configurations', () => {
            configMaps.forEach((resource: any) => {
                if (resource.kind === 'ConfigMap' && resource.metadata.name.includes('memorai-env-config-')) {
                    expect(resource.data.CBD_BASE_URL).toBeDefined();
                    expect(resource.data.DATABASE_URL).toBeDefined();
                    expect(resource.data.REDIS_URL).toBeDefined();

                    // Validate URL formats
                    expect(resource.data.CBD_BASE_URL).toMatch(/^https?:\/\/[^\/]+/);
                    expect(resource.data.DATABASE_URL).toMatch(/^postgresql:\/\//);
                    expect(resource.data.REDIS_URL).toMatch(/^redis:\/\//);
                }
            });
        });
    });

    describe('Secrets Validation', () => {
        it('should have valid Secret structure for all environments', () => {
            expect(secrets).toBeDefined();
            expect(Array.isArray(secrets)).toBe(true);

            const environments = ['development', 'staging', 'production'];
            const foundEnvs = new Set();

            secrets.forEach((resource: any) => {
                if (resource.kind === 'Secret' && resource.metadata.name.includes('memorai-secrets-')) {
                    const envName = resource.metadata.name.replace('memorai-secrets-', '');
                    foundEnvs.add(envName);

                    expect(environments).toContain(envName);
                    expect(resource.apiVersion).toBe('v1');
                    expect(resource.metadata.namespace).toBe(`memorai-${envName}`);
                    expect(resource.type).toBe('Opaque');
                }
            });

            expect(foundEnvs.size).toBe(3);
        });

        it('should have HashiCorp Vault integration for production', () => {
            const vaultResources = secrets.filter((resource: any) =>
                resource.kind === 'ExternalSecret' || resource.kind === 'SecretStore'
            );

            expect(vaultResources.length).toBeGreaterThan(0);

            const secretStore = vaultResources.find((resource: any) => resource.kind === 'SecretStore');
            expect(secretStore).toBeDefined();
            expect(secretStore.spec.provider.vault).toBeDefined();
            expect(secretStore.spec.provider.vault.server).toMatch(/^https?:\/\//);
        });

        it('should have proper secret data structure', () => {
            const developmentSecret = secrets.find((resource: any) =>
                resource.kind === 'Secret' &&
                resource.metadata.name === 'memorai-secrets-development'
            );

            expect(developmentSecret).toBeDefined();
            expect(developmentSecret.data).toBeDefined();

            // Check essential secret keys exist
            const expectedKeys = ['MEMORAI_API_KEY', 'JWT_SECRET', 'DB_PASSWORD', 'REDIS_PASSWORD'];
            expectedKeys.forEach(key => {
                expect(developmentSecret.data[key]).toBeDefined();
            });
        });
    });

    describe('Deployments Validation', () => {
        it('should have valid Deployment manifests for all environments', () => {
            expect(deployments).toBeDefined();
            expect(Array.isArray(deployments)).toBe(true);

            const environments = ['development', 'staging', 'production'];
            const foundDeployments = new Set();

            deployments.forEach((resource: any) => {
                if (resource.kind === 'Deployment' && resource.metadata.name.includes('memorai-mcp-')) {
                    const envName = resource.metadata.name.replace('memorai-mcp-', '');
                    foundDeployments.add(envName);

                    expect(environments).toContain(envName);
                    expect(resource.apiVersion).toBe('apps/v1');
                    expect(resource.spec.selector.matchLabels.app).toBe('memorai-mcp');
                    expect(resource.spec.selector.matchLabels.environment).toBe(envName);

                    // Validate container configuration
                    const container = resource.spec.template.spec.containers[0];
                    expect(container.name).toBe('memorai-mcp');
                    expect(container.image).toMatch(/memorai\/mcp-server:v9\.5\.0/);
                    expect(container.ports[0].containerPort).toBe(4950);

                    // Validate resource requirements
                    expect(container.resources.requests).toBeDefined();
                    expect(container.resources.limits).toBeDefined();

                    // Validate health checks
                    expect(container.livenessProbe.httpGet.path).toBe('/health');
                    expect(container.readinessProbe.httpGet.path).toBe('/health');
                }
            });

            expect(foundDeployments.size).toBe(3);
        });

        it('should have environment-specific resource allocations', () => {
            const devDeployment = deployments.find((resource: any) =>
                resource.kind === 'Deployment' &&
                resource.metadata.name === 'memorai-mcp-development'
            );

            const prodDeployment = deployments.find((resource: any) =>
                resource.kind === 'Deployment' &&
                resource.metadata.name === 'memorai-mcp-production'
            );

            expect(devDeployment).toBeDefined();
            expect(prodDeployment).toBeDefined();

            // Development should have fewer resources
            expect(devDeployment.spec.replicas).toBe(1);
            expect(devDeployment.spec.template.spec.containers[0].resources.requests.cpu).toBe('250m');
            expect(devDeployment.spec.template.spec.containers[0].resources.requests.memory).toBe('512Mi');

            // Production should have more resources
            expect(prodDeployment.spec.replicas).toBe(5);
            expect(prodDeployment.spec.template.spec.containers[0].resources.requests.cpu).toBe('1000m');
            expect(prodDeployment.spec.template.spec.containers[0].resources.requests.memory).toBe('2Gi');

            // Production should have pod anti-affinity
            expect(prodDeployment.spec.template.spec.affinity).toBeDefined();
            expect(prodDeployment.spec.template.spec.affinity.podAntiAffinity).toBeDefined();
        });

        it('should have valid Service manifests', () => {
            const services = deployments.filter((resource: any) => resource.kind === 'Service');
            expect(services.length).toBe(3);

            services.forEach((service: any) => {
                expect(service.apiVersion).toBe('v1');
                expect(service.spec.type).toBe('ClusterIP');
                expect(service.spec.ports[0].port).toBe(4950);
                expect(service.spec.ports[0].targetPort).toBe(4950);
                expect(service.spec.selector.app).toBe('memorai-mcp');
            });
        });
    });

    describe('Feature Flags Validation', () => {
        it('should have valid feature flag configurations for all environments', () => {
            expect(featureFlags).toBeDefined();
            expect(Array.isArray(featureFlags)).toBe(true);

            const environments = ['development', 'staging', 'production'];
            const foundEnvs = new Set();

            featureFlags.forEach((resource: any) => {
                if (resource.kind === 'ConfigMap' && resource.metadata.name.includes('memorai-feature-flags-')) {
                    const envName = resource.metadata.name.replace('memorai-feature-flags-', '');
                    foundEnvs.add(envName);

                    expect(environments).toContain(envName);

                    const flagData = JSON.parse(resource.data['feature-flags.json']);
                    expect(flagData.environment).toBe(envName);
                    expect(flagData.version).toBe('v9.5.0');
                    expect(flagData.features).toBeDefined();
                    expect(flagData.global_settings).toBeDefined();
                }
            });

            expect(foundEnvs.size).toBe(3);
        });

        it('should have appropriate feature flags per environment', () => {
            const devFlags = featureFlags.find((resource: any) =>
                resource.metadata.name === 'memorai-feature-flags-development'
            );
            const prodFlags = featureFlags.find((resource: any) =>
                resource.metadata.name === 'memorai-feature-flags-production'
            );

            expect(devFlags).toBeDefined();
            expect(prodFlags).toBeDefined();

            const devFlagData = JSON.parse(devFlags.data['feature-flags.json']);
            const prodFlagData = JSON.parse(prodFlags.data['feature-flags.json']);

            // Development should have debug mode enabled
            expect(devFlagData.features.debug_mode.enabled).toBe(true);

            // Production should have debug mode disabled
            expect(prodFlagData.features.debug_mode.enabled).toBe(false);

            // Production should disable experimental features
            expect(prodFlagData.features.webrtc_peer_networking.enabled).toBe(false);
            expect(prodFlagData.features.dht_kademlia_protocol.enabled).toBe(false);

            // Both should have essential features
            expect(devFlagData.features.memory_network_effects).toBeDefined();
            expect(prodFlagData.features.memory_network_effects).toBeDefined();
        });

        it('should have valid feature flag service deployment', () => {
            const flagService = featureFlags.find((resource: any) =>
                resource.kind === 'Deployment' &&
                resource.metadata.name === 'memorai-feature-flag-service'
            );

            expect(flagService).toBeDefined();
            expect(flagService.spec.replicas).toBe(2);
            expect(flagService.spec.template.spec.containers[0].name).toBe('feature-flag-service');
            expect(flagService.spec.template.spec.containers[0].ports[0].containerPort).toBe(8080);
        });
    });

    describe('Database Migrations Validation', () => {
        it('should have valid migration jobs for all environments', () => {
            expect(databaseMigrations).toBeDefined();
            expect(Array.isArray(databaseMigrations)).toBe(true);

            const environments = ['development', 'staging', 'production'];
            const foundJobs = new Set();

            databaseMigrations.forEach((resource: any) => {
                if (resource.kind === 'Job' && resource.metadata.name.includes('memorai-db-migration-')) {
                    const envName = resource.metadata.name.replace('memorai-db-migration-', '');
                    foundJobs.add(envName);

                    expect(environments).toContain(envName);
                    expect(resource.apiVersion).toBe('batch/v1');
                    expect(resource.spec.template.spec.containers[0].name).toBe('db-migration');
                }
            });

            expect(foundJobs.size).toBe(3);
        });

        it('should have valid SQL migration scripts', () => {
            const migrationConfigMap = databaseMigrations.find((resource: any) =>
                resource.kind === 'ConfigMap' &&
                resource.metadata.name === 'memorai-db-migration-scripts'
            );

            expect(migrationConfigMap).toBeDefined();
            expect(migrationConfigMap.data['migration-dev.sql']).toBeDefined();
            expect(migrationConfigMap.data['migration-staging.sql']).toBeDefined();
            expect(migrationConfigMap.data['migration-production.sql']).toBeDefined();

            // Validate SQL syntax (basic checks)
            const devSql = migrationConfigMap.data['migration-dev.sql'];
            expect(devSql).toContain('BEGIN;');
            expect(devSql).toContain('COMMIT;');
            expect(devSql).toContain('CREATE TABLE IF NOT EXISTS memory_network_effects');

            const prodSql = migrationConfigMap.data['migration-production.sql'];
            expect(prodSql).toContain('CREATE INDEX IF NOT EXISTS');
            expect(prodSql).toContain('ALTER TABLE memory_network_effects ENABLE ROW LEVEL SECURITY');
        });

        it('should have appropriate timeouts for different environments', () => {
            const devJob = databaseMigrations.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-development'
            );
            const prodJob = databaseMigrations.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-production'
            );

            expect(devJob).toBeDefined();
            expect(prodJob).toBeDefined();

            expect(devJob.spec.ttlSecondsAfterFinished).toBe(300);  // 5 minutes
            expect(prodJob.spec.ttlSecondsAfterFinished).toBe(3600); // 1 hour
            expect(prodJob.spec.backoffLimit).toBe(1); // Production has strict retry limit
        });
    });

    describe('Promotion Pipeline Validation', () => {
        it('should have valid GitHub Actions workflow structure', () => {
            expect(promotionPipeline).toBeDefined();
            expect(promotionPipeline.name).toBe('Environment Promotion Pipeline');
            expect(promotionPipeline.on).toBeDefined();
            expect(promotionPipeline.jobs).toBeDefined();

            // Validate trigger conditions
            expect(promotionPipeline.on.push.branches).toContain('develop');
            expect(promotionPipeline.on.push.branches).toContain('staging');
            expect(promotionPipeline.on.push.branches).toContain('main');
            expect(promotionPipeline.on.workflow_dispatch).toBeDefined();
        });

        it('should have jobs for all environments', () => {
            const jobs = promotionPipeline.jobs;
            expect(jobs['deploy-development']).toBeDefined();
            expect(jobs['deploy-staging']).toBeDefined();
            expect(jobs['deploy-production']).toBeDefined();
            expect(jobs.rollback).toBeDefined();
            expect(jobs.cleanup).toBeDefined();
        });

        it('should have proper job dependencies', () => {
            const stagingJob = promotionPipeline.jobs['deploy-staging'];
            const productionJob = promotionPipeline.jobs['deploy-production'];

            expect(stagingJob.needs).toContain('deploy-development');
            expect(productionJob.needs).toContain('deploy-staging');
        });

        it('should have comprehensive test steps', () => {
            const stagingJob = promotionPipeline.jobs['deploy-staging'];
            const stepNames = stagingJob.steps.map((step: any) => step.name);

            expect(stepNames).toContain('📥 Checkout Code');
            expect(stepNames).toContain('🧪 Run Comprehensive Tests');
            expect(stepNames).toContain('🔒 Security Scan');
            expect(stepNames).toContain('🧪 End-to-End Tests');
        });
    });

    describe('Environment Validation Scripts', () => {
        it('should have validation ConfigMap with required scripts', () => {
            const validationConfigMap = environmentValidation.find((resource: any) =>
                resource.kind === 'ConfigMap' &&
                resource.metadata.name === 'memorai-environment-validation-scripts'
            );

            expect(validationConfigMap).toBeDefined();
            expect(validationConfigMap.data['validate-environment.sh']).toBeDefined();
            expect(validationConfigMap.data['compare-environments.sh']).toBeDefined();
            expect(validationConfigMap.data['performance-baseline.sh']).toBeDefined();
        });

        it('should have valid bash scripts', () => {
            const validationConfigMap = environmentValidation.find((resource: any) =>
                resource.kind === 'ConfigMap' &&
                resource.metadata.name === 'memorai-environment-validation-scripts'
            );

            const validateScript = validationConfigMap.data['validate-environment.sh'];
            expect(validateScript).toContain('#!/bin/bash');
            expect(validateScript).toContain('set -e');
            expect(validateScript).toContain('validate_item()');
            expect(validateScript).toContain('kubectl cluster-info');

            const compareScript = validationConfigMap.data['compare-environments.sh'];
            expect(compareScript).toContain('#!/bin/bash');
            expect(compareScript).toContain('compare_item()');

            const performanceScript = validationConfigMap.data['performance-baseline.sh'];
            expect(performanceScript).toContain('#!/bin/bash');
            expect(performanceScript).toContain('RESPONSE_TIME_THRESHOLD');
        });

        it('should have automated validation CronJob', () => {
            const cronJob = environmentValidation.find((resource: any) =>
                resource.kind === 'CronJob' &&
                resource.metadata.name === 'memorai-environment-validation'
            );

            expect(cronJob).toBeDefined();
            expect(cronJob.spec.schedule).toBe('0 */4 * * *'); // Every 4 hours
            expect(cronJob.spec.jobTemplate.spec.template.spec.containers[0].name).toBe('validation');
        });
    });

    describe('PowerShell Deployment Script Validation', () => {
        it('should exist and have proper structure', () => {
            const deployScriptPath = path.join(environmentsDir, 'deploy-memorai-environments.ps1');
            expect(fs.existsSync(deployScriptPath)).toBe(true);

            const scriptContent = fs.readFileSync(deployScriptPath, 'utf8');
            expect(scriptContent).toContain('param(');
            expect(scriptContent).toContain('function Test-Prerequisites');
            expect(scriptContent).toContain('function Deploy-Environment');
            expect(scriptContent).toContain('function Deploy-AllEnvironments');
            expect(scriptContent).toContain('function Show-EnvironmentStatus');
        });

        it('should have proper parameter validation', () => {
            const deployScriptPath = path.join(environmentsDir, 'deploy-memorai-environments.ps1');
            const scriptContent = fs.readFileSync(deployScriptPath, 'utf8');

            expect(scriptContent).toContain('[ValidateSet("development", "staging", "production", "all")]');
            expect(scriptContent).toContain('[Parameter(Mandatory = $false)]');
            expect(scriptContent).toContain('[switch]$Force = $false');
            expect(scriptContent).toContain('[switch]$DryRun = $false');
        });
    });

    describe('Integration Tests', () => {
        it('should have consistent naming conventions across all resources', () => {
            const allResources = [
                ...configMaps,
                ...secrets,
                ...deployments,
                ...featureFlags,
                ...databaseMigrations,
                ...environmentValidation
            ];

            allResources.forEach((resource: any) => {
                if (resource.metadata && resource.metadata.name && resource.metadata.name.includes('memorai')) {
                    // All MemorAI resources should follow naming conventions
                    expect(resource.metadata.name).toMatch(/^memorai-[a-z0-9-]+$/);

                    if (resource.metadata.labels) {
                        expect(resource.metadata.labels.app).toBeDefined();
                    }
                }
            });
        });

        it('should have consistent version labeling', () => {
            const versionedResources = deployments.filter((resource: any) =>
                resource.kind === 'Deployment' &&
                resource.metadata.name.includes('memorai-mcp-')
            );

            versionedResources.forEach((resource: any) => {
                expect(resource.metadata.labels.version).toBe('v9.5.0');
                expect(resource.spec.template.metadata.labels.version).toBe('v9.5.0');
            });
        });

        it('should have consistent namespace usage', () => {
            const environments = ['development', 'staging', 'production'];
            const allResources = [
                ...configMaps,
                ...secrets,
                ...deployments,
                ...featureFlags,
                ...databaseMigrations
            ];

            allResources.forEach((resource: any) => {
                if (resource.metadata && resource.metadata.namespace && resource.metadata.namespace.includes('memorai-')) {
                    const envName = resource.metadata.namespace.replace('memorai-', '');
                    expect(environments).toContain(envName);
                }
            });
        });
    });

    describe('Security Validation', () => {
        it('should have proper security contexts in production', () => {
            const prodDeployment = deployments.find((resource: any) =>
                resource.kind === 'Deployment' &&
                resource.metadata.name === 'memorai-mcp-production'
            );

            expect(prodDeployment).toBeDefined();
            const container = prodDeployment.spec.template.spec.containers[0];

            expect(container.securityContext).toBeDefined();
            expect(container.securityContext.runAsNonRoot).toBe(true);
            expect(container.securityContext.runAsUser).toBe(1000);
            expect(container.securityContext.allowPrivilegeEscalation).toBe(false);
            expect(container.securityContext.capabilities.drop).toContain('ALL');
        });

        it('should have proper RBAC configurations', () => {
            // Check that service accounts are referenced
            deployments.forEach((resource: any) => {
                if (resource.kind === 'Deployment' && resource.metadata.name.includes('memorai-mcp-')) {
                    const envName = resource.metadata.name.replace('memorai-mcp-', '');
                    expect(resource.spec.template.spec.serviceAccountName).toBe(`memorai-mcp-${envName}`);
                }
            });
        });
    });

    afterAll(() => {
        console.log('🧪 Multi-Environment Infrastructure Test Suite Completed');
    });
});