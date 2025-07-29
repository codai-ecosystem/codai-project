/**
 * METU Web Client - Enhanced Interface
 * 
 * Modern React-based web client for METU device server with:
 * - Real-time audio processing with Azure OpenAI GPT-4o
 * - Device discovery and management
 * - Glass MCP automation controls  
 * - CND database integration
 * - Responsive design with Tailwind CSS
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// METU Client Types
interface MetuDevice {
    id: string;
    name: string;
    type: 'metu-server' | 'web-client' | 'mobile-client' | 'desktop-client';
    status: 'online' | 'offline' | 'maintenance' | 'error';
    capabilities: string[];
    networkInfo: {
        ipAddress: string;
        port: number;
        hostname: string;
    };
    lastSeen: Date;
}

interface ConversationMessage {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    audioData?: {
        duration: number;
        format: string;
    };
}

interface AudioDevice {
    deviceId: string;
    label: string;
    kind: 'audioinput' | 'audiooutput';
    groupId: string;
}

interface WebClientState {
    isConnected: boolean;
    isListening: boolean;
    currentDevice: MetuDevice | null;
    availableDevices: MetuDevice[];
    conversation: ConversationMessage[];
    selectedAudioInput: string | null;
    selectedAudioOutput: string | null;
    availableAudioDevices: AudioDevice[];
    automationWorkflows: string[];
    isProcessing: boolean;
    error: string | null;
}

/**
 * Enhanced METU Web Client Component
 */
export const MetuWebClient: React.FC = () => {
    // State management
    const [state, setState] = useState<WebClientState>({
        isConnected: false,
        isListening: false,
        currentDevice: null,
        availableDevices: [],
        conversation: [],
        selectedAudioInput: null,
        selectedAudioOutput: null,
        availableAudioDevices: [],
        automationWorkflows: [],
        isProcessing: false,
        error: null
    });

    // Refs for audio processing
    const socketRef = useRef<Socket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioWorkletRef = useRef<AudioWorkletNode | null>(null);

    // Initialize web client connection
    useEffect(() => {
        initializeConnection();
        return () => {
            cleanup();
        };
    }, []);

    const initializeConnection = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, error: null }));

            // Discover METU device servers
            const devices = await discoverDevices();

            // Connect to primary server
            if (devices.length > 0) {
                await connectToServer(devices[0]);
                setState(prev => ({
                    ...prev,
                    availableDevices: devices,
                    currentDevice: devices[0],
                    isConnected: true
                }));
            }

            // Initialize audio devices
            await initializeAudioDevices();

        } catch (error) {
            console.error('Failed to initialize web client:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Connection failed',
                isConnected: false
            }));
        }
    }, []);

    const discoverDevices = async (): Promise<MetuDevice[]> => {
        try {
            // Use mDNS discovery or direct API call to find METU servers
            const response = await fetch('/api/discover-devices', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Discovery failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Device discovery failed:', error);

            // Fallback to localhost
            return [{
                id: 'local-server',
                name: 'Local METU Server',
                type: 'metu-server',
                status: 'online',
                capabilities: ['audio', 'automation', 'ai'],
                networkInfo: {
                    ipAddress: 'localhost',
                    port: 4001,
                    hostname: 'localhost'
                },
                lastSeen: new Date()
            }];
        }
    };

    const connectToServer = async (device: MetuDevice) => {
        try {
            const serverUrl = `http://${device.networkInfo.ipAddress}:${device.networkInfo.port}`;

            // Initialize Socket.IO connection
            socketRef.current = io(serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 5000
            });

            // Setup Socket.IO event handlers
            socketRef.current.on('connect', () => {
                console.log('✅ Connected to METU server');
                setState(prev => ({ ...prev, isConnected: true, error: null }));
            });

            socketRef.current.on('disconnect', () => {
                console.log('⚠️ Disconnected from METU server');
                setState(prev => ({ ...prev, isConnected: false }));
            });

            socketRef.current.on('conversation_message', (message: ConversationMessage) => {
                setState(prev => ({
                    ...prev,
                    conversation: [...prev.conversation, message],
                    isProcessing: false
                }));
            });

            socketRef.current.on('automation_result', (result: any) => {
                console.log('🤖 Automation result:', result);
                addSystemMessage(`Automation completed: ${result.action}`);
            });

            socketRef.current.on('error', (error: any) => {
                console.error('Socket error:', error);
                setState(prev => ({
                    ...prev,
                    error: 'Server communication error',
                    isProcessing: false
                }));
            });

        } catch (error) {
            console.error('Failed to connect to server:', error);
            throw error;
        }
    };

    const initializeAudioDevices = async () => {
        try {
            // Get available audio devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices: AudioDevice[] = devices
                .filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
                .map(device => ({
                    deviceId: device.deviceId,
                    label: device.label || `${device.kind} (${device.deviceId.slice(0, 8)})`,
                    kind: device.kind as 'audioinput' | 'audiooutput',
                    groupId: device.groupId
                }));

            setState(prev => ({
                ...prev,
                availableAudioDevices: audioDevices,
                selectedAudioInput: audioDevices.find(d => d.kind === 'audioinput')?.deviceId || null,
                selectedAudioOutput: audioDevices.find(d => d.kind === 'audiooutput')?.deviceId || null
            }));

        } catch (error) {
            console.error('Failed to initialize audio devices:', error);
        }
    };

    const startListening = async () => {
        try {
            setState(prev => ({ ...prev, isProcessing: true, error: null }));

            // Initialize audio context
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Request microphone access
            const constraints: MediaStreamConstraints = {
                audio: state.selectedAudioInput ? {
                    deviceId: { exact: state.selectedAudioInput },
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : true
            };

            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia(constraints);

            // Setup audio worklet for real-time processing
            await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

            const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            audioWorkletRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');

            // Connect audio processing chain
            source.connect(audioWorkletRef.current);

            // Handle processed audio data
            audioWorkletRef.current.port.onmessage = (event) => {
                const { audioData, volume } = event.data;

                // Send audio to server for processing
                if (socketRef.current && audioData) {
                    socketRef.current.emit('audio_data', {
                        data: audioData,
                        timestamp: Date.now(),
                        volume: volume
                    });
                }
            };

            setState(prev => ({
                ...prev,
                isListening: true,
                isProcessing: false,
                error: null
            }));

            addSystemMessage('Started continuous listening...');

        } catch (error) {
            console.error('Failed to start listening:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to start listening',
                isProcessing: false,
                isListening: false
            }));
        }
    };

    const stopListening = () => {
        try {
            // Stop audio processing
            if (audioWorkletRef.current) {
                audioWorkletRef.current.disconnect();
                audioWorkletRef.current = null;
            }

            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }

            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }

            // Notify server
            if (socketRef.current) {
                socketRef.current.emit('stop_listening');
            }

            setState(prev => ({
                ...prev,
                isListening: false,
                isProcessing: false
            }));

            addSystemMessage('Stopped listening.');

        } catch (error) {
            console.error('Failed to stop listening:', error);
        }
    };

    const interruptConversation = () => {
        if (socketRef.current) {
            socketRef.current.emit('interrupt_conversation');
            setState(prev => ({ ...prev, isProcessing: false }));
            addSystemMessage('Conversation interrupted.');
        }
    };

    const executeAutomation = async (action: string, parameters: any = {}) => {
        try {
            setState(prev => ({ ...prev, isProcessing: true }));

            if (socketRef.current) {
                socketRef.current.emit('execute_automation', {
                    action,
                    parameters,
                    timestamp: Date.now()
                });
            }

            addSystemMessage(`Executing automation: ${action}`);

        } catch (error) {
            console.error('Failed to execute automation:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Automation failed',
                isProcessing: false
            }));
        }
    };

    const addSystemMessage = (content: string) => {
        const message: ConversationMessage = {
            id: `system-${Date.now()}`,
            type: 'system',
            content,
            timestamp: new Date()
        };

        setState(prev => ({
            ...prev,
            conversation: [...prev.conversation, message]
        }));
    };

    const cleanup = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        stopListening();
    };

    // Render the web client interface
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">METU Web Client</h1>
                            <p className="text-gray-600 mt-1">
                                Connected to {state.currentDevice?.name || 'No device'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${state.isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                            <span className="text-sm text-gray-600">
                                {state.isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Error Display */}
                {state.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{state.error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Controls */}
                    <div className="lg:col-span-2">
                        {/* Audio Controls */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Audio Controls</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Input Device Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Input Device
                                    </label>
                                    <select
                                        value={state.selectedAudioInput || ''}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            selectedAudioInput: e.target.value
                                        }))}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {state.availableAudioDevices
                                            .filter(device => device.kind === 'audioinput')
                                            .map(device => (
                                                <option key={device.deviceId} value={device.deviceId}>
                                                    {device.label}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Output Device Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Output Device
                                    </label>
                                    <select
                                        value={state.selectedAudioOutput || ''}
                                        onChange={(e) => setState(prev => ({
                                            ...prev,
                                            selectedAudioOutput: e.target.value
                                        }))}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {state.availableAudioDevices
                                            .filter(device => device.kind === 'audiooutput')
                                            .map(device => (
                                                <option key={device.deviceId} value={device.deviceId}>
                                                    {device.label}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={state.isListening ? stopListening : startListening}
                                    disabled={!state.isConnected || state.isProcessing}
                                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${state.isListening
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300'
                                        }`}
                                >
                                    {state.isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
                                </button>

                                <button
                                    onClick={interruptConversation}
                                    disabled={!state.isListening || !state.isProcessing}
                                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                                >
                                    ⏸️ Interrupt
                                </button>
                            </div>
                        </div>

                        {/* Conversation Display */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversation</h2>

                            <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4">
                                {state.conversation.length === 0 ? (
                                    <p className="text-gray-500 text-center">Start a conversation...</p>
                                ) : (
                                    state.conversation.map(message => (
                                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                            }`}>
                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                                                    ? 'bg-blue-500 text-white'
                                                    : message.type === 'assistant'
                                                        ? 'bg-gray-200 text-gray-900'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                <p className="text-sm">{message.content}</p>
                                                <p className="text-xs opacity-75 mt-1">
                                                    {message.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {state.isProcessing && (
                                <div className="mt-4 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    <span className="ml-2 text-gray-600">Processing...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Device Status */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Status</h3>

                            {state.availableDevices.map(device => (
                                <div key={device.id} className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="font-medium text-gray-900">{device.name}</p>
                                        <p className="text-sm text-gray-600">{device.type}</p>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                </div>
                            ))}
                        </div>

                        {/* Automation Controls */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation</h3>

                            <div className="space-y-2">
                                <button
                                    onClick={() => executeAutomation('focus_window', { title: 'VS Code' })}
                                    disabled={!state.isConnected}
                                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm transition-colors"
                                >
                                    Focus VS Code
                                </button>

                                <button
                                    onClick={() => executeAutomation('take_screenshot')}
                                    disabled={!state.isConnected}
                                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-sm transition-colors"
                                >
                                    Take Screenshot
                                </button>

                                <button
                                    onClick={() => executeAutomation('list_windows')}
                                    disabled={!state.isConnected}
                                    className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-lg text-sm transition-colors"
                                >
                                    List Windows
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetuWebClient;
