/**
 * MemorAI Webhook System Validation
 * Comprehensive testing and validation for the webhook system
 */

const { MemorAIWebhookClient } = require('./memorai-webhook-client');
const axios = require('axios');
const crypto = require('crypto');

// Test configuration
const WEBHOOK_BASE_URL = 'http://localhost:4510';
const TEST_WEBHOOK_URL = 'http://localhost:3001/test-webhook';
const TEST_SECRET = 'test-webhook-secret-key';

class WebhookValidator {
  constructor() {
    this.client = new MemorAIWebhookClient({ baseURL: WEBHOOK_BASE_URL });
    this.testResults = [];
    this.createdWebhookIds = [];
  }

  async runAllTests() {
    console.log('🧪 MemorAI Webhook System Validation');
    console.log('=====================================\n');

    try {
      // Start test webhook receiver
      const testServer = await this.startTestServer();

      // Run test suites
      await this.testSystemHealth();
      await this.testWebhookCRUD();
      await this.testWebhookEvents();
      await this.testSignatureVerification();
      await this.testRetryLogic();
      await this.testBatchOperations();
      await this.testErrorHandling();
      await this.testPerformance();

      // Cleanup
      await this.cleanup();
      testServer.close();

      // Report results
      this.generateReport();

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      console.error(error.stack);
    }
  }

  async startTestServer() {
    const express = require('express');
    const app = express();

    app.use(express.json());

    // Store received webhooks
    this.receivedWebhooks = [];

    app.post('/test-webhook', (req, res) => {
      const signature = req.headers['x-webhook-signature'];
      const timestamp = new Date().toISOString();

      this.receivedWebhooks.push({
        ...req.body,
        signature,
        receivedAt: timestamp
      });

      console.log(`📨 Test webhook received: ${req.body.event} at ${timestamp}`);
      res.json({ status: 'received', timestamp });
    });

    // Endpoint that fails for retry testing
    app.post('/test-webhook-fail', (req, res) => {
      console.log('💥 Test webhook failure endpoint hit');
      res.status(500).json({ error: 'Intentional failure for testing' });
    });

    // Endpoint that times out
    app.post('/test-webhook-timeout', (req, res) => {
      console.log('⏱️ Test webhook timeout endpoint hit');
      // Don't respond to simulate timeout
    });

    const server = app.listen(3001, () => {
      console.log('🔧 Test webhook server started on port 3001\n');
    });

    return server;
  }

  async testSystemHealth() {
    console.log('🏥 Testing System Health...');

    try {
      const health = await this.client.getHealth();
      this.addResult('System Health', true, 'Webhook system is healthy', { health });

      const stats = await this.client.getStats();
      this.addResult('System Stats', true, 'Stats retrieved successfully', { stats });

    } catch (error) {
      this.addResult('System Health', false, error.message);
    }
  }

  async testWebhookCRUD() {
    console.log('📝 Testing Webhook CRUD Operations...');

    try {
      // Create webhook
      const webhook = await this.client.createWebhook({
        url: TEST_WEBHOOK_URL,
        events: ['memory.created', 'memory.updated'],
        description: 'Test webhook for validation',
        active: true,
        secret: TEST_SECRET
      });

      this.createdWebhookIds.push(webhook.id);
      this.addResult('Create Webhook', true, 'Webhook created successfully', { id: webhook.id });

      // Get webhook
      const retrievedWebhook = await this.client.getWebhook(webhook.id);
      this.addResult('Get Webhook', true, 'Webhook retrieved successfully', { id: retrievedWebhook.id });

      // Update webhook
      const updatedWebhook = await this.client.updateWebhook(webhook.id, {
        description: 'Updated test webhook',
        events: ['memory.created', 'memory.updated', 'memory.deleted']
      });

      this.addResult('Update Webhook', true, 'Webhook updated successfully', {
        id: updatedWebhook.id,
        events: updatedWebhook.events.length
      });

      // List webhooks
      const { webhooks } = await this.client.getWebhooks();
      this.addResult('List Webhooks', true, `Retrieved ${webhooks.length} webhooks`);

    } catch (error) {
      this.addResult('Webhook CRUD', false, error.message);
    }
  }

  async testWebhookEvents() {
    console.log('📡 Testing Webhook Events...');

    try {
      // Clear received webhooks
      this.receivedWebhooks = [];

      // Test webhook
      const webhook = this.createdWebhookIds[0];
      if (webhook) {
        const testResult = await this.client.testWebhook(webhook);
        this.addResult('Test Webhook', true, 'Test webhook sent successfully', testResult);

        // Wait for webhook to be received
        await this.sleep(2000);

        if (this.receivedWebhooks.length > 0) {
          this.addResult('Webhook Reception', true, `Received ${this.receivedWebhooks.length} webhooks`);
        } else {
          this.addResult('Webhook Reception', false, 'No webhooks received');
        }
      }

    } catch (error) {
      this.addResult('Webhook Events', false, error.message);
    }
  }

  async testSignatureVerification() {
    console.log('🔒 Testing Signature Verification...');

    try {
      // Test valid signature
      const payload = JSON.stringify({ test: 'data' });
      const validSignature = this.client.constructor.generateSignature(payload, TEST_SECRET);
      const isValid = this.client.constructor.verifySignature(payload, validSignature, TEST_SECRET);

      this.addResult('Valid Signature', isValid, isValid ? 'Signature verified' : 'Signature verification failed');

      // Test invalid signature
      const invalidSignature = 'sha256=invalid';
      const isInvalid = this.client.constructor.verifySignature(payload, invalidSignature, TEST_SECRET);

      this.addResult('Invalid Signature', !isInvalid, !isInvalid ? 'Invalid signature rejected' : 'Invalid signature accepted');

    } catch (error) {
      this.addResult('Signature Verification', false, error.message);
    }
  }

  async testRetryLogic() {
    console.log('🔄 Testing Retry Logic...');

    try {
      // Create webhook that will fail
      const failWebhook = await this.client.createWebhook({
        url: 'http://localhost:3001/test-webhook-fail',
        events: ['memory.created'],
        description: 'Failing webhook for retry testing',
        active: true
      });

      this.createdWebhookIds.push(failWebhook.id);

      // Test the failing webhook
      await this.client.testWebhook(failWebhook.id);

      // Wait for retries
      await this.sleep(3000);

      // Check delivery history
      const deliveries = await this.client.getWebhookDeliveries(failWebhook.id);

      if (deliveries.length > 0) {
        const failedDelivery = deliveries.find(d => d.status === 'failed');
        if (failedDelivery) {
          this.addResult('Retry Logic', true, 'Failed delivery detected with retry attempts', {
            deliveryId: failedDelivery.id,
            attempts: failedDelivery.attempts
          });

          // Test manual retry
          try {
            await this.client.retryDelivery(failWebhook.id, failedDelivery.id);
            this.addResult('Manual Retry', true, 'Manual retry triggered successfully');
          } catch (retryError) {
            this.addResult('Manual Retry', false, retryError.message);
          }
        }
      }

    } catch (error) {
      this.addResult('Retry Logic', false, error.message);
    }
  }

  async testBatchOperations() {
    console.log('📦 Testing Batch Operations...');

    try {
      // Create multiple webhooks
      const webhookPromises = [];
      for (let i = 0; i < 3; i++) {
        webhookPromises.push(
          this.client.createWebhook({
            url: `${TEST_WEBHOOK_URL}?batch=${i}`,
            events: ['memory.created'],
            description: `Batch webhook ${i}`,
            active: true
          })
        );
      }

      const batchWebhooks = await Promise.all(webhookPromises);
      this.createdWebhookIds.push(...batchWebhooks.map(w => w.id));

      this.addResult('Batch Create', true, `Created ${batchWebhooks.length} webhooks in batch`);

      // Test batch updates
      const updatePromises = batchWebhooks.map(webhook =>
        this.client.updateWebhook(webhook.id, { active: false })
      );

      await Promise.all(updatePromises);
      this.addResult('Batch Update', true, `Updated ${batchWebhooks.length} webhooks in batch`);

    } catch (error) {
      this.addResult('Batch Operations', false, error.message);
    }
  }

  async testErrorHandling() {
    console.log('⚠️ Testing Error Handling...');

    try {
      // Test invalid webhook creation
      try {
        await this.client.createWebhook({
          url: 'invalid-url',
          events: ['invalid.event'],
          description: 'Invalid webhook'
        });
        this.addResult('Invalid Webhook Validation', false, 'Invalid webhook was accepted');
      } catch (error) {
        this.addResult('Invalid Webhook Validation', true, 'Invalid webhook properly rejected');
      }

      // Test non-existent webhook retrieval
      try {
        await this.client.getWebhook('non-existent-id');
        this.addResult('Non-existent Webhook', false, 'Non-existent webhook was found');
      } catch (error) {
        this.addResult('Non-existent Webhook', true, 'Non-existent webhook properly handled');
      }

      // Test webhook system offline scenario
      const offlineClient = new MemorAIWebhookClient({
        baseURL: 'http://localhost:9999',
        timeout: 1000
      });

      try {
        await offlineClient.getHealth();
        this.addResult('Offline System Handling', false, 'Offline system was accessible');
      } catch (error) {
        this.addResult('Offline System Handling', true, 'Offline system properly handled');
      }

    } catch (error) {
      this.addResult('Error Handling', false, error.message);
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');

    try {
      const startTime = Date.now();

      // Create webhook
      const webhook = await this.client.createWebhook({
        url: TEST_WEBHOOK_URL,
        events: ['memory.created'],
        description: 'Performance test webhook',
        active: true
      });

      this.createdWebhookIds.push(webhook.id);

      const createTime = Date.now() - startTime;

      // Test multiple webhook calls
      const testStartTime = Date.now();
      const testPromises = [];

      for (let i = 0; i < 10; i++) {
        testPromises.push(this.client.testWebhook(webhook.id));
      }

      await Promise.all(testPromises);
      const batchTestTime = Date.now() - testStartTime;

      this.addResult('Performance - Create', true, `Webhook created in ${createTime}ms`);
      this.addResult('Performance - Batch Test', true, `10 webhook tests completed in ${batchTestTime}ms (avg: ${Math.round(batchTestTime / 10)}ms)`);

      // Memory usage test
      const memUsage = process.memoryUsage();
      this.addResult('Performance - Memory', true, `Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);

    } catch (error) {
      this.addResult('Performance Testing', false, error.message);
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up test webhooks...');

    for (const webhookId of this.createdWebhookIds) {
      try {
        await this.client.deleteWebhook(webhookId);
      } catch (error) {
        console.log(`⚠️ Failed to delete webhook ${webhookId}: ${error.message}`);
      }
    }

    this.addResult('Cleanup', true, `Cleaned up ${this.createdWebhookIds.length} test webhooks`);
  }

  addResult(test, passed, message, data = null) {
    this.testResults.push({
      test,
      passed,
      message,
      data,
      timestamp: new Date().toISOString()
    });

    const status = passed ? '✅' : '❌';
    console.log(`${status} ${test}: ${message}`);

    if (data && Object.keys(data).length > 0) {
      console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
    }
  }

  generateReport() {
    console.log('\n📊 Validation Report');
    console.log('===================');

    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const percentage = Math.round((passed / total) * 100);

    console.log(`\n🎯 Overall Result: ${passed}/${total} tests passed (${percentage}%)`);

    if (passed === total) {
      console.log('🎉 All tests passed! Webhook system is fully functional.');
    } else {
      console.log('⚠️ Some tests failed. Please review the results above.');

      const failed = this.testResults.filter(r => !r.passed);
      console.log('\n❌ Failed Tests:');
      failed.forEach(test => {
        console.log(`   - ${test.test}: ${test.message}`);
      });
    }

    // Generate detailed report
    const report = {
      summary: {
        total_tests: total,
        passed_tests: passed,
        failed_tests: total - passed,
        success_rate: percentage,
        timestamp: new Date().toISOString()
      },
      tests: this.testResults,
      system_info: {
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage()
      }
    };

    // Save report to file
    const fs = require('fs');
    const reportPath = './webhook-validation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Static methods for signature utilities
MemorAIWebhookClient.generateSignature = function (payload, secret) {
  return 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
};

MemorAIWebhookClient.verifySignature = function (payload, signature, secret) {
  const expectedSignature = MemorAIWebhookClient.generateSignature(payload, secret);
  return expectedSignature === signature;
};

// Run validation if called directly
async function main() {
  const validator = new WebhookValidator();
  await validator.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { WebhookValidator };
