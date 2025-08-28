/**
 * Collaborative Memory API Endpoints
 * RESTful API for multi-user memory collaboration, sharing, and team management
 * 
 * Endpoints:
 * - POST /api/collaboration/memories - Create collaborative memory
 * - GET /api/collaboration/memories - Get user's collaborative memories
 * - GET /api/collaboration/memories/:id - Get specific collaborative memory
 * - PUT /api/collaboration/memories/:id - Update collaborative memory
 * - POST /api/collaboration/memories/:id/share - Share memory with users/teams
 * - POST /api/collaboration/memories/:id/collaborate - Request collaboration
 * - POST /api/collaboration/teams - Create team
 * - GET /api/collaboration/teams/:id - Get team details
 * - POST /api/collaboration/teams/:id/members - Add team member
 * - GET /api/collaboration/analytics - Get collaboration analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CollaborativeMemoryService } from '../../../../services/collaboration/CollaborativeMemoryService';

// Initialize the collaborative memory service
const collaborativeService = new CollaborativeMemoryService();

// Validation schemas
const CreateMemorySchema = z.object({
  agentId: z.string(),
  content: z.string().min(1),
  metadata: z.object({}).passthrough().optional(),
  ownerId: z.string(),
  teamId: z.string().optional()
});

const UpdateMemorySchema = z.object({
  content: z.string().min(1),
  metadata: z.object({}).passthrough().optional(),
  expectedVersion: z.number().optional()
});

const ShareMemorySchema = z.object({
  userIds: z.array(z.string()).optional(),
  teamIds: z.array(z.string()).optional(),
  permissions: z.object({
    read: z.boolean().optional(),
    write: z.boolean().optional(),
    admin: z.boolean().optional()
  }),
  role: z.enum(['viewer', 'editor', 'admin', 'owner']).optional()
});

const CollaborationRequestSchema = z.object({
  toUserId: z.string(),
  requestedRole: z.enum(['viewer', 'editor', 'admin', 'owner']),
  message: z.string().optional()
});

const CreateTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ownerId: z.string()
});

const AddTeamMemberSchema = z.object({
  inviterUserId: z.string(),
  newMemberUserId: z.string(),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).default('member')
});

const RespondToRequestSchema = z.object({
  response: z.enum(['approved', 'rejected'])
});

// Utility function to extract user ID from request (simplified - in production would use JWT)
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || request.headers.get('x-owner-id') || 'anonymous';
}

// GET /api/collaboration/memories - Get user's collaborative memories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = getUserId(request);
    const teamId = searchParams.get('teamId');
    const memoryId = searchParams.get('memoryId');
    const action = searchParams.get('action') || 'list';

    switch (action) {
      case 'list':
        if (teamId) {
          const memories = await collaborativeService.getTeamMemories(teamId, userId);
          return NextResponse.json({
            success: true,
            data: memories,
            count: memories.length,
            timestamp: new Date().toISOString()
          });
        } else {
          const memories = await collaborativeService.getUserCollaborativeMemories(userId);
          return NextResponse.json({
            success: true,
            data: memories,
            count: memories.length,
            timestamp: new Date().toISOString()
          });
        }

      case 'get':
        if (!memoryId) {
          return NextResponse.json(
            { success: false, error: 'Memory ID is required' },
            { status: 400 }
          );
        }

        const memory = await collaborativeService.getCollaborativeMemory(memoryId, userId);
        return NextResponse.json({
          success: true,
          data: memory,
          timestamp: new Date().toISOString()
        });

      case 'analytics':
        const teamIdForAnalytics = searchParams.get('teamId');
        const analytics = await collaborativeService.getCollaborationAnalytics(
          teamIdForAnalytics || undefined,
          userId
        );
        return NextResponse.json({
          success: true,
          data: analytics,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Collaborative Memory GET API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: error instanceof Error && error.message.includes('Access denied') ? 403 : 500 }
    );
  }
}

// POST /api/collaboration/memories - Create or manage collaborative memories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'create';
    const memoryId = searchParams.get('memoryId');
    const userId = getUserId(request);

    switch (action) {
      case 'create':
        const validatedCreateData = CreateMemorySchema.parse(body);
        const memory = await collaborativeService.createCollaborativeMemory(
          validatedCreateData.agentId,
          validatedCreateData.content,
          validatedCreateData.metadata || {},
          validatedCreateData.ownerId || userId,
          validatedCreateData.teamId
        );

        return NextResponse.json({
          success: true,
          data: memory,
          message: 'Collaborative memory created successfully',
          timestamp: new Date().toISOString()
        }, { status: 201 });

      case 'share':
        if (!memoryId) {
          return NextResponse.json(
            { success: false, error: 'Memory ID is required for sharing' },
            { status: 400 }
          );
        }

        const validatedShareData = ShareMemorySchema.parse(body);
        
        // Convert schema format to service format
        const shareWithData = {
            userIds: validatedShareData.userIds,
            teamIds: validatedShareData.teamIds,
            permissions: validatedShareData.permissions as any, // Type assertion due to schema/service mismatch
            role: validatedShareData.role
        };
        
        const sharedMemory = await collaborativeService.shareMemory(
          memoryId,
          userId,
          shareWithData
        );

        return NextResponse.json({
          success: true,
          data: sharedMemory,
          message: 'Memory shared successfully',
          timestamp: new Date().toISOString()
        });

      case 'collaborate':
        if (!memoryId) {
          return NextResponse.json(
            { success: false, error: 'Memory ID is required for collaboration request' },
            { status: 400 }
          );
        }

        const validatedCollabData = CollaborationRequestSchema.parse(body);
        const collaborationRequest = await collaborativeService.requestCollaboration(
          memoryId,
          userId,
          validatedCollabData.toUserId,
          validatedCollabData.requestedRole,
          validatedCollabData.message
        );

        return NextResponse.json({
          success: true,
          data: collaborationRequest,
          message: 'Collaboration request sent successfully',
          timestamp: new Date().toISOString()
        });

      case 'respond-collaboration':
        const requestId = searchParams.get('requestId');
        if (!requestId) {
          return NextResponse.json(
            { success: false, error: 'Request ID is required' },
            { status: 400 }
          );
        }

        const validatedResponseData = RespondToRequestSchema.parse(body);
        const updatedRequest = await collaborativeService.respondToCollaborationRequest(
          requestId,
          userId,
          validatedResponseData.response
        );

        return NextResponse.json({
          success: true,
          data: updatedRequest,
          message: `Collaboration request ${validatedResponseData.response}`,
          timestamp: new Date().toISOString()
        });

      case 'create-team':
        const validatedTeamData = CreateTeamSchema.parse(body);
        const team = await collaborativeService.createTeam(
          validatedTeamData.name,
          validatedTeamData.ownerId || userId,
          validatedTeamData.description
        );

        return NextResponse.json({
          success: true,
          data: team,
          message: 'Team created successfully',
          timestamp: new Date().toISOString()
        }, { status: 201 });

      case 'add-team-member':
        const teamId = searchParams.get('teamId');
        if (!teamId) {
          return NextResponse.json(
            { success: false, error: 'Team ID is required' },
            { status: 400 }
          );
        }

        const validatedMemberData = AddTeamMemberSchema.parse(body);
        const updatedTeam = await collaborativeService.addTeamMember(
          teamId,
          validatedMemberData.inviterUserId || userId,
          validatedMemberData.newMemberUserId,
          validatedMemberData.role
        );

        return NextResponse.json({
          success: true,
          data: updatedTeam,
          message: 'Team member added successfully',
          timestamp: new Date().toISOString()
        });

      case 'get-team-members':
        const teamIdForMembers = searchParams.get('teamId');
        if (!teamIdForMembers) {
          return NextResponse.json(
            { success: false, error: 'Team ID is required' },
            { status: 400 }
          );
        }

        const members = await collaborativeService.getTeamMembers(teamIdForMembers, userId);
        return NextResponse.json({
          success: true,
          data: members,
          count: members.length,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: error.errors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    console.error('Collaborative Memory POST API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: error instanceof Error && error.message.includes('Access denied') ? 403 : 500 }
    );
  }
}

// PUT /api/collaboration/memories - Update collaborative memory
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const memoryId = searchParams.get('memoryId');
    const userId = getUserId(request);

    if (!memoryId) {
      return NextResponse.json(
        { success: false, error: 'Memory ID is required' },
        { status: 400 }
      );
    }

    const validatedUpdateData = UpdateMemorySchema.parse(body);
    const updatedMemory = await collaborativeService.updateCollaborativeMemory(
      memoryId,
      userId,
      validatedUpdateData.content,
      validatedUpdateData.metadata,
      validatedUpdateData.expectedVersion
    );

    return NextResponse.json({
      success: true,
      data: updatedMemory,
      message: 'Collaborative memory updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: error.errors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    console.error('Collaborative Memory PUT API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: error instanceof Error && error.message.includes('Access denied') ? 403 : 500 }
    );
  }
}

// DELETE /api/collaboration/memories - Delete collaborative memory or remove access
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'delete';
    const memoryId = searchParams.get('memoryId');
    const userId = getUserId(request);

    if (!memoryId) {
      return NextResponse.json(
        { success: false, error: 'Memory ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'delete':
        // Note: Actual delete implementation would require additional methods in service
        return NextResponse.json({
          success: true,
          message: 'Delete functionality would be implemented here',
          timestamp: new Date().toISOString()
        });

      case 'leave':
        // Note: Leave collaboration implementation would require additional methods in service
        return NextResponse.json({
          success: true,
          message: 'Leave collaboration functionality would be implemented here',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Collaborative Memory DELETE API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
