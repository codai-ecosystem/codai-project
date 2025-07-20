import { NextRequest, NextResponse } from 'next/server'
import MemorAIService from '../../../../../services/memoraiService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const memoryId = resolvedParams.id
    const memoraiService = MemorAIService.getInstance()

    // Get memory with collaboration data
    const memory = await memoraiService.getMemoryById(memoryId)
    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    // Mock collaboration data - in real implementation, this would come from database
    const collaborationData = {
      id: memory.id,
      title: memory.title,
      isShared: true, // Mock as shared
      shareLink: `https://memorai.app/shared/${memory.id}`,
      permissions: {
        canEdit: true,
        canComment: true,
        canShare: true,
        isPublic: false
      },
      collaborators: [
        {
          id: 'user-1',
          name: 'Current User',
          status: 'active' as const,
          joinedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          role: 'owner' as const,
          color: '#8b5cf6'
        },
        {
          id: 'user-2',
          name: 'Alice Johnson',
          status: 'active' as const,
          joinedAt: new Date(Date.now() - 3600000).toISOString(),
          lastActivity: new Date(Date.now() - 300000).toISOString(),
          role: 'editor' as const,
          color: '#06b6d4'
        },
        {
          id: 'user-3',
          name: 'Bob Smith',
          status: 'idle' as const,
          joinedAt: new Date(Date.now() - 7200000).toISOString(),
          lastActivity: new Date(Date.now() - 1800000).toISOString(),
          role: 'viewer' as const,
          color: '#10b981'
        }
      ],
      shareSettings: {
        requiresAuth: true,
        allowGuests: false,
        maxCollaborators: 10
      },
      activity: [
        {
          id: 'activity-1',
          type: 'edit' as const,
          user: {
            id: 'user-2',
            name: 'Alice Johnson'
          },
          timestamp: new Date(Date.now() - 300000).toISOString(),
          description: 'Alice edited the content'
        },
        {
          id: 'activity-2',
          type: 'comment' as const,
          user: {
            id: 'user-3',
            name: 'Bob Smith'
          },
          timestamp: new Date(Date.now() - 600000).toISOString(),
          description: 'Bob added a comment'
        },
        {
          id: 'activity-3',
          type: 'join' as const,
          user: {
            id: 'user-3',
            name: 'Bob Smith'
          },
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          description: 'Bob joined the collaboration'
        }
      ]
    }

    return NextResponse.json(collaborationData)
  } catch (error) {
    console.error('Collaboration API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch collaboration data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'update_permissions':
        // Update memory permissions
        // In real implementation, this would update the database
        return NextResponse.json({
          success: true,
          message: 'Permissions updated',
          permissions: data
        })

      case 'add_collaborator':
        // Add new collaborator
        // In real implementation, this would send invitation and update database
        return NextResponse.json({
          success: true,
          message: 'Collaborator added',
          collaborator: {
            id: `user-${Date.now()}`,
            name: data.email.split('@')[0],
            status: 'invited' as const,
            joinedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            role: data.role,
            color: '#f59e0b'
          }
        })

      case 'remove_collaborator':
        // Remove collaborator
        return NextResponse.json({
          success: true,
          message: 'Collaborator removed'
        })

      case 'update_role':
        // Update collaborator role
        return NextResponse.json({
          success: true,
          message: 'Role updated',
          collaborator: data
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Collaboration POST API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process collaboration request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
