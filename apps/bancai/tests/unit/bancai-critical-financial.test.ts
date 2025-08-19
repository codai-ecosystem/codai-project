import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import BancaiService from '../../src/services/BancaiService';
import { RealBankingService } from '../../src/services/RealBankingService';
import type {
  BankAccount,
  Transaction,
  Budget,
  Investment,
  CreditScore,
  FinancialGoal,
  PaymentMethod,
  LoanApplication,
  FinancialInsight,
  FraudAlert,
  BankingMetrics
} from '../../src/types';

// Mock Stripe and external financial APIs
const mockStripeCreate = vi.fn();
const mockStripeRetrieve = vi.fn();
const mockStripeConfirm = vi.fn();

// Mock RealPaymentProcessor
const mockProcessRealPayment = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    paymentIntents: {
      create: mockStripeCreate,
      retrieve: mockStripeRetrieve,
      confirm: mockStripeConfirm
    },
    customers: {
      create: vi.fn(),
      retrieve: vi.fn()
    },
    paymentMethods: {
      attach: vi.fn(),
      detach: vi.fn()
    }
  }))
}));

vi.mock('@azure/openai', () => ({
  OpenAIApi: vi.fn().mockImplementation(() => ({
    createChatCompletion: vi.fn(),
    createEmbedding: vi.fn()
  }))
}));

// Mock auth functions
vi.mock('../../src/lib/security/auth', () => ({
  verifySession: vi.fn().mockResolvedValue({
    userId: 'user-test-123',
    sessionId: 'session-test-123',
    authenticated: true
  })
}));

// Mock RealPaymentProcessor to return Stripe-like payment IDs
vi.mock('../../src/services/RealPaymentProcessor', () => ({
  RealPaymentProcessor: vi.fn().mockImplementation(() => ({
    processRealPayment: mockProcessRealPayment
  }))
}));

describe('BancAI Financial Service - CRITICAL SECURITY TESTING', () => {
  let bancaiService: BancaiService;
  let realBankingService: RealBankingService;
  let mockStripe: any;

  const testUser = {
    id: 'user-test-123',
    email: 'test@bancai.ro',
    creditScore: 750
  };

  const testAccount: Partial<BankAccount> = {
    id: 'acc-test-123',
    userId: 'user-test-123',
    type: 'checking',
    balance: 5000.00,
    currency: 'RON',
    accountNumber: '****1234'
  };

  beforeAll(async () => {
    // Ensure test environment is properly isolated
    process.env.NODE_ENV = 'test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset RealPaymentProcessor mock to default success behavior
    mockProcessRealPayment.mockResolvedValue({
      success: true,
      paymentId: 'pi_test_123', // This will be the paymentIntentId in the response
      status: 'succeeded'
    });

    // Reset Stripe mocks to default behavior
    mockStripeCreate.mockResolvedValue({
      id: 'pi_default_123',
      status: 'succeeded',
      amount: 25000,
      currency: 'ron'
    });

    bancaiService = BancaiService.getInstance();
    realBankingService = RealBankingService.getInstance();

    // Reset singleton for each test
    (RealBankingService as any).instance = null;
    realBankingService = RealBankingService.getInstance();

    // Create test account for balance operations
    await bancaiService.createBankAccount({
      userId: testUser.id,
      type: 'checking',
      initialDeposit: 5000.00,
      currency: 'RON'
    });
  });

  afterEach(async () => {
    await bancaiService?.shutdown?.();
  });

  describe('🏦 Bank Account Management - CRITICAL FINANCIAL DATA', () => {
    it('should create bank account with proper validation', async () => {
      const accountData = {
        userId: testUser.id,
        type: 'checking' as const,
        initialDeposit: 1000.00,
        currency: 'RON'
      };

      const account = await bancaiService.createBankAccount(accountData);

      expect(account.userId).toBe(testUser.id);
      expect(account.balance).toBe(1000.00);
      expect(account.accountNumber).toMatch(/\*{4}\d{4}/); // Should be masked
      expect(account.status).toBe('active');
    });

    it('should prevent unauthorized account access', async () => {
      const unauthorizedUserId = 'hacker-123';

      // Ensure account exists first
      const account = await bancaiService.getBankAccount('acc-test-123', testUser.id);
      expect(account).toBeDefined();

      // Now test unauthorized access to the same account
      await expect(
        bancaiService.getBankAccount('acc-test-123', unauthorizedUserId)
      ).rejects.toThrow('Unauthorized access to bank account');
    });

    it('should validate account balance operations', async () => {
      const invalidAmount = -100;

      await expect(
        bancaiService.updateAccountBalance(testAccount.id!, invalidAmount)
      ).rejects.toThrow('Invalid amount for balance update');
    });

    it('should enforce account limits and restrictions', async () => {
      const largAmount = 1000000; // 1M RON

      await expect(
        bancaiService.updateAccountBalance(testAccount.id!, largAmount)
      ).rejects.toThrow('Amount exceeds daily transaction limit');
    });

    it('should properly mask sensitive account information', async () => {
      const account = await bancaiService.getBankAccount(testAccount.id!, testUser.id);

      expect(account.accountNumber).toMatch(/\*{4}\d{4}/);
      expect(account.routingNumber).toBeUndefined(); // Should not be exposed
      expect(account.fullAccountNumber).toBeUndefined(); // Should not be exposed
    });
  });

  describe('💳 Payment Processing - CRITICAL FINANCIAL TRANSACTIONS', () => {
    const testPaymentData = {
      userId: testUser.id, // Added userId for authorization
      amount: 250.00,
      currency: 'RON',
      description: 'Test payment for services',
      paymentMethodId: 'pm_test_123'
    };

    it('should process real payments with Stripe integration', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 25000, // In cents
        currency: 'ron',
        client_secret: 'pi_test_123_secret'
      };

      // Configure RealPaymentProcessor mock to return expected payment ID
      mockProcessRealPayment.mockResolvedValue({
        success: true,
        paymentId: 'pi_test_123',
        status: 'succeeded',
        amount: 250.00,
        currency: 'ron',
        fees: { processingFee: 0 },
        providerResponse: {},
        fraudScore: 0,
        complianceFlags: []
      });

      const result = await realBankingService.processRealPayment(testPaymentData);

      expect(result.success).toBe(true);
      expect(result.paymentIntentId).toBe('pi_test_123');
      expect(result.amount).toBe(250.00);
      expect(mockProcessRealPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: testPaymentData.amount,
          currency: testPaymentData.currency.toLowerCase(),
          description: testPaymentData.description,
          userId: testPaymentData.userId
        })
      );
    });

    it('should handle payment failures gracefully', async () => {
      const mockStripeError = new Error('Payment declined by bank');

      // Configure RealPaymentProcessor mock to reject
      mockProcessRealPayment.mockRejectedValue(mockStripeError);

      await expect(
        realBankingService.processRealPayment(testPaymentData)
      ).rejects.toThrow('Payment declined by bank');
    });

    it('should validate payment amounts and prevent fraud', async () => {
      const fraudulentPayment = {
        ...testPaymentData,
        amount: 999999.99 // Suspicious large amount
      };

      await expect(
        realBankingService.processRealPayment(fraudulentPayment)
      ).rejects.toThrow('Payment amount exceeds fraud threshold');
    });

    it('should enforce PCI DSS compliance for card data', async () => {
      const paymentWithCardData = {
        ...testPaymentData,
        cardNumber: '4242424242424242' // Raw card number - should be rejected
      };

      await expect(
        realBankingService.processRealPayment(paymentWithCardData as any)
      ).rejects.toThrow('Raw card data not allowed - use tokenized payment methods');
    });

    it('should log all payment transactions for compliance', async () => {
      // Create a spy for the audit service
      const auditSpy = vi.fn();

      // Mock the auditService on the realBankingService instance
      (realBankingService as any).auditService = {
        logPaymentTransaction: auditSpy
      };

      // Configure RealPaymentProcessor mock for audit test
      mockProcessRealPayment.mockResolvedValue({
        success: true,
        paymentId: 'pi_audit_test_123',
        status: 'succeeded',
        amount: 250.00,
        currency: 'ron',
        fees: { processingFee: 0 },
        providerResponse: {},
        fraudScore: 0,
        complianceFlags: []
      });

      await realBankingService.processRealPayment(testPaymentData);

      expect(auditSpy).toHaveBeenCalledWith({
        action: 'payment_processed',
        amount: testPaymentData.amount,
        userId: testPaymentData.userId,
        paymentIntentId: 'pi_audit_test_123',
        timestamp: expect.any(String)
      });
    });
  });

  describe('📊 Credit Score Management - SENSITIVE FINANCIAL DATA', () => {
    const testCreditScore: Partial<CreditScore> = {
      userId: testUser.id,
      score: 750,
      provider: 'TransUnion',
      lastUpdated: new Date(),
      factors: ['payment_history', 'credit_utilization']
    };

    it('should retrieve credit score with proper authorization', async () => {
      const creditScore = await bancaiService.getCreditScore(testUser.id);

      expect(creditScore.userId).toBe(testUser.id);
      expect(creditScore.score).toBeGreaterThanOrEqual(300);
      expect(creditScore.score).toBeLessThanOrEqual(850);
    });

    it('should prevent unauthorized credit score access', async () => {
      const unauthorizedUserId = 'other-user-456';

      await expect(
        bancaiService.getCreditScore(unauthorizedUserId, testUser.id)
      ).rejects.toThrow('Unauthorized access to credit information');
    });

    it('should update credit score with proper validation', async () => {
      const mockUpdatedScore = { ...testCreditScore, score: 780 };

      const result = await bancaiService.updateCreditScore(testUser.id);

      expect(result.score).toBeGreaterThanOrEqual(300);
      expect(result.lastUpdated).toBeInstanceOf(Date);
      expect(result.provider).toBeDefined();
    });

    it('should track credit score history for analysis', async () => {
      const history = await bancaiService.getCreditScoreHistory(testUser.id);

      expect(history).toBeInstanceOf(Array);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('score');
      expect(history[0]).toHaveProperty('date');
    });

    it('should alert on significant credit score changes', async () => {
      const alertSpy = vi.fn();
      bancaiService.on('credit-score-alert', alertSpy);

      // Simulate significant drop
      await bancaiService.updateCreditScore(testUser.id, { scoreDrop: 100 });

      expect(alertSpy).toHaveBeenCalledWith({
        userId: testUser.id,
        changeType: 'significant_drop',
        oldScore: expect.any(Number),
        newScore: expect.any(Number)
      });
    });
  });

  describe('🚨 Fraud Detection - CRITICAL SECURITY FEATURE', () => {
    it('should detect suspicious transaction patterns', async () => {
      const suspiciousTransactions = [
        { amount: 1000, location: 'Romania', timestamp: new Date() },
        { amount: 1200, location: 'Nigeria', timestamp: new Date() }, // Different country
        { amount: 1500, location: 'Russia', timestamp: new Date() }   // Another country
      ];

      const fraudAlerts = await bancaiService.analyzeFraudPatterns(testUser.id, suspiciousTransactions);

      expect(fraudAlerts).toBeInstanceOf(Array);
      expect(fraudAlerts.length).toBeGreaterThan(0);
      expect(fraudAlerts[0]).toHaveProperty('riskLevel');
      expect(fraudAlerts[0]).toHaveProperty('reason');
    });

    it('should block transactions flagged as high-risk fraud', async () => {
      const fraudulentTransaction = {
        amount: 5000,
        location: 'Unknown Country',
        deviceId: 'suspicious-device',
        timestamp: new Date()
      };

      await expect(
        bancaiService.processTransaction(testUser.id, fraudulentTransaction)
      ).rejects.toThrow('Transaction blocked due to fraud risk');
    });

    it('should require additional verification for flagged transactions', async () => {
      const flaggedTransaction = {
        amount: 2500, // Medium-risk amount
        location: 'Romania',
        timestamp: new Date()
      };

      const result = await bancaiService.processTransaction(testUser.id, flaggedTransaction);

      expect(result.status).toBe('requires_verification');
      expect(result.verificationMethods).toContain('sms');
      expect(result.verificationMethods).toContain('email');
    });

    it('should maintain fraud detection model accuracy', async () => {
      const modelMetrics = await bancaiService.getFraudDetectionMetrics();

      expect(modelMetrics.accuracy).toBeGreaterThan(0.95); // 95% accuracy minimum
      expect(modelMetrics.falsePositiveRate).toBeLessThan(0.05); // <5% false positives
      expect(modelMetrics.lastUpdated).toBeInstanceOf(Date);
    });

    it('should adapt fraud rules based on emerging threats', async () => {
      const newThreatPattern = {
        name: 'cryptocurrency_wash_trading',
        indicators: ['rapid_transfers', 'round_amounts', 'crypto_exchanges'],
        severity: 'high'
      };

      await bancaiService.updateFraudRules(newThreatPattern);

      const updatedRules = await bancaiService.getFraudRules();
      expect(updatedRules.some(rule => rule.name === 'cryptocurrency_wash_trading')).toBe(true);
    });
  });

  describe('📈 Investment Management - FINANCIAL ADVISORY SERVICES', () => {
    const testInvestment: Partial<Investment> = {
      symbol: 'BVB:TLV', // Romanian stock exchange
      shares: 100,
      purchasePrice: 50.00,
      currentPrice: 55.00,
      currency: 'RON'
    };

    it('should track investment portfolio performance', async () => {
      const portfolio = await bancaiService.getInvestmentPortfolio(testUser.id);

      expect(portfolio).toHaveProperty('totalValue');
      expect(portfolio).toHaveProperty('dayChange');
      expect(portfolio).toHaveProperty('totalReturn');
      expect(portfolio.investments).toBeInstanceOf(Array);
    });

    it('should provide Romanian market-specific investment data', async () => {
      const romanianStocks = await bancaiService.getRomanianMarketData();

      expect(romanianStocks).toBeInstanceOf(Array);
      expect(romanianStocks[0]).toHaveProperty('symbol');
      expect(romanianStocks[0]).toHaveProperty('exchange');
      expect(romanianStocks[0].exchange).toBe('BVB'); // Bucharest Stock Exchange
    });

    it('should calculate accurate investment returns', async () => {
      const investment = await bancaiService.addInvestment(testUser.id, testInvestment);

      expect(investment.totalReturn).toBe(500.00); // (55-50) * 100 shares
      expect(investment.returnPercentage).toBe(10.00); // 5/50 * 100
    });

    it('should provide investment risk analysis', async () => {
      const riskAnalysis = await bancaiService.analyzeInvestmentRisk(testUser.id);

      expect(riskAnalysis).toHaveProperty('riskScore');
      expect(riskAnalysis).toHaveProperty('diversificationScore');
      expect(riskAnalysis).toHaveProperty('recommendations');
      expect(riskAnalysis.riskScore).toBeGreaterThanOrEqual(1);
      expect(riskAnalysis.riskScore).toBeLessThanOrEqual(10);
    });
  });

  describe('💰 Budget and Financial Goals - PERSONAL FINANCE MANAGEMENT', () => {
    const testBudget: Partial<Budget> = {
      userId: testUser.id,
      category: 'groceries',
      limit: 1500.00,
      period: 'monthly',
      currency: 'RON'
    };

    it('should create and manage budgets with Romanian context', async () => {
      const budget = await bancaiService.createBudget(testBudget);

      expect(budget.userId).toBe(testUser.id);
      expect(budget.currency).toBe('RON');
      expect(budget.limit).toBe(1500.00);
    });

    it('should track budget spending and send alerts', async () => {
      const alertSpy = vi.fn();
      bancaiService.on('budget-alert', alertSpy);

      await bancaiService.updateBudgetSpending(testBudget.id!, 1200.00); // 80% of limit

      expect(alertSpy).toHaveBeenCalledWith({
        budgetId: testBudget.id,
        percentage: 80,
        alertType: 'approaching_limit'
      });
    });

    it('should provide Romanian cost of living insights', async () => {
      const insights = await bancaiService.getRomanianCostOfLivingInsights(testUser.id);

      expect(insights).toHaveProperty('averageRent');
      expect(insights).toHaveProperty('averageUtilities');
      expect(insights).toHaveProperty('averageFood');
      expect(insights.city).toBeDefined(); // Should detect user's city
    });

    it('should set and track financial goals in RON', async () => {
      const goal: Partial<FinancialGoal> = {
        userId: testUser.id,
        type: 'emergency_fund',
        targetAmount: 25000.00, // RON
        deadline: new Date('2025-12-31'),
        currency: 'RON'
      };

      const financialGoal = await bancaiService.createFinancialGoal(goal);

      expect(financialGoal.currency).toBe('RON');
      expect(financialGoal.targetAmount).toBe(25000.00);
      expect(financialGoal.progress).toBe(0);
    });
  });

  describe('🏦 Loan Applications - CREDIT SERVICES', () => {
    const testLoanApplication: Partial<LoanApplication> = {
      userId: testUser.id,
      type: 'personal',
      amount: 50000.00,
      currency: 'RON',
      term: 60, // months
      purpose: 'home_improvement'
    };

    it('should process loan applications with Romanian regulations', async () => {
      const application = await bancaiService.createLoanApplication(testLoanApplication);

      expect(application.userId).toBe(testUser.id);
      expect(application.status).toBe('submitted');
      expect(application.currency).toBe('RON');
    });

    it('should calculate loan terms according to Romanian banking law', async () => {
      const loanTerms = await bancaiService.calculateLoanTerms(testLoanApplication);

      expect(loanTerms).toHaveProperty('monthlyPayment');
      expect(loanTerms).toHaveProperty('totalInterest');
      expect(loanTerms).toHaveProperty('apr');
      expect(loanTerms.apr).toBeLessThan(0.50); // Romanian APR regulations
    });

    it('should validate creditworthiness for loan approval', async () => {
      const creditCheck = await bancaiService.performCreditCheck(testUser.id, testLoanApplication);

      expect(creditCheck).toHaveProperty('approved');
      expect(creditCheck).toHaveProperty('creditScore');
      expect(creditCheck).toHaveProperty('riskFactors');
    });

    it('should comply with Romanian consumer protection laws', async () => {
      const consumerDisclosure = await bancaiService.generateLoanDisclosure(testLoanApplication);

      expect(consumerDisclosure).toContain('Drepturile consumatorului'); // Consumer rights in Romanian
      expect(consumerDisclosure).toContain('perioada de reflexie'); // Cooling-off period
      expect(consumerDisclosure).toContain('ANPC'); // Romanian consumer protection authority
    });
  });

  describe('🛡️ Security and Compliance - CRITICAL PROTECTION', () => {
    it('should encrypt all sensitive financial data', async () => {
      const sensitiveData = {
        accountNumber: '1234567890123456',
        routingNumber: '123456789',
        socialSecurityNumber: '1234567890123'
      };

      const encrypted = await bancaiService.encryptSensitiveData(sensitiveData);

      expect(encrypted.accountNumber).not.toBe(sensitiveData.accountNumber);
      expect(encrypted.accountNumber).toMatch(/^enc_/); // Should be encrypted
    });

    it('should implement proper session management', async () => {
      const session = await bancaiService.createSecureSession(testUser.id);

      expect(session).toHaveProperty('sessionId');
      expect(session).toHaveProperty('expiresAt');
      expect(session.sessionId).toHaveLength(64); // Secure session ID length
    });

    it('should audit all financial operations', async () => {
      const auditSpy = vi.fn();
      bancaiService.on('audit-log', auditSpy);

      await bancaiService.getBankAccount(testAccount.id!, testUser.id);

      expect(auditSpy).toHaveBeenCalledWith({
        action: 'account_accessed',
        userId: testUser.id,
        accountId: testAccount.id,
        timestamp: expect.any(Date),
        ipAddress: expect.any(String)
      });
    });

    it('should implement GDPR compliance for Romanian users', async () => {
      const gdprData = await bancaiService.generateGDPRDataExport(testUser.id);

      expect(gdprData).toHaveProperty('personalData');
      expect(gdprData).toHaveProperty('financialData');
      expect(gdprData).toHaveProperty('processingBasis');
      expect(gdprData.processingBasis).toContain('contractual_necessity');
    });

    it('should handle data deletion requests (right to be forgotten)', async () => {
      const deletionRequest = await bancaiService.processDataDeletionRequest(testUser.id);

      expect(deletionRequest.status).toBe('scheduled');
      expect(deletionRequest.retentionPeriod).toBe(7); // Years for financial data
      expect(deletionRequest.gdprCompliant).toBe(true);
    });
  });

  describe('📊 Performance and Reliability - CRITICAL UPTIME', () => {
    it('should handle high transaction volume efficiently', async () => {
      const startTime = Date.now();
      const transactions = Array.from({ length: 1000 }, (_, i) => ({
        amount: 1.00, // Reduced amount to prevent insufficient funds
        type: 'credit', // Use credit transactions to add money instead of debit
        description: `Test transaction ${i}`,
        timestamp: new Date()
      }));

      const results = await Promise.all(
        transactions.map(tx => bancaiService.processTransaction(testUser.id, tx))
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10000); // Should process 1000 transactions in <10s
      expect(results.every(r => r.status === 'completed')).toBe(true);
    });

    it('should maintain data consistency during concurrent operations', async () => {
      // Get the first account created in beforeEach for this user
      const userAccounts = Array.from((bancaiService as any).accounts.values())
        .filter((account: any) => account.userId === testUser.id);

      expect(userAccounts.length).toBeGreaterThan(0);
      const actualAccount = userAccounts[0];
      const actualAccountId = actualAccount.id;

      console.log('Using account:', actualAccountId, 'for user:', testUser.id);
      console.log('Account balance before test:', actualAccount.balance);

      const initialBalance = 5000.00;
      await bancaiService.setAccountBalance(actualAccountId, initialBalance);

      // Verify initial balance is set correctly
      const balanceAfterSet = await bancaiService.getAccountBalance(actualAccountId);
      expect(balanceAfterSet).toBe(5000.00);

      // Simulate concurrent transactions
      const concurrentTransactions = [
        bancaiService.processTransaction(testUser.id, { amount: 100, type: 'debit' }),
        bancaiService.processTransaction(testUser.id, { amount: 200, type: 'debit' }),
        bancaiService.processTransaction(testUser.id, { amount: 300, type: 'debit' })
      ];

      const transactionResults = await Promise.all(concurrentTransactions);

      // Debug: Log transaction results
      console.log('Transaction results:', transactionResults);

      const finalBalance = await bancaiService.getAccountBalance(actualAccountId);
      console.log('Final balance:', finalBalance, 'Expected:', 4400);

      expect(finalBalance).toBe(4400.00); // 5000 - 100 - 200 - 300
    });

    it('should implement circuit breaker for external services', async () => {
      // Simulate external service failures
      for (let i = 0; i < 5; i++) {
        try {
          await bancaiService.getExchangeRates();
        } catch (error) {
          // Expected failures
        }
      }

      // Circuit should now be open
      await expect(
        bancaiService.getExchangeRates()
      ).rejects.toThrow('Circuit breaker is open');
    });

    it('should provide real-time banking metrics', async () => {
      const metrics = await bancaiService.getBankingMetrics();

      expect(metrics).toHaveProperty('totalTransactions');
      expect(metrics).toHaveProperty('totalVolume');
      expect(metrics).toHaveProperty('averageTransactionTime');
      expect(metrics).toHaveProperty('systemUptime');
      expect(metrics.systemUptime).toBeGreaterThan(0.99); // 99% uptime minimum
    });
  });

  describe('🌍 Romanian Market Integration - LOCAL COMPLIANCE', () => {
    it('should integrate with Romanian banking infrastructure', async () => {
      const romanianBanks = await bancaiService.getRomanianBankList();

      expect(romanianBanks).toBeInstanceOf(Array);
      expect(romanianBanks.some(bank => bank.name.includes('BCR'))).toBe(true);
      expect(romanianBanks.some(bank => bank.name.includes('BRD'))).toBe(true);
    });

    it('should handle Romanian tax calculations', async () => {
      const taxCalculation = await bancaiService.calculateRomanianTaxes(testUser.id, {
        income: 100000, // RON
        year: 2025
      });

      expect(taxCalculation).toHaveProperty('incomeTax');
      expect(taxCalculation).toHaveProperty('socialSecurity');
      expect(taxCalculation).toHaveProperty('healthInsurance');
      expect(taxCalculation.incomeTax).toBeGreaterThan(0);
    });

    it('should provide Romanian financial regulatory compliance', async () => {
      const compliance = await bancaiService.checkRomanianCompliance();

      expect(compliance.nbr_registered).toBe(true); // National Bank of Romania
      expect(compliance.asfCompliant).toBe(true); // Financial Supervisory Authority
      expect(compliance.gdprCompliant).toBe(true);
    });
  });
});
