// Voice Engine Types

// Basic voice state types
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

// Voice message interface
export interface VoiceMessage {
    id: string;
    text: string;
    timestamp: Date;
    type: 'user' | 'assistant';
}

// Voice settings interface
export interface VoiceSettings {
    language: string;
    volume: number;
    rate: number;
    pitch: number;
    enabled: boolean;
}

export interface VoiceConfig {
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    sampleRate: number
    channels: number
    bitDepth: number
    maxLatency: number
    recognitionAccuracy: number
    interruptionDetectionTime: number
}

export interface VoiceEngineStatus {
    isListening: boolean
    isSpeaking: boolean
    isProcessing: boolean
    isConnected: boolean
    volume: number
    error?: string
}

export interface SpeechRecognitionResult {
    transcript: string
    confidence: number
    isFinal: boolean
    timestamp: number
    alternatives?: Array<{
        transcript: string
        confidence: number
    }>
}

export interface VoiceInterruption {
    timestamp: number
    userInput: string
    aiResponse: string
    contextPreserved: boolean
    interruptionType: 'polite' | 'urgent' | 'correction' | 'question'
}

export interface InterruptionContext {
    currentSpeech: string
    timeElapsed: number
    userInput: string
    priority: number
    shouldInterrupt: boolean
    preservedContext?: string
}

export interface AudioStreamConfig {
    inputDeviceId?: string
    outputDeviceId?: string
    echoCancellation: boolean
    noiseSuppression: boolean
    autoGainControl: boolean
    sampleRate: number
    bufferSize: number
}

export interface VoiceActivityDetection {
    isActive: boolean
    confidence: number
    volume: number
    speechProbability: number
}

export interface AudioProcessorConfig {
    sampleRate: number
    echoCancellation: boolean
    noiseSuppression: boolean
    autoGainControl: boolean
    inputGain: number
    outputGain: number
    compressionThreshold: number
    compressionRatio: number
    highpassFrequency: number
    lowpassFrequency: number
    delayTime: number
}

// Speech Synthesis Types
export interface TextToSpeechConfig {
    voice: string
    rate: number
    pitch: number
    volume: number
    language: string
    style?: 'neutral' | 'cheerful' | 'excited' | 'friendly' | 'hopeful' | 'sad'
}

export interface SpeechSynthesisResult {
    success: boolean
    duration: number
    audioData?: ArrayBuffer
    error?: string
}

// Voice Engine Events
export type VoiceEngineEvent =
    | { type: 'listening-started' }
    | { type: 'listening-stopped' }
    | { type: 'speech-detected'; data: SpeechRecognitionResult }
    | { type: 'speech-ended' }
    | { type: 'speaking-started'; text: string }
    | { type: 'speaking-stopped' }
    | { type: 'interruption-detected'; data: VoiceInterruption }
    | { type: 'error'; error: string }
    | { type: 'status-changed'; status: VoiceEngineStatus }

export interface VoiceEngine {
    config: VoiceConfig
    status: VoiceEngineStatus
    startContinuousListening(): Promise<void>
    stopListening(): Promise<void>
    speak(text: string, options?: Partial<TextToSpeechConfig>): Promise<void>
    stopSpeaking(): Promise<void>
    processUserInput(input: string): Promise<void>
    on(event: string, callback: (data?: any) => void): void
    off(event: string, callback: (data?: any) => void): void
    destroy(): Promise<void>
}
