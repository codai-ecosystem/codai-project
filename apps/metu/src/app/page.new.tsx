'use client'

import React from 'react';

import { useState, useEffect, useCallback, useRef } from 'react';
import SettingsPanel from '../components/SettingsPanel';

// Types for advanced voice interface
interface VoiceMessage {
    id: string;
    text: string;
    type: 'user' | 'assistant' | 'system';
    timestamp: Date;
    audioBuffer?: ArrayBuffer;
    duration?: number;
    confidence?: number;
    isPartial?: boolean;
}

interface VoiceState {
    isListening: boolean;
    isProcessing: boolean;
    isSpeaking: boolean;
    isConnected: boolean;
    canInterrupt: boolean;
    conversationActive: boolean;
    voiceActivityLevel: number;
    error: string | null;
}

interface AudioDevice {
    deviceId: string;
    label: string;
    kind: 'audioinput' | 'audiooutput';
}

// Enhanced Settings interface matching SettingsPanel
interface Settings {
    // Voice settings
    language: string;
    confidenceThreshold: number;
    autoStartListening: boolean;
    enableNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    voiceSpeed: number;
    enableKeywordWakeup: boolean;
    wakeupKeyword: string;

    // Audio device settings
    selectedInputDevice: string;
    selectedOutputDevice: string;
    audioGain: number;
    noiseCancellation: boolean;
    echoCancellation: boolean;

    // Azure OpenAI settings
    azureApiKey: string;
    azureEndpoint: string;
    azureDeployment: string;
    azureApiVersion: string;

    // Conversation settings
    continuousListening: boolean;
    interruptionEnabled: boolean;
    backgroundProcessing: boolean;
    responseStreamingEnabled: boolean;

    // MCP Config for SettingsPanel compatibility
    mcpConfig: {
        memorai: {
            enabled: boolean;
            agentId: string;
            contextSize: number;
        };
        glass: {
            enabled: boolean;
            windowManagement: boolean;
        };
        romai: {
            enabled: boolean;
            language: 'ro' | 'en';
            domain: string;
        };
        playwright: {
            enabled: boolean;
            headless: boolean;
            timeout: number;
        };
    };
}

// Azure OpenAI GPT-4o Realtime Voice Service
class AzureRealtimeVoiceService {
    private webSocket: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private callbacks: { [key: string]: Function[] } = {};
    private isInitialized = false;
    private settings: Settings;
    private conversationId: string;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private voiceActivityDetector: any = null;
    private interruptionBuffer: Float32Array[] = [];
    private isBufferingForInterruption = false;
    private audioDevices: { input: AudioDevice[]; output: AudioDevice[] } = { input: [], output: [] };

    constructor(settings: Settings) {
        this.settings = settings;
        this.conversationId = this.generateId();
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    async initialize(): Promise<void> {
        try {
            // Initialize Audio Context
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            await this.audioContext.resume();

            // Enumerate audio devices
            await this.enumerateAudioDevices();

            // Initialize Azure OpenAI WebSocket connection
            await this.connectToAzureOpenAI();

            // Setup voice activity detection
            await this.setupVoiceActivityDetection();

            this.isInitialized = true;
            this.emit('initialized');
        } catch (error) {
            console.error('Failed to initialize Azure Realtime Voice Service:', error);
            this.emit('error', error);
        }
    }

    private async enumerateAudioDevices(): Promise<void> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.audioDevices.input = devices
                .filter(device => device.kind === 'audioinput')
                .map(device => ({
                    deviceId: device.deviceId,
                    label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
                    kind: 'audioinput' as const
                }));

            this.audioDevices.output = devices
                .filter(device => device.kind === 'audiooutput')
                .map(device => ({
                    deviceId: device.deviceId,
                    label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
                    kind: 'audiooutput' as const
                }));
        } catch (error) {
            console.error('Failed to enumerate audio devices:', error);
        }
    }

    private async connectToAzureOpenAI(): Promise<void> {
        if (!this.settings.azureApiKey || !this.settings.azureEndpoint) {
            throw new Error('Azure OpenAI credentials not configured');
        }

        const wsUrl = `${this.settings.azureEndpoint.replace('https://', 'wss://')}/openai/realtime?api-version=${this.settings.azureApiVersion}&deployment=${this.settings.azureDeployment}`;

        this.webSocket = new WebSocket(wsUrl);
        this.webSocket.binaryType = 'arraybuffer';

        return new Promise((resolve, reject) => {
            if (!this.webSocket) {
                reject(new Error('WebSocket not initialized'));
                return;
            }

            this.webSocket.onopen = () => {
                // Send authentication and configuration
                const config = {
                    type: 'session.update',
                    session: {
                        modalities: ['text', 'audio'],
                        instructions: `You are METU, an advanced AI voice assistant. Respond naturally and conversationally. Language: ${this.settings.language}. Speed preference: ${this.settings.voiceSpeed}x.`,
                        voice: 'alloy',
                        input_audio_format: 'pcm16',
                        output_audio_format: 'pcm16',
                        input_audio_transcription: {
                            model: 'whisper-1'
                        },
                        turn_detection: {
                            type: 'server_vad',
                            threshold: this.settings.confidenceThreshold,
                            prefix_padding_ms: 300,
                            silence_duration_ms: 500
                        },
                        tools: []
                    }
                };

                this.webSocket!.send(JSON.stringify(config));
                this.emit('connected');
                resolve();
            };

            this.webSocket.onmessage = (event) => {
                this.handleWebSocketMessage(event);
            };

            this.webSocket.onerror = (error) => {
                this.emit('error', error);
                reject(error);
            };

            this.webSocket.onclose = () => {
                this.emit('disconnected');
                if (this.settings.continuousListening) {
                    // Auto-reconnect for continuous listening
                    setTimeout(() => this.connectToAzureOpenAI(), 2000);
                }
            };
        });
    }

    private handleWebSocketMessage(event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'response.audio.delta':
                    this.handleAudioResponse(data.delta);
                    break;
                case 'response.text.delta':
                    this.handleTextResponse(data.delta, true);
                    break;
                case 'response.text.done':
                    this.handleTextResponse(data.text, false);
                    break;
                case 'input_audio_buffer.speech_started':
                    this.handleSpeechStarted();
                    break;
                case 'input_audio_buffer.speech_stopped':
                    this.handleSpeechStopped();
                    break;
                case 'conversation.item.created':
                    this.handleConversationItemCreated(data.item);
                    break;
                case 'error':
                    this.emit('error', new Error(data.error.message));
                    break;
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    private handleAudioResponse(audioDelta: string): void {
        if (this.settings.responseStreamingEnabled) {
            // Stream audio response in real-time
            const audioData = atob(audioDelta);
            const audioBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(audioBuffer);
            for (let i = 0; i < audioData.length; i++) {
                view[i] = audioData.charCodeAt(i);
            }
            this.playAudioBuffer(audioBuffer);
        }
    }

    private handleTextResponse(text: string, isPartial: boolean): void {
        this.emit('response', {
            id: this.generateId(),
            text,
            type: 'assistant',
            timestamp: new Date(),
            isPartial
        });
    }

    private handleSpeechStarted(): void {
        this.emit('speechStarted');

        // Handle interruption if enabled
        if (this.settings.interruptionEnabled && this.currentUtterance) {
            this.stopSpeaking();
            this.isBufferingForInterruption = true;
        }
    }

    private handleSpeechStopped(): void {
        this.emit('speechStopped');
        this.isBufferingForInterruption = false;
    }

    private handleConversationItemCreated(item: any): void {
        this.emit('conversationItem', item);
    }

    private async setupVoiceActivityDetection(): Promise<void> {
        try {
            const constraints = {
                audio: {
                    deviceId: this.settings.selectedInputDevice !== 'default'
                        ? { exact: this.settings.selectedInputDevice }
                        : undefined,
                    echoCancellation: this.settings.echoCancellation,
                    noiseSuppression: this.settings.noiseCancellation,
                    autoGainControl: true,
                    sampleRate: 24000,
                    channelCount: 1
                }
            };

            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

            if (this.audioContext) {
                const source = this.audioContext.createMediaStreamSource(this.mediaStream);
                const analyser = this.audioContext.createAnalyser();
                analyser.fftSize = 512;
                source.connect(analyser);

                this.voiceActivityDetector = {
                    analyser,
                    dataArray: new Uint8Array(analyser.frequencyBinCount)
                };

                this.startVoiceActivityMonitoring();
            }
        } catch (error) {
            console.error('Failed to setup voice activity detection:', error);
        }
    }

    private startVoiceActivityMonitoring(): void {
        const monitor = () => {
            if (!this.voiceActivityDetector) return;

            this.voiceActivityDetector.analyser.getByteFrequencyData(this.voiceActivityDetector.dataArray);

            // Calculate voice activity level
            const average = this.voiceActivityDetector.dataArray.reduce((sum: number, value: number) => sum + value, 0) / this.voiceActivityDetector.dataArray.length;
            const activityLevel = average / 255;

            this.emit('voiceActivity', activityLevel);

            // Auto-trigger listening based on voice activity
            if (this.settings.continuousListening && activityLevel > this.settings.confidenceThreshold) {
                if (!this.isListening()) {
                    this.startListening();
                }
            }

            requestAnimationFrame(monitor);
        };

        monitor();
    }

    async startListening(): Promise<void> {
        if (!this.isInitialized || !this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
            throw new Error('Service not initialized or not connected');
        }

        // Send audio buffer start command
        this.webSocket.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: '' // Start with empty audio buffer
        }));

        this.emit('listeningStarted');
    }

    async stopListening(): Promise<void> {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
        }
        this.emit('listeningStopped');
    }

    async speak(text: string): Promise<void> {
        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to Azure OpenAI');
        }

        const request = {
            type: 'response.create',
            response: {
                modalities: ['audio'],
                instructions: text,
                voice: 'alloy',
                output_audio_format: 'pcm16'
            }
        };

        this.webSocket.send(JSON.stringify(request));
        this.emit('speakingStarted');
    }

    async stopSpeaking(): Promise<void> {
        if (this.currentUtterance) {
            speechSynthesis.cancel();
            this.currentUtterance = null;
        }
        this.emit('speakingStopped');
    }

    private async playAudioBuffer(buffer: ArrayBuffer): Promise<void> {
        if (!this.audioContext) return;

        try {
            const audioBuffer = await this.audioContext.decodeAudioData(buffer);
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            source.start();
        } catch (error) {
            console.error('Error playing audio buffer:', error);
        }
    }

    isListening(): boolean {
        return this.webSocket?.readyState === WebSocket.OPEN;
    }

    isSpeaking(): boolean {
        return this.currentUtterance !== null;
    }

    isConnected(): boolean {
        return this.webSocket?.readyState === WebSocket.OPEN;
    }

    getAudioDevices(): { input: AudioDevice[]; output: AudioDevice[] } {
        return this.audioDevices;
    }

    updateSettings(newSettings: Partial<Settings>): void {
        this.settings = { ...this.settings, ...newSettings };
        this.emit('settingsUpdated', this.settings);
    }

    on(event: string, callback: Function): void {
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(callback);
    }

    off(event: string, callback: Function): void {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
    }

    private emit(event: string, data?: any): void {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }

    async destroy(): Promise<void> {
        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }

        this.callbacks = {};
        this.isInitialized = false;
    }
}

export default function HomePage() {
    const [messages, setMessages] = useState<VoiceMessage[]>([]);
    const [voiceState, setVoiceState] = useState<VoiceState>({
        isListening: false,
        isProcessing: false,
        isSpeaking: false,
        isConnected: false,
        canInterrupt: false,
        conversationActive: false,
        voiceActivityLevel: 0,
        error: null
    });
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        // Voice settings
        language: 'en-US',
        confidenceThreshold: 0.7,
        autoStartListening: true,
        enableNotifications: true,
        theme: 'dark',
        voiceSpeed: 1.0,
        enableKeywordWakeup: true,
        wakeupKeyword: 'Hey METU',

        // Audio device settings
        selectedInputDevice: 'default',
        selectedOutputDevice: 'default',
        audioGain: 1.0,
        noiseCancellation: true,
        echoCancellation: true,

        // Azure OpenAI settings (these should be set via environment or user input)
        azureApiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY || '',
        azureEndpoint: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT || '',
        azureDeployment: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-realtime-preview',
        azureApiVersion: '2024-10-01-preview',

        // Conversation settings
        continuousListening: true,
        interruptionEnabled: true,
        backgroundProcessing: true,
        responseStreamingEnabled: true,

        // MCP Config for SettingsPanel compatibility
        mcpConfig: {
            memorai: {
                enabled: true,
                agentId: 'metu-agent',
                contextSize: 10
            },
            glass: {
                enabled: true,
                windowManagement: true
            },
            romai: {
                enabled: true,
                language: 'en' as const,
                domain: 'general'
            },
            playwright: {
                enabled: false,
                headless: true,
                timeout: 30000
            }
        }
    });

    const voiceService = useRef<AzureRealtimeVoiceService | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const conversationRef = useRef<{ isActive: boolean; lastInteraction: Date }>({
        isActive: false,
        lastInteraction: new Date()
    });

    // Initialize voice service
    useEffect(() => {
        voiceService.current = new AzureRealtimeVoiceService(settings);

        // Setup event listeners
        voiceService.current.on('initialized', () => {
            setVoiceState(prev => ({ ...prev, isConnected: true }));
        });

        voiceService.current.on('connected', () => {
            setVoiceState(prev => ({ ...prev, isConnected: true, error: null }));
        });

        voiceService.current.on('disconnected', () => {
            setVoiceState(prev => ({ ...prev, isConnected: false }));
        });

        voiceService.current.on('error', (error: Error) => {
            setVoiceState(prev => ({ ...prev, error: error.message }));
        });

        voiceService.current.on('listeningStarted', () => {
            setVoiceState(prev => ({ ...prev, isListening: true, conversationActive: true }));
        });

        voiceService.current.on('listeningStopped', () => {
            setVoiceState(prev => ({ ...prev, isListening: false }));
        });

        voiceService.current.on('speakingStarted', () => {
            setVoiceState(prev => ({ ...prev, isSpeaking: true, canInterrupt: settings.interruptionEnabled }));
        });

        voiceService.current.on('speakingStopped', () => {
            setVoiceState(prev => ({ ...prev, isSpeaking: false, canInterrupt: false }));
        });

        voiceService.current.on('voiceActivity', (level: number) => {
            setVoiceState(prev => ({ ...prev, voiceActivityLevel: level }));
        });

        voiceService.current.on('response', (message: VoiceMessage) => {
            setMessages(prev => {
                // Handle partial responses by updating the last assistant message
                if (message.isPartial) {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.type === 'assistant' && lastMessage.isPartial) {
                        lastMessage.text += message.text;
                        return newMessages;
                    } else {
                        return [...newMessages, message];
                    }
                } else {
                    // Final response, replace partial if exists
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.type === 'assistant' && lastMessage.isPartial) {
                        lastMessage.text = message.text;
                        lastMessage.isPartial = false;
                        return newMessages;
                    } else {
                        return [...newMessages, message];
                    }
                }
            });
        });

        voiceService.current.on('conversationItem', (item: any) => {
            if (item.type === 'message' && item.role === 'user') {
                const userMessage: VoiceMessage = {
                    id: item.id,
                    text: item.content?.[0]?.transcript || '',
                    type: 'user',
                    timestamp: new Date(),
                    confidence: item.content?.[0]?.confidence
                };
                setMessages(prev => [...prev, userMessage]);
            }
        });

        // Initialize the service
        voiceService.current.initialize().catch(console.error);

        return () => {
            if (voiceService.current) {
                voiceService.current.destroy();
            }
        };
    }, []);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle settings updates
    const handleSettingsChange = useCallback((newSettings: any) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        if (voiceService.current) {
            voiceService.current.updateSettings(updatedSettings);
        }
    }, [settings]);

    // Toggle conversation
    const toggleConversation = useCallback(async () => {
        if (!voiceService.current) return;

        try {
            if (voiceState.conversationActive) {
                await voiceService.current.stopListening();
                conversationRef.current.isActive = false;
            } else {
                await voiceService.current.startListening();
                conversationRef.current.isActive = true;
                conversationRef.current.lastInteraction = new Date();
            }
        } catch (error) {
            console.error('Error toggling conversation:', error);
            setVoiceState(prev => ({ ...prev, error: (error as Error).message }));
        }
    }, [voiceState.conversationActive]);

    // Manual speak function for testing
    const testSpeak = useCallback(async (text: string) => {
        if (!voiceService.current) return;

        try {
            await voiceService.current.speak(text);
        } catch (error) {
            console.error('Error speaking:', error);
        }
    }, []);

    // Emergency stop/interrupt
    const emergencyStop = useCallback(async () => {
        if (!voiceService.current) return;

        try {
            await voiceService.current.stopSpeaking();
            await voiceService.current.stopListening();
            setVoiceState(prev => ({
                ...prev,
                isSpeaking: false,
                isListening: false,
                conversationActive: false
            }));
        } catch (error) {
            console.error('Error during emergency stop:', error);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 overflow-hidden">
            {/* Enhanced Settings Panel */}
            <SettingsPanel
                isOpen={showSettings}
                onToggle={() => setShowSettings(!showSettings)}
                settings={settings}
                onSettingsChange={handleSettingsChange}
            />

            {/* Main Interface */}
            <div className="flex flex-col h-screen relative">
                {/* Header with Connection Status */}
                <div className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-700/50 backdrop-blur-sm bg-slate-800/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-xl font-bold">M</span>
                                </div>
                                {voiceState.isConnected && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold gradient-text">METU</h1>
                                <p className="text-sm text-slate-400">
                                    {voiceState.isConnected ?
                                        (voiceState.conversationActive ? 'Active Conversation' : 'Ready to talk') :
                                        'Connecting...'}
                                </p>
                            </div>
                        </div>

                        {/* Voice Activity Indicator */}
                        {voiceState.conversationActive && (
                            <div className="flex items-center space-x-2">
                                <div className="text-xs text-slate-400">Voice Activity</div>
                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-150"
                                        style={{ width: `${voiceState.voiceActivityLevel * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {voiceState.error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <p className="text-red-300 text-sm">{voiceState.error}</p>
                        </div>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
                    {messages.length === 0 ? (
                        <div className="text-center text-slate-400 mt-20">
                            <div className="text-6xl mb-4">🎤</div>
                            <h2 className="text-xl mb-2">Ready for Natural Conversation</h2>
                            <p className="text-sm max-w-md mx-auto leading-relaxed">
                                METU listens continuously and responds naturally.
                                {settings.interruptionEnabled && " You can interrupt anytime."}
                                {settings.continuousListening && " Voice activation is enabled."}
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
                            >
                                <div
                                    className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl ${message.type === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : message.type === 'system'
                                            ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30'
                                            : 'bg-slate-700 text-slate-100'
                                        } ${message.isPartial ? 'opacity-75 animate-pulse' : ''}`}
                                >
                                    <p className="text-sm sm:text-base leading-relaxed">{message.text}</p>
                                    <div className="flex items-center justify-between mt-2 text-xs opacity-60">
                                        <span>{message.timestamp.toLocaleTimeString()}</span>
                                        {message.confidence && (
                                            <span>{Math.round(message.confidence * 100)}%</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Control Panel */}
                <div className="flex-shrink-0 p-4 sm:p-6 border-t border-slate-700/50 backdrop-blur-sm bg-slate-800/30">
                    <div className="flex items-center justify-center space-x-4">
                        {/* Main Conversation Toggle */}
                        <button
                            onClick={toggleConversation}
                            disabled={!voiceState.isConnected}
                            className={`
                relative w-16 h-16 sm:w-20 sm:h-20 rounded-full
                flex items-center justify-center
                transition-all duration-300 transform hover:scale-105 active:scale-95
                ${voiceState.conversationActive
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25'
                                    : 'bg-gradient-to-r from-green-500 to-blue-600 shadow-lg shadow-blue-500/25'
                                }
                ${!voiceState.isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${voiceState.isListening ? 'voice-pulse' : ''}
              `}
                        >
                            {voiceState.conversationActive ? (
                                <>
                                    <div className="text-2xl">⏹️</div>
                                    {voiceState.isListening && (
                                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
                                    )}
                                </>
                            ) : (
                                <div className="text-2xl">🎤</div>
                            )}
                        </button>

                        {/* Emergency Stop */}
                        {(voiceState.isSpeaking || voiceState.conversationActive) && (
                            <button
                                onClick={emergencyStop}
                                className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                                title="Emergency Stop"
                            >
                                <div className="text-lg">🛑</div>
                            </button>
                        )}

                        {/* Settings Button */}
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="w-12 h-12 bg-slate-600 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105"
                            title="Settings"
                        >
                            <div className="text-lg">⚙️</div>
                        </button>

                        {/* Test Speak Button (for development) */}
                        {process.env.NODE_ENV === 'development' && (
                            <button
                                onClick={() => testSpeak("Hello, this is a test of the voice system")}
                                disabled={!voiceState.isConnected}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
                            >
                                Test Speak
                            </button>
                        )}
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-slate-400">
                        <div className={`flex items-center space-x-1 ${voiceState.isListening ? 'text-green-400' : ''}`}>
                            <div className="text-base">👂</div>
                            <span>Listening</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${voiceState.isSpeaking ? 'text-blue-400' : ''}`}>
                            <div className="text-base">🗣️</div>
                            <span>Speaking</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${voiceState.isProcessing ? 'text-yellow-400' : ''}`}>
                            <div className="text-base">🧠</div>
                            <span>Thinking</span>
                        </div>
                        {settings.interruptionEnabled && (
                            <div className={`flex items-center space-x-1 ${voiceState.canInterrupt ? 'text-orange-400' : ''}`}>
                                <div className="text-base">✋</div>
                                <span>Can Interrupt</span>
                            </div>
                        )}
                    </div>

                    {/* Conversation Settings Quick Access */}
                    <div className="flex items-center justify-center space-x-4 mt-3 text-xs">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.continuousListening}
                                onChange={(e) => handleSettingsChange({ continuousListening: e.target.checked })}
                                className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-slate-400">Continuous</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.interruptionEnabled}
                                onChange={(e) => handleSettingsChange({ interruptionEnabled: e.target.checked })}
                                className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-slate-400">Interruption</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.responseStreamingEnabled}
                                onChange={(e) => handleSettingsChange({ responseStreamingEnabled: e.target.checked })}
                                className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-slate-400">Streaming</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

