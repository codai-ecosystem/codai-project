'use client';

import React from 'react'
/**
 * Interactive AGI Conversation Page
 * Real-time chat interface with RomAI AGI system
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
    id: string;
    type: 'user' | 'agi';
    content: string;
    timestamp: Date;
    confidence?: number;
    reasoning_trace?: string[];
    tokens_used?: number;
    response_time?: number;
}

interface ConversationState {
    is_connected: boolean;
    agi_status: string;
    session_id: string;
    total_messages: number;
    conversation_context: string[];
}

const ConversationPage = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationState, setConversationState] = useState<ConversationState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize conversation session
        const initializeSession = async () => {
            try {
                const response = await fetch('http://localhost:6101/conversation/initialize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error('Failed to initialize conversation session');
                }

                const sessionData = await response.json();
                setConversationState(sessionData);

                // Add welcome message
                setMessages([{
                    id: 'welcome',
                    type: 'agi',
                    content: 'Salut! Sunt RomAI, un sistem de inteligență artificială generală specializat în limba și cultura română. Cu ce te pot ajuta astăzi?',
                    timestamp: new Date(),
                    confidence: 1.0
                }]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize conversation');
            }
        };

        initializeSession();
    }, []);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!currentMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: currentMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsLoading(true);

        try {
            const startTime = Date.now();

            const response = await fetch('http://localhost:6101/conversation/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentMessage,
                    session_id: conversationState?.session_id,
                    language: 'auto', // Auto-detect language
                    include_reasoning: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AGI response');
            }

            const agiResponse = await response.json();
            const responseTime = Date.now() - startTime;

            const agiMessage: ChatMessage = {
                id: Date.now().toString() + '_agi',
                type: 'agi',
                content: agiResponse.response,
                timestamp: new Date(),
                confidence: agiResponse.confidence,
                reasoning_trace: agiResponse.reasoning_trace,
                tokens_used: agiResponse.tokens_used,
                response_time: responseTime
            };

            setMessages(prev => [...prev, agiMessage]);

            // Update conversation state
            if (agiResponse.conversation_state) {
                setConversationState(agiResponse.conversation_state);
            }

        } catch (err) {
            const errorMessage: ChatMessage = {
                id: Date.now().toString() + '_error',
                type: 'agi',
                content: `Îmi pare rău, am întâmpinat o problemă: ${err instanceof Error ? err.message : 'Eroare necunoscută'}`,
                timestamp: new Date(),
                confidence: 0
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearConversation = () => {
        setMessages([{
            id: 'welcome_new',
            type: 'agi',
            content: 'Conversația a fost resetată. Cu ce te pot ajuta?',
            timestamp: new Date(),
            confidence: 1.0
        }]);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                            <span>💬</span>
                            <span>Conversație cu RomAI</span>
                        </h1>
                        <div className="flex items-center space-x-4 mt-2">
                            {conversationState?.is_connected && (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Status: {conversationState.agi_status}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Mesaje: {conversationState.total_messages}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={clearConversation}
                        className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        🗑️ Resetează
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                max-w-[80%] p-4 rounded-lg shadow-sm
                ${message.type === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700'
                                }
              `}>
                                {/* Message Content */}
                                <div className="mb-2">
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>

                                {/* Message Metadata */}
                                <div className={`
                  text-xs flex items-center justify-between
                  ${message.type === 'user'
                                        ? 'text-blue-100'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }
                `}>
                                    <span>{message.timestamp.toLocaleTimeString('ro-RO')}</span>

                                    {message.type === 'agi' && (
                                        <div className="flex items-center space-x-2">
                                            {message.confidence !== undefined && (
                                                <span>Încredere: {(message.confidence * 100).toFixed(0)}%</span>
                                            )}
                                            {message.response_time && (
                                                <span>{message.response_time}ms</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* AGI Reasoning Trace */}
                                {message.reasoning_trace && message.reasoning_trace.length > 0 && (
                                    <details className="mt-3">
                                        <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                            🧠 Proces de Gândire
                                        </summary>
                                        <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-700 rounded text-xs">
                                            {message.reasoning_trace.map((step, index) => (
                                                <div key={index} className="mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {index + 1}. {step}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                )}

                                {/* Token Usage */}
                                {message.tokens_used && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Tokeni folosiți: {message.tokens_used}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">RomAI se gândește...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex space-x-3">
                    <textarea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Scrie mesajul tău aici... (Română sau Engleză)"
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                        rows={3}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !currentMessage.trim()}
                        className={`
              px-6 py-3 rounded-lg font-medium transition-all self-end
              ${isLoading || !currentMessage.trim()
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                            }
            `}
                    >
                        {isLoading ? '⏳' : '➤'}
                    </button>
                </div>

                {/* Quick Prompts */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        onClick={() => setCurrentMessage('Povestește-mi despre istoria României')}
                        className="text-sm px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        🏛️ Istoria României
                    </button>
                    <button
                        onClick={() => setCurrentMessage('Ce tradiționale românești știi?')}
                        className="text-sm px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        🎭 Tradiții românești
                    </button>
                    <button
                        onClick={() => setCurrentMessage('Ajută-mă să înțeleg gramática română')}
                        className="text-sm px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        📝 Gramatică
                    </button>
                    <button
                        onClick={() => setCurrentMessage('Solve this math problem: 2x + 5 = 15')}
                        className="text-sm px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        🔢 Math Problem
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConversationPage;

