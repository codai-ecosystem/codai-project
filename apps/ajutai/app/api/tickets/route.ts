import { NextRequest, NextResponse } from 'next/server'
import AjutAIService from '../../../services/ajutaiService'

const ajutaiService = AjutAIService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as any
    const priority = searchParams.get('priority') as any
    const category = searchParams.get('category') as any
    const assignedTo = searchParams.get('assignedTo')
    const userId = searchParams.get('userId')

    const filters: any = {}
    if (status) filters.status = status
    if (priority) filters.priority = priority
    if (category) filters.category = category
    if (assignedTo) filters.assignedTo = assignedTo
    if (userId) filters.userId = userId

    const tickets = await ajutaiService.getTickets(filters)

    return NextResponse.json({
      success: true,
      data: tickets,
      count: tickets.length
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'priority', 'category', 'userId']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const ticket = await ajutaiService.createTicket({
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: body.status || 'open',
      category: body.category,
      userId: body.userId,
      assignedTo: body.assignedTo,
      tags: body.tags || [],
      attachments: body.attachments || [],
      escalationLevel: body.escalationLevel || 0,
      estimatedResolutionTime: body.estimatedResolutionTime,
      metadata: {
        source: body.metadata?.source || 'portal',
        device: body.metadata?.device,
        browser: body.metadata?.browser,
        os: body.metadata?.os,
        location: body.metadata?.location,
        customerTier: body.metadata?.customerTier || 'basic'
      }
    })

    return NextResponse.json({
      success: true,
      data: ticket
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}
