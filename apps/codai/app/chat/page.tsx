'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    Bot,
    User,
    Code,
    Brain,
    Sparkles,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Settings,
    Download,
    Mic,
    MicOff
} from 'lucide-react'
import { getChatbot, ChatMessage, ChatSession } from '../../../../libs/ai-chatbot'

export default function AIChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [session, setSession] = useState<ChatSession | null>(null)
    const [isListening, setIsListening] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const chatbot = getChatbot()

    useEffect(() => {
        initializeChat()
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const initializeChat = async () => {
        if (!chatbot) {
            console.error('Chatbot not initialized')
            return
        }

        try {
            const newSession = await chatbot.createSession('user-1', {
                model: 'gpt-4',
                temperature: 0.7,
                personalityTraits: ['helpful', 'knowledgeable', 'creative', 'encouraging'],
                enableCodeExecution: true,
                enableWebSearch: true
            })

            setSession(newSession)
            setMessages(newSession.messages.filter(m => m.role !== 'system'))

            // Add welcome message
            const welcomeMessage: ChatMessage = {
                id: 'welcome',
                role: 'assistant',
                content: `# Welcome to CODAI AI Assistant! 🤖

I'm your advanced AI coding companion with powerful capabilities:

🧠 **Natural Language Understanding** - I understand context and intent
💻 **Code Generation** - Generate code in multiple programming languages  
🔍 **Code Analysis** - Review and optimize your code
🛠️ **Troubleshooting** - Debug issues and provide solutions
📚 **Learning Assistant** - Explain concepts and best practices
🌐 **Web Research** - Search for real-time information

**What can I help you with today?**

Try asking me to:
- Generate a React component
- Explain a programming concept
- Debug an error
- Review code quality
- Create API endpoints
- Design system architecture`,
                timestamp: new Date(),
                metadata: {
                    confidence: 1.0,
                    suggestions: [
                        'Generate a React component',
                        'Explain TypeScript types',
                        'Debug a JavaScript error',
                        'Create an API endpoint'
                    ]
                }
            }

            setMessages([welcomeMessage])
        } catch (error) {
            console.error('Failed to initialize chat:', error)
        }
    }

    const sendMessage = async () => {
        if (!inputValue.trim() || !session || !chatbot || isLoading) return

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        try {
            const response = await chatbot.sendMessage(session.id, inputValue)
            setMessages(prev => [...prev, response])
        } catch (error) {
            console.error('Failed to send message:', error)

            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'I apologize, but I encountered an error processing your request. Please try again.',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const copyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content)
    }

    const startVoiceInput = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition()
            recognition.continuous = false
            recognition.interimResults = false

            recognition.onstart = () => setIsListening(true)
            recognition.onend = () => setIsListening(false)

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setInputValue(transcript)
            }

            recognition.start()
        }
    }

    const formatMessage = (content: string) => {
        // Simple markdown-like formatting
        const formatted = content
            .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-sm">$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
            .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3">$1</h2>')
            .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mb-2">$1</h3>')
            .replace(/^\- (.+)$/gm, '<li class="ml-4">• $1</li>')
            .replace(/^```(\w+)?\n([\s\S]*?)```/gm, '<pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')

        return formatted
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI Chat Assistant
                        </h1>
                        <p className="text-slate-400 mt-2">Advanced conversational AI with code generation capabilities</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                        >
                            <Settings className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                        >
                            <Download className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Chat Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-[600px] flex flex-col"
                >
                    {/* Messages Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-6">
                            <AnimatePresence>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-4xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                                            {/* Message Header */}
                                            <div className={`flex items-center space-x-3 mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex items-center space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                                            ? 'bg-blue-500'
                                                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                                        }`}>
                                                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Message Content */}
                                            <div className={`p-4 rounded-2xl ${message.role === 'user'
                                                    ? 'bg-blue-600/20 border border-blue-500/30 ml-auto'
                                                    : 'bg-white/10 border border-white/20'
                                                }`}>
                                                <div
                                                    className="prose prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                                                />

                                                {/* Message Actions */}
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-center space-x-2">
                                                        {message.role === 'assistant' && (
                                                            <>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => copyToClipboard(message.content)}
                                                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                                    title="Copy message"
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </motion.button>

                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                                    title="Good response"
                                                                >
                                                                    <ThumbsUp className="w-4 h-4" />
                                                                </motion.button>

                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                                    title="Poor response"
                                                                >
                                                                    <ThumbsDown className="w-4 h-4" />
                                                                </motion.button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Confidence Score */}
                                                    {message.metadata?.confidence && (
                                                        <div className="text-xs text-slate-500">
                                                            Confidence: {Math.round(message.metadata.confidence * 100)}%
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Suggestions */}
                                                {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                                                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                                        <div className="text-sm font-medium mb-2 flex items-center">
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            Suggestions:
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {message.metadata.suggestions.map((suggestion, index) => (
                                                                <motion.button
                                                                    key={index}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => setInputValue(suggestion)}
                                                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-all border border-white/20"
                                                                >
                                                                    {suggestion}
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Loading Indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-sm text-purple-400">AI is thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-white/20">
                        <div className="flex items-end space-x-4">
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message... (Shift+Enter for new line)"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    rows={1}
                                    style={{ minHeight: '48px', maxHeight: '120px' }}
                                    disabled={isLoading}
                                />

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={startVoiceInput}
                                    className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${isListening
                                            ? 'bg-red-500 text-white'
                                            : 'hover:bg-white/10'
                                        }`}
                                    title="Voice input"
                                >
                                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </motion.button>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={sendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center space-x-2 mt-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setInputValue('Generate a React component for a user profile card')}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-all border border-white/20 flex items-center space-x-1"
                            >
                                <Code className="w-3 h-3" />
                                <span>Generate Code</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setInputValue('Explain the difference between TypeScript interfaces and types')}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-all border border-white/20 flex items-center space-x-1"
                            >
                                <Brain className="w-3 h-3" />
                                <span>Ask Question</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setInputValue('Help me debug this error: TypeError: Cannot read property of undefined')}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-all border border-white/20 flex items-center space-x-1"
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>Debug Issue</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
