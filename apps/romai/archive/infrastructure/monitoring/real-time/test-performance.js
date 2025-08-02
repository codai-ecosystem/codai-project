/**
 * ROMAI Performance Optimization Test Client
 * Day 20: Comprehensive testing for performance optimization system
 */

const WebSocket = require('ws');

class PerformanceOptimizationTestClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.clientId = null;
        this.messageCount = 0;
        this.testResults = {
            connection: false,
            subscription: false,
            performance_monitoring: false,
            optimization_triggers: false,
            configuration_updates: false,
            reports: false,
            gc_trigger: false
        };
    }

    async connect(url = 'ws://localhost:8767/performance') {
        return new Promise((resolve, reject) => {
            console.log('🚀 Connecting to Performance Optimization Server:', url);

            this.ws = new WebSocket(url);

            this.ws.on('open', () => {
                console.log('✅ Connected to ROMAI Performance Optimization Server');
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

            // Connection timeout
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

            case 'performance_metrics':
                console.log('📨 performance_metrics:', JSON.stringify(message, null, 2));
                console.log(`📊 Performance data - CPU: ${message.data.cpu.usage.toFixed(1)}%, Memory: ${message.data.memory.percentage.toFixed(1)}%`);
                this.testResults.performance_monitoring = true;
                break;

            case 'bottlenecks_detected':
                console.log('📨 bottlenecks_detected:', JSON.stringify(message, null, 2));
                console.log(`🚨 Bottlenecks detected (${message.severity}): ${message.data.length} issues`);
                break;

            case 'optimization_completed':
                console.log('📨 optimization_completed:', JSON.stringify(message, null, 2));
                console.log(`✅ Optimization completed: ${message.data.action.action}`);
                this.testResults.optimization_triggers = true;
                break;

            case 'optimization_failed':
                console.log('📨 optimization_failed:', JSON.stringify(message, null, 2));
                console.log(`❌ Optimization failed: ${message.data.action.action}`);
                break;

            case 'optimization_triggered':
                console.log('📨 optimization_triggered:', JSON.stringify(message, null, 2));
                console.log(`🔧 Optimization triggered for: ${message.target}`);
                this.testResults.optimization_triggers = true;
                break;

            case 'performance_trends':
                console.log('📨 performance_trends:', JSON.stringify(message, null, 2));
                console.log(`📈 Performance trends detected: ${message.data.trends.length} significant changes`);
                break;

            case 'performance_report':
                console.log('📨 performance_report:', JSON.stringify(message, null, 2));
                console.log(`📊 Performance Report - Active optimizations: ${message.data.activeOptimizations}`);
                this.testResults.reports = true;
                break;

            case 'optimizer_configuration':
                console.log('📨 optimizer_configuration:', JSON.stringify(message, null, 2));
                console.log(`⚙️ Current configuration - CPU max: ${message.data.cpu.maxUsage}%, Memory max: ${message.data.memory.maxUsage}%`);
                break;

            case 'configuration_updated':
                console.log('📨 configuration_updated:', JSON.stringify(message, null, 2));
                console.log(`✅ Configuration updated successfully`);
                this.testResults.configuration_updates = true;
                break;

            case 'gc_triggered':
                console.log('📨 gc_triggered:', JSON.stringify(message, null, 2));
                console.log(`🧹 Garbage collection triggered`);
                this.testResults.gc_trigger = true;
                break;

            case 'server_status':
                console.log('📨 server_status:', JSON.stringify(message, null, 2));
                console.log(`🖥️ Server Status - Running: ${message.data.running}, Clients: ${message.data.connected_clients}`);
                break;

            case 'server_heartbeat':
                console.log('📨 server_heartbeat:', JSON.stringify(message, null, 2));
                console.log(`💓 Server heartbeat - Uptime: ${(message.uptime / 60).toFixed(1)}min, Clients: ${message.clients}`);
                break;

            case 'optimizer_started':
                console.log('📨 optimizer_started:', JSON.stringify(message, null, 2));
                console.log(`🚀 Performance optimizer started`);
                break;

            case 'optimizer_stopped':
                console.log('📨 optimizer_stopped:', JSON.stringify(message, null, 2));
                console.log(`🛑 Performance optimizer stopped`);
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
        console.log('\n🧪 Testing Performance Subscriptions...');
        this.send({
            type: 'subscribe',
            subscriptions: {
                performance: true,
                optimizations: true,
                trends: true,
                reports: true
            }
        });
        await this.delay(1000);
    }

    async testPerformanceReports() {
        console.log('\n🧪 Testing Performance Reports...');
        this.send({ type: 'get_performance_report' });
        await this.delay(2000);
    }

    async testConfigurationManagement() {
        console.log('\n🧪 Testing Configuration Management...');

        // Get current config
        this.send({ type: 'get_configuration' });
        await this.delay(1000);

        // Update config
        this.send({
            type: 'update_configuration',
            config: {
                cpu: { maxUsage: 70 },
                memory: { maxUsage: 75 }
            }
        });
        await this.delay(1000);
    }

    async testOptimizationTriggers() {
        console.log('\n🧪 Testing Optimization Triggers...');

        const targets = ['cpu', 'memory', 'network', 'application'];
        for (const target of targets) {
            console.log(`🔧 Triggering ${target} optimization...`);
            this.send({
                type: 'force_optimization',
                target: target
            });
            await this.delay(2000);
        }
    }

    async testGarbageCollection() {
        console.log('\n🧪 Testing Garbage Collection...');
        this.send({ type: 'trigger_gc' });
        await this.delay(1000);
    }

    async testServerStatus() {
        console.log('\n🧪 Testing Server Status...');
        this.send({ type: 'get_status' });
        await this.delay(1000);
    }

    async listenForRealTimeData(duration = 15000) {
        console.log(`\n🎧 Listening for real-time performance data for ${duration / 1000} seconds...`);
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
        console.log('\n📊 Performance Optimization Test Results:');
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
            console.log('✅ Performance Optimization Test completed successfully!');
        } else {
            console.log(`⚠️ Performance Optimization Test completed with ${total - passed} failures`);
        }
    }
}

// Run comprehensive test
async function runPerformanceOptimizationTest() {
    const client = new PerformanceOptimizationTestClient();

    try {
        // Connect to server
        await client.connect();

        // Run test sequence
        await client.testPingPong();
        await client.testSubscriptions();
        await client.testPerformanceReports();
        await client.testConfigurationManagement();
        await client.testOptimizationTriggers();
        await client.testGarbageCollection();
        await client.testServerStatus();
        await client.listenForRealTimeData(15000);

        // Print results
        client.printTestResults();

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        client.disconnect();
    }
}

// Performance load test
class PerformanceLoadTestClient {
    constructor(clientId) {
        this.clientId = clientId;
        this.ws = null;
        this.connected = false;
        this.messagesReceived = 0;
        this.responseTime = [];
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket('ws://localhost:8767/performance');

            this.ws.on('open', () => {
                this.connected = true;
                resolve();
            });

            this.ws.on('message', (data) => {
                this.messagesReceived++;
                const message = JSON.parse(data.toString());

                if (message.type === 'pong') {
                    const responseTime = Date.now() - this.lastPingTime;
                    this.responseTime.push(responseTime);
                }
            });

            this.ws.on('error', reject);
        });
    }

    async performLoadTest(duration = 30000) {
        console.log(`🚀 Client ${this.clientId} starting load test for ${duration / 1000}s`);

        // Subscribe to all data
        this.ws.send(JSON.stringify({
            type: 'subscribe',
            subscriptions: { performance: true, optimizations: true, trends: true, reports: true }
        }));

        const startTime = Date.now();
        const pingInterval = setInterval(() => {
            if (Date.now() - startTime < duration) {
                this.lastPingTime = Date.now();
                this.ws.send(JSON.stringify({ type: 'ping' }));
            } else {
                clearInterval(pingInterval);
            }
        }, 1000);

        await new Promise(resolve => setTimeout(resolve, duration));

        const avgResponseTime = this.responseTime.length > 0 ?
            this.responseTime.reduce((a, b) => a + b) / this.responseTime.length : 0;

        console.log(`📊 Client ${this.clientId} results: ${this.messagesReceived} messages, ${avgResponseTime.toFixed(2)}ms avg response`);

        this.ws.close();
        return {
            clientId: this.clientId,
            messagesReceived: this.messagesReceived,
            avgResponseTime: avgResponseTime
        };
    }
}

async function runLoadTest(numClients = 5, duration = 30000) {
    console.log(`\n🏋️ Starting load test with ${numClients} clients for ${duration / 1000} seconds...`);

    const clients = [];
    for (let i = 0; i < numClients; i++) {
        clients.push(new PerformanceLoadTestClient(i + 1));
    }

    try {
        // Connect all clients
        await Promise.all(clients.map(client => client.connect()));
        console.log(`✅ All ${numClients} clients connected`);

        // Run load test
        const results = await Promise.all(clients.map(client => client.performLoadTest(duration)));

        // Aggregate results
        const totalMessages = results.reduce((sum, r) => sum + r.messagesReceived, 0);
        const avgResponseTime = results.reduce((sum, r) => sum + r.avgResponseTime, 0) / results.length;

        console.log('\n📊 Load Test Results:');
        console.log('═══════════════════');
        console.log(`Total messages: ${totalMessages}`);
        console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
        console.log(`Messages per second: ${(totalMessages / (duration / 1000)).toFixed(2)}`);
        console.log(`Clients: ${numClients}`);

    } catch (error) {
        console.error('❌ Load test failed:', error);
    }
}

// Run tests based on command line argument
if (require.main === module) {
    const testType = process.argv[2] || 'comprehensive';

    if (testType === 'load') {
        const numClients = parseInt(process.argv[3]) || 5;
        const duration = parseInt(process.argv[4]) || 30000;
        runLoadTest(numClients, duration);
    } else {
        runPerformanceOptimizationTest();
    }
}

module.exports = { PerformanceOptimizationTestClient, PerformanceLoadTestClient };
