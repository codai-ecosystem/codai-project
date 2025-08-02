/**
 * ROMAI Week 3 Integration Test Client
 * Day 21: Comprehensive testing client for integration system
 */

const WebSocket = require('ws');

class Week3IntegrationTestClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.clientId = null;
        this.messageCount = 0;
        this.testResults = {
            connection: false,
            subscription: false,
            system_overview: false,
            test_summary: false,
            integration_report: false,
            server_status: false
        };
    }

    async connect(url = 'ws://localhost:8768/integration') {
        return new Promise((resolve, reject) => {
            console.log('🚀 Connecting to Week 3 Integration Server:', url);

            this.ws = new WebSocket(url);

            this.ws.on('open', () => {
                console.log('✅ Connected to ROMAI Week 3 Integration Server');
                this.connected = true;
                resolve();
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            this.ws.on('close', () => {
                console.log('🔌 Connection closed');
                this.connected = false;
            });

            this.ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            });

            setTimeout(() => {
                if (!this.connected) {
                    reject(new Error('Connection timeout'));
                }
            }, 5000);
        });
    }

    handleMessage(message) {
        this.messageCount++;

        switch (message.type) {
            case 'connection_established':
                console.log('📨 connection_established:', JSON.stringify(message, null, 2));
                this.clientId = message.client_id;
                console.log(`🎯 Server capabilities: ${message.capabilities.join(', ')}`);
                this.testResults.connection = true;
                break;

            case 'pong':
                console.log('📨 pong:', JSON.stringify(message, null, 2));
                break;

            case 'subscription_confirmed':
                console.log('📨 subscription_confirmed:', JSON.stringify(message, null, 2));
                console.log(`✅ Subscriptions confirmed: ${Object.keys(message.subscriptions).filter(k => message.subscriptions[k]).join(', ')}`);
                this.testResults.subscription = true;
                break;

            case 'system_overview':
                console.log('📨 system_overview:', JSON.stringify(message, null, 2));
                console.log(`📊 System Health: ${message.data.healthScore}% (${message.data.online}/${message.data.total} components online)`);
                this.testResults.system_overview = true;
                break;

            case 'test_summary':
                console.log('📨 test_summary:', JSON.stringify(message, null, 2));
                console.log(`🧪 Test Results: ${message.data.passed}/${message.data.total} passed (${message.data.successRate.toFixed(1)}%)`);
                this.testResults.test_summary = true;
                break;

            case 'integration_report':
                console.log('📨 integration_report:', JSON.stringify(message, null, 2));
                console.log(`📊 Integration Report - Week 3 Score: ${message.data.week3_score}/100`);
                console.log(`🎯 System Health: ${message.data.summary.system_health}%, Test Success: ${message.data.summary.test_success_rate.toFixed(1)}%`);
                this.testResults.integration_report = true;
                break;

            case 'server_status':
                console.log('📨 server_status:', JSON.stringify(message, null, 2));
                console.log(`🖥️ Server Status - Running: ${message.data.running}, Clients: ${message.data.connected_clients}`);
                this.testResults.server_status = true;
                break;

            case 'health_update':
                console.log('📨 health_update:', JSON.stringify(message, null, 2));
                console.log(`💓 Health update: ${message.data.component} - ${message.data.healthy ? 'Healthy' : 'Unhealthy'}`);
                break;

            case 'test_completed':
                console.log('📨 test_completed:', JSON.stringify(message, null, 2));
                console.log(`🧪 Test completed: ${message.data.name} - ${message.data.status}`);
                break;

            case 'integration_started':
                console.log('📨 integration_started:', JSON.stringify(message, null, 2));
                console.log(`🚀 Integration testing started`);
                break;

            case 'integration_stopped':
                console.log('📨 integration_stopped:', JSON.stringify(message, null, 2));
                console.log(`🛑 Integration testing stopped`);
                break;

            case 'integration_completed':
                console.log('📨 integration_completed:', JSON.stringify(message, null, 2));
                console.log(`✅ Integration completed: ${message.data.passed}/${message.data.total} tests passed`);
                break;

            case 'error':
                console.log('📨 error:', JSON.stringify(message, null, 2));
                console.log(`❌ Server error: ${message.message}`);
                break;

            default:
                console.log('📨 unknown message:', JSON.stringify(message, null, 2));
        }
    }

    send(message) {
        if (this.ws && this.connected) {
            console.log('📤 Sent:', JSON.stringify(message));
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('❌ Not connected to server');
        }
    }

    async testPingPong() {
        console.log('\n🧪 Testing Ping/Pong...');
        this.send({ type: 'ping' });
        await this.delay(1000);
    }

    async testSubscriptions() {
        console.log('\n🧪 Testing Integration Subscriptions...');
        this.send({
            type: 'subscribe',
            subscriptions: {
                health: true,
                tests: true,
                integration: true
            }
        });
        await this.delay(1000);
    }

    async testSystemOverview() {
        console.log('\n🧪 Testing System Overview...');
        this.send({ type: 'get_system_overview' });
        await this.delay(2000);
    }

    async testTestSummary() {
        console.log('\n🧪 Testing Test Summary...');
        this.send({ type: 'get_test_summary' });
        await this.delay(2000);
    }

    async testIntegrationReport() {
        console.log('\n🧪 Testing Integration Report...');
        this.send({ type: 'get_integration_report' });
        await this.delay(2000);
    }

    async testServerStatus() {
        console.log('\n🧪 Testing Server Status...');
        this.send({ type: 'get_status' });
        await this.delay(1000);
    }

    async testIntegrationControl() {
        console.log('\n🧪 Testing Integration Control...');

        // Stop integration
        this.send({ type: 'stop_integration' });
        await this.delay(2000);

        // Start integration
        this.send({ type: 'start_integration' });
        await this.delay(5000);
    }

    async listenForRealTimeUpdates(duration = 15000) {
        console.log(`\n🎧 Listening for real-time integration updates for ${duration / 1000} seconds...`);
        await this.delay(duration);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    printTestResults() {
        console.log('\n📊 Week 3 Integration Test Results:');
        console.log('═══════════════════════════════════');

        const results = Object.entries(this.testResults);
        const passed = results.filter(([_, result]) => result).length;
        const total = results.length;

        results.forEach(([test, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            const padding = ' '.repeat(Math.max(0, 25 - test.length));
            console.log(`${test}${padding}: ${status}`);
        });

        console.log('\n📈 Message Statistics:');
        console.log(`Total messages received: ${this.messageCount}`);

        console.log(`\n🎯 Overall Success Rate: ${Math.round((passed / total) * 100)}% (${passed}/${total})`);

        if (passed === total) {
            console.log('✅ Week 3 Integration Test completed successfully!');
        } else {
            console.log(`⚠️ Week 3 Integration Test completed with ${total - passed} failures`);
        }
    }
}

// Comprehensive Integration Test
async function runWeek3IntegrationTest() {
    const client = new Week3IntegrationTestClient();

    try {
        await client.connect();

        // Run comprehensive test sequence
        await client.testPingPong();
        await client.testSubscriptions();
        await client.testSystemOverview();
        await client.testTestSummary();
        await client.testIntegrationReport();
        await client.testServerStatus();
        await client.testIntegrationControl();
        await client.listenForRealTimeUpdates(15000);

        client.printTestResults();

    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
    } finally {
        client.disconnect();
    }
}

// System Validation Test
class SystemValidationClient {
    constructor() {
        this.ws = null;
        this.validationResults = {
            elk_stack: 'unknown',
            analytics: 'unknown',
            performance: 'unknown',
            integration: 'unknown'
        };
    }

    async validateSystemIntegration() {
        console.log('\n🔍 Starting comprehensive system validation...');

        try {
            this.ws = new WebSocket('ws://localhost:8768/integration');

            await new Promise((resolve, reject) => {
                this.ws.on('open', resolve);
                this.ws.on('error', reject);
                setTimeout(() => reject(new Error('Connection timeout')), 5000);
            });

            console.log('✅ Integration server connectivity: PASS');

            // Get system overview
            this.ws.send(JSON.stringify({ type: 'get_system_overview' }));

            const overview = await new Promise((resolve) => {
                this.ws.on('message', (data) => {
                    const message = JSON.parse(data.toString());
                    if (message.type === 'system_overview') {
                        resolve(message.data);
                    }
                });
            });

            console.log('\n🏗️ System Architecture Validation:');
            console.log('═══════════════════════════════════');

            // Validate each component type
            const elkComponents = overview.components.filter(c =>
                ['elasticsearch', 'kibana', 'logstash'].includes(c.name)
            );
            const analyticsComponents = overview.components.filter(c =>
                ['simple-analytics', 'enhanced-analytics'].includes(c.name)
            );
            const performanceComponents = overview.components.filter(c =>
                c.name === 'performance-optimizer'
            );

            this.validationResults.elk_stack = elkComponents.length === 3 ? 'configured' : 'partial';
            this.validationResults.analytics = analyticsComponents.length === 2 ? 'configured' : 'partial';
            this.validationResults.performance = performanceComponents.length === 1 ? 'configured' : 'missing';
            this.validationResults.integration = overview.healthScore > 0 ? 'operational' : 'degraded';

            console.log(`ELK Stack (3 components): ${this.validationResults.elk_stack}`);
            console.log(`Analytics (2 components): ${this.validationResults.analytics}`);
            console.log(`Performance (1 component): ${this.validationResults.performance}`);
            console.log(`Integration Health: ${this.validationResults.integration} (${overview.healthScore}%)`);

            // Get test summary
            this.ws.send(JSON.stringify({ type: 'get_test_summary' }));

            const testSummary = await new Promise((resolve) => {
                this.ws.on('message', (data) => {
                    const message = JSON.parse(data.toString());
                    if (message.type === 'test_summary') {
                        resolve(message.data);
                    }
                });
            });

            console.log('\n🧪 Integration Test Validation:');
            console.log('═══════════════════════════════');
            console.log(`Total Tests: ${testSummary.total}`);
            console.log(`Passed: ${testSummary.passed}`);
            console.log(`Failed: ${testSummary.failed}`);
            console.log(`Success Rate: ${testSummary.successRate.toFixed(1)}%`);
            console.log(`Avg Duration: ${testSummary.avgDuration.toFixed(0)}ms`);

            // Calculate overall validation score
            const configuredSystems = Object.values(this.validationResults).filter(v =>
                v === 'configured' || v === 'operational'
            ).length;
            const validationScore = (configuredSystems / Object.keys(this.validationResults).length) * 100;

            console.log('\n🎯 Week 3 Integration Validation Summary:');
            console.log('════════════════════════════════════════');
            console.log(`System Configuration Score: ${validationScore.toFixed(1)}%`);
            console.log(`Integration Test Score: ${testSummary.successRate.toFixed(1)}%`);
            console.log(`Overall System Health: ${overview.healthScore}%`);

            const overallScore = (validationScore + testSummary.successRate + overview.healthScore) / 3;
            console.log(`\n🏆 Week 3 Overall Score: ${overallScore.toFixed(1)}/100`);

            if (overallScore >= 90) {
                console.log('🌟 EXCELLENT: Week 3 integration is production-ready!');
            } else if (overallScore >= 80) {
                console.log('✅ GOOD: Week 3 integration is stable with minor issues');
            } else if (overallScore >= 70) {
                console.log('⚠️ ACCEPTABLE: Week 3 integration needs optimization');
            } else {
                console.log('❌ NEEDS WORK: Week 3 integration requires attention');
            }

            this.ws.close();
            return overallScore;

        } catch (error) {
            console.error('❌ System validation failed:', error.message);
            if (this.ws) this.ws.close();
            return 0;
        }
    }
}

// Run tests based on command line argument
if (require.main === module) {
    const testType = process.argv[2] || 'integration';

    if (testType === 'validation') {
        const validator = new SystemValidationClient();
        validator.validateSystemIntegration();
    } else {
        runWeek3IntegrationTest();
    }
}

module.exports = { Week3IntegrationTestClient, SystemValidationClient };
