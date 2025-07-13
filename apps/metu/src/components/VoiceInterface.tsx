import React, { useState, useEffect, useCallback } from 'react'
import { VoiceEngine } from '../voice/VoiceEngine'
import type { VoiceEngineStatus, VoiceInterruption, SpeechRecognitionResult } from '../types/voice'

/**
 * METU Voice Interface - Revolutionary Continuous Voice Chat
 * 
 * Features:
 * - Continuous voice listening even during AI speech
 * - Natural interruption handling without awkward pauses
 * - Real-time conversation flow visualization
 * - Voice activity monitoring
 */
export const VoiceInterface: React.FC = () => {
    // Voice engine state
    const [voiceEngine, setVoiceEngine] = useState<VoiceEngine | null>(null)
    const [status, setStatus] = useState<VoiceEngineStatus>({
        isListening: false,
        isSpeaking: false,
        isProcessing: false,
        isConnected: false,
        volume: 0
    })

    // Conversation state
    const [transcript, setTranscript] = useState('')
    const [currentResponse, setCurrentResponse] = useState('')
    const [conversationHistory, setConversationHistory] = useState<Array<{
        type: 'user' | 'ai'
        text: string
        timestamp: number
        interrupted?: boolean
    }>>([])

    // Interruption state
    const [lastInterruption, setLastInterruption] = useState<VoiceInterruption | null>(null)
    const [interruptionCount, setInterruptionCount] = useState(0)

    // UI state
    const [isInitialized, setIsInitialized] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Initialize voice engine
     */
    const initializeVoiceEngine = useCallback(async () => {
        try {
            console.log('🚀 Initializing METU Voice Engine...')
            setError(null)

            const engine = new VoiceEngine({
                continuous: true,
                interimResults: true,
                maxAlternatives: 3,
                sampleRate: 44100,
                channels: 1,
                bitDepth: 16,
                maxLatency: 100,
                recognitionAccuracy: 0.8,
                interruptionDetectionTime: 500
            })

            // Setup event listeners
            engine.on('status-changed', (newStatus: VoiceEngineStatus) => {
                setStatus(newStatus)
                if (newStatus.error) {
                    setError(newStatus.error)
                }
            })

            engine.on('speech-detected', (result: SpeechRecognitionResult) => {
                setTranscript(result.transcript)

                if (result.isFinal) {
                    // Add to conversation history
                    setConversationHistory(prev => [...prev, {
                        type: 'user',
                        text: result.transcript,
                        timestamp: Date.now()
                    }])

                    // Clear transcript for next input
                    setTranscript('')
                }
            })

            engine.on('speaking-started', (text: string) => {
                setCurrentResponse(text)
                setConversationHistory(prev => [...prev, {
                    type: 'ai',
                    text,
                    timestamp: Date.now()
                }])
            })

            engine.on('speaking-stopped', () => {
                setCurrentResponse('')
            })

            engine.on('interruption-detected', (interruption: VoiceInterruption) => {
                setLastInterruption(interruption)
                setInterruptionCount(prev => prev + 1)

                // Mark last AI response as interrupted
                setConversationHistory(prev =>
                    prev.map((item, index) =>
                        index === prev.length - 1 && item.type === 'ai'
                            ? { ...item, interrupted: true }
                            : item
                    )
                )
            })

            engine.on('error', (errorMessage: string) => {
                setError(errorMessage)
                console.error('❌ Voice Engine Error:', errorMessage)
            })

            // Initialize the engine
            await engine.initialize()
            setVoiceEngine(engine)
            setIsInitialized(true)

            console.log('✅ METU Voice Engine initialized successfully')

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            setError(`Failed to initialize voice engine: ${errorMessage}`)
            console.error('❌ Voice Engine initialization failed:', error)
        }
    }, [])

    /**
     * Start continuous listening
     */
    const startListening = useCallback(async () => {
        if (!voiceEngine) return

        try {
            await voiceEngine.startContinuousListening()
            console.log('🎤 Started continuous listening')
        } catch (error) {
            setError(`Failed to start listening: ${error}`)
        }
    }, [voiceEngine])

    /**
     * Stop listening
     */
    const stopListening = useCallback(async () => {
        if (!voiceEngine) return

        try {
            await voiceEngine.stopListening()
            console.log('🔇 Stopped listening')
        } catch (error) {
            setError(`Failed to stop listening: ${error}`)
        }
    }, [voiceEngine])

    /**
     * Manual voice input for testing
     */
    const testVoiceInput = useCallback(async (text: string) => {
        if (!voiceEngine) return

        try {
            await voiceEngine.processUserInput(text)
        } catch (error) {
            setError(`Failed to process input: ${error}`)
        }
    }, [voiceEngine])

    /**
     * Clear conversation history
     */
    const clearHistory = useCallback(() => {
        setConversationHistory([])
        setTranscript('')
        setCurrentResponse('')
        setLastInterruption(null)
        setInterruptionCount(0)
    }, [])

    /**
     * Initialize on component mount
     */
    useEffect(() => {
        initializeVoiceEngine()

        return () => {
            // Cleanup on unmount
            if (voiceEngine) {
                voiceEngine.destroy()
            }
        }
    }, [initializeVoiceEngine])

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
            {/* Header */}
            <header className="bg-black bg-opacity-30 backdrop-blur-sm p-4 border-b border-white border-opacity-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            METU
                        </div>
                        <div className="text-sm text-gray-300">
                            Revolutionary Voice AI
                        </div>
                    </div>

                    {/* Status indicators */}
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${status.isConnected
                                ? 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-30'
                                : 'bg-red-500 bg-opacity-20 text-red-300 border border-red-500 border-opacity-30'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${status.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                            {status.isConnected ? 'Connected' : 'Disconnected'}
                        </div>

                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${status.isListening
                                ? 'bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30'
                                : 'bg-gray-500 bg-opacity-20 text-gray-300 border border-gray-500 border-opacity-30'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${status.isListening ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`} />
                            {status.isListening ? 'Listening' : 'Silent'}
                        </div>

                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${status.isSpeaking
                                ? 'bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30'
                                : 'bg-gray-500 bg-opacity-20 text-gray-300 border border-gray-500 border-opacity-30'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${status.isSpeaking ? 'bg-purple-400 animate-pulse' : 'bg-gray-400'}`} />
                            {status.isSpeaking ? 'Speaking' : 'Quiet'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Error display */}
            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 text-red-300 p-4 m-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <span className="text-red-400">⚠️</span>
                        <span className="font-medium">Error:</span>
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex">
                {/* Conversation area */}
                <div className="flex-1 flex flex-col">
                    {/* Conversation history */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {conversationHistory.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🎤</div>
                                    <div className="text-xl mb-2">Ready for conversation</div>
                                    <div className="text-sm">
                                        {isInitialized
                                            ? 'Click "Start Listening" to begin talking with METU'
                                            : 'Initializing voice engine...'
                                        }
                                    </div>
                                </div>
                            </div>
                        ) : (
                            conversationHistory.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${item.type === 'user'
                                            ? 'bg-blue-500 bg-opacity-20 text-blue-100 border border-blue-500 border-opacity-30'
                                            : `bg-purple-500 bg-opacity-20 text-purple-100 border border-purple-500 border-opacity-30 ${item.interrupted ? 'opacity-60 border-dashed' : ''
                                            }`
                                        }`}>
                                        <div className="text-sm">{item.text}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(item.timestamp).toLocaleTimeString()}
                                            {item.interrupted && <span className="ml-2 text-yellow-400">✂️ Interrupted</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Current transcript */}
                        {transcript && (
                            <div className="flex justify-end">
                                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-blue-500 bg-opacity-10 text-blue-200 border border-blue-500 border-opacity-20 border-dashed">
                                    <div className="text-sm">{transcript}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        <span className="animate-pulse">🎙️ Listening...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Current AI response */}
                        {currentResponse && (
                            <div className="flex justify-start">
                                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-purple-500 bg-opacity-10 text-purple-200 border border-purple-500 border-opacity-20 border-dashed">
                                    <div className="text-sm">{currentResponse}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        <span className="animate-pulse">🗣️ Speaking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Voice controls */}
                    <div className="p-4 bg-black bg-opacity-30 backdrop-blur-sm border-t border-white border-opacity-20">
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-3">
                                {!status.isListening ? (
                                    <button
                                        onClick={startListening}
                                        disabled={!isInitialized}
                                        className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                                    >
                                        🎤 Start Listening
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopListening}
                                        className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
                                    >
                                        🔇 Stop Listening
                                    </button>
                                )}

                                <button
                                    onClick={clearHistory}
                                    className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    🗑️ Clear
                                </button>
                            </div>

                            {/* Volume indicator */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-400">Volume:</span>
                                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-100"
                                        style={{ width: `${Math.min(status.volume * 100, 100)}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 w-8">
                                    {Math.round(status.volume * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Test inputs for development */}
                        <div className="mt-4 pt-4 border-t border-white border-opacity-10">
                            <div className="text-xs text-gray-400 mb-2">Development Test Inputs:</div>
                            <div className="flex space-x-2">
                                {[
                                    'Hello METU, how are you?',
                                    'What can you help me with?',
                                    'Tell me a joke',
                                    'Stop talking please'
                                ].map((testInput, index) => (
                                    <button
                                        key={index}
                                        onClick={() => testVoiceInput(testInput)}
                                        disabled={!isInitialized}
                                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded border border-gray-600 transition-colors"
                                    >
                                        {testInput}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats sidebar */}
                <div className="w-80 bg-black bg-opacity-30 backdrop-blur-sm border-l border-white border-opacity-20 p-4">
                    <div className="text-lg font-medium mb-4">Voice Stats</div>

                    <div className="space-y-4">
                        {/* Interruption stats */}
                        <div className="bg-white bg-opacity-5 rounded-lg p-3">
                            <div className="text-sm font-medium text-purple-300 mb-2">Interruptions</div>
                            <div className="text-2xl font-bold">{interruptionCount}</div>
                            {lastInterruption && (
                                <div className="text-xs text-gray-400 mt-2">
                                    Last: {lastInterruption.interruptionType} interruption
                                </div>
                            )}
                        </div>

                        {/* Conversation stats */}
                        <div className="bg-white bg-opacity-5 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-300 mb-2">Messages</div>
                            <div className="flex justify-between text-sm">
                                <span>User: {conversationHistory.filter(m => m.type === 'user').length}</span>
                                <span>AI: {conversationHistory.filter(m => m.type === 'ai').length}</span>
                            </div>
                        </div>

                        {/* Engine status */}
                        <div className="bg-white bg-opacity-5 rounded-lg p-3">
                            <div className="text-sm font-medium text-green-300 mb-2">Engine Status</div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span>Processing:</span>
                                    <span className={status.isProcessing ? 'text-green-400' : 'text-gray-400'}>
                                        {status.isProcessing ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Connected:</span>
                                    <span className={status.isConnected ? 'text-green-400' : 'text-red-400'}>
                                        {status.isConnected ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Revolutionary features info */}
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 bg-opacity-20 rounded-lg p-3 border border-purple-500 border-opacity-30">
                            <div className="text-sm font-medium text-cyan-300 mb-2">🚀 Revolutionary Features</div>
                            <div className="text-xs text-gray-300 space-y-1">
                                <div>✓ Continuous listening during AI speech</div>
                                <div>✓ Natural interruption handling</div>
                                <div>✓ Zero conversation delays</div>
                                <div>✓ Context preservation</div>
                                <div>✓ Real-time voice activity detection</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
