/**
 * Bancai Service
 * AI Banking & Finance Platform - Intelligent financial services and analytics
 * Port: 4057
 */

// Base service for common functionality
class BaseService {
  protected baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  protected async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }

    return response.json() as T
  }
}

// Banking and Finance Types
export interface BankAccount {
  id: string
  accountNumber: string
  accountType: 'checking' | 'savings' | 'credit' | 'investment' | 'loan'
  balance: number
  availableBalance: number
  currency: string
  status: 'active' | 'inactive' | 'frozen' | 'closed'
  owner: string
  institution: string
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  accountId: string
  type: 'credit' | 'debit' | 'transfer' | 'payment' | 'deposit' | 'withdrawal'
  amount: number
  currency: string
  description: string
  category: string
  merchant?: string
  location?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  timestamp: Date
  metadata: Record<string, any>
}

export interface Budget {
  id: string
  name: string
  category: string
  amount: number
  spent: number
  remaining: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  status: 'active' | 'exceeded' | 'completed'
  alerts: boolean
  metadata: Record<string, any>
}

export interface Investment {
  id: string
  symbol: string
  name: string
  type: 'stock' | 'bond' | 'etf' | 'mutual_fund' | 'crypto' | 'commodity'
  quantity: number
  purchasePrice: number
  currentPrice: number
  marketValue: number
  gainLoss: number
  gainLossPercent: number
  dividends: number
  metadata: Record<string, any>
}

export interface CreditScore {
  score: number
  rating: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor'
  factors: Array<{
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    description: string
  }>
  recommendations: string[]
  lastUpdated: Date
}

export interface FinancialGoal {
  id: string
  name: string
  type: 'savings' | 'debt_payoff' | 'investment' | 'purchase' | 'retirement'
  targetAmount: number
  currentAmount: number
  targetDate: Date
  progress: number
  status: 'on_track' | 'behind' | 'ahead' | 'completed'
  strategies: string[]
  metadata: Record<string, any>
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'digital_wallet' | 'crypto'
  provider: string
  lastFour: string
  isDefault: boolean
  isVerified: boolean
  expiryDate?: string
  metadata: Record<string, any>
}

export interface LoanApplication {
  id: string
  type: 'personal' | 'mortgage' | 'auto' | 'business' | 'student'
  amount: number
  purpose: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  interestRate?: number
  term?: number
  monthlyPayment?: number
  documents: Array<{
    type: string
    url: string
    status: 'pending' | 'verified' | 'rejected'
  }>
  metadata: Record<string, any>
}

export interface FinancialInsight {
  id: string
  type: 'spending_trend' | 'saving_opportunity' | 'investment_advice' | 'credit_tip' | 'budget_alert'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: string
  actionItems: string[]
  estimatedSavings?: number
  timestamp: Date
}

export interface FraudAlert {
  id: string
  type: 'unusual_spending' | 'location_mismatch' | 'duplicate_transaction' | 'suspicious_merchant'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  transactionId?: string
  action: 'monitor' | 'block' | 'verify' | 'investigate'
  status: 'active' | 'resolved' | 'false_positive'
  timestamp: Date
}

export interface BankingMetrics {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  netWorth: number
  creditUtilization: number
  savingsRate: number
  investmentGrowth: number
  debtToIncomeRatio: number
}

// Main Bancai Service Class
export default class BancaiService extends BaseService {
  constructor() {
    super('/api/bancai')
  }

  // Account Management
  async getAccounts(): Promise<BankAccount[]> {
    return this.generateMockAccounts()
  }

  async getAccount(accountId: string): Promise<BankAccount> {
    const accounts = await this.getAccounts()
    const account = accounts.find(a => a.id === accountId)
    if (!account) throw new Error('Account not found')
    return account
  }

  async createAccount(accountData: Partial<BankAccount>): Promise<BankAccount> {
    const newAccount: BankAccount = {
      id: this.generateId(),
      accountNumber: this.generateAccountNumber(),
      accountType: accountData.accountType || 'checking',
      balance: accountData.balance || 0,
      availableBalance: accountData.availableBalance || 0,
      currency: accountData.currency || 'USD',
      status: 'active',
      owner: accountData.owner || 'Current User',
      institution: accountData.institution || 'Bancai Bank',
      metadata: accountData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return newAccount
  }

  async updateAccountBalance(accountId: string, amount: number): Promise<BankAccount> {
    const account = await this.getAccount(accountId)
    account.balance += amount
    account.availableBalance = account.balance
    account.updatedAt = new Date()
    return account
  }

  // Transaction Management
  async getTransactions(accountId?: string, limit = 50): Promise<Transaction[]> {
    return this.generateMockTransactions(limit, accountId)
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    const transactions = await this.getTransactions()
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) throw new Error('Transaction not found')
    return transaction
  }

  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.generateId(),
      accountId: transactionData.accountId || '',
      type: transactionData.type || 'debit',
      amount: transactionData.amount || 0,
      currency: transactionData.currency || 'USD',
      description: transactionData.description || 'Transaction',
      category: transactionData.category || 'General',
      merchant: transactionData.merchant,
      location: transactionData.location,
      status: 'completed',
      timestamp: new Date(),
      metadata: transactionData.metadata || {}
    }
    return newTransaction
  }

  async categorizeTransaction(transactionId: string, category: string): Promise<Transaction> {
    const transaction = await this.getTransaction(transactionId)
    transaction.category = category
    return transaction
  }

  // Budget Management
  async getBudgets(): Promise<Budget[]> {
    return this.generateMockBudgets()
  }

  async createBudget(budgetData: Partial<Budget>): Promise<Budget> {
    const newBudget: Budget = {
      id: this.generateId(),
      name: budgetData.name || 'New Budget',
      category: budgetData.category || 'General',
      amount: budgetData.amount || 1000,
      spent: 0,
      remaining: budgetData.amount || 1000,
      period: budgetData.period || 'monthly',
      status: 'active',
      alerts: budgetData.alerts || true,
      metadata: budgetData.metadata || {}
    }
    return newBudget
  }

  async updateBudgetSpending(budgetId: string, amount: number): Promise<Budget> {
    const budgets = await this.getBudgets()
    const budget = budgets.find(b => b.id === budgetId)
    if (!budget) throw new Error('Budget not found')

    budget.spent += amount
    budget.remaining = budget.amount - budget.spent
    budget.status = budget.spent > budget.amount ? 'exceeded' : 'active'

    return budget
  }

  // Investment Management
  async getInvestments(): Promise<Investment[]> {
    return this.generateMockInvestments()
  }

  async getInvestment(symbol: string): Promise<Investment> {
    const investments = await this.getInvestments()
    const investment = investments.find(i => i.symbol === symbol)
    if (!investment) throw new Error('Investment not found')
    return investment
  }

  async addInvestment(investmentData: Partial<Investment>): Promise<Investment> {
    const newInvestment: Investment = {
      id: this.generateId(),
      symbol: investmentData.symbol || 'UNKNOWN',
      name: investmentData.name || 'Unknown Investment',
      type: investmentData.type || 'stock',
      quantity: investmentData.quantity || 1,
      purchasePrice: investmentData.purchasePrice || 100,
      currentPrice: investmentData.currentPrice || investmentData.purchasePrice || 100,
      marketValue: 0,
      gainLoss: 0,
      gainLossPercent: 0,
      dividends: 0,
      metadata: investmentData.metadata || {}
    }

    newInvestment.marketValue = newInvestment.quantity * newInvestment.currentPrice
    newInvestment.gainLoss = newInvestment.marketValue - (newInvestment.quantity * newInvestment.purchasePrice)
    newInvestment.gainLossPercent = (newInvestment.gainLoss / (newInvestment.quantity * newInvestment.purchasePrice)) * 100

    return newInvestment
  }

  // Credit Score & Monitoring
  async getCreditScore(): Promise<CreditScore> {
    return this.generateMockCreditScore()
  }

  async updateCreditScore(): Promise<CreditScore> {
    // Simulate credit score update
    return this.getCreditScore()
  }

  // Financial Goals
  async getFinancialGoals(): Promise<FinancialGoal[]> {
    return this.generateMockFinancialGoals()
  }

  async createFinancialGoal(goalData: Partial<FinancialGoal>): Promise<FinancialGoal> {
    const newGoal: FinancialGoal = {
      id: this.generateId(),
      name: goalData.name || 'New Goal',
      type: goalData.type || 'savings',
      targetAmount: goalData.targetAmount || 10000,
      currentAmount: goalData.currentAmount || 0,
      targetDate: goalData.targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      progress: 0,
      status: 'on_track',
      strategies: goalData.strategies || [],
      metadata: goalData.metadata || {}
    }

    newGoal.progress = (newGoal.currentAmount / newGoal.targetAmount) * 100

    return newGoal
  }

  async updateGoalProgress(goalId: string, amount: number): Promise<FinancialGoal> {
    const goals = await this.getFinancialGoals()
    const goal = goals.find(g => g.id === goalId)
    if (!goal) throw new Error('Goal not found')

    goal.currentAmount += amount
    goal.progress = (goal.currentAmount / goal.targetAmount) * 100

    if (goal.progress >= 100) {
      goal.status = 'completed'
    } else if (goal.progress >= 80) {
      goal.status = 'on_track'
    } else {
      goal.status = 'behind'
    }

    return goal
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.generateMockPaymentMethods()
  }

  async addPaymentMethod(methodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const newMethod: PaymentMethod = {
      id: this.generateId(),
      type: methodData.type || 'card',
      provider: methodData.provider || 'Unknown',
      lastFour: methodData.lastFour || '0000',
      isDefault: methodData.isDefault || false,
      isVerified: methodData.isVerified || false,
      expiryDate: methodData.expiryDate,
      metadata: methodData.metadata || {}
    }
    return newMethod
  }

  // Loan Applications
  async getLoanApplications(): Promise<LoanApplication[]> {
    return this.generateMockLoanApplications()
  }

  async createLoanApplication(applicationData: Partial<LoanApplication>): Promise<LoanApplication> {
    const newApplication: LoanApplication = {
      id: this.generateId(),
      type: applicationData.type || 'personal',
      amount: applicationData.amount || 10000,
      purpose: applicationData.purpose || 'General purpose',
      status: 'draft',
      documents: applicationData.documents || [],
      metadata: applicationData.metadata || {}
    }
    return newApplication
  }

  // Financial Insights & AI
  async getFinancialInsights(): Promise<FinancialInsight[]> {
    return this.generateMockInsights()
  }

  async getFraudAlerts(): Promise<FraudAlert[]> {
    return this.generateMockFraudAlerts()
  }

  async getBankingMetrics(): Promise<BankingMetrics> {
    return this.generateMockMetrics()
  }

  // AI-Powered Features
  async analyzeSpendingPatterns(accountId: string): Promise<any> {
    const transactions = await this.getTransactions(accountId, 100)

    // Analyze spending by category
    const categorySpending = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'debit') {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      }
      return acc
    }, {} as Record<string, number>)

    // Calculate trends
    const monthlySpending = transactions
      .filter(t => t.type === 'debit' && t.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      categoryBreakdown: categorySpending,
      monthlyTotal: monthlySpending,
      topCategories: Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      insights: this.generateSpendingInsights(categorySpending, monthlySpending)
    }
  }

  async predictCashFlow(accountId: string, days = 30): Promise<any> {
    const transactions = await this.getTransactions(accountId, 200)
    const account = await this.getAccount(accountId)

    // Calculate average daily income and expenses
    const recentTransactions = transactions.filter(
      t => t.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )

    const dailyIncome = recentTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0) / 30

    const dailyExpenses = recentTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0) / 30

    // Project future balance
    const projectedBalance = account.balance + (dailyIncome - dailyExpenses) * days

    return {
      currentBalance: account.balance,
      projectedBalance,
      dailyIncome,
      dailyExpenses,
      netDailyFlow: dailyIncome - dailyExpenses,
      projectionDays: days,
      warnings: projectedBalance < 0 ? ['Projected negative balance'] : []
    }
  }

  async recommendInvestments(riskTolerance: 'low' | 'medium' | 'high'): Promise<any> {
    const recommendations = {
      low: [
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', risk: 'Low', expectedReturn: '7-9%' },
        { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', risk: 'Very Low', expectedReturn: '3-5%' }
      ],
      medium: [
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF', risk: 'Medium', expectedReturn: '8-12%' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', risk: 'Medium-High', expectedReturn: '10-15%' }
      ],
      high: [
        { symbol: 'ARKK', name: 'ARK Innovation ETF', risk: 'High', expectedReturn: '15-25%' },
        { symbol: 'TSLA', name: 'Tesla Inc.', risk: 'Very High', expectedReturn: '20-40%' }
      ]
    }

    return {
      riskTolerance,
      recommendations: recommendations[riskTolerance],
      disclaimer: 'Investment recommendations are for educational purposes only.',
      additionalAdvice: this.generateInvestmentAdvice(riskTolerance)
    }
  }

  // Mock Data Generators
  private generateMockAccounts(): BankAccount[] {
    return [
      {
        id: '1',
        accountNumber: '****1234',
        accountType: 'checking',
        balance: 15420.50,
        availableBalance: 15420.50,
        currency: 'USD',
        status: 'active',
        owner: 'John Doe',
        institution: 'Bancai Bank',
        metadata: { branch: 'Main Street' },
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date()
      },
      {
        id: '2',
        accountNumber: '****5678',
        accountType: 'savings',
        balance: 45200.00,
        availableBalance: 45200.00,
        currency: 'USD',
        status: 'active',
        owner: 'John Doe',
        institution: 'Bancai Bank',
        metadata: { interestRate: 2.5 },
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date()
      },
      {
        id: '3',
        accountNumber: '****9012',
        accountType: 'credit',
        balance: -2350.75,
        availableBalance: 7649.25,
        currency: 'USD',
        status: 'active',
        owner: 'John Doe',
        institution: 'Bancai Credit',
        metadata: { creditLimit: 10000, apr: 18.99 },
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date()
      }
    ]
  }

  private generateMockTransactions(limit: number, accountId?: string): Transaction[] {
    const transactions: Transaction[] = []
    const categories = ['Food & Dining', 'Shopping', 'Transportation', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Travel']
    const merchants = ['Amazon', 'Starbucks', 'Uber', 'Netflix', 'Target', 'Whole Foods', 'Shell', 'CVS Pharmacy']

    for (let i = 0; i < limit; i++) {
      const isCredit = Math.random() > 0.7
      transactions.push({
        id: this.generateId(),
        accountId: accountId || '1',
        type: isCredit ? 'credit' : 'debit',
        amount: Math.round((Math.random() * 500 + 10) * 100) / 100,
        currency: 'USD',
        description: isCredit ? 'Salary Deposit' : `Purchase at ${merchants[Math.floor(Math.random() * merchants.length)]}`,
        category: isCredit ? 'Income' : categories[Math.floor(Math.random() * categories.length)],
        merchant: isCredit ? 'Employer' : merchants[Math.floor(Math.random() * merchants.length)],
        location: 'San Francisco, CA',
        status: 'completed',
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        metadata: {}
      })
    }

    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  private generateMockBudgets(): Budget[] {
    return [
      {
        id: '1',
        name: 'Monthly Food Budget',
        category: 'Food & Dining',
        amount: 800,
        spent: 645.20,
        remaining: 154.80,
        period: 'monthly',
        status: 'active',
        alerts: true,
        metadata: {}
      },
      {
        id: '2',
        name: 'Entertainment',
        category: 'Entertainment',
        amount: 300,
        spent: 285.50,
        remaining: 14.50,
        period: 'monthly',
        status: 'active',
        alerts: true,
        metadata: {}
      },
      {
        id: '3',
        name: 'Transportation',
        category: 'Transportation',
        amount: 400,
        spent: 456.75,
        remaining: -56.75,
        period: 'monthly',
        status: 'exceeded',
        alerts: true,
        metadata: {}
      }
    ]
  }

  private generateMockInvestments(): Investment[] {
    return [
      {
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        quantity: 50,
        purchasePrice: 150.00,
        currentPrice: 175.50,
        marketValue: 8775.00,
        gainLoss: 1275.00,
        gainLossPercent: 17.0,
        dividends: 45.00,
        metadata: {}
      },
      {
        id: '2',
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        type: 'etf',
        quantity: 100,
        purchasePrice: 220.00,
        currentPrice: 235.75,
        marketValue: 23575.00,
        gainLoss: 1575.00,
        gainLossPercent: 7.16,
        dividends: 120.00,
        metadata: {}
      }
    ]
  }

  private generateMockCreditScore(): CreditScore {
    return {
      score: 742,
      rating: 'very_good',
      factors: [
        { factor: 'Payment History', impact: 'positive', description: 'No missed payments in 24 months' },
        { factor: 'Credit Utilization', impact: 'positive', description: 'Using 15% of available credit' },
        { factor: 'Credit Age', impact: 'positive', description: 'Average account age: 8 years' },
        { factor: 'Credit Mix', impact: 'neutral', description: 'Good mix of credit types' }
      ],
      recommendations: [
        'Keep credit utilization below 10% to improve score',
        'Consider opening a new credit account to improve credit mix',
        'Continue making on-time payments'
      ],
      lastUpdated: new Date()
    }
  }

  private generateMockFinancialGoals(): FinancialGoal[] {
    return [
      {
        id: '1',
        name: 'Emergency Fund',
        type: 'savings',
        targetAmount: 25000,
        currentAmount: 18500,
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        progress: 74,
        status: 'on_track',
        strategies: ['Automatic savings transfer', 'Reduce dining out'],
        metadata: {}
      },
      {
        id: '2',
        name: 'Vacation Fund',
        type: 'savings',
        targetAmount: 5000,
        currentAmount: 2800,
        targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        progress: 56,
        status: 'behind',
        strategies: ['Side hustle income', 'Cut subscription services'],
        metadata: {}
      }
    ]
  }

  private generateMockPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: '1',
        type: 'card',
        provider: 'Visa',
        lastFour: '1234',
        isDefault: true,
        isVerified: true,
        expiryDate: '12/25',
        metadata: { cardType: 'credit' }
      },
      {
        id: '2',
        type: 'bank_account',
        provider: 'Bancai Bank',
        lastFour: '5678',
        isDefault: false,
        isVerified: true,
        metadata: { accountType: 'checking' }
      }
    ]
  }

  private generateMockLoanApplications(): LoanApplication[] {
    return [
      {
        id: '1',
        type: 'personal',
        amount: 15000,
        purpose: 'Home improvement',
        status: 'approved',
        interestRate: 7.5,
        term: 60,
        monthlyPayment: 301.54,
        documents: [
          { type: 'income_verification', url: '/documents/income.pdf', status: 'verified' },
          { type: 'credit_report', url: '/documents/credit.pdf', status: 'verified' }
        ],
        metadata: {}
      }
    ]
  }

  private generateMockInsights(): FinancialInsight[] {
    return [
      {
        id: '1',
        type: 'spending_trend',
        title: 'Increased Dining Expenses',
        description: 'Your dining expenses have increased 25% this month compared to last month.',
        impact: 'medium',
        category: 'Food & Dining',
        actionItems: ['Set a dining budget', 'Cook more meals at home'],
        estimatedSavings: 200,
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'saving_opportunity',
        title: 'Subscription Review',
        description: 'You have 8 active subscriptions totaling $127/month.',
        impact: 'low',
        category: 'Entertainment',
        actionItems: ['Cancel unused subscriptions', 'Bundle services'],
        estimatedSavings: 45,
        timestamp: new Date()
      }
    ]
  }

  private generateMockFraudAlerts(): FraudAlert[] {
    return [
      {
        id: '1',
        type: 'unusual_spending',
        severity: 'medium',
        description: 'Large purchase detected: $1,200 at Electronics Store',
        transactionId: 'txn_123',
        action: 'verify',
        status: 'active',
        timestamp: new Date()
      }
    ]
  }

  private generateMockMetrics(): BankingMetrics {
    return {
      totalBalance: 58270.75,
      monthlyIncome: 8500.00,
      monthlyExpenses: 4200.00,
      netWorth: 125000.00,
      creditUtilization: 23.5,
      savingsRate: 50.6,
      investmentGrowth: 12.3,
      debtToIncomeRatio: 15.2
    }
  }

  private generateSpendingInsights(categorySpending: Record<string, number>, monthlyTotal: number): string[] {
    const insights: string[] = []

    const topCategory = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0]
    if (topCategory && topCategory[1] > monthlyTotal * 0.3) {
      insights.push(`${topCategory[0]} represents a large portion of your spending`)
    }

    if (monthlyTotal > 5000) {
      insights.push('Consider reviewing your spending habits this month')
    }

    return insights
  }

  private generateInvestmentAdvice(riskTolerance: string): string[] {
    const advice = {
      low: ['Focus on diversified index funds', 'Consider dollar-cost averaging'],
      medium: ['Mix of stocks and bonds', 'Rebalance quarterly'],
      high: ['Growth stocks and emerging markets', 'Monitor closely and be prepared for volatility']
    }

    return advice[riskTolerance as keyof typeof advice] || []
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private generateAccountNumber(): string {
    return '****' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  }
}
