/**
 * Collaborative Editing Service
 * Manages real-time collaborative editing of memories with operational transforms
 * Handles conflict resolution, presence management, and change synchronization
 */

import { EventEmitter } from 'events';

// Types and interfaces for collaborative editing
export interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cursor?: CursorPosition;
  selection?: TextSelection;
  isActive: boolean;
  lastSeen: string;
  color: string; // Unique color for user identification
}

export interface CursorPosition {
  line: number;
  column: number;
  position: number; // Absolute position in text
}

export interface TextSelection {
  start: CursorPosition;
  end: CursorPosition;
  text: string;
}

export interface EditOperation {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  length: number;
  userId: string;
  timestamp: string;
  memoryId: string;
}

export interface CollaborativeMemory {
  id: string;
  content: string;
  title: string;
  agentId: string;
  activeUsers: CollaborativeUser[];
  operations: EditOperation[];
  version: number;
  lastModified: string;
  lockStatus: 'unlocked' | 'soft-lock' | 'hard-lock';
  lockedBy?: string;
}

export interface ConflictResolution {
  conflictId: string;
  operations: EditOperation[];
  resolution: 'auto-merge' | 'manual-required' | 'last-writer-wins';
  resolvedOperation: EditOperation;
  timestamp: string;
}

/**
 * Operational Transform Implementation
 * Provides conflict-free collaborative editing using operational transforms
 */
export class OperationalTransform {
  /**
   * Transform an operation against another operation
   * Ensures consistency when operations are applied in different orders
   */
  static transform(op1: EditOperation, op2: EditOperation): EditOperation[] {
    // Case 1: Both operations are inserts
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position <= op2.position) {
        // op1 comes before op2, adjust op2 position
        return [
          op1,
          { ...op2, position: op2.position + op1.content.length }
        ];
      } else {
        // op2 comes before op1, adjust op1 position
        return [
          { ...op1, position: op1.position + op2.content.length },
          op2
        ];
      }
    }

    // Case 2: Both operations are deletes
    if (op1.type === 'delete' && op2.type === 'delete') {
      if (op1.position + op1.length <= op2.position) {
        // op1 is completely before op2
        return [
          op1,
          { ...op2, position: op2.position - op1.length }
        ];
      } else if (op2.position + op2.length <= op1.position) {
        // op2 is completely before op1
        return [
          { ...op1, position: op1.position - op2.length },
          op2
        ];
      } else {
        // Operations overlap - merge or resolve conflict
        return this.resolveDeleteConflict(op1, op2);
      }
    }

    // Case 3: Insert vs Delete
    if (op1.type === 'insert' && op2.type === 'delete') {
      if (op1.position <= op2.position) {
        return [
          op1,
          { ...op2, position: op2.position + op1.content.length }
        ];
      } else if (op1.position >= op2.position + op2.length) {
        return [
          { ...op1, position: op1.position - op2.length },
          op2
        ];
      } else {
        // Insert position is within delete range
        return [op2]; // Delete takes precedence
      }
    }

    // Case 4: Delete vs Insert (reverse of case 3)
    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op2.position <= op1.position) {
        return [
          { ...op1, position: op1.position + op2.content.length },
          op2
        ];
      } else if (op2.position >= op1.position + op1.length) {
        return [
          op1,
          { ...op2, position: op2.position - op1.length }
        ];
      } else {
        // Insert position is within delete range
        return [op1]; // Delete takes precedence
      }
    }

    // Case 5: Replace operations
    if (op1.type === 'replace' || op2.type === 'replace') {
      return this.resolveReplaceConflict(op1, op2);
    }

    // Default: return operations as-is
    return [op1, op2];
  }

  /**
   * Resolve conflicts between overlapping delete operations
   */
  private static resolveDeleteConflict(op1: EditOperation, op2: EditOperation): EditOperation[] {
    const start1 = op1.position;
    const end1 = op1.position + op1.length;
    const start2 = op2.position;
    const end2 = op2.position + op2.length;

    const mergedStart = Math.min(start1, start2);
    const mergedEnd = Math.max(end1, end2);

    return [{
      ...op1,
      position: mergedStart,
      length: mergedEnd - mergedStart,
      id: `merged-${op1.id}-${op2.id}`,
      timestamp: new Date().toISOString()
    }];
  }

  /**
   * Resolve conflicts involving replace operations
   */
  private static resolveReplaceConflict(op1: EditOperation, op2: EditOperation): EditOperation[] {
    // For now, use last-writer-wins strategy for replace operations
    const laterOp = new Date(op1.timestamp) > new Date(op2.timestamp) ? op1 : op2;
    return [laterOp];
  }

  /**
   * Apply an operation to text content
   */
  static applyOperation(content: string, operation: EditOperation): string {
    switch (operation.type) {
      case 'insert':
        return content.slice(0, operation.position) +
          operation.content +
          content.slice(operation.position);

      case 'delete':
        return content.slice(0, operation.position) +
          content.slice(operation.position + operation.length);

      case 'replace':
        return content.slice(0, operation.position) +
          operation.content +
          content.slice(operation.position + operation.length);

      default:
        return content;
    }
  }
}

/**
 * Collaborative Editing Service
 * Main service class managing collaborative editing sessions
 */
export class CollaborativeEditingService extends EventEmitter {
  private static instance: CollaborativeEditingService;
  private activeSessions: Map<string, CollaborativeMemory> = new Map();
  private userColors: string[] = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  private colorIndex: number = 0;

  static getInstance(): CollaborativeEditingService {
    if (!CollaborativeEditingService.instance) {
      CollaborativeEditingService.instance = new CollaborativeEditingService();
    }
    return CollaborativeEditingService.instance;
  }

  /**
   * Start a collaborative editing session for a memory
   */
  async startSession(memoryId: string, userId: string, userData: Partial<CollaborativeUser>): Promise<CollaborativeMemory> {
    let session = this.activeSessions.get(memoryId);

    if (!session) {
      // Create new collaborative session
      session = {
        id: memoryId,
        content: await this.getMemoryContent(memoryId),
        title: await this.getMemoryTitle(memoryId),
        agentId: userData.name?.split(' ')[0]?.toLowerCase() || 'unknown',
        activeUsers: [],
        operations: [],
        version: 1,
        lastModified: new Date().toISOString(),
        lockStatus: 'unlocked'
      };
      this.activeSessions.set(memoryId, session);
    }

    // Add user to session
    const user: CollaborativeUser = {
      id: userId,
      name: userData.name || `User ${userId}`,
      email: userData.email || `${userId}@example.com`,
      avatar: userData.avatar,
      cursor: { line: 0, column: 0, position: 0 },
      selection: undefined,
      isActive: true,
      lastSeen: new Date().toISOString(),
      color: this.assignUserColor(userId)
    };

    // Remove user if already in session, then add updated version
    session.activeUsers = session.activeUsers.filter(u => u.id !== userId);
    session.activeUsers.push(user);

    this.emit('user-joined', { memoryId, user, session });

    return session;
  }

  /**
   * End a collaborative editing session for a user
   */
  async endSession(memoryId: string, userId: string): Promise<void> {
    const session = this.activeSessions.get(memoryId);
    if (!session) return;

    // Remove user from active users
    session.activeUsers = session.activeUsers.filter(u => u.id !== userId);

    this.emit('user-left', { memoryId, userId, session });

    // If no active users, clean up session after grace period
    if (session.activeUsers.length === 0) {
      setTimeout(() => {
        const currentSession = this.activeSessions.get(memoryId);
        if (currentSession && currentSession.activeUsers.length === 0) {
          this.activeSessions.delete(memoryId);
          this.emit('session-ended', { memoryId });
        }
      }, 30000); // 30 second grace period
    }
  }

  /**
   * Apply an edit operation to a collaborative memory
   */
  async applyOperation(memoryId: string, operation: EditOperation): Promise<CollaborativeMemory> {
    const session = this.activeSessions.get(memoryId);
    if (!session) {
      throw new Error(`No active session for memory ${memoryId}`);
    }

    // Transform operation against existing operations
    let transformedOps = [operation];

    // Get operations that happened after this operation's base version
    const recentOps = session.operations.filter(op =>
      new Date(op.timestamp) > new Date(operation.timestamp)
    );

    // Apply operational transforms
    for (const recentOp of recentOps) {
      const newTransformedOps: EditOperation[] = [];
      for (const op of transformedOps) {
        const transformed = OperationalTransform.transform(op, recentOp);
        newTransformedOps.push(...transformed);
      }
      transformedOps = newTransformedOps;
    }

    // Apply transformed operations to content
    let newContent = session.content;
    for (const op of transformedOps) {
      newContent = OperationalTransform.applyOperation(newContent, op);
    }

    // Update session
    session.content = newContent;
    session.operations.push(...transformedOps);
    session.version++;
    session.lastModified = new Date().toISOString();

    // Save to persistent storage
    await this.saveMemoryContent(memoryId, newContent);

    this.emit('content-changed', { memoryId, session, operations: transformedOps });

    return session;
  }

  /**
   * Update user cursor/selection position
   */
  async updateUserPresence(memoryId: string, userId: string, cursor?: CursorPosition, selection?: TextSelection): Promise<void> {
    const session = this.activeSessions.get(memoryId);
    if (!session) return;

    const user = session.activeUsers.find(u => u.id === userId);
    if (user) {
      user.cursor = cursor;
      user.selection = selection;
      user.lastSeen = new Date().toISOString();
      user.isActive = true;

      this.emit('presence-updated', { memoryId, userId, cursor, selection });
    }
  }

  /**
   * Get current session state
   */
  getSession(memoryId: string): CollaborativeMemory | undefined {
    return this.activeSessions.get(memoryId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): CollaborativeMemory[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Lock a memory for exclusive editing
   */
  async lockMemory(memoryId: string, userId: string, lockType: 'soft-lock' | 'hard-lock' = 'soft-lock'): Promise<boolean> {
    const session = this.activeSessions.get(memoryId);
    if (!session) return false;

    if (session.lockStatus !== 'unlocked' && session.lockedBy !== userId) {
      return false; // Already locked by someone else
    }

    session.lockStatus = lockType;
    session.lockedBy = userId;

    this.emit('memory-locked', { memoryId, userId, lockType });

    return true;
  }

  /**
   * Unlock a memory
   */
  async unlockMemory(memoryId: string, userId: string): Promise<boolean> {
    const session = this.activeSessions.get(memoryId);
    if (!session || session.lockedBy !== userId) {
      return false; // Not locked by this user
    }

    session.lockStatus = 'unlocked';
    session.lockedBy = undefined;

    this.emit('memory-unlocked', { memoryId, userId });

    return true;
  }

  /**
   * Get version history for a memory
   */
  async getVersionHistory(memoryId: string): Promise<EditOperation[]> {
    const session = this.activeSessions.get(memoryId);
    return session ? session.operations : [];
  }

  /**
   * Rollback to a specific version
   */
  async rollbackToVersion(memoryId: string, targetVersion: number, userId: string): Promise<CollaborativeMemory> {
    const session = this.activeSessions.get(memoryId);
    if (!session) {
      throw new Error(`No active session for memory ${memoryId}`);
    }

    // Get operations up to target version
    const targetOps = session.operations.slice(0, targetVersion - 1);

    // Reconstruct content from operations
    let reconstructedContent = await this.getOriginalMemoryContent(memoryId);
    for (const op of targetOps) {
      reconstructedContent = OperationalTransform.applyOperation(reconstructedContent, op);
    }

    // Update session
    session.content = reconstructedContent;
    session.operations = targetOps;
    session.version = targetVersion;
    session.lastModified = new Date().toISOString();

    // Save to persistent storage
    await this.saveMemoryContent(memoryId, reconstructedContent);

    this.emit('version-rollback', { memoryId, targetVersion, userId, session });

    return session;
  }

  /**
   * Assign a unique color to a user
   */
  private assignUserColor(userId: string): string {
    // Use consistent color based on user ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    const index = Math.abs(hash) % this.userColors.length;
    return this.userColors[index];
  }

  /**
   * Get memory content (mock implementation)
   */
  private async getMemoryContent(memoryId: string): Promise<string> {
    // In a real implementation, this would fetch from the database
    return `Sample content for memory ${memoryId}`;
  }

  /**
   * Get memory title (mock implementation)
   */
  private async getMemoryTitle(memoryId: string): Promise<string> {
    // In a real implementation, this would fetch from the database
    return `Memory ${memoryId}`;
  }

  /**
   * Get original memory content before any edits (mock implementation)
   */
  private async getOriginalMemoryContent(memoryId: string): Promise<string> {
    // In a real implementation, this would fetch the original version
    return `Original content for memory ${memoryId}`;
  }

  /**
   * Save memory content to persistent storage (mock implementation)
   */
  private async saveMemoryContent(memoryId: string, content: string): Promise<void> {
    // In a real implementation, this would save to the database
    console.log(`Saving memory ${memoryId} with content length: ${content.length}`);
  }

  /**
   * Generate sample collaborative sessions for testing
   */
  generateSampleSessions(): CollaborativeMemory[] {
    const sampleSessions: CollaborativeMemory[] = [
      {
        id: 'collab-memory-001',
        content: 'This is a collaborative memory being edited by multiple users in real-time. You can see live cursors and changes as they happen.',
        title: 'Team Project Planning',
        agentId: 'team-lead',
        activeUsers: [
          {
            id: 'user-001',
            name: 'Alice Johnson',
            email: 'alice@company.com',
            avatar: '👩‍💻',
            cursor: { line: 1, column: 25, position: 25 },
            selection: undefined,
            isActive: true,
            lastSeen: new Date().toISOString(),
            color: '#FF6B6B'
          },
          {
            id: 'user-002',
            name: 'Bob Smith',
            email: 'bob@company.com',
            avatar: '👨‍💼',
            cursor: { line: 2, column: 10, position: 60 },
            selection: {
              start: { line: 2, column: 5, position: 55 },
              end: { line: 2, column: 15, position: 65 },
              text: 'real-time'
            },
            isActive: true,
            lastSeen: new Date(Date.now() - 5000).toISOString(),
            color: '#4ECDC4'
          }
        ],
        operations: [
          {
            id: 'op-001',
            type: 'insert',
            position: 25,
            content: ' being edited',
            length: 13,
            userId: 'user-001',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            memoryId: 'collab-memory-001'
          },
          {
            id: 'op-002',
            type: 'replace',
            position: 55,
            content: 'real-time',
            length: 9,
            userId: 'user-002',
            timestamp: new Date(Date.now() - 30000).toISOString(),
            memoryId: 'collab-memory-001'
          }
        ],
        version: 3,
        lastModified: new Date(Date.now() - 5000).toISOString(),
        lockStatus: 'unlocked'
      },
      {
        id: 'collab-memory-002',
        content: 'Research findings from the Q3 market analysis. Key insights include customer behavior patterns and competitive landscape.',
        title: 'Q3 Market Research',
        agentId: 'research-team',
        activeUsers: [
          {
            id: 'user-003',
            name: 'Carol Davis',
            email: 'carol@company.com',
            avatar: '👩‍🔬',
            cursor: { line: 1, column: 45, position: 45 },
            selection: undefined,
            isActive: true,
            lastSeen: new Date().toISOString(),
            color: '#45B7D1'
          }
        ],
        operations: [
          {
            id: 'op-003',
            type: 'insert',
            position: 45,
            content: 'Key insights include ',
            length: 20,
            userId: 'user-003',
            timestamp: new Date(Date.now() - 45000).toISOString(),
            memoryId: 'collab-memory-002'
          }
        ],
        version: 2,
        lastModified: new Date(Date.now() - 10000).toISOString(),
        lockStatus: 'soft-lock',
        lockedBy: 'user-003'
      }
    ];

    // Store sample sessions
    sampleSessions.forEach(session => {
      this.activeSessions.set(session.id, session);
    });

    return sampleSessions;
  }
}

export default CollaborativeEditingService;
