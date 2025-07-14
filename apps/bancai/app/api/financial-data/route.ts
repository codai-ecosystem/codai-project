import { NextRequest, NextResponse } from 'next/server'

// Financial data structures
interface AccountBalance {
    accountId: string
    accountType: 'checking' | 'savings' | 'investment' | 'credit'
    balance: number
    currency: string
    availableBalance: number
    lastUpdated: string
}

interface Transaction {
    id: string
    accountId: string
    amount: number
    currency: string
    type: 'debit' | 'credit'
    category: string
    description: string
    merchant: string
    timestamp: string
    status: 'pending' | 'completed' | 'failed'
    reference: string
}

interface FinancialMetrics {
    totalBalance: number
    monthlyIncome: number
    monthlyExpenses: number
    savingsRate: number
    creditUtilization: number
    investmentGrowth: number
    accountsCount: number
    transactionsThisMonth: number
    averageTransactionAmount: number
    cashFlow: number
}

// Mock financial data generators
function generateAccountBalances(): AccountBalance[] {
    return [
        {
            accountId: 'acc-001',
            accountType: 'checking',
            balance: 12450.75,
            currency: 'RON',
            availableBalance: 12450.75,
            lastUpdated: new Date().toISOString()
        },
        {
            accountId: 'acc-002',
            accountType: 'savings',
            balance: 28900.00,
            currency: 'RON',
            availableBalance: 28900.00,
            lastUpdated: new Date().toISOString()
        },
        {
            accountId: 'acc-003',
            accountType: 'investment',
            balance: 45250.30,
            currency: 'RON',
            availableBalance: 45250.30,
            lastUpdated: new Date().toISOString()
        },
        {
            accountId: 'acc-004',
            accountType: 'credit',
            balance: -2890.50,
            currency: 'RON',
            availableBalance: 7109.50, // Credit limit - used amount
            lastUpdated: new Date().toISOString()
        }
    ]
}

function generateRecentTransactions(): Transaction[] {
    const merchants = [
        'Kaufland România', 'eMAG', 'OMV Petrom', 'Mega Image', 'Lidl România',
        'McDonald\'s', 'BRD Grup Société Générale', 'Orange România', 'Vodafone România',
        'ENEL Energie Mundială', 'Raiffeisen Bank', 'ING Bank România', 'Carrefour România'
    ]

    const categories = [
        'groceries', 'fuel', 'utilities', 'entertainment', 'dining', 'shopping',
        'transportation', 'healthcare', 'education', 'subscription', 'transfer'
    ]

    const transactions: Transaction[] = []
    const now = new Date()

    // Generate 20 recent transactions
    for (let i = 0; i < 20; i++) {
        const isCredit = Math.random() > 0.7 // 30% chance of credit (income)
        const amount = isCredit
            ? Math.round((Math.random() * 5000 + 500) * 100) / 100 // Income: 500-5500 RON
            : Math.round((Math.random() * 800 + 10) * 100) / 100   // Expense: 10-810 RON

        const transactionDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days

        transactions.push({
            id: `txn-${Date.now()}-${i}`,
            accountId: ['acc-001', 'acc-002'][Math.floor(Math.random() * 2)],
            amount: isCredit ? amount : -amount,
            currency: 'RON',
            type: isCredit ? 'credit' : 'debit',
            category: isCredit ? 'salary' : categories[Math.floor(Math.random() * categories.length)],
            description: isCredit ? 'Salary Payment' : `Purchase at ${merchants[Math.floor(Math.random() * merchants.length)]}`,
            merchant: isCredit ? 'Employer' : merchants[Math.floor(Math.random() * merchants.length)],
            timestamp: transactionDate.toISOString(),
            status: Math.random() > 0.95 ? 'pending' : 'completed',
            reference: `REF${Date.now()}${i}`
        })
    }

    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function calculateFinancialMetrics(accounts: AccountBalance[], transactions: Transaction[]): FinancialMetrics {
    const totalBalance = accounts
        .filter(acc => acc.accountType !== 'credit')
        .reduce((sum, acc) => sum + acc.balance, 0)

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyTransactions = transactions.filter(
        txn => new Date(txn.timestamp) >= firstDayOfMonth
    )

    const monthlyIncome = monthlyTransactions
        .filter(txn => txn.type === 'credit')
        .reduce((sum, txn) => sum + txn.amount, 0)

    const monthlyExpenses = Math.abs(monthlyTransactions
        .filter(txn => txn.type === 'debit')
        .reduce((sum, txn) => sum + txn.amount, 0))

    const savingsRate = monthlyIncome > 0
        ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 * 100) / 100
        : 0

    const creditAccount = accounts.find(acc => acc.accountType === 'credit')
    const creditUtilization = creditAccount
        ? Math.round((Math.abs(creditAccount.balance) / (Math.abs(creditAccount.balance) + creditAccount.availableBalance)) * 100 * 100) / 100
        : 0

    // Simulate investment growth (3-8% annually)
    const investmentGrowth = Math.round((Math.random() * 5 + 3) * 100) / 100

    const averageTransactionAmount = monthlyTransactions.length > 0
        ? Math.round((monthlyTransactions.reduce((sum, txn) => sum + Math.abs(txn.amount), 0) / monthlyTransactions.length) * 100) / 100
        : 0

    const cashFlow = monthlyIncome - monthlyExpenses

    return {
        totalBalance: Math.round(totalBalance * 100) / 100,
        monthlyIncome: Math.round(monthlyIncome * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        savingsRate,
        creditUtilization,
        investmentGrowth,
        accountsCount: accounts.length,
        transactionsThisMonth: monthlyTransactions.length,
        averageTransactionAmount,
        cashFlow: Math.round(cashFlow * 100) / 100
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'overview'

        const accounts = generateAccountBalances()
        const transactions = generateRecentTransactions()
        const metrics = calculateFinancialMetrics(accounts, transactions)

        switch (type) {
            case 'accounts':
                return NextResponse.json({
                    accounts,
                    summary: {
                        totalAccounts: accounts.length,
                        totalBalance: metrics.totalBalance,
                        currency: 'RON'
                    }
                })

            case 'transactions':
                const limit = parseInt(searchParams.get('limit') || '10')
                const offset = parseInt(searchParams.get('offset') || '0')

                return NextResponse.json({
                    transactions: transactions.slice(offset, offset + limit),
                    total: transactions.length,
                    hasMore: offset + limit < transactions.length
                })

            case 'metrics':
                return NextResponse.json({
                    metrics,
                    trends: {
                        balanceChange: Math.round((Math.random() * 10 - 5) * 100) / 100, // -5% to +5%
                        expenseChange: Math.round((Math.random() * 20 - 10) * 100) / 100, // -10% to +10%
                        incomeChange: Math.round((Math.random() * 8 + 2) * 100) / 100, // +2% to +10%
                    },
                    goals: {
                        savingsTarget: 25, // 25% savings rate goal
                        budgetAlert: metrics.monthlyExpenses > 8000 ? 'warning' : 'good',
                        investmentAllocation: 15 // 15% of income should go to investments
                    }
                })

            case 'overview':
            default:
                return NextResponse.json({
                    accounts,
                    recentTransactions: transactions.slice(0, 5),
                    metrics,
                    alerts: [
                        ...(metrics.creditUtilization > 70 ? [{
                            type: 'warning',
                            message: 'Credit utilization is high',
                            value: `${metrics.creditUtilization}%`
                        }] : []),
                        ...(metrics.savingsRate < 10 ? [{
                            type: 'info',
                            message: 'Consider increasing savings rate',
                            value: `Current: ${metrics.savingsRate}%`
                        }] : []),
                        ...(metrics.cashFlow < 0 ? [{
                            type: 'alert',
                            message: 'Negative cash flow this month',
                            value: `${metrics.cashFlow} RON`
                        }] : [{
                            type: 'success',
                            message: 'Positive cash flow',
                            value: `+${metrics.cashFlow} RON`
                        }])
                    ],
                    timestamp: new Date().toISOString()
                })
        }
    } catch (error) {
        console.error('Error fetching financial data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch financial data' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, data } = body

        switch (action) {
            case 'transfer':
                // Simulate transfer processing
                const { fromAccount, toAccount, amount, description } = data

                // Basic validation
                if (!fromAccount || !toAccount || !amount || amount <= 0) {
                    return NextResponse.json(
                        { error: 'Invalid transfer parameters' },
                        { status: 400 }
                    )
                }

                // Simulate processing time
                await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))

                const transferId = `transfer-${Date.now()}`

                return NextResponse.json({
                    success: true,
                    transferId,
                    message: 'Transfer completed successfully',
                    details: {
                        fromAccount,
                        toAccount,
                        amount,
                        description,
                        reference: transferId,
                        timestamp: new Date().toISOString(),
                        fee: amount > 1000 ? 5 : 0, // 5 RON fee for transfers over 1000 RON
                        exchangeRate: toAccount.includes('EUR') ? 4.97 : 1 // EUR/RON rate
                    }
                })

            case 'budget':
                // Set budget for a category
                const { category, limit, period } = data

                return NextResponse.json({
                    success: true,
                    message: `Budget set for ${category}`,
                    budget: {
                        category,
                        limit,
                        period,
                        spent: Math.round(Math.random() * limit * 0.8 * 100) / 100,
                        remaining: Math.round((limit - (Math.random() * limit * 0.8)) * 100) / 100,
                        alerts: limit < 500 ? ['Consider increasing budget limit'] : []
                    }
                })

            default:
                return NextResponse.json(
                    { error: 'Unknown action' },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Error processing financial action:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
