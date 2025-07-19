# CODAI Services Quick Start Guide

## 🚀 Quick Start for Developers

This guide helps developers quickly get started with the optimized CODAI ecosystem services.

## 📦 Installation & Setup

### 1. Prerequisites
```bash
# Required
node --version  # 18.x or higher
pnpm --version  # 8.x or higher

# Install dependencies
cd codai-project
pnpm install
```

### 2. Build Services
```bash
# Build all optimized services
pnpm run build --filter @codai/conversai --filter @codai/fabricai --filter @codai/romai --filter @codai/memorai

# Or build individual services
cd packages/conversai && pnpm run build
cd packages/fabricai && pnpm run build
cd packages/romai && pnpm run build
```

## 🧠 Core Services Usage

### MemorAI - Universal Database & Memory
```typescript
import { MemoraiService } from '@codai/memorai'

// Initialize service
const memorai = await MemoraiService.create()

// Store memory
await memorai.storeMemory({
  content: "User prefers dark mode interface",
  userId: "user123",
  importance: 0.8,
  tags: ['preference', 'ui']
})

// Search memories
const memories = await memorai.searchMemories({
  query: "user preferences",
  userId: "user123",
  limit: 10
})

// Database operations
const users = await memorai.find('users', [
  { field: 'active', operator: '=', value: true }
])

// File storage
const file = await memorai.uploadFile({
  filename: 'document.pdf',
  buffer: fileBuffer
}, 'user123')
```

## 💬 ConversAI - AI Conversation Management

### Basic Usage
```typescript
import { ConversaiService } from '@codai/conversai'

// Initialize service
const conversai = await ConversaiService.create()

// Create conversation with memory integration
const conversation = await conversai.createConversation('user123', {
  title: 'Product Planning Session',
  settings: {
    model: 'gpt-4',
    temperature: 0.7,
    memoryIntegration: true,
    analyticsEnabled: true
  }
})

// Add user message
const userMessage = await conversai.addMessage(
  conversation.id,
  'user123',
  'Help me create a go-to-market strategy for our AI product'
)

// Generate AI response
const aiResponse = await conversai.generateResponse(
  conversation.id,
  'user123'
)

console.log('AI:', aiResponse.content)
```

### Event-Driven Integration
```typescript
// Listen for real-time events
conversai.on('message.added', ({ message, conversation }) => {
  console.log(`New message in ${conversation.title}: ${message.content}`)
  
  // Automatic memory storage
  if (message.role === 'user' && conversation.settings?.memoryIntegration) {
    memorai.storeMemory({
      content: message.content,
      userId: message.userId,
      context: { conversationId: conversation.id },
      importance: 0.7
    })
  }
})

// Analytics integration
conversai.on('conversation.created', ({ conversation }) => {
  analytics.track('conversation_started', {
    userId: conversation.userId,
    model: conversation.settings?.model
  })
})
```

### Advanced Features
```typescript
// List conversations with filtering
const recent = await conversai.listConversations('user123', {
  status: 'active',
  createdAfter: new Date('2025-01-01'),
  titleContains: 'strategy'
}, 20, 0)

// Get conversation analytics
const analytics = await conversai.getConversationAnalytics(
  conversation.id,
  'user123'
)

console.log({
  messages: analytics.totalMessages,
  tokens: analytics.totalTokens,
  topics: analytics.topics,
  sentiment: analytics.sentiment,
  complexity: analytics.complexity
})

// Check service status
if (conversai.isReady) {
  console.log(`Active conversations: ${conversai.activeConversationCount}`)
  console.log(`Total tokens processed: ${conversai.totalTokensProcessed}`)
}
```

## 🎨 FabricAI - Content Generation

### Template-Based Generation
```typescript
import { FabricaiService } from '@codai/fabricai'

// Initialize service
const fabricai = await FabricaiService.create()

// Create content template
const template = await fabricai.createTemplate('user123', {
  name: 'Marketing Email',
  description: 'Professional marketing email template',
  category: 'marketing',
  template: `
Subject: {{subject}}

Hello {{customerName}},

{{personalizedMessage}}

Best regards,
{{senderName}}
  `,
  variables: [
    { name: 'subject', type: 'string', required: true },
    { name: 'customerName', type: 'string', required: true },
    { name: 'personalizedMessage', type: 'string', required: true },
    { name: 'senderName', type: 'string', required: true }
  ],
  outputFormat: 'html'
})

// Generate content
const generation = await fabricai.generateContent('user123', {
  templateId: template.id,
  variables: {
    subject: 'Exclusive AI Product Launch',
    customerName: 'John Smith',
    personalizedMessage: 'We thought you\'d be interested in our new AI assistant.',
    senderName: 'Sarah Johnson'
  },
  outputFormat: 'html',
  model: 'gpt-4'
})

console.log('Generated content:', generation.generatedContent)
```

### Content Projects
```typescript
// Create content project
const project = await fabricai.createProject('user123', {
  name: 'Q4 Marketing Campaign',
  description: 'All marketing content for Q4 launch',
  templates: [template.id],
  settings: {
    defaultOutputFormat: 'markdown',
    autoSave: true,
    versionControl: true
  }
})

// Validate template
const validation = await fabricai.validateTemplate({
  name: 'Test Template',
  template: 'Hello {{name}}!',
  variables: [
    { name: 'name', type: 'string', required: true }
  ]
})

if (validation.isValid) {
  console.log('Template is valid!')
} else {
  console.log('Validation errors:', validation.errors)
}
```

## 🇷🇴 RomAI - Romanian Intelligence

### Market Intelligence
```typescript
import { RomaiService } from '@codai/romai'

// Initialize service  
const romai = await RomaiService.create()

// Analyze Romanian market
const marketInsight = await romai.analyzeMarket('Technology', 'Bucharest')
console.log({
  title: marketInsight.title,
  analysis: marketInsight.analysis,
  recommendations: marketInsight.recommendations,
  confidence: marketInsight.confidence
})

// Get market intelligence
const intelligence = await romai.getMarketIntelligence('business', 'Cluj')
intelligence.forEach(intel => {
  console.log(`${intel.category}: ${intel.title}`)
  console.log(`Confidence: ${intel.confidence}`)
  console.log(`Sources: ${intel.sources.map(s => s.name).join(', ')}`)
})
```

### Language & Translation
```typescript
// Romanian translation with business context
const translation = await romai.translateToRomanian(
  'Welcome to our platform. We provide AI-powered business solutions.',
  'en',
  'business'
)

console.log({
  translation: translation.translatedText,
  confidence: translation.confidence,
  alternatives: translation.alternatives,
  businessContext: translation.businessContext,
  culturalNotes: translation.culturalNotes
})

// Analyze Romanian text
const analysis = await romai.analyzeRomanianText(
  'Compania noastră oferă soluții inovative pentru piața românească'
)

console.log({
  language: analysis.language,
  sentiment: analysis.sentiment,
  entities: analysis.entities,
  topics: analysis.topics,
  readability: analysis.readabilityScore
})
```

### Cultural Context & Business Validation
```typescript
// Get cultural context for business decisions
const context = await romai.getCulturalContext('business meetings', 'România')
console.log({
  context: context.context,
  culturalFactors: context.culturalFactors,
  businessImplications: context.businessImplications,
  recommendations: context.recommendations
})

// Validate Romanian business name
const validation = await romai.validateRomanianBusinessName('TechnoAI Solutions')
console.log({
  isValid: validation.isValid,
  suggestions: validation.suggestions,
  culturalConsiderations: validation.culturalConsiderations
})

// Event-driven updates
romai.on('market.insight.created', ({ insight }) => {
  console.log(`New market insight: ${insight.title}`)
  // Automatically store in memory
  memorai.storeMemory({
    content: insight.analysis,
    userId: 'system',
    context: { type: 'market_intelligence', sector: insight.sector.name },
    importance: insight.confidence
  })
})
```

## 🔗 Service Integration Patterns

### Cross-Service Event Integration
```typescript
// Automatic memory integration
conversai.on('message.added', async ({ message, conversation }) => {
  if (message.role === 'user' && conversation.settings?.memoryIntegration) {
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

// Content generation trigger from conversation
conversai.on('conversation.created', async ({ conversation }) => {
  if (conversation.title.includes('content')) {
    // Suggest relevant templates
    const templates = await fabricai.searchTemplates({
      query: conversation.title,
      userId: conversation.userId,
      limit: 5
    })
    
    console.log('Suggested templates:', templates.map(t => t.name))
  }
})

// Romanian intelligence for business decisions
romai.on('market.insight.created', async ({ insight }) => {
  // Create conversation for discussing insights
  await conversai.createConversation('business_team', {
    title: `Discuss: ${insight.title}`,
    description: `Market insight discussion: ${insight.analysis}`,
    settings: { memoryIntegration: true }
  })
})
```

### Error Handling Patterns
```typescript
// Consistent error handling
async function robustServiceCall() {
  try {
    const result = await conversai.createConversation('user123', options)
    
    if (!result) {
      console.error('Service returned null - check user permissions')
      return null
    }
    
    return result
  } catch (error) {
    console.error('Service error:', error.message)
    
    // Fallback behavior
    if (error.code === 'SERVICE_UNAVAILABLE') {
      console.log('Service temporarily unavailable, using cached data')
      return getCachedConversation(userId)
    }
    
    throw error // Re-throw if cannot handle
  }
}

// Global error handling
[conversai, fabricai, romai, memorai].forEach(service => {
  service.on('error', ({ service: serviceName, error, operation }) => {
    console.error(`${serviceName} error in ${operation}:`, error.message)
    
    // Report to monitoring
    monitoring.reportError({
      service: serviceName,
      operation,
      error: error.message,
      timestamp: new Date()
    })
  })
})
```

## 📊 Monitoring & Analytics

### Service Health Monitoring
```typescript
// Check service health
async function checkSystemHealth() {
  const healthChecks = await Promise.allSettled([
    conversai.isReady,
    fabricai.isReady, 
    romai.isReady,
    memorai.getHealth()
  ])
  
  const status = {
    conversai: healthChecks[0].status === 'fulfilled' && healthChecks[0].value,
    fabricai: healthChecks[1].status === 'fulfilled' && healthChecks[1].value,
    romai: healthChecks[2].status === 'fulfilled' && healthChecks[2].value,
    memorai: healthChecks[3].status === 'fulfilled' && healthChecks[3].value?.status === 'healthy'
  }
  
  console.log('System Health:', status)
  return status
}

// Performance monitoring
setInterval(async () => {
  if (conversai.isReady) {
    console.log(`ConversAI Stats:`, {
      activeConversations: conversai.activeConversationCount,
      totalTokens: conversai.totalTokensProcessed
    })
  }
}, 60000) // Every minute
```

### Analytics Integration
```typescript
// Track service usage
function setupAnalytics() {
  // Track conversation patterns
  conversai.on('conversation.created', ({ conversation }) => {
    analytics.track('conversation_started', {
      userId: conversation.userId,
      model: conversation.settings?.model,
      hasMemory: conversation.settings?.memoryIntegration
    })
  })
  
  // Track content generation
  fabricai.on('content.generated', ({ generation }) => {
    analytics.track('content_generated', {
      userId: generation.userId,
      templateId: generation.templateId,
      outputFormat: generation.outputFormat,
      tokens: generation.tokens
    })
  })
  
  // Track Romanian intelligence usage
  romai.on('translation.completed', ({ request, result }) => {
    analytics.track('translation_completed', {
      sourceLanguage: request.sourceLanguage,
      confidence: result.confidence,
      hasBusinessContext: result.businessContext?.length > 0
    })
  })
}
```

## 🛠️ Development Tips

### Best Practices
```typescript
// 1. Always initialize services properly
const service = await ServiceClass.create() // ✅
// const service = ServiceClass.getInstance() // ❌ May not be initialized

// 2. Handle service responses properly
const conversation = await conversai.getConversation(id, userId)
if (!conversation) {
  throw new Error('Conversation not found or access denied')
}

// 3. Use events for loose coupling
conversai.on('message.added', handleNewMessage)
// Don't directly call other services from within a service

// 4. Clean up event listeners
const handler = (data) => console.log(data)
service.on('event', handler)
// Later: service.off('event', handler)

// 5. Use proper error handling
try {
  await service.operation(params)
} catch (error) {
  console.error('Operation failed:', error.message)
  // Handle appropriately
}
```

### Testing Patterns
```typescript
// Mock service for testing
class MockConversaiService extends ConversaiService {
  async createConversation() {
    return mockConversation
  }
}

// Test with real services
describe('Service Integration', () => {
  beforeAll(async () => {
    await Promise.all([
      conversai.initialize(),
      fabricai.initialize(),
      romai.initialize()
    ])
  })
  
  test('creates conversation and stores memory', async () => {
    const conv = await conversai.createConversation('test123', {
      settings: { memoryIntegration: true }
    })
    
    expect(conv.id).toBeDefined()
    expect(conv.settings?.memoryIntegration).toBe(true)
  })
})
```

---

## 🆘 Troubleshooting

### Common Issues

1. **Service Not Ready**: Always use `await Service.create()` instead of `getInstance()`
2. **Event Memory Leaks**: Remove event listeners when no longer needed
3. **Type Errors**: Ensure all required properties are provided in requests
4. **Memory Issues**: Monitor service memory usage, clear caches periodically

### Debug Mode
```bash
# Enable detailed logging
DEBUG=codai:* npm run dev
# Or set environment variable
export LOG_LEVEL=debug
```

---

*Quick Start Guide - Version 1.0*  
*Last Updated: July 19, 2025*  
*Services: ConversAI v1.1.0, FabricAI v1.0.0, RomAI v1.0.0, MemorAI v1.0.0*
