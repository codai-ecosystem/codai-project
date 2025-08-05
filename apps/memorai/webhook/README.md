# MemorAI Webhook System Documentation

## Overview

The MemorAI Webhook System provides real-time event notifications for external integrations. It enables your applications to receive instant updates when events occur in the MemorAI platform.

## Features

- 🔄 **Real-time Events**: Instant notifications for memory operations, searches, and system events
- 🔒 **Secure Delivery**: HMAC signature verification for webhook authenticity
- 🔁 **Retry Logic**: Automatic retry with exponential backoff for failed deliveries
- 📊 **Delivery Tracking**: Complete logging and monitoring of webhook deliveries
- 🎯 **Event Filtering**: Subscribe to specific events that matter to your application
- 🧪 **Testing Tools**: Built-in webhook testing and validation

## Quick Start

### 1. Start the Webhook System

```bash
# From the webhook directory
cd apps/memorai/webhook
node memorai-webhook-system.js
```

The webhook system will start on port 4510.

### 2. Create Your First Webhook

```javascript
const { MemorAIWebhookClient } = require('./memorai-webhook-client');

const client = new MemorAIWebhookClient();

const webhook = await client.createWebhook({
  url: 'https://your-app.com/api/webhooks/memorai',
  events: ['memory.created', 'memory.updated'],
  description: 'My MemorAI Integration',
  active: true
});

console.log('Webhook created:', webhook.id);
```

### 3. Handle Webhook Events

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/webhooks/memorai', (req, res) => {
  const { event, data, timestamp } = req.body;
  
  switch (event) {
    case 'memory.created':
      console.log('New memory:', data.memory.content);
      break;
    case 'memory.updated':
      console.log('Memory updated:', data.memory.id);
      break;
  }
  
  res.json({ status: 'received' });
});

app.listen(3000);
```

## API Reference

### Webhook Client

The `MemorAIWebhookClient` provides methods to manage webhooks programmatically.

#### Constructor

```javascript
const client = new MemorAIWebhookClient(options);
```

**Options:**
- `baseURL`: Webhook system URL (default: 'http://localhost:4510')
- `timeout`: Request timeout in milliseconds (default: 5000)

#### Methods

##### createWebhook(webhookData)

Creates a new webhook subscription.

```javascript
const webhook = await client.createWebhook({
  url: 'https://your-app.com/webhook',
  events: ['memory.created', 'search.performed'],
  description: 'My webhook',
  active: true,
  secret: 'optional-secret-for-signatures'
});
```

**Parameters:**
- `url` (string): The endpoint URL to receive webhook events
- `events` (string[]): Array of event types to subscribe to
- `description` (string): Human-readable description
- `active` (boolean): Whether the webhook is active
- `secret` (string, optional): Secret for HMAC signature verification

**Returns:** Webhook object with `id`, `url`, `events`, etc.

##### getWebhooks(params)

Retrieves webhooks with optional filtering.

```javascript
const { webhooks, total } = await client.getWebhooks({
  active: true,
  limit: 10,
  offset: 0
});
```

**Parameters:**
- `active` (boolean, optional): Filter by active status
- `limit` (number, optional): Maximum number of webhooks to return
- `offset` (number, optional): Number of webhooks to skip

##### getWebhook(id)

Retrieves a specific webhook by ID.

```javascript
const webhook = await client.getWebhook('webhook-id');
```

##### updateWebhook(id, updates)

Updates an existing webhook.

```javascript
const webhook = await client.updateWebhook('webhook-id', {
  active: false,
  events: ['memory.created']
});
```

##### deleteWebhook(id)

Deletes a webhook.

```javascript
const result = await client.deleteWebhook('webhook-id');
```

##### testWebhook(id)

Sends a test event to a webhook.

```javascript
const result = await client.testWebhook('webhook-id');
```

##### getWebhookDeliveries(id, params)

Retrieves delivery history for a webhook.

```javascript
const deliveries = await client.getWebhookDeliveries('webhook-id', {
  limit: 50,
  status: 'success'
});
```

##### retryDelivery(id, deliveryId)

Retries a failed webhook delivery.

```javascript
const result = await client.retryDelivery('webhook-id', 'delivery-id');
```

##### getStats()

Retrieves system statistics.

```javascript
const stats = await client.getStats();
// Returns: { active_webhooks, total_webhooks, total_events, uptime, etc. }
```

## Event Types

### Memory Events

#### memory.created
Triggered when a new memory is created.

```json
{
  "event": "memory.created",
  "data": {
    "memory": {
      "id": "mem_123",
      "content": "Memory content",
      "tags": ["tag1", "tag2"],
      "created_at": "2025-01-18T12:00:00Z"
    },
    "user_id": "user_456"
  },
  "timestamp": "2025-01-18T12:00:00Z"
}
```

#### memory.updated
Triggered when a memory is updated.

```json
{
  "event": "memory.updated",
  "data": {
    "memory": {
      "id": "mem_123",
      "content": "Updated content",
      "tags": ["new-tag"],
      "updated_at": "2025-01-18T12:00:00Z"
    },
    "changes": ["content", "tags"],
    "user_id": "user_456"
  },
  "timestamp": "2025-01-18T12:00:00Z"
}
```

#### memory.deleted
Triggered when a memory is deleted.

```json
{
  "event": "memory.deleted",
  "data": {
    "memory": {
      "id": "mem_123",
      "content": "Deleted content"
    },
    "user_id": "user_456"
  },
  "timestamp": "2025-01-18T12:00:00Z"
}
```

### Search Events

#### search.performed
Triggered when a search operation is performed.

```json
{
  "event": "search.performed",
  "data": {
    "query": "search term",
    "algorithm": "semantic",
    "results": [
      {
        "id": "mem_123",
        "content": "Matching memory",
        "score": 0.95
      }
    ],
    "total_results": 5,
    "execution_time": 45,
    "user_id": "user_456"
  },
  "timestamp": "2025-01-18T12:00:00Z"
}
```

### Analytics Events

#### analytics.generated
Triggered when analytics data is generated.

```json
{
  "event": "analytics.generated",
  "data": {
    "type": "dashboard_data",
    "metrics": {
      "total_memories": 1500,
      "search_performance": 98.5,
      "user_activity": 145
    },
    "period": "daily"
  },
  "timestamp": "2025-01-18T12:00:00Z"
}
```

### System Events

#### system.error
Triggered when a system error occurs.

```json
{
  "event": "system.error",
  "data": {
    "error": {
      "message": "Database connection failed",
      "code": "DB_CONN_ERROR",
      "stack": "Error stack trace..."
    },
    "context": {
      "operation": "memory.create",
      "user_id": "user_456"
    },
    "severity": "high"
  },
  "timestamp": "2025-01-18T12:00:00Z"
}
```

#### system.health
Triggered for system health updates.

```json
{
  "event": "system.health",
  "data": {
    "status": "healthy",
    "metrics": {
      "memory_usage": 85.2,
      "cpu_usage": 12.5,
      "response_time": 45
    },
    "services": {
      "database": "healthy",
      "search": "healthy",
      "analytics": "degraded"
    }
  },
  "timestamp": "2025-01-18T12:00:00Z"
}
```

## Security

### Signature Verification

Webhooks can be secured using HMAC-SHA256 signatures:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, 'your-secret')) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook...
});
```

### Best Practices

1. **Always verify signatures** when using webhook secrets
2. **Implement idempotency** to handle duplicate deliveries
3. **Return 2xx status codes** quickly to acknowledge receipt
4. **Process events asynchronously** to avoid timeouts
5. **Log webhook events** for debugging and monitoring

## Error Handling

### Retry Logic

The webhook system automatically retries failed deliveries:

- **Initial retry**: After 1 second
- **Subsequent retries**: Exponential backoff (2s, 4s, 8s, 16s, 32s)
- **Maximum retries**: 5 attempts
- **Timeout**: 30 seconds per request

### Delivery Status

Webhook deliveries can have the following statuses:

- `pending`: Delivery in progress
- `success`: Successfully delivered (2xx response)
- `failed`: Delivery failed (non-2xx response or timeout)
- `retrying`: Retry attempt in progress

### Monitoring Failures

Monitor webhook failures and take action:

```javascript
// Get failed deliveries
const deliveries = await client.getWebhookDeliveries('webhook-id', {
  status: 'failed',
  limit: 100
});

// Retry failed deliveries
for (const delivery of deliveries) {
  await client.retryDelivery('webhook-id', delivery.id);
}
```

## Integration Examples

### Slack Integration

```javascript
async function setupSlackWebhook() {
  const webhook = await client.createWebhook({
    url: process.env.SLACK_WEBHOOK_URL,
    events: ['memory.created', 'system.error'],
    description: 'Slack notifications'
  });
  
  return webhook;
}

// Transform events for Slack
function transformForSlack(event, data) {
  switch (event) {
    case 'memory.created':
      return {
        text: `🧠 New memory created: ${data.memory.content.substring(0, 100)}...`,
        username: 'MemorAI'
      };
    case 'system.error':
      return {
        text: `🚨 Error: ${data.error.message}`,
        username: 'MemorAI',
        color: 'danger'
      };
  }
}
```

### Discord Integration

```javascript
async function setupDiscordWebhook() {
  const webhook = await client.createWebhook({
    url: process.env.DISCORD_WEBHOOK_URL,
    events: ['memory.created', 'search.performed'],
    description: 'Discord notifications'
  });
  
  return webhook;
}
```

### Custom Analytics

```javascript
async function setupAnalyticsWebhook() {
  const webhook = await client.createWebhook({
    url: 'https://analytics.myapp.com/memorai-events',
    events: ['search.performed', 'analytics.generated'],
    description: 'Analytics tracking'
  });
  
  return webhook;
}
```

## Development & Testing

### Running Tests

```bash
# Test webhook system
node validate-webhook.js

# Run integration examples
node webhook-examples.js
```

### Development Mode

For development, you can use ngrok to expose your local webhook endpoint:

```bash
# Install ngrok
npm install -g ngrok

# Expose your webhook endpoint
ngrok http 3000

# Use the ngrok URL in your webhook configuration
```

### Debugging

Enable debug logging:

```javascript
const client = new MemorAIWebhookClient({
  debug: true
});
```

## Troubleshooting

### Common Issues

#### Webhook Not Receiving Events

1. Check if the webhook URL is accessible
2. Verify the webhook is active
3. Check event subscriptions
4. Review webhook logs

#### Failed Deliveries

1. Check webhook endpoint response status
2. Verify response time (< 30 seconds)
3. Check for network connectivity issues
4. Review webhook endpoint logs

#### Signature Verification Failures

1. Ensure secret matches on both ends
2. Check payload formatting
3. Verify HMAC calculation
4. Check header name (`x-webhook-signature`)

### Getting Help

1. Check webhook delivery logs
2. Use the test webhook feature
3. Review system statistics
4. Enable debug logging

## Configuration

### Environment Variables

```bash
# Webhook system configuration
WEBHOOK_PORT=4510
WEBHOOK_SECRET=your-default-secret
MEMORAI_API_URL=http://localhost:4006

# Webhook storage (optional)
WEBHOOK_DB_URL=sqlite:./webhooks.db

# Logging
WEBHOOK_LOG_LEVEL=info
```

### System Limits

- Maximum webhooks per account: 100
- Maximum events per webhook: 50
- Maximum delivery attempts: 5
- Request timeout: 30 seconds
- Payload size limit: 1MB

## License

This webhook system is part of the MemorAI platform and follows the same licensing terms.
