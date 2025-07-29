/**
 * Direct Azure OpenAI Client for METU
 * 
 * Provides direct integration with Azure OpenAI GPT-4o Realtime API,
 * bypassing any intermediate API gateways for optimal performance.
 */

import { OpenAI } from 'openai';
import { getErrorMessage } from '../../utils/errorHandling';

export interface RealtimeSessionConfig {
    modalities: ('text' | 'audio')[];
    instructions: string;
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    inputAudioFormat: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
    outputAudioFormat: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
    inputAudioTranscription?: {
        model: string;
    };
    turnDetection?: {
        type: 'server_vad' | 'none';
        threshold?: number;
        prefixPaddingMs?: number;
        silenceDurationMs?: number;
    };
    toolChoice?: 'auto' | 'none' | 'required';
    temperature?: number;
    maxResponseOutputTokens?: number;
}

export interface RealtimeMessage {
    type: string;
    [key: string]: any;
}

export interface ConversationItem {
    id: string;
    type: 'message' | 'function_call' | 'function_call_output';
    role?: 'user' | 'assistant' | 'system';
    content?: Array<{
        type: 'input_text' | 'input_audio' | 'text' | 'audio';
        text?: string;
        audio?: string;
        transcript?: string;
    }>;
    name?: string;
    call_id?: string;
    output?: string;
}

export class DirectAzureOpenAIClient {
    private client: OpenAI;
    private webSocket: WebSocket | null = null;
    private sessionConfig: RealtimeSessionConfig;
    private callbacks: { [event: string]: Function[] } = {};
    private isConnected: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    constructor() {
        // Validate environment variables
        this.validateEnvironment();

        // Initialize OpenAI client with Azure configuration
        this.client = new OpenAI({
            apiKey: process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_API_KEY,
            baseURL: `${process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '')}/openai/deployments/${process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT || 'gpt-4o'}`,
            defaultHeaders: {
                'api-key': process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_API_KEY,
            },
            defaultQuery: {
                'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview',
            },
        });

        // Default session configuration
        this.sessionConfig = {
            modalities: ['text', 'audio'],
            instructions: 'You are METU, a helpful AI assistant that can control your computer and help with various tasks. Respond naturally and conversationally.',
            voice: 'alloy',
            inputAudioFormat: 'pcm16',
            outputAudioFormat: 'pcm16',
            inputAudioTranscription: {
                model: 'whisper-1',
            },
            turnDetection: {
                type: 'server_vad',
                threshold: 0.5,
                prefixPaddingMs: 300,
                silenceDurationMs: 200,
            },
            toolChoice: 'auto',
            temperature: 0.8,
            maxResponseOutputTokens: 4096,
        };

        console.log('🤖 DirectAzureOpenAIClient initialized');
    }

    /**
     * Validate required environment variables
     */
    private validateEnvironment(): void {
        const requiredVars = [
            'AZURE_OPENAI_KEY',
            'AZURE_OPENAI_ENDPOINT',
            'AZURE_OPENAI_GPT4O_DEPLOYMENT',
        ];

        // Check for alternative variable names
        const apiKey = process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_API_KEY;
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const deployment = process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT;

        if (!apiKey) {
            throw new Error('Azure OpenAI API key not found. Set AZURE_OPENAI_KEY or AZURE_OPENAI_API_KEY environment variable.');
        }

        if (!endpoint) {
            throw new Error('Azure OpenAI endpoint not found. Set AZURE_OPENAI_ENDPOINT environment variable.');
        }

        if (!deployment) {
            console.warn('⚠️ AZURE_OPENAI_GPT4O_DEPLOYMENT not set, using default: gpt-4o');
        }

        console.log('✅ Azure OpenAI environment variables validated');
    }

    /**
     * Connect to the realtime API via WebSocket
     */
    async connect(): Promise<void> {
        if (this.isConnected && this.webSocket?.readyState === WebSocket.OPEN) {
            console.log('🔌 Already connected to Azure OpenAI Realtime API');
            return;
        }

        // If connection is in progress, wait for it
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this.establishConnection();
        return this.connectionPromise;
    }

    /**
     * Establish WebSocket connection to Azure OpenAI Realtime API
     */
    private async establishConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const apiKey = process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_API_KEY;
                const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '');
                const deployment = process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT || 'gpt-4o';
                const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview';

                // Clean the endpoint URL
                const baseUrl = endpoint?.replace('https://', '').replace('http://', '');
                const wsUrl = `wss://${baseUrl}/openai/realtime?api-version=${apiVersion}&deployment=${deployment}`;

                console.log('🌐 Connecting to Azure OpenAI Realtime API:', wsUrl);

                this.webSocket = new WebSocket(wsUrl, [
                    `authorization.${apiKey}`,
                    'realtime.v1'
                ]);

                this.webSocket.onopen = () => {
                    console.log('✅ Connected to Azure OpenAI Realtime API');
                    this.isConnected = true;
                    this.connectionPromise = null;

                    // Send session configuration
                    this.sendMessage({
                        type: 'session.update',
                        session: this.sessionConfig,
                    });

                    this.emit('connected');
                    resolve();
                };

                this.webSocket.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('❌ Error parsing WebSocket message:', error);
                        this.emit('error', error);
                    }
                };

                this.webSocket.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.isConnected = false;
                    this.connectionPromise = null;
                    this.emit('error', error);
                    reject(error);
                };

                this.webSocket.onclose = (event) => {
                    console.log('🔌 WebSocket connection closed:', event.code, event.reason);
                    this.isConnected = false;
                    this.connectionPromise = null;
                    this.emit('disconnected', { code: event.code, reason: event.reason });

                    // Auto-reconnect after 3 seconds if not manually closed
                    if (event.code !== 1000) {
                        console.log('🔄 Attempting to reconnect in 3 seconds...');
                        setTimeout(() => {
                            this.connect().catch(console.error);
                        }, 3000);
                    }
                };

            } catch (error) {
                console.error('❌ Failed to establish WebSocket connection:', error);
                this.connectionPromise = null;
                reject(error);
            }
        });
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(message: RealtimeMessage): void {
        console.log('📨 Received message:', message.type);

        switch (message.type) {
            case 'session.created':
                console.log('✅ Session created:', message.session);
                this.emit('sessionCreated', message.session);
                break;

            case 'session.updated':
                console.log('✅ Session updated');
                this.emit('sessionUpdated', message.session);
                break;

            case 'conversation.created':
                console.log('💬 Conversation created:', message.conversation);
                this.emit('conversationCreated', message.conversation);
                break;

            case 'conversation.item.created':
                this.emit('conversationItemCreated', message.item);
                break;

            case 'conversation.item.input_audio_transcription.completed':
                console.log('📝 Transcription completed:', message.transcript);
                this.emit('transcriptionCompleted', {
                    itemId: message.item_id,
                    transcript: message.transcript,
                });
                break;

            case 'response.created':
                console.log('🤖 Response created:', message.response.id);
                this.emit('responseCreated', message.response);
                break;

            case 'response.done':
                console.log('✅ Response completed:', message.response.id);
                this.emit('responseCompleted', message.response);
                break;

            case 'response.output_item.added':
                this.emit('responseItemAdded', message.item);
                break;

            case 'response.content_part.added':
                this.emit('responseContentAdded', message.part);
                break;

            case 'response.content_part.done':
                this.emit('responseContentCompleted', message.part);
                break;

            case 'response.text.delta':
                this.emit('responseTextDelta', {
                    itemId: message.item_id,
                    outputIndex: message.output_index,
                    contentIndex: message.content_index,
                    delta: message.delta,
                });
                break;

            case 'response.text.done':
                this.emit('responseTextCompleted', {
                    itemId: message.item_id,
                    outputIndex: message.output_index,
                    contentIndex: message.content_index,
                    text: message.text,
                });
                break;

            case 'response.audio.delta':
                this.emit('responseAudioDelta', {
                    itemId: message.item_id,
                    outputIndex: message.output_index,
                    contentIndex: message.content_index,
                    delta: message.delta,
                });
                break;

            case 'response.audio.done':
                this.emit('responseAudioCompleted', {
                    itemId: message.item_id,
                    outputIndex: message.output_index,
                    contentIndex: message.content_index,
                });
                break;

            case 'response.audio_transcript.delta':
                this.emit('responseAudioTranscriptDelta', {
                    itemId: message.item_id,
                    outputIndex: message.output_index,
                    contentIndex: message.content_index,
                    delta: message.delta,
                });
                break;

            case 'response.audio_transcript.done':
                this.emit('responseAudioTranscriptCompleted', {
                    itemId: message.item_id,
                    outputIndex: message.output_index,
                    contentIndex: message.content_index,
                    transcript: message.transcript,
                });
                break;

            case 'input_audio_buffer.committed':
                console.log('🎤 Audio buffer committed');
                this.emit('audioBufferCommitted');
                break;

            case 'input_audio_buffer.cleared':
                console.log('🧹 Audio buffer cleared');
                this.emit('audioBufferCleared');
                break;

            case 'input_audio_buffer.speech_started':
                console.log('🗣️ Speech started');
                this.emit('speechStarted', message);
                break;

            case 'input_audio_buffer.speech_stopped':
                console.log('🔇 Speech stopped');
                this.emit('speechStopped', message);
                break;

            case 'conversation.item.truncated':
                console.log('✂️ Conversation item truncated:', message.item_id);
                this.emit('conversationItemTruncated', message);
                break;

            case 'error':
                console.error('❌ Azure OpenAI error:', message.error);
                this.emit('error', message.error);
                break;

            default:
                console.log('🔍 Unknown message type:', message.type, message);
                this.emit('unknownMessage', message);
                break;
        }
    }

    /**
     * Send a message to the WebSocket
     */
    private sendMessage(message: RealtimeMessage): void {
        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
            console.error('❌ WebSocket not connected, cannot send message');
            return;
        }

        try {
            this.webSocket.send(JSON.stringify(message));
            console.log('📤 Sent message:', message.type);
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.emit('error', error);
        }
    }

    /**
     * Update session configuration
     */
    async updateSession(config: Partial<RealtimeSessionConfig>): Promise<void> {
        this.sessionConfig = { ...this.sessionConfig, ...config };

        if (this.isConnected) {
            this.sendMessage({
                type: 'session.update',
                session: this.sessionConfig,
            });
        }
    }

    /**
     * Send audio data to the API
     */
    sendAudio(audioData: string): void {
        this.sendMessage({
            type: 'input_audio_buffer.append',
            audio: audioData,
        });
    }

    /**
     * Commit the audio buffer for processing
     */
    commitAudio(): void {
        this.sendMessage({
            type: 'input_audio_buffer.commit',
        });
    }

    /**
     * Clear the audio buffer
     */
    clearAudio(): void {
        this.sendMessage({
            type: 'input_audio_buffer.clear',
        });
    }

    /**
     * Send a text message
     */
    sendText(text: string): void {
        this.sendMessage({
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [{
                    type: 'input_text',
                    text: text,
                }],
            },
        });

        // Create response
        this.sendMessage({
            type: 'response.create',
        });
    }

    /**
     * Cancel current response generation
     */
    cancelResponse(): void {
        this.sendMessage({
            type: 'response.cancel',
        });
    }

    /**
     * Interrupt current response and clear audio buffer
     */
    interrupt(): void {
        this.cancelResponse();
        this.clearAudio();
    }

    /**
     * Get conversation history
     */
    async getConversation(): Promise<ConversationItem[]> {
        // This would require storing conversation items locally
        // as the API doesn't provide a direct way to retrieve conversation history
        return [];
    }

    /**
     * Event system
     */
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
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event callback for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Check if connected
     */
    isReady(): boolean {
        return this.isConnected && this.webSocket?.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection state
     */
    getConnectionState(): string {
        if (!this.webSocket) return 'disconnected';

        switch (this.webSocket.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return 'connected';
            case WebSocket.CLOSING: return 'closing';
            case WebSocket.CLOSED: return 'disconnected';
            default: return 'unknown';
        }
    }

    /**
     * Disconnect and cleanup
     */
    async disconnect(): Promise<void> {
        console.log('🔌 Disconnecting from Azure OpenAI Realtime API...');

        if (this.webSocket) {
            this.webSocket.close(1000, 'User initiated disconnect');
            this.webSocket = null;
        }

        this.isConnected = false;
        this.connectionPromise = null;
        this.callbacks = {};

        console.log('✅ Disconnected from Azure OpenAI Realtime API');
    }
}

export default DirectAzureOpenAIClient;
