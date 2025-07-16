import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { parse } from 'url'

// Type definition for WebSocket with custom properties
type ExtendedWebSocket = any // Use any for ws library compatibility

// WebSocket message types
export enum MessageType {
    AUTHENTICATION = 'authentication',
    PING = 'ping',
    PONG = 'pong',
    DATASET_UPDATE = 'dataset_update',
    FILE_UPLOAD_PROGRESS = 'file_upload_progress',
    AI_ANALYSIS_PROGRESS = 'ai_analysis_progress',
    STORAGE_USAGE_UPDATE = 'storage_usage_update',
    SYSTEM_STATUS = 'system_status',
    ERROR = 'error',
    SUCCESS = 'success',
    NOTIFICATION = 'notification',
    REALTIME_ANALYTICS = 'realtime_analytics',
    USER_ACTIVITY = 'user_activity',
    COLLABORATION_EVENT = 'collaboration_event',
    SYNC_REQUEST = 'sync_request',
    SYNC_RESPONSE = 'sync_response'
}

// WebSocket message interface
export interface WebSocketMessage {
    id: string
    type: MessageType
    payload: any
    timestamp: number
    userId?: string
    sessionId?: string
    metadata?: Record<string, any>
}

// Connection state
export interface ConnectionState {
    userId: string
    sessionId: string
    authenticatedAt: number
    lastActivity: number
    subscriptions: Set<string>
    metadata: Record<string, any>
}

// Real-time analytics data
export interface RealtimeAnalytics {
    activeUsers: number
    activeConnections: number
    datasetOperations: number
    storageUsage: {
        used: number
        total: number
        percentage: number
    }
    performanceMetrics: {
        averageResponseTime: number
        throughput: number
        errorRate: number
    }
    systemHealth: {
        cpu: number
        memory: number
        disk: number
        status: 'healthy' | 'warning' | 'critical'
    }
}

// WebSocket event handlers
export interface WebSocketEventHandlers {
    onAuthentication: (ws: any, message: WebSocketMessage) => Promise<void>
    onDatasetUpdate: (ws: any, message: WebSocketMessage) => Promise<void>
    onFileUploadProgress: (ws: any, message: WebSocketMessage) => Promise<void>
    onAIAnalysisProgress: (ws: any, message: WebSocketMessage) => Promise<void>
    onSync: (ws: any, message: WebSocketMessage) => Promise<void>
    onCollaboration: (ws: any, message: WebSocketMessage) => Promise<void>
    onError: (ws: any, error: Error) => void
    onDisconnect: (ws: any, code: number, reason: string) => void
}

// Advanced WebSocket server with real-time capabilities
export class STOCAIWebSocketServer {
    private server: WebSocketServer
    private connections: Map<string, any> = new Map()
    private connectionStates: Map<string, ConnectionState> = new Map()
    private subscriptions: Map<string, Set<string>> = new Map()
    private eventHandlers: Partial<WebSocketEventHandlers> = {}
    private analytics: RealtimeAnalytics
    private heartbeatInterval: NodeJS.Timeout | null = null
    private analyticsInterval: NodeJS.Timeout | null = null

    constructor(port: number = 8080, options: any = {}) {
        this.server = new WebSocketServer({
            port,
            perMessageDeflate: true,
            ...options
        })

        this.analytics = {
            activeUsers: 0,
            activeConnections: 0,
            datasetOperations: 0,
            storageUsage: { used: 0, total: 0, percentage: 0 },
            performanceMetrics: { averageResponseTime: 0, throughput: 0, errorRate: 0 },
            systemHealth: { cpu: 0, memory: 0, disk: 0, status: 'healthy' }
        }

        this.initializeServer()
        this.startHeartbeat()
        this.startAnalytics()
    }

    // Initialize WebSocket server
    private initializeServer(): void {
        this.server.on('connection', (ws: any, request) => {
            const connectionId = this.generateConnectionId()
            const url = parse(request.url || '', true)

            // Store connection
            this.connections.set(connectionId, ws)

            // Initialize connection state
            this.connectionStates.set(connectionId, {
                userId: '',
                sessionId: connectionId,
                authenticatedAt: 0,
                lastActivity: Date.now(),
                subscriptions: new Set(),
                metadata: {
                    ip: request.socket.remoteAddress,
                    userAgent: request.headers['user-agent'],
                    query: url.query
                }
            })

            // Add custom properties to WebSocket
            ws.connectionId = connectionId
            ws.isAlive = true

            // Handle incoming messages
            ws.on('message', (data: any) => {
                this.handleMessage(ws, data)
            })

            // Handle pong responses
            ws.on('pong', () => {
                ws.isAlive = true
                this.updateLastActivity(connectionId)
            })

            // Handle connection close
            ws.on('close', (code: number, reason: Buffer) => {
                this.handleDisconnect(ws, code, reason.toString())
            })

            // Handle errors
            ws.on('error', (error: Error) => {
                this.handleError(ws, error)
            })

            // Send welcome message
            this.sendMessage(ws, {
                id: this.generateMessageId(),
                type: MessageType.SUCCESS,
                payload: { message: 'Connected to STOCAI WebSocket server' },
                timestamp: Date.now(),
                sessionId: connectionId
            })

            this.updateAnalytics()
        })

        this.server.on('error', (error) => {
            console.error('WebSocket server error:', error)
        })
    }

    // Handle incoming messages
    private async handleMessage(ws: any, data: any): Promise<void> {
        try {
            const message: WebSocketMessage = JSON.parse(data.toString())
            const connectionId = ws.connectionId

            // Update last activity
            this.updateLastActivity(connectionId)

            // Validate message format
            if (!this.isValidMessage(message)) {
                this.sendError(ws, 'Invalid message format')
                return
            }

            // Handle different message types
            switch (message.type) {
                case MessageType.AUTHENTICATION:
                    await this.handleAuthentication(ws, message)
                    break

                case MessageType.PING:
                    this.sendMessage(ws, {
                        id: this.generateMessageId(),
                        type: MessageType.PONG,
                        payload: { timestamp: Date.now() },
                        timestamp: Date.now()
                    })
                    break

                case MessageType.DATASET_UPDATE:
                    await this.handleDatasetUpdate(ws, message)
                    break

                case MessageType.FILE_UPLOAD_PROGRESS:
                    await this.handleFileUploadProgress(ws, message)
                    break

                case MessageType.AI_ANALYSIS_PROGRESS:
                    await this.handleAIAnalysisProgress(ws, message)
                    break

                case MessageType.SYNC_REQUEST:
                    await this.handleSyncRequest(ws, message)
                    break

                case MessageType.COLLABORATION_EVENT:
                    await this.handleCollaborationEvent(ws, message)
                    break

                case MessageType.REALTIME_ANALYTICS:
                    this.sendAnalytics(ws)
                    break

                default:
                    this.sendError(ws, `Unknown message type: ${message.type}`)
            }

            // Call custom event handler if registered
            const handlerName = `on${message.type.charAt(0).toUpperCase() + message.type.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase())}` as keyof WebSocketEventHandlers
            if (this.eventHandlers[handlerName]) {
                await (this.eventHandlers[handlerName] as any)(ws, message)
            }

        } catch (error) {
            this.sendError(ws, 'Failed to process message')
            console.error('Message handling error:', error)
        }
    }

    // Handle authentication
    private async handleAuthentication(ws: any, message: WebSocketMessage): Promise<void> {
        const { token, userId } = message.payload

        // Validate authentication token (implement your auth logic)
        const isValid = await this.validateAuthToken(token)

        if (isValid) {
            const connectionState = this.connectionStates.get(ws.connectionId)
            if (connectionState) {
                connectionState.userId = userId
                connectionState.authenticatedAt = Date.now()
            }

            this.sendMessage(ws, {
                id: this.generateMessageId(),
                type: MessageType.SUCCESS,
                payload: { message: 'Authentication successful', userId },
                timestamp: Date.now()
            })

            // Send initial analytics
            this.sendAnalytics(ws)
        } else {
            this.sendError(ws, 'Authentication failed')
        }
    }

    // Handle dataset updates
    private async handleDatasetUpdate(ws: any, message: WebSocketMessage): Promise<void> {
        const { datasetId, operation, data } = message.payload

        // Broadcast dataset update to subscribed clients
        this.broadcastToSubscribers(`dataset:${datasetId}`, {
            id: this.generateMessageId(),
            type: MessageType.DATASET_UPDATE,
            payload: { datasetId, operation, data },
            timestamp: Date.now()
        })

        this.analytics.datasetOperations++
    }

    // Handle file upload progress
    private async handleFileUploadProgress(ws: any, message: WebSocketMessage): Promise<void> {
        const { fileId, progress, status } = message.payload

        // Broadcast progress to relevant clients
        this.broadcastToSubscribers(`file:${fileId}`, {
            id: this.generateMessageId(),
            type: MessageType.FILE_UPLOAD_PROGRESS,
            payload: { fileId, progress, status },
            timestamp: Date.now()
        })
    }

    // Handle AI analysis progress
    private async handleAIAnalysisProgress(ws: any, message: WebSocketMessage): Promise<void> {
        const { analysisId, progress, status, result } = message.payload

        // Broadcast analysis progress
        this.broadcastToSubscribers(`analysis:${analysisId}`, {
            id: this.generateMessageId(),
            type: MessageType.AI_ANALYSIS_PROGRESS,
            payload: { analysisId, progress, status, result },
            timestamp: Date.now()
        })
    }

    // Handle sync requests
    private async handleSyncRequest(ws: any, message: WebSocketMessage): Promise<void> {
        const { resource, lastSyncTimestamp } = message.payload

        // Get updates since last sync
        const updates = await this.getUpdates(resource, lastSyncTimestamp)

        this.sendMessage(ws, {
            id: this.generateMessageId(),
            type: MessageType.SYNC_RESPONSE,
            payload: { resource, updates, timestamp: Date.now() },
            timestamp: Date.now()
        })
    }

    // Handle collaboration events
    private async handleCollaborationEvent(ws: any, message: WebSocketMessage): Promise<void> {
        const { resourceId, event, userId } = message.payload

        // Broadcast collaboration event to other users
        this.broadcastToSubscribers(`collaboration:${resourceId}`, {
            id: this.generateMessageId(),
            type: MessageType.COLLABORATION_EVENT,
            payload: { resourceId, event, userId },
            timestamp: Date.now()
        }, ws.connectionId) // Exclude sender
    }

    // Send message to specific client
    private sendMessage(ws: any, message: WebSocketMessage): void {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(message))
        }
    }

    // Send error message
    private sendError(ws: any, error: string): void {
        this.sendMessage(ws, {
            id: this.generateMessageId(),
            type: MessageType.ERROR,
            payload: { error },
            timestamp: Date.now()
        })
    }

    // Send analytics data
    private sendAnalytics(ws: any): void {
        this.sendMessage(ws, {
            id: this.generateMessageId(),
            type: MessageType.REALTIME_ANALYTICS,
            payload: this.analytics,
            timestamp: Date.now()
        })
    }

    // Broadcast to subscribers
    private broadcastToSubscribers(subscription: string, message: WebSocketMessage, excludeConnectionId?: string): void {
        const subscribers = this.subscriptions.get(subscription) || new Set()

        subscribers.forEach(connectionId => {
            if (connectionId !== excludeConnectionId) {
                const ws = this.connections.get(connectionId)
                if (ws) {
                    this.sendMessage(ws, message)
                }
            }
        })
    }

    // Broadcast to all connected clients
    public broadcast(message: WebSocketMessage): void {
        this.connections.forEach((ws, connectionId) => {
            this.sendMessage(ws, message)
        })
    }

    // Subscribe client to topic
    public subscribe(connectionId: string, topic: string): void {
        if (!this.subscriptions.has(topic)) {
            this.subscriptions.set(topic, new Set())
        }
        this.subscriptions.get(topic)!.add(connectionId)

        const connectionState = this.connectionStates.get(connectionId)
        if (connectionState) {
            connectionState.subscriptions.add(topic)
        }
    }

    // Unsubscribe client from topic
    public unsubscribe(connectionId: string, topic: string): void {
        const subscribers = this.subscriptions.get(topic)
        if (subscribers) {
            subscribers.delete(connectionId)
            if (subscribers.size === 0) {
                this.subscriptions.delete(topic)
            }
        }

        const connectionState = this.connectionStates.get(connectionId)
        if (connectionState) {
            connectionState.subscriptions.delete(topic)
        }
    }

    // Register event handler
    public on<K extends keyof WebSocketEventHandlers>(event: K, handler: WebSocketEventHandlers[K]): void {
        this.eventHandlers[event] = handler
    }

    // Handle disconnection
    private handleDisconnect(ws: any, code: number, reason: string): void {
        const connectionId = ws.connectionId

        // Remove from subscriptions
        const connectionState = this.connectionStates.get(connectionId)
        if (connectionState) {
            connectionState.subscriptions.forEach(topic => {
                this.unsubscribe(connectionId, topic)
            })
        }

        // Clean up connection
        this.connections.delete(connectionId)
        this.connectionStates.delete(connectionId)

        // Update analytics
        this.updateAnalytics()

        // Call custom disconnect handler
        if (this.eventHandlers.onDisconnect) {
            this.eventHandlers.onDisconnect(ws, code, reason)
        }
    }

    // Handle errors
    private handleError(ws: any, error: Error): void {
        console.error('WebSocket error:', error)

        if (this.eventHandlers.onError) {
            this.eventHandlers.onError(ws, error)
        }
    }

    // Start heartbeat mechanism
    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            this.connections.forEach((ws, connectionId) => {
                if (!ws.isAlive) {
                    ws.terminate()
                    this.connections.delete(connectionId)
                    this.connectionStates.delete(connectionId)
                    return
                }

                ws.isAlive = false
                ws.ping()
            })
        }, 30000) // 30 seconds
    }

    // Start analytics updates
    private startAnalytics(): void {
        this.analyticsInterval = setInterval(() => {
            this.updateAnalytics()
            this.broadcastAnalytics()
        }, 5000) // 5 seconds
    }

    // Update analytics
    private updateAnalytics(): void {
        const now = Date.now()
        const activeConnections = this.connections.size
        const authenticatedUsers = Array.from(this.connectionStates.values())
            .filter(state => state.authenticatedAt > 0).length

        this.analytics.activeConnections = activeConnections
        this.analytics.activeUsers = authenticatedUsers

        // Update system health (mock data - implement real monitoring)
        this.analytics.systemHealth = {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            disk: Math.random() * 100,
            status: activeConnections > 100 ? 'warning' : 'healthy'
        }
    }

    // Broadcast analytics to all clients
    private broadcastAnalytics(): void {
        this.broadcast({
            id: this.generateMessageId(),
            type: MessageType.REALTIME_ANALYTICS,
            payload: this.analytics,
            timestamp: Date.now()
        })
    }

    // Utility methods
    private generateConnectionId(): string {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private updateLastActivity(connectionId: string): void {
        const connectionState = this.connectionStates.get(connectionId)
        if (connectionState) {
            connectionState.lastActivity = Date.now()
        }
    }

    private isValidMessage(message: any): boolean {
        return message &&
            typeof message.id === 'string' &&
            typeof message.type === 'string' &&
            typeof message.timestamp === 'number' &&
            message.payload !== undefined
    }

    private async validateAuthToken(token: string): Promise<boolean> {
        // Implement your authentication logic here
        // This is a mock implementation
        return !!(token && token.length > 0)
    }

    private async getUpdates(resource: string, lastSyncTimestamp: number): Promise<any[]> {
        // Implement your sync logic here
        // This is a mock implementation
        return []
    }

    // Get connection statistics
    public getConnectionStats(): any {
        return {
            totalConnections: this.connections.size,
            authenticatedUsers: Array.from(this.connectionStates.values())
                .filter(state => state.authenticatedAt > 0).length,
            totalSubscriptions: Array.from(this.subscriptions.values())
                .reduce((total, subscribers) => total + subscribers.size, 0),
            analytics: this.analytics
        }
    }

    // Shutdown server
    public shutdown(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
        }

        if (this.analyticsInterval) {
            clearInterval(this.analyticsInterval)
        }

        // Close all connections
        this.connections.forEach(ws => {
            ws.close(1000, 'Server shutdown')
        })

        // Close server
        this.server.close()
    }
}

// Client-side WebSocket manager
export class STOCAIWebSocketClient {
    private ws: WebSocket | null = null
    private url: string
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000
    private eventHandlers: Map<MessageType, Function[]> = new Map()
    private isConnected = false
    private pingInterval: NodeJS.Timeout | null = null

    constructor(url: string) {
        this.url = url
    }

    // Connect to WebSocket server
    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url)

                this.ws.onopen = () => {
                    this.isConnected = true
                    this.reconnectAttempts = 0
                    this.startPing()
                    resolve()
                }

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data)
                }

                this.ws.onclose = () => {
                    this.isConnected = false
                    this.stopPing()
                    this.attemptReconnect()
                }

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error)
                    if (!this.isConnected) {
                        reject(error)
                    }
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    // Send message to server
    public send(type: MessageType, payload: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message: WebSocketMessage = {
                id: this.generateMessageId(),
                type,
                payload,
                timestamp: Date.now()
            }

            this.ws.send(JSON.stringify(message))
        }
    }

    // Handle incoming messages
    private handleMessage(data: string): void {
        try {
            const message: WebSocketMessage = JSON.parse(data)
            const handlers = this.eventHandlers.get(message.type) || []

            handlers.forEach(handler => {
                handler(message.payload, message)
            })
        } catch (error) {
            console.error('Failed to parse message:', error)
        }
    }

    // Register event handler
    public on(type: MessageType, handler: Function): void {
        if (!this.eventHandlers.has(type)) {
            this.eventHandlers.set(type, [])
        }
        this.eventHandlers.get(type)!.push(handler)
    }

    // Authenticate with server
    public authenticate(token: string, userId: string): void {
        this.send(MessageType.AUTHENTICATION, { token, userId })
    }

    // Start ping mechanism
    private startPing(): void {
        this.pingInterval = setInterval(() => {
            if (this.isConnected) {
                this.send(MessageType.PING, {})
            }
        }, 30000) // 30 seconds
    }

    // Stop ping mechanism
    private stopPing(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval)
            this.pingInterval = null
        }
    }

    // Attempt to reconnect
    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++

            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
                this.connect().catch(() => {
                    // Will try again if connection fails
                })
            }, this.reconnectDelay * this.reconnectAttempts)
        }
    }

    // Generate message ID
    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Disconnect
    public disconnect(): void {
        this.stopPing()
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect')
        }
        this.isConnected = false
    }

    // Get connection status
    public getConnectionStatus(): boolean {
        return this.isConnected
    }
}

// Export default server instance
export default STOCAIWebSocketServer
