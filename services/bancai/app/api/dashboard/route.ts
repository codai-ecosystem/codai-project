import { NextRequest, NextResponse } from 'next/server';
import { withAuthApi, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { createMemoryService } from '@/lib/memory-service';
import type { AuthUser } from '@/lib/codai-client';
import type { BankAccount, Transaction } from '@/types';

async function handleGetDashboard(req: AuthenticatedRequest, user: AuthUser) {
  try {
    const memoryService = createMemoryService(user.id);

    // Get financial insights summary
    const insightsSummary = await memoryService.getFinancialInsightsSummary();

    // Search for account and transaction data
    const accountData = await memoryService.searchFinancialMemories('account banking financial', 'transaction');
    const transactionData = await memoryService.searchFinancialMemories('transactions spending', 'transaction');

    // Mock dashboard data (in real implementation, this would aggregate from database)
    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      financialSummary: {
        totalBalance: 17741.28, // This would be calculated from actual accounts
        monthlyIncome: 2500.00,
        monthlyExpenses: 1845.32,
        savingsRate: 0.26,
        netWorth: 17741.28
      },
      accountSummary: {
        totalAccounts: 2,
        checkingBalance: 2540.78,
        savingsBalance: 15200.50,
        creditUtilization: 0.15
      },
      recentTransactions: 5, // Count of recent transactions
      insights: {
        total: insightsSummary.totalInsights,
        categories: insightsSummary.categories,
        recent: insightsSummary.recentInsights.length
      },
      spendingByCategory: {
        food: 285.42,
        shopping: 189.99,
        utilities: 245.67,
        transport: 125.30,
        entertainment: 89.45
      },
      savingsGoals: [
        {
          id: `goal_${user.id}_emergency`,
          name: 'Emergency Fund',
          targetAmount: 20000,
          currentAmount: 15200,
          progress: 0.76,
          targetDate: '2024-12-31'
        },
        {
          id: `goal_${user.id}_vacation`,
          name: 'Vacation Fund',
          targetAmount: 5000,
          currentAmount: 1200,
          progress: 0.24,
          targetDate: '2024-08-01'
        }
      ],
      alerts: [
        {
          id: `alert_${user.id}_001`,
          type: 'spending',
          message: 'You\'re 15% over your monthly food budget',
          severity: 'medium',
          actionable: true
        }
      ],
      aiRecommendations: [
        {
          id: `rec_${user.id}_001`,
          type: 'saving',
          title: 'Optimize Coffee Spending',
          description: 'Save $120/month by brewing coffee at home',
          impact: 'medium'
        },
        {
          id: `rec_${user.id}_002`,
          type: 'investment',
          title: 'Consider Index Funds',
          description: 'Your cash reserves are high - consider investing for growth',
          impact: 'high'
        }
      ]
    };

    // Store dashboard access insight
    await memoryService.storeAIInsight({
      id: `insight_${user.id}_dashboard_${Date.now()}`,
      userId: user.id,
      type: 'spending_pattern',
      title: 'Dashboard Access',
      description: `User accessed financial dashboard - viewing ${dashboardData.insights.total} insights`,
      confidence: 1.0,
      actionable: false,
      data: {
        accessTime: new Date().toISOString(),
        totalBalance: dashboardData.financialSummary.totalBalance,
        savingsRate: dashboardData.financialSummary.savingsRate
      },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withAuthApi(handleGetDashboard as any);
