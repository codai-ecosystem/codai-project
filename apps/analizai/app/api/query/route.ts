import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '../../../lib/analytics-service'
import { z } from 'zod'

const QueryRequestSchema = z.object({
  query: z.string(),
  dataSource: z.string(),
  parameters: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional()
})

const analyticsService = new AnalyticsService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, dataSource, parameters, filters } = QueryRequestSchema.parse(body)
    
    // Get user ID from headers or session (simplified for demo)
    const userId = request.headers.get('user-id') || 'demo-user'

    const result = await analyticsService.executeQuery({
      query,
      dataSource,
      parameters,
      filters
    }, userId)

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      executionTime: result.executionTime,
      rowCount: result.data?.length || 0
    })

  } catch (error) {
    console.error('Query execution error:', error)
    
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // This would fetch user's recent queries from database
    // For demo, returning mock data
    const recentQueries = [
      {
        id: '1',
        name: 'Daily Revenue Analysis',
        sqlQuery: 'SELECT DATE(created_at) as date, SUM(amount) as revenue FROM orders GROUP BY DATE(created_at)',
        status: 'COMPLETED',
        executionTime: 245,
        rowCount: 30,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'User Engagement Metrics',
        sqlQuery: 'SELECT user_id, COUNT(*) as sessions FROM analytics_sessions GROUP BY user_id',
        status: 'COMPLETED',
        executionTime: 156,
        rowCount: 1247,
        createdAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      queries: recentQueries.slice(offset, offset + limit),
      total: recentQueries.length
    })

  } catch (error) {
    console.error('Query history error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch query history'
    }, { status: 500 })
  }
}
