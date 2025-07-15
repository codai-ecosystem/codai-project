/**
 * MemorAI Real-time Collaboration System
 * WebSocket-based collaborative editing with conflict resolution
 */

import { io, Socket } from 'socket.io-client'
import { logUser, logError, logSystem } from '../logger'

// Collaboration interfaces
export interface CollaborationUser {
    id: string
    name: string
    email: string
    avatar?: string
    color: string
    isActive: boolean
    cursor?: {
        x: number
        y: number
        element?: string
    }
}

export interface CollaborationSession {
    id: string
    documentId: string
    users: CollaborationUser[]
    isOwner: boolean
    permissions: {
        read: boolean
        write: boolean
        admin: boolean
    }
    createdAt: Date
    lastActivity: Date
}

export interface OperationEvent {
    id: string
    sessionId: string
    userId: string
    type: 'insert' | 'delete' | 'format' | 'cursor' | 'selection'
    timestamp: number
    operation: {
        position?: number
        length?: number
        content?: string
        attributes?: Record<string, any>
    }
    metadata?: Record<string, any>
}

export interface ConflictResolution {
    localOperation: OperationEvent
    remoteOperation: OperationEvent
    resolution: 'keep_local' | 'keep_remote' | 'merge' | 'manual'
    mergedOperation?: OperationEvent
}

class RealTimeCollaborationEngine {
    private socket: Socket | null = null
    private currentSession: CollaborationSession | null = null
    private operationQueue: OperationEvent[] = []
    private isConnected = false
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private conflictQueue: ConflictResolution[] = []

    // Event listeners
    private eventListeners: Record<string, Function[]> = {}

    constructor() {
        this.initializeSocket()
    }

    /**
     * Initialize WebSocket connection
     */
    private initializeSocket(): void {
        try {
            this.socket = io(process.env.NEXT_PUBLIC_COLLABORATION_ENDPOINT || 'ws://localhost:4031', {
                transports: ['websocket', 'polling'],
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000
            })

            this.setupSocketHandlers()
        } catch (error) {
            logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'collaboration',
                operation: 'initializeSocket'
            })
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    private setupSocketHandlers(): void {
        if (!this.socket) return

        this.socket.on('connect', () => {
            this.isConnected = true
            this.reconnectAttempts = 0
            this.emit('connection:established')
            logSystem('socket-connected', 'info', { sessionId: this.currentSession?.id || 'none' })
        })

        this.socket.on('disconnect', () => {
            this.isConnected = false
            this.emit('connection:lost')
            logSystem('socket-disconnected', 'warn', { sessionId: this.currentSession?.id || 'none' })
        })

        this.socket.on('reconnect', (attempt: number) => {
            this.reconnectAttempts = attempt
            this.emit('connection:reconnected', { attempt })
            logSystem('socket-reconnected', 'info', { context: { sessionId: this.currentSession?.id || 'none', attempt } })
        })

        this.socket.on('session:joined', (session: CollaborationSession) => {
            this.currentSession = session
            this.emit('session:joined', session)
            logSystem('session-joined', 'info', { context: { sessionId: session.id, userCount: session.users.length } })
        })

        this.socket.on('session:left', (sessionId: string) => {
            this.currentSession = null
            this.emit('session:left', { sessionId })
            logSystem('session-left', 'info', { sessionId })
        })

        this.socket.on('user:joined', (user: CollaborationUser) => {
            if (this.currentSession) {
                this.currentSession.users.push(user)
                this.emit('user:joined', user)
                logSystem('user-joined', 'info', { sessionId: this.currentSession.id, userId: user.id })
            }
        })

        this.socket.on('user:left', (userId: string) => {
            if (this.currentSession) {
                this.currentSession.users = this.currentSession.users.filter(u => u.id !== userId)
                this.emit('user:left', { userId })
                logSystem('user-left', 'info', { sessionId: this.currentSession.id, userId })
            }
        })

        this.socket.on('operation:received', (operation: OperationEvent) => {
            this.handleRemoteOperation(operation)
        })

        this.socket.on('cursor:updated', (data: { userId: string; cursor: { x: number; y: number; element?: string } }) => {
            this.updateUserCursor(data.userId, data.cursor)
        })

        this.socket.on('conflict:detected', (conflict: ConflictResolution) => {
            this.handleConflict(conflict)
        })

        this.socket.on('error', (error: any) => {
            logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'collaboration',
                operation: 'socket-error'
            })
        })
    }

    /**
     * Join a collaboration session
     */
    public async joinSession(sessionId: string, user: Omit<CollaborationUser, 'isActive'>): Promise<void> {
        try {
            if (!this.socket) {
                throw new Error('Socket not initialized')
            }

            if (!this.isConnected) {
                await this.connect()
            }

            const activeUser: CollaborationUser = {
                ...user,
                isActive: true
            }

            this.socket.emit('session:join', { sessionId, user: activeUser })

            await logUser('collaboration-session-join-requested', {
                context: { sessionId, userId: user.id }
            })

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'collaboration',
                operation: 'joinSession'
            })
            throw error
        }
    }

    /**
     * Leave current collaboration session
     */
    public async leaveSession(): Promise<void> {
        try {
            if (this.socket && this.currentSession) {
                this.socket.emit('session:leave', { sessionId: this.currentSession.id })

                await logUser('collaboration-session-left', {
                    context: { sessionId: this.currentSession.id }
                })
            }

            this.currentSession = null
        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'collaboration',
                operation: 'leaveSession'
            })
        }
    }

    /**
     * Send operation to other collaborators
     */
    public async sendOperation(operation: Omit<OperationEvent, 'id' | 'timestamp'>): Promise<void> {
        try {
            if (!this.socket || !this.currentSession) {
                throw new Error('Not connected to collaboration session')
            }

            const fullOperation: OperationEvent = {
                ...operation,
                id: this.generateOperationId(),
                timestamp: Date.now()
            }

            this.socket.emit('operation:send', fullOperation)
            this.operationQueue.push(fullOperation)

            await logSystem('operation-sent', 'info', {
                context: {
                    sessionId: this.currentSession.id,
                    operationType: operation.type,
                    operationId: fullOperation.id
                }
            })

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'collaboration',
                operation: 'sendOperation'
            })
        }
    }

    /**
     * Update cursor position
     */
    public async updateCursor(x: number, y: number, element?: string): Promise<void> {
        try {
            if (!this.socket || !this.currentSession) return

            const cursor = { x, y, element }
            this.socket.emit('cursor:update', cursor)

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'collaboration',
                operation: 'updateCursor'
            })
        }
    }

    /**
     * Handle incoming remote operations
     */
    private async handleRemoteOperation(operation: OperationEvent): Promise<void> {
        try {
            // Check for conflicts with local operations
            const conflicts = this.detectConflicts(operation)

            if (conflicts.length > 0) {
                for (const conflict of conflicts) {
                    await this.resolveConflict(conflict)
                }
            } else {
                this.emit('operation:received', operation)
            }

            await logSystem('operation-received', 'info', {
                context: {
                    sessionId: operation.sessionId,
                    operationType: operation.type,
                    operationId: operation.id,
                    hasConflicts: conflicts.length > 0
                }
            })

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'collaboration',
                operation: 'handleRemoteOperation'
            })
        }
    }

    /**
     * Detect conflicts between operations
     */
    private detectConflicts(remoteOperation: OperationEvent): ConflictResolution[] {
        const conflicts: ConflictResolution[] = []

        for (const localOperation of this.operationQueue) {
            if (this.isConflicting(localOperation, remoteOperation)) {
                const resolution: ConflictResolution = {
                    localOperation,
                    remoteOperation,
                    resolution: this.determineResolutionStrategy(localOperation, remoteOperation)
                }
                conflicts.push(resolution)
            }
        }

        return conflicts
    }

    /**
     * Check if two operations conflict
     */
    private isConflicting(op1: OperationEvent, op2: OperationEvent): boolean {
        // Operations conflict if they affect the same position and are close in time
        if (op1.type === 'cursor' || op2.type === 'cursor') return false

        const timeDiff = Math.abs(op1.timestamp - op2.timestamp)
        const maxTimeDiff = 5000 // 5 seconds

        if (timeDiff > maxTimeDiff) return false

        const pos1 = op1.operation.position || 0
        const pos2 = op2.operation.position || 0
        const len1 = op1.operation.length || 1
        const len2 = op2.operation.length || 1

        // Check for position overlap
        return (pos1 < pos2 + len2) && (pos2 < pos1 + len1)
    }

    /**
     * Determine conflict resolution strategy
     */
    private determineResolutionStrategy(local: OperationEvent, remote: OperationEvent): ConflictResolution['resolution'] {
        // For now, implement a simple timestamp-based resolution
        // In a real implementation, you'd want more sophisticated strategies

        if (local.timestamp < remote.timestamp) {
            return 'keep_local'
        } else if (remote.timestamp < local.timestamp) {
            return 'keep_remote'
        } else {
            // Same timestamp, use user priority or merge
            return 'merge'
        }
    }

    /**
     * Resolve a conflict
     */
    private async resolveConflict(conflict: ConflictResolution): Promise<void> {
        try {
            switch (conflict.resolution) {
                case 'keep_local':
                    // Keep local operation, ignore remote
                    break

                case 'keep_remote':
                    // Apply remote operation, discard local
                    this.emit('operation:received', conflict.remoteOperation)
                    break

                case 'merge':
                    // Attempt to merge operations
                    const merged = this.mergeOperations(conflict.localOperation, conflict.remoteOperation)
                    if (merged) {
                        this.emit('operation:received', merged)
                    }
                    break

                case 'manual':
                    // Require manual resolution
                    this.conflictQueue.push(conflict)
                    this.emit('conflict:manual', conflict)
                    break
            }

            await logSystem('conflict-resolved', 'info', {
                context: {
                    sessionId: conflict.localOperation.sessionId,
                    resolution: conflict.resolution,
                    localOpId: conflict.localOperation.id,
                    remoteOpId: conflict.remoteOperation.id
                }
            })

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'collaboration',
                operation: 'resolveConflict'
            })
        }
    }

    /**
     * Merge two operations
     */
    private mergeOperations(op1: OperationEvent, op2: OperationEvent): OperationEvent | null {
        // Simplified merge logic - in practice, this would be much more complex
        if (op1.type === 'insert' && op2.type === 'insert') {
            const pos1 = op1.operation.position || 0
            const pos2 = op2.operation.position || 0

            if (Math.abs(pos1 - pos2) <= 1) {
                // Merge adjacent inserts
                return {
                    ...op1,
                    id: this.generateOperationId(),
                    operation: {
                        ...op1.operation,
                        content: (op1.operation.content || '') + (op2.operation.content || '')
                    }
                }
            }
        }

        return null
    }

    /**
     * Update user cursor position
     */
    private updateUserCursor(userId: string, cursor: { x: number; y: number; element?: string }): void {
        if (this.currentSession) {
            const user = this.currentSession.users.find(u => u.id === userId)
            if (user) {
                user.cursor = cursor
                this.emit('cursor:updated', { userId, cursor })
            }
        }
    }

    /**
     * Handle conflict requiring manual resolution
     */
    private async handleConflict(conflict: ConflictResolution): Promise<void> {
        this.conflictQueue.push(conflict)
        this.emit('conflict:detected', conflict)

        await logSystem('conflict-detected', 'warn', {
            context: {
                sessionId: conflict.localOperation.sessionId,
                localOpId: conflict.localOperation.id,
                remoteOpId: conflict.remoteOperation.id
            }
        })
    }

    /**
     * Connect to WebSocket server
     */
    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Socket not initialized'))
                return
            }

            if (this.isConnected) {
                resolve()
                return
            }

            this.socket.connect()

            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'))
            }, 10000)

            this.socket.once('connect', () => {
                clearTimeout(timeout)
                resolve()
            })

            this.socket.once('connect_error', (error: Error) => {
                clearTimeout(timeout)
                reject(error)
            })
        })
    }

    /**
     * Disconnect from WebSocket server
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
        }
        this.isConnected = false
        this.currentSession = null
    }

    /**
     * Generate unique operation ID
     */
    private generateOperationId(): string {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    /**
     * Event system for collaboration updates
     */
    public on(event: string, callback: Function): void {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = []
        }
        this.eventListeners[event].push(callback)
    }

    public off(event: string, callback: Function): void {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
        }
    }

    private emit(event: string, data?: any): void {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data))
        }
    }

    /**
     * Get current session info
     */
    public getCurrentSession(): CollaborationSession | null {
        return this.currentSession
    }

    /**
     * Get active users in current session
     */
    public getActiveUsers(): CollaborationUser[] {
        return this.currentSession?.users.filter(u => u.isActive) || []
    }

    /**
     * Get pending conflicts
     */
    public getPendingConflicts(): ConflictResolution[] {
        return [...this.conflictQueue]
    }

    /**
     * Resolve manual conflict
     */
    public async resolveManualConflict(conflictId: string, resolution: 'keep_local' | 'keep_remote' | 'custom', customOperation?: OperationEvent): Promise<void> {
        try {
            const conflictIndex = this.conflictQueue.findIndex(c =>
                c.localOperation.id === conflictId || c.remoteOperation.id === conflictId
            )

            if (conflictIndex === -1) {
                throw new Error('Conflict not found')
            }

            const conflict = this.conflictQueue[conflictIndex]

            if (resolution === 'custom' && customOperation) {
                this.emit('operation:received', customOperation)
            } else if (resolution === 'keep_local' || resolution === 'keep_remote') {
                conflict.resolution = resolution
                await this.resolveConflict(conflict)
            }

            this.conflictQueue.splice(conflictIndex, 1)

        } catch (error) {
            await logError(error instanceof Error ? error : new Error(String(error)), {
                module: 'collaboration',
                operation: 'resolveManualConflict'
            })
        }
    }

    /**
     * Get collaboration analytics
     */
    public getAnalytics() {
        return {
            isConnected: this.isConnected,
            currentSession: this.currentSession?.id || null,
            activeUsers: this.getActiveUsers().length,
            pendingOperations: this.operationQueue.length,
            pendingConflicts: this.conflictQueue.length,
            reconnectAttempts: this.reconnectAttempts
        }
    }
}

// Export singleton instance
export const collaborationEngine = new RealTimeCollaborationEngine()
export default collaborationEngine
