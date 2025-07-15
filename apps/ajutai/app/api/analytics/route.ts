import { NextRequest, NextResponse } from 'next/server'
import AjutAIService from '../../../services/ajutaiService'

const ajutaiService = AjutAIService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') as any || 'month'

    const analytics = await ajutaiService.getAnalytics(period)

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
