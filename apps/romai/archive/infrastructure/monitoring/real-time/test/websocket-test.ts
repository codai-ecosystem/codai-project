/**
 * ROMAI WebSocket Client Test
 * TypeScript implementation for testing WebSocket streaming functionality
 */

import WebSocket from 'ws';

interface TestMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

interface TestResults {
  connectionSuccess: boolean;
  pingPongSuccess: boolean;
  subscriptionSuccess: boolean;
  messagesReceived: number;
  messagesPerSecond: number;
  testDuration: number;
  errors: string[];
}

class WebSocketTester {
  private ws?: WebSocket;
  private testResults: TestResults = {
    connectionSuccess: false,
    pingPongSuccess: false,
    subscriptionSuccess: false,
    messagesReceived: 0,
    messagesPerSecond: 0,
    testDuration: 0,
    errors: []
  };

  constructor(private serverUrl: string = 'ws://localhost:8765') { }

  public async runTests(): Promise<TestResults> {
    console.log('🚀 ROMAI WebSocket Server Test (TypeScript)');
    console.log('='.repeat(50));

    try {
      // Test 1: Basic Connection
      await this.testConnection();

      if (this.testResults.connectionSuccess) {
        // Test 2: Ping/Pong
        await this.testPingPong();

        // Test 3: Subscription and Streaming
        await this.testSubscriptionAndStreaming();
      }

    } catch (error) {
      this.testResults.errors.push(`Test suite error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (this.ws) {
        this.ws.close();
      }
    }

    this.printResults();
    return this.testResults;
  }

  private async testConnection(): Promise<void> {
    console.log('\n📡 Testing WebSocket Connection...');

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);

        const timeout = setTimeout(() => {
          this.testResults.errors.push('Connection timeout');
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws.on('open', () => {
          clearTimeout(timeout);
          this.testResults.connectionSuccess = true;
          console.log('✅ Connection successful');
          resolve();
        });

        this.ws.on('error', (error) => {
          clearTimeout(timeout);
          this.testResults.errors.push(`Connection error: ${error.message}`);
          console.log('❌ Connection failed:', error.message);
          reject(error);
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            console.log(`📨 Received: ${message.type}`);
          } catch (e) {
            console.log('📨 Received non-JSON message');
          }
        });

      } catch (error) {
        this.testResults.errors.push(`Connection setup error: ${error instanceof Error ? error.message : String(error)}`);
        reject(error);
      }
    });
  }

  private async testPingPong(): Promise<void> {
    console.log('\n🏓 Testing Ping/Pong...');

    return new Promise((resolve) => {
      if (!this.ws) {
        this.testResults.errors.push('No WebSocket connection for ping/pong test');
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        this.testResults.errors.push('Ping/pong timeout');
        console.log('❌ Ping/pong timeout');
        resolve();
      }, 5000);

      const messageHandler = (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'pong') {
            clearTimeout(timeout);
            this.testResults.pingPongSuccess = true;
            console.log('✅ Ping/pong successful');
            this.ws?.off('message', messageHandler);
            resolve();
          }
        } catch (e) {
          // Ignore non-JSON messages
        }
      };

      this.ws.on('message', messageHandler);

      // Send ping
      const pingMessage: TestMessage = {
        type: 'ping',
        timestamp: new Date().toISOString()
      };

      this.ws.send(JSON.stringify(pingMessage));
      console.log('📤 Sent ping message');
    });
  }

  private async testSubscriptionAndStreaming(): Promise<void> {
    console.log('\n📡 Testing Subscription and Streaming...');

    return new Promise((resolve) => {
      if (!this.ws) {
        this.testResults.errors.push('No WebSocket connection for streaming test');
        resolve();
        return;
      }

      const testDuration = 15000; // 15 seconds
      const startTime = Date.now();
      let subscriptionConfirmed = false;
      let messageCount = 0;

      const timeout = setTimeout(() => {
        const endTime = Date.now();
        this.testResults.testDuration = endTime - startTime;
        this.testResults.messagesReceived = messageCount;
        this.testResults.messagesPerSecond = Math.round((messageCount / (this.testResults.testDuration / 1000)) * 100) / 100;

        console.log(`\n📊 Streaming Test Results:`);
        console.log(`   Duration: ${this.testResults.testDuration}ms`);
        console.log(`   Messages received: ${messageCount}`);
        console.log(`   Messages per second: ${this.testResults.messagesPerSecond}`);

        if (messageCount > 0) {
          console.log('✅ Streaming test successful');
        } else {
          console.log('❌ No messages received during streaming test');
          this.testResults.errors.push('No streaming messages received');
        }

        resolve();
      }, testDuration);

      const messageHandler = (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'subscription_confirmed') {
            subscriptionConfirmed = true;
            this.testResults.subscriptionSuccess = true;
            console.log('✅ Subscription confirmed');
            console.log(`📡 Listening for ${testDuration / 1000} seconds...`);
          } else if (message.stream_type) {
            messageCount++;
            if (messageCount % 5 === 0) {
              console.log(`   📊 Received ${messageCount} messages so far...`);
            }
          }
        } catch (e) {
          // Ignore non-JSON messages
        }
      };

      this.ws.on('message', messageHandler);

      // Send subscription message
      const subscriptionMessage: TestMessage = {
        type: 'subscribe',
        data: {
          streams: ['logs', 'metrics', 'performance', 'security', 'health']
        }
      };

      this.ws.send(JSON.stringify(subscriptionMessage));
      console.log('📤 Sent subscription request');
    });
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(50));
    console.log('📋 Test Results Summary:');
    console.log('='.repeat(50));

    console.log(`Connection Test: ${this.testResults.connectionSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Ping/Pong Test: ${this.testResults.pingPongSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Subscription Test: ${this.testResults.subscriptionSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Messages Received: ${this.testResults.messagesReceived}`);
    console.log(`Messages/Second: ${this.testResults.messagesPerSecond}`);

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    const passedTests = [
      this.testResults.connectionSuccess,
      this.testResults.pingPongSuccess,
      this.testResults.subscriptionSuccess,
      this.testResults.messagesReceived > 0
    ].filter(Boolean).length;

    const totalTests = 4;
    const successRate = (passedTests / totalTests) * 100;

    console.log(`\n📊 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`);

    if (successRate >= 75) {
      console.log('🎉 WebSocket server is working well!');
    } else if (successRate >= 50) {
      console.log('⚠️  WebSocket server has some issues but is partially functional');
    } else {
      console.log('❌ WebSocket server has significant issues');
    }

    console.log('\n✨ Testing complete!');
  }
}

// CLI execution
async function main(): Promise<void> {
  const serverUrl = process.env.WEBSOCKET_URL || 'ws://localhost:8765';
  const tester = new WebSocketTester(serverUrl);

  try {
    const results = await tester.runTests();

    // Exit with appropriate code
    const hasErrors = results.errors.length > 0 || !results.connectionSuccess;
    process.exit(hasErrors ? 1 : 0);

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { WebSocketTester };
export type { TestResults };
