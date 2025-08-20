import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { logger } from '../utils/logger.js';

export interface Conversation {
    id: string;
    title: string;
    participants: string[];
    messages: ConversationMessage[];
    metadata: {
        created: Date;
        lastActive: Date;
        messageCount: number;
        totalTokens: number;
        tags: string[];
        priority: 'low' | 'normal' | 'high' | 'urgent';
        status: 'active' | 'archived' | 'closed';
    };
    settings: {
        aiModel?: string;
        temperature?: number;
        maxTokens?: number;
        systemPrompt?: string;
        autoSummarize?: boolean;
        retentionDays?: number;
    };
}

export interface ConversationMessage {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata: {
        tokens?: number;
        model?: string;
        duration?: number;
        cost?: number;
        edited?: boolean;
        parentMessageId?: string;
    };
    reactions?: {
        type: 'like' | 'dislike' | 'helpful' | 'flag';
        userId: string;
        timestamp: Date;
    }[];
}

export interface ConversationSummary {
    conversationId: string;
    summary: string;
    keyPoints: string[];
    participants: string[];
    messageCount: number;
    timeRange: {
        start: Date;
        end: Date;
    };
    topics: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
}

export interface ConversationAnalytics {
    totalConversations: number;
    activeConversations: number;
    totalMessages: number;
    totalTokens: number;
    averageResponseTime: number;
    topTopics: { topic: string; count: number }[];
    userEngagement: { userId: string; messageCount: number; avgResponseTime: number }[];
    modelUsage: { model: string; usage: number; cost: number }[];
}

export class ConversAIServices {
    private conversations: Map<string, Conversation> = new Map();
    private openaiClient?: OpenAI;

    constructor() {
        this.initializeAI();
        logger.info('ConversAI Services initialized successfully');
    }

    private initializeAI(): void {
        // Initialize Azure OpenAI client
        if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
            this.openaiClient = new OpenAI({
                apiKey: process.env.AZURE_OPENAI_API_KEY,
                baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments`,
                defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview' },
                defaultHeaders: {
                    'api-key': process.env.AZURE_OPENAI_API_KEY,
                },
            });
            logger.info('Azure OpenAI client initialized for ConversAI');
        } else if (process.env.OPENAI_API_KEY) {
            // Fallback to standard OpenAI
            this.openaiClient = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            logger.info('OpenAI client initialized for ConversAI');
        } else {
            logger.warn('No OpenAI configuration found - AI features will be limited');
        }
    }

    async createConversation(title: string, participants: string[] = [], settings: Partial<Conversation['settings']> = {}): Promise<Conversation> {
        const conversation: Conversation = {
            id: uuidv4(),
            title,
            participants,
            messages: [],
            metadata: {
                created: new Date(),
                lastActive: new Date(),
                messageCount: 0,
                totalTokens: 0,
                tags: [],
                priority: 'normal',
                status: 'active',
            },
            settings: {
                aiModel: settings.aiModel || 'gpt-4',
                temperature: settings.temperature || 0.7,
                maxTokens: settings.maxTokens || 1000,
                systemPrompt: settings.systemPrompt || undefined,
                autoSummarize: settings.autoSummarize || false,
                retentionDays: settings.retentionDays || 30,
                ...settings,
            },
        };

        this.conversations.set(conversation.id, conversation);
        logger.info(`Created conversation: ${conversation.id} - ${title}`);
        return conversation;
    }

    async addMessage(conversationId: string, role: ConversationMessage['role'], content: string): Promise<ConversationMessage> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }

        const message: ConversationMessage = {
            id: uuidv4(),
            conversationId,
            role,
            content,
            timestamp: new Date(),
            metadata: {},
        };

        conversation.messages.push(message);
        conversation.metadata.messageCount++;
        conversation.metadata.lastActive = new Date();

        this.conversations.set(conversationId, conversation);
        logger.info(`Added message to conversation ${conversationId}: ${role} - ${content.length} chars`);

        return message;
    }

    async generateAIResponse(conversationId: string, userMessage: string): Promise<ConversationMessage> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }

        if (!this.openaiClient) {
            throw new Error('OpenAI client not initialized');
        }

        // Add user message first
        await this.addMessage(conversationId, 'user', userMessage);

        // Prepare conversation context
        const messages = conversation.messages
            .filter(m => m.role !== 'system')
            .slice(-10) // Keep last 10 messages for context
            .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }));

        // Add system prompt if configured
        if (conversation.settings.systemPrompt) {
            messages.unshift({
                role: 'user' as const,
                content: conversation.settings.systemPrompt,
            });
        }

        const startTime = Date.now();

        try {
            const completion = await this.openaiClient.chat.completions.create({
                model: conversation.settings.aiModel || 'gpt-4',
                messages,
                max_tokens: conversation.settings.maxTokens || 1000,
                temperature: conversation.settings.temperature || 0.7,
            });

            const duration = Date.now() - startTime;
            const response = completion.choices[0]?.message?.content || '';
            const tokens = completion.usage?.total_tokens || 0;

            // Calculate cost (rough estimate)
            const cost = (tokens / 1000) * 0.03; // $0.03 per 1K tokens

            const aiMessage: ConversationMessage = {
                id: uuidv4(),
                conversationId,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                metadata: {
                    tokens,
                    model: conversation.settings.aiModel || undefined,
                    duration,
                    cost,
                },
            };

            conversation.messages.push(aiMessage);
            conversation.metadata.messageCount++;
            conversation.metadata.totalTokens += tokens;
            conversation.metadata.lastActive = new Date();

            this.conversations.set(conversationId, conversation);
            logger.info(`Generated AI response for conversation ${conversationId}: ${response.length} chars, ${tokens} tokens`);

            return aiMessage;
        } catch (error) {
            logger.error(`Error generating AI response: ${error}`);
            throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getConversation(conversationId: string): Promise<Conversation | null> {
        return this.conversations.get(conversationId) || null;
    }

    async listConversations(filters: {
        status?: Conversation['metadata']['status'];
        participant?: string;
        tag?: string;
        limit?: number;
        offset?: number;
    } = {}): Promise<Conversation[]> {
        let conversations = Array.from(this.conversations.values());

        // Apply filters
        if (filters.status) {
            conversations = conversations.filter(c => c.metadata.status === filters.status);
        }

        if (filters.participant) {
            conversations = conversations.filter(c => c.participants.includes(filters.participant!));
        }

        if (filters.tag) {
            conversations = conversations.filter(c => c.metadata.tags.includes(filters.tag!));
        }

        // Sort by last active
        conversations.sort((a, b) => b.metadata.lastActive.getTime() - a.metadata.lastActive.getTime());

        // Apply pagination
        const offset = filters.offset || 0;
        const limit = filters.limit || 50;
        return conversations.slice(offset, offset + limit);
    }

    async updateConversation(conversationId: string, updates: Partial<Pick<Conversation, 'title' | 'participants' | 'metadata' | 'settings'>>): Promise<Conversation> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }

        // Apply updates
        if (updates.title) conversation.title = updates.title;
        if (updates.participants) conversation.participants = updates.participants;
        if (updates.metadata) {
            conversation.metadata = { ...conversation.metadata, ...updates.metadata };
        }
        if (updates.settings) {
            conversation.settings = { ...conversation.settings, ...updates.settings };
        }

        conversation.metadata.lastActive = new Date();
        this.conversations.set(conversationId, conversation);

        logger.info(`Updated conversation ${conversationId}`);
        return conversation;
    }

    async deleteConversation(conversationId: string): Promise<boolean> {
        const deleted = this.conversations.delete(conversationId);
        if (deleted) {
            logger.info(`Deleted conversation ${conversationId}`);
        }
        return deleted;
    }

    async generateSummary(conversationId: string): Promise<ConversationSummary> {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }

        if (!this.openaiClient) {
            throw new Error('OpenAI client not initialized');
        }

        const messages = conversation.messages.slice(-20); // Last 20 messages
        const conversationText = messages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        try {
            const completion = await this.openaiClient.chat.completions.create({
                model: 'gpt-4',
                messages: [{
                    role: 'user',
                    content: `Please summarize this conversation and extract key points:

${conversationText}

Provide the response in this JSON format:
{
  "summary": "Brief summary of the conversation",
  "keyPoints": ["key point 1", "key point 2", ...],
  "topics": ["topic 1", "topic 2", ...],
  "sentiment": "positive|neutral|negative|mixed"
}`
                }],
                max_tokens: 1000,
                temperature: 0.3,
            });

            const response = completion.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(response);

            const summary: ConversationSummary = {
                conversationId,
                summary: parsed.summary || 'Summary not available',
                keyPoints: parsed.keyPoints || [],
                participants: conversation.participants,
                messageCount: conversation.metadata.messageCount,
                timeRange: {
                    start: conversation.metadata.created,
                    end: conversation.metadata.lastActive,
                },
                topics: parsed.topics || [],
                sentiment: parsed.sentiment || 'neutral',
            };

            logger.info(`Generated summary for conversation ${conversationId}`);
            return summary;
        } catch (error) {
            logger.error(`Error generating summary: ${error}`);
            throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getAnalytics(): Promise<ConversationAnalytics> {
        const conversations = Array.from(this.conversations.values());

        const totalMessages = conversations.reduce((sum, c) => sum + c.metadata.messageCount, 0);
        const totalTokens = conversations.reduce((sum, c) => sum + c.metadata.totalTokens, 0);

        // Calculate average response time
        const aiMessages = conversations.flatMap(c =>
            c.messages.filter(m => m.role === 'assistant' && m.metadata.duration)
        );
        const averageResponseTime = aiMessages.length > 0
            ? aiMessages.reduce((sum, m) => sum + (m.metadata.duration || 0), 0) / aiMessages.length
            : 0;

        // Topic analysis (simplified)
        const topicCounts = new Map<string, number>();
        conversations.forEach(c => {
            c.metadata.tags.forEach(tag => {
                topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1);
            });
        });

        const topTopics = Array.from(topicCounts.entries())
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalConversations: conversations.length,
            activeConversations: conversations.filter(c => c.metadata.status === 'active').length,
            totalMessages,
            totalTokens,
            averageResponseTime,
            topTopics,
            userEngagement: [], // TODO: Implement user engagement tracking
            modelUsage: [], // TODO: Implement model usage tracking
        };
    }

    async cleanupExpiredConversations(): Promise<number> {
        let deletedCount = 0;
        const now = new Date();

        for (const [id, conversation] of this.conversations.entries()) {
            const retentionDays = conversation.settings.retentionDays || 30;
            const expiryDate = addDays(conversation.metadata.lastActive, retentionDays);

            if (now > expiryDate && conversation.metadata.status === 'closed') {
                this.conversations.delete(id);
                deletedCount++;
                logger.info(`Deleted expired conversation: ${id}`);
            }
        }

        logger.info(`Cleaned up ${deletedCount} expired conversations`);
        return deletedCount;
    }
}
