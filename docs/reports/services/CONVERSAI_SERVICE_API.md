# ConversAI Service API Reference

## 🎯 Overview

ConversAI is an advanced AI conversation management service that provides multi-modal conversation capabilities, AI provider integration, real-time collaboration, and comprehensive analytics.

## 📋 Table of Contents

1. [Service Configuration](#service-configuration)
2. [Core Methods](#core-methods)
3. [Event System](#event-system)
4. [Type Definitions](#type-definitions)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## ⚙️ Service Configuration

### Initialization

```typescript
import { ConversaiService } from '@codai/conversai'

// Get singleton instance
const conversai = ConversaiService.getInstance()

// Initialize service (recommended)
const conversai = await ConversaiService.create()
```

### Configuration Options

```typescript
interface ConversationSettings {
  model: string                    // AI model to use (default: 'gpt-4')
  temperature: number              // Response creativity (0.0-1.0, default: 0.7)
  maxTokens: number               // Max response length (default: 4096)
  enableVoice: boolean            // Voice message support (default: false)
  enableVideo: boolean            // Video call support (default: false)
  enableScreenShare: boolean      // Screen sharing (default: false)
  enableDocuments: boolean        // Document upload (default: true)
  autoSave: boolean              // Auto-save conversations (default: true)
  realTimeSync: boolean          // Real-time sync (default: true)
  memoryIntegration: boolean     // MemorAI integration (default: true)
  analyticsEnabled: boolean      // Analytics tracking (default: true)
  customInstructions?: string    // Custom system instructions
  responseFormat?: string        // Response format ('markdown' | 'json' | 'text')
  safetyFilter?: boolean        // Content safety filter (default: true)
  moderationLevel?: string      // Moderation level ('low' | 'medium' | 'high')
}
```

## 🔧 Core Methods

### Conversation Management

#### `createConversation(userId: string, options?: CreateConversationOptions): Promise<Conversation>`

Creates a new conversation.

**Parameters**:
- `userId` (string): User identifier
- `options` (optional): Conversation configuration

**Example**:
```typescript
const conversation = await conversai.createConversation('user123', {
  title: 'Product Strategy Discussion',
  description: 'Planning our Q4 product roadmap',
  settings: {
    model: 'gpt-4',
    temperature: 0.8,
    memoryIntegration: true
  },
  context: {
    department: 'product',
    priority: 'high'
  }
})
```

#### `getConversation(conversationId: string, userId: string): Promise<Conversation | null>`

Retrieves a conversation by ID.

**Example**:
```typescript
const conversation = await conversai.getConversation('conv_123', 'user123')
if (conversation) {
  console.log(`Found conversation: ${conversation.title}`)
}
```

#### `updateConversation(conversationId: string, userId: string, updates: Partial<Conversation>): Promise<Conversation | null>`

Updates conversation properties.

**Example**:
```typescript
const updated = await conversai.updateConversation('conv_123', 'user123', {
  title: 'Updated Product Strategy',
  settings: {
    ...existingSettings,
    temperature: 0.9
  }
})
```

#### `deleteConversation(conversationId: string, userId: string): Promise<boolean>`

Soft-deletes a conversation (marks as deleted).

**Example**:
```typescript
const deleted = await conversai.deleteConversation('conv_123', 'user123')
console.log(`Conversation deleted: ${deleted}`)
```

#### `listConversations(userId: string, filters?: SearchFilters, limit?: number, offset?: number): Promise<PaginatedResponse<Conversation>>`

Lists user conversations with pagination and filtering.

**Example**:
```typescript
const result = await conversai.listConversations('user123', {
  status: 'active',
  titleContains: 'strategy',
  createdAfter: new Date('2024-01-01')
}, 20, 0)

console.log(`Found ${result.data.length} conversations`)
console.log(`Total: ${result.pagination.total}`)
```

### Message Management

#### `addMessage(conversationId: string, userId: string, content: string, options?: MessageOptions): Promise<ConversationMessage>`

Adds a message to a conversation.

**Parameters**:
- `conversationId` (string): Target conversation
- `userId` (string): Message author
- `content` (string): Message content
- `options` (optional): Message configuration

**Example**:
```typescript
const message = await conversai.addMessage(
  'conv_123',
  'user123',
  'What are the key metrics for Q4?',
  {
    type: 'text',
    role: 'user',
    metadata: {
      source: 'web_app',
      timestamp: new Date().toISOString()
    }
  }
)
```

#### `generateResponse(conversationId: string, userId: string, model?: string): Promise<ConversationMessage>`

Generates an AI response to the conversation.

**Example**:
```typescript
const aiResponse = await conversai.generateResponse(
  'conv_123',
  'user123',
  'gpt-4' // Optional model override
)

console.log(`AI responded: ${aiResponse.content}`)
```

### Analytics

#### `getConversationAnalytics(conversationId: string, userId: string): Promise<ConversationAnalytics | null>`

Retrieves conversation analytics and insights.

**Example**:
```typescript
const analytics = await conversai.getConversationAnalytics('conv_123', 'user123')

if (analytics) {
  console.log(`Messages: ${analytics.totalMessages}`)
  console.log(`Tokens: ${analytics.totalTokens}`)
  console.log(`Topics: ${analytics.topics.join(', ')}`)
  console.log(`Sentiment: ${analytics.sentiment}`)
  console.log(`Complexity: ${analytics.complexity}`)
}
```

### Service Status

#### `isReady: boolean` (getter)

Returns service initialization status.

#### `activeConversationCount: number` (getter)

Returns count of active conversations in memory.

#### `totalTokensProcessed: number` (getter)

Returns total tokens processed across all conversations.

**Example**:
```typescript
if (conversai.isReady) {
  console.log(`Active conversations: ${conversai.activeConversationCount}`)
  console.log(`Total tokens: ${conversai.totalTokensProcessed}`)
}
```

## 📡 Event System

ConversAI emits events for real-time updates and integrations.

### Available Events

```typescript
// Service lifecycle
conversai.on('initialized', (data) => {
  console.log('ConversAI service initialized:', data)
})

conversai.on('shutdown', (data) => {
  console.log('ConversAI service shutdown:', data)
})

// Conversation events
conversai.on('conversation.created', ({ conversation, userId }) => {
  console.log(`New conversation: ${conversation.id}`)
})

conversai.on('conversation.updated', ({ conversation, userId, updates }) => {
  console.log(`Conversation updated: ${conversation.id}`)
})

conversai.on('conversation.deleted', ({ conversationId, userId }) => {
  console.log(`Conversation deleted: ${conversationId}`)
})

conversai.on('conversation.accessed', ({ conversationId, userId }) => {
  console.log(`Conversation accessed: ${conversationId}`)
})

// Message events
conversai.on('message.added', ({ message, conversation }) => {
  console.log(`Message added: ${message.id}`)
  
  // Trigger external integrations
  if (message.role === 'user') {
    // Could trigger memory storage, analytics, etc.
  }
})

// Error events
conversai.on('error', ({ service, error, operation }) => {
  console.error(`ConversAI error in ${operation}:`, error)
})
```

### Event Integration Example

```typescript
// Integrate with MemorAI for automatic context storage
conversai.on('message.added', async ({ message, conversation }) => {
  if (message.role === 'user' && conversation.settings?.memoryIntegration) {
    // Store important user inputs in memory
    await memorai.storeMemory({
      content: message.content,
      userId: message.userId,
      context: {
        conversationId: conversation.id,
        conversationTitle: conversation.title
      },
      importance: 0.7,
      tags: ['conversation', 'user_input']
    })
  }
})

// Integrate with analytics service
conversai.on('conversation.created', ({ conversation }) => {
  analytics.track({
    event: 'conversation_created',
    userId: conversation.userId,
    properties: {
      conversationId: conversation.id,
      model: conversation.settings?.model,
      hasMemoryIntegration: conversation.settings?.memoryIntegration
    }
  })
})
```

## 📊 Type Definitions

### Core Types

```typescript
interface Conversation {
  id: string
  userId: string
  title: string
  description?: string
  status: 'active' | 'archived' | 'deleted'
  context?: ConversationContext
  settings?: ConversationSettings
  createdAt: Date
  updatedAt: Date
  messageCount: number
  totalTokens: number
}

interface ConversationMessage {
  id: string
  conversationId: string
  userId: string
  content: string
  type: 'text' | 'voice' | 'image' | 'file' | 'code'
  role: 'user' | 'assistant' | 'system'
  tokens?: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

interface ConversationAnalytics {
  conversationId: string
  totalMessages: number
  totalTokens: number
  averageResponseTime: number
  topics: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  complexity: 'low' | 'medium' | 'high'
  lastAnalyzedAt: Date
}
```

### Request Types

```typescript
interface CreateConversationOptions {
  title?: string
  description?: string
  context?: ConversationContext
  settings?: Partial<ConversationSettings>
}

interface MessageOptions {
  type?: 'text' | 'voice' | 'image' | 'file' | 'code'
  role?: 'user' | 'assistant' | 'system'
  metadata?: Record<string, any>
}

interface SearchFilters {
  status?: 'active' | 'archived' | 'deleted'
  createdAfter?: Date
  createdBefore?: Date
  titleContains?: string
  [key: string]: any
}
```

## 💡 Usage Examples

### Basic Conversation Flow

```typescript
async function basicConversationFlow() {
  const conversai = await ConversaiService.create()
  
  // 1. Create conversation
  const conversation = await conversai.createConversation('user123', {
    title: 'AI Assistant Chat',
    settings: {
      model: 'gpt-4',
      temperature: 0.7,
      memoryIntegration: true
    }
  })
  
  // 2. Add user message
  await conversai.addMessage(
    conversation.id,
    'user123',
    'Hello, I need help with project planning'
  )
  
  // 3. Generate AI response
  const response = await conversai.generateResponse(
    conversation.id,
    'user123'
  )
  
  console.log('AI Response:', response.content)
  
  // 4. Get analytics
  const analytics = await conversai.getConversationAnalytics(
    conversation.id,
    'user123'
  )
  
  console.log('Conversation Analytics:', analytics)
}
```

### Multi-Modal Conversation

```typescript
async function multiModalConversation() {
  const conversation = await conversai.createConversation('user123', {
    title: 'Multi-Modal Session',
    settings: {
      enableVoice: true,
      enableDocuments: true,
      enableVideo: true
    }
  })
  
  // Text message
  await conversai.addMessage(
    conversation.id,
    'user123',
    'Let me explain the project requirements',
    { type: 'text' }
  )
  
  // File attachment (conceptual)
  await conversai.addMessage(
    conversation.id,
    'user123',
    'requirements.pdf',
    { 
      type: 'file',
      metadata: {
        filename: 'requirements.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000
      }
    }
  )
  
  // Voice message (conceptual)
  await conversai.addMessage(
    conversation.id,
    'user123',
    'audio_message_transcript',
    {
      type: 'voice',
      metadata: {
        audioUrl: 'https://storage.example.com/audio/123.wav',
        duration: 30000, // milliseconds
        transcript: 'This is the audio transcript'
      }
    }
  )
}
```

### Conversation Templates (Future Enhancement)

```typescript
// Future feature: Conversation templates
async function useConversationTemplate() {
  const template = {
    name: 'Product Brainstorm',
    systemPrompt: 'You are a product strategist helping with brainstorming',
    userPromptTemplate: 'Help me brainstorm ideas for {{product_category}} targeting {{target_audience}}',
    settings: {
      model: 'gpt-4',
      temperature: 0.9, // Higher creativity for brainstorming
      maxTokens: 2000
    }
  }
  
  const conversation = await conversai.createConversationFromTemplate(
    'user123',
    template,
    {
      product_category: 'mobile apps',
      target_audience: 'young professionals'
    }
  )
}
```

## 🚨 Error Handling

### Common Error Patterns

```typescript
try {
  const conversation = await conversai.createConversation('user123', options)
} catch (error) {
  if (error.code === 'INVALID_USER') {
    console.error('User validation failed')
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.error('Too many requests')
  } else {
    console.error('Unexpected error:', error)
  }
}

// Handling service responses
const conversation = await conversai.getConversation('conv_123', 'user123')
if (!conversation) {
  console.error('Conversation not found or access denied')
  return
}
```

### Error Event Handling

```typescript
conversai.on('error', ({ service, error, operation }) => {
  // Log error
  console.error(`ConversAI ${operation} error:`, error)
  
  // Report to monitoring service
  monitoring.reportError({
    service: 'conversai',
    operation,
    error: error.message,
    userId: error.userId,
    timestamp: new Date()
  })
  
  // Handle specific error types
  switch (error.code) {
    case 'AI_PROVIDER_ERROR':
      // Fallback to different AI provider
      break
    case 'MEMORY_INTEGRATION_ERROR':
      // Disable memory features temporarily
      break
    case 'RATE_LIMIT_EXCEEDED':
      // Implement backoff strategy
      break
  }
})
```

## ✅ Best Practices

### 1. Service Initialization

```typescript
// ✅ Always use async create method
const conversai = await ConversaiService.create()

// ❌ Don't use getInstance without initialization
const conversai = ConversaiService.getInstance()
conversai.someMethod() // May fail if not initialized
```

### 2. Error Handling

```typescript
// ✅ Always handle potential null responses
const conversation = await conversai.getConversation(id, userId)
if (!conversation) {
  throw new Error('Conversation not found')
}

// ✅ Use try-catch for async operations
try {
  await conversai.addMessage(convId, userId, content)
} catch (error) {
  console.error('Failed to add message:', error)
}
```

### 3. Event Management

```typescript
// ✅ Remove event listeners when done
const handler = (data) => console.log(data)
conversai.on('message.added', handler)

// Later...
conversai.off('message.added', handler)
```

### 4. Resource Management

```typescript
// ✅ Monitor conversation count and clean up
if (conversai.activeConversationCount > 1000) {
  // Archive old conversations
  await archiveOldConversations()
}

// ✅ Use pagination for large lists
const conversations = await conversai.listConversations(userId, {}, 20, 0)
```

### 5. Memory Integration

```typescript
// ✅ Enable memory integration for important conversations
const conversation = await conversai.createConversation(userId, {
  settings: {
    memoryIntegration: true, // Enable for context persistence
    analyticsEnabled: true   // Enable for insights
  }
})
```

### 6. Performance Optimization

```typescript
// ✅ Use appropriate model for use case
const quickResponse = await conversai.createConversation(userId, {
  settings: {
    model: 'gpt-3.5-turbo', // Faster for simple queries
    maxTokens: 1000         // Limit for quick responses
  }
})

const detailedAnalysis = await conversai.createConversation(userId, {
  settings: {
    model: 'gpt-4',         // Better for complex analysis
    maxTokens: 4000         // More space for detailed responses
  }
})
```

---

## 🔗 Related Documentation

- [MemorAI Service API](./MEMORAI_SERVICE_API.md)
- [Service Integration Guide](./SERVICE_INTEGRATION_GUIDE.md)
- [Event System Documentation](./EVENT_SYSTEM.md)
- [Error Handling Guide](./ERROR_HANDLING_GUIDE.md)

---

*Last Updated: July 19, 2025*
*Service Version: 1.1.0 (Optimized)*
*API Version: 2.0*
