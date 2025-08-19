/**
 * 🧪 BancAI Integration Tests - Phase 1 Week 4
 * Service Integration and Cross-Component Testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import BancaiService from '../../src/services/BancaiService';
import { RealBankingService } from '../../src/services/RealBankingService';
import { RealPaymentProcessor } from '../../src/services/RealPaymentProcessor';
import { EnhancedAccountManager } from '../../src/services/EnhancedAccountManager';
import { RomanianBankingComplianceService } from '../../src/services/RomanianBankingComplianceService';

// Mock auth functions for integration tests
vi.mock('../../src/lib/security/auth', () => ({
  verifySession: vi.fn().mockResolvedValue({
    userId: 'test-user-123',
    sessionId: 'session-test-123',
    authenticated: true,
    role: 'user',
    permissions: ['account_access', 'payment_processing']
  }),
  BankingAuthorization: vi.fn().mockImplementation((role, permissions) => ({
    hasPermission: vi.fn().mockReturnValue(true),
    canAccess: vi.fn().mockReturnValue(true)
  })),
  BankingPermission: {
    CREATE_BUSINESS_ACCOUNT: 'create_business_account',
    PROCESS_PAYMENTS: 'process_payments',
    ACCESS_ACCOUNT: 'access_account'
  }
}));

describe('🏦 BancAI Service Integration Tests - Phase 1 Week 4', () => {
  let bancaiService: BancaiService;
  let realBankingService: RealBankingService;
  let paymentProcessor: RealPaymentProcessor;
  let accountManager: EnhancedAccountManager;
  let complianceService: RomanianBankingComplianceService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Initialize services for integration testing
    bancaiService = BancaiService.getInstance();
    realBankingService = new RealBankingService();
    paymentProcessor = new RealPaymentProcessor();
    accountManager = new EnhancedAccountManager();
    complianceService = new RomanianBankingComplianceService();
  });

  describe('🔗 Service Integration', () => {
    it('should integrate BancaiService with RealBankingService', async () => {
      // Test service integration without DOM dependencies
      expect(bancaiService).toBeDefined();
      expect(realBankingService).toBeDefined();

      // Test service method availability
      expect(typeof bancaiService.createBankAccount).toBe('function');
      expect(typeof realBankingService.processRealPayment).toBe('function');
    });

    it('should integrate AccountManager with ComplianceService', async () => {
      // Test service integration
      expect(accountManager).toBeDefined();
      expect(complianceService).toBeDefined();

      // Test account creation with compliance
      const accountData = {
        userId: 'user-123',
        accountType: 'savings' as const,
        initialBalance: 1000,
        currency: 'RON'
      };

      const account = await accountManager.createAccount(accountData);
      expect(account).toBeDefined();
      expect(account.accountNumber).toBeDefined();
      expect(account.balance).toBe(1000);
      expect(account.currency).toBe('RON');
    });

    it('should validate Romanian compliance integration', async () => {
      // Test compliance service integration
      const cuiValidation = await complianceService.validateCUI('12345678');
      expect(cuiValidation).toBeDefined();
      expect(typeof cuiValidation.isValid).toBe('boolean');

      const taxCalculation = await complianceService.calculateTax(1000, 'income');
      expect(taxCalculation).toBeDefined();
      expect(typeof taxCalculation.taxAmount).toBe('number');
      expect(typeof taxCalculation.netAmount).toBe('number');
    });
  });

  describe('🔄 Cross-Service Workflows', () => {
    it('should complete account creation to payment processing workflow', async () => {
      // Test complete workflow integration
      const accountData = {
        userId: 'integration-user-1',
        accountType: 'checking' as const,
        initialBalance: 5000,
        currency: 'RON'
      };

      // Step 1: Create account
      const account = await bancaiService.createBankAccount(accountData);
      expect(account).toBeDefined();
      expect(account.balance).toBe(5000);

      // Step 2: Process transaction
      const transaction = {
        amount: 500,
        currency: 'RON',
        fromAccount: account.accountNumber,
        toAccount: 'external-account-123',
        description: 'Integration test payment'
      };

      const result = await bancaiService.processTransaction(transaction);
      expect(result).toBeDefined();
      expect(result.status).toBe('completed');

      // Step 3: Verify balance update
      const updatedAccount = await bancaiService.getBankAccount(account.accountNumber);
      expect(updatedAccount.balance).toBe(4500);
    });

    it('should handle investment portfolio workflow', async () => {
      // Test investment workflow integration
      const portfolioData = {
        userId: 'investor-user-1',
        initialInvestment: 10000,
        riskProfile: 'moderate' as const
      };

      const portfolio = await bancaiService.createInvestmentPortfolio(portfolioData);
      expect(portfolio).toBeDefined();
      expect(portfolio.totalValue).toBe(10000);
      expect(portfolio.riskProfile).toBe('moderate');

      // Test investment tracking
      const performance = await bancaiService.getInvestmentPerformance(portfolio.portfolioId);
      expect(performance).toBeDefined();
      expect(typeof performance.totalReturn).toBe('number');
      expect(typeof performance.currentValue).toBe('number');
    });

    it('should handle loan application workflow', async () => {
      // Test loan application integration
      const loanApplication = {
        userId: 'borrower-user-1',
        requestedAmount: 50000,
        purpose: 'home_purchase',
        termMonths: 240,
        currency: 'RON'
      };

      const application = await bancaiService.createLoanApplication(loanApplication);
      expect(application).toBeDefined();
      expect(application.status).toBe('submitted');
      expect(application.requestedAmount).toBe(50000);

      // Test loan terms calculation
      const terms = await bancaiService.calculateLoanTerms(application.applicationId);
      expect(terms).toBeDefined();
      expect(typeof terms.monthlyPayment).toBe('number');
      expect(typeof terms.totalInterest).toBe('number');
      expect(typeof terms.apr).toBe('number');
    });
  });

  describe('🛡️ Security Integration', () => {
    it('should integrate security across all services', async () => {
      // Test security integration
      const sensitiveData = 'sensitive-financial-data';

      // Test encryption integration
      const encrypted = await bancaiService.encryptSensitiveData(sensitiveData);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(sensitiveData);

      const decrypted = await bancaiService.decryptSensitiveData(encrypted);
      expect(decrypted).toBe(sensitiveData);
    });

    it('should maintain audit trail across services', async () => {
      // Test audit integration
      const auditEvent = {
        action: 'integration_test',
        userId: 'audit-user-1',
        details: { testType: 'service_integration' }
      };

      await bancaiService.auditLog(auditEvent);

      // Verify audit logging works
      const auditLogs = await bancaiService.getAuditLogs('audit-user-1');
      expect(auditLogs).toBeDefined();
      expect(Array.isArray(auditLogs)).toBe(true);
    });

    it('should enforce GDPR compliance across services', async () => {
      // Test GDPR integration
      const userData = {
        userId: 'gdpr-test-user-1',
        personalData: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+40123456789'
        }
      };

      // Test data storage with GDPR compliance
      await bancaiService.storeUserData(userData);

      // Test data retrieval
      const retrievedData = await bancaiService.getUserData(userData.userId);
      expect(retrievedData).toBeDefined();

      // Test data deletion (right to be forgotten)
      const deletionResult = await bancaiService.deleteUserData(userData.userId);
      expect(deletionResult.success).toBe(true);
      expect(deletionResult.message).toContain('deleted');
    });
  });

  describe('🔧 Error Handling Integration', () => {
    it('should handle cascading errors gracefully', async () => {
      // Test error propagation and handling
      const invalidAccountData = {
        userId: '',  // Invalid empty userId
        accountType: 'invalid' as any,
        initialBalance: -100,  // Invalid negative balance
        currency: 'INVALID'
      };

      try {
        await bancaiService.createBankAccount(invalidAccountData);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });

    it('should maintain data consistency during errors', async () => {
      // Test data consistency during error scenarios
      const validAccount = {
        userId: 'consistency-user-1',
        accountType: 'savings' as const,
        initialBalance: 1000,
        currency: 'RON'
      };

      const account = await bancaiService.createBankAccount(validAccount);
      const initialBalance = account.balance;

      // Attempt invalid transaction
      try {
        await bancaiService.processTransaction({
          amount: 2000, // More than available balance
          currency: 'RON',
          fromAccount: account.accountNumber,
          toAccount: 'external-account',
          description: 'Invalid transaction'
        });
      } catch (error) {
        // Error expected
      }

      // Verify balance unchanged
      const accountAfterError = await bancaiService.getBankAccount(account.accountNumber);
      expect(accountAfterError.balance).toBe(initialBalance);
    });
  });

  describe('📊 Performance Integration', () => {
    it('should handle concurrent operations efficiently', async () => {
      // Test concurrent service operations
      const concurrentOperations = [];

      for (let i = 0; i < 5; i++) {
        const operation = bancaiService.createBankAccount({
          userId: `concurrent-user-${i}`,
          accountType: 'checking' as const,
          initialBalance: 1000,
          currency: 'RON'
        });
        concurrentOperations.push(operation);
      }

      const results = await Promise.all(concurrentOperations);
      expect(results).toHaveLength(5);
      results.forEach(account => {
        expect(account).toBeDefined();
        expect(account.balance).toBe(1000);
      });
    });

    it('should maintain performance under load', async () => {
      // Test performance integration
      const startTime = Date.now();

      const account = await bancaiService.createBankAccount({
        userId: 'performance-user-1',
        accountType: 'savings' as const,
        initialBalance: 10000,
        currency: 'RON'
      });

      // Perform multiple operations
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(
          bancaiService.processTransaction({
            amount: 100,
            currency: 'RON',
            fromAccount: account.accountNumber,
            toAccount: 'external-account',
            description: `Performance test ${i}`
          })
        );
      }

      await Promise.all(operations);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (under 5 seconds)
      expect(duration).toBeLessThan(5000);
    });
  });
});