# CODAI Universal SDK

The CODAI Universal SDK provides seamless integration across the entire CODAI ecosystem, enabling developers to build applications that leverage the full power of all CODAI services.

## 🌟 Features

- **Complete Ecosystem Integration**: Access all 36 CODAI applications through a single, unified interface
- **Type-Safe Development**: Full TypeScript support with comprehensive type definitions
- **Cross-App Communication**: Built-in event system for real-time inter-application messaging
- **Health Monitoring**: Comprehensive service health checks and performance monitoring
- **Enterprise Ready**: GDPR/CCPA compliance, security, and audit logging built-in
- **Modular Architecture**: Use only the services you need with tree-shaking support

## 🚀 Quick Start

### Installation

```bash
npm install @codai/sdk
# or
pnpm add @codai/sdk
# or
yarn add @codai/sdk
```

### Basic Usage

```typescript
import { createCodaiSDK } from '@codai/sdk';

const config = {
  appId: 'my-app',
  environment: 'production',
  apiVersion: 'v1',
  endpoints: {
    auth: 'https://logai.ro/api',
    storage: 'https://stocai.ro/api',
    memory: 'https://memorai.ro/api',
    analytics: 'https://analizai.ro/api',
    wallet: 'https://bancai.ro/api',
    marketplace: 'https://marketai.ro/api',
    legal: 'https://legalizai.ro/api',
    support: 'https://ajutai.ro/api',
    identity: 'https://id.codai.ro/api'
  }
};

// Initialize SDK
const sdk = await createCodaiSDK(config);

// Use services
const user = await sdk.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Upload file
const file = new File(['content'], 'document.txt');
const uploadResult = await sdk.storage.uploadFile(file, {
  name: 'document.txt',
  isPublic: false
});

// Track analytics
await sdk.analytics.track('file_uploaded', {
  fileType: 'text',
  size: file.size
});

// Cleanup
await sdk.destroy();
```

## 📚 Available Services

### Authentication Service (`sdk.auth`)
- User authentication and session management
- SSO integration with LOGAI.ro
- Role-based access control

```typescript
// Login user
const result = await sdk.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const user = await sdk.auth.getCurrentUser();

// Logout
await sdk.auth.logout();
```

### Storage Service (`sdk.storage`)
- File upload, download, and management
- Integration with STOCAI.ro
- Secure file sharing and permissions

```typescript
// Upload file
const metadata = await sdk.storage.uploadFile(file, {
  name: 'report.pdf',
  tags: ['report', 'quarterly'],
  isPublic: false
});

// Download file
const fileData = await sdk.storage.downloadFile(metadata.id);

// List files
const files = await sdk.storage.getFiles({
  tags: ['report'],
  limit: 10
});
```

### Memory Service (`sdk.memory`)
- AI-powered memory and context management
- Integration with MEMORAI.ro
- Intelligent information retrieval

```typescript
// Store memory
const memory = await sdk.memory.remember('user123', {
  content: 'User prefers dark theme',
  metadata: { category: 'preferences' }
});

// Recall memories
const memories = await sdk.memory.recall('user123', 'theme preferences');

// Forget memory
await sdk.memory.forget('user123', memory.id);
```

### Analytics Service (`sdk.analytics`)
- Real-time analytics and dashboards
- Integration with ANALIZAI.ro
- User behavior tracking

```typescript
// Track event
await sdk.analytics.track('page_view', {
  page: '/dashboard',
  user_id: 'user123'
});

// Create dashboard
const dashboard = await sdk.analytics.createDashboard({
  name: 'User Engagement',
  widgets: [
    {
      type: 'line_chart',
      title: 'Daily Active Users',
      metric: 'active_users'
    }
  ]
});
```

### Wallet Service (`sdk.wallet`)
- Financial transactions and wallet management
- Integration with BANCAI.ro
- Multi-currency support

```typescript
// Create wallet
const wallet = await sdk.wallet.createWallet({
  name: 'Business Wallet',
  currency: 'RON',
  userId: 'user123'
});

// Send payment
const payment = await sdk.wallet.createTransaction({
  fromWalletId: wallet.id,
  amount: 100.00,
  currency: 'RON',
  description: 'Service payment'
});
```

### Marketplace Service (`sdk.marketplace`)
- Product listings and e-commerce
- Integration with MARKETAI.ro
- Order management

```typescript
// Create product
const product = await sdk.marketplace.createProduct({
  name: 'AI Assistant License',
  price: { amount: 299.99, currency: 'RON' },
  category: 'software'
});

// Search products
const results = await sdk.marketplace.searchProducts({
  query: 'AI assistant',
  categoryId: 'software'
});

// Create order
const order = await sdk.marketplace.createOrder({
  items: [{ productId: product.id, quantity: 1 }],
  customerId: 'user123'
});
```

### Legal Service (`sdk.legal`)
- Legal document management
- Integration with LEGALIZAI.ro
- Compliance automation

```typescript
// Get templates
const templates = await sdk.legal.getTemplates({
  category: 'contracts'
});

// Create document
const document = await sdk.legal.createDocument({
  templateId: templates[0].id,
  title: 'Service Agreement',
  content: 'Contract content...'
});

// Schedule consultation
const consultation = await sdk.legal.createConsultation({
  type: 'contract_review',
  documentId: document.id
});
```

### Support Service (`sdk.support`)
- Customer support and helpdesk
- Integration with AJUTAI.ro
- Knowledge base and live chat

```typescript
// Create ticket
const ticket = await sdk.support.createTicket({
  subject: 'Technical Issue',
  description: 'Need help with integration',
  priority: 'medium'
});

// Search knowledge base
const articles = await sdk.support.searchKnowledgeBase({
  query: 'API integration'
});

// Start chat
const chat = await sdk.support.startChat({
  ticketId: ticket.id
});
```

### Identity Service (`sdk.identity`)
- Identity verification and KYC
- Integration with ID.CODAI.ro
- Document verification

```typescript
// Start verification
const verification = await sdk.identity.createVerification({
  userId: 'user123',
  verificationType: 'enhanced'
});

// Upload document
await sdk.identity.uploadDocument({
  verificationId: verification.id,
  documentType: 'national_id',
  file: documentFile
});

// Get trust score
const trustScore = await sdk.identity.getTrustScore('user123');
```

## 🔄 Cross-App Communication

The SDK provides a powerful event system for real-time communication between applications:

```typescript
// Get event bus
const eventBus = sdk.getEventBus();

// Subscribe to events
eventBus.subscribe('user:action', (data) => {
  console.log('User action:', data);
});

// Send targeted message
eventBus.sendMessage('analytics-app', {
  type: 'user_event',
  data: { action: 'file_upload' }
});

// Broadcast to all apps
eventBus.broadcast({
  type: 'system_notification',
  message: 'Maintenance scheduled'
});
```

## 🏥 Health Monitoring

Monitor the health and performance of all services:

```typescript
// Get health status
const health = await sdk.getHealth();
console.log('System status:', health.status);
console.log('Services:', health.services);

// Subscribe to health events
sdk.getEventBus().subscribe('sdk:health:unhealthy', (data) => {
  console.warn('Health alert:', data);
  // Implement alerting logic
});
```

## ⚙️ Configuration

### Full Configuration Example

```typescript
const config = {
  // App identification
  appId: 'my-codai-app',
  environment: 'production', // 'development' | 'staging' | 'production'
  apiVersion: 'v1',
  
  // Service endpoints
  endpoints: {
    auth: 'https://logai.ro/api',
    storage: 'https://stocai.ro/api',
    memory: 'https://memorai.ro/api',
    analytics: 'https://analizai.ro/api',
    wallet: 'https://bancai.ro/api',
    marketplace: 'https://marketai.ro/api',
    legal: 'https://legalizai.ro/api',
    support: 'https://ajutai.ro/api',
    identity: 'https://id.codai.ro/api',
    gateway: 'https://api.codai.ro'
  },
  
  // Authentication settings
  authentication: {
    enabled: true,
    ssoEnabled: true,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
    storage: 'localStorage'
  },
  
  // Security configuration
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM'
    },
    rateLimiting: {
      enabled: true,
      maxRequests: 1000,
      windowMs: 60 * 1000 // 1 minute
    }
  },
  
  // Compliance settings
  compliance: {
    gdpr: true,
    ccpa: true,
    hipaa: false,
    auditLogging: true
  },
  
  // Request settings
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  
  // Monitoring
  debug: false,
  telemetry: true,
  healthCheckInterval: 60000 // 1 minute
};
```

## 🔒 Security & Compliance

The SDK includes built-in security and compliance features:

- **Encryption**: All sensitive data is encrypted using AES-256-GCM
- **GDPR Compliance**: Automatic data handling compliance
- **CCPA Compliance**: California privacy law compliance
- **Rate Limiting**: Configurable request rate limiting
- **Audit Logging**: Comprehensive audit trail
- **Secure Storage**: Encrypted local storage options

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/__tests__/basic.test.ts
```

## 📊 TypeScript Support

The SDK is built with TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  CodaiConfig, 
  CodaiEventMap, 
  User, 
  FileMetadata,
  Memory,
  Analytics,
  Wallet,
  Product,
  LegalDocument,
  SupportTicket,
  IdentityVerification 
} from '@codai/sdk';
```

## 🌍 CODAI Ecosystem

The CODAI Universal SDK integrates with the entire CODAI ecosystem:

- **LOGAI.ro** - Authentication & Identity Management
- **STOCAI.ro** - File Storage & Management
- **MEMORAI.ro** - AI Memory & Context Management
- **ANALIZAI.ro** - Analytics & Business Intelligence
- **BANCAI.ro** - Financial Services & Payments
- **MARKETAI.ro** - E-commerce & Marketplace
- **LEGALIZAI.ro** - Legal Services & Compliance
- **AJUTAI.ro** - Customer Support & Helpdesk
- **ID.CODAI.ro** - Identity Verification & KYC

## 📋 Examples

Check the [examples directory](./examples/) for comprehensive usage examples:

- [Complete Integration Example](./examples/complete-integration.ts)
- [Authentication Flow](./examples/auth-flow.ts)
- [File Management](./examples/file-management.ts)
- [Analytics Dashboard](./examples/analytics-dashboard.ts)
- [E-commerce Integration](./examples/ecommerce.ts)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- 📚 [Documentation](https://docs.codai.ro/sdk)
- 💬 [Discord Community](https://discord.gg/codai)
- 📧 [Email Support](mailto:support@codai.ro)
- 🐛 [Issue Tracker](https://github.com/codai/sdk/issues)

## 🚀 Roadmap

- [ ] React Native support
- [ ] Vue.js integration
- [ ] Real-time collaboration features
- [ ] Advanced AI integrations
- [ ] Blockchain integrations
- [ ] Mobile SDK versions

---

Built with ❤️ by the CODAI Team
