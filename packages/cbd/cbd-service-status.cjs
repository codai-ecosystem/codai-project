#!/usr/bin/env node

/**
 * CBD Universal Database - Service Status Overview
 * Comprehensive status check for all CBD services
 */

const http = require('http');

/**
 * CBD Service Status Checker
 * Validates all services in the CBD ecosystem
 */
class CBDServiceStatusChecker {
    constructor() {
        this.services = [
            {
                name: 'CBD Core Database',
                port: 4180,
                endpoints: ['/health', '/stats', '/'],
                description: 'Multi-paradigm database core (Document, Vector, Graph, KV, Time-Series)'
            },
            {
                name: 'Service Mesh Gateway',
                port: 4000,
                endpoints: ['/health', '/services', '/stats'],
                description: 'Microservice coordination and load balancing'
            },
            {
                name: 'Real-time Collaboration',
                port: 4600,
                endpoints: ['/health', '/stats', '/collaboration-status'],
                description: 'WebSocket collaboration with Operational Transform'
            },
            {
                name: 'AI Analytics Engine',
                port: 4700,
                endpoints: ['/health', '/stats', '/models'],
                description: 'TensorFlow.js ML and Natural NLP processing'
            },
            {
                name: 'GraphQL API Gateway',
                port: 4800,
                endpoints: ['/health', '/schema', '/stats', '/graphql'],
                description: 'Apollo Server GraphQL with real-time subscriptions'
            }
        ];

        this.results = {
            services: [],
            summary: {
                total: this.services.length,
                running: 0,
                stopped: 0,
                errors: 0
            },
            timestamp: new Date().toISOString()
        };
    }

    async checkService(service) {
        console.log(`\n🔍 Checking ${service.name} (Port ${service.port})...`);

        const serviceResult = {
            name: service.name,
            port: service.port,
            description: service.description,
            status: 'unknown',
            endpoints: {},
            responseTime: 0,
            error: null
        };

        const startTime = Date.now();

        try {
            // Check primary health endpoint
            const healthResponse = await this.makeRequest(service.port, '/health');
            serviceResult.responseTime = Date.now() - startTime;

            if (healthResponse.statusCode === 200) {
                serviceResult.status = 'running';
                console.log(`✅ ${service.name}: Running (${serviceResult.responseTime}ms)`);

                // Check additional endpoints
                for (const endpoint of service.endpoints) {
                    try {
                        const response = await this.makeRequest(service.port, endpoint);
                        serviceResult.endpoints[endpoint] = {
                            status: response.statusCode,
                            available: response.statusCode === 200 || response.statusCode === 400
                        };
                    } catch (error) {
                        serviceResult.endpoints[endpoint] = {
                            status: 'error',
                            available: false,
                            error: error.message
                        };
                    }
                }

                // Parse health data if available
                if (healthResponse.data && typeof healthResponse.data === 'object') {
                    serviceResult.healthData = healthResponse.data;

                    if (healthResponse.data.uptime) {
                        const uptimeSeconds = Math.floor(healthResponse.data.uptime / 1000);
                        console.log(`   Uptime: ${this.formatUptime(uptimeSeconds)}`);
                    }

                    if (healthResponse.data.stats) {
                        console.log(`   Stats: Available`);
                    }

                    if (healthResponse.data.features) {
                        console.log(`   Features: ${Object.keys(healthResponse.data.features).length} available`);
                    }
                }

            } else {
                serviceResult.status = 'error';
                serviceResult.error = `HTTP ${healthResponse.statusCode}`;
                console.log(`❌ ${service.name}: Error (${healthResponse.statusCode})`);
            }

        } catch (error) {
            serviceResult.status = 'stopped';
            serviceResult.error = error.message;
            serviceResult.responseTime = Date.now() - startTime;
            console.log(`🛑 ${service.name}: Stopped (${error.message})`);
        }

        return serviceResult;
    }

    async makeRequest(port, path, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: port,
                path: path,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: timeout
            };

            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = {
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: res.headers['content-type']?.includes('application/json') && data
                                ? JSON.parse(data)
                                : data
                        };
                        resolve(response);
                    } catch (error) {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: data,
                            parseError: error.message
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m ${secs}s`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    async checkAllServices() {
        console.log('🌐 CBD Universal Database - Service Status Check');
        console.log('='.repeat(60));
        console.log(`Timestamp: ${this.results.timestamp}`);
        console.log(`Services to check: ${this.services.length}`);

        // Check each service
        for (const service of this.services) {
            const result = await this.checkService(service);
            this.results.services.push(result);

            // Update summary
            switch (result.status) {
                case 'running':
                    this.results.summary.running++;
                    break;
                case 'stopped':
                    this.results.summary.stopped++;
                    break;
                case 'error':
                    this.results.summary.errors++;
                    break;
            }
        }

        // Display summary
        console.log('\n📊 Service Status Summary');
        console.log('='.repeat(40));
        console.log(`Total Services: ${this.results.summary.total}`);
        console.log(`✅ Running: ${this.results.summary.running}`);
        console.log(`🛑 Stopped: ${this.results.summary.stopped}`);
        console.log(`❌ Errors: ${this.results.summary.errors}`);

        const successRate = (this.results.summary.running / this.results.summary.total) * 100;
        console.log(`🎯 Success Rate: ${successRate.toFixed(1)}%`);

        // Display detailed status
        console.log('\n📋 Detailed Service Status');
        console.log('='.repeat(50));

        this.results.services.forEach(service => {
            const statusIcon = {
                'running': '✅',
                'stopped': '🛑',
                'error': '❌',
                'unknown': '❓'
            }[service.status] || '❓';

            console.log(`${statusIcon} ${service.name} (${service.port})`);
            console.log(`   Status: ${service.status.toUpperCase()}`);
            console.log(`   Description: ${service.description}`);

            if (service.responseTime > 0) {
                console.log(`   Response Time: ${service.responseTime}ms`);
            }

            if (service.error) {
                console.log(`   Error: ${service.error}`);
            }

            const runningEndpoints = Object.values(service.endpoints).filter(ep => ep.available).length;
            const totalEndpoints = Object.keys(service.endpoints).length;
            if (totalEndpoints > 0) {
                console.log(`   Endpoints: ${runningEndpoints}/${totalEndpoints} available`);
            }

            console.log('');
        });

        // System health assessment
        console.log('🏥 System Health Assessment');
        console.log('='.repeat(40));

        if (successRate === 100) {
            console.log('🌟 EXCELLENT: All services are running perfectly!');
            console.log('   The CBD Universal Database ecosystem is fully operational.');
        } else if (successRate >= 80) {
            console.log('🟢 GOOD: Most services are running.');
            console.log('   The system is operational with some services down.');
        } else if (successRate >= 60) {
            console.log('🟡 WARNING: Some critical services may be down.');
            console.log('   System functionality may be impacted.');
        } else {
            console.log('🔴 CRITICAL: Multiple services are down.');
            console.log('   System requires immediate attention.');
        }

        // Running services list
        const runningServices = this.results.services.filter(s => s.status === 'running');
        if (runningServices.length > 0) {
            console.log('\n🚀 Currently Running Services:');
            runningServices.forEach(service => {
                console.log(`   • ${service.name} (http://localhost:${service.port})`);
            });
        }

        // Stopped services list
        const stoppedServices = this.results.services.filter(s => s.status === 'stopped' || s.status === 'error');
        if (stoppedServices.length > 0) {
            console.log('\n⚠️  Services Requiring Attention:');
            stoppedServices.forEach(service => {
                console.log(`   • ${service.name} (Port ${service.port}) - ${service.status}`);
                if (service.error) {
                    console.log(`     Error: ${service.error}`);
                }
            });
        }

        console.log('\n🎯 CBD Universal Database Status Check Complete');

        return this.results;
    }
}

// Auto-run if called directly
if (require.main === module) {
    const checker = new CBDServiceStatusChecker();

    checker.checkAllServices()
        .then(results => {
            // Exit with appropriate code
            const allRunning = results.summary.running === results.summary.total;
            process.exit(allRunning ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Status check failed:', error);
            process.exit(1);
        });
}

module.exports = CBDServiceStatusChecker;
