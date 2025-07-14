import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '../../../lib/analytics-service'

const analyticsService = new AnalyticsService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, threshold = 2.5 } = body
    
    if (!data || !Array.isArray(data)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid data format. Expected array of metrics.'
      }, { status: 400 })
    }

    const result = await analyticsService.detectAnomalies(data, threshold)

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      anomalies: result.anomalies,
      count: result.anomalies?.length || 0,
      threshold,
      summary: {
        total_points: data.length,
        anomalies_detected: result.anomalies?.length || 0,
        anomaly_rate: ((result.anomalies?.length || 0) / data.length * 100).toFixed(2) + '%'
      }
    })

  } catch (error) {
    console.error('Anomaly detection error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Mock recent anomalies for demo
    const recentAnomalies = [
      {
        id: '1',
        metric: 'daily_revenue',
        value: 15420,
        expectedValue: 8750,
        anomalyScore: 3.2,
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
        aiAnalysis: 'Significant revenue spike detected. Likely due to successful marketing campaign or viral content.',
        recommendations: [
          'Investigate traffic sources for the spike',
          'Ensure sufficient inventory for increased demand',
          'Monitor conversion rates for sustainability'
        ]
      },
      {
        id: '2',
        metric: 'user_sessions',
        value: 234,
        expectedValue: 890,
        anomalyScore: 2.8,
        severity: 'MEDIUM',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        aiAnalysis: 'Lower than expected user sessions. Could indicate technical issues or external factors.',
        recommendations: [
          'Check website performance and uptime',
          'Review recent changes to user experience',
          'Monitor competitor activity and market conditions'
        ]
      }
    ]

    let filteredAnomalies = recentAnomalies
    
    if (severity) {
      filteredAnomalies = filteredAnomalies.filter(a => a.severity === severity.toUpperCase())
    }

    return NextResponse.json({
      success: true,
      anomalies: filteredAnomalies.slice(0, limit),
      total: filteredAnomalies.length,
      filters: { severity, limit }
    })

  } catch (error) {
    console.error('Anomalies fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch anomalies'
    }, { status: 500 })
  }
}
