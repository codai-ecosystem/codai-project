import { NextRequest, NextResponse } from 'next/server'
import MemorAIService from '../../../../services/memoraiService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    const includeInsights = searchParams.get('includeInsights') === 'true'

    const memoraiService = MemorAIService.getInstance()

    // Get detailed analytics data
    const analyticsData = await memoraiService.getDetailedAnalytics({
      timeRange,
      includeInsights
    })

    return NextResponse.json(analyticsData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { timeRange = '30d', includeInsights = true } = body

    const memoraiService = MemorAIService.getInstance()

    // Get filtered analytics data
    const analyticsData = await memoraiService.getDetailedAnalytics({
      timeRange,
      includeInsights
    })

    // Generate custom insights based on filters
    if (includeInsights) {
      const customInsights = await memoraiService.generateInsights()
      analyticsData.insights = [...analyticsData.insights, ...customInsights.map(insight => ({
        trend: insight.title,
        description: insight.description,
        impact: insight.confidence > 0.8 ? 'high' as const : insight.confidence > 0.6 ? 'medium' as const : 'low' as const,
        recommendation: insight.action || 'No specific action required',
        confidence: insight.confidence
      }))]
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics POST API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process analytics request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
