/**
 * Azure OpenAI Realtime Service - Advanced Voice Assistant Integration
 * 
 * This service provides:
 * - Real-time bidirectional audio streaming with Azure OpenAI GPT-4o
 * - WebSocket connection management for low-latency communication
 * - Voice activity detection and audio processing
 * - Integration with MCP tools for extended capabilities
 * - Context management and conversation continuity
 * - Error handling and connection resilience
 */

import OpenAI from 'openai';
import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface AzureOpenAIConfig {
    apiKey: string;
    endpoint: string;
    deploymentName: string;
    apiVersion: string;
}

export interface AudioSession {
    id: string;
    userId: string;
    conversationId?: string;
    isActive: boolean;
    startTime: Date;
    lastActivity: Date;
    turnDetection: 'server_vad' | 'none';
    transcriptionEnabled: boolean;
}

export interface AudioChunk {
    audio: ArrayBuffer;
    timestamp: number;
    sessionId: string;
}

export interface TranscriptionResult {
    text: string;
    confidence: number;
    timestamp: number;
    isFinal: boolean;
}

export interface MCPToolCall {
    toolName: string;
    parameters: Record<string, any>;
    correlationId: string;
}

export class AzureOpenAIRealtimeService extends EventEmitter {
    private client: OpenAI;
    private config: AzureOpenAIConfig;
    private webSocket: WebSocket | null = null;
    private activeSessions: Map<string, AudioSession> = new Map();
    private audioBuffers: Map<string, ArrayBuffer[]> = new Map();
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 1000; // Start with 1 second
    private heartbeatInterval: NodeJS.Timeout | null = null;

    constructor(config: AzureOpenAIConfig) {
        super();
        this.config = config;

        // Initialize OpenAI client for Azure
        this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: `${config.endpoint}/openai/deployments/${config.deploymentName}`,
            defaultQuery: { 'api-version': config.apiVersion },
            defaultHeaders: {
                'api-key': config.apiKey,
            },
        });

        this.setupEventHandlers();
    }

    /**
     * Initialize WebSocket connection to Azure OpenAI Realtime API
     */
    public async connect(): Promise<void> {
        if (this.isConnected) {
            console.log('Already connected to Azure OpenAI Realtime API');
            return;
        }

        try {
            // Construct WebSocket URL according to Microsoft documentation
            // Format: wss://your-resource.openai.azure.com/openai/realtime?api-version=2025-04-01-preview&deployment=your-deployment
            const wsEndpoint = this.config.endpoint.replace('https://', 'wss://').replace(/\/$/, ''); // Remove trailing slash
            const realtimeUrl = `${wsEndpoint}/openai/realtime?api-version=${this.config.apiVersion}&deployment=${this.config.deploymentName}`;

            console.log('🔌 Connecting to Azure OpenAI Realtime API...');
            console.log('🔗 URL:', realtimeUrl);

            this.webSocket = new WebSocket(realtimeUrl, {
                headers: {
                    'api-key': this.config.apiKey,
                    'OpenAI-Beta': 'realtime=v1',
                },
            });

            this.setupWebSocketHandlers();

            return new Promise((resolve, reject) => {
                if (!this.webSocket) {
                    reject(new Error('WebSocket not initialized'));
                    return;
                }

                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 10000);

                this.webSocket.onopen = () => {
                    clearTimeout(timeout);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();

                    console.log('✅ Connected to Azure OpenAI Realtime API');
                    this.emit('connected');
                    resolve();
                };

                this.webSocket.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error('❌ WebSocket connection error:', error);
                    this.emit('error', error);
                    reject(error);
                };
            });
        } catch (error) {
            console.error('Failed to connect to Azure OpenAI:', error);
            throw error;
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    private setupWebSocketHandlers(): void {
        if (!this.webSocket) return;

        this.webSocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data.toString());
                this.handleRealtimeMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
                this.emit('error', error);
            }
        };

        this.webSocket.onclose = (event) => {
            console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
            this.isConnected = false;
            this.stopHeartbeat();

            if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.scheduleReconnect();
            }

            this.emit('disconnected', event);
        };

        this.webSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
        };
    }

    /**
     * Handle messages from Azure OpenAI Realtime API
     */
    private handleRealtimeMessage(message: any): void {
        const { type, event_id } = message;

        switch (type) {
            case 'session.created':
                console.log('🎤 Audio session created:', message.session);
                this.emit('sessionCreated', message.session);
                break;

            case 'session.updated':
                console.log('🔄 Audio session updated:', message.session);
                this.emit('sessionUpdated', message.session);
                break;

            case 'input_audio_buffer.speech_started':
                console.log('🎙️ User started speaking');
                this.emit('speechStarted', message);
                break;

            case 'input_audio_buffer.speech_stopped':
                console.log('🔇 User stopped speaking');
                this.emit('speechStopped', message);
                break;

            case 'conversation.item.input_audio_transcription.completed':
                console.log('📝 Transcription completed:', message.transcript);
                this.emit('transcriptionCompleted', {
                    text: message.transcript,
                    itemId: message.item_id,
                });
                break;

            case 'response.audio.delta':
                // Handle streaming audio response
                this.handleAudioResponse(message);
                break;

            case 'response.audio.done':
                console.log('🔊 Audio response completed');
                this.emit('audioResponseCompleted', message);
                break;

            case 'response.function_call_arguments.delta':
                // Handle MCP tool function calls
                this.handleMCPToolCall(message);
                break;

            case 'error':
                console.error('Realtime API error:', message.error);
                this.emit('error', new Error(message.error.message || 'Unknown error'));
                break;

            default:
                console.log('📨 Unhandled realtime message:', type, message);
                this.emit('message', message);
        }
    }

    /**
     * Create a new audio session
     */
    public async createSession(userId: string, options: Partial<AudioSession> = {}): Promise<string> {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session: AudioSession = {
            id: sessionId,
            userId,
            conversationId: options.conversationId,
            isActive: true,
            startTime: new Date(),
            lastActivity: new Date(),
            turnDetection: options.turnDetection || 'server_vad',
            transcriptionEnabled: options.transcriptionEnabled !== false,
        };

        this.activeSessions.set(sessionId, session);
        this.audioBuffers.set(sessionId, []);

        // Configure session with Azure OpenAI
        await this.configureSession(sessionId, session);

        console.log(`🎤 Created audio session: ${sessionId} for user: ${userId}`);
        return sessionId;
    }

    /**
     * Configure session parameters with Azure OpenAI
     */
    private async configureSession(sessionId: string, session: AudioSession): Promise<void> {
        const sessionConfig = {
            type: 'session.update',
            session: {
                modalities: ['text', 'audio'],
                instructions: this.getSystemInstructions(),
                voice: 'alloy', // Can be 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                    model: 'whisper-1',
                },
                turn_detection: {
                    type: session.turnDetection,
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 800,
                },
                tools: await this.getMCPToolDefinitions(),
                tool_choice: 'auto',
            },
        };

        this.sendMessage(sessionConfig);
    }

    /**
     * Send audio chunk to Azure OpenAI
     */
    public async sendAudio(sessionId: string, audioData: ArrayBuffer): Promise<void> {
        const session = this.activeSessions.get(sessionId);
        if (!session || !session.isActive) {
            throw new Error(`Invalid or inactive session: ${sessionId}`);
        }

        // Buffer audio for processing
        const buffers = this.audioBuffers.get(sessionId) || [];
        buffers.push(audioData);
        this.audioBuffers.set(sessionId, buffers);

        // Convert to base64 and send
        const base64Audio = Buffer.from(audioData).toString('base64');

        const audioMessage = {
            type: 'input_audio_buffer.append',
            audio: base64Audio,
        };

        this.sendMessage(audioMessage);

        // Update session activity
        session.lastActivity = new Date();
    }

    /**
     * Commit audio buffer and trigger response
     */
    public async commitAudio(sessionId: string): Promise<void> {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        // Commit the audio buffer
        const commitMessage = {
            type: 'input_audio_buffer.commit',
        };

        this.sendMessage(commitMessage);

        // Request response generation
        const responseMessage = {
            type: 'response.create',
            response: {
                modalities: ['text', 'audio'],
                instructions: 'Please respond to the user\'s input with natural, helpful conversation.',
            },
        };

        this.sendMessage(responseMessage);
    }

    /**
     * End audio session
     */
    public async endSession(sessionId: string): Promise<void> {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            console.warn(`Session not found for cleanup: ${sessionId}`);
            return;
        }

        session.isActive = false;

        // Clean up buffers
        this.audioBuffers.delete(sessionId);
        this.activeSessions.delete(sessionId);

        console.log(`🛑 Ended audio session: ${sessionId}`);
        this.emit('sessionEnded', sessionId);
    }

    /**
     * Handle streaming audio response from AI
     */
    private handleAudioResponse(message: any): void {
        const { response_id, item_id, output_index, content_index, delta } = message;

        if (delta) {
            // Convert base64 to ArrayBuffer
            const audioBuffer = Buffer.from(delta, 'base64').buffer;

            this.emit('audioResponse', {
                responseId: response_id,
                itemId: item_id,
                audioData: audioBuffer,
                outputIndex: output_index,
                contentIndex: content_index,
            });
        }
    }

    /**
     * Handle MCP tool function calls
     */
    private handleMCPToolCall(message: any): void {
        const { call_id, name, arguments: args } = message;

        const toolCall: MCPToolCall = {
            toolName: name,
            parameters: JSON.parse(args || '{}'),
            correlationId: call_id,
        };

        console.log(`🔧 MCP tool call: ${name}`, toolCall.parameters);
        this.emit('mcpToolCall', toolCall);
    }

    /**
     * Send response from MCP tool execution
     */
    public async sendMCPToolResponse(correlationId: string, result: any): Promise<void> {
        const toolResponse = {
            type: 'conversation.item.create',
            item: {
                type: 'function_call_output',
                call_id: correlationId,
                output: JSON.stringify(result),
            },
        };

        this.sendMessage(toolResponse);
    }

    /**
     * Get system instructions for the AI assistant
     */
    private getSystemInstructions(): string {
        return `You are METU, an advanced AI voice assistant with sophisticated capabilities.

CORE PERSONALITY:
- Warm, intelligent, and helpful with a slight astral/cosmic personality
- Quick, efficient responses while maintaining conversational warmth
- Romanian cultural awareness through RomAI AGI integration
- Professional yet approachable communication style

CAPABILITIES:
- Real-time voice conversation with natural interruption handling
- Windows automation through Glass MCP (window management, UI control)
- Memory and context preservation through Memorai MCP
- Browser automation through Playwright MCP
- Documentation lookup through Microsoft Docs MCP
- Advanced reasoning through serverside RomAI AGI integration

RESPONSE GUIDELINES:
- Keep responses concise but complete
- Use MCP tools when appropriate for user requests
- Always confirm before performing system-level actions
- Provide real-time feedback during tool operations
- Maintain conversation context across sessions

TOOL USAGE:
- Glass MCP: Use for "open window", "focus app", "copy to clipboard", etc.
- Memorai MCP: Use for "remember this", "what did we discuss", etc.
- Playwright MCP: Use for "browse to", "fill form", "take screenshot", etc.
- Microsoft Docs MCP: Use for technical documentation questions

Remember: You are a powerful assistant that can both think and act in the real world.`;
    }

    /**
     * Get MCP tool definitions for function calling
     */
    private async getMCPToolDefinitions(): Promise<any[]> {
        return [
            {
                type: 'function',
                name: 'glass_mcp_action',
                description: 'Perform Windows automation actions like window management, UI control, clipboard operations',
                parameters: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['window_list', 'window_focus', 'clipboard_get', 'clipboard_set', 'window_extract_text'],
                            description: 'The Glass MCP action to perform',
                        },
                        parameters: {
                            type: 'object',
                            description: 'Action-specific parameters',
                        },
                    },
                    required: ['action'],
                },
            },
            {
                type: 'function',
                name: 'memorai_mcp_action',
                description: 'Store, retrieve, or manage conversation memory and context',
                parameters: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['remember', 'recall', 'forget', 'context'],
                            description: 'The Memorai MCP action to perform',
                        },
                        parameters: {
                            type: 'object',
                            description: 'Action-specific parameters',
                        },
                    },
                    required: ['action'],
                },
            },
            {
                type: 'function',
                name: 'playwright_mcp_action',
                description: 'Perform browser automation like navigation, interaction, content extraction',
                parameters: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['navigate', 'click', 'fill', 'screenshot', 'extract_text'],
                            description: 'The Playwright MCP action to perform',
                        },
                        parameters: {
                            type: 'object',
                            description: 'Action-specific parameters',
                        },
                    },
                    required: ['action'],
                },
            },
            {
                type: 'function',
                name: 'microsoft_docs_mcp_action',
                description: 'Search Microsoft documentation and API references',
                parameters: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['search_docs'],
                            description: 'The Microsoft Docs MCP action to perform',
                        },
                        parameters: {
                            type: 'object',
                            properties: {
                                question: {
                                    type: 'string',
                                    description: 'The documentation topic or question to search for',
                                },
                            },
                            required: ['question'],
                        },
                    },
                    required: ['action', 'parameters'],
                },
            },
        ];
    }

    /**
     * Send message to Azure OpenAI WebSocket
     */
    private sendMessage(message: any): void {
        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
            console.error('Cannot send message: WebSocket not connected');
            return;
        }

        this.webSocket.send(JSON.stringify(message));
    }

    /**
     * Setup event handlers
     */
    private setupEventHandlers(): void {
        this.on('error', (error) => {
            console.error('Azure OpenAI Realtime Service error:', error);
        });
    }

    /**
     * Start heartbeat to keep connection alive
     */
    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
                this.webSocket.ping();
            }
        }, 30000); // 30 seconds
    }

    /**
     * Stop heartbeat
     */
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect(): void {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

        console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        setTimeout(async () => {
            try {
                await this.connect();
            } catch (error) {
                console.error('Reconnection failed:', error);

                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('Max reconnection attempts reached. Manual intervention required.');
                    this.emit('maxReconnectAttemptsReached');
                }
            }
        }, delay);
    }

    /**
     * Disconnect from Azure OpenAI
     */
    public async disconnect(): Promise<void> {
        console.log('🔌 Disconnecting from Azure OpenAI Realtime API...');

        this.stopHeartbeat();

        // End all active sessions
        for (const sessionId of this.activeSessions.keys()) {
            await this.endSession(sessionId);
        }

        if (this.webSocket) {
            this.webSocket.close(1000, 'Client disconnecting');
            this.webSocket = null;
        }

        this.isConnected = false;
        console.log('✅ Disconnected from Azure OpenAI');
    }

    /**
     * Get service status
     */
    public getStatus(): any {
        return {
            isConnected: this.isConnected,
            activeSessions: this.activeSessions.size,
            reconnectAttempts: this.reconnectAttempts,
            uptime: process.uptime(),
        };
    }
}

export default AzureOpenAIRealtimeService;
