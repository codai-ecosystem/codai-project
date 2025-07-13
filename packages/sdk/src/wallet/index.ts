import type { CodaiConfig } from '../types';
import { HttpUtils, ErrorUtils, ValidationUtils } from '../utils';

// Wallet interfaces for bancai.ro integration
export interface Wallet {
  id: string;
  userId: string;
  type: 'personal' | 'business' | 'joint' | 'savings' | 'investment';
  name: string;
  currency: string;
  balance: {
    available: number;
    pending: number;
    total: number;
    reserved: number;
  };
  status: 'active' | 'frozen' | 'closed' | 'pending_verification';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit' | 'transfer' | 'fee' | 'reward' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  description: string;
  reference?: string;
  metadata: {
    category?: string;
    subcategory?: string;
    merchantId?: string;
    merchantName?: string;
    location?: string;
    exchangeRate?: number;
    originalAmount?: number;
    originalCurrency?: string;
    fee?: number;
    tax?: number;
  };
  relatedTransactionId?: string;
  createdAt: Date;
  processedAt?: Date;
  failedAt?: Date;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank_account' | 'crypto' | 'digital_wallet' | 'cash';
  name: string;
  details: {
    // Card details
    cardNumber?: string; // Masked
    expiryMonth?: number;
    expiryYear?: number;
    brand?: string;
    last4?: string;
    // Bank account details
    accountNumber?: string; // Masked
    routingNumber?: string;
    bankName?: string;
    accountType?: 'checking' | 'savings';
    // Crypto details
    address?: string;
    network?: string;
    // Digital wallet details
    provider?: string;
    accountId?: string;
  };
  isDefault: boolean;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'expired' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transfer {
  id: string;
  fromWalletId: string;
  toWalletId?: string;
  toAddress?: string;
  amount: number;
  currency: string;
  fee: number;
  exchangeRate?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  categories: string[];
  alerts: {
    thresholds: number[]; // Percentage thresholds (e.g., [50, 80, 100])
    notificationMethods: ('email' | 'sms' | 'push')[];
  };
  spent: number;
  remaining: number;
  status: 'active' | 'paused' | 'exceeded';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investment {
  id: string;
  userId: string;
  walletId: string;
  type: 'stocks' | 'bonds' | 'crypto' | 'funds' | 'commodities' | 'real_estate';
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  value: number;
  totalReturn: number;
  totalReturnPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  status: 'active' | 'sold' | 'expired';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditScore {
  score: number;
  range: string;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  recommendations: string[];
  lastUpdated: Date;
  provider: string;
}

// Wallet service for CODAI ecosystem (bancai.ro integration)
export class WalletService {
  private config: CodaiConfig;
  private httpClient: any;

  constructor(config: CodaiConfig) {
    this.config = config;
    this.httpClient = HttpUtils.createHttpClient(
      config.endpoints?.wallet || 'https://bancai.ro/api'
    );
  }

  /**
   * Create new wallet
   */
  async createWallet(
    walletData: Omit<Wallet, 'id' | 'balance' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Wallet> {
    try {
      ValidationUtils.validateRequired(walletData, ['userId', 'type', 'name', 'currency']);

      const response = await this.httpClient.post('/wallets', walletData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create wallet',
        'WALLET_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get wallet by ID
   */
  async getWallet(walletId: string): Promise<Wallet> {
    try {
      const response = await this.httpClient.get(`/wallets/${walletId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get wallet',
        'WALLET_GET_FAILED',
        error
      );
    }
  }

  /**
   * List user wallets
   */
  async listWallets(userId: string): Promise<Wallet[]> {
    try {
      const response = await this.httpClient.get(`/users/${userId}/wallets`);
      return response.data.wallets;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list wallets',
        'WALLET_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Update wallet
   */
  async updateWallet(
    walletId: string,
    updates: Partial<Pick<Wallet, 'name' | 'metadata'>>
  ): Promise<Wallet> {
    try {
      const response = await this.httpClient.patch(`/wallets/${walletId}`, updates);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update wallet',
        'WALLET_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Freeze/unfreeze wallet
   */
  async setWalletStatus(walletId: string, status: Wallet['status']): Promise<Wallet> {
    try {
      const response = await this.httpClient.patch(`/wallets/${walletId}/status`, { status });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to set wallet status',
        'WALLET_STATUS_FAILED',
        error
      );
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletId: string): Promise<Wallet['balance']> {
    try {
      const response = await this.httpClient.get(`/wallets/${walletId}/balance`);
      return response.data.balance;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get wallet balance',
        'WALLET_BALANCE_FAILED',
        error
      );
    }
  }

  /**
   * Create transaction
   */
  async createTransaction(
    transactionData: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'processedAt' | 'failedAt'>
  ): Promise<Transaction> {
    try {
      ValidationUtils.validateRequired(transactionData, [
        'walletId', 'type', 'amount', 'currency', 'description'
      ]);

      const response = await this.httpClient.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create transaction',
        'TRANSACTION_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get transaction
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await this.httpClient.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get transaction',
        'TRANSACTION_GET_FAILED',
        error
      );
    }
  }

  /**
   * List wallet transactions
   */
  async listTransactions(
    walletId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      type?: Transaction['type'];
      status?: Transaction['status'];
    }
  ): Promise<{
    transactions: Transaction[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.startDate) params.append('startDate', options.startDate.toISOString());
      if (options?.endDate) params.append('endDate', options.endDate.toISOString());
      if (options?.type) params.append('type', options.type);
      if (options?.status) params.append('status', options.status);

      const response = await this.httpClient.get(
        `/wallets/${walletId}/transactions?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list transactions',
        'TRANSACTION_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(
    paymentMethodData: Omit<PaymentMethod, 'id' | 'isVerified' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<PaymentMethod> {
    try {
      ValidationUtils.validateRequired(paymentMethodData, ['userId', 'type', 'name']);

      const response = await this.httpClient.post('/payment-methods', paymentMethodData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to add payment method',
        'PAYMENT_METHOD_ADD_FAILED',
        error
      );
    }
  }

  /**
   * List payment methods
   */
  async listPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const response = await this.httpClient.get(`/users/${userId}/payment-methods`);
      return response.data.paymentMethods;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list payment methods',
        'PAYMENT_METHOD_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/payment-methods/${paymentMethodId}`);
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to remove payment method',
        'PAYMENT_METHOD_REMOVE_FAILED',
        error
      );
    }
  }

  /**
   * Create transfer
   */
  async createTransfer(
    transferData: Omit<Transfer, 'id' | 'status' | 'completedAt' | 'failureReason' | 'createdAt'>
  ): Promise<Transfer> {
    try {
      ValidationUtils.validateRequired(transferData, [
        'fromWalletId', 'amount', 'currency'
      ]);

      if (!transferData.toWalletId && !transferData.toAddress) {
        throw new Error('Either toWalletId or toAddress must be provided');
      }

      const response = await this.httpClient.post('/transfers', transferData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create transfer',
        'TRANSFER_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get transfer
   */
  async getTransfer(transferId: string): Promise<Transfer> {
    try {
      const response = await this.httpClient.get(`/transfers/${transferId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get transfer',
        'TRANSFER_GET_FAILED',
        error
      );
    }
  }

  /**
   * Cancel transfer
   */
  async cancelTransfer(transferId: string): Promise<Transfer> {
    try {
      const response = await this.httpClient.post(`/transfers/${transferId}/cancel`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to cancel transfer',
        'TRANSFER_CANCEL_FAILED',
        error
      );
    }
  }

  /**
   * Create budget
   */
  async createBudget(
    budgetData: Omit<Budget, 'id' | 'spent' | 'remaining' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Budget> {
    try {
      ValidationUtils.validateRequired(budgetData, [
        'userId', 'name', 'amount', 'currency', 'period', 'startDate', 'endDate'
      ]);

      const response = await this.httpClient.post('/budgets', budgetData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create budget',
        'BUDGET_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * List user budgets
   */
  async listBudgets(userId: string): Promise<Budget[]> {
    try {
      const response = await this.httpClient.get(`/users/${userId}/budgets`);
      return response.data.budgets;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list budgets',
        'BUDGET_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Update budget
   */
  async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget> {
    try {
      const response = await this.httpClient.patch(`/budgets/${budgetId}`, updates);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update budget',
        'BUDGET_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Get budget analysis
   */
  async getBudgetAnalysis(
    budgetId: string
  ): Promise<{
    budget: Budget;
    analysis: {
      spendingTrend: 'increasing' | 'decreasing' | 'stable';
      projectedSpend: number;
      daysRemaining: number;
      averageDailySpend: number;
      recommendations: string[];
      categories: Array<{
        category: string;
        spent: number;
        percentage: number;
      }>;
    };
  }> {
    try {
      const response = await this.httpClient.get(`/budgets/${budgetId}/analysis`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get budget analysis',
        'BUDGET_ANALYSIS_FAILED',
        error
      );
    }
  }

  /**
   * Get investments
   */
  async getInvestments(userId: string): Promise<Investment[]> {
    try {
      const response = await this.httpClient.get(`/users/${userId}/investments`);
      return response.data.investments;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get investments',
        'INVESTMENT_GET_FAILED',
        error
      );
    }
  }

  /**
   * Get investment portfolio summary
   */
  async getPortfolioSummary(
    userId: string
  ): Promise<{
    totalValue: number;
    totalReturn: number;
    totalReturnPercentage: number;
    dayChange: number;
    dayChangePercentage: number;
    allocation: Array<{
      type: Investment['type'];
      value: number;
      percentage: number;
    }>;
    topPerformers: Investment[];
    worstPerformers: Investment[];
  }> {
    try {
      const response = await this.httpClient.get(`/users/${userId}/portfolio/summary`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get portfolio summary',
        'PORTFOLIO_SUMMARY_FAILED',
        error
      );
    }
  }

  /**
   * Get credit score
   */
  async getCreditScore(userId: string): Promise<CreditScore> {
    try {
      const response = await this.httpClient.get(`/users/${userId}/credit-score`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get credit score',
        'CREDIT_SCORE_FAILED',
        error
      );
    }
  }

  /**
   * Get financial insights
   */
  async getFinancialInsights(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<{
    spending: {
      total: number;
      byCategory: Array<{ category: string; amount: number; percentage: number }>;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    income: {
      total: number;
      sources: Array<{ source: string; amount: number; percentage: number }>;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    savings: {
      rate: number;
      amount: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    recommendations: string[];
    goals: Array<{
      type: string;
      target: number;
      current: number;
      progress: number;
      estimatedCompletion: Date;
    }>;
  }> {
    try {
      const response = await this.httpClient.post(`/users/${userId}/insights`, {
        timeRange
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get financial insights',
        'FINANCIAL_INSIGHTS_FAILED',
        error
      );
    }
  }
}
