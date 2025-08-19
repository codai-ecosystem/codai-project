'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Bot,
    Send,
    Mic,
    MicOff,
    Settings,
    Code,
    FileText,
    Lightbulb,
    Zap,
    Clock,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Brain,
    Wand2,
    Search,
    Download,
    Share2,
    Star,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react'

interface Message {
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: Date
    codeBlocks?: CodeBlock[]
    suggestions?: string[]
    rating?: 'up' | 'down'
}

interface CodeBlock {
    id: string
    language: string
    code: string
    filename?: string
    explanation: string
}

interface AIMetrics {
    totalAssists: number
    codeGenerated: number
    bugsFixed: number
    testsCreated: number
    documentsGenerated: number
    refactoringSuggestions: number
    performanceOptimizations: number
    securityImprovements: number
}

interface QuickAction {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    category: string
    prompt: string
}

const AIDE_AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [metrics, setMetrics] = useState<AIMetrics | null>(null)
    const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const quickActions: QuickAction[] = [
        {
            id: 'generate_code',
            title: 'Generate Code',
            description: 'Create functions, classes, or components',
            icon: <Code className="w-5 h-5" />,
            category: 'Generation',
            prompt: 'Generate a TypeScript function that'
        },
        {
            id: 'fix_bug',
            title: 'Fix Bug',
            description: 'Identify and resolve code issues',
            icon: <Zap className="w-5 h-5" />,
            category: 'Debugging',
            prompt: 'Help me fix this bug:'
        },
        {
            id: 'optimize_code',
            title: 'Optimize Code',
            description: 'Improve performance and efficiency',
            icon: <Lightbulb className="w-5 h-5" />,
            category: 'Optimization',
            prompt: 'Optimize this code for better performance:'
        },
        {
            id: 'write_tests',
            title: 'Write Tests',
            description: 'Create unit and integration tests',
            icon: <CheckCircle className="w-5 h-5" />,
            category: 'Testing',
            prompt: 'Write comprehensive tests for:'
        },
        {
            id: 'document_code',
            title: 'Document Code',
            description: 'Generate documentation and comments',
            icon: <FileText className="w-5 h-5" />,
            category: 'Documentation',
            prompt: 'Create documentation for:'
        },
        {
            id: 'refactor_code',
            title: 'Refactor Code',
            description: 'Improve code structure and readability',
            icon: <Wand2 className="w-5 h-5" />,
            category: 'Refactoring',
            prompt: 'Refactor this code to improve:'
        }
    ]

    useEffect(() => {
        // Simulate loading AI metrics
        setMetrics({
            totalAssists: 342,
            codeGenerated: 48700,
            bugsFixed: 156,
            testsCreated: 87,
            documentsGenerated: 43,
            refactoringSuggestions: 129,
            performanceOptimizations: 67,
            securityImprovements: 34
        })

        // Initialize with a welcome message
        setMessages([{
            id: '1',
            type: 'assistant',
            content: 'Hello! I\'m your AI coding assistant. I can help you generate code, fix bugs, write tests, optimize performance, and much more. What would you like to work on today?',
            timestamp: new Date(),
            suggestions: [
                'Generate a React component',
                'Help debug an error',
                'Write unit tests',
                'Optimize database queries'
            ]
        }])
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        // Simulate AI response
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: 'I understand you need help with that. Let me analyze your request and provide a comprehensive solution.',
                timestamp: new Date(),
                codeBlocks: [
                    {
                        id: '1',
                        language: 'typescript',
                        code: `// Example TypeScript solution
interface UserData {
  id: string;
  name: string;
  email: string;
}

const processUserData = async (userData: UserData): Promise<void> => {
  try {
    // Validate input
    if (!userData.id || !userData.email) {
      throw new Error('Invalid user data');
    }
    
    // Process the data
    console.log(\`Processing user: \${userData.name}\`);
    // Add your logic here
    
  } catch (error) {
    console.error('Error processing user data:', error);
  }
};`,
                        filename: 'userProcessor.ts',
                        explanation: 'This TypeScript function provides type-safe user data processing with proper error handling and validation.'
                    }
                ],
                suggestions: [
                    'Add input validation',
                    'Include error handling',
                    'Write unit tests for this function',
                    'Add JSDoc documentation'
                ]
            }

            setMessages(prev => [...prev, assistantMessage])
            setIsLoading(false)
        }, 2000)
    }

    const handleQuickAction = (action: QuickAction) => {
        setInputValue(action.prompt + ' ')
        setSelectedQuickAction(action.id)
    }

    const rateMessage = (messageId: string, rating: 'up' | 'down') => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, rating } : msg
        ))
    }

    const toggleListening = () => {
        setIsListening(!isListening)
        // Voice recognition would be implemented here
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-100 to-slate-100 rounded-lg">
                                <Bot className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
                                    AI Assistant
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    Intelligent coding companion with advanced AI capabilities
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                            >
                                <Settings className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Metrics and Quick Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* AI Metrics */}
                        {metrics && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-blue-600" />
                                    AI Metrics
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 text-sm">Total Assists</span>
                                        <span className="font-semibold text-slate-900">{metrics.totalAssists}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 text-sm">Code Generated</span>
                                        <span className="font-semibold text-blue-600">{metrics.codeGenerated.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 text-sm">Bugs Fixed</span>
                                        <span className="font-semibold text-emerald-600">{metrics.bugsFixed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 text-sm">Tests Created</span>
                                        <span className="font-semibold text-purple-600">{metrics.testsCreated}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-600" />
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                {quickActions.map((action) => (
                                    <motion.button
                                        key={action.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleQuickAction(action)}
                                        className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${selectedQuickAction === action.id
                                                ? 'border-blue-300 bg-blue-50 text-blue-900'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {action.icon}
                                            <div className="flex-1">
                                                <div className="font-medium">{action.title}</div>
                                                <div className="text-xs text-slate-500 mt-1">{action.description}</div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Chat Interface */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg h-[600px] flex flex-col">
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.type === 'assistant' && (
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                        )}

                                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                                            <div className={`p-4 rounded-lg ${message.type === 'user'
                                                    ? 'bg-gradient-to-r from-blue-600 to-slate-600 text-white'
                                                    : 'bg-slate-100 text-slate-900'
                                                }`}>
                                                <p className="whitespace-pre-wrap">{message.content}</p>

                                                {/* Code Blocks */}
                                                {message.codeBlocks && message.codeBlocks.map((block) => (
                                                    <div key={block.id} className="mt-4 bg-slate-900 rounded-lg overflow-hidden">
                                                        <div className="flex items-center justify-between p-3 bg-slate-800 text-slate-300">
                                                            <span className="text-sm font-medium">{block.filename || block.language}</span>
                                                            <div className="flex gap-2">
                                                                <button className="p-1 hover:bg-slate-700 rounded">
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                                <button className="p-1 hover:bg-slate-700 rounded">
                                                                    <Share2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <pre className="p-4 text-sm text-slate-100 overflow-x-auto">
                                                            <code>{block.code}</code>
                                                        </pre>
                                                        <div className="p-3 bg-slate-800 text-slate-300 text-sm border-t border-slate-700">
                                                            {block.explanation}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Suggestions */}
                                                {message.suggestions && message.suggestions.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        <p className="text-sm font-medium text-slate-600">Suggestions:</p>
                                                        {message.suggestions.map((suggestion, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setInputValue(suggestion)}
                                                                className="block w-full text-left p-2 text-sm bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-700"
                                                            >
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Message Actions */}
                                            {message.type === 'assistant' && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => rateMessage(message.id, 'up')}
                                                        className={`p-1 rounded ${message.rating === 'up' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => rateMessage(message.id, 'down')}
                                                        className={`p-1 rounded ${message.rating === 'down' ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}`}
                                                    >
                                                        <ThumbsDown className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-xs text-slate-500 ml-2">
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {message.type === 'user' && (
                                            <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm font-medium">U</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-slate-500 rounded-full flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="bg-slate-100 rounded-lg p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-slate-600 text-sm">AI is thinking...</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-slate-200 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Ask me anything about your code..."
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                                        />
                                        <button
                                            onClick={toggleListening}
                                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${isListening ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="bg-gradient-to-r from-blue-600 to-slate-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" />
                                        Send
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Advanced AI Coding Assistant
                        </h3>
                        <p className="text-slate-600 max-w-3xl mx-auto">
                            Powered by state-of-the-art language models, AIDE's AI Assistant provides context-aware
                            code generation, intelligent debugging, comprehensive testing, and optimization suggestions
                            to accelerate your development workflow.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIDE_AIAssistant
