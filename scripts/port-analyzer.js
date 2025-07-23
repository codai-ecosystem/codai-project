#!/usr/bin/env node

/**
 * Port Configuration Analysis & Service Discovery
 * Identifies port conflicts and creates correct service mapping
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const colors = {
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    gray: (text) => `\x1b[90m${text}\x1b[0m`,
    cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

class PortAnalyzer {
    constructor() {
        this.services = new Map();
        this.conflicts = [];
    }

    async analyzePortConfiguration() {
        console.log(colors.blue('\n🔍 Analyzing Port Configuration for Primary Apps...\n'));

        // Define primary apps
        const primaryApps = ['codai', 'admin', 'hub', 'id', 'bancai', 'memorai'];

        for (const app of primaryApps) {
            await this.analyzeApp(app);
        }

        this.detectConflicts();
        this.generateReport();
        this.suggestCorrections();
    }

    async analyzeApp(appName) {
        const appPath = `apps/${appName}`;

        try {
            // Check main package.json
            const mainPackageJson = await this.readPackageJson(`${appPath}/package.json`);

            // Check for sub-apps (like memorai/dashboard, memorai/api)
            const subApps = await this.findSubApps(appPath);

            const service = {
                name: appName,
                path: appPath,
                mainPort: this.extractPort(mainPackageJson?.scripts?.dev),
                subServices: [],
                hasAPI: false,
                hasDashboard: false,
                type: 'frontend'
            };

            // Analyze sub-services
            for (const subApp of subApps) {
                const subPackageJson = await this.readPackageJson(`${appPath}/${subApp}/package.json`);
                if (subPackageJson) {
                    const subPort = this.extractPort(subPackageJson.scripts?.dev);
                    service.subServices.push({
                        name: subApp,
                        port: subPort,
                        path: `${appPath}/${subApp}`,
                        type: subApp.includes('api') ? 'backend' : 'frontend'
                    });

                    if (subApp.includes('api')) service.hasAPI = true;
                    if (subApp.includes('dashboard')) service.hasDashboard = true;
                }
            }

            this.services.set(appName, service);
            this.logServiceInfo(service);

        } catch (error) {
            console.log(colors.red(`❌ Error analyzing ${appName}: ${error.message}`));
        }
    }

    async readPackageJson(path) {
        try {
            const content = await fs.readFile(path, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            return null;
        }
    }

    async findSubApps(appPath) {
        try {
            const entries = await fs.readdir(appPath, { withFileTypes: true });
            return entries
                .filter(entry => entry.isDirectory() && ['apps', 'services'].includes(entry.name))
                .map(async (entry) => {
                    const subPath = join(appPath, entry.name);
                    const subEntries = await fs.readdir(subPath, { withFileTypes: true });
                    return subEntries
                        .filter(subEntry => subEntry.isDirectory())
                        .map(subEntry => `${entry.name}/${subEntry.name}`);
                })
                .flat();
        } catch (error) {
            // Try direct sub-directories
            try {
                const entries = await fs.readdir(appPath, { withFileTypes: true });
                return entries
                    .filter(entry => entry.isDirectory() && ['dashboard', 'api', 'backend', 'frontend'].includes(entry.name))
                    .map(entry => entry.name);
            } catch {
                return [];
            }
        }
    }

    extractPort(devScript) {
        if (!devScript) return null;

        // Extract port from various formats
        const portPatterns = [
            /-p\s+(\d+)/,           // -p 4001
            /--port\s+(\d+)/,       // --port 4001
            /PORT=(\d+)/,           // PORT=4001
            /:(\d+)/                // :4001
        ];

        for (const pattern of portPatterns) {
            const match = devScript.match(pattern);
            if (match) return parseInt(match[1]);
        }

        return null;
    }

    detectConflicts() {
        const portMap = new Map();

        for (const [appName, service] of this.services) {
            if (service.mainPort) {
                if (portMap.has(service.mainPort)) {
                    this.conflicts.push({
                        port: service.mainPort,
                        services: [portMap.get(service.mainPort), appName]
                    });
                } else {
                    portMap.set(service.mainPort, appName);
                }
            }

            for (const subService of service.subServices) {
                if (subService.port) {
                    if (portMap.has(subService.port)) {
                        this.conflicts.push({
                            port: subService.port,
                            services: [portMap.get(subService.port), `${appName}/${subService.name}`]
                        });
                    } else {
                        portMap.set(subService.port, `${appName}/${subService.name}`);
                    }
                }
            }
        }
    }

    logServiceInfo(service) {
        console.log(colors.cyan(`📦 ${service.name}:`));
        console.log(colors.gray(`   Path: ${service.path}`));
        console.log(colors.gray(`   Main Port: ${service.mainPort || 'Not configured'}`));
        console.log(colors.gray(`   Type: ${service.type}`));
        console.log(colors.gray(`   Has API: ${service.hasAPI}`));
        console.log(colors.gray(`   Has Dashboard: ${service.hasDashboard}`));

        if (service.subServices.length > 0) {
            console.log(colors.gray(`   Sub-services:`));
            for (const sub of service.subServices) {
                console.log(colors.gray(`     - ${sub.name}: ${sub.port || 'No port'} (${sub.type})`));
            }
        }
        console.log('');
    }

    generateReport() {
        console.log(colors.blue('\n📊 PORT CONFIGURATION REPORT\n'));

        // Infrastructure expected vs actual
        console.log(colors.yellow('🔧 Current Infrastructure Configuration:'));
        const infraConfig = [
            { name: 'codai', expected: 4001, actual: null },
            { name: 'admin', expected: 4002, actual: null },
            { name: 'hub', expected: 4003, actual: null },
            { name: 'id', expected: 4004, actual: null },
            { name: 'bancai', expected: 4005, actual: null },
            { name: 'memorai', expected: 4006, actual: null }
        ];

        for (const config of infraConfig) {
            const service = this.services.get(config.name);
            config.actual = service?.mainPort;

            const status = config.actual === config.expected
                ? colors.green('✅ MATCH')
                : colors.red(`❌ MISMATCH (actual: ${config.actual})`);

            console.log(`   ${config.name}: Expected ${config.expected} → ${status}`);
        }

        // Conflicts
        if (this.conflicts.length > 0) {
            console.log(colors.red('\n⚠️  PORT CONFLICTS DETECTED:'));
            for (const conflict of this.conflicts) {
                console.log(colors.red(`   Port ${conflict.port}: ${conflict.services.join(' vs ')}`));
            }
        } else {
            console.log(colors.green('\n✅ No port conflicts detected'));
        }
    }

    suggestCorrections() {
        console.log(colors.blue('\n🔧 RECOMMENDED CORRECTIONS:\n'));

        const recommendations = [
            { service: 'codai', currentPort: 4001, suggestedPort: 4001, status: 'correct' },
            { service: 'admin', currentPort: 3200, suggestedPort: 4002, status: 'fix_needed' },
            { service: 'hub', currentPort: 4700, suggestedPort: 4003, status: 'fix_needed' },
            { service: 'id', currentPort: 4032, suggestedPort: 4004, status: 'fix_needed' },
            { service: 'bancai', currentPort: 4003, suggestedPort: 4005, status: 'fix_needed' },
            { service: 'memorai', currentPort: 4002, suggestedPort: 4006, status: 'fix_needed' }
        ];

        for (const rec of recommendations) {
            const service = this.services.get(rec.service);
            const actualPort = service?.mainPort;

            if (rec.status === 'fix_needed') {
                console.log(colors.yellow(`🔧 ${rec.service}:`));
                console.log(colors.gray(`   Current: ${actualPort}`));
                console.log(colors.green(`   Should be: ${rec.suggestedPort}`));
                console.log(colors.cyan(`   Action: Update apps/${rec.service}/package.json dev script to use -p ${rec.suggestedPort}`));
                console.log('');
            }
        }

        // Special cases
        console.log(colors.yellow('🔧 Special Configurations:'));
        const memoraiService = this.services.get('memorai');
        if (memoraiService && memoraiService.subServices.length > 0) {
            console.log(colors.cyan('   MemorAI Dashboard: Currently on 5100, suggest 4007'));
            console.log(colors.cyan('   MemorAI API: Not configured, suggest 4008'));
        }
    }

    generateCorrectedInfrastructure() {
        console.log(colors.blue('\n📝 CORRECTED INFRASTRUCTURE CONFIG:\n'));

        const correctedConfig = `
const CONFIG = {
  primaryApps: [
    { name: 'codai', port: 4001, path: 'apps/codai', type: 'frontend' },
    { name: 'admin', port: 4002, path: 'apps/admin', type: 'frontend' },  
    { name: 'hub', port: 4003, path: 'apps/hub', type: 'frontend' },
    { name: 'id', port: 4004, path: 'apps/id', type: 'frontend' },
    { name: 'bancai', port: 4005, path: 'apps/bancai', type: 'frontend' },
    { name: 'memorai', port: 4006, path: 'apps/memorai', type: 'frontend' },
    { name: 'memorai-dashboard', port: 4007, path: 'apps/memorai/apps/dashboard', type: 'frontend' },
    { name: 'memorai-api', port: 4008, path: 'apps/memorai/apps/api', type: 'backend' }
  ]
};`;

        console.log(colors.green(correctedConfig));
    }
}

// CLI interface
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv[1]?.includes('port-analyzer.js')) {
    const analyzer = new PortAnalyzer();
    analyzer.analyzePortConfiguration()
        .then(() => {
            analyzer.generateCorrectedInfrastructure();
            console.log(colors.blue('\n🎯 Analysis complete. Use this data to fix port conflicts and update infrastructure.\n'));
        })
        .catch(console.error);
}

export default PortAnalyzer;
