/**
 * Team Workspaces API Endpoints
 * Phase 6.4.3: Advanced Team Collaboration with Workspace Isolation
 * 
 * RESTful API for team workspace management:
 * - POST /api/collaboration/workspaces - Create workspace
 * - GET /api/collaboration/workspaces - Get user workspaces
 * - GET /api/collaboration/workspaces/:id - Get workspace details
 * - PUT /api/collaboration/workspaces/:id - Update workspace
 * - DELETE /api/collaboration/workspaces/:id - Delete workspace
 * - POST /api/collaboration/workspaces/:id/members - Add member
 * - PUT /api/collaboration/workspaces/:id/members/:userId - Update member
 * - DELETE /api/collaboration/workspaces/:id/members/:userId - Remove member
 * - GET /api/collaboration/workspaces/:id/activity - Get activity feed
 * - GET /api/collaboration/workspaces/:id/analytics - Get workspace analytics
 * - GET /api/collaboration/workspaces/templates - Get workspace templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import TeamWorkspaceService, { TeamRole, Permission, WorkspaceSettings, ActivityType } from '../../../../services/collaboration/TeamWorkspaceService';

// Initialize the team workspace service
const workspaceService = new TeamWorkspaceService();

// Validation schemas
const CreateWorkspaceSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    ownerId: z.string().min(1),
    template: z.string().optional(),
    settings: z.object({
        defaultPermissions: z.array(z.string()).optional(),
        allowGuestAccess: z.boolean().optional(),
        requireApprovalForJoining: z.boolean().optional(),
        memoryRetentionDays: z.number().min(1).optional(),
        maxMembers: z.number().min(1).max(1000).optional(),
        allowExternalSharing: z.boolean().optional(),
        backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
        analyticsEnabled: z.boolean().optional(),
        notificationSettings: z.object({
            newMembers: z.boolean().optional(),
            memoryUpdates: z.boolean().optional(),
            weeklyDigest: z.boolean().optional(),
            systemAlerts: z.boolean().optional(),
            collaborationUpdates: z.boolean().optional()
        }).optional()
    }).optional(),
    initialMembers: z.array(z.string()).optional()
});

const UpdateWorkspaceSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    settings: z.object({
        defaultPermissions: z.array(z.string()).optional(),
        allowGuestAccess: z.boolean().optional(),
        requireApprovalForJoining: z.boolean().optional(),
        memoryRetentionDays: z.number().min(1).optional(),
        maxMembers: z.number().min(1).max(1000).optional(),
        allowExternalSharing: z.boolean().optional(),
        backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
        analyticsEnabled: z.boolean().optional(),
        notificationSettings: z.object({
            newMembers: z.boolean().optional(),
            memoryUpdates: z.boolean().optional(),
            weeklyDigest: z.boolean().optional(),
            systemAlerts: z.boolean().optional(),
            collaborationUpdates: z.boolean().optional()
        }).optional()
    }).optional(),
    tags: z.array(z.string()).optional(),
    visibility: z.enum(['private', 'team', 'public']).optional()
});

const AddMemberSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(['owner', 'admin', 'editor', 'viewer', 'contributor', 'guest']).optional().default('contributor'),
    permissions: z.array(z.string()).optional(),
    invitedBy: z.string().min(1)
});

const UpdateMemberSchema = z.object({
    role: z.enum(['owner', 'admin', 'editor', 'viewer', 'contributor', 'guest']).optional(),
    permissions: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive', 'pending']).optional(),
    updatedBy: z.string().min(1)
});

const ActivityQuerySchema = z.object({
    limit: z.number().min(1).max(100).optional().default(50),
    offset: z.number().min(0).optional().default(0),
    types: z.array(z.string()).optional(),
    userId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
});

// Helper function to validate and convert strings to ActivityType
function validateActivityTypes(types?: string[]): ActivityType[] | undefined {
    if (!types) return undefined;
    
    const validActivityTypes: ActivityType[] = [
        'memory_created', 'memory_updated', 'memory_deleted', 'memory_shared',
        'member_added', 'member_removed', 'role_changed', 'settings_updated',
        'workspace_created', 'collaboration_started'
    ];
    
    return types.filter(type => validActivityTypes.includes(type as ActivityType)) as ActivityType[];
}

const AnalyticsQuerySchema = z.object({
    timeRange: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional().default('month')
});

/**
 * Handle workspace creation
 * POST /api/collaboration/workspaces
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Team Workspaces API: Creating workspace with data:', body);

        // Validate request data
        const validatedData = CreateWorkspaceSchema.parse(body);

        // Create workspace
        const workspace = await workspaceService.createWorkspace({
            name: validatedData.name,
            description: validatedData.description,
            ownerId: validatedData.ownerId,
            template: validatedData.template,
            settings: validatedData.settings as Partial<WorkspaceSettings>,
            initialMembers: validatedData.initialMembers
        });

        console.log('Workspace created successfully:', workspace.id);

        return NextResponse.json({
            success: true,
            message: 'Workspace created successfully',
            data: workspace,
            timestamp: new Date().toISOString()
        }, { status: 201 });

    } catch (error) {
        console.error('Team Workspaces API Error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create workspace',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

/**
 * Handle workspace retrieval
 * GET /api/collaboration/workspaces
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'list';
        const userId = searchParams.get('userId');
        const workspaceId = searchParams.get('workspaceId');

        console.log('Team Workspaces API: GET request with action:', action);

        switch (action) {
            case 'list':
                if (!userId) {
                    return NextResponse.json({
                        success: false,
                        error: 'userId parameter is required for listing workspaces',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                const userWorkspaces = await workspaceService.getUserWorkspaces(userId);

                return NextResponse.json({
                    success: true,
                    data: userWorkspaces,
                    count: userWorkspaces.length,
                    timestamp: new Date().toISOString()
                });

            case 'details':
                if (!workspaceId) {
                    return NextResponse.json({
                        success: false,
                        error: 'workspaceId parameter is required for workspace details',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                const workspace = await workspaceService.getWorkspace(workspaceId);
                if (!workspace) {
                    return NextResponse.json({
                        success: false,
                        error: 'Workspace not found',
                        timestamp: new Date().toISOString()
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: workspace,
                    timestamp: new Date().toISOString()
                });

            case 'templates':
                const templates = await workspaceService.getWorkspaceTemplates();

                return NextResponse.json({
                    success: true,
                    data: templates,
                    count: templates.length,
                    timestamp: new Date().toISOString()
                });

            case 'activity':
                if (!workspaceId) {
                    return NextResponse.json({
                        success: false,
                        error: 'workspaceId parameter is required for activity feed',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                // Parse activity query parameters
                const rawQuery = ActivityQuerySchema.parse({
                    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
                    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
                    types: searchParams.get('types')?.split(','),
                    userId: searchParams.get('filterUserId'),
                    startDate: searchParams.get('startDate'),
                    endDate: searchParams.get('endDate')
                });

                // Convert to proper ActivityType[] format for service
                const activityQuery = {
                    ...rawQuery,
                    types: validateActivityTypes(rawQuery.types)
                };

                const activityData = await workspaceService.getWorkspaceActivity(workspaceId, activityQuery);

                return NextResponse.json({
                    success: true,
                    data: activityData.activities,
                    total: activityData.total,
                    pagination: {
                        limit: activityQuery.limit,
                        offset: activityQuery.offset,
                        hasMore: activityData.total > activityQuery.offset + activityQuery.limit
                    },
                    timestamp: new Date().toISOString()
                });

            case 'analytics':
                if (!workspaceId) {
                    return NextResponse.json({
                        success: false,
                        error: 'workspaceId parameter is required for analytics',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                const analyticsQuery = AnalyticsQuerySchema.parse({
                    timeRange: searchParams.get('timeRange') as any
                });

                const analytics = await workspaceService.generateWorkspaceAnalytics(workspaceId, analyticsQuery.timeRange);

                return NextResponse.json({
                    success: true,
                    data: analytics,
                    timestamp: new Date().toISOString()
                });

            case 'stats':
                if (!workspaceId) {
                    return NextResponse.json({
                        success: false,
                        error: 'workspaceId parameter is required for stats',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                const stats = await workspaceService.getWorkspaceStats(workspaceId);
                if (!stats) {
                    return NextResponse.json({
                        success: false,
                        error: 'Workspace not found',
                        timestamp: new Date().toISOString()
                    }, { status: 404 });
                }

                return NextResponse.json({
                    success: true,
                    data: stats,
                    timestamp: new Date().toISOString()
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: `Unknown action: ${action}`,
                    timestamp: new Date().toISOString()
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Team Workspaces API Error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process request',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

/**
 * Handle workspace updates
 * PUT /api/collaboration/workspaces
 */
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'update';
        const workspaceId = searchParams.get('workspaceId');
        const userId = searchParams.get('userId');

        if (!workspaceId) {
            return NextResponse.json({
                success: false,
                error: 'workspaceId parameter is required',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        const body = await request.json();
        console.log('Team Workspaces API: PUT request with action:', action);

        switch (action) {
            case 'update':
                if (!userId) {
                    return NextResponse.json({
                        success: false,
                        error: 'userId parameter is required for workspace updates',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                const updateData = UpdateWorkspaceSchema.parse(body);
                const updatedWorkspace = await workspaceService.updateWorkspaceSettings(workspaceId, userId, updateData.settings as Partial<WorkspaceSettings> || {});

                return NextResponse.json({
                    success: true,
                    message: 'Workspace updated successfully',
                    data: updatedWorkspace,
                    timestamp: new Date().toISOString()
                });

            case 'add-member':
                const memberData = AddMemberSchema.parse(body);
                const newMember = await workspaceService.addMember(
                    workspaceId,
                    memberData.userId,
                    memberData.invitedBy,
                    memberData.role,
                    memberData.permissions as Permission[]
                );

                return NextResponse.json({
                    success: true,
                    message: 'Member added successfully',
                    data: newMember,
                    timestamp: new Date().toISOString()
                });

            case 'update-member':
                const targetUserId = searchParams.get('targetUserId');
                if (!targetUserId) {
                    return NextResponse.json({
                        success: false,
                        error: 'targetUserId parameter is required for member updates',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                const memberUpdateData = UpdateMemberSchema.parse(body);
                const updatedMember = await workspaceService.updateMember(
                    workspaceId,
                    targetUserId,
                    memberUpdateData.updatedBy,
                    {
                        role: memberUpdateData.role,
                        permissions: memberUpdateData.permissions as Permission[],
                        status: memberUpdateData.status
                    }
                );

                return NextResponse.json({
                    success: true,
                    message: 'Member updated successfully',
                    data: updatedMember,
                    timestamp: new Date().toISOString()
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: `Unknown action: ${action}`,
                    timestamp: new Date().toISOString()
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Team Workspaces API Error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update workspace',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

/**
 * Handle workspace and member deletion
 * DELETE /api/collaboration/workspaces
 */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'delete';
        const workspaceId = searchParams.get('workspaceId');

        if (!workspaceId) {
            return NextResponse.json({
                success: false,
                error: 'workspaceId parameter is required',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        console.log('Team Workspaces API: DELETE request with action:', action);

        switch (action) {
            case 'remove-member':
                const targetUserId = searchParams.get('targetUserId');
                const removedBy = searchParams.get('removedBy');

                if (!targetUserId || !removedBy) {
                    return NextResponse.json({
                        success: false,
                        error: 'targetUserId and removedBy parameters are required',
                        timestamp: new Date().toISOString()
                    }, { status: 400 });
                }

                await workspaceService.removeMember(workspaceId, targetUserId, removedBy);

                return NextResponse.json({
                    success: true,
                    message: 'Member removed successfully',
                    timestamp: new Date().toISOString()
                });

            case 'delete':
            default:
                // For now, workspace deletion is not implemented for safety
                return NextResponse.json({
                    success: false,
                    error: 'Workspace deletion is not currently supported',
                    timestamp: new Date().toISOString()
                }, { status: 501 });
        }

    } catch (error) {
        console.error('Team Workspaces API Error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete resource',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

/**
 * Handle permission checks
 * OPTIONS /api/collaboration/workspaces
 */
export async function OPTIONS(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspaceId');
        const userId = searchParams.get('userId');
        const permission = searchParams.get('permission');

        if (!workspaceId || !userId || !permission) {
            return NextResponse.json({
                success: false,
                error: 'workspaceId, userId, and permission parameters are required',
                timestamp: new Date().toISOString()
            }, { status: 400 });
        }

        const hasPermission = await workspaceService.checkPermission(workspaceId, userId, permission as Permission);

        return NextResponse.json({
            success: true,
            data: {
                hasPermission,
                workspaceId,
                userId,
                permission
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Team Workspaces Permission Check Error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to check permission',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
