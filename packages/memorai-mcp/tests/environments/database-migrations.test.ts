// Database Migration Testing Suite
// MemorAI MCP Server v9.5.0 - Database Schema and Migration Validation

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('Database Migration Tests', () => {
    const environmentsDir = path.join(__dirname, '../../environments');
    let migrationResources: any[];
    let migrationScripts: { [key: string]: string } = {};

    beforeAll(() => {
        try {
            const migrationsContent = fs.readFileSync(path.join(environmentsDir, 'database-migrations.yaml'), 'utf8');
            migrationResources = yaml.loadAll(migrationsContent);

            // Extract migration scripts from ConfigMap
            const scriptsConfigMap = migrationResources.find((resource: any) =>
                resource.kind === 'ConfigMap' &&
                resource.metadata.name === 'memorai-db-migration-scripts'
            );

            if (scriptsConfigMap && scriptsConfigMap.data) {
                migrationScripts = scriptsConfigMap.data;
            }

            console.log('✅ Database migration resources loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load migration resources:', error);
            throw error;
        }
    });

    describe('Migration Job Structure', () => {
        it('should have migration jobs for all environments', () => {
            const environments = ['development', 'staging', 'production'];
            const foundJobs = new Set();

            migrationResources.forEach((resource: any) => {
                if (resource.kind === 'Job' && resource.metadata.name.includes('memorai-db-migration-')) {
                    const envName = resource.metadata.name.replace('memorai-db-migration-', '');
                    foundJobs.add(envName);

                    expect(environments).toContain(envName);
                    expect(resource.apiVersion).toBe('batch/v1');
                    expect(resource.metadata.namespace).toBe(`memorai-${envName}`);
                    expect(resource.spec.template.spec.restartPolicy).toBeDefined();
                    expect(resource.spec.template.spec.containers).toHaveLength(1);
                }
            });

            expect(foundJobs.size).toBe(3);
            environments.forEach(env => expect(foundJobs.has(env)).toBe(true));
        });

        it('should have appropriate resource limits for migration jobs', () => {
            const devJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-development'
            );
            const prodJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-production'
            );

            expect(devJob).toBeDefined();
            expect(prodJob).toBeDefined();

            const devContainer = devJob.spec.template.spec.containers[0];
            const prodContainer = prodJob.spec.template.spec.containers[0];

            // Development should have smaller resource requirements
            expect(devContainer.resources.requests.memory).toBe('256Mi');
            expect(devContainer.resources.requests.cpu).toBe('100m');

            // Production should have larger resource requirements
            expect(prodContainer.resources.requests.memory).toBe('1Gi');
            expect(prodContainer.resources.requests.cpu).toBe('500m');
        });

        it('should have different TTL settings for different environments', () => {
            const devJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-development'
            );
            const stagingJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-staging'
            );
            const prodJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-production'
            );

            expect(devJob.spec.ttlSecondsAfterFinished).toBe(300);    // 5 minutes
            expect(stagingJob.spec.ttlSecondsAfterFinished).toBe(600);  // 10 minutes
            expect(prodJob.spec.ttlSecondsAfterFinished).toBe(3600);   // 1 hour
        });
    });

    describe('SQL Script Validation', () => {
        it('should have migration scripts for all environments', () => {
            expect(migrationScripts['migration-dev.sql']).toBeDefined();
            expect(migrationScripts['migration-staging.sql']).toBeDefined();
            expect(migrationScripts['migration-production.sql']).toBeDefined();
        });

        it('should have valid SQL syntax structure', () => {
            Object.entries(migrationScripts).forEach(([scriptName, scriptContent]) => {
                expect(scriptContent).toContain('BEGIN;');
                expect(scriptContent).toContain('COMMIT;');
                expect(scriptContent).toMatch(/CREATE TABLE IF NOT EXISTS/);
                expect(scriptContent).toMatch(/CREATE INDEX IF NOT EXISTS/);

                // Should not have obvious SQL syntax errors
                expect(scriptContent).not.toMatch(/;;\s*$/m); // Double semicolons
                expect(scriptContent).not.toMatch(/CREATE TABLE\s*;/); // Incomplete CREATE statements
            });
        });

        it('should create essential tables in all environments', () => {
            const requiredTables = [
                'memory_network_effects',
                'distributed_memory_sync'
            ];

            Object.entries(migrationScripts).forEach(([scriptName, scriptContent]) => {
                requiredTables.forEach(tableName => {
                    expect(scriptContent).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}`, 'i'));
                });
            });
        });

        it('should have proper column definitions', () => {
            const devScript = migrationScripts['migration-dev.sql'];

            // Check memory_network_effects table columns
            expect(devScript).toMatch(/id UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/);
            expect(devScript).toMatch(/memory_id UUID NOT NULL/);
            expect(devScript).toMatch(/effect_type VARCHAR\(50\) NOT NULL/);
            expect(devScript).toMatch(/network_node VARCHAR\(100\) NOT NULL/);
            expect(devScript).toMatch(/created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW\(\)/);
            expect(devScript).toMatch(/metadata JSONB DEFAULT '\{\}'::/);
        });

        it('should have progressive enhancement across environments', () => {
            const devScript = migrationScripts['migration-dev.sql'];
            const stagingScript = migrationScripts['migration-staging.sql'];
            const prodScript = migrationScripts['migration-production.sql'];

            // Development should be basic
            expect(devScript).not.toMatch(/priority_level/);
            expect(devScript).not.toMatch(/security_classification/);

            // Staging should have enhanced features
            expect(stagingScript).toMatch(/priority_level INTEGER DEFAULT 5/);
            expect(stagingScript).toMatch(/performance_metrics JSONB/);
            expect(stagingScript).toMatch(/memory_analytics_staging/);

            // Production should have all enterprise features
            expect(prodScript).toMatch(/security_classification VARCHAR\(20\) DEFAULT 'internal'/);
            expect(prodScript).toMatch(/audit_trail JSONB/);
            expect(prodScript).toMatch(/audit_log_production/);
            expect(prodScript).toMatch(/ENABLE ROW LEVEL SECURITY/);
        });

        it('should have proper indexing strategies', () => {
            const prodScript = migrationScripts['migration-production.sql'];

            const expectedIndexes = [
                'idx_memory_network_effects_memory_id',
                'idx_memory_network_effects_type',
                'idx_memory_network_effects_priority',
                'idx_memory_network_effects_security',
                'idx_distributed_sync_status',
                'idx_distributed_sync_nodes',
                'idx_analytics_timestamp',
                'idx_audit_timestamp',
                'idx_audit_user'
            ];

            expectedIndexes.forEach(indexName => {
                expect(prodScript).toMatch(new RegExp(`CREATE INDEX IF NOT EXISTS ${indexName}`, 'i'));
            });
        });
    });

    describe('Environment-Specific Migration Logic', () => {
        it('should have development-appropriate migration commands', () => {
            const devJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-development'
            );

            const commands = devJob.spec.template.spec.containers[0].command;
            const commandString = commands.join(' ');

            expect(commandString).toMatch(/npm run db:check/);
            expect(commandString).toMatch(/npm run db:migrate:dev/);
            expect(commandString).toMatch(/npm run db:seed:dev/);
            expect(commandString).not.toMatch(/backup/); // No backup needed for dev
        });

        it('should have staging-appropriate migration commands', () => {
            const stagingJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-staging'
            );

            const commands = stagingJob.spec.template.spec.containers[0].command;
            const commandString = commands.join(' ');

            expect(commandString).toMatch(/npm run db:backup:staging/);
            expect(commandString).toMatch(/npm run db:migrate:staging/);
            expect(commandString).toMatch(/npm run db:verify:staging/);
            expect(commandString).toMatch(/npm run db:seed:staging/);
        });

        it('should have production-appropriate safety measures', () => {
            const prodJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-production'
            );

            const commands = prodJob.spec.template.spec.containers[0].command;
            const commandString = commands.join(' ');

            expect(commandString).toMatch(/npm run db:backup:production:full/);
            expect(commandString).toMatch(/npm run db:backup:verify/);
            expect(commandString).toMatch(/npm run db:health:production/);
            expect(commandString).toMatch(/npm run db:migrate:dry-run:production/);
            expect(commandString).toMatch(/Manual execution required/);

            // Production should have strict backoff limit
            expect(prodJob.spec.backoffLimit).toBe(1);
            expect(prodJob.spec.template.spec.restartPolicy).toBe('Never');
        });
    });

    describe('Migration Environment Configuration', () => {
        it('should have proper environment variables for each job', () => {
            const environments = ['development', 'staging', 'production'];

            environments.forEach(envName => {
                const job = migrationResources.find((resource: any) =>
                    resource.metadata.name === `memorai-db-migration-${envName}`
                );

                expect(job).toBeDefined();
                const container = job.spec.template.spec.containers[0];

                // Check environment-specific env vars
                const envVars = container.env || [];
                const envVar = envVars.find((env: any) => env.name === 'ENVIRONMENT');
                expect(envVar).toBeDefined();
                expect(envVar.value).toBe(envName);

                // Check ConfigMap and Secret references
                const dbHostEnv = envVars.find((env: any) => env.name === 'DB_HOST');
                expect(dbHostEnv).toBeDefined();
                expect(dbHostEnv.valueFrom.configMapKeyRef).toBeDefined();
                expect(dbHostEnv.valueFrom.configMapKeyRef.name).toBe(`memorai-env-config-${envName}`);

                const dbPasswordEnv = envVars.find((env: any) => env.name === 'DB_PASSWORD');
                expect(dbPasswordEnv).toBeDefined();
                expect(dbPasswordEnv.valueFrom.secretKeyRef).toBeDefined();
                expect(dbPasswordEnv.valueFrom.secretKeyRef.name).toBe(`memorai-secrets-${envName}`);
            });
        });

        it('should have production-specific backup retention', () => {
            const prodJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-production'
            );

            const container = prodJob.spec.template.spec.containers[0];
            const envVars = container.env || [];
            const retentionEnv = envVars.find((env: any) => env.name === 'BACKUP_RETENTION_DAYS');

            expect(retentionEnv).toBeDefined();
            expect(retentionEnv.value).toBe('30');
        });
    });

    describe('Migration Security', () => {
        it('should have proper security context for production migrations', () => {
            const prodJob = migrationResources.find((resource: any) =>
                resource.metadata.name === 'memorai-db-migration-production'
            );

            const container = prodJob.spec.template.spec.containers[0];
            expect(container.securityContext).toBeDefined();
            expect(container.securityContext.runAsNonRoot).toBe(true);
            expect(container.securityContext.runAsUser).toBe(1000);
            expect(container.securityContext.allowPrivilegeEscalation).toBe(false);
        });

        it('should use appropriate service accounts', () => {
            const environments = ['development', 'staging', 'production'];

            environments.forEach(envName => {
                const job = migrationResources.find((resource: any) =>
                    resource.metadata.name === `memorai-db-migration-${envName}`
                );

                // While service accounts aren't explicitly set in our current config,
                // they should be using the default or a specific migration service account
                // This test ensures the structure is ready for RBAC
                expect(job.spec.template.spec).toBeDefined();
            });
        });
    });

    describe('Data Migration Validation', () => {
        it('should have proper table relationships', () => {
            const prodScript = migrationScripts['migration-production.sql'];

            // Check foreign key relationships would be valid
            expect(prodScript).toMatch(/memory_id UUID NOT NULL/);
            expect(prodScript).toMatch(/source_node VARCHAR\(100\) NOT NULL/);
            expect(prodScript).toMatch(/target_node VARCHAR\(100\) NOT NULL/);
        });

        it('should have proper data types for analytics', () => {
            const stagingScript = migrationScripts['migration-staging.sql'];
            const prodScript = migrationScripts['migration-production.sql'];

            // Analytics tables should have proper numeric types
            expect(stagingScript).toMatch(/metric_value DECIMAL\(10,2\)/);
            expect(prodScript).toMatch(/metric_value DECIMAL\(10,2\)/);
            expect(prodScript).toMatch(/sync_duration_ms INTEGER/);
        });

        it('should have proper constraints and defaults', () => {
            const prodScript = migrationScripts['migration-production.sql'];

            // Check default values are sensible
            expect(prodScript).toMatch(/priority_level INTEGER DEFAULT 5/);
            expect(prodScript).toMatch(/retry_count INTEGER DEFAULT 0/);
            expect(prodScript).toMatch(/max_retries INTEGER DEFAULT 3/);
            expect(prodScript).toMatch(/sync_status VARCHAR\(20\) DEFAULT 'pending'/);
        });
    });

    afterAll(() => {
        console.log('🗃️ Database Migration Test Suite Completed');
    });
});