import { NextRequest, NextResponse } from 'next/server';
import { withAuthApi, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { createMemoryService } from '@/lib/memory-service';
import type { AuthUser } from '@/lib/codai-client';
import type { AIInsight } from '@/types';

async function handleGetInsights(req: AuthenticatedRequest, user: AuthUser) {
  try {
    const memoryService = createMemoryService(user.id);
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') as 'spending_pattern' | 'saving_opportunity' | 'investment_advice' | 'fraud_alert' | undefined;

    // Search for existing AI insights
    const existingInsights = await memoryService.searchFinancialMemories('AI insight recommendations', 'ai_insight');
    
    if (existingInsights && existingInsights.length > 0) {
      let filteredInsights = existingInsights;
      
      // Filter by type if specified
      if (type) {
        filteredInsights = existingInsights.filter(insight => 
          insight.metadata?.insightType === type
        );
      }
      
      const insights = filteredInsights
        .slice(0, limit)
        .map(entry => ({
          id: entry.id,
          userId: user.id,
          type: entry.metadata?.insightType || 'spending_pattern',
          title: entry.content?.split(' - ')[0]?.replace('AI Insight: ', '') || 'Financial Insight',
          description: entry.content?.split(' - ')[1] || entry.content || 'AI-generated financial recommendation',
          confidence: entry.metadata?.confidence || 0.8,
          actionable: entry.metadata?.actionable || true,
          data: entry.metadata?.data,
          createdAt: entry.timestamp || new Date().toISOString()
        }));

      return NextResponse.json({
        insights,
        total: filteredInsights.length
      });
    }

    // Generate mock AI insights if none exist
    const mockInsights: AIInsight[] = [
      {
        id: `insight_${user.id}_spending_001`,
        userId: user.id,
        type: 'spending_pattern',
        title: 'High Coffee Spending Detected',
        description: 'You\'ve spent $180 on coffee this month, 23% more than last month. Consider brewing at home to save $120/month.',
        confidence: 0.92,
        actionable: true,
        data: {
          category: 'food',
          monthlySpend: 180,
          averageSpend: 146,
          potentialSavings: 120,
          recommendations: ['Buy a coffee machine', 'Set daily coffee budget']
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `insight_${user.id}_saving_001`,
        userId: user.id,
        type: 'saving_opportunity',
        title: 'Automatic Savings Opportunity',
        description: 'Based on your income pattern, you can safely save an additional $300/month by setting up automatic transfers.',
        confidence: 0.87,
        actionable: true,
        data: {
          currentSavingsRate: 0.15,
          recommendedSavingsRate: 0.23,
          additionalSavings: 300,
          recommendations: ['Set up automatic transfer', 'Create emergency fund goal']
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `insight_${user.id}_investment_001`,
        userId: user.id,
        type: 'investment_advice',
        title: 'Portfolio Diversification Suggestion',
        description: 'Your emergency fund is well-established. Consider diversifying with low-cost index funds.',
        confidence: 0.78,
        actionable: true,
        data: {
          riskProfile: 'moderate',
          currentAllocation: { cash: 0.85, investments: 0.15 },
          recommendedAllocation: { cash: 0.6, stocks: 0.3, bonds: 0.1 },
          expectedReturn: 0.07
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Store insights in memory for future retrieval
    for (const insight of mockInsights) {
      await memoryService.storeAIInsight(insight);
    }

    // Filter by type if specified
    let filteredInsights = mockInsights;
    if (type) {
      filteredInsights = mockInsights.filter(insight => insight.type === type);
    }

    const limitedInsights = filteredInsights.slice(0, limit);

    return NextResponse.json({
      insights: limitedInsights,
      total: filteredInsights.length
    });

  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

export const GET = withAuthApi(handleGetInsights as any);
