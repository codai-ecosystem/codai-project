'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    Code,
    Send,
    Mic,
    MicOff,
    Settings,
    Zap,
    GitBranch,
    Database,
    Server,
    Sparkles,
    Terminal,
    FileCode,
    Folder
} from 'lucide-react';

interface Message {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: {
        action?: 'code_generation' | 'file_creation' | 'deployment' | 'analysis';
        files?: string[];
        services?: string[];
    };
}

interface AideSession {
    id: string;
    name: string;
    status: 'active' | 'idle' | 'working';
    lastActivity: Date;
    messageCount: number;
    projectType?: string;
}

export default function AideInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [currentSession, setCurrentSession] = useState<AideSession | null>(null);
    const [sessions, setSessions] = useState<AideSession[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Initialize AIDE session
        initializeSession();

        // Auto-scroll to bottom when new messages arrive
        scrollToBottom();
    }, [messages]);

    const initializeSession = () => {
        const newSession: AideSession = {
            id: `aide-${Date.now()}`,
            name: 'New Development Session',
            status: 'active',
            lastActivity: new Date(),
            messageCount: 0,
            projectType: 'codai-ecosystem'
        };

        setCurrentSession(newSession);
        setSessions([newSession]);
        setIsConnected(true);

        // Welcome message
        const welcomeMessage: Message = {
            id: `msg-${Date.now()}`,
            type: 'assistant',
            content: `🚀 Welcome to AIDE - Your AI Development Environment!

I'm ready to help you build, deploy, and manage your Codai ecosystem services. Here's what I can do:

**🔧 Development Tasks:**
• Generate code for any of your 11 services
• Create new components and features
• Debug and optimize existing code
• Set up development environments

**🌐 Service Management:**
• Deploy to memorai.ro, logai.ro, bancai.ro, etc.
• Monitor service health and performance  
• Manage database schemas and migrations
• Configure authentication and APIs

**💡 Smart Suggestions:**
• Recommend best practices and patterns
• Integrate with your existing shadcn/ui components
• Ensure consistency across your ecosystem

What would you like to work on today?`,
            timestamp: new Date()
        };

        setMessages([welcomeMessage]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !currentSession) return;

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            const aiResponse = generateAideResponse(inputMessage);
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);

            // Update session
            setCurrentSession(prev => prev ? {
                ...prev,
                messageCount: prev.messageCount + 2,
                lastActivity: new Date()
            } : null);
        }, 1500);
    };

    const generateAideResponse = (userInput: string): Message => {
        const input = userInput.toLowerCase();

        // Detect intent and generate appropriate response
        if (input.includes('create') || input.includes('generate')) {
            return {
                id: `msg-${Date.now()}`,
                type: 'assistant',
                content: `✨ I'll help you create that! Let me generate the code for you.

Based on your request, I'll:
1. 📁 Create the necessary file structure  
2. 🎨 Use your shadcn/ui design system
3. 🔗 Integrate with your existing services
4. ✅ Add proper TypeScript types and error handling

Would you like me to:
• Create a React component with Next.js 15
• Set up API routes with authentication  
• Add database models with Prisma
• Configure deployment to your services

Let me know the specific details and I'll generate production-ready code!`,
                timestamp: new Date(),
                metadata: {
                    action: 'code_generation',
                    files: ['component.tsx', 'api-route.ts', 'types.ts'],
                    services: ['codai', 'memorai', 'logai']
                }
            };
        }

        if (input.includes('deploy') || input.includes('build')) {
            return {
                id: `msg-${Date.now()}`,
                type: 'assistant',
                content: `🚀 Ready to deploy! I'll help you build and deploy to your Codai ecosystem.

**Deployment Options:**
• 🏠 **codai.ro** - Central platform (Next.js)
• 🧠 **memorai.ro** - Memory service (MCP Server) 
• 🔐 **logai.ro** - Authentication service
• 💰 **bancai.ro** - Financial platform
• 🛠️ **fabricai.ro** - AI services platform

I'll ensure:
✅ All builds pass successfully
✅ Environment variables are configured
✅ Database migrations are applied
✅ SSL certificates are valid
✅ Health checks are working

Which service would you like to deploy?`,
                timestamp: new Date(),
                metadata: {
                    action: 'deployment',
                    services: ['codai', 'memorai', 'logai', 'bancai', 'fabricai']
                }
            };
        }

        if (input.includes('debug') || input.includes('error') || input.includes('fix')) {
            return {
                id: `msg-${Date.now()}`,
                type: 'assistant',
                content: `🔍 I'll help you debug that issue! Let me analyze your codebase.

**Debugging Tools Available:**
• 📊 Real-time error monitoring across all services
• 🔍 Log analysis with intelligent pattern detection  
• 🧪 Automated testing and validation
• 📈 Performance profiling and optimization

**Common Issues I Can Fix:**
• TypeScript compilation errors
• Next.js build and runtime issues
• API authentication and CORS problems
• Database connection and migration issues
• UI component import and styling problems

Share the error details or logs, and I'll provide a step-by-step solution!`,
                timestamp: new Date(),
                metadata: {
                    action: 'analysis',
                    services: ['all']
                }
            };
        }

        // Default helpful response
        return {
            id: `msg-${Date.now()}`,
            type: 'assistant',
            content: `I'm here to help with your Codai ecosystem development! 

**Popular Commands:**
• "Create a new component for [service]"
• "Deploy [service] to production" 
• "Debug the authentication flow"
• "Generate API routes for [feature]"
• "Set up database models for [entity]"
• "Optimize performance for [service]"

**Recent Activity:**
📈 10 services building successfully
🔧 All UI components deployed
✅ Infrastructure 100% operational

What would you like me to help you build today?`,
            timestamp: new Date()
        };
    };

    const toggleVoiceInput = () => {
        setIsListening(!isListening);
        // In a real implementation, this would integrate with Web Speech API
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const getStatusIcon = (status: AideSession['status']) => {
        switch (status) {
            case 'active': return <Zap className="w-3 h-3 text-green-500" />;
            case 'working': return <Terminal className="w-3 h-3 text-blue-500 animate-pulse" />;
            default: return <MessageCircle className="w-3 h-3 text-gray-400" />;
        }
    };

    const getMessageIcon = (message: Message) => {
        if (message.type === 'user') return null;

        switch (message.metadata?.action) {
            case 'code_generation': return <FileCode className="w-4 h-4 text-blue-500" />;
            case 'deployment': return <Server className="w-4 h-4 text-green-500" />;
            case 'analysis': return <Database className="w-4 h-4 text-purple-500" />;
            default: return <Sparkles className="w-4 h-4 text-indigo-500" />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Code className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">AIDE - AI Development Environment</h2>
                        <div className="flex items-center space-x-2 text-sm text-blue-100">
                            {currentSession && (
                                <>
                                    {getStatusIcon(currentSession.status)}
                                    <span>Session: {currentSession.name}</span>
                                    <span>•</span>
                                    <span>{currentSession.messageCount} messages</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-4 ${message.type === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 shadow-sm'
                                }`}
                        >
                            {message.type === 'assistant' && (
                                <div className="flex items-center space-x-2 mb-2">
                                    {getMessageIcon(message)}
                                    <span className="text-xs font-medium text-gray-500">AIDE Assistant</span>
                                </div>
                            )}

                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {message.content}
                            </div>

                            {message.metadata && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex flex-wrap gap-2">
                                        {message.metadata.files?.map((file) => (
                                            <span
                                                key={file}
                                                className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                                            >
                                                <FileCode className="w-3 h-3 mr-1" />
                                                {file}
                                            </span>
                                        ))}
                                        {message.metadata.services?.map((service) => (
                                            <span
                                                key={service}
                                                className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md"
                                            >
                                                <Server className="w-3 h-3 mr-1" />
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                                }`}>
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-medium text-gray-500">AIDE is thinking...</span>
                            </div>
                            <div className="flex space-x-1 mt-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex items-end space-x-3">
                    <div className="flex-1">
                        <textarea
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask AIDE to help you build, deploy, or debug anything in your Codai ecosystem..."
                            className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={Math.min(inputMessage.split('\n').length, 4)}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            Press Enter to send • Shift+Enter for new line
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={toggleVoiceInput}
                            className={`p-3 rounded-lg transition-colors ${isListening
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim()}
                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {[
                        'Create new component',
                        'Deploy to production',
                        'Debug build errors',
                        'Generate API routes',
                        'Setup database schema'
                    ].map((action) => (
                        <button
                            key={action}
                            onClick={() => setInputMessage(action)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {action}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
