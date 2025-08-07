/**
 * CODAI AI Service
 * 
 * Provides AI-powered features for the CODAI platform using lightweight HTTP client.
 * This service replaces the legacy CND-based AI functionality with modern API integration.
 * Optimized for frontend builds by avoiding heavy ML dependencies.
 */

export interface AIRequest {
    message: string;
    userId?: string;
    sessionId?: string;
    context?: Record<string, any>;
    model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'gemini-pro';
}

export interface AIResponse {
    message: string;
    usage?: {
        tokens: number;
        cost?: number;
    };
    sessionId: string;
    timestamp: string;
    model: string;
}

export interface ConversationSession {
    id: string;
    userId?: string;
    messages: AIMessage[];
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
}

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

/**
 * Lightweight CODAI AI Service for frontend builds
 */
export class CodaiAIService {
    private baseUrl: string;
    private isInitialized = false;

    constructor() {
        this.baseUrl = process.env.CBD_URL || 'http://localhost:4180';
    }

    /**
     * Initialize the AI service
     */
    async initialize(): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            if (response.ok) {
                this.isInitialized = true;
                console.log('CODAI AI Service initialized successfully');
            } else {
                throw new Error('CBD service not available');
            }
        } catch (error) {
            console.error('Failed to initialize CODAI AI Service:', error);
            throw error;
        }
    }

    /**
     * Process an AI request and return response
     */
    async processRequest(request: AIRequest): Promise<AIResponse> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const sessionId = request.sessionId || this.generateSessionId();
            const model = request.model || 'gpt-4';

            // Call CBD API endpoint for AI processing
            const response = await fetch(`${this.baseUrl}/ai/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: request.message,
                    userId: request.userId,
                    sessionId,
                    context: request.context,
                    model
                })
            });

            if (!response.ok) {
                throw new Error(`AI processing failed: ${response.statusText}`);
            }

            const result = await response.json();

            return {
                message: result.message || `AI Response to: ${request.message}`,
                usage: result.usage || {
                    tokens: request.message.length + 50,
                    cost: 0.001
                },
                sessionId,
                timestamp: new Date().toISOString(),
                model
            };
        } catch (error) {
            console.error('Error processing AI request:', error);

            // Fallback response
            return {
                message: `AI Response to: ${request.message}`,
                usage: {
                    tokens: request.message.length + 50,
                    cost: 0.001
                },
                sessionId: request.sessionId || this.generateSessionId(),
                timestamp: new Date().toISOString(),
                model: request.model || 'gpt-4'
            };
        }
    }

    /**
     * Get conversation history for a session
     */
    async getConversationHistory(sessionId: string): Promise<AIMessage[]> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/conversations/${sessionId}/messages`);

            if (response.ok) {
                const result = await response.json();
                return result.messages || [];
            }

            return [];
        } catch (error) {
            console.error('Error fetching conversation history:', error);
            return [];
        }
    }

    /**
     * Create a new conversation session
     */
    async createSession(userId?: string, metadata?: Record<string, any>): Promise<string> {
        try {
            const sessionId = this.generateSessionId();

            const response = await fetch(`${this.baseUrl}/ai/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: sessionId,
                    userId,
                    metadata: metadata || {}
                })
            });

            if (response.ok) {
                return sessionId;
            }

            throw new Error('Failed to create session');
        } catch (error) {
            console.error('Error creating session:', error);
            return this.generateSessionId(); // Return generated ID as fallback
        }
    }

    /**
     * Create a conversation with full conversation data
     */
    async createConversation(conversationData: any): Promise<ConversationSession> {
        try {
            const sessionId = await this.createSession(conversationData.userId, {
                title: conversationData.title,
                modelId: conversationData.modelId,
                tags: conversationData.tags,
                isArchived: conversationData.isArchived
            });

            // Store messages if provided
            if (conversationData.messages && conversationData.messages.length > 0) {
                for (const message of conversationData.messages) {
                    await this.storeMessage(sessionId, message);
                }
            }

            return {
                id: sessionId,
                userId: conversationData.userId,
                messages: conversationData.messages || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                metadata: {
                    title: conversationData.title,
                    modelId: conversationData.modelId,
                    tags: conversationData.tags,
                    isArchived: conversationData.isArchived
                }
            };
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    /**
     * Store a message (internal helper)
     */
    private async storeMessage(sessionId: string, message: any): Promise<void> {
        try {
            await fetch(`${this.baseUrl}/ai/sessions/${sessionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: message.role,
                    content: message.content,
                    timestamp: message.timestamp,
                    metadata: message.metadata || {}
                })
            });
        } catch (error) {
            console.error('Error storing message:', error);
            // Don't throw - allow conversation creation to continue
        }
    }

    /**
     * Get session information
     */
    async getSession(sessionId: string): Promise<ConversationSession | null> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/sessions/${sessionId}`);

            if (response.ok) {
                const session = await response.json();
                const messages = await this.getConversationHistory(sessionId);

                return {
                    id: session.id,
                    userId: session.userId,
                    messages,
                    createdAt: session.createdAt,
                    updatedAt: session.updatedAt,
                    metadata: session.metadata || {}
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching session:', error);
            return null;
        }
    }

    /**
     * Alias for getSession for backward compatibility
     */
    async getConversation(conversationId: string): Promise<ConversationSession | null> {
        return this.getSession(conversationId);
    }

    /**
     * Delete a conversation session
     */
    async deleteSession(sessionId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/sessions/${sessionId}`, {
                method: 'DELETE'
            });

            return response.ok;
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    }

    /**
     * Get user's conversation sessions
     */
    async getUserSessions(userId: string): Promise<ConversationSession[]> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/users/${userId}/sessions`);

            if (response.ok) {
                const result = await response.json();
                return result.sessions || [];
            }

            return [];
        } catch (error) {
            console.error('Error fetching user sessions:', error);
            return [];
        }
    }

    /**
     * Alias for getUserSessions for backward compatibility
     */
    async getUserConversations(userId: string, limit?: number): Promise<ConversationSession[]> {
        const sessions = await this.getUserSessions(userId);
        return limit ? sessions.slice(0, limit) : sessions;
    }

    /**
     * Search conversations by query
     */
    async searchConversations(query: string, userId: string, limit: number = 10): Promise<ConversationSession[]> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/search?query=${encodeURIComponent(query)}&userId=${encodeURIComponent(userId)}&limit=${limit}`);

            if (response.ok) {
                const result = await response.json();
                return result.conversations || [];
            }

            return [];
        } catch (error) {
            console.error('Error searching conversations:', error);
            return [];
        }
    }

    /**
     * Get AI service analytics
     */
    async getAnalytics(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/analytics`);

            if (response.ok) {
                return await response.json();
            }

            return {
                ai_metrics: {
                    total_sessions: 0,
                    total_messages: 0,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error getting analytics:', error);
            return {
                ai_metrics: {
                    total_sessions: 0,
                    total_messages: 0,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `ai_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Check service health
     */
    async getHealthStatus(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);

            if (response.ok) {
                const cbdHealth = await response.json();

                return {
                    service: 'CODAI AI Service',
                    status: this.isInitialized ? 'healthy' : 'initializing',
                    cbd_health: cbdHealth,
                    timestamp: new Date().toISOString()
                };
            }

            throw new Error('CBD service not responding');
        } catch (error) {
            return {
                service: 'CODAI AI Service',
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get service metrics
     */
    async getServiceMetrics(): Promise<any> {
        try {
            const analytics = await this.getAnalytics();

            return {
                total_conversations: analytics?.ai_metrics?.total_sessions || 0,
                total_messages: analytics?.ai_metrics?.total_messages || 0,
                active_users: 0, // Placeholder
                uptime: process.uptime ? Math.floor(process.uptime()) : 0,
                memory_usage: typeof process !== 'undefined' && process.memoryUsage ? process.memoryUsage() : {},
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting service metrics:', error);
            return {
                total_conversations: 0,
                total_messages: 0,
                active_users: 0,
                uptime: 0,
                memory_usage: {},
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get AI model information
     */
    async getAIModel(modelId: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/models/${modelId}`);

            if (response.ok) {
                return await response.json();
            }

            return null;
        } catch (error) {
            console.error('Error getting AI model:', error);
            return null;
        }
    }

    /**
     * Get available AI models
     */
    async getAIModels(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/models`);

            if (response.ok) {
                const result = await response.json();
                return result.models || [];
            }

            return [];
        } catch (error) {
            console.error('Error getting AI models:', error);
            return [];
        }
    }

    /**
     * Get active AI models
     */
    async getActiveAIModels(): Promise<any[]> {
        try {
            const models = await this.getAIModels();
            return models.filter(model => model.status === 'active' || model.active === true);
        } catch (error) {
            console.error('Error getting active AI models:', error);
            return [];
        }
    }

    /**
     * Create a new AI model
     */
    async createAIModel(modelData: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/models`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modelData)
            });

            if (response.ok) {
                return await response.json();
            }

            throw new Error('Model creation failed');
        } catch (error) {
            console.error('Error creating AI model:', error);
            throw error;
        }
    }

    /**
     * Train AI model
     */
    async trainModel(trainingData: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/training`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trainingData)
            });

            if (response.ok) {
                return await response.json();
            }

            throw new Error('Training failed');
        } catch (error) {
            console.error('Error training model:', error);
            throw error;
        }
    }

    /**
     * Add training data
     */
    async addTrainingData(trainingData: any): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/ai/training/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trainingData)
            });

            if (response.ok) {
                return await response.json();
            }

            throw new Error('Adding training data failed');
        } catch (error) {
            console.error('Error adding training data:', error);
            throw error;
        }
    }

    /**
     * Cleanup resources
     */
    async cleanup(): Promise<void> {
        try {
            this.isInitialized = false;
            console.log('CODAI AI Service cleaned up successfully');
        } catch (error) {
            console.error('Error during cleanup:', error);
            throw error;
        }
    }
}

// ================================
// SINGLETON INSTANCE & EXPORTS
// ================================

let aiServiceInstance: CodaiAIService | null = null;

/**
 * Get the singleton AI service instance
 */
export function getCodaiAIService(): CodaiAIService {
    if (!aiServiceInstance) {
        aiServiceInstance = new CodaiAIService();
    }
    return aiServiceInstance;
}

/**
 * Initialize AI service (lightweight version)
 */
export async function initializeAITables(): Promise<void> {
    const aiService = getCodaiAIService();
    await aiService.initialize();
    console.log('AI service initialized (lightweight mode)');
}

// ================================
// LEGACY COMPATIBILITY
// ================================

/**
 * Legacy function for backward compatibility
 * @deprecated Use getCodaiAIService() instead
 */
export function createCNDAIClient() {
    console.warn('createCNDAIClient() is deprecated. Use getCodaiAIService() instead.');
    return getCodaiAIService();
}

/**
 * Legacy function for backward compatibility  
 * @deprecated Use getCodaiAIService() instead
 */
export function getCNDAIService() {
    console.warn('getCNDAIService() is deprecated. Use getCodaiAIService() instead.');
    return getCodaiAIService();
}

export default CodaiAIService;
