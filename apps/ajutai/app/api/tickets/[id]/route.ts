import { NextRequest, NextResponse } from 'next/server'
import AjutAIService from '../../../../services/ajutaiService'

const ajutaiService = AjutAIService.getInstance()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await ajutaiService.getTicketById(params.id)

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: ticket
    })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updatedTicket = await ajutaiService.updateTicket(params.id, {
      ...body,
      updatedAt: new Date().toISOString()
    })

    if (!updatedTicket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedTicket
    })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real implementation, you might soft-delete or archive tickets
    // For now, we'll return a success response
    return NextResponse.json({
      success: true,
      message: 'Ticket deletion requested'
    })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}
