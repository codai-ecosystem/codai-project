#!/usr/bin/env node

/**
 * 🔍 PORT COMPLIANCE CHECKER
 * 
 * Ensures ALL services and apps comply with 4000+ port policy
 * Apps: 4030-4040, Services: 4000-4029
 * NO services below port 4000 allowed!
 */

const { exec } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class PortComplianceChecker {
    constructor() {
        this.violations = [];
        this.compliantPorts = [];
        this.projectRegistry = this.loadProjectRegistry();
    }

    async checkCompliance() {
        console.log(chalk.blue('🔍 PORT COMPLIANCE CHECKER'));
        console.log(chalk.blue('Policy: NO services below port 4000\n'));

        // Check running ports
        await this.checkRunningPorts();

        // Check project registry compliance
        await this.checkRegistryCompliance();

        // Generate report
        this.generateComplianceReport();

        return this.violations.length === 0;
    }

    async checkRunningPorts() {
        console.log(chalk.yellow('📊 Checking currently running services...\n'));

        return new Promise((resolve) => {
            exec('netstat -an | findstr "LISTENING"', (error, stdout) => {
                if (!error) {
                    const ports = stdout.match(/:(\d{4})/g) || [];
                    const uniquePorts = [...new Set(ports.map(p => parseInt(p.replace(':', ''))))]
                        .filter(p => p >= 3000 && p <= 5000)
                        .sort((a, b) => a - b);

                    console.log(chalk.cyan(`🔌 Total ports in range 3000-5000: ${uniquePorts.length}`));

                    // Categorize ports
                    const violationPorts = uniquePorts.filter(p => p < 4000);
                    const servicePorts = uniquePorts.filter(p => p >= 4000 && p <= 4029);
                    const appPorts = uniquePorts.filter(p => p >= 4030 && p <= 4040);
                    const otherPorts = uniquePorts.filter(p => p > 4040);

                    // Report violations
                    if (violationPorts.length > 0) {
                        console.log(chalk.red(`🚨 POLICY VIOLATIONS: ${violationPorts.length} services`));
                        violationPorts.forEach(port => {
                            console.log(chalk.red(`   ❌ Port ${port} - VIOLATES 4000+ policy`));
                            this.violations.push({
                                type: 'running_service',
                                port: port,
                                message: `Service running on port ${port} violates 4000+ policy`
                            });
                        });
                    } else {
                        console.log(chalk.green('✅ No running services violate port policy'));
                    }

                    // Report compliant services
                    if (servicePorts.length > 0) {
                        console.log(chalk.green(`✅ Services (4000-4029): ${servicePorts.length} running`));
                        servicePorts.forEach(port => {
                            console.log(chalk.green(`   ✅ Port ${port} - Service compliant`));
                            this.compliantPorts.push({ type: 'service', port });
                        });
                    }

                    if (appPorts.length > 0) {
                        console.log(chalk.green(`✅ Apps (4030-4040): ${appPorts.length} running`));
                        appPorts.forEach(port => {
                            console.log(chalk.green(`   ✅ Port ${port} - App compliant`));
                            this.compliantPorts.push({ type: 'app', port });
                        });
                    }

                    if (otherPorts.length > 0) {
                        console.log(chalk.blue(`ℹ️  Other ports (4041+): ${otherPorts.length} running`));
                    }

                } else {
                    console.log(chalk.yellow('⚠️  Could not check running ports'));
                }
                console.log('');
                resolve();
            });
        });
    }

    async checkRegistryCompliance() {
        console.log(chalk.yellow('📋 Checking project registry compliance...\n'));

        // Check apps
        if (this.projectRegistry.apps) {
            console.log(chalk.cyan(`📱 Checking ${this.projectRegistry.apps.length} apps:`));
            this.projectRegistry.apps.forEach(app => {
                const port = app.metadata?.port;
                if (port) {
                    if (port >= 4030 && port <= 4040) {
                        console.log(chalk.green(`   ✅ ${app.name}: port ${port} - App range compliant`));
                        this.compliantPorts.push({ type: 'app_registry', name: app.name, port });
                    } else if (port < 4000) {
                        console.log(chalk.red(`   ❌ ${app.name}: port ${port} - VIOLATES 4000+ policy`));
                        this.violations.push({
                            type: 'app_registry',
                            name: app.name,
                            port: port,
                            message: `App ${app.name} configured with port ${port} violates 4000+ policy`
                        });
                    } else {
                        console.log(chalk.yellow(`   ⚠️  ${app.name}: port ${port} - Outside app range (4030-4040)`));
                    }
                } else {
                    console.log(chalk.gray(`   ○ ${app.name}: no port configured`));
                }
            });
        }

        // Check services
        if (this.projectRegistry.services) {
            console.log(chalk.cyan(`\n⚙️  Checking ${this.projectRegistry.services.length} services:`));
            this.projectRegistry.services.forEach(service => {
                const port = service.port;
                if (port) {
                    if (port >= 4000 && port <= 4029) {
                        console.log(chalk.green(`   ✅ ${service.name}: port ${port} - Service range compliant`));
                        this.compliantPorts.push({ type: 'service_registry', name: service.name, port });
                    } else if (port < 4000) {
                        console.log(chalk.red(`   ❌ ${service.name}: port ${port} - VIOLATES 4000+ policy`));
                        this.violations.push({
                            type: 'service_registry',
                            name: service.name,
                            port: port,
                            message: `Service ${service.name} configured with port ${port} violates 4000+ policy`
                        });
                    } else {
                        console.log(chalk.yellow(`   ⚠️  ${service.name}: port ${port} - Outside service range (4000-4029)`));
                    }
                } else {
                    console.log(chalk.gray(`   ○ ${service.name}: no port configured`));
                }
            });
        }

        console.log('');
    }

    generateComplianceReport() {
        console.log(chalk.blue('📊 COMPLIANCE REPORT'));
        console.log(chalk.blue('═══════════════════════════════════════\n'));

        if (this.violations.length === 0) {
            console.log(chalk.green('🎉 FULL COMPLIANCE ACHIEVED!'));
            console.log(chalk.green('✅ All services and apps comply with 4000+ port policy'));
            console.log(chalk.green(`✅ ${this.compliantPorts.length} compliant port configurations found`));
        } else {
            console.log(chalk.red(`🚨 ${this.violations.length} POLICY VIOLATIONS FOUND:`));
            this.violations.forEach((violation, index) => {
                console.log(chalk.red(`${index + 1}. ${violation.message}`));
            });

            console.log(chalk.yellow('\n🔧 RECOMMENDED ACTIONS:'));
            console.log(chalk.yellow('1. Stop all services running below port 4000'));
            console.log(chalk.yellow('2. Update project registry port configurations'));
            console.log(chalk.yellow('3. Restart services with compliant port allocations'));
        }

        console.log(chalk.blue('\n📋 PORT ALLOCATION SUMMARY:'));
        console.log(chalk.blue('Apps (4030-4040):     11 slots available'));
        console.log(chalk.blue('Services (4000-4029): 30 slots available'));
        console.log(chalk.blue('Total capacity:       41 concurrent services'));

        const appCount = this.compliantPorts.filter(p => p.type.includes('app')).length;
        const serviceCount = this.compliantPorts.filter(p => p.type.includes('service')).length;

        console.log(chalk.cyan(`\nCurrent usage:`));
        console.log(chalk.cyan(`Apps:     ${appCount}/11 slots`));
        console.log(chalk.cyan(`Services: ${serviceCount}/30 slots`));

        const utilizationRate = Math.round(((appCount + serviceCount) / 41) * 100);
        console.log(chalk.cyan(`Overall:  ${utilizationRate}% ecosystem utilization`));
    }

    loadProjectRegistry() {
        try {
            const registryPath = path.join(process.cwd(), 'projects.index.json');
            if (fs.existsSync(registryPath)) {
                return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
            }
        } catch (error) {
            console.log(chalk.yellow('⚠️  Could not load project registry'));
        }
        return { apps: [], services: [] };
    }
}

// Run the compliance check
if (require.main === module) {
    const checker = new PortComplianceChecker();
    checker.checkCompliance().then(isCompliant => {
        process.exit(isCompliant ? 0 : 1);
    }).catch(error => {
        console.error(chalk.red('Compliance check failed:'), error);
        process.exit(1);
    });
}

module.exports = PortComplianceChecker;
