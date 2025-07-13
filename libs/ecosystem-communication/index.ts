/**
 * CODAI Ecosystem Communication Hub
 * Real-time cross-app communication and data synchronization
 */

export interface EcosystemMessage {
    id: string
    type: 'auth' | 'memory' | 'data' | 'notification' | 'system'
    source: 'codai' | 'memorai' | 'logai' | 'studiai' | 'fabricai' | 'bancai' | string
    target?: string | string[]
    payload: any
    timestamp: number
    priority: 'low' | 'medium' | 'high' | 'critical'
    requiresAck?: boolean
}

export interface EcosystemState {
    apps: {
        [appName: string]: {
            status: 'online' | 'offline' | 'maintenance'
            version: string
            health: number
            lastSeen: number
            metrics: {
                users: number
                cpu: number
                memory: number
                responseTime: number
            }
        }
    }
    messages: EcosystemMessage[]
    globalStats: {
        totalUsers: number
        totalRequests: number
        averageResponseTime: number
        systemHealth: number
    }
}

export class EcosystemCommunicationHub {
    private ws: WebSocket | null = null
    private messageQueue: EcosystemMessage[] = []
    private listeners: Map<string, Function[]> = new Map()
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private appId: string
    private apiKey: string

    constructor(appId: string, apiKey: string = 'dev-key') {
        this.appId = appId
        this.apiKey = apiKey
        this.connect()
    }

    private connect() {
        try {
            // In production, this would connect to a real WebSocket server
            // For development, we'll simulate with localStorage and events
            this.simulateConnection()
            this.setupEventListeners()
        } catch (error) {
            console.error('Failed to connect to ecosystem hub:', error)
            this.scheduleReconnect()
        }
    }

    private simulateConnection() {
        // Simulate WebSocket connection with localStorage for development
        this.ws = {
            readyState: 1, // OPEN
            send: (data: string) => {
                const message = JSON.parse(data)
                this.broadcastToOtherApps(message)
            },
            close: () => { },
            addEventListener: () => { },
            removeEventListener: () => { }
        } as any

        console.log(`🔗 ${this.appId} connected to ecosystem hub`)
        this.onConnect()
    }

    private setupEventListeners() {
        window.addEventListener('storage', (event) => {
            if (event.key === 'ecosystem-messages') {
                const messages = JSON.parse(event.newValue || '[]')
                const newMessages = messages.filter((msg: EcosystemMessage) =>
                    msg.target === this.appId ||
                    !msg.target ||
                    (Array.isArray(msg.target) && msg.target.includes(this.appId))
                )

                newMessages.forEach((message: EcosystemMessage) => {
                    this.handleMessage(message)
                })
            }
        })

        window.addEventListener('beforeunload', () => {
            this.updateAppStatus('offline')
        })
    }

    private broadcastToOtherApps(message: EcosystemMessage) {
        const existingMessages = JSON.parse(localStorage.getItem('ecosystem-messages') || '[]')
        existingMessages.push(message)

        // Keep only last 100 messages
        if (existingMessages.length > 100) {
            existingMessages.splice(0, existingMessages.length - 100)
        }

        localStorage.setItem('ecosystem-messages', JSON.stringify(existingMessages))

        // Trigger storage event for same-origin communication
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'ecosystem-messages',
            newValue: JSON.stringify(existingMessages)
        }))
    }

    private onConnect() {
        this.reconnectAttempts = 0
        this.updateAppStatus('online')
        this.flushMessageQueue()
        this.emit('connected', { appId: this.appId })
    }

    private scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            const delay = Math.pow(2, this.reconnectAttempts) * 1000
            setTimeout(() => this.connect(), delay)
        }
    }

    private flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift()
            if (message) {
                this.sendMessage(message)
            }
        }
    }

    private handleMessage(message: EcosystemMessage) {
        console.log(`📨 ${this.appId} received message:`, message)
        this.emit(message.type, message)
        this.emit('message', message)

        if (message.requiresAck) {
            this.sendAcknowledgment(message)
        }
    }

    private sendAcknowledgment(originalMessage: EcosystemMessage) {
        const ackMessage: EcosystemMessage = {
            id: `ack-${originalMessage.id}`,
            type: 'system',
            source: this.appId,
            target: originalMessage.source,
            payload: {
                type: 'acknowledgment',
                originalMessageId: originalMessage.id
            },
            timestamp: Date.now(),
            priority: 'low'
        }
        this.sendMessage(ackMessage)
    }

    public sendMessage(message: Omit<EcosystemMessage, 'id' | 'timestamp' | 'source'>) {
        const fullMessage: EcosystemMessage = {
            ...message,
            id: `${this.appId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: this.appId,
            timestamp: Date.now()
        }

        if (this.ws?.readyState === 1) {
            this.ws.send(JSON.stringify(fullMessage))
        } else {
            this.messageQueue.push(fullMessage)
        }
    }

    public updateAppStatus(status: 'online' | 'offline' | 'maintenance', metrics?: any) {
        const message: Omit<EcosystemMessage, 'id' | 'timestamp' | 'source'> = {
            type: 'system',
            payload: {
                type: 'status_update',
                status,
                metrics: metrics || this.getSystemMetrics(),
                version: '1.0.0'
            },
            priority: 'medium'
        }
        this.sendMessage(message)
    }

    private getSystemMetrics() {
        return {
            users: Math.floor(Math.random() * 1000) + 100,
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            responseTime: Math.random() * 100 + 10
        }
    }

    public requestEcosystemState(): Promise<EcosystemState> {
        return new Promise((resolve) => {
            const requestId = `state-request-${Date.now()}`

            const message: Omit<EcosystemMessage, 'id' | 'timestamp' | 'source'> = {
                type: 'system',
                payload: {
                    type: 'state_request',
                    requestId
                },
                priority: 'high',
                requiresAck: true
            }

            this.sendMessage(message)

            // Simulate response for development
            setTimeout(() => {
                const mockState: EcosystemState = {
                    apps: {
                        codai: { status: 'online', version: '1.0.0', health: 95, lastSeen: Date.now(), metrics: { users: 1250, cpu: 45, memory: 60, responseTime: 25 } },
                        memorai: { status: 'online', version: '1.0.0', health: 98, lastSeen: Date.now(), metrics: { users: 890, cpu: 30, memory: 45, responseTime: 15 } },
                        logai: { status: 'online', version: '1.0.0', health: 99, lastSeen: Date.now(), metrics: { users: 2100, cpu: 25, memory: 35, responseTime: 12 } }
                    },
                    messages: [],
                    globalStats: {
                        totalUsers: 4240,
                        totalRequests: 125000,
                        averageResponseTime: 17.3,
                        systemHealth: 97.3
                    }
                }
                resolve(mockState)
            }, 100)
        })
    }

    public on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event)?.push(callback)
    }

    public off(event: string, callback: Function) {
        const callbacks = this.listeners.get(event)
        if (callbacks) {
            const index = callbacks.indexOf(callback)
            if (index > -1) {
                callbacks.splice(index, 1)
            }
        }
    }

    private emit(event: string, data: any) {
        const callbacks = this.listeners.get(event)
        if (callbacks) {
            callbacks.forEach(callback => callback(data))
        }
    }

    public disconnect() {
        this.updateAppStatus('offline')
        this.ws?.close()
        this.ws = null
    }

    // Authentication integration
    public syncUserSession(userData: any) {
        const message: Omit<EcosystemMessage, 'id' | 'timestamp' | 'source'> = {
            type: 'auth',
            payload: {
                type: 'session_sync',
                user: userData,
                action: 'login'
            },
            priority: 'high'
        }
        this.sendMessage(message)
    }

    public broadcastLogout() {
        const message: Omit<EcosystemMessage, 'id' | 'timestamp' | 'source'> = {
            type: 'auth',
            payload: {
                type: 'session_sync',
                action: 'logout'
            },
            priority: 'high'
        }
        this.sendMessage(message)
    }

    // Memory system integration
    public shareMemory(memoryData: any) {
        const message: Omit<EcosystemMessage, 'id' | 'timestamp' | 'source'> = {
            type: 'memory',
            target: 'memorai',
            payload: {
                type: 'memory_share',
                data: memoryData
            },
            priority: 'medium'
        }
        this.sendMessage(message)
    }

    // Cross-app notifications
    public sendNotification(targetApp: string, notification: any) {
        const message: Omit<EcosystemMessage, 'id' | 'timestamp' | 'source'> = {
            type: 'notification',
            target: targetApp,
            payload: notification,
            priority: 'medium'
        }
        this.sendMessage(message)
    }

    // Real-time analytics
    public trackEvent(eventType: string, eventData: any) {
        const message: Omit<EcosystemMessage, 'id' | 'timestamp' | 'source'> = {
            type: 'data',
            payload: {
                type: 'analytics_event',
                eventType,
                data: eventData
            },
            priority: 'low'
        }
        this.sendMessage(message)
    }
}

// Export singleton instance for non-React usage
export const createEcosystemHub = (appId: string) => new EcosystemCommunicationHub(appId)
