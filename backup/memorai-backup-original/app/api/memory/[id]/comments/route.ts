import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memoryId = params.id

    // Mock comments data - in real implementation, this would come from database
    const comments = [
      {
        id: 'comment-1',
        memoryId,
        content: 'This is a great point about React performance. Have you considered using React.memo for the component optimization?',
        author: {
          id: 'user-2',
          name: 'Alice Johnson'
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        position: { x: 100, y: 200 },
        isResolved: false,
        replies: [],
        reactions: [
          {
            type: 'like' as const,
            userId: 'user-1',
            timestamp: new Date(Date.now() - 3000000).toISOString()
          }
        ]
      },
      {
        id: 'comment-2',
        memoryId,
        content: 'I agree with the architecture approach. We should also consider the scalability implications for the database design.',
        author: {
          id: 'user-3',
          name: 'Bob Smith'
        },
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isResolved: false,
        replies: [
          {
            id: 'reply-1',
            memoryId,
            content: 'Good point! I\'ll add that to the next iteration.',
            author: {
              id: 'user-1',
              name: 'Current User'
            },
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            isResolved: false,
            replies: [],
            reactions: []
          }
        ],
        reactions: [
          {
            type: 'wow' as const,
            userId: 'user-1',
            timestamp: new Date(Date.now() - 1500000).toISOString()
          }
        ]
      },
      {
        id: 'comment-3',
        memoryId,
        content: 'This documentation is really comprehensive. Thanks for putting this together!',
        author: {
          id: 'user-4',
          name: 'Carol Wilson'
        },
        timestamp: new Date(Date.now() - 900000).toISOString(),
        isResolved: true,
        replies: [],
        reactions: [
          {
            type: 'celebrate' as const,
            userId: 'user-1',
            timestamp: new Date(Date.now() - 600000).toISOString()
          },
          {
            type: 'like' as const,
            userId: 'user-2',
            timestamp: new Date(Date.now() - 300000).toISOString()
          }
        ]
      }
    ]

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Comments GET API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch comments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memoryId = params.id
    const body = await request.json()
    const { content, position, author, parentId } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (!author || !author.id || !author.name) {
      return NextResponse.json({ error: 'Author information is required' }, { status: 400 })
    }

    // Create new comment
    const newComment = {
      id: `comment-${Date.now()}`,
      memoryId,
      content: content.trim(),
      author,
      timestamp: new Date().toISOString(),
      position,
      isResolved: false,
      replies: [],
      reactions: []
    }

    // In real implementation, this would be saved to database
    console.log('New comment created:', newComment)

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Comments POST API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create comment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memoryId = params.id
    const body = await request.json()
    const { commentId, action, data } = body

    switch (action) {
      case 'resolve':
        // Mark comment as resolved
        return NextResponse.json({
          success: true,
          message: 'Comment resolved',
          commentId,
          isResolved: true
        })

      case 'unresolve':
        // Mark comment as unresolved
        return NextResponse.json({
          success: true,
          message: 'Comment unresolved',
          commentId,
          isResolved: false
        })

      case 'add_reaction':
        // Add reaction to comment
        const reaction = {
          type: data.type,
          userId: data.userId,
          timestamp: new Date().toISOString()
        }
        return NextResponse.json({
          success: true,
          message: 'Reaction added',
          commentId,
          reaction
        })

      case 'remove_reaction':
        // Remove reaction from comment
        return NextResponse.json({
          success: true,
          message: 'Reaction removed',
          commentId,
          userId: data.userId,
          reactionType: data.type
        })

      case 'edit':
        // Edit comment content
        return NextResponse.json({
          success: true,
          message: 'Comment updated',
          commentId,
          content: data.content,
          updatedAt: new Date().toISOString()
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Comments PATCH API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update comment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memoryId = params.id
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // In real implementation, this would delete from database
    console.log('Comment deleted:', { memoryId, commentId })

    return NextResponse.json({
      success: true,
      message: 'Comment deleted',
      commentId
    })
  } catch (error) {
    console.error('Comments DELETE API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete comment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
