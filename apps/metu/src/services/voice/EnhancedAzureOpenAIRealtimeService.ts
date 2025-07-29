/**
 * Enhanced Azure OpenAI Realtime Service
 * 
 * Provides direct integration with Azure OpenAI GPT-4o Realtime API
 * for continuous voice conversations with human-like interruption handling.
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { AzureOpenAI } from 'openai';

export interface RealtimeConfig {
    endpoint: string;
    apiKey: string;
    deployment: string;
    apiVersion: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    voiceSettings?: {
        voice: string;
        speed: number;
        pitch: number;
        outputFormat: string;
    };
}

export interface ConversationSession {
    id: string;
    userId: string;
    websocket: WebSocket | null;
    isActive: boolean;
    createdAt: Date;
    lastActivity: Date;
    conversationHistory: ConversationMessage[];
    context: Record<string, any>;
}

export interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    type: 'text' | 'audio' | 'function_call';
    content: string | ArrayBuffer;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface AudioChunk {
    sessionId: string;
    audioData: ArrayBuffer;
    timestamp: number;
    isComplete: boolean;
}

export interface FunctionCall {
    id: string;
    name: string;
    parameters: Record<string, any>;
    correlationId: string;
}

export class EnhancedAzureOpenAIRealtimeService extends EventEmitter {
    private config: RealtimeConfig;
    private client: AzureOpenAI;
    private sessions: Map<string, ConversationSession> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    constructor(config: RealtimeConfig) {
        super();

        this.config = {
            model: 'gpt-4o-realtime-preview',
            temperature: 0.7,
            maxTokens: 4096,
            voiceSettings: {
                voice: 'alloy',
                speed: 1.0,
                pitch: 1.0,
                outputFormat: 'pcm16'
            },
            ...config
        };

        // Initialize Azure OpenAI client
        this.client = new AzureOpenAI({
            endpoint: this.config.endpoint,
            apiKey: this.config.apiKey,
            apiVersion: this.config.apiVersion
        });

        console.log('🎤 Enhanced Azure OpenAI Realtime Service initialized');
    }

    /**
     * Create a new conversation session
     */
    async createSession(userId: string, options: Record<string, any> = {}): Promise<string> {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session: ConversationSession = {
            id: sessionId,
            userId,
            websocket: null,
            isActive: true,
            createdAt: new Date(),
            lastActivity: new Date(),
            conversationHistory: [],
            context: {
                language: options.language || 'en-US',
                voiceSettings: { ...this.config.voiceSettings, ...options.voiceSettings },
                systemPrompt: options.systemPrompt || this.getDefaultSystemPrompt(),
                ...options.context
            }
        };

        // Create WebSocket connection to Azure OpenAI Realtime API
        try {
            await this.establishWebSocketConnection(session);
            this.sessions.set(sessionId, session);

            console.log(`✅ Created conversation session: ${sessionId} for user: ${userId}`);
            this.emit('sessionCreated', { sessionId, userId });

            return sessionId;
        } catch (error) {
            console.error('❌ Failed to create session:', error);
            throw new Error(`Failed to create conversation session: ${error}`);
        }
    }

    /**
     * Establish WebSocket connection to Azure OpenAI Realtime API
     */
    private async establishWebSocketConnection(session: ConversationSession): Promise<void> {
        const wsUrl = this.buildWebSocketUrl();

        return new Promise((resolve, reject) => {
            try {
                session.websocket = new WebSocket(wsUrl, {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'OpenAI-Beta': 'realtime=v1'
                    }
                });

                session.websocket.on('open', () => {
                    console.log(`🔌 WebSocket connected for session: ${session.id}`);

                    // Send session configuration
                    this.sendSessionConfig(session);

                    this.reconnectAttempts = 0;
                    this.emit('connected', { sessionId: session.id });
                    resolve();
                });

                session.websocket.on('message', (data) => {
                    this.handleWebSocketMessage(session, data);
                });

                session.websocket.on('close', (code, reason) => {
                    console.log(`🔌 WebSocket closed for session ${session.id}: ${code} - ${reason}`);
                    this.handleWebSocketClose(session);
                });

                session.websocket.on('error', (error) => {
                    console.error(`❌ WebSocket error for session ${session.id}:`, error);
                    this.emit('error', { sessionId: session.id, error });
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Build WebSocket URL for Azure OpenAI Realtime API
     */
    private buildWebSocketUrl(): string {
        const baseUrl = this.config.endpoint.replace('https://', 'wss://');
        return `${baseUrl}/openai/realtime?api-version=${this.config.apiVersion}&deployment=${this.config.deployment}`;
    }

    /**
     * Send session configuration to Azure OpenAI
     */
    private sendSessionConfig(session: ConversationSession): void {
        if (!session.websocket) return;

        const config = {
            type: 'session.update',
            session: {
                modalities: ['text', 'audio'],
                instructions: session.context.systemPrompt,
                voice: session.context.voiceSettings.voice,
                input_audio_format: 'pcm16',
                output_audio_format: session.context.voiceSettings.outputFormat,
                input_audio_transcription: {
                    model: 'whisper-1'
                },
                turn_detection: {
                    type: 'server_vad',
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 500
                },
                tools: this.getMCPTools(),
                tool_choice: 'auto',
                temperature: this.config.temperature,
                max_response_output_tokens: this.config.maxTokens
            }
        };

        this.sendWebSocketMessage(session, config);
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleWebSocketMessage(session: ConversationSession, data: WebSocket.Data): void {
        try {
            const message = JSON.parse(data.toString());
            session.lastActivity = new Date();

            switch (message.type) {
                case 'session.created':
                    console.log(`✅ Session created on Azure OpenAI: ${session.id}`);
                    break;

                case 'conversation.item.input_audio_transcription.completed':
                    this.handleTranscriptionCompleted(session, message);
                    break;

                case 'response.audio.delta':
                    this.handleAudioResponse(session, message);
                    break;

                case 'response.function_call.delta':
                    this.handleFunctionCall(session, message);
                    break;

                case 'conversation.item.created':
                    this.handleConversationItem(session, message);
                    break;

                case 'response.done':
                    this.handleResponseComplete(session, message);
                    break;

                case 'error':
                    this.handleError(session, message);
                    break;

                default:
                    console.log(`📨 Unhandled message type: ${message.type}`);
            }

        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    }

    /**
     * Handle transcription completed
     */
    private handleTranscriptionCompleted(session: ConversationSession, message: any): void {
        const transcript = message.transcript;
        const itemId = message.item_id;

        // Add to conversation history
        const conversationMessage: ConversationMessage = {
            id: itemId,
            role: 'user',
            type: 'text',
            content: transcript,
            timestamp: new Date(),
            metadata: { confidence: message.confidence }
        };

        session.conversationHistory.push(conversationMessage);

        console.log(`🎤 Transcription completed for session ${session.id}: "${transcript}"`);
        this.emit('transcriptionCompleted', {
            sessionId: session.id,
            text: transcript,
            itemId,
            confidence: message.confidence
        });
    }

    /**
     * Handle audio response from Azure OpenAI
     */
    private handleAudioResponse(session: ConversationSession, message: any): void {
        const audioData = Buffer.from(message.delta, 'base64');

        this.emit('audioResponse', {
            sessionId: session.id,
            audioData,
            responseId: message.response_id,
            itemId: message.item_id
        });
    }

    /**
     * Handle function call from Azure OpenAI
     */
    private handleFunctionCall(session: ConversationSession, message: any): void {
        const functionCall: FunctionCall = {
            id: message.call_id,
            name: message.name,
            parameters: JSON.parse(message.arguments || '{}'),
            correlationId: `func_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        console.log(`🔧 Function call received: ${functionCall.name}`);
        this.emit('mcpToolCall', {
            sessionId: session.id,
            toolName: functionCall.name,
            parameters: functionCall.parameters,
            correlationId: functionCall.correlationId,
            callId: message.call_id
        });
    }

    /**
     * Handle conversation item creation
     */
    private handleConversationItem(session: ConversationSession, message: any): void {
        const item = message.item;

        if (item.type === 'message' && item.role === 'assistant') {
            const conversationMessage: ConversationMessage = {
                id: item.id,
                role: 'assistant',
                type: item.content?.[0]?.type === 'audio' ? 'audio' : 'text',
                content: item.content?.[0]?.text || item.content?.[0]?.audio || '',
                timestamp: new Date(),
                metadata: { status: item.status }
            };

            session.conversationHistory.push(conversationMessage);
        }
    }

    /**
     * Handle response completion
     */
    private handleResponseComplete(session: ConversationSession, message: any): void {
        console.log(`✅ Response completed for session ${session.id}`);
        this.emit('responseComplete', {
            sessionId: session.id,
            responseId: message.response.id,
            status: message.response.status
        });
    }

    /**
     * Handle errors from Azure OpenAI
     */
    private handleError(session: ConversationSession, message: any): void {
        console.error(`❌ Azure OpenAI error for session ${session.id}:`, message.error);
        this.emit('error', {
            sessionId: session.id,
            error: message.error
        });
    }

    /**
     * Handle WebSocket close
     */
    private handleWebSocketClose(session: ConversationSession): void {
        session.websocket = null;

        if (session.isActive && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(`🔄 Attempting to reconnect session ${session.id} (attempt ${this.reconnectAttempts + 1})`);
            this.reconnectAttempts++;

            setTimeout(() => {
                this.establishWebSocketConnection(session).catch(error => {
                    console.error('❌ Reconnection failed:', error);
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.log(`🔌 Session ${session.id} disconnected`);
            this.emit('sessionDisconnected', { sessionId: session.id });
        }
    }

    /**
     * Send audio data to Azure OpenAI
     */
    async sendAudio(sessionId: string, audioData: ArrayBuffer): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session || !session.websocket) {
            throw new Error(`Session ${sessionId} not found or not connected`);
        }

        const audioBase64 = Buffer.from(audioData).toString('base64');

        const message = {
            type: 'input_audio_buffer.append',
            audio: audioBase64
        };

        this.sendWebSocketMessage(session, message);
    }

    /**
     * Commit audio input (end of speech)
     */
    async commitAudio(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session || !session.websocket) {
            throw new Error(`Session ${sessionId} not found or not connected`);
        }

        const message = {
            type: 'input_audio_buffer.commit'
        };

        this.sendWebSocketMessage(session, message);

        // Generate response
        const responseMessage = {
            type: 'response.create',
            response: {
                modalities: ['text', 'audio'],
                instructions: 'Respond naturally to the user\'s input.'
            }
        };

        this.sendWebSocketMessage(session, responseMessage);
    }

    /**
     * Send text message to Azure OpenAI
     */
    async sendText(sessionId: string, text: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session || !session.websocket) {
            throw new Error(`Session ${sessionId} not found or not connected`);
        }

        const message = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: text
                    }
                ]
            }
        };

        this.sendWebSocketMessage(session, message);

        // Generate response
        const responseMessage = {
            type: 'response.create',
            response: {
                modalities: ['text', 'audio']
            }
        };

        this.sendWebSocketMessage(session, responseMessage);
    }

    /**
     * Send MCP tool response back to Azure OpenAI
     */
    async sendMCPToolResponse(correlationId: string, result: any): Promise<void> {
        // Find session by correlation ID (this would need better tracking in production)
        for (const session of this.sessions.values()) {
            if (session.websocket) {
                const message = {
                    type: 'conversation.item.create',
                    item: {
                        type: 'function_call_output',
                        call_id: correlationId,
                        output: JSON.stringify(result)
                    }
                };

                this.sendWebSocketMessage(session, message);
                break;
            }
        }
    }

    /**
     * End conversation session
     */
    async endSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        session.isActive = false;

        if (session.websocket) {
            session.websocket.close();
        }

        this.sessions.delete(sessionId);
        console.log(`🛑 Session ended: ${sessionId}`);
        this.emit('sessionEnded', { sessionId });
    }

    /**
     * Send WebSocket message
     */
    private sendWebSocketMessage(session: ConversationSession, message: any): void {
        if (session.websocket && session.websocket.readyState === WebSocket.OPEN) {
            session.websocket.send(JSON.stringify(message));
        } else {
            console.error(`❌ Cannot send message - WebSocket not connected for session ${session.id}`);
        }
    }

    /**
     * Get MCP tools configuration for Azure OpenAI
     */
    private getMCPTools(): any[] {
        return [
            {
                type: 'function',
                name: 'glass_mcp_action',
                description: 'Execute Windows system actions through Glass MCP',
                parameters: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            description: 'The MCP action to execute',
                            enum: ['window_list', 'window_focus', 'window_send_text', 'clipboard_get_text', 'clipboard_set_text']
                        },
                        parameters: {
                            type: 'object',
                            description: 'Parameters for the MCP action'
                        }
                    },
                    required: ['action']
                }
            },
            {
                type: 'function',
                name: 'memorai_mcp_action',
                description: 'Store and retrieve memories through MemorAI MCP',
                parameters: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            description: 'The memory action to execute',
                            enum: ['remember', 'recall', 'forget', 'context']
                        },
                        parameters: {
                            type: 'object',
                            description: 'Parameters for the memory action'
                        }
                    },
                    required: ['action']
                }
            }
        ];
    }

    /**
     * Get default system prompt
     */
    private getDefaultSystemPrompt(): string {
        return `You are METU, an intelligent voice AI assistant. You help users manage their daily tasks, 
        provide information, and control their computer through voice commands. You have access to system 
        controls through Glass MCP and can store information through MemorAI MCP. Always be helpful, 
        concise, and natural in your responses. When users ask you to perform system actions, use the 
        appropriate MCP tools to fulfill their requests.`;
    }

    /**
     * Get service status
     */
    getStatus(): {
        isInitialized: boolean;
        activeSessions: number;
        totalSessions: number;
        config: Partial<RealtimeConfig>;
    } {
        return {
            isInitialized: true,
            activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length,
            totalSessions: this.sessions.size,
            config: {
                endpoint: this.config.endpoint,
                deployment: this.config.deployment,
                model: this.config.model,
                apiVersion: this.config.apiVersion
            }
        };
    }

    /**
     * Get session information
     */
    getSession(sessionId: string): ConversationSession | undefined {
        return this.sessions.get(sessionId);
    }

    /**
     * Get all active sessions
     */
    getActiveSessions(): ConversationSession[] {
        return Array.from(this.sessions.values()).filter(session => session.isActive);
    }

    /**
     * Cleanup all sessions and connections
     */
    async dispose(): Promise<void> {
        for (const session of this.sessions.values()) {
            await this.endSession(session.id);
        }

        this.sessions.clear();
        this.removeAllListeners();
        console.log('🧹 Azure OpenAI Realtime Service disposed');
    }
}

// Export service events interface
export interface RealtimeServiceEvents {
    'connected': (data: { sessionId: string }) => void;
    'sessionCreated': (data: { sessionId: string; userId: string }) => void;
    'sessionEnded': (data: { sessionId: string }) => void;
    'sessionDisconnected': (data: { sessionId: string }) => void;
    'transcriptionCompleted': (data: { sessionId: string; text: string; itemId: string; confidence?: number }) => void;
    'audioResponse': (data: { sessionId: string; audioData: Buffer; responseId: string; itemId: string }) => void;
    'mcpToolCall': (data: { sessionId: string; toolName: string; parameters: any; correlationId: string; callId: string }) => void;
    'responseComplete': (data: { sessionId: string; responseId: string; status: string }) => void;
    'error': (data: { sessionId: string; error: any }) => void;
}

// Typed event emitter
export interface EnhancedAzureOpenAIRealtimeService {
    on<K extends keyof RealtimeServiceEvents>(event: K, listener: RealtimeServiceEvents[K]): this;
    emit<K extends keyof RealtimeServiceEvents>(event: K, ...args: Parameters<RealtimeServiceEvents[K]>): boolean;
}
