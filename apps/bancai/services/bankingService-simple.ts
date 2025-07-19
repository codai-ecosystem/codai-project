// 🏦 BancAI Services - Simplified Mock Implementation
'use client'

import type { Account, Transaction, PaymentMethod } from '../types'

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
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200))
        return this.getMockAccounts()
    }

    async createAccount(accountData: Partial<Account>): Promise<Account> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300))
        const newAccount: Account = {
            id: 'acc-' + Date.now(),
            userId: accountData.userId || 'user-1',
            name: accountData.name || 'New Account',
            type: accountData.type || 'checking',
            balance: accountData.balance || 0,
            currency: accountData.currency || 'RON',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        }
        return newAccount
    }

    async updateAccount(accountId: string, updates: Partial<Account>): Promise<Account> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200))
        return this.getMockAccounts()[0]
    }

    // Transaction Management
    async getTransactions(accountId: string): Promise<Transaction[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 150))
        return this.getMockTransactions()
    }

    async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400))
        const newTransaction: Transaction = {
            id: 'txn-' + Date.now(),
            accountId: transactionData.accountId || 'acc-001',
            amount: transactionData.amount || 0,
            currency: transactionData.currency || 'RON',
            type: transactionData.type || 'credit',
            category: transactionData.category || 'general',
            description: transactionData.description || 'Transaction',
            status: 'completed',
            createdAt: new Date()
        }
        return newTransaction
    }

    async transfer(fromAccountId: string, toAccountId: string, amount: number): Promise<Transaction> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        const transferTransaction: Transaction = {
            id: 'transfer-' + Date.now(),
            accountId: fromAccountId,
            amount: -amount,
            currency: 'RON',
            type: 'debit',
            category: 'transfer',
            description: `Transfer to account ${toAccountId}`,
            status: 'completed',
            createdAt: new Date()
        }
        return transferTransaction
    }

    // Payment Methods
    async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100))
        return this.getMockPaymentMethods()
    }

    async createPaymentMethod(paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300))
        const newPaymentMethod: PaymentMethod = {
            id: 'pm-' + Date.now(),
            userId: paymentMethodData.userId || 'user-1',
            type: paymentMethodData.type || 'card',
            provider: paymentMethodData.provider || 'Visa',
            last4: paymentMethodData.last4 || '0000',
            status: 'active',
            isDefault: paymentMethodData.isDefault || false,
            createdAt: new Date()
        }
        return newPaymentMethod
    }

    // Analytics
    async getAccountAnalytics(accountId: string): Promise<any> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 250))
        return {
            totalTransactions: 125,
            avgTransactionAmount: 245.50,
            monthlySpending: 3500,
            topCategories: ['Food', 'Transport', 'Shopping']
        }
    }

    async getSpendingAnalytics(userId: string): Promise<any> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200))
        return {
            monthlyTotal: 4500,
            weeklyAverage: 1125,
            topMerchants: ['Restaurant ABC', 'Shop XYZ', 'Transport Co']
        }
    }

    // Mock Data
    private getMockAccounts(): Account[] {
        return [
            {
                id: 'acc-001',
                userId: 'user-1',
                name: 'Main Checking Account',
                type: 'checking',
                balance: 5420.75,
                currency: 'RON',
                status: 'active',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date()
            },
            {
                id: 'acc-002',
                userId: 'user-1',
                name: 'Savings Account',
                type: 'savings',
                balance: 12500.00,
                currency: 'RON',
                status: 'active',
                createdAt: new Date('2024-01-20'),
                updatedAt: new Date()
            },
            {
                id: 'acc-003',
                userId: 'user-1',
                name: 'Investment Account',
                type: 'investment',
                balance: 25000.50,
                currency: 'RON',
                status: 'active',
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date()
            }
        ]
    }

    private getMockTransactions(): Transaction[] {
        return [
            {
                id: 'txn-001',
                accountId: 'acc-001',
                amount: -85.50,
                currency: 'RON',
                type: 'debit',
                category: 'food',
                description: 'Restaurant payment',
                merchantName: 'Restaurant ABC',
                status: 'completed',
                createdAt: new Date('2024-07-18T14:30:00')
            },
            {
                id: 'txn-002',
                accountId: 'acc-001',
                amount: 2500.00,
                currency: 'RON',
                type: 'credit',
                category: 'salary',
                description: 'Monthly salary',
                status: 'completed',
                createdAt: new Date('2024-07-15T09:00:00')
            },
            {
                id: 'txn-003',
                accountId: 'acc-001',
                amount: -150.00,
                currency: 'RON',
                type: 'debit',
                category: 'shopping',
                description: 'Online purchase',
                merchantName: 'Shop XYZ',
                status: 'completed',
                createdAt: new Date('2024-07-17T16:45:00')
            }
        ]
    }

    private getMockPaymentMethods(): PaymentMethod[] {
        return [
            {
                id: 'pm-001',
                userId: 'user-1',
                type: 'card',
                provider: 'Visa',
                last4: '4532',
                expiryMonth: 12,
                expiryYear: 2026,
                status: 'active',
                isDefault: true,
                createdAt: new Date('2024-01-15')
            },
            {
                id: 'pm-002',
                userId: 'user-1',
                type: 'bank_account',
                provider: 'BRD',
                last4: '7890',
                status: 'active',
                isDefault: false,
                createdAt: new Date('2024-02-01')
            }
        ]
    }
}

export const bankingService = BankingService.getInstance()
