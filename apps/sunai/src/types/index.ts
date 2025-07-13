// SunAI Types
export interface Message {
    id: string
    content: string
    translation?: string
    language: string
    timestamp: Date
    isUser: boolean
    type?: 'text' | 'voice' | 'translation'
}

export interface TranslationSettings {
    sourceLanguage: string
    targetLanguage: string
    autoTranslate: boolean
    showOriginal: boolean
    autoPlayTranslation?: boolean
}

export interface CallState {
    isInCall: boolean
    isMuted: boolean
    isVideoOn: boolean
    isScreenSharing: boolean
    participants: number
}

export interface Language {
    code: string
    name: string
    nativeName?: string
    flag?: string
}

export interface TranslationResult {
    text: string
    confidence: number
    sourceLanguage: string
    targetLanguage: string
    processingTime: number
}

export interface VoiceSettings {
    isListening: boolean
    language: string
    continuous: boolean
    interimResults: boolean
}

export interface VideoCallParticipant {
    id: string
    name: string
    isVideoOn: boolean
    isMuted: boolean
    language: string
    stream?: MediaStream
}

export interface RealTimeTranslation {
    originalText: string
    translatedText: string
    sourceLanguage: string
    targetLanguage: string
    timestamp: Date
    confidence: number
    participantId: string
}

export interface ConnectionState {
    isConnected: boolean
    participantCount: number
    roomId: string
    quality: 'excellent' | 'good' | 'fair' | 'poor'
    latency: number
}

export type VideoQuality = 'excellent' | 'good' | 'fair' | 'poor'

export interface VideoCallState {
    isActive: boolean
    hasVideo: boolean
    hasAudio: boolean
    isVideoMuted: boolean
    isAudioMuted: boolean
    participantCount: number
    duration: number
    quality: VideoQuality
}

export interface MediaStreamState {
    hasVideo: boolean
    hasAudio: boolean
    videoEnabled: boolean
    audioEnabled: boolean
    videoDeviceId: string
    audioDeviceId: string
    resolution: {
        width: number
        height: number
    } | null
}
