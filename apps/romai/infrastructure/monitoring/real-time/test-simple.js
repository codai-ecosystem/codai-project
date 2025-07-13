/**
 * Simple WebSocket Test Client for ROMAI Real-time Server
 */

const WebSocket = require('ws');

class SimpleTestClient {
  constructor(url = 'ws://localhost:8765') {
    this.url = url;
    this.ws = null;
    this.connected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Connecting to ${this.url}...`);

      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        this.connected = true;
        console.log('✅ Connected to ROMAI server');
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          console.log('📨 Received:', JSON.stringify(message, null, 2));
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

  send(message) {
    if (this.connected && this.ws) {
      this.ws.send(JSON.stringify(message));
      console.log('📤 Sent:', JSON.stringify(message, null, 2));
    } else {
      console.log('❌ Not connected');
    }
  }

  ping() {
    this.send({ type: 'ping' });
  }

  subscribe(streams) {
    this.send({ type: 'subscribe', streams: streams });
  }

  getStatus() {
    this.send({ type: 'get_status' });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Test function
async function runTest() {
  const client = new SimpleTestClient();

  try {
    await client.connect();

    // Test ping
    console.log('\n🏓 Testing ping...');
    client.ping();

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Subscribe to streams
    console.log('\n📡 Subscribing to streams...');
    client.subscribe(['logs', 'metrics', 'performance', 'health']);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get status
    console.log('\n📊 Getting status...');
    client.getStatus();

    // Listen for 10 seconds
    console.log('\n🎧 Listening for real-time data for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('\n✅ Test completed successfully!');
    client.disconnect();

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTest();
}

module.exports = { SimpleTestClient };
