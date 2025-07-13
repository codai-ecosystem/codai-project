import type {
    TextToSpeechConfig
} from '@/types/voice'

/**
 * Advanced Text-to-Speech Engine with Interruption Support
 * 
 * Features:
 * - High-quality speech synthesis
 * - Interruption capability
 * - Streaming support
 * - Voice customization
 * - Performance optimization
 */
export class TextToSpeechEngine {
    private synthesis: SpeechSynthesis | null = null
    private currentUtterance: SpeechSynthesisUtterance | null = null
    private eventListeners: Map<string, Array<(data?: any) => void>>
    private isInitialized = false
    private isCurrentlySpeaking = false
    private voiceCache: SpeechSynthesisVoice[] = []
    private latencyTracker: number[] = []

    constructor() {
        this.eventListeners = new Map()
    }

    /**
     * Initialize the text-to-speech engine
     */
    async initialize(): Promise<void> {
        try {
            console.log('🗣️ Initializing Text-to-Speech Engine...')

            if (!('speechSynthesis' in window)) {
                throw new Error('Speech Synthesis not supported in this browser')
            }

            this.synthesis = window.speechSynthesis

            // Load available voices
            await this.loadVoices()

            this.isInitialized = true
            console.log('✅ Text-to-Speech Engine initialized')

        } catch (error) {
            console.error('❌ Failed to initialize TTS:', error)
            throw error
        }
    }

    /**
     * Load and cache available voices
     */
    private async loadVoices(): Promise<void> {
        return new Promise((resolve) => {
            const loadVoicesFunc = () => {
                if (this.synthesis) {
                    this.voiceCache = this.synthesis.getVoices()

                    if (this.voiceCache.length > 0) {
                        console.log(`📢 Loaded ${this.voiceCache.length} voices`)
                        resolve()
                    } else {
                        // Some browsers load voices asynchronously
                        setTimeout(loadVoicesFunc, 100)
                    }
                }
            }

            // Try to load voices immediately
            loadVoicesFunc()

            // Also listen for voice change events
            if (this.synthesis) {
                this.synthesis.onvoiceschanged = loadVoicesFunc
            }
        })
    }

    /**
     * Speak text with advanced options
     */
    async speak(
        text: string,
        options: Partial<TextToSpeechConfig & { onInterruption?: () => void }> = {}
    ): Promise<void> {
        if (!this.isInitialized || !this.synthesis) {
            throw new Error('TTS not initialized')
        }

        return new Promise((resolve, reject) => {
            try {
                const startTime = performance.now()

                // Stop any current speech
                this.stopCurrentSpeech()

                // Create utterance
                this.currentUtterance = new SpeechSynthesisUtterance(text)

                // Configure utterance
                this.configureUtterance(this.currentUtterance, options)

                // Setup event handlers
                this.currentUtterance.onstart = () => {
                    this.isCurrentlySpeaking = true
                    this.emit('started', { text })
                    console.log('🗣️ Started speaking:', text.substring(0, 50) + '...')
                }

                this.currentUtterance.onend = () => {
                    const endTime = performance.now()
                    const duration = endTime - startTime

                    this.isCurrentlySpeaking = false
                    this.currentUtterance = null

                    // Track latency
                    this.trackLatency(duration)

                    this.emit('finished', { text, duration })
                    console.log(`✅ Finished speaking (${Math.round(duration)}ms)`)
                    resolve()
                }

                this.currentUtterance.onerror = (event) => {
                    this.isCurrentlySpeaking = false
                    this.currentUtterance = null

                    console.error('❌ TTS error:', event.error)
                    this.emit('error', event.error)
                    reject(new Error(`TTS Error: ${event.error}`))
                }

                this.currentUtterance.onpause = () => {
                    console.log('⏸️ Speech paused')
                    this.emit('paused')
                }

                this.currentUtterance.onresume = () => {
                    console.log('▶️ Speech resumed')
                    this.emit('resumed')
                }

                // Handle interruptions
                if (options.onInterruption) {
                    this.currentUtterance.onend = () => {
                        if (this.isCurrentlySpeaking) {
                            // This was an interruption, not a natural end
                            options.onInterruption?.()
                            this.emit('interrupted', { text })
                        }

                        this.isCurrentlySpeaking = false
                        this.currentUtterance = null
                        resolve()
                    }
                }

                // Start speaking
                this.synthesis!.speak(this.currentUtterance)

            } catch (error) {
                this.isCurrentlySpeaking = false
                this.currentUtterance = null
                reject(error)
            }
        })
    }

    /**
     * Configure speech utterance with options
     */
    private configureUtterance(
        utterance: SpeechSynthesisUtterance,
        options: Partial<TextToSpeechConfig>
    ): void {
        // Set voice
        if (options.voice) {
            const voice = this.findVoice(options.voice)
            if (voice) {
                utterance.voice = voice
            }
        } else {
            // Use default high-quality voice
            const defaultVoice = this.getDefaultVoice()
            if (defaultVoice) {
                utterance.voice = defaultVoice
            }
        }

        // Set speech parameters
        utterance.rate = options.rate ?? 1.0
        utterance.pitch = options.pitch ?? 1.0
        utterance.volume = options.volume ?? 1.0
        utterance.lang = options.language ?? 'en-US'
    }

    /**
     * Find voice by name or characteristics
     */
    private findVoice(voiceName: string): SpeechSynthesisVoice | null {
        // First try exact name match
        let voice = this.voiceCache.find(v => v.name === voiceName)

        if (!voice) {
            // Try partial name match
            voice = this.voiceCache.find(v =>
                v.name.toLowerCase().includes(voiceName.toLowerCase())
            )
        }

        return voice || null
    }

    /**
     * Get the best default voice
     */
    private getDefaultVoice(): SpeechSynthesisVoice | null {
        // Prefer local, high-quality voices
        const localVoices = this.voiceCache.filter(v => v.localService)

        if (localVoices.length > 0) {
            // Look for common high-quality voice names
            const preferredNames = ['Microsoft Zira', 'Google US English', 'Samantha', 'Alex']

            for (const name of preferredNames) {
                const voice = localVoices.find(v => v.name.includes(name))
                if (voice) return voice
            }

            // Return first local voice
            return localVoices[0] || null
        }

        // Fallback to any voice
        return this.voiceCache[0] || null
    }

    /**
     * Stop current speech immediately
     */
    async stop(): Promise<void> {
        if (this.synthesis && this.isCurrentlySpeaking) {
            this.synthesis.cancel()
            this.isCurrentlySpeaking = false
            this.currentUtterance = null
            this.emit('stopped')
            console.log('🛑 Speech stopped')
        }
    }

    /**
     * Stop current speech gracefully
     */
    private stopCurrentSpeech(): void {
        if (this.synthesis && this.synthesis.speaking) {
            this.synthesis.cancel()
        }
    }

    /**
     * Pause current speech
     */
    async pause(): Promise<void> {
        if (this.synthesis && this.isCurrentlySpeaking) {
            this.synthesis.pause()
        }
    }

    /**
     * Resume paused speech
     */
    async resume(): Promise<void> {
        if (this.synthesis && this.synthesis.paused) {
            this.synthesis.resume()
        }
    }

    /**
     * Get available voices
     */
    getAvailableVoices(): SpeechSynthesisVoice[] {
        return [...this.voiceCache]
    }

    /**
     * Get voices by language
     */
    getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
        return this.voiceCache.filter(voice =>
            voice.lang.startsWith(language)
        )
    }

    /**
     * Check if currently speaking
     */
    isSpeaking(): boolean {
        return this.isCurrentlySpeaking
    }

    /**
     * Track latency for performance monitoring
     */
    private trackLatency(duration: number): void {
        this.latencyTracker.push(duration)

        // Keep only last 10 measurements
        if (this.latencyTracker.length > 10) {
            this.latencyTracker.shift()
        }
    }

    /**
     * Get average latency
     */
    getLatency(): number {
        if (this.latencyTracker.length === 0) return 0

        const sum = this.latencyTracker.reduce((a, b) => a + b, 0)
        return sum / this.latencyTracker.length
    }

    /**
     * Get TTS status and metrics
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isSpeaking: this.isCurrentlySpeaking,
            availableVoices: this.voiceCache.length,
            averageLatency: this.getLatency(),
            supportsSSML: this.supportsSSML()
        }
    }

    /**
     * Check if browser supports SSML
     */
    private supportsSSML(): boolean {
        // Most browsers don't support SSML in web speech API
        // This would be implemented with Azure Speech Services
        return false
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

    off(event: string, callback: (data?: any) => void): void {
        const listeners = this.eventListeners.get(event)
        if (listeners) {
            const index = listeners.indexOf(callback)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }

    private emit(event: string, data?: any): void {
        const listeners = this.eventListeners.get(event)
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data)
                } catch (error) {
                    console.error(`Error in TTS event listener:`, error)
                }
            })
        }
    }

    /**
     * Cleanup and destroy
     */
    async destroy(): Promise<void> {
        await this.stop()
        this.eventListeners.clear()
        this.voiceCache = []
        this.latencyTracker = []
        this.synthesis = null
        this.isInitialized = false
    }
}
