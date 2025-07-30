import { Server as IOServer } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'

interface SocketServer extends HTTPServer {
    io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
    server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO
}

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

interface CollaborationSession {
    id: string
    projectId: string
    filePath: string
    users: CollaborationUser[]
    host: string
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
    createdAt: Date
    lastActivity: Date
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

// In-memory storage for sessions (in production, use Redis or database)
const sessions = new Map<string, CollaborationSession>()
const userSessions = new Map<string, string>() // userId -> sessionId

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (!res.socket || !res.socket.server) {
        console.error('Socket.IO server not available')
        res.status(500).json({ error: 'Socket.IO server not available' })
        return
    }

    if (res.socket.server.io) {
        console.log('Socket.IO server already running')
        res.end()
        return
    }

    console.log('Starting Socket.IO server...')

    const io = new IOServer(res.socket.server, {
        path: '/api/collaboration',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? process.env.NEXTAUTH_URL
                : ['http://localhost:3000', 'http://localhost:4030'],
            methods: ['GET', 'POST']
        }
    })

    res.socket.server.io = io

    const collaborationNamespace = io.of('/collaboration')

    collaborationNamespace.on('connection', (socket) => {
        console.log('User connected to collaboration:', socket.id)

        socket.on('session:join', async (data: {
            projectId: string
            filePath: string
            user: Omit<CollaborationUser, 'isActive' | 'lastSeen'>
        }) => {
            try {
                const { projectId, filePath, user } = data
                const sessionKey = `${projectId}:${filePath}`

                let session = sessions.get(sessionKey)

                if (!session) {
                    // Create new session
                    session = {
                        id: sessionKey,
                        projectId,
                        filePath,
                        users: [],
                        host: user.id,
                        maxUsers: 10,
                        permissions: {
                            canEdit: true,
                            canComment: true,
                            canSuggest: true
                        },
                        settings: {
                            autoSave: true,
                            showCursors: true,
                            showSelections: true,
                            conflictResolution: 'manual'
                        },
                        createdAt: new Date(),
                        lastActivity: new Date()
                    }
                    sessions.set(sessionKey, session)
                }

                // Add or update user in session
                const collaborationUser: CollaborationUser = {
                    ...user,
                    isActive: true,
                    lastSeen: new Date()
                }

                const existingUserIndex = session.users.findIndex(u => u.id === user.id)
                if (existingUserIndex >= 0) {
                    session.users[existingUserIndex] = collaborationUser
                } else {
                    session.users.push(collaborationUser)
                }

                // Join socket room
                socket.join(sessionKey)
                userSessions.set(user.id, sessionKey)

                // Notify user of successful join
                socket.emit('session:joined', {
                    ...session,
                    isHost: session.host === user.id
                })

                // Notify other users
                socket.to(sessionKey).emit('session:user-joined', collaborationUser)

                console.log(`User ${user.name} joined session ${sessionKey}`)

            } catch (error) {
                console.error('Error joining session:', error)
                socket.emit('session:error', 'Failed to join session')
            }
        })

        socket.on('session:leave', (data: { sessionId: string, userId: string }) => {
            try {
                const { sessionId, userId } = data
                const session = sessions.get(sessionId)

                if (session) {
                    // Remove user from session
                    session.users = session.users.filter(u => u.id !== userId)

                    // Leave socket room
                    socket.leave(sessionId)
                    userSessions.delete(userId)

                    // Notify other users
                    socket.to(sessionId).emit('session:user-left', userId)

                    // Clean up empty sessions
                    if (session.users.length === 0) {
                        sessions.delete(sessionId)
                        console.log(`Session ${sessionId} cleaned up`)
                    }
                }
            } catch (error) {
                console.error('Error leaving session:', error)
            }
        })

        socket.on('change:broadcast', async (data: {
            sessionId: string
            changes: CollaborationChange[]
        }) => {
            try {
                const { sessionId, changes } = data
                const session = sessions.get(sessionId)

                if (!session) {
                    socket.emit('session:error', 'Session not found')
                    return
                }

                // Update session activity
                session.lastActivity = new Date()

                // Detect conflicts
                const conflicts = await detectConflicts(changes, sessionId)

                if (conflicts.length > 0) {
                    // Notify about conflicts
                    collaborationNamespace.to(sessionId).emit('conflict:detected', conflicts)
                } else {
                    // Broadcast changes to other users in the session
                    for (const change of changes) {
                        socket.to(sessionId).emit('change:received', change)
                    }
                }

                console.log(`Broadcasted ${changes.length} changes to session ${sessionId}`)

            } catch (error) {
                console.error('Error broadcasting changes:', error)
                socket.emit('change:error', 'Failed to broadcast changes')
            }
        })

        socket.on('cursor:update', (data: {
            sessionId: string
            cursor: CollaborationUser['cursor']
        }) => {
            try {
                const { sessionId, cursor } = data
                const userId = getUserIdFromSocket(socket.id)

                if (userId) {
                    const session = sessions.get(sessionId)
                    if (session) {
                        // Update user cursor in session
                        const user = session.users.find(u => u.id === userId)
                        if (user) {
                            user.cursor = cursor
                            user.lastSeen = new Date()
                        }

                        // Broadcast cursor update to other users
                        socket.to(sessionId).emit('cursor:update', userId, cursor)
                    }
                }
            } catch (error) {
                console.error('Error updating cursor:', error)
            }
        })

        socket.on('comment:add', (data: {
            sessionId: string
            comment: {
                id: string
                userId: string
                content: string
                position: { line: number; column: number }
                timestamp: Date
            }
        }) => {
            try {
                const { sessionId, comment } = data
                const session = sessions.get(sessionId)

                if (session) {
                    // Broadcast comment to other users
                    socket.to(sessionId).emit('comment:added', comment)
                    console.log(`Comment added to session ${sessionId}`)
                }
            } catch (error) {
                console.error('Error adding comment:', error)
            }
        })

        socket.on('ai:suggestion', (data: {
            sessionId: string
            suggestion: {
                id: string
                userId: string
                type: string
                content: string
                position: { line: number; column: number }
                confidence: number
            }
        }) => {
            try {
                const { sessionId, suggestion } = data
                const session = sessions.get(sessionId)

                if (session && session.permissions.canSuggest) {
                    // Broadcast AI suggestion to other users
                    socket.to(sessionId).emit('ai:suggestion-received', suggestion)
                    console.log(`AI suggestion shared in session ${sessionId}`)
                }
            } catch (error) {
                console.error('Error sharing AI suggestion:', error)
            }
        })

        socket.on('disconnect', () => {
            try {
                const userId = getUserIdFromSocket(socket.id)

                if (userId) {
                    const sessionId = userSessions.get(userId)

                    if (sessionId) {
                        const session = sessions.get(sessionId)

                        if (session) {
                            // Mark user as inactive
                            const user = session.users.find(u => u.id === userId)
                            if (user) {
                                user.isActive = false
                                user.lastSeen = new Date()
                            }

                            // Notify other users
                            socket.to(sessionId).emit('session:user-disconnected', userId)

                            // Clean up after 5 minutes of inactivity
                            setTimeout(() => {
                                const currentSession = sessions.get(sessionId)
                                if (currentSession) {
                                    currentSession.users = currentSession.users.filter(u =>
                                        u.isActive || (new Date().getTime() - u.lastSeen.getTime()) < 300000
                                    )

                                    if (currentSession.users.length === 0) {
                                        sessions.delete(sessionId)
                                    }
                                }
                            }, 300000) // 5 minutes
                        }
                    }
                }

                console.log('User disconnected from collaboration:', socket.id)
            } catch (error) {
                console.error('Error handling disconnect:', error)
            }
        })
    })

    console.log('Socket.IO collaboration server setup complete')
    res.end()
}

// Helper functions
function getUserIdFromSocket(socketId: string): string | null {
    // In a real implementation, you'd maintain a socket-to-user mapping
    // For now, we'll extract from userSessions
    for (const [userId, sessionId] of userSessions.entries()) {
        // This is a simplified approach - in production, maintain proper socket mapping
        return userId
    }
    return null
}

async function detectConflicts(changes: CollaborationChange[], sessionId: string): Promise<CollaborationChange[]> {
    const conflicts: CollaborationChange[] = []

    // Simple conflict detection logic
    // In production, implement more sophisticated operational transformation
    const changesByLine = new Map<number, CollaborationChange[]>()

    for (const change of changes) {
        const line = change.position.line
        if (!changesByLine.has(line)) {
            changesByLine.set(line, [])
        }
        changesByLine.get(line)!.push(change)
    }

    // Check for conflicts on the same line within a short time window
    for (const [line, lineChanges] of changesByLine.entries()) {
        if (lineChanges.length > 1) {
            // Sort by timestamp
            lineChanges.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

            // Check if changes overlap in time (within 1 second)
            for (let i = 0; i < lineChanges.length - 1; i++) {
                const timeDiff = new Date(lineChanges[i + 1].timestamp).getTime() - new Date(lineChanges[i].timestamp).getTime()
                if (timeDiff < 1000 && lineChanges[i].userId !== lineChanges[i + 1].userId) {
                    conflicts.push(lineChanges[i + 1])
                }
            }
        }
    }

    return conflicts
}

export const config = {
    api: {
        bodyParser: false,
    },
}
