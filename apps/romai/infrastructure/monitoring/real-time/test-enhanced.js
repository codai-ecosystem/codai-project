/**
 * Enhanced Analytics Test Client - Day 19
 * Comprehensive testing for advanced analytics features
 */

const WebSocket = require('ws');

class EnhancedAnalyticsTestClient {
  constructor(url = 'ws://localhost:8766') {
    this.url = url;
    this.ws = null;
    this.connected = false;
    this.receivedMessages = [];
    this.testResults = {
      connection: false,
      subscription: false,
      analytics: false,
      trends: false,
      alerts: false,
      predictions: false,
      dashboards: false
    };
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Connecting to Enhanced Analytics Server: ${this.url}`);

      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        this.connected = true;
        this.testResults.connection = true;
        console.log('✅ Connected to ROMAI Enhanced Analytics Server');
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.receivedMessages.push(message);
          this.handleMessage(message);
        } catch (error) {
          console.log('📨 Raw message:', data.toString());
        }
      });

      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        this.connected = false;
        console.log('🔌 Connection closed');
      });
    });
  }

  handleMessage(message) {
    console.log(`📨 ${message.type}:`, JSON.stringify(message, null, 2));

    switch (message.type) {
      case 'connection_established':
        console.log(`🎯 Server capabilities: ${message.capabilities?.join(', ')}`);
        break;
      case 'subscription_confirmed':
        this.testResults.subscription = true;
        console.log(`✅ Subscriptions confirmed: ${Object.keys(message.subscriptions).filter(k => message.subscriptions[k]).join(', ')}`);
        break;
      case 'analytics':
        this.testResults.analytics = true;
        console.log(`📊 Analytics data received from: ${message.data?.service}`);
        break;
      case 'trend':
        this.testResults.trends = true;
        console.log(`📈 Trend data: ${message.data?.metric} - ${message.data?.trend}`);
        break;
      case 'alert':
        this.testResults.alerts = true;
        console.log(`🚨 Alert: ${message.data?.name} - ${message.data?.severity}`);
        break;
      case 'prediction':
        this.testResults.predictions = true;
        console.log(`🔮 Prediction for ${message.data?.service}: ${message.data?.metric}`);
        break;
      case 'analytics_summary':
        console.log(`📊 Analytics Summary - Healthy Services: ${message.data?.healthyServices}/${message.data?.totalServices}`);
        break;
      case 'active_alerts':
        console.log(`🚨 Active Alerts Count: ${message.count}`);
        break;
    }
  }

  send(message) {
    if (this.connected && this.ws) {
      this.ws.send(JSON.stringify(message));
      console.log('📤 Sent:', JSON.stringify(message, null, 2));
    } else {
      console.log('❌ Not connected');
    }
  }

  // Test Methods
  async testSubscription() {
    console.log('\n🧪 Testing Enhanced Subscriptions...');
    this.send({
      type: 'subscribe',
      subscriptions: {
        analytics: true,
        trends: true,
        alerts: true,
        predictions: true,
        dashboards: true
      }
    });
    await this.wait(2000);
  }

  async testAnalyticsRequests() {
    console.log('\n🧪 Testing Analytics Requests...');

    // Get analytics summary
    this.send({ type: 'get_analytics', timeframe: '1h' });
    await this.wait(1000);

    // Get service health
    this.send({ type: 'get_service_health', service: 'romai-api', timeframe: '1h' });
    await this.wait(1000);
  }

  async testTrendAnalysis() {
    console.log('\n🧪 Testing Trend Analysis...');

    const metrics = ['responseTime', 'cpuUsage', 'memoryUsage', 'errorRate'];
    const timeframes = ['1h', '6h', '24h'];

    for (const metric of metrics) {
      for (const timeframe of timeframes) {
        this.send({ type: 'get_trends', metric, timeframe });
        await this.wait(500);
      }
    }
  }

  async testPredictions() {
    console.log('\n🧪 Testing Predictive Analytics...');

    const services = ['romai-api', 'romai-dashboard', 'romai-mcp'];
    const metrics = ['responseTime', 'cpuUsage', 'memoryUsage'];

    for (const service of services) {
      for (const metric of metrics) {
        this.send({ type: 'get_predictions', service, metric });
        await this.wait(500);
      }
    }
  }

  async testAlertManagement() {
    console.log('\n🧪 Testing Alert Management...');

    // Get active alerts
    this.send({ type: 'get_alerts' });
    await this.wait(1000);

    // Create a custom alert
    this.send({
      type: 'create_alert',
      rule: {
        id: 'test_alert_' + Date.now(),
        name: 'Test High Throughput Alert',
        metric: 'throughput',
        condition: 'gt',
        threshold: 50,
        severity: 'medium',
        enabled: true
      }
    });
    await this.wait(1000);
  }

  async testDashboardCreation() {
    console.log('\n🧪 Testing Dashboard Creation...');

    this.send({
      type: 'create_dashboard',
      widgets: [
        {
          id: 'widget_1',
          type: 'chart',
          title: 'Response Time Trend',
          size: 'medium',
          config: {
            dataSource: 'analytics',
            refreshInterval: 30,
            chartType: 'line',
            timeRange: '1h'
          }
        },
        {
          id: 'widget_2',
          type: 'metric',
          title: 'CPU Usage',
          size: 'small',
          config: {
            dataSource: 'metrics',
            refreshInterval: 10
          }
        }
      ]
    });
    await this.wait(1000);
  }

  async testPingPong() {
    console.log('\n🧪 Testing Ping/Pong...');
    this.send({ type: 'ping' });
    await this.wait(1000);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runComprehensiveTest() {
    try {
      console.log('🚀 Starting Enhanced Analytics Comprehensive Test\n');

      await this.connect();
      await this.wait(1000);

      await this.testPingPong();
      await this.testSubscription();
      await this.testAnalyticsRequests();
      await this.testTrendAnalysis();
      await this.testPredictions();
      await this.testAlertManagement();
      await this.testDashboardCreation();

      // Listen for real-time data
      console.log('\n🎧 Listening for real-time enhanced analytics for 15 seconds...');
      await this.wait(15000);

      this.printTestResults();
      console.log('\n✅ Enhanced Analytics Test completed successfully!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      this.disconnect();
    }
  }

  printTestResults() {
    console.log('\n📊 Enhanced Analytics Test Results:');
    console.log('═══════════════════════════════════');

    Object.keys(this.testResults).forEach(test => {
      const status = this.testResults[test] ? '✅ PASS' : '❌ FAIL';
      console.log(`${test.padEnd(15)}: ${status}`);
    });

    console.log('\n📈 Message Statistics:');
    console.log(`Total messages received: ${this.receivedMessages.length}`);

    const messageTypes = {};
    this.receivedMessages.forEach(msg => {
      messageTypes[msg.type] = (messageTypes[msg.type] || 0) + 1;
    });

    Object.keys(messageTypes).forEach(type => {
      console.log(`${type.padEnd(20)}: ${messageTypes[type]}`);
    });

    const passCount = Object.values(this.testResults).filter(Boolean).length;
    const totalTests = Object.keys(this.testResults).length;
    const successRate = Math.round((passCount / totalTests) * 100);

    console.log(`\n🎯 Overall Success Rate: ${successRate}% (${passCount}/${totalTests})`);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Performance Test
class PerformanceTestClient {
  constructor(url = 'ws://localhost:8766', clientCount = 5) {
    this.url = url;
    this.clientCount = clientCount;
    this.clients = [];
    this.stats = {
      connections: 0,
      messages: 0,
      errors: 0,
      startTime: null,
      endTime: null
    };
  }

  async runPerformanceTest() {
    console.log(`\n🏃‍♂️ Running Performance Test with ${this.clientCount} clients`);
    this.stats.startTime = Date.now();

    // Create multiple clients
    for (let i = 0; i < this.clientCount; i++) {
      const client = new EnhancedAnalyticsTestClient(this.url);

      try {
        await client.connect();
        this.clients.push(client);
        this.stats.connections++;
        console.log(`✅ Client ${i + 1} connected`);

        // Subscribe each client
        client.send({
          type: 'subscribe',
          subscriptions: {
            analytics: true,
            trends: true,
            alerts: true,
            predictions: true
          }
        });

      } catch (error) {
        console.error(`❌ Client ${i + 1} failed to connect:`, error);
        this.stats.errors++;
      }

      await this.wait(200); // Stagger connections
    }

    // Let clients receive data for 10 seconds
    await this.wait(10000);

    // Count total messages
    this.clients.forEach(client => {
      this.stats.messages += client.receivedMessages.length;
    });

    // Disconnect all clients
    this.clients.forEach(client => client.disconnect());

    this.stats.endTime = Date.now();
    this.printPerformanceResults();
  }

  printPerformanceResults() {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;

    console.log('\n🏆 Performance Test Results:');
    console.log('═══════════════════════════════');
    console.log(`Test Duration: ${duration}s`);
    console.log(`Successful Connections: ${this.stats.connections}/${this.clientCount}`);
    console.log(`Total Messages Received: ${this.stats.messages}`);
    console.log(`Messages per Second: ${Math.round(this.stats.messages / duration)}`);
    console.log(`Connection Success Rate: ${Math.round((this.stats.connections / this.clientCount) * 100)}%`);
    console.log(`Errors: ${this.stats.errors}`);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--performance')) {
    const clientCount = parseInt(args[args.indexOf('--clients') + 1]) || 5;
    const perfTest = new PerformanceTestClient('ws://localhost:8766', clientCount);
    await perfTest.runPerformanceTest();
  } else {
    const client = new EnhancedAnalyticsTestClient();
    await client.runComprehensiveTest();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EnhancedAnalyticsTestClient, PerformanceTestClient };
