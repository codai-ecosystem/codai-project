/**
 * Real-time Code Assistance Component
 * Provides live AI-powered code suggestions and assistance while coding
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
    Brain,
    Lightbulb,
    Zap,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Play,
    Pause,
    Settings,
    Wand2,
    Code,
    MessageCircle,
    X,
    Copy,
    Check,
    ArrowRight,
    Clock,
    Target,
    Sparkles
} from 'lucide-react'

interface AISuggestion {
    id: string
    type: 'completion' | 'refactor' | 'fix' | 'optimization' | 'pattern'
    title: string
    description: string
    code: string
    changes?: Array<{
        type: 'insert' | 'replace' | 'delete'
        position: { line: number; column: number }
        oldText?: string
        newText: string
    }>
    confidence: number
    benefits: string[]
    tags: string[]
}

interface AssistanceState {
    isActive: boolean
    currentSuggestions: AISuggestion[]
    pendingAnalysis: boolean
    lastAnalysisTime: Date | null
    totalSuggestions: number
    appliedSuggestions: number
}

interface RealTimeCodeAssistantProps {
    projectId: string
    filePath?: string
    currentCode: string
    cursorPosition: { line: number; column: number }
    selectedText?: string
    language: string
    onApplySuggestion: (suggestion: AISuggestion) => void
    onCodeChange?: (newCode: string) => void
    isEnabled?: boolean
}

export default function RealTimeCodeAssistant({
    projectId,
    filePath,
    currentCode,
    cursorPosition,
    selectedText,
    language,
    onApplySuggestion,
    onCodeChange,
    isEnabled = true
}: RealTimeCodeAssistantProps) {
    const [assistanceState, setAssistanceState] = useState<AssistanceState>({
        isActive: isEnabled,
        currentSuggestions: [],
        pendingAnalysis: false,
        lastAnalysisTime: null,
        totalSuggestions: 0,
        appliedSuggestions: 0
    })

    const [chatMode, setChatMode] = useState(false)
    const [userQuery, setUserQuery] = useState('')
    const [chatHistory, setChatHistory] = useState<Array<{
        type: 'user' | 'assistant'
        content: string
        timestamp: Date
        suggestions?: AISuggestion[]
    }>>([])

    const [settings, setSettings] = useState({
        autoSuggest: true,
        suggestionDelay: 1000,
        maxSuggestions: 5,
        confidenceThreshold: 0.7,
        enabledTypes: ['completion', 'refactor', 'fix', 'optimization', 'pattern']
    })

    const [copiedSuggestionId, setCopiedSuggestionId] = useState<string | null>(null)

    const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastCodeRef = useRef<string>('')
    const lastPositionRef = useRef<{ line: number; column: number }>({ line: 0, column: 0 })

    // Initialize and setup real-time analysis
    useEffect(() => {
        if (assistanceState.isActive) {
            scheduleAnalysis()
        }

        return () => {
            if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current)
            }
        }
    }, [currentCode, cursorPosition, assistanceState.isActive])

    // Schedule analysis with debouncing
    const scheduleAnalysis = useCallback(() => {
        if (analysisTimeoutRef.current) {
            clearTimeout(analysisTimeoutRef.current)
        }

        // Check if significant change occurred
        const codeChanged = currentCode !== lastCodeRef.current
        const positionChanged =
            cursorPosition.line !== lastPositionRef.current.line ||
            cursorPosition.column !== lastPositionRef.current.column

        if (!codeChanged && !positionChanged) {
            return
        }

        analysisTimeoutRef.current = setTimeout(() => {
            if (settings.autoSuggest && assistanceState.isActive) {
                performRealTimeAnalysis()
            }
        }, settings.suggestionDelay)

        lastCodeRef.current = currentCode
        lastPositionRef.current = cursorPosition
    }, [currentCode, cursorPosition, settings, assistanceState.isActive])

    // Perform real-time analysis
    const performRealTimeAnalysis = async () => {
        if (assistanceState.pendingAnalysis) return

        setAssistanceState(prev => ({ ...prev, pendingAnalysis: true }))

        try {
            const response = await fetch(`/api/projects/${projectId}/assistant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'suggest',
                    context: {
                        filePath,
                        code: currentCode,
                        language,
                        line: cursorPosition.line,
                        column: cursorPosition.column,
                        selection: selectedText ? { text: selectedText } : undefined
                    },
                    options: {
                        maxSuggestions: settings.maxSuggestions,
                        includeExplanation: true,
                        includeAlternatives: true
                    }
                })
            })

            if (response.ok) {
                const data = await response.json()
                const filteredSuggestions = data.suggestions.filter((suggestion: AISuggestion) =>
                    suggestion.confidence >= settings.confidenceThreshold &&
                    settings.enabledTypes.includes(suggestion.type)
                )

                setAssistanceState(prev => ({
                    ...prev,
                    currentSuggestions: filteredSuggestions,
                    lastAnalysisTime: new Date(),
                    totalSuggestions: prev.totalSuggestions + filteredSuggestions.length
                }))
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Real-time analysis failed:', error)
        } finally {
            setAssistanceState(prev => ({ ...prev, pendingAnalysis: false }))
        }
    }

    // Handle suggestion application
    const handleApplySuggestion = (suggestion: AISuggestion) => {
        onApplySuggestion(suggestion)
        setAssistanceState(prev => ({
            ...prev,
            appliedSuggestions: prev.appliedSuggestions + 1,
            currentSuggestions: prev.currentSuggestions.filter(s => s.id !== suggestion.id)
        }))
    }

    // Handle chat interaction
    const handleChatSubmit = async () => {
        if (!userQuery.trim()) return

        const userMessage = {
            type: 'user' as const,
            content: userQuery,
            timestamp: new Date()
        }

        setChatHistory(prev => [...prev, userMessage])
        setUserQuery('')

        try {
            const response = await fetch(`/api/projects/${projectId}/assistant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'explain',
                    context: {
                        filePath,
                        code: selectedText || currentCode,
                        language,
                        userQuery
                    },
                    options: {
                        includeExplanation: true,
                        includeAlternatives: true,
                        difficulty: 'intermediate'
                    }
                })
            })

            if (response.ok) {
                const data = await response.json()
                const assistantMessage = {
                    type: 'assistant' as const,
                    content: data.explanation || 'I can help you understand this code better.',
                    timestamp: new Date(),
                    suggestions: data.suggestions || []
                }

                setChatHistory(prev => [...prev, assistantMessage])
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Chat request failed:', error)
        }
    }

    // Copy suggestion code
    const copySuggestionCode = async (suggestion: AISuggestion) => {
        try {
            await navigator.clipboard.writeText(suggestion.code)
            setCopiedSuggestionId(suggestion.id)
            setTimeout(() => setCopiedSuggestionId(null), 2000)
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to copy:', error)
        }
    }

    // Toggle assistance
    const toggleAssistance = () => {
        setAssistanceState(prev => ({
            ...prev,
            isActive: !prev.isActive,
            currentSuggestions: prev.isActive ? [] : prev.currentSuggestions
        }))
    }

    // Get suggestion icon
    const getSuggestionIcon = (type: string) => {
        switch (type) {
            case 'completion': return <Code className="w-4 h-4" />
            case 'refactor': return <Wand2 className="w-4 h-4" />
            case 'fix': return <AlertCircle className="w-4 h-4" />
            case 'optimization': return <Zap className="w-4 h-4" />
            case 'pattern': return <Target className="w-4 h-4" />
            default: return <Lightbulb className="w-4 h-4" />
        }
    }

    // Get suggestion color
    const getSuggestionColor = (type: string) => {
        switch (type) {
            case 'completion': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'refactor': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            case 'fix': return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'optimization': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'pattern': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Brain className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">AI Code Assistant</h3>
                            <p className="text-sm text-gray-400">
                                {assistanceState.totalSuggestions} suggestions • {assistanceState.appliedSuggestions} applied
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setChatMode(!chatMode)}
                            className={`p-2 rounded-lg transition-colors ${chatMode ? 'bg-indigo-500/30 text-indigo-400' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                }`}
                            title="Toggle Chat Mode"
                        >
                            <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                            onClick={toggleAssistance}
                            className={`p-2 rounded-lg transition-colors ${assistanceState.isActive
                                    ? 'bg-green-500/30 text-green-400'
                                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                }`}
                            title={assistanceState.isActive ? 'Disable AI Assistant' : 'Enable AI Assistant'}
                        >
                            {assistanceState.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {assistanceState.pendingAnalysis && (
                    <div className="mt-3 flex items-center space-x-2 text-sm text-gray-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing code...</span>
                    </div>
                )}
            </div>

            {/* Chat Mode */}
            {chatMode && (
                <div className="border-b border-gray-700 p-4 bg-gray-800/50">
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                        {chatHistory.map((message, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg ${message.type === 'user'
                                        ? 'bg-indigo-500/20 text-indigo-300 ml-8'
                                        : 'bg-gray-700/50 text-gray-300 mr-8'
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                {message.suggestions && message.suggestions.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {message.suggestions.map(suggestion => (
                                            <button
                                                key={suggestion.id}
                                                onClick={() => handleApplySuggestion(suggestion)}
                                                className="block w-full text-left p-2 bg-gray-600/30 hover:bg-gray-600/50 rounded text-xs transition-colors"
                                            >
                                                {suggestion.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                            placeholder="Ask about the code..."
                            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleChatSubmit}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Suggestions */}
            <div className="p-4">
                {assistanceState.isActive ? (
                    assistanceState.currentSuggestions.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-3">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-medium text-gray-300">
                                    AI Suggestions ({assistanceState.currentSuggestions.length})
                                </span>
                            </div>

                            {assistanceState.currentSuggestions.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className={`p-1 rounded border ${getSuggestionColor(suggestion.type)}`}>
                                                {getSuggestionIcon(suggestion.type)}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium text-sm">{suggestion.title}</h4>
                                                <p className="text-xs text-gray-400">{suggestion.description}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <span className="text-xs text-gray-500">
                                                {Math.round(suggestion.confidence * 100)}%
                                            </span>
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => copySuggestionCode(suggestion)}
                                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                                    title="Copy code"
                                                >
                                                    {copiedSuggestionId === suggestion.id ? (
                                                        <Check className="w-3 h-3 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {suggestion.code && (
                                        <pre className="bg-black/30 rounded p-3 text-xs text-gray-300 overflow-x-auto mb-3 font-mono">
                                            {suggestion.code}
                                        </pre>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex space-x-1">
                                            {suggestion.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handleApplySuggestion(suggestion)}
                                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>

                                    {suggestion.benefits.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-700">
                                            <p className="text-xs text-gray-400 mb-1">Benefits:</p>
                                            <ul className="text-xs text-gray-500 space-y-1">
                                                {suggestion.benefits.slice(0, 2).map((benefit, index) => (
                                                    <li key={index} className="flex items-center space-x-1">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">
                                {assistanceState.lastAnalysisTime
                                    ? 'No suggestions for current context'
                                    : 'Start typing to get AI suggestions'
                                }
                            </p>
                            {assistanceState.lastAnalysisTime && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Last analysis: {assistanceState.lastAnalysisTime.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    )
                ) : (
                    <div className="text-center py-8">
                        <Play className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">AI Assistant is disabled</p>
                        <button
                            onClick={toggleAssistance}
                            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
                        >
                            Enable Assistant
                        </button>
                    </div>
                )}
            </div>

            {/* Settings Panel */}
            <div className="border-t border-gray-700 p-4 bg-gray-800/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Auto-suggest</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoSuggest}
                            onChange={(e) => setSettings(prev => ({ ...prev, autoSuggest: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Delay: {settings.suggestionDelay}ms</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>Threshold: {Math.round(settings.confidenceThreshold * 100)}%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
