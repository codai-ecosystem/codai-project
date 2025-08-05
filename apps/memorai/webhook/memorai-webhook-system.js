/**
 * MemorAI Webhook System
 * Provides webhook infrastructure for external integrations
 * Phase 3 Task 9.5
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class WebhookSystem extends EventEmitter {
  constructor(options = {}) {
    super();
    this.port = options.port || 4510;
    this.webhooks = new Map();
    this.eventQueue = [];
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.secretKey = options.secretKey || process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');
    this.app = express();
    this.server = null;

    // Webhook storage file
    this.webhooksFile = path.join(__dirname, 'webhooks.json');

    this.setupMiddleware();
    this.setupRoutes();
    this.loadWebhooks();
  }

  setupMiddleware() {
    // Raw body parser for webhook signature verification
    this.app.use('/webhook', express.raw({ type: 'application/json' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Webhook-Signature');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'MemorAI Webhook System',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        webhooks: this.webhooks.size,
        uptime: process.uptime()
      });
    });

    // List webhooks
    this.app.get('/webhooks', (req, res) => {
      const webhookList = Array.from(this.webhooks.values()).map(webhook => ({
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        active: webhook.active,
        createdAt: webhook.createdAt,
        lastTriggered: webhook.lastTriggered,
        triggerCount: webhook.triggerCount
      }));

      res.json({
        webhooks: webhookList,
        total: webhookList.length
      });
    });

    // Create webhook
    this.app.post('/webhooks', async (req, res) => {
      try {
        const { url, events, description, active = true } = req.body;

        if (!url || !events || !Array.isArray(events)) {
          return res.status(400).json({
            error: 'Missing required fields: url, events'
          });
        }

        const webhook = await this.createWebhook({ url, events, description, active });
        res.status(201).json(webhook);
      } catch (error) {
        console.error('Error creating webhook:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get webhook
    this.app.get('/webhooks/:id', (req, res) => {
      const webhook = this.webhooks.get(req.params.id);
      if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }
      res.json(webhook);
    });

    // Update webhook
    this.app.put('/webhooks/:id', async (req, res) => {
      try {
        const webhook = await this.updateWebhook(req.params.id, req.body);
        if (!webhook) {
          return res.status(404).json({ error: 'Webhook not found' });
        }
        res.json(webhook);
      } catch (error) {
        console.error('Error updating webhook:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Delete webhook
    this.app.delete('/webhooks/:id', async (req, res) => {
      try {
        const deleted = await this.deleteWebhook(req.params.id);
        if (!deleted) {
          return res.status(404).json({ error: 'Webhook not found' });
        }
        res.json({ message: 'Webhook deleted successfully' });
      } catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Test webhook
    this.app.post('/webhooks/:id/test', async (req, res) => {
      try {
        const webhook = this.webhooks.get(req.params.id);
        if (!webhook) {
          return res.status(404).json({ error: 'Webhook not found' });
        }

        const testPayload = {
          event: 'webhook.test',
          data: {
            message: 'This is a test webhook',
            timestamp: new Date().toISOString(),
            webhook_id: webhook.id
          },
          webhook: {
            id: webhook.id,
            url: webhook.url
          }
        };

        const result = await this.triggerWebhook(webhook, testPayload);
        res.json({
          message: 'Test webhook sent',
          result
        });
      } catch (error) {
        console.error('Error testing webhook:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Incoming webhook endpoint
    this.app.post('/webhook/:id', async (req, res) => {
      try {
        const webhookId = req.params.id;
        const signature = req.headers['x-webhook-signature'];

        // Verify signature if provided
        if (signature) {
          const expectedSignature = this.generateSignature(req.body);
          if (signature !== expectedSignature) {
            return res.status(401).json({ error: 'Invalid signature' });
          }
        }

        // Process incoming webhook
        const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        this.emit('webhook.received', {
          webhookId,
          payload,
          timestamp: new Date().toISOString()
        });

        res.json({ message: 'Webhook received successfully' });
      } catch (error) {
        console.error('Error processing incoming webhook:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Webhook delivery logs
    this.app.get('/webhooks/:id/deliveries', (req, res) => {
      const webhook = this.webhooks.get(req.params.id);
      if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      res.json({
        webhook_id: webhook.id,
        deliveries: webhook.deliveries || []
      });
    });

    // Stats endpoint
    this.app.get('/stats', (req, res) => {
      const stats = {
        total_webhooks: this.webhooks.size,
        active_webhooks: Array.from(this.webhooks.values()).filter(w => w.active).length,
        total_events: Array.from(this.webhooks.values()).reduce((sum, w) => sum + (w.triggerCount || 0), 0),
        event_queue_size: this.eventQueue.length,
        uptime: process.uptime(),
        memory_usage: process.memoryUsage()
      };

      res.json(stats);
    });
  }

  async createWebhook(data) {
    const webhook = {
      id: crypto.randomUUID(),
      url: data.url,
      events: data.events,
      description: data.description || '',
      active: data.active !== false,
      secret: crypto.randomBytes(16).toString('hex'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      triggerCount: 0,
      lastTriggered: null,
      deliveries: []
    };

    this.webhooks.set(webhook.id, webhook);
    await this.saveWebhooks();

    this.emit('webhook.created', webhook);
    return webhook;
  }

  async updateWebhook(id, updates) {
    const webhook = this.webhooks.get(id);
    if (!webhook) return null;

    const updatedWebhook = {
      ...webhook,
      ...updates,
      id, // Prevent ID changes
      updatedAt: new Date().toISOString()
    };

    this.webhooks.set(id, updatedWebhook);
    await this.saveWebhooks();

    this.emit('webhook.updated', updatedWebhook);
    return updatedWebhook;
  }

  async deleteWebhook(id) {
    const webhook = this.webhooks.get(id);
    if (!webhook) return false;

    this.webhooks.delete(id);
    await this.saveWebhooks();

    this.emit('webhook.deleted', { id, webhook });
    return true;
  }

  async triggerWebhook(webhook, payload) {
    if (!webhook.active) {
      return { success: false, error: 'Webhook is inactive' };
    }

    const delivery = {
      id: crypto.randomUUID(),
      webhook_id: webhook.id,
      event: payload.event,
      timestamp: new Date().toISOString(),
      payload,
      attempts: 0,
      success: false,
      response: null,
      error: null
    };

    let attempt = 0;
    while (attempt < this.retryAttempts) {
      try {
        delivery.attempts = attempt + 1;

        const signature = this.generateSignature(JSON.stringify(payload));
        const response = await axios.post(webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': payload.event,
            'X-Webhook-Delivery': delivery.id,
            'User-Agent': 'MemorAI-Webhook/1.0'
          },
          timeout: 10000
        });

        delivery.success = true;
        delivery.response = {
          status: response.status,
          headers: response.headers,
          data: response.data
        };

        // Update webhook stats
        webhook.triggerCount = (webhook.triggerCount || 0) + 1;
        webhook.lastTriggered = new Date().toISOString();

        break;
      } catch (error) {
        delivery.error = {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data
        };

        if (attempt < this.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
        }
        attempt++;
      }
    }

    // Store delivery log
    if (!webhook.deliveries) webhook.deliveries = [];
    webhook.deliveries.push(delivery);

    // Keep only last 100 deliveries
    if (webhook.deliveries.length > 100) {
      webhook.deliveries = webhook.deliveries.slice(-100);
    }

    await this.saveWebhooks();

    this.emit('webhook.delivered', delivery);
    return delivery;
  }

  async triggerEvent(eventName, data) {
    const webhooks = Array.from(this.webhooks.values()).filter(
      webhook => webhook.active && webhook.events.includes(eventName)
    );

    if (webhooks.length === 0) {
      console.log(`No webhooks found for event: ${eventName}`);
      return [];
    }

    const payload = {
      event: eventName,
      data,
      timestamp: new Date().toISOString()
    };

    const results = await Promise.allSettled(
      webhooks.map(webhook => this.triggerWebhook(webhook, payload))
    );

    return results.map((result, index) => ({
      webhook_id: webhooks[index].id,
      success: result.status === 'fulfilled',
      result: result.status === 'fulfilled' ? result.value : result.reason
    }));
  }

  generateSignature(payload) {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
  }

  async loadWebhooks() {
    try {
      const data = await fs.readFile(this.webhooksFile, 'utf8');
      const webhooks = JSON.parse(data);

      webhooks.forEach(webhook => {
        this.webhooks.set(webhook.id, webhook);
      });

      console.log(`Loaded ${webhooks.length} webhooks`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading webhooks:', error);
      }
    }
  }

  async saveWebhooks() {
    try {
      const webhooks = Array.from(this.webhooks.values());
      await fs.writeFile(this.webhooksFile, JSON.stringify(webhooks, null, 2));
    } catch (error) {
      console.error('Error saving webhooks:', error);
    }
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`🪝 MemorAI Webhook System listening on port ${this.port}`);
          console.log(`📋 Webhook Management: http://localhost:${this.port}/webhooks`);
          console.log(`🏥 Health Check: http://localhost:${this.port}/health`);
          resolve();
        }
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(resolve);
      } else {
        resolve();
      }
    });
  }
}

// Integration with MemorAI Events
class MemorAIWebhookIntegration {
  constructor(webhookSystem, memorAIConfig = {}) {
    this.webhookSystem = webhookSystem;
    this.memorAIBaseURL = memorAIConfig.baseURL || 'http://localhost:4006';
    this.setupMemorAIIntegration();
  }

  setupMemorAIIntegration() {
    // Memory events
    this.webhookSystem.on('memory.created', (data) => {
      this.webhookSystem.triggerEvent('memory.created', {
        memory: data,
        action: 'created',
        timestamp: new Date().toISOString()
      });
    });

    this.webhookSystem.on('memory.updated', (data) => {
      this.webhookSystem.triggerEvent('memory.updated', {
        memory: data,
        action: 'updated',
        timestamp: new Date().toISOString()
      });
    });

    this.webhookSystem.on('memory.deleted', (data) => {
      this.webhookSystem.triggerEvent('memory.deleted', {
        memory: data,
        action: 'deleted',
        timestamp: new Date().toISOString()
      });
    });

    // Search events
    this.webhookSystem.on('search.performed', (data) => {
      this.webhookSystem.triggerEvent('search.performed', {
        query: data.query,
        results: data.results,
        algorithm: data.algorithm,
        timestamp: new Date().toISOString()
      });
    });

    // Analytics events
    this.webhookSystem.on('analytics.generated', (data) => {
      this.webhookSystem.triggerEvent('analytics.generated', {
        type: data.type,
        data: data.data,
        timestamp: new Date().toISOString()
      });
    });

    // System events
    this.webhookSystem.on('system.error', (data) => {
      this.webhookSystem.triggerEvent('system.error', {
        error: data.error,
        context: data.context,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Helper methods to trigger events from MemorAI
  async notifyMemoryCreated(memory) {
    this.webhookSystem.emit('memory.created', memory);
  }

  async notifyMemoryUpdated(memory) {
    this.webhookSystem.emit('memory.updated', memory);
  }

  async notifyMemoryDeleted(memory) {
    this.webhookSystem.emit('memory.deleted', memory);
  }

  async notifySearchPerformed(searchData) {
    this.webhookSystem.emit('search.performed', searchData);
  }

  async notifyAnalyticsGenerated(analyticsData) {
    this.webhookSystem.emit('analytics.generated', analyticsData);
  }

  async notifySystemError(error, context) {
    this.webhookSystem.emit('system.error', { error, context });
  }
}

// Start the webhook system if run directly
if (require.main === module) {
  const webhookSystem = new WebhookSystem({
    port: process.env.WEBHOOK_PORT || 4510,
    secretKey: process.env.WEBHOOK_SECRET
  });

  const integration = new MemorAIWebhookIntegration(webhookSystem);

  webhookSystem.start().catch(console.error);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down webhook system...');
    await webhookSystem.stop();
    process.exit(0);
  });
}

module.exports = { WebhookSystem, MemorAIWebhookIntegration };
