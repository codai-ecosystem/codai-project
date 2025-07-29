/**
 * METU Database Schema - Enhanced CND Integration
 * 
 * Comprehensive data structures for user settings, conversation history,
 * session management, and real-time synchronization capabilities.
 */

// User Settings Schema - Enhanced
export interface UserSettings {
    id: string;
    assistantName: string;
    language: 'en' | 'ro';
    theme: 'light' | 'dark' | 'auto';
    voiceEnabled: boolean;
    voiceSettings: {
        speechRate: number;
        pitch: number;
        volume: number;
        voiceId?: string;
        provider: 'romai' | 'azure' | 'mock';
    };
    personality: 'friendly' | 'professional' | 'casual' | 'formal' | 'custom';
    customInstructions?: string;
    notifications: {
        enabled: boolean;
        sound: boolean;
        visual: boolean;
        desktop: boolean;
    };
    privacy: {
        saveConversations: boolean;
        analyticsEnabled: boolean;
        crashReporting: boolean;
        shareUsageData: boolean;
    };
    accessibility: {
        highContrast: boolean;
        largeText: boolean;
        screenReader: boolean;
        keyboardNavigation: boolean;
    };
    lastActive: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Conversation Message Schema - Enhanced
export interface ConversationMessage {
    id: string;
    conversationId: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    metadata: {
        audioData?: {
            duration: number;
            volume: number;
            quality: 'low' | 'medium' | 'high';
            format: 'wav' | 'mp3' | 'opus';
            base64?: string;
        };
        processingTime?: number;
        confidence?: number;
        interrupted?: boolean;
        language?: 'en' | 'ro';
        emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'concerned';
        intent?: string;
        entities?: Array<{
            type: string;
            value: string;
            confidence: number;
        }>;
    };
    timestamp: Date;
    editedAt?: Date;
    reactions?: Array<{
        type: 'like' | 'dislike' | 'helpful' | 'unhelpful';
        timestamp: Date;
    }>;
}

// Conversation Session Schema
export interface ConversationSession {
    id: string;
    userId: string;
    title?: string;
    startTime: Date;
    endTime?: Date;
    language: string;
    messageCount: number;
    totalDuration: number; // in seconds
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    metadata: Record<string, any>;
    isActive: boolean;
    lastMessageAt: Date;
}

// Assistant Configuration Schema
export interface AssistantConfig {
    id: string;
    userId: string;
    name: string;
    displayName: string;
    personality: string;
    voiceSettings: Record<string, any>;
    capabilities: string[];
    instructions: string;
    createdAt: Date;
    updatedAt: Date;
}

// Voice Profile Schema
export interface VoiceProfile {
    id: string;
    userId: string;
    name: string;
    provider: 'romai' | 'azure' | 'mock';
    voiceId: string;
    language: string;
    settings: Record<string, any>;
    isDefault: boolean;
    isActive: boolean;
    metadata: Record<string, any>;
    voiceCharacteristics: Record<string, any>;
    speakingPatterns: Record<string, any>;
    recognitionAccuracy: number;
    lastUsed: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Server Session Schema
export interface ServerSession {
    id: string;
    userId: string;
    deviceId: string;
    deviceType: 'desktop' | 'mobile' | 'web';
    deviceInfo: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    startTime: Date;
    lastActivity: Date;
    isActive: boolean;
    expiresAt: Date;
}

// Schema version for migration purposes
export const SCHEMA_VERSION = '2.0.0';

// Default user settings
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt' | 'lastActive'> = {
    assistantName: 'METU',
    language: 'en',
    theme: 'dark',
    voiceEnabled: true,
    voiceSettings: {
        speechRate: 1.0,
        pitch: 1.0,
        volume: 0.8,
        provider: 'romai',
    },
    personality: 'friendly',
    notifications: {
        enabled: true,
        sound: true,
        visual: true,
        desktop: true,
    },
    privacy: {
        saveConversations: true,
        analyticsEnabled: true,
        crashReporting: true,
        shareUsageData: false,
    },
    accessibility: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        keyboardNavigation: true,
    },
};

// Database validation rules
export const VALIDATION_RULES = {
    USER_ID_LENGTH: { min: 8, max: 64 },
    ASSISTANT_NAME_LENGTH: { min: 1, max: 50 },
    CONVERSATION_TITLE_LENGTH: { min: 1, max: 200 },
    MESSAGE_CONTENT_LENGTH: { min: 1, max: 10000 },
    VOICE_RATE_RANGE: { min: 0.1, max: 3.0 },
    VOICE_PITCH_RANGE: { min: 0.1, max: 2.0 },
    VOICE_VOLUME_RANGE: { min: 0.0, max: 1.0 },
    CUSTOM_INSTRUCTIONS_LENGTH: { min: 0, max: 2000 },
} as const;

// Database indexes for optimization
export const DATABASE_INDEXES = {
    users: ['id', 'lastActive'],
    conversations: ['userId', 'isActive', 'lastMessageAt'],
    messages: ['conversationId', 'timestamp', 'type'],
    voiceProfiles: ['userId', 'isDefault', 'language'],
    sessions: ['userId', 'isActive', 'lastActivity'],
} as const;
