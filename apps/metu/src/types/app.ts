// Application Types
export interface AppConfig {
    voice: VoiceConfig
    ai: AIConfig
    ui: UIConfig
    system: SystemConfig
    performance: PerformanceConfig
}

export interface UIConfig {
    theme: 'light' | 'dark' | 'system'
    accentColor: string
    fontSize: 'small' | 'medium' | 'large'
    animations: boolean
    transparency: number
    alwaysOnTop: boolean
    showInTaskbar: boolean
    minimizeToTray: boolean
    startMinimized: boolean
}

export interface SystemConfig {
    autoStart: boolean
    hotkeys: {
        toggleListening: string
        showHide: string
        stopSpeaking: string
        newConversation: string
    }
    notifications: {
        enabled: boolean
        sound: boolean
        position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    }
    privacy: {
        saveConversations: boolean
        cloudSync: boolean
        analytics: boolean
        crashReports: boolean
    }
}

export interface PerformanceConfig {
    maxMemoryUsage: number // MB
    maxCpuUsage: number // percentage
    audioBitrate: number
    videoAcceleration: boolean
    lowPowerMode: boolean
    backgroundProcessing: boolean
}

export interface AppState {
    isInitialized: boolean
    isConnected: boolean
    currentView: 'conversation' | 'settings' | 'history' | 'help'
    conversationState: ConversationFlow
    voiceState: VoiceEngineStatus
    systemMetrics: SystemMetrics
    errors: AppError[]
}

export interface SystemMetrics {
    memoryUsage: number
    cpuUsage: number
    networkLatency: number
    audioLatency: number
    responseTime: number
    uptime: number
    conversationCount: number
    errorCount: number
}

export interface AppError {
    id: string
    type: 'voice' | 'ai' | 'network' | 'system' | 'ui'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    details?: string
    timestamp: number
    resolved: boolean
}

// Window and UI Types
export interface WindowState {
    isVisible: boolean
    isMinimized: boolean
    isMaximized: boolean
    bounds: {
        x: number
        y: number
        width: number
        height: number
    }
    opacity: number
}

export interface NotificationData {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    duration?: number
    actions?: Array<{
        label: string
        action: () => void
    }>
}

// Event Types
export type AppEvent =
    | { type: 'app-initialized' }
    | { type: 'app-shutdown' }
    | { type: 'voice-status-changed'; data: VoiceEngineStatus }
    | { type: 'conversation-started'; sessionId: string }
    | { type: 'conversation-ended'; sessionId: string }
    | { type: 'message-received'; message: ConversationMessage }
    | { type: 'message-sent'; message: ConversationMessage }
    | { type: 'error-occurred'; error: AppError }
    | { type: 'settings-changed'; settings: Partial<AppConfig> }
    | { type: 'window-state-changed'; state: WindowState }

// Import external types
import type { VoiceConfig, VoiceEngineStatus } from './voice'
import type { AIConfig, ConversationMessage, ConversationFlow } from './ai'
