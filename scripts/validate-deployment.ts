#!/usr/bin/env node

/**
 * MemorAI Enterprise Deployment Validation Script
 * Comprehensive testing of deployed services and integration points
 */

import https from 'https';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const config = {
    domain: process.env.DOMAIN_NAME || 'codai.ro',
    timeout: 30000,
    retries: 3,
    retryDelay: 5000
};

// Endpoints to test
const endpoints = {
    frontend: `https://memorai.${config.domain}`,
    backend: `https://api.memorai.${config.domain}`,
    mcp: `https://mcp.memorai.${config.domain}`,
    health: {
        backend: `https://api.memorai.${config.domain}/health`,
        mcp: `https://mcp.memorai.${config.domain}/health`
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset): any {
    const timestamp = new Date().toISOString();
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function logInfo(message): any {
    log(`ℹ  ${message}`, colors.blue);
}

function logSuccess(message): any {
    log(`✅ ${message}`, colors.green);
}

function logWarning(message): any {
    log(`⚠️  ${message}`, colors.yellow);
}

function logError(message): any {
    log(`❌ ${message}`, colors.red);
}

// HTTP request helper with retries
async function makeRequest(url, options = {}): any {
    const { timeout = config.timeout, retries = config.retries } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await new Promise((resolve, reject) => {
                const protocol = url.startsWith('https') ? https : http;
                const request = protocol.get(url, { timeout }, (response) => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => {
                        resolve({
                            statusCode: response.statusCode,
                            headers: response.headers,
                            data: data
                        });
                    });
                });

                request.on('error', reject);
                request.on('timeout', () => {
                    request.destroy();
                    reject(new Error('Request timeout'));
                });
            });
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }
            logWarning(`Attempt ${attempt}/${retries} failed for ${url}: ${error.message}. Retrying in ${config.retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        }
    }
}

// Kubernetes validation
async function validateKubernetes(): any {
    logInfo('Validating Kubernetes deployment...');

    try {
        // Check namespaces
        const { stdout: namespaces } = await execAsync('kubectl get namespaces memorai-production memorai-monitoring memorai-security -o name');
        logSuccess('All required namespaces exist');

        // Check pods
        const { stdout: pods } = await execAsync('kubectl get pods -n memorai-production');
        const podLines = pods.split('\n').filter(line => line.includes('Running'));
        logSuccess(`Found ${podLines.length} running pods in memorai-production namespace`);

        // Check services
        const { stdout: services } = await execAsync('kubectl get svc -n memorai-production');
        logSuccess('Services are deployed');

        // Check ingress
        const { stdout: ingress } = await execAsync('kubectl get ingress -n memorai-production');
        if (ingress.includes('memorai-enterprise-ingress')) {
            logSuccess('Ingress controller is configured');
        } else {
            logWarning('Ingress not found or not ready');
        }

        return true;
    } catch (error) {
        logError(`Kubernetes validation failed: ${error.message}`);
        return false;
    }
}

// Service health validation
async function validateServiceHealth(): any {
    logInfo('Validating service health endpoints...');

    const results = {
        backend: false,
        mcp: false
    };

    // Test Backend Health
    try {
        const response = await makeRequest(endpoints.health.backend);
        if (response.statusCode === 200) {
            logSuccess('MemorAI Backend health check passed');
            results.backend = true;
        } else {
            logWarning(`Backend health check returned status ${response.statusCode}`);
        }
    } catch (error) {
        logError(`Backend health check failed: ${error.message}`);
    }

    // Test MCP Health
    try {
        const response = await makeRequest(endpoints.health.mcp);
        if (response.statusCode === 200) {
            logSuccess('MemorAI MCP health check passed');
            results.mcp = true;
        } else {
            logWarning(`MCP health check returned status ${response.statusCode}`);
        }
    } catch (error) {
        logError(`MCP health check failed: ${error.message}`);
    }

    return results;
}

// API functionality validation
async function validateAPIs(): any {
    logInfo('Validating API functionality...');

    const results = {
        backend: false,
        mcp: false
    };

    // Test Backend API
    try {
        const response = await makeRequest(`${endpoints.backend}/api/v1/status`);
        if (response.statusCode === 200) {
            const data = JSON.parse(response.data);
            if (data.status === 'ok') {
                logSuccess('Backend API is functional');
                results.backend = true;
            }
        }
    } catch (error) {
        logWarning(`Backend API test failed: ${error.message}`);
    }

    // Test MCP Server
    try {
        const response = await makeRequest(`${endpoints.mcp}/api/capabilities`);
        if (response.statusCode === 200) {
            logSuccess('MCP Server is responding');
            results.mcp = true;
        }
    } catch (error) {
        logWarning(`MCP Server test failed: ${error.message}`);
    }

    return results;
}

// Frontend validation
async function validateFrontend(): any {
    logInfo('Validating frontend accessibility...');

    try {
        const response = await makeRequest(endpoints.frontend);
        if (response.statusCode === 200 && response.data.includes('MemorAI')) {
            logSuccess('Frontend is accessible and rendering');
            return true;
        } else {
            logWarning(`Frontend returned status ${response.statusCode} or unexpected content`);
        }
    } catch (error) {
        logError(`Frontend validation failed: ${error.message}`);
    }

    return false;
}

// Database connectivity validation
async function validateDatabase(): any {
    logInfo('Validating database connectivity...');

    try {
        // Check if CBD pods can connect to database
        const { stdout } = await execAsync('kubectl exec -n memorai-production deployment/cbd-enterprise -- pg_isready -h $DB_HOST -p $DB_PORT');
        if (stdout.includes('accepting connections')) {
            logSuccess('Database connectivity verified');
            return true;
        }
    } catch (error) {
        logWarning(`Database connectivity check failed: ${error.message}`);
    }

    return false;
}

// Performance validation
async function validatePerformance(): any {
    logInfo('Running basic performance tests...');

    const startTime = Date.now();

    try {
        // Test response time
        await makeRequest(endpoints.health.backend);
        const responseTime = Date.now() - startTime;

        if (responseTime < 1000) {
            logSuccess(`API response time: ${responseTime}ms (Good)`);
        } else if (responseTime < 3000) {
            logWarning(`API response time: ${responseTime}ms (Acceptable)`);
        } else {
            logError(`API response time: ${responseTime}ms (Too slow)`);
        }

        return responseTime < 3000;
    } catch (error) {
        logError(`Performance test failed: ${error.message}`);
        return false;
    }
}

// Main validation function
async function runValidation(): any {
    logInfo('Starting MemorAI Enterprise Deployment Validation');
    console.log('='.repeat(60));

    const results = {
        kubernetes: false,
        health: { backend: false, mcp: false },
        apis: { backend: false, mcp: false },
        frontend: false,
        database: false,
        performance: false
    };

    // Run all validations
    results.kubernetes = await validateKubernetes();
    results.health = await validateServiceHealth();
    results.apis = await validateAPIs();
    results.frontend = await validateFrontend();
    results.database = await validateDatabase();
    results.performance = await validatePerformance();

    // Summary
    console.log('\n' + '='.repeat(60));
    logInfo('Validation Summary:');

    const allPassed = results.kubernetes &&
        results.health.backend &&
        results.health.mcp &&
        results.apis.backend &&
        results.apis.mcp &&
        results.frontend &&
        results.database &&
        results.performance;

    if (allPassed) {
        logSuccess('🎉 All validations passed! MemorAI Enterprise is ready for production.');
    } else {
        logWarning('⚠️  Some validations failed. Please review the issues above.');

        // Provide troubleshooting tips
        console.log('\nTroubleshooting Tips:');
        if (!results.kubernetes) {
            console.log('- Check Kubernetes deployment: kubectl get pods -n memorai-production');
        }
        if (!results.health.backend || !results.health.mcp) {
            console.log('- Check service logs: kubectl logs -n memorai-production -l app=memorai-backend');
        }
        if (!results.frontend) {
            console.log('- Check ingress: kubectl describe ingress -n memorai-production');
        }
        if (!results.database) {
            console.log('- Check database connection and credentials');
        }
    }

    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logError(`Uncaught exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logError(`Unhandled rejection: ${error.message}`);
    process.exit(1);
});

// Run validation
runValidation().catch((error) => {
    logError(`Validation script failed: ${error.message}`);
    process.exit(1);
});

