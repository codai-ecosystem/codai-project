import type {
    VoiceEngine as IVoiceEngine,
    VoiceConfig,
    VoiceEngineStatus,
    SpeechRecognitionResult,
    TextToSpeechConfig,
    VoiceActivityDetection
} from '@/types/voice'

import { SpeechRecognitionEngine } from './SpeechRecognition'
import { TextToSpeechEngine } from './TextToSpeech'
import { InterruptionManager } from './InterruptionManager'
import { VoiceActivityDetector } from './VoiceActivityDetector'
import { AudioProcessor } from './AudioProcessor'
import { mcpManager } from '@/mcp'

/**
 * Revolutionary Voice Engine with Continuous Listening and Interruption Handling
 * 
 * This engine solves the fundamental problem of natural voice conversation:
 * - Eliminates awkward pauses
 * - Handles interruptions gracefully
 * - Maintains conversation context
 * - Provides real-time feedback
 */
export class VoiceEngine implements IVoiceEngine {
    private recognition: SpeechRecognitionEngine
    private synthesis: TextToSpeechEngine
    private interruptionManager: InterruptionManager
    private vad: VoiceActivityDetector
    private audioProcessor: AudioProcessor
    private eventListeners: Map<string, Array<(data?: any) => void>>
    private isInitialized = false

    public config: VoiceConfig
    public status: VoiceEngineStatus

    constructor(config: VoiceConfig) {
        this.config = config
        this.status = {
            isListening: false,
            isSpeaking: false,
            isProcessing: false,
            isConnected: false,
            volume: 0
        }

        this.eventListeners = new Map()

        // Initialize components
        this.recognition = new SpeechRecognitionEngine(config)
        this.synthesis = new TextToSpeechEngine()
        this.vad = new VoiceActivityDetector()
        this.audioProcessor = new AudioProcessor()
        this.interruptionManager = new InterruptionManager(this)

        this.setupEventHandlers()
    }

    /**
     * Initialize the voice engine and all its components
     */
    async initialize(): Promise<void> {
        try {
            console.log('🎙️ Initializing METU Voice Engine...')

            // Add timeout protection for tests
            const initPromise = this.initializeComponents()
            
            if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
                // Use shorter timeout for tests
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Initialization timeout')), 3000)
                )
                await Promise.race([initPromise, timeoutPromise])
            } else {
                await initPromise
            }

            this.isInitialized = true
            this.status.isConnected = true

            this.emit('initialized')
            console.log('✅ METU Voice Engine with MCP integration initialized successfully')

        } catch (error) {
            console.error('❌ Failed to initialize Voice Engine:', error)
            this.status.error = error instanceof Error ? error.message : 'Unknown error'
            this.emit('error', error)
            throw error
        }
    }

    /**
     * Initialize all components sequentially
     */
    private async initializeComponents(): Promise<void> {
        // Initialize MCP Manager first
        console.log('🔌 Initializing MCP connections...')
        await mcpManager.initialize()

        // Initialize audio processor first
        await this.audioProcessor.initialize()

        // Initialize speech recognition
        await this.recognition.initialize()

        // Initialize text-to-speech
        await this.synthesis.initialize()

        // Initialize voice activity detector
        await this.vad.initialize()

        // Setup audio stream connections
        await this.setupAudioStreams()
    }

    /**
     * Start continuous listening - the core innovation
     * This allows the engine to listen even while speaking
     */
    async startContinuousListening(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('Voice engine not initialized')
        }

        try {
            console.log('🎧 Starting continuous listening...')

            // Start voice activity detection
            await this.vad.start()

            // Start speech recognition in continuous mode
            await this.recognition.startContinuous()

            this.status.isListening = true
            this.emit('listening-started')

            console.log('✅ Continuous listening active')

        } catch (error) {
            console.error('❌ Failed to start listening:', error)
            this.emit('error', error)
            throw error
        }
    }

    /**
     * Stop listening
     */
    async stopListening(): Promise<void> {
        try {
            await this.recognition.stop()
            await this.vad.stop()

            this.status.isListening = false
            this.emit('listening-stopped')

        } catch (error) {
            console.error('❌ Failed to stop listening:', error)
            this.emit('error', error)
        }
    }

    /**
     * Speak text with interruption capability
     */
    async speak(text: string, options?: Partial<TextToSpeechConfig>): Promise<void> {
        try {
            console.log('🗣️ Speaking:', text.substring(0, 50) + '...')

            this.status.isSpeaking = true
            this.emit('speaking-started', { text })

            // Synthesis with interruption monitoring
            await this.synthesis.speak(text, {
                ...options,
                onInterruption: () => this.handleSpeechInterruption()
            })

            // Don't reset isSpeaking here - let the 'finished' event handle it
            // This allows proper timing in test environment
            this.emit('speaking-stopped')

        } catch (error) {
            this.status.isSpeaking = false
            console.error('❌ Failed to speak:', error)
            this.emit('error', error)
        }
    }

    /**
     * Stop speaking immediately
     */
    async stopSpeaking(): Promise<void> {
        try {
            await this.synthesis.stop()
            this.status.isSpeaking = false
            this.emit('speaking-stopped')

        } catch (error) {
            console.error('❌ Failed to stop speaking:', error)
            this.emit('error', error)
        }
    }

    /**
     * Process user input - the heart of conversation management
     */
    async processUserInput(input: string): Promise<void> {
        try {
            console.log('💭 Processing user input:', input)

            this.status.isProcessing = true

            // Check if this is an interruption
            if (this.status.isSpeaking) {
                await this.handleInterruption(input)
            } else {
                // Normal conversation flow
                await this.handleNormalInput(input)
            }

            this.status.isProcessing = false

        } catch (error) {
            this.status.isProcessing = false
            console.error('❌ Failed to process input:', error)
            this.emit('error', error)
        }
    }

    /**
     * Handle interruptions - the key innovation
     */
    private async handleInterruption(userInput: string): Promise<void> {
        console.log('⚡ Interruption detected!')

        // Stop current speech immediately
        await this.stopSpeaking()

        // Let the interruption manager handle this
        const interruption = await this.interruptionManager.handleInterruption(userInput)

        this.emit('interruption-detected', interruption)
    }

    /**
     * Handle normal conversation input
     */
    private async handleNormalInput(input: string): Promise<void> {
        const result: SpeechRecognitionResult = {
            transcript: input,
            confidence: 1.0,
            isFinal: true,
            timestamp: Date.now()
        }

        // Check if this is an MCP command
        console.log('🔍 Checking for MCP commands...')
        const mcpResult = await mcpManager.processVoiceInput(input)

        if (mcpResult) {
            console.log('🎯 MCP command executed:', mcpResult)
            this.emit('mcp-command-executed', { input, result: mcpResult })

            // Provide voice feedback about the MCP command
            if (mcpResult.success) {
                await this.speak('Command executed successfully!')
            } else {
                await this.speak(`Command failed: ${mcpResult.error}`)
            }
        } else {
            // Regular speech recognition result
            this.emit('speech-detected', result)
        }
    }

    /**
     * Setup event handlers for all components
     */
    private setupEventHandlers(): void {
        // Speech recognition events
        this.recognition.on('result', (result: SpeechRecognitionResult) => {
            if (result.isFinal) {
                this.processUserInput(result.transcript)
            }
        })

        this.recognition.on('error', (error: string) => {
            this.emit('error', error)
        })

        // Voice Activity Detection events
        this.vad.on('activity', (activity: VoiceActivityDetection) => {
            this.status.volume = activity.volume

            // If we detect voice activity while speaking, this might be an interruption
            if (activity.isActive && this.status.isSpeaking && activity.speechProbability > 0.8) {
                this.handlePotentialInterruption()
            }

            this.emit('voice-activity', activity)
        })

        // Text-to-speech events
        this.synthesis.on('started', () => {
            this.status.isSpeaking = true
        })

        this.synthesis.on('finished', () => {
            this.status.isSpeaking = false
        })

        this.synthesis.on('interrupted', () => {
            this.status.isSpeaking = false
            console.log('🛑 Speech interrupted')
        })
    }

    /**
     * Handle potential interruption during VAD
     */
    private async handlePotentialInterruption(): Promise<void> {
        // Quick check: if recognition has interim results, this might be an interruption
        const interimResult = await this.recognition.getInterimResult()

        if (interimResult && interimResult.confidence > 0.7) {
            console.log('🔍 Potential interruption detected, monitoring...')
            // The actual interruption will be handled when final result comes in
        }
    }

    /**
     * Handle speech interruption callback
     */
    private handleSpeechInterruption(): void {
        console.log('🛑 Speech synthesis interrupted by user')
        this.status.isSpeaking = false
    }

    /**
     * Setup audio stream connections between components
     */
    private async setupAudioStreams(): Promise<void> {
        // Initialize audio processor
        await this.audioProcessor.initialize()

        // Initialize VAD
        this.vad.initialize()

        // Start audio processing
        await this.audioProcessor.start()

        console.log('🔗 Audio streams connected')
    }

    /**
     * Event system implementation
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
                    console.error(`Error in event listener for ${event}:`, error)
                }
            })
        }
    }

    /**
     * Get current performance metrics
     */
    getMetrics() {
        return {
            isListening: this.status.isListening,
            isSpeaking: this.status.isSpeaking,
            isProcessing: this.status.isProcessing,
            volume: this.status.volume,
            recognitionAccuracy: this.recognition.getAccuracy(),
            responseLatency: this.synthesis.getLatency(),
            uptime: this.recognition.getUptime(),
            mcpStatus: mcpManager.getStatus()
        }
    }

    /**
     * Cleanup and destroy the engine
     */
    async destroy(): Promise<void> {
        try {
            console.log('🧹 Destroying Voice Engine...')

            await this.stopListening()
            await this.stopSpeaking()

            await this.recognition.destroy()
            await this.synthesis.destroy()
            await this.vad.destroy()
            await this.audioProcessor.destroy()

            // Shutdown MCP Manager
            await mcpManager.shutdown()

            this.eventListeners.clear()
            this.isInitialized = false
            
            // Reset status
            this.status.isConnected = false
            this.status.isListening = false
            this.status.isSpeaking = false

            console.log('✅ Voice Engine destroyed')

        } catch (error) {
            console.error('❌ Error destroying Voice Engine:', error)
            throw error
        }
    }
}
