/**
 * MemorAI Webhook Integration Examples
 * Demonstrates various webhook integration patterns
 */

const { MemorAIWebhookClient } = require('./memorai-webhook-client');
const crypto = require('crypto');

// Example 1: Basic webhook setup
async function basicWebhookSetup() {
  console.log('🔧 Setting up basic webhook integration...');

  const client = new MemorAIWebhookClient();

  try {
    // Create a webhook for memory events
    const webhook = await client.createWebhook({
      url: 'https://your-app.com/api/webhooks/memorai',
      events: ['memory.created', 'memory.updated', 'memory.deleted'],
      description: 'Memory management webhook',
      active: true
    });

    console.log('✅ Webhook created:', webhook.id);
    console.log('🔗 Webhook URL:', webhook.url);
    console.log('📡 Events:', webhook.events.join(', '));

    return webhook;
  } catch (error) {
    console.error('❌ Error creating webhook:', error.message);
  }
}

// Example 2: Slack integration
async function slackIntegration() {
  console.log('💬 Setting up Slack integration...');

  const client = new MemorAIWebhookClient();
  const slackWebhookURL = process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK';

  try {
    const webhook = await client.createWebhook({
      url: slackWebhookURL,
      events: ['memory.created', 'search.performed', 'system.error'],
      description: 'Slack notifications for MemorAI',
      active: true
    });

    console.log('✅ Slack webhook created:', webhook.id);

    // Test the webhook
    const testResult = await client.testWebhook(webhook.id);
    console.log('🧪 Test result:', testResult);

    return webhook;
  } catch (error) {
    console.error('❌ Error setting up Slack integration:', error.message);
  }
}

// Example 3: Analytics webhook
async function analyticsWebhook() {
  console.log('📊 Setting up analytics webhook...');

  const client = new MemorAIWebhookClient();

  try {
    const webhook = await client.createWebhook({
      url: 'https://analytics.your-app.com/memorai-events',
      events: ['analytics.generated', 'search.performed'],
      description: 'Analytics data collection',
      active: true
    });

    console.log('✅ Analytics webhook created:', webhook.id);
    return webhook;
  } catch (error) {
    console.error('❌ Error creating analytics webhook:', error.message);
  }
}

// Example 4: Webhook receiver (Express.js)
function createWebhookReceiver() {
  const express = require('express');
  const app = express();

  app.use(express.json());

  // Webhook verification middleware
  function verifyWebhook(req, res, next) {
    const signature = req.headers['x-webhook-signature'];
    const secret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

    if (signature) {
      const body = JSON.stringify(req.body);
      const isValid = MemorAIWebhookClient.verifySignature(body, signature, secret);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    next();
  }

  // MemorAI webhook endpoint
  app.post('/api/webhooks/memorai', verifyWebhook, (req, res) => {
    const { event, data, timestamp } = req.body;

    console.log(`📨 Received webhook: ${event} at ${timestamp}`);

    switch (event) {
      case 'memory.created':
        handleMemoryCreated(data);
        break;
      case 'memory.updated':
        handleMemoryUpdated(data);
        break;
      case 'memory.deleted':
        handleMemoryDeleted(data);
        break;
      case 'search.performed':
        handleSearchPerformed(data);
        break;
      case 'analytics.generated':
        handleAnalyticsGenerated(data);
        break;
      case 'system.error':
        handleSystemError(data);
        break;
      default:
        console.log(`⚠️ Unknown event: ${event}`);
    }

    res.json({ message: 'Webhook processed successfully' });
  });

  function handleMemoryCreated(data) {
    console.log('🆕 New memory created:', data.memory?.content?.substring(0, 50) + '...');
    // Add your logic here (e.g., send notification, update database)
  }

  function handleMemoryUpdated(data) {
    console.log('📝 Memory updated:', data.memory?.id);
    // Add your logic here
  }

  function handleMemoryDeleted(data) {
    console.log('🗑️ Memory deleted:', data.memory?.id);
    // Add your logic here
  }

  function handleSearchPerformed(data) {
    console.log('🔍 Search performed:', data.query);
    console.log(`📊 Results: ${data.results?.length || 0} items found`);
    // Add your logic here (e.g., analytics tracking)
  }

  function handleAnalyticsGenerated(data) {
    console.log('📈 Analytics generated:', data.type);
    // Add your logic here (e.g., dashboard updates)
  }

  function handleSystemError(data) {
    console.error('🚨 System error reported:', data.error?.message);
    // Add your logic here (e.g., alert administrators)
  }

  return app;
}

// Example 5: Webhook management dashboard
async function webhookDashboard() {
  console.log('📋 Webhook Dashboard');
  console.log('===================');

  const client = new MemorAIWebhookClient();

  try {
    // Get all webhooks
    const { webhooks } = await client.getWebhooks();

    console.log(`\n📊 Total Webhooks: ${webhooks.length}`);

    webhooks.forEach((webhook, index) => {
      console.log(`\n${index + 1}. ${webhook.description || 'Unnamed webhook'}`);
      console.log(`   ID: ${webhook.id}`);
      console.log(`   URL: ${webhook.url}`);
      console.log(`   Events: ${webhook.events.join(', ')}`);
      console.log(`   Status: ${webhook.active ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   Triggers: ${webhook.triggerCount || 0}`);
      console.log(`   Last Triggered: ${webhook.lastTriggered || 'Never'}`);
    });

    // Get system stats
    const stats = await client.getStats();
    console.log('\n📈 System Statistics');
    console.log('===================');
    console.log(`Active Webhooks: ${stats.active_webhooks}/${stats.total_webhooks}`);
    console.log(`Total Events: ${stats.total_events}`);
    console.log(`Queue Size: ${stats.event_queue_size}`);
    console.log(`Uptime: ${Math.round(stats.uptime)}s`);

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error.message);
  }
}

// Example 6: Custom webhook transformer
class WebhookTransformer {
  static toSlack(event, data) {
    const basePayload = {
      username: 'MemorAI',
      icon_emoji: '🧠'
    };

    switch (event) {
      case 'memory.created':
        return {
          ...basePayload,
          text: `🆕 New memory created`,
          attachments: [{
            color: 'good',
            fields: [{
              title: 'Content',
              value: data.memory?.content?.substring(0, 100) + '...',
              short: false
            }, {
              title: 'Tags',
              value: data.memory?.tags?.join(', ') || 'None',
              short: true
            }]
          }]
        };

      case 'system.error':
        return {
          ...basePayload,
          text: `🚨 System Error Detected`,
          attachments: [{
            color: 'danger',
            fields: [{
              title: 'Error',
              value: data.error?.message || 'Unknown error',
              short: false
            }, {
              title: 'Context',
              value: data.context || 'No context provided',
              short: false
            }]
          }]
        };

      default:
        return {
          ...basePayload,
          text: `📡 MemorAI Event: ${event}`,
          attachments: [{
            color: 'warning',
            text: JSON.stringify(data, null, 2)
          }]
        };
    }
  }

  static toDiscord(event, data) {
    const basePayload = {
      username: 'MemorAI',
      avatar_url: 'https://your-app.com/memorai-avatar.png'
    };

    switch (event) {
      case 'memory.created':
        return {
          ...basePayload,
          embeds: [{
            title: '🆕 New Memory Created',
            description: data.memory?.content?.substring(0, 200) + '...',
            color: 3066993, // Green
            fields: [{
              name: 'Tags',
              value: data.memory?.tags?.join(', ') || 'None',
              inline: true
            }],
            timestamp: data.timestamp
          }]
        };

      case 'search.performed':
        return {
          ...basePayload,
          embeds: [{
            title: '🔍 Search Performed',
            description: `Query: "${data.query}"`,
            color: 3447003, // Blue
            fields: [{
              name: 'Results',
              value: `${data.results?.length || 0} items found`,
              inline: true
            }, {
              name: 'Algorithm',
              value: data.algorithm || 'Unknown',
              inline: true
            }],
            timestamp: data.timestamp
          }]
        };

      default:
        return {
          ...basePayload,
          embeds: [{
            title: `📡 ${event}`,
            description: 'MemorAI Event Notification',
            color: 15158332, // Orange
            fields: [{
              name: 'Data',
              value: '```json\n' + JSON.stringify(data, null, 2).substring(0, 500) + '\n```'
            }],
            timestamp: new Date().toISOString()
          }]
        };
    }
  }
}

// Run examples
async function runExamples() {
  console.log('🎯 MemorAI Webhook Integration Examples');
  console.log('=====================================\n');

  // Check if webhook system is running
  const client = new MemorAIWebhookClient();
  try {
    await client.getHealth();
    console.log('✅ Webhook system is running\n');
  } catch (error) {
    console.log('❌ Webhook system is not running. Please start it first.\n');
    return;
  }

  // Run examples
  await basicWebhookSetup();
  console.log();

  await analyticsWebhook();
  console.log();

  await webhookDashboard();
  console.log();

  console.log('🎉 Examples completed!');
  console.log('\n📚 Next Steps:');
  console.log('1. Customize webhook URLs for your applications');
  console.log('2. Implement webhook receivers in your services');
  console.log('3. Use webhook transformers for different platforms');
  console.log('4. Monitor webhook deliveries and handle failures');
}

// Export examples
module.exports = {
  basicWebhookSetup,
  slackIntegration,
  analyticsWebhook,
  createWebhookReceiver,
  webhookDashboard,
  WebhookTransformer,
  runExamples
};

// Run examples if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}
