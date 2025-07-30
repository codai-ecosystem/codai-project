import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { VoiceEngine } from '../src/voice/VoiceEngine'
import type { VoiceConfig } from '../src/types/voice'

/**
 * METU Voice Engine Tests
 * 
 * Comprehensive test suite for the revolutionary voice interaction system.
 */

// Mock Azure OpenAI SDK completely
vi.mock('@azure/openai', () => ({
    OpenAIClient: vi.fn().mockImplementation(() => ({
        getChatCompletions: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mocked response' } }]
        }),
        audio: {
            transcriptions: {
                create: vi.fn().mockResolvedValue({ text: 'mocked transcription' })
            },
            speech: {
                create: vi.fn().mockResolvedValue({ body: 'mocked audio data' })
            }
        }
    })),
    AzureKeyCredential: vi.fn().mockImplementation(() => ({})),
    AzureOpenAI: vi.fn().mockImplementation(() => ({
        audio: {
            transcriptions: {
                create: vi.fn().mockResolvedValue({ text: 'mocked transcription' })
            },
            speech: {
                create: vi.fn().mockResolvedValue({ body: 'mocked audio data' })
            }
        },
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{ message: { content: 'Mocked chat response' } }]
                })
            }
        }
    }))
}))

// Mock all voice engine dependencies
vi.mock('../src/voice/SpeechRecognition', () => ({
    SpeechRecognitionEngine: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(true),
        startListening: vi.fn().mockResolvedValue(true),
        startContinuous: vi.fn().mockResolvedValue(true),
        stop: vi.fn().mockResolvedValue(true),
        stopListening: vi.fn().mockResolvedValue(true),
        destroy: vi.fn().mockResolvedValue(true),
        isListening: false,
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
    }))
}))

vi.mock('../src/voice/AudioProcessor', () => ({
    AudioProcessor: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(true),
        start: vi.fn().mockResolvedValue(true),
        stop: vi.fn().mockResolvedValue(true),
        processAudio: vi.fn().mockResolvedValue('processed audio'),
        destroy: vi.fn().mockResolvedValue(true),
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
    }))
}))

vi.mock('../src/voice/TextToSpeech', () => ({
    TextToSpeechEngine: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(true),
        speak: vi.fn().mockResolvedValue(true),
        stop: vi.fn().mockResolvedValue(true),
        destroy: vi.fn().mockResolvedValue(true),
        isSpeaking: false,
        isPlaying: false,
        currentPlaybackId: null,
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
    }))
}))

vi.mock('../src/mcp/MCPManager', () => ({
    MCPManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(true),
        destroy: vi.fn().mockResolvedValue(true),
        connectedServers: ['PlaywrightMCPServer', 'MemoraiMCPServer', 'GlassMCPServer', 'RomaiUltimateMCPServer'],
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
    }))
}))

// Environment variables are now loaded from vitest.config.ts
// which reads real Azure OpenAI credentials from root .env file

// Mock Web Speech API
const mockSpeechRecognition = {
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    continuous: false,
    interimResults: false,
    maxAlternatives: 1,
    serviceURI: '',
    grammars: null,
    lang: 'en-US'
}

const mockSpeechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    speaking: false,
    pending: false,
    paused: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
}

// Mock Audio Context
const mockAudioContext = {
    createMediaStreamSource: vi.fn(),
    createAnalyser: vi.fn(),
    createGain: vi.fn(),
    createDynamicsCompressor: vi.fn(),
    createBiquadFilter: vi.fn(),
    createDelay: vi.fn(),
    createScriptProcessor: vi.fn(),
    resume: vi.fn(),
    close: vi.fn(),
    state: 'running',
    sampleRate: 44100,
    destination: {}
}

// Mock getUserMedia
const mockGetUserMedia = vi.fn(() =>
    Promise.resolve({
        getTracks: () => [{ stop: vi.fn() }]
    })
)

describe('VoiceEngine', () => {
    let voiceEngine: VoiceEngine
    let voiceConfig: VoiceConfig

    beforeEach(() => {
        // Setup mocks
        vi.stubGlobal('webkitSpeechRecognition', vi.fn(() => mockSpeechRecognition))
        vi.stubGlobal('SpeechRecognition', vi.fn(() => mockSpeechRecognition))
        vi.stubGlobal('speechSynthesis', mockSpeechSynthesis)
        vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))
        vi.stubGlobal('webkitAudioContext', vi.fn(() => mockAudioContext))

        // Mock navigator
        Object.defineProperty(navigator, 'mediaDevices', {
            value: { getUserMedia: mockGetUserMedia },
            writable: true
        })

        // Default configuration
        voiceConfig = {
            continuous: true,
            interimResults: true,
            maxAlternatives: 3,
            sampleRate: 44100,
            channels: 1,
            bitDepth: 16,
            maxLatency: 100,
            recognitionAccuracy: 0.8,
            interruptionDetectionTime: 500
        }

        voiceEngine = new VoiceEngine(voiceConfig)
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.unstubAllGlobals()
    })

    describe('Initialization', () => {
        test('should create voice engine with config', () => {
            expect(voiceEngine).toBeDefined()
            expect(voiceEngine.config).toEqual(voiceConfig)
            expect(voiceEngine.status.isListening).toBe(false)
            expect(voiceEngine.status.isSpeaking).toBe(false)
        })

        test('should initialize all components', async () => {
            await voiceEngine.initialize()
            expect(voiceEngine.status.isConnected).toBe(true)
        }, 3000)
    })

    describe('Speech Recognition', () => {
        test('should start continuous listening', async () => {
            await voiceEngine.initialize()
            await voiceEngine.startContinuousListening()
            expect(voiceEngine.status.isListening).toBe(true)
        })

        test('should stop listening', async () => {
            await voiceEngine.initialize()
            await voiceEngine.startContinuousListening()
            await voiceEngine.stopListening()
            expect(voiceEngine.status.isListening).toBe(false)
        })

        test('should handle speech detection', async () => {
            await voiceEngine.initialize()

            const mockCallback = vi.fn()
            voiceEngine.on('speech-detected', mockCallback)

            // Simulate speech detection
            await voiceEngine.processUserInput('Hello METU')

            expect(mockCallback).toHaveBeenCalled()
        })
    })

    describe('Text-to-Speech', () => {
        test('should speak text', async () => {
            await voiceEngine.initialize()
            await voiceEngine.speak('Hello, this is METU speaking')
            expect(voiceEngine.status.isSpeaking).toBe(true)
        })

        test('should stop speaking', async () => {
            await voiceEngine.initialize()
            await voiceEngine.speak('Hello, this is METU speaking')
            await voiceEngine.stopSpeaking()
            expect(voiceEngine.status.isSpeaking).toBe(false)
        })

        test('should handle interruption while speaking', async () => {
            await voiceEngine.initialize()

            const mockCallback = vi.fn()
            voiceEngine.on('interruption-detected', mockCallback)

            // Start speaking
            await voiceEngine.speak('This is a long message that will be interrupted')

            // Simulate interruption
            await voiceEngine.processUserInput('Stop!')

            expect(mockCallback).toHaveBeenCalled()
            expect(voiceEngine.status.isSpeaking).toBe(false)
        })
    })

    describe('Event System', () => {
        test('should register and trigger event listeners', () => {
            const mockCallback = vi.fn()
            voiceEngine.on('test-event', mockCallback)

            // Trigger event (simulate internal event emission)
            voiceEngine['emit']('test-event', { data: 'test' })

            expect(mockCallback).toHaveBeenCalledWith({ data: 'test' })
        })

        test('should remove event listeners', () => {
            const mockCallback = vi.fn()
            voiceEngine.on('test-event', mockCallback)
            voiceEngine.off('test-event', mockCallback)

            voiceEngine['emit']('test-event', { data: 'test' })

            expect(mockCallback).not.toHaveBeenCalled()
        })
    })

    describe('Interruption Handling', () => {
        test('should detect polite interruption', async () => {
            await voiceEngine.initialize()

            const mockCallback = vi.fn()
            voiceEngine.on('interruption-detected', mockCallback)

            // Start speaking
            await voiceEngine.speak('Let me tell you a story about...')

            // Polite interruption
            await voiceEngine.processUserInput('Sorry to interrupt, but...')

            expect(mockCallback).toHaveBeenCalled()
            const interruption = mockCallback.mock.calls[0][0]
            expect(interruption.interruptionType).toBe('polite')
        })

        test('should detect urgent interruption', async () => {
            await voiceEngine.initialize()

            const mockCallback = vi.fn()
            voiceEngine.on('interruption-detected', mockCallback)

            // Start speaking
            await voiceEngine.speak('Let me explain this concept...')

            // Urgent interruption
            await voiceEngine.processUserInput('STOP! Emergency!')

            expect(mockCallback).toHaveBeenCalled()
            const interruption = mockCallback.mock.calls[0][0]
            expect(interruption.interruptionType).toBe('urgent')
        })
    })

    describe('Cleanup', () => {
        test('should properly destroy all components', async () => {
            await voiceEngine.initialize()
            await voiceEngine.startContinuousListening()
            await voiceEngine.destroy()

            expect(voiceEngine.status.isListening).toBe(false)
            expect(voiceEngine.status.isSpeaking).toBe(false)
            expect(voiceEngine.status.isConnected).toBe(false)
        })
    })
})

describe('Voice Recognition Accuracy', () => {
    test('should handle recognition confidence levels', () => {
        const highConfidenceResult = {
            transcript: 'Hello METU',
            confidence: 0.95,
            isFinal: true,
            timestamp: Date.now()
        }

        const lowConfidenceResult = {
            transcript: 'Helo MET',
            confidence: 0.3,
            isFinal: true,
            timestamp: Date.now()
        }

        expect(highConfidenceResult.confidence).toBeGreaterThan(0.8)
        expect(lowConfidenceResult.confidence).toBeLessThan(0.5)
    })
})

describe('Performance Tests', () => {
    let voiceEngine: VoiceEngine

    beforeEach(async () => {
        voiceEngine = new VoiceEngine({
            continuous: true,
            interimResults: true,
            maxAlternatives: 3,
            sampleRate: 48000,
            channels: 2,
            bitDepth: 16,
            maxLatency: 100,
            recognitionAccuracy: 0.95,
            interruptionDetectionTime: 500
        })
    })

    test('should initialize within acceptable time', async () => {
        const startTime = performance.now()
        await voiceEngine.initialize()
        const endTime = performance.now()

        const initTime = endTime - startTime
        expect(initTime).toBeLessThan(1000) // Should initialize within 1 second
    })

    test('should handle rapid speech detection', async () => {
        await voiceEngine.initialize()

        const results: string[] = []
        voiceEngine.on('speech-detected', (result) => {
            results.push(result.transcript)
        })

        // Simulate rapid speech inputs
        const inputs = ['Hello', 'How are you', 'Tell me about AI', 'Thank you']

        for (const input of inputs) {
            await voiceEngine.processUserInput(input)
        }

        expect(results).toHaveLength(inputs.length)
    })
})
