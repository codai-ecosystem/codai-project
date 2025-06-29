// Enhanced MemorAI integration for Bancai financial platform
import { memorai, type MemoryEntry } from '@/lib/codai-client';
import type { User, Transaction, BankAccount, AIInsight } from '@/types';

export interface FinancialMemoryEntry extends MemoryEntry {
  userId?: string;
  category?: 'transaction' | 'account' | 'user_preference' | 'ai_insight' | 'financial_goal';
  financialData?: {
    amount?: number;
    currency?: string;
    accountId?: string;
    transactionType?: string;
  };
}

export class BancaiMemoryService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // User financial preferences and settings
  async storeUserPreference(
    preference: string,
    value: any,
    category: string = 'user_preference'
  ): Promise<{ success: boolean; memoryId?: string }> {
    try {
      const content = `User preference: ${preference} = ${JSON.stringify(value)}`;
      const result = await memorai.storeMemory(content, {
        userId: this.userId,
        category,
        preference,
        value,
        timestamp: new Date().toISOString(),
      });

      return {
        success: result.success,
        memoryId: result.data?.id,
      };
    } catch (error) {
      console.error('Failed to store user preference:', error);
      return { success: false };
    }
  }

  // Transaction patterns and insights
  async storeTransactionInsight(
    transaction: Transaction,
    insight: string,
    confidence: number = 1.0
  ): Promise<{ success: boolean; memoryId?: string }> {
    try {
      const content = `Transaction insight: ${insight} for transaction ${transaction.id}`;
      const result = await memorai.storeMemory(content, {
        userId: this.userId,
        category: 'transaction',
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        accountId: transaction.accountId,
        insight,
        confidence,
        timestamp: new Date().toISOString(),
      });

      return {
        success: result.success,
        memoryId: result.data?.id,
      };
    } catch (error) {
      console.error('Failed to store transaction insight:', error);
      return { success: false };
    }
  }

  // AI-generated financial insights
  async storeAIInsight(
    insight: AIInsight
  ): Promise<{ success: boolean; memoryId?: string }> {
    try {
      const content = `AI Insight: ${insight.title} - ${insight.description}`;
      const result = await memorai.storeMemory(content, {
        userId: this.userId,
        category: 'ai_insight',
        insightType: insight.type,
        confidence: insight.confidence,
        actionable: insight.actionable,
        data: insight.data,
        timestamp: new Date().toISOString(),
      });

      return {
        success: result.success,
        memoryId: result.data?.id,
      };
    } catch (error) {
      console.error('Failed to store AI insight:', error);
      return { success: false };
    }
  }

  // Financial goals and progress tracking
  async storeFinancialGoal(
    goalType: string,
    targetAmount: number,
    currentAmount: number,
    deadline?: string
  ): Promise<{ success: boolean; memoryId?: string }> {
    try {
      const content = `Financial goal: ${goalType} - Target: ${targetAmount}, Current: ${currentAmount}`;
      const result = await memorai.storeMemory(content, {
        userId: this.userId,
        category: 'financial_goal',
        goalType,
        targetAmount,
        currentAmount,
        deadline,
        progress: (currentAmount / targetAmount) * 100,
        timestamp: new Date().toISOString(),
      });

      return {
        success: result.success,
        memoryId: result.data?.id,
      };
    } catch (error) {
      console.error('Failed to store financial goal:', error);
      return { success: false };
    }
  }

  // Search for specific financial memories
  async searchFinancialMemories(
    query: string,
    category?: string
  ): Promise<FinancialMemoryEntry[]> {
    try {
      const searchQuery = category 
        ? `${query} category:${category} userId:${this.userId}`
        : `${query} userId:${this.userId}`;

      const result = await memorai.recallMemory(searchQuery);

      if (!result.success || !result.data) {
        return [];
      }

      return result.data.map(entry => ({
        ...entry,
        userId: entry.metadata?.userId,
        category: entry.metadata?.category,
        financialData: {
          amount: entry.metadata?.amount,
          currency: entry.metadata?.currency,
          accountId: entry.metadata?.accountId,
          transactionType: entry.metadata?.transactionType,
        },
      }));
    } catch (error) {
      console.error('Failed to search financial memories:', error);
      return [];
    }
  }

  // Get user's financial insights summary
  async getFinancialInsightsSummary(): Promise<{
    totalInsights: number;
    categories: Record<string, number>;
    recentInsights: FinancialMemoryEntry[];
  }> {
    try {
      const insights = await this.searchFinancialMemories('', 'ai_insight');
      
      const categories = insights.reduce((acc, insight) => {
        const type = insight.metadata?.insightType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentInsights = insights
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      return {
        totalInsights: insights.length,
        categories,
        recentInsights,
      };
    } catch (error) {
      console.error('Failed to get financial insights summary:', error);
      return {
        totalInsights: 0,
        categories: {},
        recentInsights: [],
      };
    }
  }

  // Account-specific memory operations
  async storeAccountInsight(
    account: BankAccount,
    insight: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; memoryId?: string }> {
    try {
      const content = `Account insight for ${account.accountType} account ${account.accountNumber}: ${insight}`;
      const result = await memorai.storeMemory(content, {
        userId: this.userId,
        category: 'account',
        accountId: account.id,
        accountType: account.accountType,
        balance: account.balance,
        currency: account.currency,
        insight,
        ...metadata,
        timestamp: new Date().toISOString(),
      });

      return {
        success: result.success,
        memoryId: result.data?.id,
      };
    } catch (error) {
      console.error('Failed to store account insight:', error);
      return { success: false };
    }
  }

  // Clean up old memories (privacy compliance)
  async cleanupOldMemories(olderThanDays: number = 365): Promise<{ success: boolean; cleaned: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const oldMemories = await this.searchFinancialMemories('');
      const memoriesToDelete = oldMemories.filter(memory => 
        new Date(memory.timestamp) < cutoffDate
      );

      let cleaned = 0;
      for (const memory of memoriesToDelete) {
        const result = await memorai.deleteMemory(memory.id);
        if (result.success) {
          cleaned++;
        }
      }

      return { success: true, cleaned };
    } catch (error) {
      console.error('Failed to cleanup old memories:', error);
      return { success: false, cleaned: 0 };
    }
  }
}

// Utility function to create memory service for a user
export function createMemoryService(userId: string): BancaiMemoryService {
  return new BancaiMemoryService(userId);
}

// Global memory operations (admin/system level)
export class BancaiSystemMemory {
  // Store system-wide financial insights
  static async storeSystemInsight(
    insight: string,
    category: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; memoryId?: string }> {
    try {
      const content = `System insight [${category}]: ${insight}`;
      const result = await memorai.storeMemory(content, {
        system: true,
        category: `system_${category}`,
        ...metadata,
        timestamp: new Date().toISOString(),
      });

      return {
        success: result.success,
        memoryId: result.data?.id,
      };
    } catch (error) {
      console.error('Failed to store system insight:', error);
      return { success: false };
    }
  }

  // Get system performance metrics
  static async getSystemMetrics(): Promise<{
    totalUsers: number;
    totalTransactions: number;
    totalInsights: number;
    systemHealth: string;
  }> {
    try {
      const systemMemories = await memorai.recallMemory('system category:system_metrics');
      
      // This would be populated by background processes
      // For now, return default values
      return {
        totalUsers: 0,
        totalTransactions: 0,
        totalInsights: 0,
        systemHealth: 'healthy',
      };
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      return {
        totalUsers: 0,
        totalTransactions: 0,
        totalInsights: 0,
        systemHealth: 'unknown',
      };
    }
  }
}
