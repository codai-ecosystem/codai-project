/**
 * Collaborative Memory Service
 * Handles multi-user memory sharing, collaboration, and team-based access controls
 * 
 * Features:
 * - Multi-user memory sharing with granular permissions
 * - Memory collaboration with real-time updates
 * - Team-based access controls and role management
 * - Memory ownership and sharing management
 * - Collaborative editing conflict resolution
 * - Activity tracking and audit logging
 */

import { v4 as uuidv4 } from 'uuid';

// Types for collaborative memory management
export interface CollaborativeMemory {
  id: string;
  agentId: string;
  content: string;
  metadata: {
    entityType?: string;
    priority?: string;
    tags?: string[];
    project?: string;
    session?: string;
    [key: string]: any;
  };
  collaborationInfo: {
    ownerId: string;
    teamId?: string;
    isShared: boolean;
    permissions: MemoryPermissions;
    shareSettings: ShareSettings;
    collaborators: Collaborator[];
    lastModifiedBy: string;
    lastModifiedAt: Date;
    version: number;
    conflictResolution: ConflictResolutionStrategy;
  };
  activityLog: MemoryActivity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryPermissions {
  read: string[]; // User IDs with read access
  write: string[]; // User IDs with write access
  admin: string[]; // User IDs with admin access (can modify permissions)
  public: boolean; // Whether memory is publicly readable
  teamAccess: TeamAccessLevel;
}

export type TeamAccessLevel = 'none' | 'read' | 'write' | 'admin';

export interface ShareSettings {
  allowPublicRead: boolean;
  allowTeamEdit: boolean;
  requireApproval: boolean;
  expirationDate?: Date;
  maxCollaborators?: number;
  allowForkingCloning: boolean;
}

export interface Collaborator {
  userId: string;
  role: CollaboratorRole;
  joinedAt: Date;
  lastActiveAt: Date;
  permissions: string[]; // Specific permissions
  invitedBy: string;
  status: CollaboratorStatus;
}

export type CollaboratorRole = 'viewer' | 'editor' | 'admin' | 'owner';
export type CollaboratorStatus = 'active' | 'pending' | 'suspended' | 'left';

export interface MemoryActivity {
  id: string;
  userId: string;
  action: MemoryActionType;
  details: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type MemoryActionType =
  | 'created' | 'updated' | 'deleted' | 'shared' | 'unshared'
  | 'collaborated' | 'forked' | 'merged' | 'commented' | 'tagged'
  | 'permission_changed' | 'team_added' | 'team_removed';

export type ConflictResolutionStrategy =
  | 'last_writer_wins' | 'merge_changes' | 'require_manual_resolution' | 'version_control';

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: TeamMember[];
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: string;
  role: TeamRole;
  permissions: TeamPermissions;
  joinedAt: Date;
  invitedBy: string;
  status: 'active' | 'pending' | 'suspended';
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamPermissions {
  canCreateMemories: boolean;
  canEditTeamMemories: boolean;
  canDeleteMemories: boolean;
  canInviteMembers: boolean;
  canManagePermissions: boolean;
  canViewAnalytics: boolean;
}

export interface TeamSettings {
  defaultMemoryPermissions: MemoryPermissions;
  requireApprovalForSharing: boolean;
  allowExternalCollaboration: boolean;
  retentionPolicy?: {
    deleteAfterDays?: number;
    archiveAfterDays?: number;
  };
}

export interface CollaborationRequest {
  id: string;
  memoryId: string;
  fromUserId: string;
  toUserId: string;
  requestedRole: CollaboratorRole;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: Date;
  respondedAt?: Date;
  expiresAt: Date;
}

export interface MemoryConflict {
  id: string;
  memoryId: string;
  conflictType: ConflictType;
  originalVersion: number;
  conflictingVersions: ConflictingVersion[];
  resolution?: ConflictResolution;
  status: 'active' | 'resolved' | 'escalated';
  createdAt: Date;
  resolvedAt?: Date;
}

export type ConflictType = 'concurrent_edit' | 'permission_conflict' | 'version_mismatch' | 'merge_conflict';

export interface ConflictingVersion {
  version: number;
  userId: string;
  changes: any;
  timestamp: Date;
}

export interface ConflictResolution {
  strategy: ConflictResolutionStrategy;
  resolvedBy: string;
  mergedContent?: string;
  resolutionNotes?: string;
  timestamp: Date;
}

/**
 * Collaborative Memory Service
 * Main service for handling multi-user memory collaboration
 */
export class CollaborativeMemoryService {
  private memories: Map<string, CollaborativeMemory> = new Map();
  private teams: Map<string, Team> = new Map();
  private collaborationRequests: Map<string, CollaborationRequest> = new Map();
  private conflicts: Map<string, MemoryConflict> = new Map();
  private activityLog: MemoryActivity[] = [];

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  // ================================
  // MEMORY COLLABORATION METHODS
  // ================================

  /**
   * Create a new collaborative memory
   */
  async createCollaborativeMemory(
    agentId: string,
    content: string,
    metadata: any = {},
    ownerId: string,
    teamId?: string
  ): Promise<CollaborativeMemory> {
    const memoryId = uuidv4();
    const now = new Date();

    const memory: CollaborativeMemory = {
      id: memoryId,
      agentId,
      content,
      metadata,
      collaborationInfo: {
        ownerId,
        teamId,
        isShared: false,
        permissions: {
          read: [ownerId],
          write: [ownerId],
          admin: [ownerId],
          public: false,
          teamAccess: teamId ? 'read' : 'none'
        },
        shareSettings: {
          allowPublicRead: false,
          allowTeamEdit: false,
          requireApproval: true,
          allowForkingCloning: true
        },
        collaborators: [{
          userId: ownerId,
          role: 'owner',
          joinedAt: now,
          lastActiveAt: now,
          permissions: ['read', 'write', 'admin', 'delete'],
          invitedBy: ownerId,
          status: 'active'
        }],
        lastModifiedBy: ownerId,
        lastModifiedAt: now,
        version: 1,
        conflictResolution: 'last_writer_wins'
      },
      activityLog: [{
        id: uuidv4(),
        userId: ownerId,
        action: 'created',
        details: { content: content.substring(0, 100) },
        timestamp: now
      }],
      createdAt: now,
      updatedAt: now
    };

    this.memories.set(memoryId, memory);
    return memory;
  }

  /**
   * Get collaborative memory with access control
   */
  async getCollaborativeMemory(memoryId: string, userId: string): Promise<CollaborativeMemory | null> {
    const memory = this.memories.get(memoryId);
    if (!memory) return null;

    // Check access permissions
    if (!this.hasReadAccess(memory, userId)) {
      throw new Error('Access denied: Insufficient permissions to read this memory');
    }

    // Log access activity
    this.logActivity(memoryId, userId, 'accessed', {});

    return memory;
  }

  /**
   * Update collaborative memory with conflict detection
   */
  async updateCollaborativeMemory(
    memoryId: string,
    userId: string,
    content: string,
    metadata?: any,
    expectedVersion?: number
  ): Promise<CollaborativeMemory> {
    const memory = this.memories.get(memoryId);
    if (!memory) throw new Error('Memory not found');

    // Check write permissions
    if (!this.hasWriteAccess(memory, userId)) {
      throw new Error('Access denied: Insufficient permissions to edit this memory');
    }

    // Version conflict detection
    if (expectedVersion && memory.collaborationInfo.version !== expectedVersion) {
      await this.handleVersionConflict(memoryId, userId, content, expectedVersion);
      return memory; // Return original until conflict is resolved
    }

    // Update memory
    const now = new Date();
    memory.content = content;
    if (metadata) {
      memory.metadata = { ...memory.metadata, ...metadata };
    }
    memory.collaborationInfo.lastModifiedBy = userId;
    memory.collaborationInfo.lastModifiedAt = now;
    memory.collaborationInfo.version += 1;
    memory.updatedAt = now;

    // Log update activity
    memory.activityLog.push({
      id: uuidv4(),
      userId,
      action: 'updated',
      details: {
        previousVersion: memory.collaborationInfo.version - 1,
        changes: { content: content.substring(0, 100) }
      },
      timestamp: now
    });

    this.memories.set(memoryId, memory);
    return memory;
  }

  /**
   * Share memory with other users or teams
   */
  async shareMemory(
    memoryId: string,
    ownerId: string,
    shareWith: {
      userIds?: string[];
      teamIds?: string[];
      permissions: Partial<MemoryPermissions>;
      role?: CollaboratorRole;
    }
  ): Promise<CollaborativeMemory> {
    const memory = this.memories.get(memoryId);
    if (!memory) throw new Error('Memory not found');

    // Check admin permissions
    if (!this.hasAdminAccess(memory, ownerId)) {
      throw new Error('Access denied: Only admins can share memories');
    }

    const now = new Date();

    // Add individual users
    if (shareWith.userIds) {
      for (const userId of shareWith.userIds) {
        if (shareWith.permissions.read) {
          memory.collaborationInfo.permissions.read.push(userId);
        }
        if (shareWith.permissions.write) {
          memory.collaborationInfo.permissions.write.push(userId);
        }
        if (shareWith.permissions.admin) {
          memory.collaborationInfo.permissions.admin.push(userId);
        }

        // Add as collaborator
        memory.collaborationInfo.collaborators.push({
          userId,
          role: shareWith.role || 'viewer',
          joinedAt: now,
          lastActiveAt: now,
          permissions: this.getRolePermissions(shareWith.role || 'viewer'),
          invitedBy: ownerId,
          status: 'active'
        });
      }
    }

    // Add team access
    if (shareWith.teamIds) {
      // Implementation for team sharing
      memory.collaborationInfo.teamId = shareWith.teamIds[0]; // Simplified
    }

    memory.collaborationInfo.isShared = true;
    memory.collaborationInfo.lastModifiedAt = now;
    memory.updatedAt = now;

    // Log sharing activity
    memory.activityLog.push({
      id: uuidv4(),
      userId: ownerId,
      action: 'shared',
      details: {
        sharedWith: shareWith.userIds || shareWith.teamIds,
        permissions: shareWith.permissions
      },
      timestamp: now
    });

    this.memories.set(memoryId, memory);
    return memory;
  }

  /**
   * Request collaboration on a memory
   */
  async requestCollaboration(
    memoryId: string,
    fromUserId: string,
    toUserId: string,
    requestedRole: CollaboratorRole,
    message?: string
  ): Promise<CollaborationRequest> {
    const memory = this.memories.get(memoryId);
    if (!memory) throw new Error('Memory not found');

    const requestId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const request: CollaborationRequest = {
      id: requestId,
      memoryId,
      fromUserId,
      toUserId,
      requestedRole,
      message,
      status: 'pending',
      createdAt: now,
      expiresAt
    };

    this.collaborationRequests.set(requestId, request);

    // Log collaboration request
    memory.activityLog.push({
      id: uuidv4(),
      userId: fromUserId,
      action: 'collaboration_requested',
      details: {
        toUserId,
        requestedRole,
        requestId
      },
      timestamp: now
    });

    return request;
  }

  /**
   * Respond to collaboration request
   */
  async respondToCollaborationRequest(
    requestId: string,
    toUserId: string,
    response: 'approved' | 'rejected'
  ): Promise<CollaborationRequest> {
    const request = this.collaborationRequests.get(requestId);
    if (!request) throw new Error('Collaboration request not found');

    if (request.toUserId !== toUserId) {
      throw new Error('Access denied: You can only respond to requests sent to you');
    }

    const now = new Date();
    request.status = response;
    request.respondedAt = now;

    if (response === 'approved') {
      // Add user as collaborator
      await this.addCollaboratorToMemory(request.memoryId, request.fromUserId, request.requestedRole, toUserId);
    }

    this.collaborationRequests.set(requestId, request);
    return request;
  }

  // ================================
  // TEAM MANAGEMENT METHODS
  // ================================

  /**
   * Create a new team
   */
  async createTeam(name: string, ownerId: string, description?: string): Promise<Team> {
    const teamId = uuidv4();
    const now = new Date();

    const team: Team = {
      id: teamId,
      name,
      description,
      ownerId,
      members: [{
        userId: ownerId,
        role: 'owner',
        permissions: {
          canCreateMemories: true,
          canEditTeamMemories: true,
          canDeleteMemories: true,
          canInviteMembers: true,
          canManagePermissions: true,
          canViewAnalytics: true
        },
        joinedAt: now,
        invitedBy: ownerId,
        status: 'active'
      }],
      settings: {
        defaultMemoryPermissions: {
          read: [],
          write: [],
          admin: [],
          public: false,
          teamAccess: 'read'
        },
        requireApprovalForSharing: true,
        allowExternalCollaboration: false
      },
      createdAt: now,
      updatedAt: now
    };

    this.teams.set(teamId, team);
    return team;
  }

  /**
   * Add member to team
   */
  async addTeamMember(
    teamId: string,
    inviterUserId: string,
    newMemberUserId: string,
    role: TeamRole = 'member'
  ): Promise<Team> {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');

    // Check invitation permissions
    const inviter = team.members.find(m => m.userId === inviterUserId);
    if (!inviter || !inviter.permissions.canInviteMembers) {
      throw new Error('Access denied: Insufficient permissions to invite members');
    }

    const now = new Date();
    const newMember: TeamMember = {
      userId: newMemberUserId,
      role,
      permissions: this.getTeamRolePermissions(role),
      joinedAt: now,
      invitedBy: inviterUserId,
      status: 'active'
    };

    team.members.push(newMember);
    team.updatedAt = now;

    this.teams.set(teamId, team);
    return team;
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string, requesterId: string): Promise<TeamMember[]> {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');

    // Check if requester is team member
    const member = team.members.find(m => m.userId === requesterId);
    if (!member) throw new Error('Access denied: You are not a member of this team');

    return team.members;
  }

  // ================================
  // ACCESS CONTROL METHODS
  // ================================

  private hasReadAccess(memory: CollaborativeMemory, userId: string): boolean {
    const permissions = memory.collaborationInfo.permissions;

    // Public read access
    if (permissions.public) return true;

    // Explicit read permission
    if (permissions.read.includes(userId)) return true;

    // Write or admin permissions include read
    if (permissions.write.includes(userId) || permissions.admin.includes(userId)) return true;

    // Team access
    if (memory.collaborationInfo.teamId && permissions.teamAccess !== 'none') {
      const team = this.teams.get(memory.collaborationInfo.teamId);
      if (team?.members.some(m => m.userId === userId && m.status === 'active')) {
        return true;
      }
    }

    return false;
  }

  private hasWriteAccess(memory: CollaborativeMemory, userId: string): boolean {
    const permissions = memory.collaborationInfo.permissions;

    // Explicit write permission
    if (permissions.write.includes(userId)) return true;

    // Admin permissions include write
    if (permissions.admin.includes(userId)) return true;

    // Team write access
    if (memory.collaborationInfo.teamId && permissions.teamAccess === 'write') {
      const team = this.teams.get(memory.collaborationInfo.teamId);
      if (team?.members.some(m => m.userId === userId && m.status === 'active' && m.permissions.canEditTeamMemories)) {
        return true;
      }
    }

    return false;
  }

  private hasAdminAccess(memory: CollaborativeMemory, userId: string): boolean {
    const permissions = memory.collaborationInfo.permissions;
    return permissions.admin.includes(userId);
  }

  private getRolePermissions(role: CollaboratorRole): string[] {
    switch (role) {
      case 'owner':
        return ['read', 'write', 'admin', 'delete', 'share'];
      case 'admin':
        return ['read', 'write', 'admin', 'share'];
      case 'editor':
        return ['read', 'write'];
      case 'viewer':
        return ['read'];
      default:
        return ['read'];
    }
  }

  private getTeamRolePermissions(role: TeamRole): TeamPermissions {
    switch (role) {
      case 'owner':
        return {
          canCreateMemories: true,
          canEditTeamMemories: true,
          canDeleteMemories: true,
          canInviteMembers: true,
          canManagePermissions: true,
          canViewAnalytics: true
        };
      case 'admin':
        return {
          canCreateMemories: true,
          canEditTeamMemories: true,
          canDeleteMemories: true,
          canInviteMembers: true,
          canManagePermissions: false,
          canViewAnalytics: true
        };
      case 'member':
        return {
          canCreateMemories: true,
          canEditTeamMemories: true,
          canDeleteMemories: false,
          canInviteMembers: false,
          canManagePermissions: false,
          canViewAnalytics: false
        };
      case 'viewer':
        return {
          canCreateMemories: false,
          canEditTeamMemories: false,
          canDeleteMemories: false,
          canInviteMembers: false,
          canManagePermissions: false,
          canViewAnalytics: false
        };
      default:
        return {
          canCreateMemories: false,
          canEditTeamMemories: false,
          canDeleteMemories: false,
          canInviteMembers: false,
          canManagePermissions: false,
          canViewAnalytics: false
        };
    }
  }

  // ================================
  // CONFLICT RESOLUTION METHODS
  // ================================

  private async handleVersionConflict(
    memoryId: string,
    userId: string,
    newContent: string,
    expectedVersion: number
  ): Promise<void> {
    const memory = this.memories.get(memoryId);
    if (!memory) return;

    const conflictId = uuidv4();
    const now = new Date();

    const conflict: MemoryConflict = {
      id: conflictId,
      memoryId,
      conflictType: 'version_mismatch',
      originalVersion: expectedVersion,
      conflictingVersions: [{
        version: memory.collaborationInfo.version,
        userId: memory.collaborationInfo.lastModifiedBy,
        changes: { content: memory.content },
        timestamp: memory.collaborationInfo.lastModifiedAt
      }, {
        version: expectedVersion + 1,
        userId,
        changes: { content: newContent },
        timestamp: now
      }],
      status: 'active',
      createdAt: now
    };

    this.conflicts.set(conflictId, conflict);

    // Log conflict
    memory.activityLog.push({
      id: uuidv4(),
      userId,
      action: 'conflict_detected',
      details: {
        conflictId,
        conflictType: 'version_mismatch',
        expectedVersion,
        actualVersion: memory.collaborationInfo.version
      },
      timestamp: now
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  private async addCollaboratorToMemory(
    memoryId: string,
    userId: string,
    role: CollaboratorRole,
    invitedBy: string
  ): Promise<void> {
    const memory = this.memories.get(memoryId);
    if (!memory) return;

    const now = new Date();
    const collaborator: Collaborator = {
      userId,
      role,
      joinedAt: now,
      lastActiveAt: now,
      permissions: this.getRolePermissions(role),
      invitedBy,
      status: 'active'
    };

    memory.collaborationInfo.collaborators.push(collaborator);

    // Add to permissions
    const permissions = this.getRolePermissions(role);
    if (permissions.includes('read')) {
      memory.collaborationInfo.permissions.read.push(userId);
    }
    if (permissions.includes('write')) {
      memory.collaborationInfo.permissions.write.push(userId);
    }
    if (permissions.includes('admin')) {
      memory.collaborationInfo.permissions.admin.push(userId);
    }

    memory.collaborationInfo.isShared = true;
    memory.updatedAt = now;
  }

  private logActivity(memoryId: string, userId: string, action: MemoryActionType, details: any): void {
    const activity: MemoryActivity = {
      id: uuidv4(),
      userId,
      action,
      details,
      timestamp: new Date()
    };

    const memory = this.memories.get(memoryId);
    if (memory) {
      memory.activityLog.push(activity);
    }

    this.activityLog.push(activity);
  }

  // ================================
  // ANALYTICS AND REPORTING
  // ================================

  /**
   * Get collaboration analytics
   */
  async getCollaborationAnalytics(teamId?: string, userId?: string): Promise<any> {
    const memories = Array.from(this.memories.values());

    let filteredMemories = memories;
    if (teamId) {
      filteredMemories = memories.filter(m => m.collaborationInfo.teamId === teamId);
    } else if (userId) {
      filteredMemories = memories.filter(m =>
        m.collaborationInfo.permissions.read.includes(userId) ||
        m.collaborationInfo.permissions.write.includes(userId) ||
        m.collaborationInfo.permissions.admin.includes(userId)
      );
    }

    return {
      totalMemories: filteredMemories.length,
      sharedMemories: filteredMemories.filter(m => m.collaborationInfo.isShared).length,
      totalCollaborators: new Set(
        filteredMemories.flatMap(m => m.collaborationInfo.collaborators.map(c => c.userId))
      ).size,
      activeCollaborations: this.collaborationRequests.size,
      recentActivity: this.activityLog
        .filter(a => a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000))
        .length,
      conflictsActive: Array.from(this.conflicts.values())
        .filter(c => c.status === 'active').length,
      teams: this.teams.size,
      averageCollaboratorsPerMemory: filteredMemories.reduce((sum, m) =>
        sum + m.collaborationInfo.collaborators.length, 0) / filteredMemories.length || 0
    };
  }

  /**
   * Get user's collaborative memories
   */
  async getUserCollaborativeMemories(userId: string): Promise<CollaborativeMemory[]> {
    return Array.from(this.memories.values()).filter(memory =>
      this.hasReadAccess(memory, userId)
    );
  }

  /**
   * Get team memories
   */
  async getTeamMemories(teamId: string, userId: string): Promise<CollaborativeMemory[]> {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');

    // Check team membership
    const member = team.members.find(m => m.userId === userId);
    if (!member) throw new Error('Access denied: You are not a member of this team');

    return Array.from(this.memories.values()).filter(memory =>
      memory.collaborationInfo.teamId === teamId
    );
  }

  // ================================
  // SAMPLE DATA INITIALIZATION
  // ================================

  private initializeSampleData(): void {
    // Create sample teams
    const team1: Team = {
      id: 'team-001',
      name: 'Development Team',
      description: 'Main development team for MemorAI project',
      ownerId: 'user-001',
      members: [
        {
          userId: 'user-001',
          role: 'owner',
          permissions: this.getTeamRolePermissions('owner'),
          joinedAt: new Date('2024-01-01'),
          invitedBy: 'user-001',
          status: 'active'
        },
        {
          userId: 'user-002',
          role: 'admin',
          permissions: this.getTeamRolePermissions('admin'),
          joinedAt: new Date('2024-01-02'),
          invitedBy: 'user-001',
          status: 'active'
        },
        {
          userId: 'user-003',
          role: 'member',
          permissions: this.getTeamRolePermissions('member'),
          joinedAt: new Date('2024-01-03'),
          invitedBy: 'user-001',
          status: 'active'
        }
      ],
      settings: {
        defaultMemoryPermissions: {
          read: [],
          write: [],
          admin: [],
          public: false,
          teamAccess: 'read'
        },
        requireApprovalForSharing: true,
        allowExternalCollaboration: true
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    this.teams.set(team1.id, team1);

    // Create sample collaborative memories
    const sampleMemories = [
      {
        content: 'Phase 6.4 Collaboration Features - Implementation strategy for multi-user memory sharing',
        ownerId: 'user-001',
        teamId: 'team-001',
        isShared: true
      },
      {
        content: 'Real-time collaboration architecture design - WebSocket implementation patterns',
        ownerId: 'user-002',
        teamId: 'team-001',
        isShared: true
      },
      {
        content: 'Team workspace permission management - Role-based access control system',
        ownerId: 'user-001',
        teamId: 'team-001',
        isShared: false
      }
    ];

    sampleMemories.forEach((sample, index) => {
      const memory = this.createSampleCollaborativeMemory(
        `memory-${index + 1}`,
        sample.content,
        sample.ownerId,
        sample.teamId,
        sample.isShared
      );
      this.memories.set(memory.id, memory);
    });
  }

  private createSampleCollaborativeMemory(
    id: string,
    content: string,
    ownerId: string,
    teamId: string,
    isShared: boolean
  ): CollaborativeMemory {
    const now = new Date();

    return {
      id,
      agentId: 'github-copilot',
      content,
      metadata: {
        entityType: 'collaborative_plan',
        priority: 'high',
        project: 'MemorAI',
        session: 'phase-6-4'
      },
      collaborationInfo: {
        ownerId,
        teamId,
        isShared,
        permissions: {
          read: [ownerId, 'user-002', 'user-003'],
          write: [ownerId, 'user-002'],
          admin: [ownerId],
          public: false,
          teamAccess: 'read'
        },
        shareSettings: {
          allowPublicRead: false,
          allowTeamEdit: true,
          requireApproval: false,
          allowForkingCloning: true
        },
        collaborators: [
          {
            userId: ownerId,
            role: 'owner',
            joinedAt: now,
            lastActiveAt: now,
            permissions: ['read', 'write', 'admin', 'delete'],
            invitedBy: ownerId,
            status: 'active'
          },
          {
            userId: 'user-002',
            role: 'editor',
            joinedAt: now,
            lastActiveAt: new Date(now.getTime() - 3600000),
            permissions: ['read', 'write'],
            invitedBy: ownerId,
            status: 'active'
          }
        ],
        lastModifiedBy: ownerId,
        lastModifiedAt: now,
        version: 1,
        conflictResolution: 'last_writer_wins'
      },
      activityLog: [
        {
          id: uuidv4(),
          userId: ownerId,
          action: 'created',
          details: { content: content.substring(0, 50) },
          timestamp: now
        },
        {
          id: uuidv4(),
          userId: ownerId,
          action: 'shared',
          details: { sharedWith: ['user-002'] },
          timestamp: new Date(now.getTime() - 1800000)
        }
      ],
      createdAt: now,
      updatedAt: now
    };
  }
}
