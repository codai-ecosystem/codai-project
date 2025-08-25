const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BancAI Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    bankingOperations: {
      accountManagement: 'enabled',
      transactionProcessing: 'enabled',
      fraudDetection: 'enabled',
      creditScoring: 'ready',
      riskAssessment: 'ready'
    },
    aiFeatures: {
      financialAdvisor: 'enabled',
      marketAnalysis: 'enabled',
      personalizedOffers: 'enabled'
    },
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'BancAI Service',
    version: '1.0.0',
    description: 'AI-powered banking and financial services',
    endpoints: [
      '/api/health',
      '/api/accounts',
      '/api/transactions',
      '/api/ai/advisor',
      '/api/ai/analysis'
    ]
  });
});

// Banking endpoints
app.get('/api/accounts', (req, res) => {
  res.json({
    message: 'Banking accounts endpoint',
    features: ['account_creation', 'balance_inquiry', 'account_management']
  });
});

app.get('/api/transactions', (req, res) => {
  res.json({
    message: 'Transaction processing endpoint',
    features: ['transfer', 'payment', 'history', 'fraud_detection']
  });
});

// AI endpoints
app.get('/api/ai/advisor', (req, res) => {
  res.json({
    message: 'AI Financial Advisor endpoint',
    features: ['financial_planning', 'investment_advice', 'budget_optimization']
  });
});

app.get('/api/ai/analysis', (req, res) => {
  res.json({
    message: 'AI Market Analysis endpoint',
    features: ['market_trends', 'risk_analysis', 'opportunity_detection']
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏦 BancAI Service started successfully`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Ready to handle requests on port ${PORT}`);
});

module.exports = app;