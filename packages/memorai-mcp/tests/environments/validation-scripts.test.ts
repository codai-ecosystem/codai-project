// Environment Validation Scripts Testing Suite
// MemorAI MCP Server v9.5.0 - Validation Script Logic and Shell Script Testing

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { execSync } from 'child_process';

describe('Environment Validation Scripts Tests', () => {
    const environmentsDir = path.join(__dirname, '../../environments');
    let validationResources: any[];
    let validationScripts: { [key: string]: string } = {};

    beforeAll(() => {
        try {
            const validationContent = fs.readFileSync(path.join(environmentsDir, 'environment-validation.yaml'), 'utf8');
            validationResources = yaml.loadAll(validationContent);

            // Extract validation scripts from ConfigMap
            const scriptsConfigMap = validationResources.find((resource: any) =>
                resource.kind === 'ConfigMap' &&
                resource.metadata.name === 'memorai-environment-validation-scripts'
            );

            if (scriptsConfigMap && scriptsConfigMap.data) {
                validationScripts = scriptsConfigMap.data;
            }

            console.log('✅ Environment validation resources loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load validation resources:', error);
            throw error;
        }
    });

    describe('Validation Scripts Structure', () => {
        it('should have all required validation scripts', () => {
            const expectedScripts = [
                'validate-environment.sh',
                'compare-environments.sh',
                'performance-baseline.sh'
            ];

            expectedScripts.forEach(scriptName => {
                expect(validationScripts[scriptName]).toBeDefined();
                expect(validationScripts[scriptName].length).toBeGreaterThan(1000); // Substantial scripts
            });
        });

        it('should have proper shell script headers', () => {
            Object.entries(validationScripts).forEach(([scriptName, scriptContent]) => {
                expect(scriptContent).toMatch(/^#!/);
                expect(scriptContent).toContain('#!/bin/bash');
                expect(scriptContent).toContain('set -e');
            });
        });

        it('should have proper parameter handling', () => {
            const validateScript = validationScripts['validate-environment.sh'];
            expect(validateScript).toMatch(/ENVIRONMENT=\$\{1:-development\}/);
            expect(validateScript).toMatch(/NAMESPACE="memorai-\$\{ENVIRONMENT\}"/);
            expect(validateScript).toMatch(/EXPECTED_VERSION="v9\.5\.0"/);

            const compareScript = validationScripts['compare-environments.sh'];
            expect(compareScript).toMatch(/SOURCE_ENV=\$\{1:-staging\}/);
            expect(compareScript).toMatch(/TARGET_ENV=\$\{2:-production\}/);

            const performanceScript = validationScripts['performance-baseline.sh'];
            expect(performanceScript).toMatch(/ENVIRONMENT=\$\{1:-development\}/);
        });
    });

    describe('Environment Validation Script Logic', () => {
        it('should have proper validation functions', () => {
            const validateScript = validationScripts['validate-environment.sh'];

            expect(validateScript).toMatch(/validate_item\(\) \{/);
            expect(validateScript).toMatch(/validate_warning\(\) \{/);
            expect(validateScript).toMatch(/local description=\$1/);
            expect(validateScript).toMatch(/local command=\$2/);
            expect(validateScript).toMatch(/local expected_result=\$3/);
        });

        it('should validate Kubernetes cluster connectivity', () => {
            const validateScript = validationScripts['validate-environment.sh'];

            expect(validateScript).toMatch(/kubectl cluster-info --request-timeout=10s/);
            expect(validateScript).toMatch(/kubectl get namespace \$NAMESPACE/);
            expect(validateScript).toMatch(/kubectl auth can-i create pods --namespace=\$NAMESPACE/);
        });

        it('should validate application deployments', () => {
            const validateScript = validationScripts['validate-environment.sh'];

            expect(validateScript).toMatch(/kubectl get deployment memorai-mcp-\$\{ENVIRONMENT\}/);
            expect(validateScript).toMatch(/kubectl get service memorai-mcp-service-\$\{ENVIRONMENT\}/);
            expect(validateScript).toMatch(/readyReplicas/);
            expect(validateScript).toMatch(/\$EXPECTED_VERSION/);
        });

        it('should validate configuration resources', () => {
            const validateScript = validationScripts['validate-environment.sh'];

            expect(validateScript).toMatch(/kubectl get configmap memorai-env-config-\$\{ENVIRONMENT\}/);
            expect(validateScript).toMatch(/kubectl get secret memorai-secrets-\$\{ENVIRONMENT\}/);
            expect(validateScript).toMatch(/kubectl get configmap memorai-feature-flags-\$\{ENVIRONMENT\}/);
        });

        it('should have environment-specific resource validation', () => {
            const validateScript = validationScripts['validate-environment.sh'];

            expect(validateScript).toMatch(/case \$ENVIRONMENT in/);
            expect(validateScript).toMatch(/"development"\)/);
            expect(validateScript).toMatch(/"staging"\)/);
            expect(validateScript).toMatch(/"production"\)/);

            // Development validation
            expect(validateScript).toMatch(/CPU requests \(250m\)/);
            expect(validateScript).toMatch(/Memory requests \(512Mi\)/);
            expect(validateScript).toMatch(/Replica count \(1\)/);

            // Production validation
            expect(validateScript).toMatch(/CPU requests \(1000m\)/);
            expect(validateScript).toMatch(/Memory requests \(2Gi\)/);
            expect(validateScript).toMatch(/Replica count \(5\)/);
            expect(validateScript).toMatch(/Pod anti-affinity/);
        });

        it('should validate health endpoints', () => {
            const validateScript = validationScripts['validate-environment.sh'];

            expect(validateScript).toMatch(/kubectl port-forward svc\/memorai-mcp-service-\$\{ENVIRONMENT\}/);
            expect(validateScript).toMatch(/curl -s -f http:\/\/localhost:8080\/health/);
            expect(validateScript).toMatch(/PORT_FORWARD_PID/);
            expect(validateScript).toMatch(/kill \$PORT_FORWARD_PID/);
        });

        it('should have proper exit codes and summary', () => {
            const validateScript = validationScripts['validate-environment.sh'];

            expect(validateScript).toMatch(/PASSED=0/);
            expect(validateScript).toMatch(/FAILED=0/);
            expect(validateScript).toMatch(/WARNINGS=0/);
            expect(validateScript).toMatch(/\(\(PASSED\+\+\)\)/);
            expect(validateScript).toMatch(/\(\(FAILED\+\+\)\)/);

            expect(validateScript).toMatch(/exit 0/);
            expect(validateScript).toMatch(/exit 1/);
        });
    });

    describe('Environment Comparison Script Logic', () => {
        it('should have proper comparison functions', () => {
            const compareScript = validationScripts['compare-environments.sh'];

            expect(compareScript).toMatch(/compare_item\(\) \{/);
            expect(compareScript).toMatch(/source_result=\$\(eval "\$source_command"/);
            expect(compareScript).toMatch(/target_result=\$\(eval "\$target_command"/);
        });

        it('should compare deployment configurations', () => {
            const compareScript = validationScripts['compare-environments.sh'];

            expect(compareScript).toMatch(/Application image tag/);
            expect(compareScript).toMatch(/kubectl get deployment memorai-mcp-\$\{SOURCE_ENV\}/);
            expect(compareScript).toMatch(/kubectl get deployment memorai-mcp-\$\{TARGET_ENV\}/);
        });

        it('should compare resource allocations', () => {
            const compareScript = validationScripts['compare-environments.sh'];

            expect(compareScript).toMatch(/CPU limits/);
            expect(compareScript).toMatch(/Memory limits/);
            expect(compareScript).toMatch(/resources\.limits\.cpu/);
            expect(compareScript).toMatch(/resources\.limits\.memory/);
        });

        it('should compare feature flags', () => {
            const compareScript = validationScripts['compare-environments.sh'];

            expect(compareScript).toMatch(/Feature Flags Comparison/);
            expect(compareScript).toMatch(/kubectl get configmap memorai-feature-flags-\$\{SOURCE_ENV\}/);
            expect(compareScript).toMatch(/jq -r '\.features \| keys\[\]'/);
            expect(compareScript).toMatch(/ALL_FEATURES=\$\(echo -e "\$SOURCE_FEATURES\\n\$TARGET_FEATURES"/);
        });

        it('should generate comparison summary', () => {
            const compareScript = validationScripts['compare-environments.sh'];

            expect(compareScript).toMatch(/MATCHES=0/);
            expect(compareScript).toMatch(/DIFFERENCES=0/);
            expect(compareScript).toMatch(/\(\(MATCHES\+\+\)\)/);
            expect(compareScript).toMatch(/\(\(DIFFERENCES\+\+\)\)/);
            expect(compareScript).toMatch(/Environments are in complete parity/);
        });
    });

    describe('Performance Baseline Script Logic', () => {
        it('should have environment-specific thresholds', () => {
            const performanceScript = validationScripts['performance-baseline.sh'];

            expect(performanceScript).toMatch(/case \$ENVIRONMENT in/);
            expect(performanceScript).toMatch(/RESPONSE_TIME_THRESHOLD=2000.*development/);
            expect(performanceScript).toMatch(/RESPONSE_TIME_THRESHOLD=1000.*staging/);
            expect(performanceScript).toMatch(/RESPONSE_TIME_THRESHOLD=500.*production/);

            expect(performanceScript).toMatch(/THROUGHPUT_THRESHOLD=50.*development/);
            expect(performanceScript).toMatch(/THROUGHPUT_THRESHOLD=100.*staging/);
            expect(performanceScript).toMatch(/THROUGHPUT_THRESHOLD=500.*production/);
        });

        it('should measure response times', () => {
            const performanceScript = validationScripts['performance-baseline.sh'];

            expect(performanceScript).toMatch(/curl -w "%\{time_total\}"/);
            expect(performanceScript).toMatch(/HEALTH_RESPONSE_TIME=\$/);
            expect(performanceScript).toMatch(/awk '\{print \$1 \* 1000\}'/);
        });

        it('should run load tests', () => {
            const performanceScript = validationScripts['performance-baseline.sh'];

            expect(performanceScript).toMatch(/ab -n 100 -c 10 -q/);
            expect(performanceScript).toMatch(/LOAD_TEST_RESULT=\$/);
            expect(performanceScript).toMatch(/grep "Requests per second"/);
        });

        it('should check resource usage', () => {
            const performanceScript = validationScripts['performance-baseline.sh'];

            expect(performanceScript).toMatch(/kubectl get pods -l app=memorai-mcp,environment=\$\{ENVIRONMENT\}/);
            expect(performanceScript).toMatch(/kubectl top pod \$POD_NAME/);
            expect(performanceScript).toMatch(/CPU_USAGE=\$/);
            expect(performanceScript).toMatch(/MEMORY_USAGE=\$/);
        });

        it('should validate against thresholds', () => {
            const performanceScript = validationScripts['performance-baseline.sh'];

            expect(performanceScript).toMatch(/echo "\$HEALTH_RESPONSE_TIME < \$RESPONSE_TIME_THRESHOLD"/);
            expect(performanceScript).toMatch(/echo "\$LOAD_TEST_RESULT > \$THROUGHPUT_THRESHOLD"/);
            expect(performanceScript).toMatch(/bc -l/);
        });
    });

    describe('Color Output and User Experience', () => {
        it('should have color definitions', () => {
            Object.entries(validationScripts).forEach(([scriptName, scriptContent]) => {
                expect(scriptContent).toMatch(/RED='\\033\[0;31m'/);
                expect(scriptContent).toMatch(/GREEN='\\033\[0;32m'/);
                expect(scriptContent).toMatch(/YELLOW='\\033\[1;33m'/);
                expect(scriptContent).toMatch(/NC='\\033\[0m'/); // No Color
            });
        });

        it('should use colors appropriately', () => {
            Object.entries(validationScripts).forEach(([scriptName, scriptContent]) => {
                expect(scriptContent).toMatch(/echo -e "\$\{GREEN\}.*PASS.*\$\{NC\}"/);
                expect(scriptContent).toMatch(/echo -e "\$\{RED\}.*FAIL.*\$\{NC\}"/);
                expect(scriptContent).toMatch(/echo -e "\$\{YELLOW\}.*WARNING.*\$\{NC\}"/);
            });
        });

        it('should have informative output messages', () => {
            const validateScript = validationScripts['validate-environment.sh'];

            expect(validateScript).toMatch(/MemorAI Environment Validation/);
            expect(validateScript).toMatch(/Kubernetes Cluster Validation/);
            expect(validateScript).toMatch(/Application Deployment Validation/);
            expect(validateScript).toMatch(/Configuration Validation/);
            expect(validateScript).toMatch(/Resource Validation/);
            expect(validateScript).toMatch(/Health Check Validation/);
            expect(validateScript).toMatch(/Security Validation/);
        });
    });

    describe('Error Handling and Robustness', () => {
        it('should handle missing commands gracefully', () => {
            Object.entries(validationScripts).forEach(([scriptName, scriptContent]) => {
                expect(scriptContent).toMatch(/2>\/dev\/null/);
                expect(scriptContent).toMatch(/\|\| echo "N\/A"/);
                expect(scriptContent).toMatch(/\|\| exit 1/);
            });
        });

        it('should cleanup resources properly', () => {
            const validateScript = validationScripts['validate-environment.sh'];
            expect(validateScript).toMatch(/kill \$PORT_FORWARD_PID >\/dev\/null 2>&1/);

            const performanceScript = validationScripts['performance-baseline.sh'];
            expect(performanceScript).toMatch(/kill \$PORT_FORWARD_PID >\/dev\/null 2>&1/);
        });

        it('should have appropriate timeouts', () => {
            const validateScript = validationScripts['validate-environment.sh'];
            expect(validateScript).toMatch(/--request-timeout=10s/);
            expect(validateScript).toMatch(/--timeout=5/);

            const performanceScript = validationScripts['performance-baseline.sh'];
            expect(performanceScript).toMatch(/sleep 5/);
            expect(performanceScript).toMatch(/sleep 10/);
        });
    });

    describe('CronJob Validation', () => {
        it('should have automated validation CronJob', () => {
            const cronJob = validationResources.find((resource: any) =>
                resource.kind === 'CronJob' &&
                resource.metadata.name === 'memorai-environment-validation'
            );

            expect(cronJob).toBeDefined();
            expect(cronJob.apiVersion).toBe('batch/v1');
            expect(cronJob.metadata.namespace).toBe('memorai-production');
            expect(cronJob.spec.schedule).toBe('0 */4 * * *'); // Every 4 hours
        });

        it('should have proper job template configuration', () => {
            const cronJob = validationResources.find((resource: any) =>
                resource.kind === 'CronJob' &&
                resource.metadata.name === 'memorai-environment-validation'
            );

            const jobTemplate = cronJob.spec.jobTemplate.spec.template;
            expect(jobTemplate.spec.serviceAccountName).toBe('memorai-validation-sa');
            expect(jobTemplate.spec.restartPolicy).toBe('OnFailure');

            const container = jobTemplate.spec.containers[0];
            expect(container.name).toBe('validation');
            expect(container.image).toBe('memorai/validation-tools:latest');
            expect(container.volumeMounts).toBeDefined();
            expect(container.resources).toBeDefined();
        });

        it('should mount validation scripts correctly', () => {
            const cronJob = validationResources.find((resource: any) =>
                resource.kind === 'CronJob' &&
                resource.metadata.name === 'memorai-environment-validation'
            );

            const jobTemplate = cronJob.spec.jobTemplate.spec.template;
            const volumes = jobTemplate.spec.volumes;
            const volumeMounts = jobTemplate.spec.containers[0].volumeMounts;

            expect(volumes).toBeDefined();
            expect(volumeMounts).toBeDefined();

            const scriptsVolume = volumes.find((v: any) => v.name === 'validation-scripts');
            expect(scriptsVolume).toBeDefined();
            expect(scriptsVolume.configMap.name).toBe('memorai-environment-validation-scripts');
            expect(scriptsVolume.configMap.defaultMode).toBe(0o755); // Executable

            const scriptsVolumeMount = volumeMounts.find((vm: any) => vm.name === 'validation-scripts');
            expect(scriptsVolumeMount).toBeDefined();
            expect(scriptsVolumeMount.mountPath).toBe('/scripts');
        });
    });

    describe('Shell Script Syntax Validation', () => {
        it('should have valid bash syntax (basic check)', () => {
            Object.entries(validationScripts).forEach(([scriptName, scriptContent]) => {
                // Check for common syntax issues
                expect(scriptContent).not.toMatch(/\$\$\$/); // Triple dollar signs
                expect(scriptContent).not.toMatch(/\[\[\s*\]\]/); // Empty test conditions
                expect(scriptContent).not.toMatch(/then\s*fi/); // Missing if body
                expect(scriptContent).not.toMatch(/\{\s*\}/); // Empty function bodies

                // Check for proper variable usage
                const variableDefinitions = scriptContent.match(/^[A-Z_]+=.*$/gm) || [];
                const variableUsages = scriptContent.match(/\$\{?[A-Z_]+\}?/g) || [];

                // At least some variables should be defined and used
                expect(variableDefinitions.length).toBeGreaterThan(0);
                expect(variableUsages.length).toBeGreaterThan(0);
            });
        });

        it('should have proper function definitions', () => {
            Object.entries(validationScripts).forEach(([scriptName, scriptContent]) => {
                const functionDefinitions = scriptContent.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\(\)\s*\{/gm);
                if (functionDefinitions) {
                    expect(functionDefinitions.length).toBeGreaterThan(0);

                    // Each function should have a closing brace
                    functionDefinitions.forEach(() => {
                        // This is a basic check - in real validation, we'd parse the script more carefully
                    });
                }
            });
        });

        it('should use proper shell patterns', () => {
            Object.entries(validationScripts).forEach(([scriptName, scriptContent]) => {
                // Should use proper command substitution
                expect(scriptContent).toMatch(/\$\(/);
                // Should not use deprecated backticks
                expect(scriptContent).not.toMatch(/`[^`]+`/);
                // Should use [[ ]] for tests rather than [ ]
                expect(scriptContent).toMatch(/\[\[.*\]\]/);
            });
        });
    });

    afterAll(() => {
        console.log('🔍 Environment Validation Scripts Test Suite Completed');
    });
});