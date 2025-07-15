import { NextRequest, NextResponse } from 'next/server'
import AjutAIService from '../../../../../services/ajutaiService'

const ajutaiService = AjutAIService.getInstance()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = await ajutaiService.analyzeTicket(params.id)

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found or analysis failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: analysis
    })
  } catch (error) {
    console.error('Error analyzing ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze ticket' },
      { status: 500 }
    )
  }
}
