import type {
    VoiceConfig,
    SpeechRecognitionResult as VoiceSpeechResult
} from '@/types/voice'

// Web Speech API type definitions
interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
}

interface SpeechRecognitionResult {
    readonly length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
    isFinal: boolean
}

interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number
    readonly results: SpeechRecognitionResultList
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    grammars: any
    interimResults: boolean
    lang: string
    maxAlternatives: number
    serviceURI: string
    start(): void
    stop(): void
    abort(): void
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null
    onend: ((this: SpeechRecognition, ev: Event) => any) | null
    onerror: ((this: SpeechRecognition, ev: any) => any) | null
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition
    prototype: SpeechRecognition
}

/**
 * Advanced Speech Recognition Engine with Continuous Listening
 * 
 * Features:
 * - Continuous recognition even during AI speech
 * - High accuracy with confidence scoring
 * - Interim results for interruption detection
 * - Web Speech API + Azure Speech Services fallback
 */
export class SpeechRecognitionEngine {
    private recognition: SpeechRecognition | null = null
    private config: VoiceConfig
    private eventListeners: Map<string, Array<(data?: any) => void>>
    private isActive = false
    private lastResult: VoiceSpeechResult | null = null
    private accuracyScore = 0
    private startTime = 0

    constructor(config: VoiceConfig) {
        this.config = config
        this.eventListeners = new Map()
        this.startTime = Date.now()
    }

    /**
     * Initialize speech recognition with fallback support
     */
    async initialize(): Promise<void> {
        try {
            console.log('🎯 Initializing Speech Recognition...')

            // Try Web Speech API first
            if (this.isSpeechRecognitionSupported()) {
                await this.initializeWebSpeechAPI()
                console.log('✅ Web Speech API initialized')
            } else {
                console.log('⚠️ Web Speech API not available, using Azure fallback')
                await this.initializeAzureSpeech()
            }

        } catch (error) {
            console.error('❌ Failed to initialize speech recognition:', error)
            throw error
        }
    }

    /**
     * Check if Speech Recognition is supported
     */
    private isSpeechRecognitionSupported(): boolean {
        return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    }

    /**
     * Initialize Web Speech API
     */
    private async initializeWebSpeechAPI(): Promise<void> {
        const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognitionClass) {
            throw new Error('Speech Recognition not supported')
        }

        this.recognition = new SpeechRecognitionClass()

        if (!this.recognition) {
            throw new Error('Failed to create Speech Recognition instance')
        }

        // Configure recognition
        this.recognition.continuous = this.config.continuous
        this.recognition.interimResults = this.config.interimResults
        this.recognition.maxAlternatives = this.config.maxAlternatives
        this.recognition.lang = 'en-US' // TODO: Make configurable

        // Setup event handlers
        this.recognition.onstart = () => {
            console.log('🎙️ Speech recognition started')
            this.isActive = true
        }

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            this.handleRecognitionResult(event)
        }

        this.recognition.onerror = (event: any) => {
            console.error('🚫 Speech recognition error:', event.error)
            this.emit('error', event.error)
        }

        this.recognition.onend = () => {
            console.log('🔚 Speech recognition ended')
            this.isActive = false

            // Restart if we're in continuous mode
            if (this.config.continuous) {
                setTimeout(() => this.restart(), 100)
            }
        }
    }

    /**
     * Initialize Azure Speech Services (fallback)
     */
    private async initializeAzureSpeech(): Promise<void> {
        // TODO: Implement Azure Speech SDK integration
        console.log('🔄 Azure Speech initialization would go here')
        throw new Error('Azure Speech not implemented yet')
    }

    /**
     * Start continuous recognition
     */
    async startContinuous(): Promise<void> {
        if (!this.recognition) {
            throw new Error('Speech recognition not initialized')
        }

        try {
            this.recognition.start()
            console.log('🔄 Continuous speech recognition started')
        } catch (error) {
            // If already started, that's ok
            if (error instanceof Error && error.message.includes('already started')) {
                console.log('ℹ️ Speech recognition already active')
                return
            }
            throw error
        }
    }

    /**
     * Stop recognition
     */
    async stop(): Promise<void> {
        if (this.recognition && this.isActive) {
            this.recognition.stop()
            this.isActive = false
        }
    }

    /**
     * Restart recognition (for continuous mode)
     */
    private async restart(): Promise<void> {
        if (this.config.continuous && !this.isActive) {
            try {
                await this.startContinuous()
            } catch (error) {
                console.error('❌ Failed to restart recognition:', error)
                // Try again after a longer delay
                setTimeout(() => this.restart(), 1000)
            }
        }
    }

    /**
     * Handle recognition results
     */
    private handleRecognitionResult(event: SpeechRecognitionEvent): void {
        const results = Array.from(event.results)
        const latestResult = results[results.length - 1]

        if (!latestResult) return

        const transcript = latestResult[0]?.transcript || ''
        const confidence = latestResult[0]?.confidence || 0

        // Create structured result
        const result: VoiceSpeechResult = {
            transcript: transcript.trim(),
            confidence,
            isFinal: latestResult.isFinal,
            timestamp: Date.now(),
            alternatives: Array.from(latestResult).slice(1, 3).map((alt: SpeechRecognitionAlternative) => ({
                transcript: alt.transcript,
                confidence: alt.confidence
            }))
        }

        // Update accuracy tracking
        if (result.isFinal) {
            this.updateAccuracy(result.confidence)
            this.lastResult = result
        }

        // Emit result
        this.emit('result', result)

        // Log for debugging
        if (result.isFinal) {
            console.log(`🎯 Final: "${result.transcript}" (${Math.round(result.confidence * 100)}%)`)
        } else {
            console.log(`⏳ Interim: "${result.transcript}"`)
        }
    }

    /**
     * Get interim result for interruption detection
     */
    async getInterimResult(): Promise<VoiceSpeechResult | null> {
        // Return the last interim result if available
        return this.lastResult
    }

    /**
     * Update accuracy tracking
     */
    private updateAccuracy(confidence: number): void {
        // Simple moving average
        this.accuracyScore = (this.accuracyScore * 0.9) + (confidence * 0.1)
    }

    /**
     * Get current accuracy score
     */
    getAccuracy(): number {
        return this.accuracyScore
    }

    /**
     * Get uptime in milliseconds
     */
    getUptime(): number {
        return Date.now() - this.startTime
    }

    /**
     * Event system
     */
    on(event: string, callback: (data?: any) => void): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, [])
        }
        this.eventListeners.get(event)!.push(callback)
    }

    private emit(event: string, data?: any): void {
        const listeners = this.eventListeners.get(event)
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data)
                } catch (error) {
                    console.error(`Error in recognition event listener:`, error)
                }
            })
        }
    }

    /**
     * Cleanup
     */
    async destroy(): Promise<void> {
        await this.stop()
        this.eventListeners.clear()
        this.recognition = null
    }
}

// Extend window for TypeScript
declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor
        webkitSpeechRecognition: SpeechRecognitionConstructor
    }
}
