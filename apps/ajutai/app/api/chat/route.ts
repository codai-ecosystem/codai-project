import { NextRequest, NextResponse } from 'next/server'
import AjutAIService from '../../../services/ajutaiService'

const ajutaiService = AjutAIService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const agentId = searchParams.get('agentId')
    const status = searchParams.get('status') as any
    const type = searchParams.get('type') as any

    const filters: any = {}
    if (userId) filters.userId = userId
    if (agentId) filters.agentId = agentId
    if (status) filters.status = status
    if (type) filters.type = type

    const sessions = await ajutaiService.getChatSessions(filters)

    return NextResponse.json({
      success: true,
      data: sessions,
      count: sessions.length
    })
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['userId', 'type']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const session = await ajutaiService.createChatSession({
      userId: body.userId,
      agentId: body.agentId,
      type: body.type,
      status: body.status || 'active',
      satisfaction: body.satisfaction,
      metadata: {
        channel: body.metadata?.channel || 'website',
        userAgent: body.metadata?.userAgent,
        referrer: body.metadata?.referrer,
        sessionDuration: 0,
        messagesCount: 0,
        escalated: false,
        escalationReason: body.metadata?.escalationReason
      },
      aiContext: {
        intent: body.aiContext?.intent || 'general_inquiry',
        entities: body.aiContext?.entities || {},
        confidence: body.aiContext?.confidence || 0.5,
        suggestedResponses: body.aiContext?.suggestedResponses || [],
        handoffRecommended: body.aiContext?.handoffRecommended || false,
        sentiment: body.aiContext?.sentiment || 'neutral'
      }
    })

    return NextResponse.json({
      success: true,
      data: session
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating chat session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create chat session' },
      { status: 500 }
    )
  }
}
