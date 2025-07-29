/**
 * Azure OpenAI GPT-4o Realtime API Client
 * 
 * This client handles real-time audio communication with Azure OpenAI's GPT-4o Realtime API,
 * providing seamless voice interaction with advanced audio processing capabilities.
 * 
 * Features:
 * - WebSocket connection to Azure OpenAI Realtime API
 * - Real-time audio streaming with buffering
 * - Server-side voice activity detection
 * - Automatic interruption handling
 * - Audio quality optimization
 * - Conversation context management
 */

import { EventEmitter } from 'events';

export interface RealtimeConfig {
    apiKey: string;
    endpoint: string;
    deployment?: string;
    apiVersion?: string;
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    inputAudioFormat?: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
    outputAudioFormat?: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
    vadThreshold?: number;
    prefixPaddingMs?: number;
    silenceDurationMs?: number;
    temperature?: number;
    maxResponseTokens?: number;
}

export interface AudioChunk {
    data: ArrayBuffer;
    timestamp: number;
    sequenceId: number;
}

export interface ConversationItem {
    id: string;
    type: 'message' | 'function_call' | 'function_call_output';
    role?: 'user' | 'assistant' | 'system';
    content?: Array<{
        type: 'input_text' | 'input_audio' | 'text' | 'audio';
        text?: string;
        audio?: string; // base64 encoded
        transcript?: string;
    }>;
    call_id?: string;
    name?: string;
    arguments?: string;
    output?: string;
}

export class AzureRealtimeClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private processor: AudioWorkletNode | null = null;
    private outputBuffer: AudioBuffer[] = [];
    private inputStream: MediaStream | null = null;
    private isConnected = false;
    private isSessionActive = false;
    private sequenceId = 0;
    private conversationId: string;
    private config: RealtimeConfig;

    constructor(config: RealtimeConfig) {
        super();
        this.config = {
            apiVersion: '2024-12-01-preview',
            voice: 'alloy',
            inputAudioFormat: 'pcm16',
            outputAudioFormat: 'pcm16',
            vadThreshold: 0.5,
            prefixPaddingMs: 300,
            silenceDurationMs: 500,
            temperature: 0.8,
            maxResponseTokens: 4096,
            ...config
        };

        this.conversationId = this.generateId();
    }

    /**
     * Connect to Azure OpenAI Realtime API
     */
    async connect(): Promise<void> {
        try {
            console.log('🔌 Connecting to Azure OpenAI Realtime API...');

            // Clean endpoint URL
            const cleanEndpoint = this.config.endpoint.replace(/\/$/, '').replace(/"/g, '');
            const deployment = this.config.deployment || 'gpt-4o-realtime';

            // Construct WebSocket URL
            const wsUrl = `${cleanEndpoint.replace('https://', 'wss://')}/openai/realtime?api-version=${this.config.apiVersion}&deployment=${deployment}`;

            console.log('🌐 WebSocket URL:', wsUrl);

            // Create WebSocket connection - headers must be sent via subprotocols in browser
            this.ws = new WebSocket(wsUrl, [
                `api-key.${this.config.apiKey}`,
                'realtime.v1'
            ]);

            // Setup WebSocket event handlers
            this.ws.onopen = this.handleConnectionOpen.bind(this);
            this.ws.onmessage = this.handleMessage.bind(this);
            this.ws.onclose = this.handleConnectionClose.bind(this);
            this.ws.onerror = this.handleConnectionError.bind(this);

            // Wait for connection
            await this.waitForConnection();

            console.log('✅ Connected to Azure OpenAI Realtime API');

        } catch (error) {
            console.error('❌ Failed to connect to Azure OpenAI Realtime API:', error);
            throw error;
        }
    }

    /**
     * Initialize audio processing
     */
    async initializeAudio(): Promise<void> {
        try {
            console.log('🎵 Initializing audio processing...');

            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Request microphone access
            this.inputStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 24000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Create audio worklet for processing
            await this.audioContext.audioWorklet.addModule('/audio-processor.js');

            this.processor = new AudioWorkletNode(this.audioContext, 'audio-processor');

            // Connect audio stream to processor
            const source = this.audioContext.createMediaStreamSource(this.inputStream);
            source.connect(this.processor);

            // Handle processed audio data
            this.processor.port.onmessage = (event) => {
                if (event.data.type === 'audio-data') {
                    this.sendAudioData(event.data.buffer);
                }
            };

            console.log('✅ Audio processing initialized');

        } catch (error) {
            console.error('❌ Failed to initialize audio:', error);
            throw error;
        }
    }

    /**
     * Configure session with optimal settings
     */
    async configureSession(): Promise<void> {
        if (!this.isConnected) {
            throw new Error('Not connected to Azure OpenAI');
        }

        const sessionConfig = {
            type: 'session.update',
            session: {
                modalities: ['text', 'audio'],
                instructions: `You are METU, a helpful AI assistant. You have access to various tools and can help users with a wide range of tasks. Always be concise but helpful in your responses.`,
                voice: this.config.voice,
                input_audio_format: this.config.inputAudioFormat,
                output_audio_format: this.config.outputAudioFormat,
                input_audio_transcription: {
                    model: 'whisper-1'
                },
                turn_detection: {
                    type: 'server_vad',
                    threshold: this.config.vadThreshold,
                    prefix_padding_ms: this.config.prefixPaddingMs,
                    silence_duration_ms: this.config.silenceDurationMs
                },
                tools: [
                    {
                        type: 'function',
                        name: 'get_weather',
                        description: 'Get current weather information for a location',
                        parameters: {
                            type: 'object',
                            properties: {
                                location: {
                                    type: 'string',
                                    description: 'The city and state, e.g. San Francisco, CA'
                                }
                            },
                            required: ['location']
                        }
                    },
                    {
                        type: 'function',
                        name: 'control_device',
                        description: 'Control a device using Glass MCP',
                        parameters: {
                            type: 'object',
                            properties: {
                                action: {
                                    type: 'string',
                                    description: 'The action to perform (focus, click, type, etc.)'
                                },
                                target: {
                                    type: 'string',
                                    description: 'The target element or window'
                                }
                            },
                            required: ['action', 'target']
                        }
                    }
                ],
                tool_choice: 'auto',
                temperature: this.config.temperature,
                max_response_output_tokens: this.config.maxResponseTokens
            }
        };

        await this.sendMessage(sessionConfig);
        this.isSessionActive = true;

        console.log('⚙️ Session configured with optimal settings');
    }

    /**
     * Start conversation
     */
    async startConversation(): Promise<void> {
        if (!this.isSessionActive) {
            throw new Error('Session not configured');
        }

        // Start audio input
        if (this.processor) {
            this.processor.port.postMessage({ type: 'start' });
        }

        console.log('🎤 Conversation started - listening for audio input');
        this.emit('conversation-started');
    }

    /**
     * Send audio data to the API
     */
    private async sendAudioData(audioBuffer: ArrayBuffer): Promise<void> {
        if (!this.isConnected || !this.isSessionActive) {
            return;
        }

        // Convert to base64
        const base64Audio = this.arrayBufferToBase64(audioBuffer);

        const message = {
            type: 'input_audio_buffer.append',
            audio: base64Audio
        };

        await this.sendMessage(message);
    }

    /**
     * Send text input
     */
    async sendText(text: string): Promise<void> {
        if (!this.isConnected || !this.isSessionActive) {
            throw new Error('Not connected or session not active');
        }

        // Create conversation item
        const item: ConversationItem = {
            id: this.generateId(),
            type: 'message',
            role: 'user',
            content: [{
                type: 'input_text',
                text: text
            }]
        };

        // Add to conversation
        await this.sendMessage({
            type: 'conversation.item.create',
            item: item
        });

        // Trigger response
        await this.sendMessage({
            type: 'response.create',
            response: {
                modalities: ['text', 'audio'],
                instructions: 'Please respond to the user input.',
                voice: this.config.voice,
                output_audio_format: this.config.outputAudioFormat,
                tools: [],
                tool_choice: 'auto',
                temperature: this.config.temperature,
                max_output_tokens: this.config.maxResponseTokens
            }
        });
    }

    /**
     * Interrupt current response
     */
    async interrupt(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        await this.sendMessage({
            type: 'response.cancel'
        });

        // Clear output buffer
        this.outputBuffer = [];

        console.log('⚡ Response interrupted');
        this.emit('response-interrupted');
    }

    /**
     * Handle WebSocket connection open
     */
    private handleConnectionOpen(): void {
        this.isConnected = true;
        console.log('🔗 WebSocket connection established');
        this.emit('connected');
    }

    /**
     * Handle incoming WebSocket messages
     */
    private async handleMessage(event: MessageEvent): Promise<void> {
        try {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'session.created':
                    console.log('📝 Session created:', message.session.id);
                    this.emit('session-created', message.session);
                    break;

                case 'session.updated':
                    console.log('🔄 Session updated');
                    this.emit('session-updated', message.session);
                    break;

                case 'conversation.item.created':
                    console.log('💬 Conversation item created:', message.item.id);
                    this.emit('conversation-item-created', message.item);
                    break;

                case 'input_audio_buffer.speech_started':
                    console.log('🎤 Speech started');
                    this.emit('speech-started', message);
                    break;

                case 'input_audio_buffer.speech_stopped':
                    console.log('🎤 Speech stopped');
                    this.emit('speech-stopped', message);
                    break;

                case 'conversation.item.input_audio_transcription.completed':
                    console.log('📝 Transcription:', message.transcript);
                    this.emit('transcription', message.transcript);
                    break;

                case 'response.created':
                    console.log('🤖 Response created:', message.response.id);
                    this.emit('response-created', message.response);
                    break;

                case 'response.output_item.added':
                    console.log('📤 Output item added:', message.item.type);
                    this.emit('response-item-added', message.item);
                    break;

                case 'response.audio.delta':
                    await this.handleAudioDelta(message.delta);
                    break;

                case 'response.audio.done':
                    console.log('🔊 Audio response complete');
                    this.emit('audio-response-complete');
                    break;

                case 'response.text.delta':
                    console.log('📝 Text delta:', message.delta);
                    this.emit('text-delta', message.delta);
                    break;

                case 'response.text.done':
                    console.log('📝 Text response complete:', message.text);
                    this.emit('text-response-complete', message.text);
                    break;

                case 'response.function_call_arguments.delta':
                    console.log('🔧 Function call delta:', message.delta);
                    this.emit('function-call-delta', message);
                    break;

                case 'response.function_call_arguments.done':
                    console.log('🔧 Function call complete:', message);
                    await this.handleFunctionCall(message);
                    break;

                case 'response.done':
                    console.log('✅ Response complete');
                    this.emit('response-complete', message.response);
                    break;

                case 'error':
                    console.error('❌ API Error:', message.error);
                    this.emit('error', message.error);
                    break;

                default:
                    console.log('🔍 Unknown message type:', message.type);
                    this.emit('unknown-message', message);
            }

        } catch (error) {
            console.error('❌ Error handling message:', error);
            this.emit('error', error);
        }
    }

    /**
     * Handle audio delta (streaming audio response)
     */
    private async handleAudioDelta(audioData: string): Promise<void> {
        try {
            // Decode base64 audio
            const audioBuffer = this.base64ToArrayBuffer(audioData);

            // Play audio immediately for low latency
            await this.playAudioBuffer(audioBuffer);

            this.emit('audio-delta', audioBuffer);

        } catch (error) {
            console.error('❌ Error handling audio delta:', error);
        }
    }

    /**
     * Handle function calls from the assistant
     */
    private async handleFunctionCall(message: any): Promise<void> {
        const { call_id, name, arguments: args } = message;

        console.log(`🔧 Executing function: ${name} with args:`, args);

        let result: any;

        try {
            switch (name) {
                case 'get_weather':
                    result = await this.getWeather(JSON.parse(args));
                    break;

                case 'control_device':
                    result = await this.controlDevice(JSON.parse(args));
                    break;

                default:
                    result = { error: `Unknown function: ${name}` };
            }

            // Send function result back
            await this.sendMessage({
                type: 'conversation.item.create',
                item: {
                    id: this.generateId(),
                    type: 'function_call_output',
                    call_id: call_id,
                    output: JSON.stringify(result)
                }
            });

            // Trigger response with function result
            await this.sendMessage({
                type: 'response.create',
                response: {
                    modalities: ['text', 'audio'],
                    voice: this.config.voice,
                    output_audio_format: this.config.outputAudioFormat
                }
            });

        } catch (error) {
            console.error(`❌ Error executing function ${name}:`, error);

            const errorMessage = error instanceof Error ? error.message : String(error);

            // Send error result
            await this.sendMessage({
                type: 'conversation.item.create',
                item: {
                    id: this.generateId(),
                    type: 'function_call_output',
                    call_id: call_id,
                    output: JSON.stringify({ error: errorMessage })
                }
            });
        }
    }

    /**
     * Get weather information (mock implementation)
     */
    private async getWeather(params: { location: string }): Promise<any> {
        // This would integrate with a real weather API
        return {
            location: params.location,
            temperature: '22°C',
            condition: 'Sunny',
            humidity: '65%'
        };
    }

    /**
     * Control device via Glass MCP (mock implementation)
     */
    private async controlDevice(params: { action: string; target: string }): Promise<any> {
        // This would integrate with Glass MCP
        console.log(`🎮 Controlling device: ${params.action} on ${params.target}`);

        return {
            success: true,
            action: params.action,
            target: params.target,
            result: 'Action completed successfully'
        };
    }

    /**
     * Play audio buffer immediately
     */
    private async playAudioBuffer(audioBuffer: ArrayBuffer): Promise<void> {
        if (!this.audioContext) {
            return;
        }

        try {
            // Convert PCM16 to AudioBuffer
            const audioData = new Int16Array(audioBuffer);
            const audioBufferObj = this.audioContext.createBuffer(1, audioData.length, 24000);
            const channelData = audioBufferObj.getChannelData(0);

            // Convert Int16 to Float32
            for (let i = 0; i < audioData.length; i++) {
                channelData[i] = audioData[i] / 32768.0;
            }

            // Play immediately
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBufferObj;
            source.connect(this.audioContext.destination);
            source.start();

        } catch (error) {
            console.error('❌ Error playing audio buffer:', error);
        }
    }

    /**
     * Send message to WebSocket
     */
    private async sendMessage(message: any): Promise<void> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        this.ws.send(JSON.stringify(message));
    }

    /**
     * Wait for WebSocket connection
     */
    private waitForConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve();
                return;
            }

            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);

            this.once('connected', () => {
                clearTimeout(timeout);
                resolve();
            });

            this.once('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    /**
     * Handle WebSocket connection close
     */
    private handleConnectionClose(event: CloseEvent): void {
        this.isConnected = false;
        this.isSessionActive = false;

        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        this.emit('disconnected', { code: event.code, reason: event.reason });
    }

    /**
     * Handle WebSocket connection error
     */
    private handleConnectionError(event: Event): void {
        console.error('❌ WebSocket connection error:', event);
        this.emit('error', event);
    }

    /**
     * Utility: Convert ArrayBuffer to base64
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Utility: Convert base64 to ArrayBuffer
     */
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Disconnect from the API
     */
    async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        if (this.inputStream) {
            this.inputStream.getTracks().forEach(track => track.stop());
            this.inputStream = null;
        }

        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }

        this.isConnected = false;
        this.isSessionActive = false;

        console.log('🔌 Disconnected from Azure OpenAI Realtime API');
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isSessionActive: this.isSessionActive,
            conversationId: this.conversationId,
            config: this.config
        };
    }
}
