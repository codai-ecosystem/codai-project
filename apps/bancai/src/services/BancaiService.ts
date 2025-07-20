import type {
    BankAccount,
    Transaction,
    Transfer,
    TransferRequest,
    TransactionFilters,
    APIResponse,
    PaginatedResponse,
    BankingServiceConfig,
    FinancialInsight,
    User,
    PaymentMethod
} from '../types'

export class BancaiService {
    private static instance: BancaiService
    private config: BankingServiceConfig
    private accounts: Map<string, BankAccount> = new Map()
    private transactions: Map<string, Transaction> = new Map()
    private transfers: Map<string, Transfer> = new Map()

    private constructor() {
        this.config = {
            apiUrl: process.env.NEXT_PUBLIC_BANCAI_API_URL || 'http://localhost:3522/api',
            stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
            enableSandbox: process.env.NODE_ENV !== 'production',
            defaultCurrency: 'USD'
        }

        this.initializeMockData()
    }

    public static getInstance(): BancaiService {
        if (!BancaiService.instance) {
            BancaiService.instance = new BancaiService()
        }
        return BancaiService.instance
    }

    private initializeMockData(): void {
        // Initialize with mock banking data for development
        const mockAccounts: BankAccount[] = [
            {
                id: 'acc_1',
                accountNumber: '****1234',
                accountName: 'Primary Checking',
                balance: 15420.50,
                currency: 'USD',
                type: 'checking',
                status: 'active',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date()
            },
            {
                id: 'acc_2',
                accountNumber: '****5678',
                accountName: 'High Yield Savings',
                balance: 45780.25,
                currency: 'USD',
                type: 'savings',
                status: 'active',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date()
            },
            {
                id: 'acc_3',
                accountNumber: '****9012',
                accountName: 'Investment Account',
                balance: 128500.00,
                currency: 'USD',
                type: 'investment',
                status: 'active',
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date()
            }
        ]

        const mockTransactions: Transaction[] = [
            {
                id: 'txn_1',
                accountId: 'acc_1',
                type: 'debit',
                amount: 85.50,
                currency: 'USD',
                description: 'Grocery Store Purchase',
                category: 'Food & Dining',
                date: new Date(),
                status: 'completed',
                merchantName: 'Fresh Market',
                location: 'New York, NY'
            },
            {
                id: 'txn_2',
                accountId: 'acc_1',
                type: 'credit',
                amount: 3200.00,
                currency: 'USD',
                description: 'Salary Deposit',
                category: 'Income',
                date: new Date(Date.now() - 86400000), // Yesterday
                status: 'completed'
            },
            {
                id: 'txn_3',
                accountId: 'acc_2',
                type: 'credit',
                amount: 125.75,
                currency: 'USD',
                description: 'Interest Payment',
                category: 'Interest',
                date: new Date(Date.now() - 172800000), // 2 days ago
                status: 'completed'
            },
            {
                id: 'txn_4',
                accountId: 'acc_1',
                type: 'debit',
                amount: 1200.00,
                currency: 'USD',
                description: 'Monthly Rent',
                category: 'Housing',
                date: new Date(Date.now() - 259200000), // 3 days ago
                status: 'completed',
                merchantName: 'Property Management Co'
            }
        ]

        // Populate maps
        mockAccounts.forEach(account => this.accounts.set(account.id, account))
        mockTransactions.forEach(transaction => this.transactions.set(transaction.id, transaction))
    }

    // Account Management
    public async getAccounts(userId?: string): Promise<APIResponse<BankAccount[]>> {
        try {
            const accounts = Array.from(this.accounts.values())
            return {
                success: true,
                data: accounts,
                timestamp: new Date()
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to retrieve accounts',
                timestamp: new Date()
            }
        }
    }

    public async getAccountById(accountId: string): Promise<APIResponse<BankAccount>> {
        try {
            const account = this.accounts.get(accountId)
            if (!account) {
                return {
                    success: false,
                    error: 'Account not found',
                    timestamp: new Date()
                }
            }
            return {
                success: true,
                data: account,
                timestamp: new Date()
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to retrieve account',
                timestamp: new Date()
            }
        }
    }

    public async getAccountBalance(accountId: string): Promise<APIResponse<{ balance: number; currency: string }>> {
        try {
            const account = this.accounts.get(accountId)
            if (!account) {
                return {
                    success: false,
                    error: 'Account not found',
                    timestamp: new Date()
                }
            }
            return {
                success: true,
                data: {
                    balance: account.balance,
                    currency: account.currency
                },
                timestamp: new Date()
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to retrieve balance',
                timestamp: new Date()
            }
        }
    }

    // Transaction Management
    public async getTransactions(
        accountId: string,
        filters: TransactionFilters = {},
        page = 1,
        pageSize = 50
    ): Promise<APIResponse<PaginatedResponse<Transaction>>> {
        try {
            let transactions = Array.from(this.transactions.values())
                .filter(t => t.accountId === accountId)

            // Apply filters
            if (filters.type) {
                transactions = transactions.filter(t => t.type === filters.type)
            }
            if (filters.category) {
                transactions = transactions.filter(t => t.category === filters.category)
            }
            if (filters.dateFrom) {
                transactions = transactions.filter(t => t.date >= filters.dateFrom!)
            }
            if (filters.dateTo) {
                transactions = transactions.filter(t => t.date <= filters.dateTo!)
            }
            if (filters.minAmount) {
                transactions = transactions.filter(t => t.amount >= filters.minAmount!)
            }
            if (filters.maxAmount) {
                transactions = transactions.filter(t => t.amount <= filters.maxAmount!)
            }

            // Sort by date (newest first)
            transactions.sort((a, b) => b.date.getTime() - a.date.getTime())

            // Pagination
            const total = transactions.length
            const startIndex = (page - 1) * pageSize
            const endIndex = startIndex + pageSize
            const paginatedTransactions = transactions.slice(startIndex, endIndex)

            return {
                success: true,
                data: {
                    data: paginatedTransactions,
                    total,
                    page,
                    pageSize,
                    hasNext: endIndex < total,
                    hasPrevious: page > 1
                },
                timestamp: new Date()
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to retrieve transactions',
                timestamp: new Date()
            }
        }
    }

    public async getTransactionById(transactionId: string): Promise<APIResponse<Transaction>> {
        try {
            const transaction = this.transactions.get(transactionId)
            if (!transaction) {
                return {
                    success: false,
                    error: 'Transaction not found',
                    timestamp: new Date()
                }
            }
            return {
                success: true,
                data: transaction,
                timestamp: new Date()
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to retrieve transaction',
                timestamp: new Date()
            }
        }
    }

    // Transfer Management
    public async createTransfer(transferRequest: TransferRequest): Promise<APIResponse<Transfer>> {
        try {
            // Validate source account
            const sourceAccount = this.accounts.get(transferRequest.fromAccountId)
            if (!sourceAccount) {
                return {
                    success: false,
                    error: 'Source account not found',
                    timestamp: new Date()
                }
            }

            // Check sufficient funds
            if (sourceAccount.balance < transferRequest.amount) {
                return {
                    success: false,
                    error: 'Insufficient funds',
                    timestamp: new Date()
                }
            }

            // Create transfer
            const transfer: Transfer = {
                id: `transfer_${Date.now()}`,
                fromAccountId: transferRequest.fromAccountId,
                toAccountId: transferRequest.toAccountId,
                toExternalAccount: transferRequest.toExternalAccount,
                amount: transferRequest.amount,
                currency: transferRequest.currency,
                description: transferRequest.description,
                status: transferRequest.scheduledDate ? 'pending' : 'completed',
                scheduledDate: transferRequest.scheduledDate,
                executedDate: transferRequest.scheduledDate ? undefined : new Date(),
                fees: this.calculateTransferFees(transferRequest.amount, !!transferRequest.toExternalAccount),
                exchangeRate: transferRequest.currency !== sourceAccount.currency ? 1.0 : undefined
            }

            // Update account balances (if immediate transfer)
            if (transfer.status === 'completed') {
                sourceAccount.balance -= (transfer.amount + transfer.fees)
                sourceAccount.updatedAt = new Date()

                if (transferRequest.toAccountId) {
                    const targetAccount = this.accounts.get(transferRequest.toAccountId)
                    if (targetAccount) {
                        targetAccount.balance += transfer.amount
                        targetAccount.updatedAt = new Date()
                    }
                }

                // Create corresponding transactions
                const debitTransaction: Transaction = {
                    id: `txn_${Date.now()}_debit`,
                    accountId: transferRequest.fromAccountId,
                    type: 'debit',
                    amount: transfer.amount + transfer.fees,
                    currency: transfer.currency,
                    description: `Transfer: ${transfer.description}`,
                    category: 'Transfer',
                    date: new Date(),
                    status: 'completed',
                    reference: transfer.id
                }

                this.transactions.set(debitTransaction.id, debitTransaction)

                if (transferRequest.toAccountId) {
                    const creditTransaction: Transaction = {
                        id: `txn_${Date.now()}_credit`,
                        accountId: transferRequest.toAccountId,
                        type: 'credit',
                        amount: transfer.amount,
                        currency: transfer.currency,
                        description: `Transfer from: ${sourceAccount.accountName}`,
                        category: 'Transfer',
                        date: new Date(),
                        status: 'completed',
                        reference: transfer.id
                    }

                    this.transactions.set(creditTransaction.id, creditTransaction)
                }
            }

            this.transfers.set(transfer.id, transfer)

            return {
                success: true,
                data: transfer,
                timestamp: new Date()
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to create transfer',
                timestamp: new Date()
            }
        }
    }

    public async getTransfers(accountId?: string): Promise<APIResponse<Transfer[]>> {
        try {
            let transfers = Array.from(this.transfers.values())

            if (accountId) {
                transfers = transfers.filter(t =>
                    t.fromAccountId === accountId || t.toAccountId === accountId
                )
            }

            // Sort by date (newest first)
            transfers.sort((a, b) => {
                const aDate = a.executedDate || a.scheduledDate || new Date(0)
                const bDate = b.executedDate || b.scheduledDate || new Date(0)
                return bDate.getTime() - aDate.getTime()
            })

            return {
                success: true,
                data: transfers,
                timestamp: new Date()
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to retrieve transfers',
                timestamp: new Date()
            }
        }
    }

    // Financial Insights
    public async getFinancialInsights(userId: string): Promise<APIResponse<FinancialInsight[]>> {
        try {
            // Generate mock insights based on transaction patterns
            const insights: FinancialInsight[] = [
                {
                    id: 'insight_1',
                    type: 'spending_trend',
                    title: 'Food Spending Increased',
                    description: 'Your food & dining expenses increased by 15% this month compared to last month.',
                    impact: 'medium',
                    actionable: true,
                    metadata: {
                        category: 'Food & Dining',
                        currentMonth: 342.50,
                        lastMonth: 298.00,
                        changePercent: 15
                    },
                    createdAt: new Date()
                },
                {
                    id: 'insight_2',
                    type: 'saving_opportunity',
                    title: 'High Cash Balance',
                    description: 'You have a high balance in your checking account. Consider moving some funds to your high-yield savings.',
                    impact: 'high',
                    actionable: true,
                    metadata: {
                        checkingBalance: 15420.50,
                        suggestedTransfer: 10000,
                        potentialEarnings: 416.67
                    },
                    createdAt: new Date()
                }
            ]

            return {
                success: true,
                data: insights,
                timestamp: new Date()
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to retrieve insights',
                timestamp: new Date()
            }
        }
    }

    // Utility Methods
    private calculateTransferFees(amount: number, isExternal: boolean): number {
        if (isExternal) {
            // External transfer: $2.50 + 0.5% of amount
            return 2.50 + (amount * 0.005)
        } else {
            // Internal transfer: free
            return 0
        }
    }

    public formatCurrency(amount: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount)
    }

    public getCurrencySymbol(currency: string): string {
        const symbols: Record<string, string> = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'CAD': 'C$',
            'AUD': 'A$'
        }
        return symbols[currency] || currency
    }
}

export default BancaiService
