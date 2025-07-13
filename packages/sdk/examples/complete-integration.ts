/**
 * CODAI Universal SDK - Complete Usage Examples
 * Demonstrates comprehensive ecosystem integration patterns
 */

import { CodaiSDK, createCodaiSDK, getCodaiSDK } from '@codai/sdk';
import type { CodaiConfig } from '@codai/sdk';

// Example 1: Basic SDK Setup and Initialization
async function basicSDKSetup() {
  const config: CodaiConfig = {
    appId: 'my-codai-app',
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
      identity: 'https://id.codai.ro/api',
      gateway: 'https://api.codai.ro'
    },
    authentication: {
      enabled: true,
      ssoEnabled: true,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      storage: 'localStorage'
    },
    security: {
      encryption: { enabled: true },
      rateLimiting: { enabled: true, maxRequests: 1000 }
    },
    compliance: {
      gdpr: true,
      ccpa: true,
      auditLogging: true
    },
    timeout: 30000,
    retryAttempts: 3,
    debug: false,
    telemetry: true
  };

  // Create SDK instance
  const sdk = await createCodaiSDK(config);

  console.log('✅ CODAI SDK initialized successfully');
  console.log('📊 SDK Version:', await sdk.getHealth().then(h => h.version));
  console.log('🔧 Available Services:', sdk.listServices());

  return sdk;
}

// Example 2: User Authentication Flow
async function userAuthenticationFlow(sdk: CodaiSDK) {
  try {
    // Check authentication status
    const currentUser = await sdk.auth.getCurrentUser();
    if (currentUser) {
      console.log('👤 User already authenticated:', currentUser.email);
      return currentUser;
    }

    // Login user
    const loginResult = await sdk.auth.login({
      email: 'user@example.com',
      password: 'securePassword123'
    });

    console.log('🔐 User logged in successfully');

    // Setup session monitoring
    sdk.getEventBus().subscribe('auth:login', (data) => {
      console.log('🔔 Authentication event:', data);
    });

    return loginResult.user;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
}

// Example 3: Cross-App Data Storage and Retrieval
async function dataStorageAndRetrieval(sdk: CodaiSDK) {
  try {
    // Upload a file
    const file = new File(['Hello, CODAI ecosystem!'], 'greeting.txt', {
      type: 'text/plain'
    });

    const uploadResult = await sdk.storage.uploadFile(file, {
      name: 'greeting.txt',
      tags: ['demo', 'text'],
      isPublic: false
    });

    console.log('📁 File uploaded:', uploadResult.id);

    // Store structured data in memory
    const memoryResult = await sdk.memory.store({
      content: 'User prefers dark theme and Romanian language',
      metadata: {
        category: 'user_preferences',
        importance: 'high',
        userId: 'user123'
      }
    });

    console.log('🧠 Memory stored:', memoryResult.id);

    // Retrieve related memories
    const memories = await sdk.memory.recall({
      query: 'user preferences',
      limit: 5
    });

    console.log('🔍 Retrieved memories:', memories.memories.length);

    return { file: uploadResult, memory: memoryResult };
  } catch (error) {
    console.error('❌ Data operation failed:', error);
    throw error;
  }
}

// Example 4: Analytics and User Behavior Tracking
async function analyticsAndTracking(sdk: CodaiSDK) {
  try {
    // Track user events
    await sdk.analytics.track({
      event: 'page_view',
      properties: {
        page: '/dashboard',
        source: 'navigation',
        timestamp: new Date()
      }
    });

    await sdk.analytics.track({
      event: 'feature_used',
      properties: {
        feature: 'file_upload',
        category: 'storage',
        success: true
      }
    });

    // Create custom metrics
    const dashboardConfig = {
      name: 'User Engagement Dashboard',
      widgets: [
        {
          type: 'line_chart',
          title: 'Daily Active Users',
          metric: 'user_activity',
          timeRange: '7d'
        },
        {
          type: 'pie_chart',
          title: 'Feature Usage',
          metric: 'feature_usage',
          groupBy: 'feature_name'
        }
      ]
    };

    const dashboard = await sdk.analytics.createDashboard(dashboardConfig);
    console.log('📈 Analytics dashboard created:', dashboard.id);

    // Get real-time metrics
    const metrics = await sdk.analytics.getMetrics({
      metrics: ['active_users', 'session_duration', 'feature_usage'],
      timeRange: { start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date() },
      granularity: 'hour'
    });

    console.log('📊 Current metrics:', {
      activeUsers: metrics.active_users?.value,
      avgSessionDuration: metrics.session_duration?.value,
      topFeatures: metrics.feature_usage?.breakdown?.slice(0, 3)
    });

    return dashboard;
  } catch (error) {
    console.error('❌ Analytics operation failed:', error);
    throw error;
  }
}

// Example 5: Financial Operations with Wallet Service
async function financialOperations(sdk: CodaiSDK) {
  try {
    // Create a new wallet
    const wallet = await sdk.wallet.createWallet({
      name: 'My Business Wallet',
      currency: 'RON',
      type: 'business'
    });

    console.log('💰 Wallet created:', wallet.id);

    // Check balance
    const balance = await sdk.wallet.getBalance(wallet.id);
    console.log('💳 Current balance:', balance.amount, balance.currency);

    // Send payment
    const payment = await sdk.wallet.sendPayment({
      fromWalletId: wallet.id,
      toAccount: 'merchant@example.com',
      amount: 100.00,
      currency: 'RON',
      description: 'Service payment',
      metadata: {
        orderId: 'order-123',
        category: 'services'
      }
    });

    console.log('💸 Payment sent:', payment.transactionId);

    // Get transaction history
    const transactions = await sdk.wallet.getTransactions(wallet.id, {
      limit: 10,
      type: 'all'
    });

    console.log('📋 Recent transactions:', transactions.transactions.length);

    return { wallet, payment };
  } catch (error) {
    console.error('❌ Financial operation failed:', error);
    throw error;
  }
}

// Example 6: Marketplace Integration
async function marketplaceOperations(sdk: CodaiSDK) {
  try {
    // Create a product listing
    const product = await sdk.marketplace.createProduct({
      name: 'Premium AI Assistant License',
      description: 'One-year license for advanced AI assistant features',
      price: 299.99,
      currency: 'RON',
      category: 'software',
      images: ['https://example.com/product-image.jpg'],
      specifications: {
        'License Type': 'Commercial',
        'Duration': '12 months',
        'Support': '24/7'
      },
      inventory: {
        quantity: 100,
        trackInventory: true
      }
    });

    console.log('🛍️ Product created:', product.id);

    // Search products
    const searchResults = await sdk.marketplace.searchProducts({
      query: 'AI assistant',
      category: 'software',
      priceRange: { min: 0, max: 500 },
      sortBy: 'relevance'
    });

    console.log('🔍 Search results:', searchResults.products.length);

    // Create an order
    const order = await sdk.marketplace.createOrder({
      products: [
        {
          productId: product.id,
          quantity: 1,
          price: product.price
        }
      ],
      customer: {
        email: 'customer@example.com',
        name: 'John Doe'
      },
      shippingAddress: {
        street: '123 Main St',
        city: 'Bucharest',
        country: 'Romania',
        postalCode: '010101'
      },
      paymentMethod: 'wallet'
    });

    console.log('📦 Order created:', order.id);

    return { product, order };
  } catch (error) {
    console.error('❌ Marketplace operation failed:', error);
    throw error;
  }
}

// Example 7: Legal Document Management
async function legalDocumentManagement(sdk: CodaiSDK) {
  try {
    // Get available templates
    const templates = await sdk.legal.getTemplates({
      category: 'contracts',
      jurisdiction: 'Romania'
    });

    console.log('📋 Available templates:', templates.templates.length);

    // Create a contract from template
    const contract = await sdk.legal.createDocument({
      templateId: templates.templates[0]?.id,
      title: 'Service Agreement',
      data: {
        'client_name': 'ACME Corporation',
        'service_description': 'AI Assistant Implementation',
        'contract_value': '10,000 RON',
        'start_date': '2024-01-01',
        'end_date': '2024-12-31'
      }
    });

    console.log('📄 Contract created:', contract.id);

    // Schedule legal consultation
    const consultation = await sdk.legal.scheduleConsultation({
      type: 'contract_review',
      documentId: contract.id,
      preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      description: 'Review of AI service agreement'
    });

    console.log('⚖️ Consultation scheduled:', consultation.id);

    return { contract, consultation };
  } catch (error) {
    console.error('❌ Legal operation failed:', error);
    throw error;
  }
}

// Example 8: Customer Support Integration
async function customerSupportIntegration(sdk: CodaiSDK) {
  try {
    // Create support ticket
    const ticket = await sdk.support.createTicket({
      subject: 'SDK Integration Question',
      description: 'Need help with implementing cross-app communication',
      priority: 'medium',
      category: 'technical',
      requester: {
        name: 'Developer',
        email: 'dev@example.com'
      }
    });

    console.log('🎫 Support ticket created:', ticket.id);

    // Search knowledge base
    const kbResults = await sdk.support.searchKnowledgeBase({
      query: 'SDK integration best practices',
      category: 'technical'
    });

    console.log('📚 Knowledge base results:', kbResults.articles.length);

    // Start live chat if needed
    if (kbResults.articles.length === 0) {
      const chatSession = await sdk.support.startLiveChat({
        ticketId: ticket.id,
        initialMessage: 'I need help with SDK integration'
      });

      console.log('💬 Live chat started:', chatSession.id);

      return { ticket, chatSession };
    }

    return { ticket, kbResults };
  } catch (error) {
    console.error('❌ Support operation failed:', error);
    throw error;
  }
}

// Example 9: Identity Verification Flow
async function identityVerificationFlow(sdk: CodaiSDK) {
  try {
    // Start identity verification
    const verification = await sdk.identity.verifyIdentity({
      userId: 'user123',
      verificationType: 'enhanced',
      requiredDocuments: ['national_id', 'proof_of_address']
    });

    console.log('🆔 Identity verification started:', verification.id);

    // Upload verification documents
    const idDocument = new File(['ID document data'], 'id.pdf', {
      type: 'application/pdf'
    });

    const docUpload = await sdk.identity.uploadDocument({
      verificationId: verification.id,
      documentType: 'national_id',
      file: idDocument
    });

    console.log('📎 Document uploaded:', docUpload.id);

    // Check trust score
    const trustScore = await sdk.identity.getTrustScore('user123');
    console.log('⭐ Trust score:', trustScore.score, '/100');

    return { verification, trustScore };
  } catch (error) {
    console.error('❌ Identity verification failed:', error);
    throw error;
  }
}

// Example 10: Cross-App Event Communication
async function crossAppCommunication(sdk: CodaiSDK) {
  const eventBus = sdk.getEventBus();

  // Subscribe to cross-app events
  eventBus.subscribe('app:message', (data) => {
    console.log('📨 Received message from', data.from, ':', data.data);
  });

  eventBus.subscribe('app:broadcast', (data) => {
    console.log('📢 Broadcast from', data.from, ':', data.data);
  });

  // Send targeted message
  eventBus.sendMessage('analytics-app', {
    type: 'user_action',
    action: 'file_upload',
    userId: 'user123',
    timestamp: new Date()
  });

  // Broadcast to all apps
  eventBus.broadcast({
    type: 'system_announcement',
    message: 'Scheduled maintenance in 1 hour',
    priority: 'high'
  });

  console.log('📡 Cross-app communication established');
}

// Example 11: Health Monitoring and Diagnostics
async function healthMonitoringAndDiagnostics(sdk: CodaiSDK) {
  try {
    // Get comprehensive health status
    const health = await sdk.getHealth();

    console.log('🏥 System Health:', health.status);
    console.log('📊 Services Status:');

    Object.entries(health.services).forEach(([service, status]) => {
      const emoji = status.status === 'online' ? '✅' :
        status.status === 'error' ? '❌' : '⚠️';
      console.log(`  ${emoji} ${service}: ${status.status} (${status.responseTime}ms)`);
    });

    // Setup health monitoring
    sdk.getEventBus().subscribe('sdk:health:unhealthy', (data) => {
      console.log('🚨 Health alert:', data);
      // Implement alerting logic here
    });

    // Monitor specific service
    sdk.getEventBus().subscribe('service:error', (data) => {
      console.log('⚠️ Service error:', data.service, data.error.message);
      // Implement error handling/recovery logic
    });

    return health;
  } catch (error) {
    console.error('❌ Health monitoring failed:', error);
    throw error;
  }
}

// Complete Example: Full CODAI Ecosystem Integration
async function completeEcosystemIntegration() {
  try {
    console.log('🚀 Starting Complete CODAI Ecosystem Integration Demo...\n');

    // Step 1: Initialize SDK
    const sdk = await basicSDKSetup();
    console.log('');

    // Step 2: Authenticate user
    const user = await userAuthenticationFlow(sdk);
    console.log('');

    // Step 3: Handle data operations
    const dataOps = await dataStorageAndRetrieval(sdk);
    console.log('');

    // Step 4: Setup analytics
    const analytics = await analyticsAndTracking(sdk);
    console.log('');

    // Step 5: Financial operations
    const financial = await financialOperations(sdk);
    console.log('');

    // Step 6: Marketplace operations
    const marketplace = await marketplaceOperations(sdk);
    console.log('');

    // Step 7: Legal documents
    const legal = await legalDocumentManagement(sdk);
    console.log('');

    // Step 8: Customer support
    const support = await customerSupportIntegration(sdk);
    console.log('');

    // Step 9: Identity verification
    const identity = await identityVerificationFlow(sdk);
    console.log('');

    // Step 10: Cross-app communication
    await crossAppCommunication(sdk);
    console.log('');

    // Step 11: Health monitoring
    const health = await healthMonitoringAndDiagnostics(sdk);
    console.log('');

    console.log('✅ Complete CODAI Ecosystem Integration Demo Completed Successfully!');
    console.log('📈 Performance Summary:');
    console.log(`   • System Status: ${health.status}`);
    console.log(`   • Services Online: ${Object.values(health.services).filter(s => s.status === 'online').length}/9`);
    console.log(`   • Uptime: ${Math.round(health.uptime / 1000)}s`);
    console.log('');

    // Cleanup
    await sdk.destroy();
    console.log('🧹 SDK cleanup completed');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

// Export all examples for reuse
export {
  basicSDKSetup,
  userAuthenticationFlow,
  dataStorageAndRetrieval,
  analyticsAndTracking,
  financialOperations,
  marketplaceOperations,
  legalDocumentManagement,
  customerSupportIntegration,
  identityVerificationFlow,
  crossAppCommunication,
  healthMonitoringAndDiagnostics,
  completeEcosystemIntegration
};

// Run demo if this file is executed directly
if (require.main === module) {
  completeEcosystemIntegration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Demo failed:', error);
      process.exit(1);
    });
}
