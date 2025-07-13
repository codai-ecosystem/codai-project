/**
 * Financial Ecosystem Service
 * 
 * Unified service for integrating BANCAI (traditional banking) and WALLET (digital assets)
 * providing comprehensive financial management across traditional and digital finance
 */

export interface FinancialAccount {
  id: string
  userId: string
  type: 'traditional' | 'digital' | 'hybrid'
  platform: 'bancai' | 'wallet' | 'integrated'
  accountNumber?: string
  address?: string
  balance: number
  currency: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UnifiedTransaction {
  id: string
  userId: string
  accountId: string
  type: 'transfer' | 'payment' | 'deposit' | 'withdrawal' | 'swap' | 'stake' | 'nft'
  platform: 'bancai' | 'wallet' | 'cross-platform'
  amount: number
  currency: string
  fromAccount?: string
  toAccount?: string
  description: string
  metadata?: Record<string, any>
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled'
  timestamp: Date
  fees?: number
  exchangeRate?: number
}

export interface PortfolioSummary {
  userId: string
  totalValue: number
  traditionalAssets: {
    bankAccounts: number
    savingsAccounts: number
    creditCards: number
    loans: number
    totalValue: number
  }
  digitalAssets: {
    cryptocurrencies: number
    nfts: number
    stakingPositions: number
    totalValue: number
  }
  performance: {
    dayChange: number
    weekChange: number
    monthChange: number
    yearChange: number
  }
  lastUpdated: Date
}

export interface CrossPlatformTransfer {
  id: string
  userId: string
  fromPlatform: 'bancai' | 'wallet'
  toPlatform: 'bancai' | 'wallet'
  fromAccount: string
  toAccount: string
  amount: number
  sourceCurrency: string
  targetCurrency: string
  exchangeRate?: number
  fees: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  metadata: Record<string, any>
}

export interface FinancialInsight {
  id: string
  userId: string
  type: 'spending_pattern' | 'investment_opportunity' | 'risk_alert' | 'savings_goal'
  category: 'banking' | 'crypto' | 'investment' | 'budgeting'
  title: string
  description: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  data: Record<string, any>
  createdAt: Date
  dismissed: boolean
}

export interface TradingPosition {
  id: string
  userId: string
  symbol: string
  assetType: 'stock' | 'crypto' | 'forex' | 'commodity' | 'option'
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  unrealizedPnl: number
  unrealizedPnlPercentage: number
  platform: 'x-trading'
  exchange: string
  lastUpdated: Date
}

export interface TradingAnalytics {
  totalPortfolioValue: number
  totalPnl: number
  totalPnlPercentage: number
  dayChange: number
  dayChangePercentage: number
  positions: TradingPosition[]
  topPerformers: TradingPosition[]
  underPerformers: TradingPosition[]
  assetAllocation: Record<string, number>
  riskMetrics: {
    volatility: number
    sharpeRatio: number
    maxDrawdown: number
    riskScore: number
  }
}

export interface UnifiedPortfolioSummary extends PortfolioSummary {
  tradingAssets: {
    stocks: number
    crypto: number
    forex: number
    commodities: number
    options: number
    totalValue: number
    totalPnl: number
    totalPnlPercentage: number
  }
}

export class FinancialEcosystemService {
  private bancaiApiUrl = 'http://localhost:4033/api'
  private walletApiUrl = 'http://localhost:4034/api'
  private tradingApiUrl = 'http://localhost:4039/api'

  constructor() {
    this.initializeConnections()
  }

  private async initializeConnections(): Promise<void> {
    try {
      // Test connections to both platforms
      const [bancaiHealth, walletHealth] = await Promise.allSettled([
        fetch(`${this.bancaiApiUrl}/health`),
        fetch(`${this.walletApiUrl}/health`)
      ])

      console.log('Financial Ecosystem Service initialized')
      console.log(`BANCAI connection: ${bancaiHealth.status === 'fulfilled' ? '✅' : '❌'}`)
      console.log(`WALLET connection: ${walletHealth.status === 'fulfilled' ? '✅' : '❌'}`)
    } catch (error) {
      console.error('Failed to initialize financial ecosystem:', error)
    }
  }

  // Unified Portfolio Management
  async getUnifiedPortfolio(userId: string): Promise<PortfolioSummary> {
    try {
      const [traditionalData, digitalData] = await Promise.allSettled([
        this.getBancaiAccountsSummary(userId),
        this.getWalletPortfolioSummary(userId)
      ])

      const traditional = traditionalData.status === 'fulfilled' ? traditionalData.value : {
        bankAccounts: 0,
        savingsAccounts: 0,
        creditCards: 0,
        loans: 0,
        totalValue: 0
      }

      const digital = digitalData.status === 'fulfilled' ? digitalData.value : {
        cryptocurrencies: 0,
        nfts: 0,
        stakingPositions: 0,
        totalValue: 0
      }

      const totalValue = traditional.totalValue + digital.totalValue

      return {
        userId,
        totalValue,
        traditionalAssets: traditional,
        digitalAssets: digital,
        performance: {
          dayChange: 0, // Calculate from historical data
          weekChange: 0,
          monthChange: 0,
          yearChange: 0
        },
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Failed to get unified portfolio:', error)
      throw error
    }
  }

  private async getBancaiAccountsSummary(userId: string) {
    const response = await fetch(`${this.bancaiApiUrl}/accounts/summary/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch BANCAI data')
    return response.json()
  }

  private async getWalletPortfolioSummary(userId: string) {
    const response = await fetch(`${this.walletApiUrl}/portfolio/summary/${userId}`)
    if (!response.ok) throw new Error('Failed to fetch WALLET data')
    return response.json()
  }

  // Cross-Platform Transfers
  async initiateCrossPlatformTransfer(transfer: Omit<CrossPlatformTransfer, 'id' | 'createdAt' | 'status'>): Promise<CrossPlatformTransfer> {
    const transferRecord: CrossPlatformTransfer = {
      ...transfer,
      id: `xfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: 'pending'
    }

    try {
      // Validate accounts on both platforms
      await this.validateCrossPlatformAccounts(transfer.fromPlatform, transfer.toPlatform, transfer.fromAccount, transfer.toAccount)

      // Start the transfer process
      if (transfer.fromPlatform === 'bancai' && transfer.toPlatform === 'wallet') {
        return await this.transferFromBancaiToWallet(transferRecord)
      } else if (transfer.fromPlatform === 'wallet' && transfer.toPlatform === 'bancai') {
        return await this.transferFromWalletToBancai(transferRecord)
      } else {
        throw new Error('Invalid cross-platform transfer configuration')
      }
    } catch (error) {
      console.error('Cross-platform transfer failed:', error)
      transferRecord.status = 'failed'
      throw error
    }
  }

  private async validateCrossPlatformAccounts(fromPlatform: string, toPlatform: string, fromAccount: string, toAccount: string): Promise<void> {
    const validations = []

    if (fromPlatform === 'bancai') {
      validations.push(fetch(`${this.bancaiApiUrl}/accounts/validate/${fromAccount}`))
    } else {
      validations.push(fetch(`${this.walletApiUrl}/accounts/validate/${fromAccount}`))
    }

    if (toPlatform === 'bancai') {
      validations.push(fetch(`${this.bancaiApiUrl}/accounts/validate/${toAccount}`))
    } else {
      validations.push(fetch(`${this.walletApiUrl}/accounts/validate/${toAccount}`))
    }

    const results = await Promise.allSettled(validations)
    const failures = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok))

    if (failures.length > 0) {
      throw new Error('Account validation failed')
    }
  }

  private async transferFromBancaiToWallet(transfer: CrossPlatformTransfer): Promise<CrossPlatformTransfer> {
    // 1. Initiate withdrawal from BANCAI
    const withdrawal = await fetch(`${this.bancaiApiUrl}/transactions/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: transfer.fromAccount,
        amount: transfer.amount,
        currency: transfer.sourceCurrency,
        reference: transfer.id
      })
    })

    if (!withdrawal.ok) throw new Error('BANCAI withdrawal failed')

    // 2. Wait for confirmation (in real implementation, this would be event-driven)
    transfer.status = 'processing'

    // 3. Initiate deposit to WALLET
    const deposit = await fetch(`${this.walletApiUrl}/transactions/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletId: transfer.toAccount,
        amount: transfer.amount,
        currency: transfer.targetCurrency,
        reference: transfer.id
      })
    })

    if (!deposit.ok) throw new Error('WALLET deposit failed')

    transfer.status = 'completed'
    transfer.completedAt = new Date()
    return transfer
  }

  private async transferFromWalletToBancai(transfer: CrossPlatformTransfer): Promise<CrossPlatformTransfer> {
    // 1. Initiate withdrawal from WALLET
    const withdrawal = await fetch(`${this.walletApiUrl}/transactions/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletId: transfer.fromAccount,
        amount: transfer.amount,
        currency: transfer.sourceCurrency,
        reference: transfer.id
      })
    })

    if (!withdrawal.ok) throw new Error('WALLET withdrawal failed')

    // 2. Wait for confirmation
    transfer.status = 'processing'

    // 3. Initiate deposit to BANCAI
    const deposit = await fetch(`${this.bancaiApiUrl}/transactions/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: transfer.toAccount,
        amount: transfer.amount,
        currency: transfer.targetCurrency,
        reference: transfer.id
      })
    })

    if (!deposit.ok) throw new Error('BANCAI deposit failed')

    transfer.status = 'completed'
    transfer.completedAt = new Date()
    return transfer
  }

  // Unified Transaction History
  async getUnifiedTransactionHistory(userId: string, limit: number = 50, offset: number = 0): Promise<UnifiedTransaction[]> {
    try {
      const [bancaiTransactions, walletTransactions] = await Promise.allSettled([
        this.getBancaiTransactions(userId, limit / 2, offset),
        this.getWalletTransactions(userId, limit / 2, offset)
      ])

      const allTransactions: UnifiedTransaction[] = []

      if (bancaiTransactions.status === 'fulfilled') {
        allTransactions.push(...bancaiTransactions.value.map(this.mapBancaiTransaction))
      }

      if (walletTransactions.status === 'fulfilled') {
        allTransactions.push(...walletTransactions.value.map(this.mapWalletTransaction))
      }

      // Sort by timestamp, most recent first
      return allTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
    } catch (error) {
      console.error('Failed to get unified transaction history:', error)
      throw error
    }
  }

  private async getBancaiTransactions(userId: string, limit: number, offset: number) {
    const response = await fetch(`${this.bancaiApiUrl}/transactions?userId=${userId}&limit=${limit}&offset=${offset}`)
    if (!response.ok) throw new Error('Failed to fetch BANCAI transactions')
    return response.json()
  }

  private async getWalletTransactions(userId: string, limit: number, offset: number) {
    const response = await fetch(`${this.walletApiUrl}/transactions?userId=${userId}&limit=${limit}&offset=${offset}`)
    if (!response.ok) throw new Error('Failed to fetch WALLET transactions')
    return response.json()
  }

  private mapBancaiTransaction(transaction: any): UnifiedTransaction {
    return {
      id: transaction.id,
      userId: transaction.userId,
      accountId: transaction.accountId,
      type: transaction.type,
      platform: 'bancai',
      amount: transaction.amount,
      currency: transaction.currency,
      fromAccount: transaction.fromAccount,
      toAccount: transaction.toAccount,
      description: transaction.description,
      metadata: transaction.metadata || {},
      status: transaction.status,
      timestamp: new Date(transaction.createdAt),
      fees: transaction.fees
    }
  }

  private mapWalletTransaction(transaction: any): UnifiedTransaction {
    return {
      id: transaction.id,
      userId: transaction.userId,
      accountId: transaction.walletId,
      type: transaction.type,
      platform: 'wallet',
      amount: transaction.amount,
      currency: transaction.assetSymbol,
      description: `${transaction.type} ${transaction.assetSymbol}`,
      metadata: {
        hash: transaction.hash,
        blockNumber: transaction.blockNumber
      },
      status: transaction.status,
      timestamp: new Date(transaction.timestamp),
      fees: transaction.networkFee
    }
  }

  // Financial Insights & Analytics
  async generateFinancialInsights(userId: string): Promise<FinancialInsight[]> {
    try {
      const portfolio = await this.getUnifiedPortfolio(userId)
      const transactions = await this.getUnifiedTransactionHistory(userId, 100)

      const insights: FinancialInsight[] = []

      // Portfolio Diversification Insight
      const traditionalPercentage = (portfolio.traditionalAssets.totalValue / portfolio.totalValue) * 100
      const digitalPercentage = (portfolio.digitalAssets.totalValue / portfolio.totalValue) * 100

      if (traditionalPercentage > 80) {
        insights.push({
          id: `insight_${Date.now()}_diversification`,
          userId,
          type: 'investment_opportunity',
          category: 'investment',
          title: 'Consider Digital Asset Diversification',
          description: `Your portfolio is ${traditionalPercentage.toFixed(1)}% traditional assets. Consider allocating 5-10% to digital assets for diversification.`,
          actionable: true,
          priority: 'medium',
          data: { traditionalPercentage, digitalPercentage },
          createdAt: new Date(),
          dismissed: false
        })
      }

      // High Digital Asset Exposure
      if (digitalPercentage > 30) {
        insights.push({
          id: `insight_${Date.now()}_risk`,
          userId,
          type: 'risk_alert',
          category: 'investment',
          title: 'High Digital Asset Exposure',
          description: `${digitalPercentage.toFixed(1)}% of your portfolio is in digital assets. Consider rebalancing for risk management.`,
          actionable: true,
          priority: 'high',
          data: { digitalPercentage, recommendedMax: 20 },
          createdAt: new Date(),
          dismissed: false
        })
      }

      // Spending Pattern Analysis
      const recentTransactions = transactions.filter(t => {
        const daysSince = (Date.now() - t.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince <= 30
      })

      const totalSpending = recentTransactions
        .filter(t => t.type === 'payment' || t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0)

      if (totalSpending > portfolio.totalValue * 0.1) {
        insights.push({
          id: `insight_${Date.now()}_spending`,
          userId,
          type: 'spending_pattern',
          category: 'budgeting',
          title: 'High Monthly Spending Detected',
          description: `You've spent ${totalSpending.toFixed(2)} this month, which is ${((totalSpending / portfolio.totalValue) * 100).toFixed(1)}% of your total portfolio.`,
          actionable: true,
          priority: 'medium',
          data: { monthlySpending: totalSpending, spendingPercentage: (totalSpending / portfolio.totalValue) * 100 },
          createdAt: new Date(),
          dismissed: false
        })
      }

      return insights
    } catch (error) {
      console.error('Failed to generate financial insights:', error)
      return []
    }
  }

  // Exchange Rates and Conversions
  async getExchangeRates(): Promise<Record<string, number>> {
    try {
      // In a real implementation, this would call external APIs like CoinGecko or Alpha Vantage
      return {
        'USD': 1.0,
        'EUR': 0.85,
        'RON': 4.5,
        'BTC': 0.000025,
        'ETH': 0.0004,
        'USDC': 1.0,
        'MATIC': 0.8
      }
    } catch (error) {
      console.error('Failed to get exchange rates:', error)
      return {}
    }
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const rates = await this.getExchangeRates()
    const fromRate = rates[fromCurrency] || 1
    const toRate = rates[toCurrency] || 1

    return (amount / fromRate) * toRate
  }

  // Account Aggregation
  async getAllAccounts(userId: string): Promise<FinancialAccount[]> {
    try {
      const [bancaiAccounts, walletAccounts] = await Promise.allSettled([
        this.getBancaiAccounts(userId),
        this.getWalletAccounts(userId)
      ])

      const accounts: FinancialAccount[] = []

      if (bancaiAccounts.status === 'fulfilled') {
        accounts.push(...bancaiAccounts.value.map(this.mapBancaiAccount))
      }

      if (walletAccounts.status === 'fulfilled') {
        accounts.push(...walletAccounts.value.map(this.mapWalletAccount))
      }

      return accounts
    } catch (error) {
      console.error('Failed to get all accounts:', error)
      throw error
    }
  }

  private async getBancaiAccounts(userId: string) {
    const response = await fetch(`${this.bancaiApiUrl}/accounts?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch BANCAI accounts')
    return response.json()
  }

  private async getWalletAccounts(userId: string) {
    const response = await fetch(`${this.walletApiUrl}/wallets?userId=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch WALLET accounts')
    return response.json()
  }

  private mapBancaiAccount(account: any): FinancialAccount {
    return {
      id: account.id,
      userId: account.userId,
      type: 'traditional',
      platform: 'bancai',
      accountNumber: account.accountNumber,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: new Date(account.createdAt),
      updatedAt: new Date(account.updatedAt)
    }
  }

  private mapWalletAccount(wallet: any): FinancialAccount {
    return {
      id: wallet.id,
      userId: wallet.userId,
      type: 'digital',
      platform: 'wallet',
      address: wallet.address,
      balance: wallet.balance,
      currency: 'USD', // Total portfolio value in USD
      isActive: wallet.isActive,
      createdAt: new Date(wallet.createdAt),
      updatedAt: new Date(wallet.updatedAt)
    }
  }

  // Demo Data for Testing
  async getTradingPortfolio(userId: string): Promise<TradingAnalytics> {
    try {
      // In production, this would call the X Trading Platform API
      // For demo, return mock data
      return this.getDemoTradingData(userId)
    } catch (error) {
      console.error('Error fetching trading portfolio:', error)
      return this.getDemoTradingData(userId)
    }
  }

  async getUnifiedPortfolioWithTrading(userId: string): Promise<UnifiedPortfolioSummary> {
    try {
      const [bancaiData, walletData, tradingData] = await Promise.all([
        this.getWalletPortfolioSummary(userId),
        this.getWalletPortfolioSummary(userId), // In production, separate wallet API call
        this.getTradingPortfolio(userId)
      ])

      const unifiedPortfolio: UnifiedPortfolioSummary = {
        ...bancaiData,
        tradingAssets: {
          stocks: tradingData.positions.filter((p: TradingPosition) => p.assetType === 'stock').length,
          crypto: tradingData.positions.filter((p: TradingPosition) => p.assetType === 'crypto').length,
          forex: tradingData.positions.filter((p: TradingPosition) => p.assetType === 'forex').length,
          commodities: tradingData.positions.filter((p: TradingPosition) => p.assetType === 'commodity').length,
          options: tradingData.positions.filter((p: TradingPosition) => p.assetType === 'option').length,
          totalValue: tradingData.totalPortfolioValue,
          totalPnl: tradingData.totalPnl,
          totalPnlPercentage: tradingData.totalPnlPercentage
        }
      }

      // Update total value to include trading assets
      unifiedPortfolio.totalValue += tradingData.totalPortfolioValue

      return unifiedPortfolio
    } catch (error) {
      console.error('Error fetching unified portfolio:', error)
      return this.getDemoUnifiedPortfolio(userId)
    }
  }

  async getDemoTradingData(userId: string): Promise<TradingAnalytics> {
    const positions: TradingPosition[] = [
      {
        id: 'pos_001',
        userId,
        symbol: 'AAPL',
        assetType: 'stock',
        quantity: 50,
        averagePrice: 185.23,
        currentPrice: 192.45,
        marketValue: 9622.50,
        unrealizedPnl: 361.00,
        unrealizedPnlPercentage: 3.9,
        platform: 'x-trading',
        exchange: 'NASDAQ',
        lastUpdated: new Date()
      },
      {
        id: 'pos_002',
        userId,
        symbol: 'BTC',
        assetType: 'crypto',
        quantity: 0.25,
        averagePrice: 42000,
        currentPrice: 43500,
        marketValue: 10875.00,
        unrealizedPnl: 375.00,
        unrealizedPnlPercentage: 3.6,
        platform: 'x-trading',
        exchange: 'Binance',
        lastUpdated: new Date()
      },
      {
        id: 'pos_003',
        userId,
        symbol: 'EUR/USD',
        assetType: 'forex',
        quantity: 10000,
        averagePrice: 1.0850,
        currentPrice: 1.0895,
        marketValue: 10895.00,
        unrealizedPnl: 45.00,
        unrealizedPnlPercentage: 0.4,
        platform: 'x-trading',
        exchange: 'FOREX',
        lastUpdated: new Date()
      },
      {
        id: 'pos_004',
        userId,
        symbol: 'GOLD',
        assetType: 'commodity',
        quantity: 5,
        averagePrice: 2020.50,
        currentPrice: 2035.75,
        marketValue: 10178.75,
        unrealizedPnl: 76.25,
        unrealizedPnlPercentage: 0.8,
        platform: 'x-trading',
        exchange: 'COMEX',
        lastUpdated: new Date()
      }
    ]

    const totalPortfolioValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0)
    const totalPnl = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0)
    const totalPnlPercentage = (totalPnl / (totalPortfolioValue - totalPnl)) * 100

    return {
      totalPortfolioValue,
      totalPnl,
      totalPnlPercentage,
      dayChange: 423.15,
      dayChangePercentage: 1.02,
      positions,
      topPerformers: positions.sort((a, b) => b.unrealizedPnlPercentage - a.unrealizedPnlPercentage).slice(0, 3),
      underPerformers: positions.sort((a, b) => a.unrealizedPnlPercentage - b.unrealizedPnlPercentage).slice(0, 2),
      assetAllocation: {
        stocks: 23.2,
        crypto: 26.2,
        forex: 26.3,
        commodities: 24.3
      },
      riskMetrics: {
        volatility: 18.5,
        sharpeRatio: 1.24,
        maxDrawdown: -8.2,
        riskScore: 6.5
      }
    }
  }

  async getDemoUnifiedPortfolio(userId: string): Promise<UnifiedPortfolioSummary> {
    const tradingData = await this.getDemoTradingData(userId)

    return {
      userId,
      totalValue: 87249.48, // Combined traditional + digital + trading
      traditionalAssets: {
        bankAccounts: 2,
        savingsAccounts: 1,
        creditCards: 3,
        loans: 0,
        totalValue: 15234.50
      },
      digitalAssets: {
        cryptocurrencies: 4,
        nfts: 3,
        stakingPositions: 2,
        totalValue: 30443.73
      },
      tradingAssets: {
        stocks: 1,
        crypto: 1,
        forex: 1,
        commodities: 1,
        options: 0,
        totalValue: tradingData.totalPortfolioValue,
        totalPnl: tradingData.totalPnl,
        totalPnlPercentage: tradingData.totalPnlPercentage
      },
      performance: {
        dayChange: 1.8,
        weekChange: 3.2,
        monthChange: 12.1,
        yearChange: 24.7
      },
      lastUpdated: new Date()
    }
  }

  async getDemoData(userId: string) {
    return {
      unifiedPortfolio: {
        userId,
        totalValue: 45678.23,
        traditionalAssets: {
          bankAccounts: 2,
          savingsAccounts: 1,
          creditCards: 3,
          loans: 0,
          totalValue: 15234.50
        },
        digitalAssets: {
          cryptocurrencies: 4,
          nfts: 3,
          stakingPositions: 2,
          totalValue: 30443.73
        },
        performance: {
          dayChange: 2.3,
          weekChange: -1.2,
          monthChange: 8.7,
          yearChange: 15.4
        },
        lastUpdated: new Date()
      },
      recentTransactions: [
        {
          id: 'tx_001',
          platform: 'wallet',
          type: 'swap',
          amount: 0.5,
          currency: 'ETH',
          description: 'Swapped ETH to USDC',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'confirmed'
        },
        {
          id: 'tx_002',
          platform: 'bancai',
          type: 'payment',
          amount: 250.00,
          currency: 'USD',
          description: 'Grocery payment',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          status: 'confirmed'
        },
        {
          id: 'tx_003',
          platform: 'wallet',
          type: 'stake',
          amount: 100,
          currency: 'MATIC',
          description: 'Staked MATIC for rewards',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          status: 'confirmed'
        }
      ],
      insights: [
        {
          id: 'insight_001',
          type: 'investment_opportunity',
          title: 'Diversification Opportunity',
          description: 'Consider moving some traditional assets to digital for better returns.',
          priority: 'medium',
          actionable: true
        },
        {
          id: 'insight_002',
          type: 'savings_goal',
          title: 'Staking Rewards Available',
          description: 'You can earn 8.5% APY by staking your idle USDC.',
          priority: 'high',
          actionable: true
        }
      ]
    }
  }
}

export default FinancialEcosystemService
