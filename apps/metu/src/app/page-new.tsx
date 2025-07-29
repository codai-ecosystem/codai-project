'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AzureOpenAIRealtimeService } from '../services/voice/AzureOpenAIRealtimeService';
import { DirectAzureOpenAIClient } from '../services/azure/DirectAzureOpenAIClient';
import { AudioSettings } from '../components/settings/AudioSettings';
import { audioDeviceManager } from '../services/audio/AudioDeviceManager';
import { SettingsService } from '../services/SettingsService';

interface VoiceMessage {
    id: string;
    text: string;
    type: 'user' | 'assistant';
    timestamp: Date;
    audioUrl?: string;
}

interface VoiceState {
    isListening: boolean;
    isProcessing: boolean;
    isSpeaking: boolean;
    isConnected: boolean;
    canInterrupt: boolean;
    error?: string;
}

export default function Home() {
    // State management
    const [messages, setMessages] = useState<VoiceMessage[]>([]);
    const [voiceState, setVoiceState] = useState<VoiceState>({
        isListening: false,
        isProcessing: false,
        isSpeaking: false,
        isConnected: false,
        canInterrupt: false
    });
    const [showSettings, setShowSettings] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');

    // Service references
    const realtimeServiceRef = useRef<AzureOpenAIRealtimeService | null>(null);
    const directClientRef = useRef<DirectAzureOpenAIClient | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Initialize services
    useEffect(() => {
        const initializeServices = async () => {
            try {
                // Initialize realtime service with config
                const azureConfig = {
                    apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || '',
                    endpoint: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
                    deploymentName: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-realtime-preview',
                    apiVersion: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_VERSION || '2024-10-01-preview'
                };
                realtimeServiceRef.current = new AzureOpenAIRealtimeService(azureConfig);

                // Initialize direct client
                directClientRef.current = new DirectAzureOpenAIClient();

                console.log('✅ Voice services initialized');
                setVoiceState(prev => ({ ...prev, isConnected: true }));
            } catch (error: any) {
                console.error('❌ Failed to initialize services:', error);
                setVoiceState(prev => ({ ...prev, error: error.message, isConnected: false }));
            }
        };

        initializeServices();

        // Cleanup on unmount
        return () => {
            if (realtimeServiceRef.current) {
                realtimeServiceRef.current.disconnect();
            }
            if (directClientRef.current) {
                directClientRef.current.disconnect();
            }
        };
    }, []);

    // Start listening function
    const startListening = useCallback(async () => {
        try {
            setVoiceState(prev => ({ ...prev, isListening: true, error: undefined }));

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                // Process audio with direct client or realtime service
                console.log('Audio recorded:', audioBlob.size, 'bytes');
            };

            mediaRecorder.start();
            console.log('🎤 Started listening...');
        } catch (error: any) {
            console.error('Failed to start listening:', error);
            setVoiceState(prev => ({ ...prev, error: error.message, isListening: false }));
        }
    }, []);

    // Stop listening function
    const stopListening = useCallback(async () => {
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            setVoiceState(prev => ({ ...prev, isListening: false }));
            console.log('🛑 Stopped listening');
        } catch (error: any) {
            console.error('Failed to stop listening:', error);
            setVoiceState(prev => ({ ...prev, error: error.message }));
        }
    }, []);

    // Clear conversation function
    const clearConversation = useCallback(() => {
        setMessages([]);
    }, []);

    // Toggle settings function
    const toggleSettings = useCallback(() => {
        setShowSettings(prev => !prev);
    }, []);

    return (
        <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 animate-gradient-x"></div>
            <div className="absolute inset-0 opacity-50 pattern-dots"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-gray-900/70 backdrop-blur-sm border-b border-gray-700/50 py-4 px-6">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">METU</h1>
                                <p className="text-sm text-gray-300">AI Assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${voiceState.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                            <span className="text-sm text-gray-300">
                                {voiceState.isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                            <button
                                onClick={toggleSettings}
                                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                title="Settings"
                            >
                                ⚙️
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-2xl mx-auto text-center space-y-8">
                        {/* Voice Interface */}
                        <div className="space-y-6">
                            <div className="relative">
                                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-300 ${voiceState.isListening ? 'scale-110 shadow-2xl shadow-blue-500/25' : 'scale-100'
                                    }`}>
                                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-all duration-300 ${voiceState.isListening ? 'animate-pulse' : ''
                                        }`}>
                                        <span className="text-white text-2xl">
                                            {voiceState.isListening ? '🎤' : '🤖'}
                                        </span>
                                    </div>
                                </div>
                                {voiceState.isListening && (
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping"></div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-white">
                                    {voiceState.isListening ? 'Listening...' : 'Ready to Listen'}
                                </h2>
                                <p className="text-lg text-gray-300">
                                    {voiceState.isListening
                                        ? 'Speak naturally, I\'m here to help'
                                        : 'Click the button below to start a conversation'
                                    }
                                </p>
                                {currentTranscript && (
                                    <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                                        <p className="text-gray-200">{currentTranscript}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={voiceState.isListening ? stopListening : startListening}
                                disabled={voiceState.isProcessing}
                                className={`px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${voiceState.isListening
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                                    : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25'
                                    } ${voiceState.isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {voiceState.isProcessing ? 'Processing...' : voiceState.isListening ? 'Stop Listening' : 'Start Listening'}
                            </button>

                            {messages.length > 0 && (
                                <button
                                    onClick={clearConversation}
                                    className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Clear Chat
                                </button>
                            )}
                        </div>

                        {/* Error Display */}
                        {voiceState.error && (
                            <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg backdrop-blur-sm">
                                <p className="text-red-200 text-sm">
                                    <strong>Error:</strong> {voiceState.error}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversation History */}
                {messages.length > 0 && (
                    <div className="max-w-4xl mx-auto w-full p-6">
                        <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Conversation History</h3>
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`p-3 rounded-lg ${message.type === 'user'
                                            ? 'bg-blue-600/20 border-l-4 border-blue-500'
                                            : 'bg-purple-600/20 border-l-4 border-purple-500'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-300 mb-1">
                                                    {message.type === 'user' ? 'You' : 'METU'} • {message.timestamp.toLocaleTimeString()}
                                                </p>
                                                <p className="text-white">{message.text}</p>
                                            </div>
                                            {message.audioUrl && (
                                                <audio controls className="ml-4">
                                                    <source src={message.audioUrl} type="audio/wav" />
                                                </audio>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Settings Panel */}
                <AudioSettings
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                />

                {/* Footer */}
                <footer className="text-center py-6 px-4">
                    <p className="text-sm text-gray-400">
                        Powered by Azure OpenAI GPT-4o Realtime API | CODAI Ecosystem
                    </p>
                </footer>
            </div>
        </main>
    );
}
