/**
 * BancAI Client for CODAI SDK
 * Manages financial AI services, banking operations, and financial analytics
 */

import type {
  CODAIConfig,
  ApiResponse,
  ServiceHealth,
  PaginationParams,
  PaginatedResponse
} from '../types/common';
import type {
  BancAIAccount,
  BancAITransaction
} from '../types/services';
import { BaseClient } from './BaseClient';

export class BancAIClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.bancai, config);
  }

  /**
   * Get BancAI service health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get BancAI dashboard overview
   */
  async getDashboard(): Promise<ApiResponse<{
    accounts: {
      total: number;
      active: number;
      totalBalance: number;
      byType: Record<string, { count: number; balance: number }>;
    };
    transactions: {
      total: number;
      today: number;
      thisMonth: number;
      volume: number;
    };
    insights: {
      spending: Array<{
        category: string;
        amount: number;
        change: number;
      }>;
      savings: {
        current: number;
        goal: number;
        progress: number;
      };
      alerts: number;
    };
    performance: {
      responseTime: number;
      availability: number;
      successRate: number;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: '/dashboard'
    });
  }

  // Account Management

  /**
   * Get all accounts
   */
  async getAccounts(
    filters?: {
      type?: 'checking' | 'savings' | 'credit';
      status?: 'active' | 'frozen' | 'closed';
      currency?: string;
    }
  ): Promise<ApiResponse<BancAIAccount[]>> {
    return this.request<BancAIAccount[]>({
      method: 'GET',
      url: '/accounts',
      params: filters
    });
  }

  /**
   * Get account by ID
   */
  async getAccount(accountId: string): Promise<ApiResponse<BancAIAccount>> {
    return this.request<BancAIAccount>({
      method: 'GET',
      url: `/accounts/${accountId}`
    });
  }

  /**
   * Create new account
   */
  async createAccount(account: {
    type: 'checking' | 'savings' | 'credit';
    name: string;
    currency: string;
    initialBalance?: number;
  }): Promise<ApiResponse<BancAIAccount>> {
    return this.request<BancAIAccount>({
      method: 'POST',
      url: '/accounts',
      data: account
    });
  }

  /**
   * Update account
   */
  async updateAccount(
    accountId: string,
    updates: Partial<BancAIAccount>
  ): Promise<ApiResponse<BancAIAccount>> {
    return this.request<BancAIAccount>({
      method: 'PUT',
      url: `/accounts/${accountId}`,
      data: updates
    });
  }

  /**
   * Close account
   */
  async closeAccount(accountId: string): Promise<ApiResponse<{
    success: boolean;
    finalBalance: number;
    closedAt: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/accounts/${accountId}/close`
    });
  }

  /**
   * Get account balance history
   */
  async getBalanceHistory(
    accountId: string,
    period?: '7d' | '30d' | '90d' | '1y'
  ): Promise<ApiResponse<Array<{
    date: string;
    balance: number;
    change: number;
  }>>> {
    return this.request({
      method: 'GET',
      url: `/accounts/${accountId}/balance-history`,
      params: { period }
    });
  }

  // Transaction Management

  /**
   * Get transactions
   */
  async getTransactions(
    filters?: {
      accountId?: string;
      type?: 'debit' | 'credit';
      category?: string;
      status?: 'pending' | 'completed' | 'failed';
      dateRange?: {
        start: string;
        end: string;
      };
      amountRange?: {
        min: number;
        max: number;
      };
    },
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<BancAITransaction>>> {
    return this.request<PaginatedResponse<BancAITransaction>>({
      method: 'GET',
      url: '/transactions',
      params: { ...filters, ...pagination }
    });
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<ApiResponse<BancAITransaction>> {
    return this.request<BancAITransaction>({
      method: 'GET',
      url: `/transactions/${transactionId}`
    });
  }

  /**
   * Create transaction
   */
  async createTransaction(transaction: {
    accountId: string;
    type: 'debit' | 'credit' | 'transfer';
    amount: number;
    currency: string;
    description: string;
    category?: string;
    toAccountId?: string; // For transfers
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<BancAITransaction>> {
    return this.request<BancAITransaction>({
      method: 'POST',
      url: '/transactions',
      data: transaction
    });
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(transactionId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return this.request({
      method: 'POST',
      url: `/transactions/${transactionId}/cancel`
    });
  }

  /**
   * Get transaction categories
   */
  async getTransactionCategories(): Promise<ApiResponse<Array<{
    name: string;
    description: string;
    icon: string;
    color: string;
    subcategories?: string[];
  }>>> {
    return this.request({
      method: 'GET',
      url: '/transactions/categories'
    });
  }

  /**
   * Categorize transactions automatically
   */
  async categorizeTransactions(
    transactionIds: string[]
  ): Promise<ApiResponse<Array<{
    transactionId: string;
    category: string;
    confidence: number;
    suggestions: Array<{
      category: string;
      confidence: number;
    }>;
  }>>> {
    return this.request({
      method: 'POST',
      url: '/transactions/categorize',
      data: { transactionIds }
    });
  }

  // Financial Analytics

  /**
   * Get spending analysis
   */
  async getSpendingAnalysis(options?: {
    accountId?: string;
    period?: '1m' | '3m' | '6m' | '1y';
    groupBy?: 'category' | 'merchant' | 'day' | 'week' | 'month';
  }): Promise<ApiResponse<{
    totalSpending: number;
    averageDaily: number;
    averageMonthly: number;
    breakdown: Array<{
      name: string;
      amount: number;
      percentage: number;
      count: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    insights: Array<{
      type: 'trend' | 'anomaly' | 'recommendation';
      title: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    timeline: Array<{
      date: string;
      amount: number;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/analytics/spending',
      params: options
    });
  }

  /**
   * Get income analysis
   */
  async getIncomeAnalysis(options?: {
    accountId?: string;
    period?: '1m' | '3m' | '6m' | '1y';
  }): Promise<ApiResponse<{
    totalIncome: number;
    averageMonthly: number;
    sources: Array<{
      source: string;
      amount: number;
      percentage: number;
      frequency: 'one-time' | 'weekly' | 'monthly' | 'quarterly';
    }>;
    stability: {
      score: number;
      factors: string[];
    };
    projections: Array<{
      month: string;
      projected: number;
      confidence: number;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/analytics/income',
      params: options
    });
  }

  /**
   * Get budgeting insights
   */
  async getBudgetingInsights(accountId?: string): Promise<ApiResponse<{
    currentBudget: {
      total: number;
      spent: number;
      remaining: number;
      categories: Array<{
        category: string;
        budgeted: number;
        spent: number;
        remaining: number;
        status: 'on-track' | 'warning' | 'exceeded';
      }>;
    };
    recommendations: Array<{
      type: 'reduce' | 'increase' | 'reallocate';
      category: string;
      currentAmount: number;
      suggestedAmount: number;
      reasoning: string;
      potential_savings: number;
    }>;
    trends: Array<{
      category: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      change: number;
      period: string;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/analytics/budgeting',
      params: accountId ? { accountId } : undefined
    });
  }

  /**
   * Get financial health score
   */
  async getFinancialHealthScore(accountId?: string): Promise<ApiResponse<{
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: Array<{
      name: string;
      score: number;
      weight: number;
      description: string;
      suggestions: string[];
    }>;
    benchmarks: {
      savings_rate: { current: number; recommended: number };
      debt_ratio: { current: number; recommended: number };
      emergency_fund: { current: number; recommended: number };
      investment_rate: { current: number; recommended: number };
    };
    actionPlan: Array<{
      priority: 'high' | 'medium' | 'low';
      action: string;
      impact: string;
      timeframe: string;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/analytics/health-score',
      params: accountId ? { accountId } : undefined
    });
  }

  // AI-Powered Features

  /**
   * Get AI financial advice
   */
  async getFinancialAdvice(query: {
    question: string;
    context?: 'budgeting' | 'saving' | 'investing' | 'debt' | 'general';
    accountId?: string;
  }): Promise<ApiResponse<{
    advice: string;
    reasoning: string;
    actionItems: string[];
    relatedTopics: string[];
    confidence: number;
    sources?: string[];
  }>> {
    return this.request({
      method: 'POST',
      url: '/ai/advice',
      data: query
    });
  }

  /**
   * Detect anomalies in transactions
   */
  async detectAnomalies(accountId?: string): Promise<ApiResponse<{
    anomalies: Array<{
      transactionId: string;
      type: 'amount' | 'frequency' | 'merchant' | 'location' | 'time';
      description: string;
      severity: 'low' | 'medium' | 'high';
      confidence: number;
      recommendations: string[];
    }>;
    summary: {
      total: number;
      bySeverity: Record<string, number>;
      byType: Record<string, number>;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: '/ai/anomalies',
      params: accountId ? { accountId } : undefined
    });
  }

  /**
   * Get predictive insights
   */
  async getPredictiveInsights(options?: {
    accountId?: string;
    timeframe?: '1m' | '3m' | '6m' | '1y';
    type?: 'balance' | 'spending' | 'income' | 'all';
  }): Promise<ApiResponse<{
    predictions: Array<{
      type: string;
      timeframe: string;
      prediction: number;
      confidence: number;
      factors: string[];
    }>;
    scenarios: Array<{
      name: string;
      description: string;
      probability: number;
      impact: number;
      recommendations: string[];
    }>;
    alerts: Array<{
      type: 'warning' | 'opportunity' | 'risk';
      message: string;
      urgency: 'low' | 'medium' | 'high';
      actionRequired: boolean;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/ai/predictions',
      params: options
    });
  }

  // Reporting

  /**
   * Generate financial report
   */
  async generateReport(config: {
    type: 'monthly' | 'quarterly' | 'annual' | 'custom';
    accountIds?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    sections: Array<'overview' | 'transactions' | 'analytics' | 'budget' | 'goals'>;
    format: 'pdf' | 'xlsx' | 'csv';
    includeCharts?: boolean;
  }): Promise<ApiResponse<{
    reportId: string;
    status: 'generating' | 'ready' | 'failed';
    downloadUrl?: string;
    estimatedCompletion?: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/reports/generate',
      data: config
    });
  }

  /**
   * Export data
   */
  async exportData(options: {
    type: 'transactions' | 'accounts' | 'all';
    format: 'csv' | 'xlsx' | 'json';
    dateRange?: {
      start: string;
      end: string;
    };
    accountIds?: string[];
  }): Promise<ApiResponse<{
    downloadUrl: string;
    filename: string;
    size: number;
    expiresAt: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/export',
      data: options
    });
  }
}
