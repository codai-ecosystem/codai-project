import React, { useState, useEffect, useCallback, useRef } from 'react'
import { VoiceEngine } from '../voice/VoiceEngine'
import { AstralCharacter } from './AstralCharacter'
import { StreamingConversation, ConversationMessage } from './StreamingText'
import { AudioVisualizer, type AudioAnalysis, type AudioVisualizerHandle } from './AudioVisualization'
import type { VoiceEngineStatus, VoiceInterruption, SpeechRecognitionResult } from '../types/voice'
import '../styles/scrollbar.css'
import '../styles/glassmorphism.css'

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

    // Audio analysis state and refs
    const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis | null>(null)
    const audioVisualizerRef = useRef<AudioVisualizerHandle>(null)

    // Convert conversation history to StreamingConversation format
    const getConversationMessages = (): ConversationMessage[] => {
        return conversationHistory.map((item, index) => ({
            id: `${item.type}-${index}-${item.timestamp}`,
            type: item.type,
            text: item.text,
            timestamp: item.timestamp,
            isStreaming: false,
            isComplete: true,
            interrupted: item.interrupted
        }))
    }

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
            <header className="glass-nav backdrop-blur-md p-4 border-b border-white border-opacity-20 glass-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            METU
                        </div>
                        <div className="text-sm glass-text-muted">
                            Revolutionary Voice AI
                        </div>
                    </div>

                    {/* Status indicators */}
                    <div className="flex items-center space-x-4">
                        <div className={`glass-status flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${status.isConnected
                            ? 'glass-green text-green-300'
                            : 'glass-subtle text-red-300 border-red-500 border-opacity-30'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${status.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                            {status.isConnected ? 'Connected' : 'Disconnected'}
                        </div>

                        <div className={`glass-status flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${status.isListening
                            ? 'glass-blue text-blue-300'
                            : 'glass-subtle text-gray-300'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${status.isListening ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`} />
                            {status.isListening ? 'Listening' : 'Silent'}
                        </div>

                        <div className={`glass-status flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${status.isSpeaking
                            ? 'glass-purple text-purple-300'
                            : 'glass-subtle text-gray-300'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${status.isSpeaking ? 'bg-purple-400 animate-pulse' : 'bg-gray-400'}`} />
                            {status.isSpeaking ? 'Speaking' : 'Quiet'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Error display */}
            {error && (
                <div className="glass-subtle m-4 p-4 rounded-lg border-red-500 border-opacity-30 text-red-300 glass-slide-up">
                    <div className="flex items-center space-x-2">
                        <span className="text-red-400">⚠️</span>
                        <span className="font-medium">Error:</span>
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="mt-2 text-xs text-red-400 hover:text-red-300 underline glass-button"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex">
                {/* Conversation area */}
                <div className="flex-1 flex flex-col">
                    {/* Conversation history with streaming */}
                    {conversationHistory.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    <AstralCharacter
                                        state={
                                            !isInitialized ? 'idle' :
                                                status.isProcessing ? 'processing' :
                                                    status.isSpeaking ? 'speaking' :
                                                        status.isListening ? 'listening' :
                                                            'idle'
                                        }
                                        volume={status.volume}
                                        size="large"
                                        audioAnalysis={audioAnalysis || undefined}
                                    />
                                </div>
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
                        <StreamingConversation
                            messages={getConversationMessages()}
                            currentStreamingText={currentResponse}
                            isTyping={status.isProcessing && !currentResponse}
                            maxHeight="calc(100vh - 300px)"
                            showTimestamps={true}
                            showStatus={true}
                        />
                    )}

                    {/* Current transcript display */}
                    {transcript && (
                        <div className="p-4 border-t border-white border-opacity-10">
                            <div className="flex justify-end">
                                <div className="glass-blue max-w-xs lg:max-w-md px-4 py-3 rounded-lg border-dashed glass-slide-up">
                                    <div className="text-sm glass-text">{transcript}</div>
                                    <div className="text-xs glass-text-muted mt-1">
                                        <span className="animate-pulse">🎙️ Listening...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Voice controls */}
                    <div className="p-4 bg-black bg-opacity-30 backdrop-blur-sm border-t border-white border-opacity-20">
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-3">
                                {!status.isListening ? (
                                    <button
                                        onClick={startListening}
                                        disabled={!isInitialized}
                                        className="glass-button glass-green disabled:glass-subtle disabled:cursor-not-allowed"
                                    >
                                        🎤 Start Listening
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopListening}
                                        className="glass-button glass-pink"
                                    >
                                        🔇 Stop Listening
                                    </button>
                                )}

                                <button
                                    onClick={clearHistory}
                                    className="glass-button glass-subtle"
                                >
                                    🗑️ Clear
                                </button>
                            </div>

                            {/* Volume indicator */}
                            <div className="glass-panel flex items-center space-x-2 p-3">
                                <span className="text-sm glass-text-muted">Volume:</span>
                                <div className="w-20 h-2 glass-subtle rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-100"
                                        style={{ width: `${Math.min(status.volume * 100, 100)}%` }}
                                    />
                                </div>
                                <span className="text-xs glass-text-muted w-8">
                                    {Math.round(status.volume * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Test inputs for development */}
                        <div className="mt-4 pt-4 border-t border-white border-opacity-10">
                            <div className="text-xs glass-text-muted mb-2">Development Test Inputs:</div>
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
                                        className="glass-button text-xs disabled:glass-subtle disabled:cursor-not-allowed px-3 py-1"
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
                        <div className="glass-card glass-purple">
                            <div className="text-sm font-medium text-purple-300 mb-2">Interruptions</div>
                            <div className="text-2xl font-bold glass-text">{interruptionCount}</div>
                            {lastInterruption && (
                                <div className="text-xs glass-text-muted mt-2">
                                    Last: {lastInterruption.interruptionType} interruption
                                </div>
                            )}
                        </div>

                        {/* Conversation stats */}
                        <div className="glass-card glass-blue">
                            <div className="text-sm font-medium text-blue-300 mb-2">Messages</div>
                            <div className="flex justify-between text-sm glass-text">
                                <span>User: {conversationHistory.filter(m => m.type === 'user').length}</span>
                                <span>AI: {conversationHistory.filter(m => m.type === 'ai').length}</span>
                            </div>
                        </div>

                        {/* Engine status */}
                        <div className="glass-card glass-green">
                            <div className="text-sm font-medium text-green-300 mb-2">Engine Status</div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="glass-text">Processing:</span>
                                    <span className={status.isProcessing ? 'text-green-400' : 'glass-text-muted'}>
                                        {status.isProcessing ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="glass-text">Connected:</span>
                                    <span className={status.isConnected ? 'text-green-400' : 'text-red-400'}>
                                        {status.isConnected ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Revolutionary features info */}
                        <div className="glass-card glass-gradient-overlay glass-blue">
                            <div className="text-sm font-medium text-cyan-300 mb-2">🚀 Revolutionary Features</div>
                            <div className="text-xs glass-text space-y-1">
                                <div>✓ Continuous listening during AI speech</div>
                                <div>✓ Natural interruption handling</div>
                                <div>✓ Zero conversation delays</div>
                                <div>✓ Context preservation</div>
                                <div>✓ Real-time voice activity detection</div>
                                <div>✓ Glassmorphism UI design</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden audio visualizer for analysis */}
            <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none">
                <AudioVisualizer
                    ref={audioVisualizerRef}
                    isActive={status.isListening || status.isSpeaking}
                    mode="bars"
                    onAudioAnalysis={setAudioAnalysis}
                />
            </div>
        </div>
    )
}
