#!/usr/bin/env node

/**
 * Service Status Checker
 * Checks the status of all Codai services
 */

import http from 'http';

const expectedServices = [
    { name: 'admin', port: 4011 },
    { name: 'fabricai', port: 4005 },
    { name: 'hub', port: 4018 },
    { name: 'docs', port: 4016 },
    { name: 'publicai', port: 4012 },
    { name: 'id', port: 4017 },
    { name: 'AIDE', port: 4014 },
    { name: 'analizai', port: 4015 },
    { name: 'dash', port: 4019 },
    { name: 'explorer', port: 4020 },
    { name: 'jucai', port: 4021 },
    { name: 'ajutai', port: 4013 },
    { name: 'legalizai', port: 4022 },
    { name: 'marketai', port: 4023 },
    { name: 'metu', port: 4024 },
    { name: 'mod', port: 4025 },
    { name: 'stocai', port: 4026 },
    { name: 'kodex', port: 4021 },
    { name: 'tools', port: 4028 },
    { name: 'templates', port: 4030 }
];

class ServiceStatusChecker {
    constructor() {
        this.runningServices = [];
        this.failedServices = [];
    }

    checkService(service) {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${service.port}/health`, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const healthData = JSON.parse(data);
                        this.runningServices.push({
                            ...service,
                            status: 'healthy',
                            uptime: healthData.uptime || 'unknown'
                        });
                        resolve(true);
                    } catch (e) {
                        this.runningServices.push({
                            ...service,
                            status: 'running',
                            uptime: 'unknown'
                        });
                        resolve(true);
                    }
                });
            });

            req.on('error', () => {
                this.failedServices.push({
                    ...service,
                    status: 'not running'
                });
                resolve(false);
            });

            req.setTimeout(3000, () => {
                req.destroy();
                this.failedServices.push({
                    ...service,
                    status: 'timeout'
                });
                resolve(false);
            });
        });
    }

    async checkAll() {
        console.log('🔍 Checking status of all Codai services...\n');

        const promises = expectedServices.map(service => this.checkService(service));
        await Promise.all(promises);

        // Sort services by port for better readability
        this.runningServices.sort((a, b) => a.port - b.port);
        this.failedServices.sort((a, b) => a.port - b.port);

        console.log('📊 SERVICE STATUS REPORT');
        console.log('========================\n');

        if (this.runningServices.length > 0) {
            console.log(`✅ RUNNING SERVICES (${this.runningServices.length}):`);
            this.runningServices.forEach(service => {
                const uptime = typeof service.uptime === 'number'
                    ? `${Math.floor(service.uptime)}s`
                    : service.uptime;
                console.log(`  - ${service.name.padEnd(12)} : Port ${service.port} : ${service.status} : Uptime ${uptime}`);
            });
            console.log('');
        }

        if (this.failedServices.length > 0) {
            console.log(`❌ NOT RUNNING (${this.failedServices.length}):`);
            this.failedServices.forEach(service => {
                console.log(`  - ${service.name.padEnd(12)} : Port ${service.port} : ${service.status}`);
            });
            console.log('');
        }

        console.log('📈 SUMMARY:');
        console.log(`Total Services: ${expectedServices.length}`);
        console.log(`Running: ${this.runningServices.length}`);
        console.log(`Not Running: ${this.failedServices.length}`);
        console.log(`Success Rate: ${((this.runningServices.length / expectedServices.length) * 100).toFixed(1)}%`);

        // Service categories
        const categories = {
            infrastructure: ['admin', 'hub', 'docs', 'id', 'AIDE'],
            aiPlatforms: ['fabricai', 'publicai', 'analizai'],
            analytics: ['dash', 'metu'],
            development: ['kodex', 'tools', 'templates'],
            business: ['ajutai', 'legalizai', 'marketai', 'stocai'],
            specialized: ['explorer', 'jucai', 'mod']
        };

        console.log('\n🏷️  BY CATEGORY:');
        Object.entries(categories).forEach(([category, serviceNames]) => {
            const running = this.runningServices.filter(s => serviceNames.includes(s.name)).length;
            const total = serviceNames.length;
            console.log(`  ${category.padEnd(15)}: ${running}/${total} running`);
        });

        console.log('\n🚀 NEXT ACTIONS:');
        if (this.failedServices.length > 0) {
            console.log('  1. Start missing services with Express setup');
            console.log('  2. Run batch service starter script');
            console.log('  3. Verify browser accessibility');
        } else {
            console.log('  🎉 All services operational! Ready for feature development.');
        }
    }
}

const checker = new ServiceStatusChecker();
checker.checkAll().catch(console.error);
