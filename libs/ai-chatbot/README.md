# CODAI AI Chatbot Core

An intelligent conversational AI system with advanced context management, natural language processing, and enterprise-grade security features.

## Features

- **🧠 Advanced AI Intelligence**: OpenAI GPT integration with context-aware responses
- **💬 Conversation Management**: Multi-turn conversations with persistent context
- **🔐 Enterprise Security**: Content filtering, rate limiting, and audit logging
- **📊 Context Awareness**: Working memory and long-term memory management
- **🎯 Intent Recognition**: Natural language understanding with entity extraction
- **📈 Sentiment Analysis**: Real-time sentiment tracking and response adaptation
- **🔌 Plugin Architecture**: Extensible system for custom capabilities
- **📝 TypeScript Support**: Full type safety with comprehensive type definitions

## Installation

```bash
# Install the package
npm install @codai/ai-chatbot

# Install peer dependencies
npm install openai tiktoken compromise sentiment uuid
```

## Quick Start

```typescript
import { createChatbot } from '@codai/ai-chatbot';

// Create a chatbot with default configuration
const chatbot = createChatbot({
  name: 'My Assistant',
  aiModel: {
    provider: 'openai',
    model: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY
  }
});

// Start a conversation
const conversation = await chatbot.startConversation('user123', 'Hello!');

// Process messages
const response = await chatbot.processMessage(
  conversation.id,
  'What can you help me with?',
  'user123'
);

console.log(response.content);
```

## Advanced Usage

### Custom Configuration

```typescript
import { AIChatbot } from '@codai/ai-chatbot';

const chatbot = new AIChatbot({
  name: 'Advanced Assistant',
  description: 'Specialized AI for technical support',
  
  // AI Model Configuration
  aiModel: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    apiKey: process.env.OPENAI_API_KEY
  },
  
  // Personality Configuration
  personality: {
    name: 'TechBot',
    tone: 'professional',
    style: 'technical',
    expertiseLevel: 'advanced'
  },
  
  // Capabilities
  capabilities: [
    'text_processing',
    'context_awareness',
    'multi_turn_conversation',
    'intent_recognition',
    'entity_extraction',
    'sentiment_analysis'
  ],
  
  // Security Settings
  security: {
    enabled: true,
    contentFiltering: true,
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 30,
      tokensPerHour: 50000
    },
    dataRetention: {
      conversationTTL: 7,
      userDataTTL: 30,
      anonymization: true
    },
    auditLogging: true
  },
  
  // Memory Configuration
  memory: {
    workingMemory: {
      maxItems: 50,
      ttl: 1800 // 30 minutes
    },
    longTermMemory: {
      enabled: true,
      maxItems: 500,
      persistenceLevel: 'user'
    },
    contextWindow: 8
  }
});
```

### Event Handling

```typescript
// Listen to chatbot events
chatbot.on('conversation_started', (event) => {
  console.log('New conversation:', event.conversationId);
});

chatbot.on('message_received', (event) => {
  console.log('User message:', event.data.message.content);
});

chatbot.on('intent_classified', (event) => {
  console.log('Detected intent:', event.data.intent);
});

chatbot.on('error_occurred', (event) => {
  console.error('Chatbot error:', event.data.error);
});
```

### Working with Conversations

```typescript
// Start multiple conversations
const conv1 = await chatbot.startConversation('user1', 'Hi there!');
const conv2 = await chatbot.startConversation('user2', 'Hello!');

// Get user conversations
const userConversations = await chatbot.getUserConversations('user1');

// Process messages with metadata
const response = await chatbot.processMessage(
  conv1.id,
  'I need help with TypeScript',
  'user1',
  { 
    source: 'web_chat',
    priority: 'high',
    context: { page: '/typescript-help' }
  }
);

// Update conversation status
await chatbot.updateConversationStatus(conv1.id, 'completed');

// End conversation
await chatbot.endConversation(conv1.id);
```

### Plugin System

```typescript
// Create a custom plugin
class WeatherPlugin {
  id = 'weather-plugin';
  name = 'Weather Information';
  
  async initialize(chatbot) {
    this.chatbot = chatbot;
    console.log('Weather plugin initialized');
  }
  
  async handleWeatherRequest(location) {
    // Fetch weather data
    return `The weather in ${location} is sunny and 72°F`;
  }
  
  async cleanup() {
    console.log('Weather plugin cleaned up');
  }
}

// Register the plugin
await chatbot.registerPlugin(new WeatherPlugin());
```

## API Reference

### AIChatbot Class

#### Methods

- `startConversation(userId?, initialMessage?)` - Start a new conversation
- `processMessage(conversationId, content, userId?, metadata?)` - Process a user message
- `getConversation(conversationId)` - Get conversation by ID
- `getUserConversations(userId, limit?)` - Get conversations for a user
- `updateConversationStatus(conversationId, status)` - Update conversation status
- `endConversation(conversationId)` - End a conversation
- `getStatus()` - Get chatbot status and metrics
- `registerPlugin(plugin)` - Register a plugin
- `unregisterPlugin(pluginId)` - Unregister a plugin
- `shutdown()` - Graceful shutdown

#### Events

- `conversation_started` - New conversation created
- `conversation_ended` - Conversation ended
- `message_received` - User message received
- `message_sent` - Assistant message sent
- `intent_classified` - User intent detected
- `entity_extracted` - Entities extracted from message
- `context_updated` - Conversation context updated
- `error_occurred` - Error occurred during processing

### Types

#### Core Types

```typescript
interface Message {
  id: string;
  conversationId: string;
  userId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
  tokens?: number;
  processingTime?: number;
}

interface Conversation {
  id: string;
  userId?: string;
  title?: string;
  status: 'active' | 'paused' | 'completed' | 'archived' | 'error';
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  messageCount: number;
  metadata: ConversationMetadata;
  userPreferences?: UserPreferences;
}

interface AIResponse {
  content: string;
  confidence: number;
  metadata: {
    intent?: string;
    entities: any[];
    sentiment?: any;
    topics: string[];
    model: string;
    processingSteps: string[];
  };
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  processingTime: number;
}
```

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key

# Optional
CHATBOT_LOG_LEVEL=info
CHATBOT_MAX_TOKENS=2048
CHATBOT_RATE_LIMIT_RPM=60
```

### Security Features

- **Content Filtering**: Automatic detection and blocking of sensitive content
- **Rate Limiting**: Per-user request and token limits
- **Data Retention**: Automatic cleanup of old conversations and user data
- **Audit Logging**: Comprehensive logging of all interactions
- **Input Validation**: Sanitization and validation of all user inputs

### Memory Management

- **Working Memory**: Short-term context for active conversations
- **Long-term Memory**: Persistent user preferences and patterns
- **Context Window**: Sliding window of recent conversation history
- **Memory Cleanup**: Automatic cleanup of expired memory items

## Integration Examples

### Express.js Integration

```typescript
import express from 'express';
import { createChatbot } from '@codai/ai-chatbot';

const app = express();
const chatbot = createChatbot({ /* config */ });

app.post('/chat', async (req, res) => {
  try {
    const { conversationId, message, userId } = req.body;
    
    let conversation;
    if (!conversationId) {
      conversation = await chatbot.startConversation(userId, message);
    } else {
      const response = await chatbot.processMessage(conversationId, message, userId);
      res.json({ response, conversationId });
      return;
    }
    
    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### WebSocket Integration

```typescript
import { WebSocketServer } from 'ws';
import { createChatbot } from '@codai/ai-chatbot';

const wss = new WebSocketServer({ port: 8080 });
const chatbot = createChatbot({ /* config */ });

wss.on('connection', (ws) => {
  let conversationId = null;
  
  ws.on('message', async (data) => {
    try {
      const { message, userId } = JSON.parse(data.toString());
      
      if (!conversationId) {
        const conversation = await chatbot.startConversation(userId, message);
        conversationId = conversation.id;
        ws.send(JSON.stringify({ type: 'conversation_started', conversation }));
      } else {
        const response = await chatbot.processMessage(conversationId, message, userId);
        ws.send(JSON.stringify({ type: 'message', response }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', error: error.message }));
    }
  });
});
```

## Development

### Building

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

### Testing

```bash
# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run end-to-end tests
pnpm test:e2e

# Test coverage
pnpm test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `pnpm test`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](https://docs.codai.dev/ai-chatbot)
- 💬 [Discord Community](https://discord.gg/codai)
- 🐛 [Issue Tracker](https://github.com/codai-project/ai-chatbot/issues)
- 📧 [Email Support](mailto:support@codai.dev)

---

Built with ❤️ by the CODAI Team
