/**
 * Real-time Collaborative Editing WebSocket API
 * Handles WebSocket connections for real-time collaborative editing
 * Supports operational transforms, presence management, and conflict resolution
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CollaborativeEditingService, EditOperation, CursorPosition, TextSelection, CollaborativeUser } from '../../../../services/collaboration/CollaborativeEditingService';

// Validation schemas for collaborative editing requests
const StartSessionSchema = z.object({
  action: z.literal('start-session'),
  memoryId: z.string(),
  userId: z.string(),
  userData: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    avatar: z.string().optional()
  }).optional()
});

const EndSessionSchema = z.object({
  action: z.literal('end-session'),
  memoryId: z.string(),
  userId: z.string()
});

const ApplyOperationSchema = z.object({
  action: z.literal('apply-operation'),
  memoryId: z.string(),
  operation: z.object({
    id: z.string(),
    type: z.enum(['insert', 'delete', 'replace']),
    position: z.number(),
    content: z.string(),
    length: z.number(),
    userId: z.string(),
    timestamp: z.string(),
    memoryId: z.string()
  })
});

const UpdatePresenceSchema = z.object({
  action: z.literal('update-presence'),
  memoryId: z.string(),
  userId: z.string(),
  cursor: z.object({
    line: z.number(),
    column: z.number(),
    position: z.number()
  }).optional(),
  selection: z.object({
    start: z.object({
      line: z.number(),
      column: z.number(),
      position: z.number()
    }),
    end: z.object({
      line: z.number(),
      column: z.number(),
      position: z.number()
    }),
    text: z.string()
  }).optional()
});

const LockMemorySchema = z.object({
  action: z.literal('lock-memory'),
  memoryId: z.string(),
  userId: z.string(),
  lockType: z.enum(['soft-lock', 'hard-lock']).optional()
});

const UnlockMemorySchema = z.object({
  action: z.literal('unlock-memory'),
  memoryId: z.string(),
  userId: z.string()
});

const RollbackVersionSchema = z.object({
  action: z.literal('rollback-version'),
  memoryId: z.string(),
  userId: z.string(),
  targetVersion: z.number()
});

const CollaborativeRequestSchema = z.union([
  StartSessionSchema,
  EndSessionSchema,
  ApplyOperationSchema,
  UpdatePresenceSchema,
  LockMemorySchema,
  UnlockMemorySchema,
  RollbackVersionSchema
]);

/**
 * HTTP-based Collaborative Editing Service
 * Provides collaborative editing functionality compatible with Next.js
 */
class HTTPCollaborativeEditingService {
  private static instance: HTTPCollaborativeEditingService;
  private collaborativeService: CollaborativeEditingService;
  private connections: Map<string, Set<string>> = new Map(); // memoryId -> userIds

  constructor() {
    this.collaborativeService = CollaborativeEditingService.getInstance();
    this.setupEventListeners();
  }

  static getInstance(): HTTPCollaborativeEditingService {
    if (!HTTPCollaborativeEditingService.instance) {
      HTTPCollaborativeEditingService.instance = new HTTPCollaborativeEditingService();
    }
    return HTTPCollaborativeEditingService.instance;
  }

  private setupEventListeners(): void {
    // Listen to collaborative editing events and broadcast to clients
    this.collaborativeService.on('user-joined', (data) => {
      this.broadcastToMemoryUsers(data.memoryId, {
        type: 'user-joined',
        data: {
          user: data.user,
          session: data.session
        }
      });
    });

    this.collaborativeService.on('user-left', (data) => {
      this.broadcastToMemoryUsers(data.memoryId, {
        type: 'user-left',
        data: {
          userId: data.userId,
          session: data.session
        }
      });
    });

    this.collaborativeService.on('content-changed', (data) => {
      this.broadcastToMemoryUsers(data.memoryId, {
        type: 'content-changed',
        data: {
          session: data.session,
          operations: data.operations
        }
      });
    });

    this.collaborativeService.on('presence-updated', (data) => {
      this.broadcastToMemoryUsers(data.memoryId, {
        type: 'presence-updated',
        data: {
          userId: data.userId,
          cursor: data.cursor,
          selection: data.selection
        }
      });
    });

    this.collaborativeService.on('memory-locked', (data) => {
      this.broadcastToMemoryUsers(data.memoryId, {
        type: 'memory-locked',
        data: {
          userId: data.userId,
          lockType: data.lockType
        }
      });
    });

    this.collaborativeService.on('memory-unlocked', (data) => {
      this.broadcastToMemoryUsers(data.memoryId, {
        type: 'memory-unlocked',
        data: {
          userId: data.userId
        }
      });
    });

    this.collaborativeService.on('version-rollback', (data) => {
      this.broadcastToMemoryUsers(data.memoryId, {
        type: 'version-rollback',
        data: {
          targetVersion: data.targetVersion,
          userId: data.userId,
          session: data.session
        }
      });
    });
  }

  private broadcastToMemoryUsers(memoryId: string, message: any): void {
    // In a real WebSocket implementation, this would broadcast to connected clients
    // For HTTP-based implementation, we'll store messages for polling
    console.log(`Broadcasting to memory ${memoryId}:`, message);
  }

  async startSession(memoryId: string, userId: string, userData?: Partial<CollaborativeUser>) {
    const session = await this.collaborativeService.startSession(memoryId, userId, userData || {});

    // Track connection
    if (!this.connections.has(memoryId)) {
      this.connections.set(memoryId, new Set());
    }
    this.connections.get(memoryId)!.add(userId);

    return session;
  }

  async endSession(memoryId: string, userId: string) {
    await this.collaborativeService.endSession(memoryId, userId);

    // Remove connection tracking
    const users = this.connections.get(memoryId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        this.connections.delete(memoryId);
      }
    }
  }

  async applyOperation(memoryId: string, operation: EditOperation) {
    return await this.collaborativeService.applyOperation(memoryId, operation);
  }

  async updatePresence(memoryId: string, userId: string, cursor?: CursorPosition, selection?: TextSelection) {
    return await this.collaborativeService.updateUserPresence(memoryId, userId, cursor, selection);
  }

  async lockMemory(memoryId: string, userId: string, lockType: 'soft-lock' | 'hard-lock' = 'soft-lock') {
    return await this.collaborativeService.lockMemory(memoryId, userId, lockType);
  }

  async unlockMemory(memoryId: string, userId: string) {
    return await this.collaborativeService.unlockMemory(memoryId, userId);
  }

  async rollbackVersion(memoryId: string, targetVersion: number, userId: string) {
    return await this.collaborativeService.rollbackToVersion(memoryId, targetVersion, userId);
  }

  getSession(memoryId: string) {
    return this.collaborativeService.getSession(memoryId);
  }

  getActiveSessions() {
    return this.collaborativeService.getActiveSessions();
  }

  getVersionHistory(memoryId: string) {
    return this.collaborativeService.getVersionHistory(memoryId);
  }

  getConnectionStatus() {
    return {
      activeConnections: this.connections.size,
      totalUsers: Array.from(this.connections.values()).reduce((total, users) => total + users.size, 0),
      memoriesWithCollaborators: Array.from(this.connections.entries()).map(([memoryId, users]) => ({
        memoryId,
        userCount: users.size,
        users: Array.from(users)
      }))
    };
  }

  generateSampleData() {
    return this.collaborativeService.generateSampleSessions();
  }
}

// GET endpoint - Session status and data retrieval
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const memoryId = searchParams.get('memoryId');
    const userId = searchParams.get('userId');

    const service = HTTPCollaborativeEditingService.getInstance();

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          status: service.getConnectionStatus(),
          activeSessions: service.getActiveSessions().length,
          timestamp: new Date().toISOString()
        });

      case 'get-session':
        if (!memoryId) {
          return NextResponse.json(
            { success: false, error: 'Memory ID required' },
            { status: 400 }
          );
        }

        const session = service.getSession(memoryId);
        return NextResponse.json({
          success: true,
          session,
          timestamp: new Date().toISOString()
        });

      case 'get-active-sessions':
        return NextResponse.json({
          success: true,
          sessions: service.getActiveSessions(),
          timestamp: new Date().toISOString()
        });

      case 'get-version-history':
        if (!memoryId) {
          return NextResponse.json(
            { success: false, error: 'Memory ID required' },
            { status: 400 }
          );
        }

        const history = await service.getVersionHistory(memoryId);
        return NextResponse.json({
          success: true,
          memoryId,
          versionHistory: history,
          timestamp: new Date().toISOString()
        });

      case 'generate-sample-data':
        const sampleData = service.generateSampleData();
        return NextResponse.json({
          success: true,
          message: 'Sample collaborative sessions generated',
          sessions: sampleData,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Collaborative Editing GET API Error:', error);
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

// POST endpoint - Collaborative editing actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CollaborativeRequestSchema.parse(body);

    const service = HTTPCollaborativeEditingService.getInstance();

    switch (validatedData.action) {
      case 'start-session':
        const session = await service.startSession(
          validatedData.memoryId,
          validatedData.userId,
          validatedData.userData
        );
        return NextResponse.json({
          success: true,
          message: 'Collaborative session started',
          session,
          timestamp: new Date().toISOString()
        });

      case 'end-session':
        await service.endSession(validatedData.memoryId, validatedData.userId);
        return NextResponse.json({
          success: true,
          message: 'Collaborative session ended',
          memoryId: validatedData.memoryId,
          userId: validatedData.userId,
          timestamp: new Date().toISOString()
        });

      case 'apply-operation':
        const updatedSession = await service.applyOperation(
          validatedData.memoryId,
          validatedData.operation
        );
        return NextResponse.json({
          success: true,
          message: 'Operation applied successfully',
          session: updatedSession,
          timestamp: new Date().toISOString()
        });

      case 'update-presence':
        await service.updatePresence(
          validatedData.memoryId,
          validatedData.userId,
          validatedData.cursor,
          validatedData.selection
        );
        return NextResponse.json({
          success: true,
          message: 'User presence updated',
          memoryId: validatedData.memoryId,
          userId: validatedData.userId,
          timestamp: new Date().toISOString()
        });

      case 'lock-memory':
        const lockSuccess = await service.lockMemory(
          validatedData.memoryId,
          validatedData.userId,
          validatedData.lockType
        );
        return NextResponse.json({
          success: lockSuccess,
          message: lockSuccess ? 'Memory locked successfully' : 'Failed to lock memory',
          memoryId: validatedData.memoryId,
          userId: validatedData.userId,
          lockType: validatedData.lockType,
          timestamp: new Date().toISOString()
        });

      case 'unlock-memory':
        const unlockSuccess = await service.unlockMemory(
          validatedData.memoryId,
          validatedData.userId
        );
        return NextResponse.json({
          success: unlockSuccess,
          message: unlockSuccess ? 'Memory unlocked successfully' : 'Failed to unlock memory',
          memoryId: validatedData.memoryId,
          userId: validatedData.userId,
          timestamp: new Date().toISOString()
        });

      case 'rollback-version':
        const rolledBackSession = await service.rollbackVersion(
          validatedData.memoryId,
          validatedData.targetVersion,
          validatedData.userId
        );
        return NextResponse.json({
          success: true,
          message: 'Version rollback successful',
          session: rolledBackSession,
          targetVersion: validatedData.targetVersion,
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
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('Collaborative Editing POST API Error:', error);
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

// DELETE endpoint - Clean up sessions and data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const memoryId = searchParams.get('memoryId');
    const userId = searchParams.get('userId');

    const service = HTTPCollaborativeEditingService.getInstance();

    switch (action) {
      case 'end-session':
        if (!memoryId || !userId) {
          return NextResponse.json(
            { success: false, error: 'Memory ID and User ID required' },
            { status: 400 }
          );
        }

        await service.endSession(memoryId, userId);
        return NextResponse.json({
          success: true,
          message: 'Session ended successfully',
          memoryId,
          userId,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Collaborative Editing DELETE API Error:', error);
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
