import { useState, useEffect, useRef, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

interface CollaborationUser {
    id: string
    name: string
    avatar?: string
    color: string
    cursor?: {
        line: number
        column: number
        selection?: {
            start: { line: number; column: number }
            end: { line: number; column: number }
        }
    }
    isActive: boolean
    lastSeen: Date
}

// Define Socket.IO event interfaces
interface ServerToClientEvents {
    'session:joined': (sessionData: CollaborationSession) => void
    'session:user-joined': (user: CollaborationUser) => void
    'session:user-left': (userId: string) => void
    'change:received': (change: CollaborationChange) => void
    'conflict:detected': (conflicts: CollaborationChange[]) => void
    'cursor:update': (userId: string, cursor: CollaborationUser['cursor']) => void
    disconnect: () => void
    connect: () => void
}

interface ClientToServerEvents {
    'session:join': (data: {
        projectId: string
        filePath: string
        user: Omit<CollaborationUser, 'isActive' | 'lastSeen'>
    }) => void
    'session:leave': (data: { sessionId: string; userId: string }) => void
    'change:broadcast': (data: { sessionId: string; changes: CollaborationChange[] }) => void
    'cursor:update': (data: { sessionId: string; cursor: CollaborationUser['cursor'] }) => void
}

type CollaborationSocket = Socket<ServerToClientEvents, ClientToServerEvents>

interface CollaborationSession {
    id: string
    projectId: string
    filePath: string
    users: CollaborationUser[]
    isHost: boolean
    maxUsers: number
    permissions: {
        canEdit: boolean
        canComment: boolean
        canSuggest: boolean
    }
    settings: {
        autoSave: boolean
        showCursors: boolean
        showSelections: boolean
        conflictResolution: 'manual' | 'automatic' | 'democratic'
    }
}

interface CollaborationChange {
    id: string
    userId: string
    timestamp: Date
    type: 'insert' | 'delete' | 'replace' | 'cursor' | 'selection'
    position: { line: number; column: number }
    content?: string
    length?: number
    metadata?: {
        confidence?: number
        suggestion?: boolean
        aiGenerated?: boolean
    }
}

interface UseCollaborationOptions {
    projectId: string
    filePath: string
    userId: string
    userName: string
    onContentChange?: (content: string, change: CollaborationChange) => void
    onUsersChange?: (users: CollaborationUser[]) => void
    onConflict?: (conflicts: CollaborationChange[]) => void
    autoResolveConflicts?: boolean
}

export function useCollaboration({
    projectId,
    filePath,
    userId,
    userName,
    onContentChange,
    onUsersChange,
    onConflict,
    autoResolveConflicts = true
}: UseCollaborationOptions) {
    const [socket, setSocket] = useState<CollaborationSocket | null>(null)
    const [session, setSession] = useState<CollaborationSession | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [users, setUsers] = useState<CollaborationUser[]>([])
    const [pendingChanges, setPendingChanges] = useState<CollaborationChange[]>([])
    const [conflictQueue, setConflictQueue] = useState<CollaborationChange[]>([])

    const changeBufferRef = useRef<CollaborationChange[]>([])
    const lastSyncRef = useRef<Date>(new Date())
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Initialize socket connection
    useEffect(() => {
        const newSocket: CollaborationSocket = io('/collaboration', {
            transports: ['websocket'],
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        })

        newSocket.on('connect', () => {
            // eslint-disable-next-line no-console
            console.log('Collaboration socket connected')
            setIsConnected(true)
            joinSession()
        })

        newSocket.on('disconnect', () => {
            // eslint-disable-next-line no-console
            console.log('Collaboration socket disconnected')
            setIsConnected(false)
        })

        newSocket.on('session:joined', (sessionData: CollaborationSession) => {
            setSession(sessionData)
            setUsers(sessionData.users)
            onUsersChange?.(sessionData.users)
        })

        newSocket.on('session:user-joined', (user: CollaborationUser) => {
            setUsers(prev => [...prev.filter(u => u.id !== user.id), user])
            onUsersChange?.(users)
        })

        newSocket.on('session:user-left', (userId: string) => {
            setUsers(prev => prev.filter(u => u.id !== userId))
            onUsersChange?.(users.filter(u => u.id !== userId))
        })

        newSocket.on('change:received', (change: CollaborationChange) => {
            handleRemoteChange(change)
        })

        newSocket.on('conflict:detected', (conflicts: CollaborationChange[]) => {
            if (autoResolveConflicts) {
                resolveConflictsAutomatically(conflicts)
            } else {
                setConflictQueue(prev => [...prev, ...conflicts])
                onConflict?.(conflicts)
            }
        })

        newSocket.on('cursor:update', (userId: string, cursor: CollaborationUser['cursor']) => {
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, cursor } : user
            ))
        })

        setSocket(newSocket)

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            newSocket.disconnect()
        }
    }, [projectId, filePath, userId])

    const joinSession = useCallback(() => {
        if (!socket) return

        socket.emit('session:join', {
            projectId,
            filePath,
            user: {
                id: userId,
                name: userName,
                color: generateUserColor(userId)
            }
        })
    }, [socket, projectId, filePath, userId, userName])

    const connect = useCallback(() => {
        if (socket && !isConnected) {
            socket.connect()
        }
    }, [socket, isConnected])

    const disconnect = useCallback(() => {
        if (socket && isConnected) {
            socket.disconnect()
        }
    }, [socket, isConnected])

    const broadcastChange = useCallback((change: CollaborationChange) => {
        if (!socket || !isConnected || !session) return

        // Add to buffer for batch processing
        changeBufferRef.current.push(change)

        // Debounced send
        if (changeBufferRef.current.length === 1) {
            setTimeout(() => {
                if (changeBufferRef.current.length > 0) {
                    socket.emit('change:broadcast', {
                        sessionId: session.id,
                        changes: [...changeBufferRef.current]
                    })
                    changeBufferRef.current = []
                }
            }, 100) // 100ms debounce
        }
    }, [socket, isConnected, session])

    const handleRemoteChange = useCallback((change: CollaborationChange) => {
        // Skip own changes
        if (change.userId === userId) return

        // Check for conflicts
        const hasConflict = pendingChanges.some(pending =>
            isConflictingChange(pending, change)
        )

        if (hasConflict && !autoResolveConflicts) {
            setConflictQueue(prev => [...prev, change])
            onConflict?.([change])
            return
        }

        // Apply change
        onContentChange?.('', change) // Content will be calculated by the editor
        setPendingChanges(prev => prev.filter(p => p.id !== change.id))
    }, [userId, pendingChanges, autoResolveConflicts, onContentChange, onConflict])

    const resolveConflictsAutomatically = useCallback((conflicts: CollaborationChange[]) => {
        // Simple conflict resolution: latest timestamp wins
        const resolvedChanges = conflicts.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        for (const change of resolvedChanges) {
            onContentChange?.('', change)
        }

        setConflictQueue([])
    }, [onContentChange])

    const updateCursor = useCallback((line: number, column: number, selection?: { start: { line: number; column: number }, end: { line: number; column: number } }) => {
        if (!socket || !isConnected || !session) return

        const cursor = { line, column, selection }

        socket.emit('cursor:update', {
            sessionId: session.id,
            cursor
        })
    }, [socket, isConnected, session])

    const sendTextChange = useCallback((
        type: 'insert' | 'delete' | 'replace',
        position: { line: number; column: number },
        content?: string,
        length?: number,
        metadata?: CollaborationChange['metadata']
    ) => {
        const change: CollaborationChange = {
            id: generateChangeId(),
            userId,
            timestamp: new Date(),
            type,
            position,
            content,
            length,
            metadata
        }

        setPendingChanges(prev => [...prev, change])
        broadcastChange(change)

        return change
    }, [userId, broadcastChange])

    const resolveConflict = useCallback((conflictId: string, resolution: 'accept' | 'reject' | 'merge') => {
        setConflictQueue(prev => {
            const conflict = prev.find(c => c.id === conflictId)
            if (!conflict) return prev

            switch (resolution) {
                case 'accept':
                    onContentChange?.('', conflict)
                    break
                case 'reject':
                    // Do nothing, ignore the change
                    break
                case 'merge':
                    // Attempt intelligent merge
                    // This would require more complex logic
                    break
            }

            return prev.filter(c => c.id !== conflictId)
        })
    }, [onContentChange])

    const getActiveUsers = useCallback(() => {
        return users.filter(user => user.isActive && user.id !== userId)
    }, [users, userId])

    const getUserByColor = useCallback((color: string) => {
        return users.find(user => user.color === color)
    }, [users])

    return {
        // Connection state
        isConnected,
        session,
        users: getActiveUsers(),

        // Connection control
        connect,
        disconnect,

        // Content collaboration
        sendTextChange,
        updateCursor,

        // Conflict resolution
        conflictQueue,
        resolveConflict,

        // Utilities
        getUserByColor,
        isHost: session?.isHost || false,
        canEdit: session?.permissions.canEdit || false,
        canComment: session?.permissions.canComment || false,
        canSuggest: session?.permissions.canSuggest || false
    }
}

// Utility functions
function generateUserColor(userId: string): string {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]

    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
}

function generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function isConflictingChange(change1: CollaborationChange, change2: CollaborationChange): boolean {
    // Simple conflict detection: same line, overlapping positions
    if (change1.position.line !== change2.position.line) return false

    const pos1 = change1.position.column
    const pos2 = change2.position.column
    const len1 = change1.length || (change1.content?.length || 0)
    const len2 = change2.length || (change2.content?.length || 0)

    // Check for overlap
    return (pos1 <= pos2 && pos1 + len1 > pos2) ||
        (pos2 <= pos1 && pos2 + len2 > pos1)
}
