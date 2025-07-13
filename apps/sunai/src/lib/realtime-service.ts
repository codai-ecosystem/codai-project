// Mock Socket.IO types for development
interface Socket {
    on(event: string, handler: (...args: any[]) => void): void
    off(event: string, handler?: (...args: any[]) => void): void
    emit(event: string, ...args: any[]): void
    disconnect(): void
    connected: boolean
}

interface SocketIO {
    (url: string, options?: any): Socket
}

// Mock socket.io implementation for development
const mockIO: SocketIO = (url: string, options?: any) => {
    console.log('Mock Socket.IO connection to:', url)

    const eventHandlers: Record<string, ((...args: any[]) => void)[]> = {}

    const mockSocket: Socket = {
        connected: false,

        on(event: string, handler: (...args: any[]) => void) {
            if (!eventHandlers[event]) {
                eventHandlers[event] = []
            }
            eventHandlers[event].push(handler)

            // Simulate connection events
            if (event === 'connect') {
                setTimeout(() => {
                    this.connected = true
                    handler()
                }, 100)
            }
        },

        off(event: string, handler?: (...args: any[]) => void) {
            if (handler && eventHandlers[event]) {
                const index = eventHandlers[event].indexOf(handler)
                if (index > -1) {
                    eventHandlers[event].splice(index, 1)
                }
            } else {
                delete eventHandlers[event]
            }
        },

        emit(event: string, ...args: any[]) {
            console.log('Socket emit:', event, args)

            // Mock responses for common events
            if (event === 'join-room' && typeof args[1] === 'function') {
                setTimeout(() => args[1]({ success: true }), 50)
            }
            if (event === 'leave-room' && typeof args[1] === 'function') {
                setTimeout(() => args[1](), 50)
            }
            if (event === 'ping' && typeof args[1] === 'function') {
                setTimeout(() => args[1](args[0]), 10)
            }
        },

        disconnect() {
            this.connected = false
            if (eventHandlers['disconnect']) {
                eventHandlers['disconnect'].forEach(handler => handler())
            }
        }
    }

    return mockSocket
}

const io = mockIO

import type {
    Message,
    RealTimeTranslation,
    VideoCallParticipant,
    ConnectionState
} from '../types'

export interface RoomEvents {
    'user-joined': (participant: VideoCallParticipant) => void
    'user-left': (userId: string) => void
    'message': (message: Message) => void
    'translation': (translation: RealTimeTranslation) => void
    'offer': (offer: RTCSessionDescriptionInit, fromUserId: string) => void
    'answer': (answer: RTCSessionDescriptionInit, fromUserId: string) => void
    'ice-candidate': (candidate: RTCIceCandidateInit, fromUserId: string) => void
    'participant-updated': (participant: VideoCallParticipant) => void
    'room-state': (state: ConnectionState) => void
}

export class SunAIRealTimeService {
    private socket: Socket | null = null
    private currentRoomId: string | null = null
    private userId: string
    private isConnected = false

    constructor(userId: string = this.generateUserId()) {
        this.userId = userId
    }

    private generateUserId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    async connect(serverUrl: string = 'http://localhost:3001'): Promise<void> {
        try {
            this.socket = io(serverUrl, {
                transports: ['websocket', 'polling']
            })

            return new Promise((resolve, reject) => {
                if (!this.socket) {
                    reject(new Error('Failed to create socket connection'))
                    return
                }

                this.socket.on('connect', () => {
                    this.isConnected = true
                    console.log('Connected to SunAI real-time server')
                    resolve()
                })

                this.socket.on('disconnect', () => {
                    this.isConnected = false
                    console.log('Disconnected from SunAI real-time server')
                })

                this.socket.on('connect_error', (error: any) => {
                    console.error('Connection error:', error)
                    reject(error)
                })
            })
        } catch (error) {
            throw new Error(`Failed to connect: ${error}`)
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
            this.isConnected = false
            this.currentRoomId = null
        }
    }

    async joinRoom(
        roomId: string,
        userInfo: {
            name: string
            language: string
        }
    ): Promise<void> {
        if (!this.socket || !this.isConnected) {
            throw new Error('Not connected to server')
        }

        return new Promise((resolve, reject) => {
            this.socket!.emit('join-room', {
                roomId,
                userId: this.userId,
                userInfo
            }, (response: { success: boolean; error?: string }) => {
                if (response.success) {
                    this.currentRoomId = roomId
                    resolve()
                } else {
                    reject(new Error(response.error || 'Failed to join room'))
                }
            })
        })
    }

    async leaveRoom(): Promise<void> {
        if (!this.socket || !this.currentRoomId) {
            return
        }

        return new Promise((resolve) => {
            this.socket!.emit('leave-room', {
                roomId: this.currentRoomId,
                userId: this.userId
            }, () => {
                this.currentRoomId = null
                resolve()
            })
        })
    }

    sendMessage(message: Message): void {
        if (!this.socket || !this.currentRoomId) {
            throw new Error('Not connected to a room')
        }

        this.socket.emit('send-message', {
            roomId: this.currentRoomId,
            userId: this.userId,
            message
        })
    }

    sendTranslation(translation: RealTimeTranslation): void {
        if (!this.socket || !this.currentRoomId) {
            throw new Error('Not connected to a room')
        }

        this.socket.emit('send-translation', {
            roomId: this.currentRoomId,
            userId: this.userId,
            translation
        })
    }

    sendWebRTCOffer(offer: RTCSessionDescriptionInit, targetUserId: string): void {
        if (!this.socket || !this.currentRoomId) {
            throw new Error('Not connected to a room')
        }

        this.socket.emit('webrtc-offer', {
            roomId: this.currentRoomId,
            fromUserId: this.userId,
            targetUserId,
            offer
        })
    }

    sendWebRTCAnswer(answer: RTCSessionDescriptionInit, targetUserId: string): void {
        if (!this.socket || !this.currentRoomId) {
            throw new Error('Not connected to a room')
        }

        this.socket.emit('webrtc-answer', {
            roomId: this.currentRoomId,
            fromUserId: this.userId,
            targetUserId,
            answer
        })
    }

    sendICECandidate(candidate: RTCIceCandidateInit, targetUserId: string): void {
        if (!this.socket || !this.currentRoomId) {
            throw new Error('Not connected to a room')
        }

        this.socket.emit('ice-candidate', {
            roomId: this.currentRoomId,
            fromUserId: this.userId,
            targetUserId,
            candidate
        })
    }

    updateParticipantInfo(info: Partial<VideoCallParticipant>): void {
        if (!this.socket || !this.currentRoomId) {
            throw new Error('Not connected to a room')
        }

        this.socket.emit('update-participant', {
            roomId: this.currentRoomId,
            userId: this.userId,
            info
        })
    }

    on<K extends keyof RoomEvents>(event: K, handler: RoomEvents[K]): void {
        if (!this.socket) {
            throw new Error('Not connected to server')
        }

        this.socket.on(event, handler)
    }

    off<K extends keyof RoomEvents>(event: K, handler?: RoomEvents[K]): void {
        if (!this.socket) return

        if (handler) {
            this.socket.off(event, handler)
        } else {
            this.socket.off(event)
        }
    }

    getCurrentRoomId(): string | null {
        return this.currentRoomId
    }

    getUserId(): string {
        return this.userId
    }

    isConnectedToServer(): boolean {
        return this.isConnected
    }

    isInRoom(): boolean {
        return !!this.currentRoomId
    }

    getConnectionState(): ConnectionState {
        return {
            isConnected: this.isConnected,
            participantCount: 0, // Would be updated by room events
            roomId: this.currentRoomId || '',
            quality: this.isConnected ? 'excellent' : 'poor',
            latency: 0 // Would be measured
        }
    }

    // Room management utilities
    generateRoomId(): string {
        return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    async createRoom(userInfo: { name: string; language: string }): Promise<string> {
        const roomId = this.generateRoomId()
        await this.joinRoom(roomId, userInfo)
        return roomId
    }

    // Typing indicators
    sendTypingStart(): void {
        if (!this.socket || !this.currentRoomId) return

        this.socket.emit('typing-start', {
            roomId: this.currentRoomId,
            userId: this.userId
        })
    }

    sendTypingStop(): void {
        if (!this.socket || !this.currentRoomId) return

        this.socket.emit('typing-stop', {
            roomId: this.currentRoomId,
            userId: this.userId
        })
    }

    // Language preferences
    updateLanguagePreference(language: string): void {
        if (!this.socket || !this.currentRoomId) return

        this.socket.emit('update-language', {
            roomId: this.currentRoomId,
            userId: this.userId,
            language
        })
    }

    // Connection quality monitoring
    async measureLatency(): Promise<number> {
        if (!this.socket || !this.isConnected) {
            return -1
        }

        return new Promise((resolve) => {
            const startTime = Date.now()

            this.socket!.emit('ping', startTime, (timestamp: number) => {
                const latency = Date.now() - timestamp
                resolve(latency)
            })
        })
    }

    // Real-time status updates
    sendStatusUpdate(status: {
        isVideoOn?: boolean
        isMuted?: boolean
        isScreenSharing?: boolean
        language?: string
    }): void {
        if (!this.socket || !this.currentRoomId) return

        this.socket.emit('status-update', {
            roomId: this.currentRoomId,
            userId: this.userId,
            status
        })
    }

    // File sharing (for future enhancement)
    async shareFile(file: File, participants: string[]): Promise<void> {
        if (!this.socket || !this.currentRoomId) {
            throw new Error('Not connected to a room')
        }

        // Convert file to base64 for transmission
        const base64 = await this.fileToBase64(file)

        this.socket.emit('share-file', {
            roomId: this.currentRoomId,
            userId: this.userId,
            participants,
            file: {
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64
            }
        })
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => {
                const result = reader.result as string
                const base64 = result.split(',')[1] // Remove data:type;base64, prefix
                resolve(base64)
            }
            reader.onerror = reject
        })
    }

    // Emergency disconnect
    emergencyDisconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
        this.isConnected = false
        this.currentRoomId = null
    }
}
