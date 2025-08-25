'use client';

import React from 'react'
/**
 * Romanian Intelligence Page - Cultural & Language AI
 * Specialized Romanian language processing and cultural understanding
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RomanianIntelligenceData {
    language_capabilities: {
        grammar_accuracy: number;
        vocabulary_coverage: number;
        dialectal_understanding: number;
        formal_informal_distinction: number;
        idiom_comprehension: number;
        linguistic_analysis_score: number;
    };
    cultural_knowledge: {
        historical_events: number;
        traditions_customs: number;
        contemporary_culture: number;
        regional_differences: number;
        social_context_awareness: number;
        cultural_nuance_detection: number;
    };
    romanian_chat: {
        message: string;
        response: string;
        confidence: number;
        cultural_context: string[];
        linguistic_features: string[];
    } | null;
}

const RomanianIntelligencePage = () => {
    const [romanianData, setRomanianData] = useState<RomanianIntelligenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        const fetchRomanianData = async () => {
            try {
                const [capabilitiesRes, knowledgeRes] = await Promise.all([
                    fetch('http://localhost:6101/romanian/language_capabilities'),
                    fetch('http://localhost:6101/romanian/cultural_knowledge')
                ]);

                if (!capabilitiesRes.ok || !knowledgeRes.ok) {
                    throw new Error('Failed to fetch Romanian intelligence data');
                }

                const [languageCapabilities, culturalKnowledge] = await Promise.all([
                    capabilitiesRes.json(),
                    knowledgeRes.json()
                ]);

                setRomanianData({
                    language_capabilities: languageCapabilities,
                    cultural_knowledge: culturalKnowledge,
                    romanian_chat: null
                });
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch Romanian intelligence data');
            } finally {
                setLoading(false);
            }
        };

        fetchRomanianData();
    }, []);

    const sendRomanianMessage = async () => {
        if (!chatMessage.trim()) return;

        setChatLoading(true);
        try {
            const response = await fetch('http://localhost:6101/romanian/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: chatMessage })
            });

            if (!response.ok) {
                throw new Error('Failed to send Romanian message');
            }

            const chatResponse = await response.json();

            setRomanianData(prev => prev ? {
                ...prev,
                romanian_chat: {
                    message: chatMessage,
                    response: chatResponse.response,
                    confidence: chatResponse.confidence,
                    cultural_context: chatResponse.cultural_context || [],
                    linguistic_features: chatResponse.linguistic_features || []
                }
            } : null);

            setChatMessage('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process Romanian message');
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Loading Romanian Intelligence...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-3">
                    <span>🇷🇴</span>
                    <span>Romanian Intelligence</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Advanced Romanian language processing and cultural understanding capabilities
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}

            {romanianData && (
                <>
                    {/* Language Capabilities */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                            <span>📝</span>
                            <span>Language Processing Capabilities</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(romanianData.language_capabilities).map(([key, value]) => {
                                const percentage = value * 100;
                                const getColor = (score: number) => {
                                    if (score >= 85) return 'from-green-500 to-green-600';
                                    if (score >= 70) return 'from-yellow-500 to-yellow-600';
                                    return 'from-red-500 to-red-600';
                                };

                                return (
                                    <div key={key} className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {percentage.toFixed(1)}%
                                        </p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className={`bg-gradient-to-r ${getColor(percentage)} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        {percentage >= 85 && (
                                            <span className="inline-block mt-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                                                Excellent
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Cultural Knowledge */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                            <span>🏛️</span>
                            <span>Cultural Understanding</span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(romanianData.cultural_knowledge).map(([key, value]) => {
                                const percentage = value * 100;
                                const getColor = (score: number) => {
                                    if (score >= 85) return 'from-blue-500 to-blue-600';
                                    if (score >= 70) return 'from-purple-500 to-purple-600';
                                    return 'from-orange-500 to-orange-600';
                                };

                                return (
                                    <div key={key} className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {percentage.toFixed(1)}%
                                        </p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div
                                                className={`bg-gradient-to-r ${getColor(percentage)} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        {percentage >= 85 && (
                                            <span className="inline-block mt-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                                                Advanced
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Romanian Chat Interface */}
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                            <span>💬</span>
                            <span>Conversație în Română</span>
                        </h2>

                        <div className="space-y-4">
                            {/* Chat Input */}
                            <div className="flex space-x-3">
                                <textarea
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    placeholder="Scrie un mesaj în română... (exemplu: 'Povestește-mi despre cultura românească')"
                                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                                    rows={3}
                                />
                                <button
                                    onClick={sendRomanianMessage}
                                    disabled={chatLoading || !chatMessage.trim()}
                                    className={`
                    px-6 py-3 rounded-lg font-medium transition-all
                    ${chatLoading || !chatMessage.trim()
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                        }
                  `}
                                >
                                    {chatLoading ? '⏳' : '➤'}
                                </button>
                            </div>

                            {/* Chat Response */}
                            {romanianData.romanian_chat && (
                                <motion.div
                                    className="space-y-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {/* User Message */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                                        <p className="text-sm text-blue-800 dark:text-blue-400 font-medium mb-1">Tu:</p>
                                        <p className="text-gray-900 dark:text-white">{romanianData.romanian_chat.message}</p>
                                    </div>

                                    {/* AI Response */}
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-green-800 dark:text-green-400 font-medium">RomAI:</p>
                                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                                                Încredere: {(romanianData.romanian_chat.confidence * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white mb-3">{romanianData.romanian_chat.response}</p>

                                        {/* Cultural Context */}
                                        {romanianData.romanian_chat.cultural_context.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                                <p className="text-xs text-green-800 dark:text-green-400 font-medium mb-1">Context Cultural:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {romanianData.romanian_chat.cultural_context.map((context, index) => (
                                                        <span key={index} className="text-xs bg-green-200 dark:bg-green-800/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                                                            {context}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Linguistic Features */}
                                        {romanianData.romanian_chat.linguistic_features.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs text-green-800 dark:text-green-400 font-medium mb-1">Caracteristici Lingvistice:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {romanianData.romanian_chat.linguistic_features.map((feature, index) => (
                                                        <span key={index} className="text-xs bg-blue-200 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Sample Prompts */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium mb-2">
                                    Exemple de întrebări:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <button
                                        onClick={() => setChatMessage('Povestește-mi despre tradițiile de Crăciun din România')}
                                        className="text-left p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                                    >
                                        🎄 Tradițiile de Crăciun din România
                                    </button>
                                    <button
                                        onClick={() => setChatMessage('Explică-mi diferențele dialectale din România')}
                                        className="text-left p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                                    >
                                        🗣️ Diferențele dialectale din România
                                    </button>
                                    <button
                                        onClick={() => setChatMessage('Ce știi despre istoria Dacilor?')}
                                        className="text-left p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                                    >
                                        🏛️ Istoria Dacilor
                                    </button>
                                    <button
                                        onClick={() => setChatMessage('Analizează acest text: "Merge la școală cu mare drag"')}
                                        className="text-left p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                                    >
                                        📝 Analiză lingvistică
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default RomanianIntelligencePage;

