'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    Plus,
    X,
    Send,
    User,
    Bot,
    FolderTree,
    ChevronRight,
    ChevronDown,
    Settings,
    Terminal,
    Paperclip,
    Smile,
    Copy,
    ExternalLink,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Activity,
    FileText,
    Code,
    Clock,
    ArrowLeft
} from 'lucide-react'

interface Project {
    id: string
    name: string
    status: 'active' | 'building' | 'completed' | 'error'
    conversations: number
    notifications: number
}

interface Message {
    id: string
    type: 'user' | 'ai' | 'system'
    content: string
    timestamp: Date
    metadata?: {
        status?: 'pending' | 'executing' | 'completed' | 'error'
        progress?: number
        files?: string[]
    }
}

interface Conversation {
    id: string
    title: string
    projectId?: string
    messages: Message[]
    isActive: boolean
    lastActivity: Date
}

const AideChatInterface = () => {
    const [projects] = useState<Project[]>([
        {
            id: '1',
            name: 'E-commerce Platform',
            status: 'building',
            conversations: 3,
            notifications: 1
        },
        {
            id: '2',
            name: 'AI Chat Bot',
            status: 'completed',
            conversations: 5,
            notifications: 0
        },
        {
            id: '3',
            name: 'Dashboard Analytics',
            status: 'active',
            conversations: 2,
            notifications: 1
        }
    ])

    const [conversations, setConversations] = useState<Conversation[]>([
        {
            id: '1',
            title: 'Build React Components',
            projectId: '1',
            isActive: true,
            lastActivity: new Date(),
            messages: [
                {
                    id: '1',
                    type: 'user',
                    content: 'Create a user authentication component with login and signup forms',
                    timestamp: new Date(Date.now() - 300000)
                },
                {
                    id: '2',
                    type: 'ai',
                    content: "I'll create a comprehensive authentication component for you. This will include login and signup forms with proper validation, state management, and styling.",
                    timestamp: new Date(Date.now() - 240000),
                    metadata: {
                        status: 'executing',
                        progress: 75,
                        files: ['src/components/Auth/LoginForm.tsx', 'src/components/Auth/SignupForm.tsx', 'src/hooks/useAuth.ts']
                    }
                },
                {
                    id: '3',
                    type: 'system',
                    content: 'Authentication components created successfully. Tests added and passing.',
                    timestamp: new Date(Date.now() - 60000),
                    metadata: {
                        status: 'completed',
                        files: ['src/components/Auth/LoginForm.tsx', 'src/components/Auth/SignupForm.tsx', 'src/hooks/useAuth.ts', 'src/__tests__/Auth.test.tsx']
                    }
                }
            ]
        }
    ])

    const [activeConversation, setActiveConversation] = useState<string>('1')
    const [message, setMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [conversations])

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'building': return 'bg-blue-500'
            case 'completed': return 'bg-green-500'
            case 'error': return 'bg-red-500'
            default: return 'bg-yellow-500'
        }
    }

    const getStatusIcon = (status: Project['status']) => {
        switch (status) {
            case 'building': return <Loader2 className="w-3 h-3 animate-spin" />
            case 'completed': return <CheckCircle className="w-3 h-3" />
            case 'error': return <AlertTriangle className="w-3 h-3" />
            default: return <Activity className="w-3 h-3" />
        }
    }

    const handleSendMessage = async () => {
        if (!message.trim() || !activeConversation) return

        const newMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            timestamp: new Date()
        }

        // Add user message immediately
        setConversations(prev => prev.map(conv =>
            conv.id === activeConversation
                ? { ...conv, messages: [...conv.messages, newMessage] }
                : conv
        ))

        setMessage('')
        setIsTyping(true)

        try {
            // Call AI API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: newMessage.content,
                    conversationId: activeConversation,
                    projectId: conversations.find(c => c.id === activeConversation)?.projectId
                })
            })

            if (response.ok) {
                const data = await response.json()

                const aiResponse: Message = {
                    id: Date.now().toString() + '_ai',
                    type: 'ai',
                    content: data.message || "I'm here to help you build amazing projects! What would you like to create?",
                    timestamp: new Date(),
                    metadata: {
                        status: 'completed'
                    }
                }

                setConversations(prev => prev.map(conv =>
                    conv.id === activeConversation
                        ? { ...conv, messages: [...conv.messages, aiResponse] }
                        : conv
                ))
            } else {
                throw new Error('Failed to get AI response')
            }
        } catch (error) {
            console.error('Chat error:', error)

            // Add error message
            const errorResponse: Message = {
                id: Date.now().toString() + '_error',
                type: 'ai',
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date(),
                metadata: {
                    status: 'error'
                }
            }

            setConversations(prev => prev.map(conv =>
                conv.id === activeConversation
                    ? { ...conv, messages: [...conv.messages, errorResponse] }
                    : conv
            ))
        } finally {
            setIsTyping(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const createNewConversation = () => {
        const newConv: Conversation = {
            id: Date.now().toString(),
            title: `New Chat ${conversations.length + 1}`,
            projectId: projects[0]?.id,
            isActive: false,
            lastActivity: new Date(),
            messages: []
        }

        setConversations(prev => [...prev, newConv])
        setActiveConversation(newConv.id)
    }

    const closeConversation = (id: string) => {
        setConversations(prev => prev.filter(conv => conv.id !== id))
        if (activeConversation === id) {
            const remaining = conversations.filter(conv => conv.id !== id)
            setActiveConversation(remaining.length > 0 ? remaining[0].id : '')
        }
    }

    const activeConv = conversations.find(c => c.id === activeConversation)

    const goBack = () => {
        window.location.href = '/'
    }

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
            <div className="h-full flex flex-col">
                {/* Header */}
                <header className="h-16 bg-black/20 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={goBack}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                        </div>
                        <h1 className="text-xl font-bold text-white">AIDE</h1>
                        <span className="text-gray-400 text-sm">AI Development Environment</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <Settings className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm">Connected</span>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <aside className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300`}>
                        {!sidebarCollapsed && (
                            <>
                                {/* Projects Header */}
                                <div className="p-4 border-b border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-white font-semibold">Projects</h2>
                                        <button
                                            onClick={createNewConversation}
                                            className="p-1 rounded hover:bg-white/10 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={createNewConversation}
                                        className="w-full p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="text-sm font-medium">New Project</span>
                                    </button>
                                </div>

                                {/* Projects List */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className={`rounded-lg p-3 transition-all duration-200 ${activeConv?.projectId === project.id
                                                    ? 'bg-blue-500/20 border border-blue-500/30'
                                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <FolderTree className="w-4 h-4 text-blue-400" />
                                                    <div>
                                                        <h3 className="font-medium text-white text-sm">{project.name}</h3>
                                                        <p className="text-xs text-gray-400">{project.conversations} conversations</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {project.notifications > 0 && (
                                                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                                                            {project.notifications}
                                                        </span>
                                                    )}
                                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)} animate-pulse`} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom Actions */}
                                <div className="p-4 border-t border-white/10 space-y-2">
                                    <button className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-2 text-gray-400">
                                        <Settings className="w-4 h-4" />
                                        <span className="text-sm">Settings</span>
                                    </button>
                                    <button className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-2 text-gray-400">
                                        <Terminal className="w-4 h-4" />
                                        <span className="text-sm">Terminal</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </aside>

                    {/* Main Chat Area */}
                    <main className="flex-1 flex flex-col bg-black/10 backdrop-blur-xl">
                        {/* Chat Tabs */}
                        <div className="border-b border-white/10 bg-black/20">
                            <div className="flex items-center overflow-x-auto">
                                {conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${activeConversation === conv.id
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-transparent hover:bg-white/5'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setActiveConversation(conv.id)}
                                            className="flex items-center space-x-2"
                                        >
                                            <MessageSquare className="w-4 h-4 text-blue-400" />
                                            <span className="text-white text-sm font-medium whitespace-nowrap">
                                                {conv.title}
                                            </span>
                                            {isTyping && activeConversation === conv.id && (
                                                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                                            )}
                                        </button>

                                        <button
                                            onClick={() => closeConversation(conv.id)}
                                            className="p-1 rounded hover:bg-white/10 transition-colors"
                                        >
                                            <X className="w-3 h-3 text-gray-400" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={createNewConversation}
                                    className="flex items-center space-x-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-sm">New Chat</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeConv ? (
                                <div className="space-y-4 max-w-4xl mx-auto">
                                    {activeConv.messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg p-4 ${msg.type === 'user'
                                                        ? 'bg-blue-500/20 border border-blue-500/30'
                                                        : msg.type === 'ai'
                                                            ? 'bg-white/5 border border-white/10'
                                                            : 'bg-green-500/10 border border-green-500/20'
                                                    }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    {msg.type === 'user' ? (
                                                        <div className="w-5 h-5 bg-blue-500 rounded-full mt-0.5 flex items-center justify-center">
                                                            <User className="w-3 h-3 text-white" />
                                                        </div>
                                                    ) : msg.type === 'ai' ? (
                                                        <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mt-0.5" />
                                                    ) : (
                                                        <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5 flex items-center justify-center">
                                                            <CheckCircle className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}

                                                    <div className="flex-1">
                                                        <p className="text-white leading-relaxed">{msg.content}</p>

                                                        {msg.metadata && (
                                                            <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10">
                                                                {msg.metadata.status && (
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        <span className="text-xs text-gray-400">Status:</span>
                                                                        <span
                                                                            className={`text-xs px-2 py-1 rounded ${msg.metadata.status === 'completed'
                                                                                    ? 'bg-green-500/20 text-green-400'
                                                                                    : msg.metadata.status === 'error'
                                                                                        ? 'bg-red-500/20 text-red-400'
                                                                                        : msg.metadata.status === 'executing'
                                                                                            ? 'bg-blue-500/20 text-blue-400'
                                                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                                                }`}
                                                                        >
                                                                            {msg.metadata.status}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {msg.metadata.progress !== undefined && (
                                                                    <div className="mb-2">
                                                                        <div className="flex justify-between text-xs mb-1">
                                                                            <span className="text-gray-400">Progress</span>
                                                                            <span className="text-white">{msg.metadata.progress}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${msg.metadata.progress}%` }}
                                                                                className="bg-blue-400 h-2 rounded-full"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {msg.metadata.files && (
                                                                    <div className="space-y-1">
                                                                        <span className="text-xs text-gray-400">Files:</span>
                                                                        {msg.metadata.files.map((file, idx) => (
                                                                            <div key={idx} className="flex items-center space-x-2 text-xs">
                                                                                <CheckCircle className="w-3 h-3 text-green-400" />
                                                                                <span className="text-white">{file}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-xs text-gray-500">
                                                                {msg.timestamp.toLocaleTimeString()}
                                                            </span>
                                                            <div className="flex items-center space-x-1">
                                                                <button className="p-1 rounded hover:bg-white/10 transition-colors">
                                                                    <Copy className="w-3 h-3 text-gray-400" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-w-[80%]">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full" />
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                        <div
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '0.1s' }}
                                                        />
                                                        <div
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '0.2s' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-white mb-2">Welcome to AIDE Chat</h3>
                                        <p className="text-gray-400 mb-6">Start a conversation to begin building with AI</p>
                                        <button
                                            onClick={createNewConversation}
                                            className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
                                        >
                                            Start New Conversation
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        {activeConv && (
                            <div className="border-t border-white/10 p-4 bg-black/20">
                                <div className="max-w-4xl mx-auto">
                                    <div className="flex items-end space-x-3">
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                                                className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                                rows={message.split('\n').length || 1}
                                                style={{ minHeight: '48px', maxHeight: '200px' }}
                                            />

                                            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                                                <button className="p-1 rounded hover:bg-white/10 transition-colors">
                                                    <Paperclip className="w-4 h-4 text-gray-400" />
                                                </button>
                                                <button className="p-1 rounded hover:bg-white/10 transition-colors">
                                                    <Smile className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!message.trim()}
                                            className="p-3 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/10 border border-blue-500/30 disabled:border-gray-500/20 rounded-lg text-blue-400 disabled:text-gray-500 transition-colors"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Status Bar */}
                <footer className="h-8 bg-black/30 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-4 text-xs">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-gray-300">Chat Active</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-gray-300">Connected</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 text-gray-400">
                        <span>AIDE v2.0.0</span>
                        <span>Chat Interface</span>
                        <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default AideChatInterface
