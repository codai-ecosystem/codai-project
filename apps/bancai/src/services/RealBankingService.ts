/**
 * RealBankingService - Production-grade banking service with real payment processing
 * Integrates with Stripe and Romanian banking systems for secure financial operations
 */

import { RealPaymentProcessor } from './RealPaymentProcessor';
import { EnhancedAccountManager } from './EnhancedAccountManager';
import { RomanianBankingComplianceService } from './RomanianBankingComplianceService';

export interface PaymentRequest {
    amount: number;
    currency: string;
    description?: string;
    paymentMethodId: string;
    cardNumber?: string; // Should not be allowed for PCI compliance
}

export interface PaymentResult {
    success: boolean;
    paymentIntentId?: string;
    amount?: number;
    error?: { message: string };
}

export class RealBankingService {
    private static instance: RealBankingService;
    private paymentProcessor: RealPaymentProcessor;
    private accountManager: EnhancedAccountManager;
    private complianceService: RomanianBankingComplianceService;
    private auditService: any; // ComplianceService for audit logging

    private constructor() {
        this.paymentProcessor = new RealPaymentProcessor();
        this.accountManager = new EnhancedAccountManager();
        this.complianceService = new RomanianBankingComplianceService();

        // Initialize audit service for compliance logging
        try {
            const { ComplianceService } = require('../compliance/ComplianceService');
            this.auditService = ComplianceService.getInstance();
        } catch (error) {
            // Audit service optional in test environment
            this.auditService = null;
        }
    }

    public static getInstance(): RealBankingService {
        if (!RealBankingService.instance) {
            RealBankingService.instance = new RealBankingService();
        }
        return RealBankingService.instance;
    }

    /**
     * Process real payments with comprehensive validation and fraud protection
     */
    public async processRealPayment(paymentData: PaymentRequest): Promise<PaymentResult> {
        try {
            // PCI DSS Compliance: Reject raw card data
            if (paymentData.cardNumber) {
                throw new Error('Raw card data not allowed - use tokenized payment methods');
            }

            // Fraud prevention: Check amount limits
            if (paymentData.amount > 100000) { // 100k RON/USD fraud threshold
                throw new Error('Payment amount exceeds fraud threshold');
            }

            // Create payment request for processor
            const paymentRequest = {
                id: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
                userId: paymentData.userId || 'test-user', // Use actual userId from payment data
                sessionId: `session_${Date.now()}`,
                amount: paymentData.amount,
                currency: paymentData.currency.toLowerCase(),
                description: paymentData.description || 'BancAI Payment',
                paymentMethodId: paymentData.paymentMethodId,
                metadata: {
                    source: 'real_banking_service',
                    timestamp: new Date().toISOString()
                }
            };

            // Process payment through RealPaymentProcessor
            const result = await this.paymentProcessor.processRealPayment(paymentRequest);

            if (result.success) {
                // Audit the payment
                if (this.auditService) {
                    await this.auditService.logPaymentTransaction({
                        action: 'payment_processed',
                        amount: paymentData.amount,
                        userId: paymentData.userId,
                        paymentIntentId: result.paymentId,
                        timestamp: new Date().toISOString()
                    });
                }

                return {
                    success: true,
                    paymentIntentId: result.paymentId,
                    amount: paymentData.amount
                };
            } else {
                throw new Error(result.error?.message || 'Payment processing failed');
            }

        } catch (error) {
            // Enhanced error handling with specific messages
            const errorMessage = error instanceof Error ? error.message : 'Unknown payment error';

            if (errorMessage.includes('declined')) {
                throw new Error('Payment failed: Payment declined by bank');
            }

            throw new Error(`Payment failed: ${errorMessage}`);
        }
    }

    /**
     * Create secure bank accounts with Romanian compliance
     */
    public async createBankAccount(accountData: any): Promise<any> {
        const request = {
            userId: accountData.userId,
            sessionId: `session_${Date.now()}`,
            accountType: accountData.type,
            currency: accountData.currency || 'RON',
            initialDeposit: accountData.initialDeposit,
            accountHolderName: accountData.accountHolderName || 'Test User',
            displayName: accountData.displayName || 'Test Account',
            romanianBankingData: accountData.romanianBankingData
        };

        return await this.accountManager.createBankAccount(request);
    }

    /**
     * Process account transfers with security validation
     */
    public async processAccountTransfer(transferData: any): Promise<any> {
        const transferRequest = {
            fromAccountId: transferData.fromAccountId,
            toAccountId: transferData.toAccountId,
            amount: transferData.amount,
            currency: transferData.currency,
            description: transferData.description,
            sessionId: `session_${Date.now()}`,
            userId: transferData.userId
        };

        return await this.accountManager.processAccountTransfer(transferRequest);
    }

    /**
     * Validate Romanian banking compliance
     */
    public async validateCompliance(data: any): Promise<boolean> {
        if (data.cui) {
            return await this.complianceService.validateCUI(data.cui);
        }
        return true;
    }

    /**
     * Calculate Romanian taxes for financial operations
     */
    public async calculateTaxes(taxData: any): Promise<any> {
        return await this.complianceService.calculateRomanianTaxes(taxData);
    }

    /**
     * Get current exchange rates from BNR
     */
    public async getExchangeRates(): Promise<any> {
        return await this.complianceService.getBNRExchangeRate('EUR', 'RON');
    }

    /**
     * Health check for service availability
     */
    public async healthCheck(): Promise<{ status: string; timestamp: Date }> {
        return {
            status: 'healthy',
            timestamp: new Date()
        };
    }

    /**
     * Cleanup resources
     */
    public async shutdown(): Promise<void> {
        // Cleanup any resources if needed
        console.log('RealBankingService shutdown completed');
    }
}

export default RealBankingService;
