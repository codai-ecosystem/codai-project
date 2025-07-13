// 🏦 BancAI Services - Business Logic Layer
'use client'

import type { Account, Transaction, PaymentMethod } from '@codai/shared-types'
import { financialService } from '@codai/shared-services'

// ==================== BANKING SERVICE ====================

export class BankingService {
    private static instance: BankingService

    static getInstance(): BankingService {
        if (!BankingService.instance) {
            BankingService.instance = new BankingService()
        }
        return BankingService.instance
    }

    // Account Management
    async getAccounts(userId: string): Promise<Account[]> {
        try {
            const response = await financialService.getAccounts(userId)
            return response.data || this.getMockAccounts()
        } catch (error) {
            console.error('Failed to fetch accounts:', error)
            return this.getMockAccounts()
        }
    }

    async createAccount(accountData: Partial<Account>): Promise<Account> {
        try {
            const response = await financialService.callApp('bancai', '/api/accounts', 'POST', accountData)
            return response.data
        } catch (error) {
            console.error('Failed to create account:', error)
            throw error
        }
    }

    async updateAccount(accountId: string, updates: Partial<Account>): Promise<Account> {
        try {
            const response = await financialService.callApp('bancai', `/api/accounts/${accountId}`, 'PUT', updates)
            return response.data
        } catch (error) {
            console.error('Failed to update account:', error)
            throw error
        }
    }

    // Transaction Management  
    async getTransactions(accountId: string): Promise<Transaction[]> {
        try {
            const response = await financialService.getTransactions(accountId)
            return response.data || this.getMockTransactions()
        } catch (error) {
            console.error('Failed to fetch transactions:', error)
            return this.getMockTransactions()
        }
    }

    async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
        try {
            const response = await financialService.createTransaction(transactionData)
            return response.data
        } catch (error) {
            console.error('Failed to create transaction:', error)
            throw error
        }
    }

    async transferFunds(fromAccountId: string, toAccountId: string, amount: number, description: string): Promise<Transaction> {
        const transferData = {
            fromAccountId,
            toAccountId,
            amount,
            description,
            type: 'transfer' as const,
            status: 'pending' as const,
            currency: 'RON'
        }

        try {
            const response = await financialService.transfer(fromAccountId, toAccountId, amount, 'RON')
            return response.data
        } catch (error) {
            console.error('Failed to transfer funds:', error)
            throw error
        }
    }

    // Payment Methods
    async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
        try {
            const response = await financialService.callApp('bancai', `/api/payment-methods?userId=${userId}`)
            return response.data || this.getMockPaymentMethods()
        } catch (error) {
            console.error('Failed to fetch payment methods:', error)
            return this.getMockPaymentMethods()
        }
    }

    async addPaymentMethod(paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
        try {
            const response = await financialService.callApp('bancai', '/api/payment-methods', 'POST', paymentMethodData)
            return response.data
        } catch (error) {
            console.error('Failed to add payment method:', error)
            throw error
        }
    }

    // Analytics & Insights
    async getAccountAnalytics(accountId: string): Promise<any> {
        try {
            const response = await financialService.callApp('bancai', `/api/analytics/accounts/${accountId}`)
            return response.data || this.getMockAnalytics()
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
            return this.getMockAnalytics()
        }
    }

    async getSpendingInsights(userId: string): Promise<any> {
        try {
            const response = await financialService.callApp('bancai', `/api/analytics/spending/${userId}`)
            return response.data || this.getMockSpendingInsights()
        } catch (error) {
            console.error('Failed to fetch spending insights:', error)
            return this.getMockSpendingInsights()
        }
    }

    // Mock Data (fallback when services are unavailable)
    private getMockAccounts(): Account[] {
        return [
            {
                id: 'acc-001',
                userId: 'user-001',
                type: 'checking',
                name: 'Main Checking',
                balance: 24567.89,
                currency: 'RON',
                iban: 'RO49AAAA1B31007593840000',
                status: 'active',
                provider: 'bancai'
            },
            {
                id: 'acc-002',
                userId: 'user-001',
                type: 'savings',
                name: 'Emergency Fund',
                balance: 85432.10,
                currency: 'RON',
                iban: 'RO49AAAA1B31007593840001',
                status: 'active',
                provider: 'bancai'
            },
            {
                id: 'acc-003',
                userId: 'user-001',
                type: 'business',
                name: 'BancAI Business',
                balance: 156789.45,
                currency: 'EUR',
                iban: 'RO49AAAA1B31007593840002',
                status: 'active',
                provider: 'bancai'
            }
        ]
    }

    private getMockTransactions(): Transaction[] {
        return [
            {
                id: 'tx-001',
                fromAccountId: 'acc-001',
                amount: 2500.00,
                currency: 'RON',
                type: 'credit',
                status: 'completed',
                description: 'Salary Payment',
                merchant: 'Company SRL',
                category: 'Income',
                date: '2025-01-05',
                metadata: { reference: 'SAL-2025-001' }
            },
            {
                id: 'tx-002',
                fromAccountId: 'acc-001',
                amount: 450.75,
                currency: 'RON',
                type: 'debit',
                status: 'completed',
                description: 'Grocery Shopping',
                merchant: 'Carrefour',
                category: 'Shopping',
                date: '2025-01-04',
                metadata: { location: 'Bucharest Mall' }
            },
            {
                id: 'tx-003',
                fromAccountId: 'acc-001',
                amount: 1200.00,
                currency: 'RON',
                type: 'debit',
                status: 'completed',
                description: 'Rent Payment',
                merchant: 'Property Management',
                category: 'Housing',
                date: '2025-01-03',
                metadata: { reference: 'RENT-JAN-2025' }
            },
            {
                id: 'tx-004',
                toAccountId: 'acc-001',
                amount: 150.00,
                currency: 'RON',
                type: 'credit',
                status: 'pending',
                description: 'Freelance Work',
                merchant: 'Client ABC',
                category: 'Income',
                date: '2025-01-02',
                metadata: { projectId: 'PRJ-123' }
            }
        ]
    }

    private getMockPaymentMethods(): PaymentMethod[] {
        return [
            {
                id: 'pm-001',
                userId: 'user-001',
                type: 'card',
                provider: 'Visa',
                last4: '4242',
                expiryDate: '12/26',
                isDefault: true,
                metadata: { brand: 'visa', country: 'RO' }
            },
            {
                id: 'pm-002',
                userId: 'user-001',
                type: 'bank',
                provider: 'BancAI',
                isDefault: false,
                metadata: { iban: 'RO49AAAA1B31007593840000' }
            }
        ]
    }

    private getMockAnalytics(): any {
        return {
            monthlySpending: [
                { month: 'Dec', amount: 3500 },
                { month: 'Jan', amount: 2800 },
            ],
            categoryBreakdown: [
                { category: 'Housing', amount: 1200, percentage: 35 },
                { category: 'Food', amount: 800, percentage: 23 },
                { category: 'Transport', amount: 400, percentage: 12 },
                { category: 'Entertainment', amount: 300, percentage: 9 },
                { category: 'Others', amount: 700, percentage: 21 }
            ],
            savingsRate: 0.25,
            budgetUtilization: 0.78
        }
    }

    private getMockSpendingInsights(): any {
        return {
            totalSpent: 3400,
            avgDaily: 113.33,
            topMerchant: 'Carrefour',
            topCategory: 'Housing',
            budgetStatus: 'on_track',
            recommendations: [
                'You\'re spending 15% less than last month - great job!',
                'Consider setting up automatic savings for your emergency fund',
                'You have 3 upcoming bill payments this week'
            ]
        }
    }
}

// ==================== EXPORT SERVICE INSTANCE ====================

export const bankingService = BankingService.getInstance()
