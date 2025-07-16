import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '../../../lib/analytics-service'
import { z } from 'zod'

const InsightRequestSchema = z.object({
  data: z.array(z.any()),
  context: z.string(),
  type: z.enum(['TREND_DETECTION', 'ANOMALY_ALERT', 'FORECAST', 'CORRELATION', 'PERFORMANCE_ISSUE', 'OPTIMIZATION_OPPORTUNITY', 'BUSINESS_RECOMMENDATION']).optional()
})

const analyticsService = new AnalyticsService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, context, type } = InsightRequestSchema.parse(body)

    // Get user ID from headers or session
    const userId = request.headers.get('user-id') || 'demo-user'

    const result = await analyticsService.generateInsights(data, context, userId)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      insights: result.insights,
      count: result.insights?.length || 0
    })

  } catch (error) {
    console.error('Insight generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user'
    const priority = searchParams.get('priority')
    const status = searchParams.get('status') || 'ACTIVE'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Mock insights data for demo
    const insights = [
      {
        id: '1',
        title: 'Revenue Growth Trend Detected',
        description: 'Your revenue has increased by 23% over the last 7 days compared to the previous week.',
        type: 'TREND_DETECTION',
        confidence: 0.92,
        significance: 0.85,
        priority: 'HIGH',
        status: 'ACTIVE',
        category: 'Performance',
        metrics: {
          currentWeekRevenue: 45670,
          previousWeekRevenue: 37120,
          growthRate: 0.23
        },
        trends: {
          direction: 'upward',
          consistency: 'high',
          strength: 'strong'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'User Engagement Anomaly',
        description: 'Unusual spike in user session duration detected yesterday. Average session time increased by 145%.',
        type: 'ANOMALY_ALERT',
        confidence: 0.88,
        significance: 0.91,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        category: 'User Behavior',
        metrics: {
          normalSessionDuration: 145,
          anomalySessionDuration: 355,
          increase: 1.45
        },
        anomalies: {
          severity: 'moderate',
          likelyEvent: 'content update or viral post'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Conversion Rate Optimization Opportunity',
        description: 'Analysis suggests that simplifying the checkout process could increase conversions by 15-20%.',
        type: 'OPTIMIZATION_OPPORTUNITY',
        confidence: 0.79,
        significance: 0.72,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        category: 'Growth',
        predictions: {
          expectedIncrease: 0.175,
          confidenceInterval: [0.15, 0.20],
          implementationEffort: 'medium'
        },
        createdAt: new Date().toISOString()
      }
    ]

    // Filter insights based on query parameters
    let filteredInsights = insights

    if (priority) {
      filteredInsights = filteredInsights.filter(i => i.priority === priority.toUpperCase())
    }

    if (status) {
      filteredInsights = filteredInsights.filter(i => i.status === status.toUpperCase())
    }

    return NextResponse.json({
      success: true,
      insights: filteredInsights.slice(0, limit),
      total: filteredInsights.length,
      filters: {
        priority,
        status,
        limit
      }
    })

  } catch (error) {
    console.error('Insights fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch insights'
    }, { status: 500 })
  }
}
