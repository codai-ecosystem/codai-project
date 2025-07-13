// Main type exports for METU
// This file consolidates all type definitions to avoid conflicts

// Voice Engine core types
export type {
    InterruptionContext,
    AudioProcessorConfig,
    VoiceActivityDetection
} from './voice'

// AI Integration types  
export type {
    AIConfig
} from './ai'

// Application types
export type {
    AppConfig,
    AppState,
    SystemMetrics,
    AppError,
    WindowState,
    NotificationData
} from './app'
