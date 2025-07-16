import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '../../../lib/analytics-service'

const analyticsService = new AnalyticsService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, periods = 7 } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid data format. Expected array of historical metrics.'
      }, { status: 400 })
    }

    const result = await analyticsService.generateForecast(data, periods)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      forecast: result.forecast,
      periods,
      summary: {
        historical_points: data.length,
        forecast_periods: periods,
        trend_direction: result.forecast && result.forecast.length > 1
          ? (result.forecast[result.forecast.length - 1].value > result.forecast[0].value ? 'upward' : 'downward')
          : 'stable',
        average_confidence: result.forecast
          ? (result.forecast.reduce((sum, p) => sum + p.confidence, 0) / result.forecast.length).toFixed(2)
          : 0
      }
    })

  } catch (error) {
    console.error('Forecast generation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') || 'revenue'
    const periods = parseInt(searchParams.get('periods') || '7')

    // Mock forecast data for demo
    const mockForecast = Array.from({ length: periods }, (_, i) => ({
      timestamp: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      value: Math.round(8500 + Math.random() * 2000 + i * 100), // Trending upward with noise
      confidence: Math.max(0.1, 0.9 - (i * 0.1)), // Decreasing confidence
      type: 'forecast',
      aiInsights: `Predicted ${metric} for day ${i + 1} ahead with ${Math.round((0.9 - i * 0.1) * 100)}% confidence`
    }))

    return NextResponse.json({
      success: true,
      forecast: mockForecast,
      metric,
      periods,
      summary: {
        trend_direction: 'upward',
        average_confidence: (mockForecast.reduce((sum, p) => sum + p.confidence, 0) / mockForecast.length).toFixed(2),
        prediction_range: {
          min: Math.min(...mockForecast.map(f => f.value)),
          max: Math.max(...mockForecast.map(f => f.value))
        }
      }
    })

  } catch (error) {
    console.error('Forecast fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch forecast'
    }, { status: 500 })
  }
}
