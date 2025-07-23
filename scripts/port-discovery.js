#!/usr/bin/env node

/**
 * Port Discovery Utility
 * Dynamically discovers and validates service ports for real integration testing
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const DEFAULT_PORTS = {
    codai: 4001,
    admin: 4002,
    hub: 4003,
    id: 4004,
    bancai: 4005,
    memorai: 4006
};

class PortDiscovery {
    constructor() {
        this.discoveredPorts = new Map();
        this.serviceConfigs = new Map();
    }

    /**
     * Discover all service ports dynamically
     */
    async discoverAllPorts() {
        console.log(chalk.blue('🔍 Discovering service ports...\n'));

        const apps = Object.keys(DEFAULT_PORTS);
        const discoveries = await Promise.allSettled(
            apps.map(app => this.discoverServicePort(app))
        );

        const results = {
            discovered: 0,
            total: apps.length,
            ports: {},
            errors: []
        };

        discoveries.forEach((result, index) => {
            const app = apps[index];
            if (result.status === 'fulfilled') {
                results.discovered++;
                results.ports[app] = result.value;
                console.log(chalk.green(`✅ ${app}: port ${result.value.port} (${result.value.source})`));
            } else {
                results.errors.push({ app, error: result.reason.message });
                console.log(chalk.red(`❌ ${app}: ${result.reason.message}`));
            }
        });

        console.log(chalk.blue(`\n📊 Discovery Summary: ${results.discovered}/${results.total} ports found\n`));

        return results;
    }

    /**
     * Discover port for a specific service
     */
    async discoverServicePort(serviceName) {
        const strategies = [
            () => this.readFromPackageJson(serviceName),
            () => this.readFromEnvFiles(serviceName),
            () => this.readFromConfigFiles(serviceName),
            () => this.checkRunningProcess(serviceName),
            () => this.useDefaultPort(serviceName)
        ];

        for (const strategy of strategies) {
            try {
                const result = await strategy();
                if (result) {
                    this.discoveredPorts.set(serviceName, result);
                    return result;
                }
            } catch (error) {
                // Continue to next strategy
                continue;
            }
        }

        throw new Error(`Unable to discover port for ${serviceName}`);
    }

    /**
     * Read port from package.json dev script
     */
    async readFromPackageJson(serviceName) {
        const packagePath = join(process.cwd(), 'apps', serviceName, 'package.json');

        try {
            const packageContent = await fs.readFile(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);

            const devScript = packageJson.scripts?.dev;
            if (!devScript) return null;

            // Extract port from various patterns
            const portPatterns = [
                /-p (\d+)/,           // -p 4001
                /--port (\d+)/,       // --port 4001
                /--port=(\d+)/,       // --port=4001
                /PORT=(\d+)/,         // PORT=4001
            ];

            for (const pattern of portPatterns) {
                const match = devScript.match(pattern);
                if (match) {
                    return {
                        port: parseInt(match[1]),
                        source: 'package.json dev script',
                        config: { devScript }
                    };
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Read port from environment files
     */
    async readFromEnvFiles(serviceName) {
        const servicePath = join(process.cwd(), 'apps', serviceName);
        const envFiles = ['.env.local', '.env.development', '.env'];

        for (const envFile of envFiles) {
            try {
                const envPath = join(servicePath, envFile);
                const envContent = await fs.readFile(envPath, 'utf8');

                const portMatch = envContent.match(/^PORT=(\d+)$/m);
                if (portMatch) {
                    return {
                        port: parseInt(portMatch[1]),
                        source: `${envFile}`,
                        config: { envFile, envPath }
                    };
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    /**
     * Read port from config files
     */
    async readFromConfigFiles(serviceName) {
        const servicePath = join(process.cwd(), 'apps', serviceName);
        const configFiles = [
            'next.config.js',
            'next.config.mjs',
            'vite.config.ts',
            'vite.config.js'
        ];

        for (const configFile of configFiles) {
            try {
                const configPath = join(servicePath, configFile);
                const configContent = await fs.readFile(configPath, 'utf8');

                // Look for port configurations in various formats
                const portPatterns = [
                    /port:\s*(\d+)/,
                    /PORT:\s*(\d+)/,
                    /"port":\s*(\d+)/,
                    /'port':\s*(\d+)/
                ];

                for (const pattern of portPatterns) {
                    const match = configContent.match(pattern);
                    if (match) {
                        return {
                            port: parseInt(match[1]),
                            source: configFile,
                            config: { configFile, configPath }
                        };
                    }
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    /**
     * Check if service is already running and discover its port
     */
    async checkRunningProcess(serviceName) {
        const possiblePorts = [
            DEFAULT_PORTS[serviceName],
            ...Array.from({ length: 10 }, (_, i) => DEFAULT_PORTS[serviceName] + i),
            ...Array.from({ length: 10 }, (_, i) => DEFAULT_PORTS[serviceName] - i)
        ].filter(port => port > 0);

        for (const port of possiblePorts) {
            try {
                const response = await fetch(`http://localhost:${port}`, {
                    timeout: 2000,
                    signal: AbortSignal.timeout(2000)
                });

                // Check if response suggests this is our service
                const isOurService = await this.verifyServiceIdentity(serviceName, port, response);

                if (isOurService) {
                    return {
                        port,
                        source: 'running process',
                        config: { status: 'already-running' }
                    };
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    }

    /**
     * Verify if a running service matches our expected service
     */
    async verifyServiceIdentity(serviceName, port, response) {
        try {
            // Basic checks
            if (!response.ok && response.status !== 404) {
                return false;
            }

            // Check response headers for service identification
            const headers = response.headers;

            // Look for Next.js headers (for Next.js apps)
            if (headers.get('x-powered-by')?.includes('Next.js')) {
                return true;
            }

            // Try to get some content
            if (response.ok) {
                const text = await response.text();

                // Look for service-specific indicators in HTML/JSON
                const serviceIndicators = [
                    serviceName.toLowerCase(),
                    `${serviceName}`,
                    'codai',  // Common indicator across our apps
                ];

                return serviceIndicators.some(indicator =>
                    text.toLowerCase().includes(indicator)
                );
            }

            // If we get a 404, the server is running (good enough)
            return response.status === 404;
        } catch (error) {
            return false;
        }
    }

    /**
     * Use default port as fallback
     */
    async useDefaultPort(serviceName) {
        const defaultPort = DEFAULT_PORTS[serviceName];
        if (!defaultPort) return null;

        return {
            port: defaultPort,
            source: 'default configuration',
            config: { isDefault: true }
        };
    }

    /**
     * Generate test configuration based on discovered ports
     */
    async generateTestConfig() {
        const discovery = await this.discoverAllPorts();

        const testConfig = {
            services: {},
            baseUrls: {},
            healthCheck: {
                timeout: 60000,
                interval: 2000,
                endpoints: ['/', '/api/health', '/health']
            },
            discovery: {
                timestamp: new Date().toISOString(),
                discoveredCount: discovery.discovered,
                totalCount: discovery.total,
                successRate: discovery.discovered / discovery.total
            }
        };

        // Build service configurations
        Object.entries(discovery.ports).forEach(([service, config]) => {
            testConfig.services[service] = {
                port: config.port,
                baseUrl: `http://localhost:${config.port}`,
                source: config.source,
                isRunning: config.source === 'running process'
            };

            testConfig.baseUrls[service] = `http://localhost:${config.port}`;
        });

        return testConfig;
    }

    /**
     * Validate all discovered ports are accessible
     */
    async validatePorts() {
        console.log(chalk.blue('🔍 Validating discovered ports...\n'));

        const results = {
            accessible: 0,
            total: this.discoveredPorts.size,
            details: []
        };

        const validationPromises = Array.from(this.discoveredPorts.entries()).map(
            async ([service, config]) => {
                const isAccessible = await this.checkPortAccessible(config.port);

                results.details.push({
                    service,
                    port: config.port,
                    source: config.source,
                    accessible: isAccessible
                });

                if (isAccessible) {
                    results.accessible++;
                    console.log(chalk.green(`✅ ${service}:${config.port} - accessible`));
                } else {
                    console.log(chalk.yellow(`⚠️  ${service}:${config.port} - not accessible (${config.source})`));
                }

                return isAccessible;
            }
        );

        await Promise.all(validationPromises);

        console.log(chalk.blue(`\n📊 Validation Summary: ${results.accessible}/${results.total} ports accessible\n`));

        return results;
    }

    /**
     * Check if a port is accessible
     */
    async checkPortAccessible(port) {
        try {
            const response = await fetch(`http://localhost:${port}`, {
                timeout: 5000,
                signal: AbortSignal.timeout(5000)
            });
            return true;  // Any response means accessible
        } catch (error) {
            return false;
        }
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const discovery = new PortDiscovery();

    const command = process.argv[2];

    switch (command) {
        case 'discover':
            discovery.discoverAllPorts()
                .then((result) => {
                    console.log(chalk.green('🎉 Port discovery complete!'));
                    console.log(JSON.stringify(result, null, 2));
                })
                .catch((error) => {
                    console.error(chalk.red(`💥 Discovery failed: ${error.message}`));
                    process.exit(1);
                });
            break;

        case 'validate':
            discovery.discoverAllPorts()
                .then(() => discovery.validatePorts())
                .then((result) => {
                    console.log(chalk.green('🎉 Port validation complete!'));
                    console.log(JSON.stringify(result, null, 2));
                })
                .catch((error) => {
                    console.error(chalk.red(`💥 Validation failed: ${error.message}`));
                    process.exit(1);
                });
            break;

        case 'config':
            discovery.generateTestConfig()
                .then((config) => {
                    console.log(chalk.green('🎉 Test configuration generated!'));
                    console.log(JSON.stringify(config, null, 2));
                })
                .catch((error) => {
                    console.error(chalk.red(`💥 Config generation failed: ${error.message}`));
                    process.exit(1);
                });
            break;

        default:
            console.log(`
${chalk.blue('Port Discovery Utility')}

Usage:
  node scripts/port-discovery.js discover     Discover all service ports
  node scripts/port-discovery.js validate     Validate discovered ports are accessible  
  node scripts/port-discovery.js config       Generate test configuration

This utility will:
  ✅ Read package.json dev scripts
  ✅ Check environment files
  ✅ Scan configuration files  
  ✅ Detect running processes
  ✅ Generate test-ready configuration
`);
            break;
    }
}

export default PortDiscovery;
