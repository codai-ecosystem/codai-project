'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Search,
    Sparkles,
    Brain,
    Zap,
    CheckCircle,
    AlertCircle,
    Loader
} from 'lucide-react'

interface VoiceSearchProps {
    theme: string
    onResults?: (results: string[]) => void
}

interface SearchResult {
    id: string
    title: string
    snippet: string
    relevance: number
    type: 'memory' | 'concept' | 'fact'
}

export function VoiceSearch({ theme, onResults }: VoiceSearchProps) {
    const [isListening, setIsListening] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isSupported, setIsSupported] = useState(false)
    const [confidence, setConfidence] = useState(0)

    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        // Check for Web Speech API support
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            setIsSupported(true)

            const SpeechRecognition = (window as any).webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()

            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = true
            recognitionRef.current.lang = 'en-US'

            recognitionRef.current.onstart = () => {
                setIsListening(true)
                setError(null)
            }

            recognitionRef.current.onresult = (event: any) => {
                const current = event.resultIndex
                const transcript = event.results[current][0].transcript
                const confidence = event.results[current][0].confidence

                setTranscript(transcript)
                setConfidence(confidence)

                if (event.results[current].isFinal) {
                    handleSearch(transcript)
                }
            }

            recognitionRef.current.onerror = (event: any) => {
                setError(`Speech recognition error: ${event.error}`)
                setIsListening(false)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    const handleSearch = async (query: string) => {
        setIsProcessing(true)

        // Simulate AI-powered search
        setTimeout(() => {
            const mockResults: SearchResult[] = [
                {
                    id: '1',
                    title: 'Machine Learning Fundamentals',
                    snippet: 'Core concepts of supervised and unsupervised learning algorithms...',
                    relevance: 0.95,
                    type: 'concept' as const
                },
                {
                    id: '2',
                    title: 'Project Alpha Success Metrics',
                    snippet: 'Achievement of 98% accuracy rate with early delivery...',
                    relevance: 0.87,
                    type: 'memory' as const
                },
                {
                    id: '3',
                    title: 'Neural Network Architecture',
                    snippet: 'Deep understanding of transformer models and attention mechanisms...',
                    relevance: 0.82,
                    type: 'fact' as const
                }
            ].filter(result =>
                result.title.toLowerCase().includes(query.toLowerCase()) ||
                result.snippet.toLowerCase().includes(query.toLowerCase())
            )

            setSearchResults(mockResults)
            setIsProcessing(false)

            if (onResults) {
                onResults(mockResults.map(r => r.title))
            }
        }, 1500)
    }

    const startListening = () => {
        if (recognitionRef.current && isSupported) {
            setTranscript('')
            setSearchResults([])
            setError(null)
            recognitionRef.current.start()
        }
    }

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
    }

    const getResultTypeColor = (type: string) => {
        switch (type) {
            case 'memory': return 'from-purple-500 to-pink-500'
            case 'concept': return 'from-emerald-500 to-teal-500'
            case 'fact': return 'from-blue-500 to-cyan-500'
            default: return 'from-slate-500 to-gray-500'
        }
    }

    if (!isSupported) {
        return (
            <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <div className="text-center">
                    <MicOff className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Voice Search Unavailable</h3>
                    <p className="text-slate-400">Your browser doesn't support speech recognition.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Voice Control Interface */}
            <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <div className="text-center">
                    <motion.div
                        className="relative mx-auto mb-6"
                        animate={{
                            scale: isListening ? [1, 1.1, 1] : 1
                        }}
                        transition={{
                            duration: 1,
                            repeat: isListening ? Infinity : 0
                        }}
                    >
                        <motion.button
                            onClick={isListening ? stopListening : startListening}
                            disabled={isProcessing}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening
                                    ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/25'
                                    : 'bg-gradient-to-r from-sky-500 to-blue-500 shadow-lg shadow-sky-500/25 hover:scale-105'
                                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isProcessing ? (
                                <Loader className="w-8 h-8 text-white animate-spin" />
                            ) : isListening ? (
                                <MicOff className="w-8 h-8 text-white" />
                            ) : (
                                <Mic className="w-8 h-8 text-white" />
                            )}
                        </motion.button>

                        {/* Audio Visualization */}
                        {isListening && (
                            <motion.div
                                className="absolute inset-0 rounded-full border-4 border-red-500/50"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.2, 0.5]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity
                                }}
                            />
                        )}
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        AI Voice Search
                    </h2>
                    <p className="text-slate-400 mb-4">
                        {isListening
                            ? 'Listening... Speak your query'
                            : isProcessing
                                ? 'Processing your request...'
                                : 'Click to start voice search'
                        }
                    </p>

                    {/* Status Indicators */}
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-slate-400'}`} />
                            <span className="text-sm">{isListening ? 'Recording' : 'Ready'}</span>
                        </div>

                        {confidence > 0 && (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                                <CheckCircle className="w-3 h-3" />
                                <span className="text-sm">{(confidence * 100).toFixed(0)}% confidence</span>
                            </div>
                        )}
                    </div>

                    {/* Live Transcript */}
                    <AnimatePresence>
                        {transcript && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white/10 rounded-lg p-4 border border-white/20"
                            >
                                <div className="flex items-start space-x-2">
                                    <Brain className="w-5 h-5 text-sky-400 mt-0.5" />
                                    <div className="flex-1 text-left">
                                        <div className="text-sm text-slate-400 mb-1">Transcript:</div>
                                        <div className="text-white">{transcript}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mt-4"
                        >
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                <span className="text-red-400">{error}</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Search Results */}
            <AnimatePresence>
                {searchResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center space-x-2 mb-4">
                            <Sparkles className="w-5 h-5 text-sky-400" />
                            <h3 className="text-lg font-bold text-white">Search Results</h3>
                            <span className="text-sm text-slate-400 bg-white/10 px-2 py-1 rounded-full">
                                {searchResults.length} found
                            </span>
                        </div>

                        <div className="space-y-3">
                            {searchResults.map((result, index) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glassmorphism rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer group"
                                    whileHover={{ scale: 1.01, x: 5 }}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-10 h-10 bg-gradient-to-r ${getResultTypeColor(result.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <Search className="w-5 h-5 text-white" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                                                    {result.title}
                                                </h4>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-slate-400 bg-white/10 px-2 py-1 rounded-full capitalize">
                                                        {result.type}
                                                    </span>
                                                    <div className="flex items-center space-x-1">
                                                        <Zap className="w-3 h-3 text-yellow-400" />
                                                        <span className="text-xs text-yellow-400">
                                                            {(result.relevance * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                {result.snippet}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Actions */}
            <div className="glassmorphism rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Voice Commands</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-sky-400 rounded-full" />
                            <span className="text-slate-300">"Search for machine learning"</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <span className="text-slate-300">"Find memories about projects"</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-purple-400 rounded-full" />
                            <span className="text-slate-300">"Show me concepts related to AI"</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            <span className="text-slate-300">"What do I know about..."</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-orange-400 rounded-full" />
                            <span className="text-slate-300">"Recall information on..."</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-pink-400 rounded-full" />
                            <span className="text-slate-300">"Analyze patterns in..."</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
