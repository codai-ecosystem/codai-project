import { randomUUID } from 'crypto';
import { getConfig } from '../../config/app';
import type {
    UserSettings,
    ConversationMessage,
    ConversationSession,
    AssistantConfig,
    VoiceProfile,
    ServerSession
} from './schema';

/**
 * Simple in-memory database service for METU
 * This will be replaced with proper CND integration once the package is fixed
 */
export class SimpleDatabaseService {
    private userSettings: Map<string, UserSettings> = new Map();
    private conversations: Map<string, ConversationSession> = new Map();
    private messages: Map<string, ConversationMessage[]> = new Map();
    private assistantConfigs: Map<string, AssistantConfig> = new Map();
    private voiceProfiles: Map<string, VoiceProfile> = new Map();
    private serverSessions: Map<string, ServerSession> = new Map();

    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;

        await this.ensureDefaultUserSettings();

        this.initialized = true;
        console.log('✅ Simple Database Service initialized');
    }

    private async ensureDefaultUserSettings(): Promise<void> {
        const defaultSettings: UserSettings = {
            id: 'default',
            assistantName: 'METU Assistant',
            language: 'en',
            theme: 'light',
            voiceEnabled: true,
            voiceSettings: {
                speechRate: 1.0,
                pitch: 1.0,
                volume: 0.8,
                voiceId: 'default',
                provider: 'mock',
            },
            personality: 'friendly',
            customInstructions: '',
            notifications: {
                enabled: true,
                sound: true,
                visual: true,
                desktop: true,
            },
            privacy: {
                saveConversations: true,
                analyticsEnabled: true,
                crashReporting: false,
                shareUsageData: false,
            },
            accessibility: {
                highContrast: false,
                largeText: false,
                screenReader: false,
                keyboardNavigation: false,
            },
            lastActive: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.userSettings.set('default', defaultSettings);
    }

    async cleanup(): Promise<void> {
        // Simple cleanup - just log for now
        console.log('🧹 Database cleanup completed');
    }

    // User Settings
    async getUserSettings(userId: string): Promise<UserSettings | null> {
        return this.userSettings.get(userId) || this.userSettings.get('default') || null;
    }

    async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
        const existing = await this.getUserSettings(userId) || await this.getUserSettings('default');
        if (existing) {
            const updated = { ...existing, ...settings, updatedAt: new Date() };
            this.userSettings.set(userId, updated);
        }
    }

    async setUserLanguage(userId: string, language: string): Promise<void> {
        const lang = language as 'en' | 'ro';
        await this.updateUserSettings(userId, { language: lang });
    }

    // Conversations
    async createConversation(conversationId: string): Promise<ConversationSession> {
        const conversation: ConversationSession = {
            id: conversationId,
            userId: 'default_user',
            title: 'New Conversation',
            startTime: new Date(),
            language: 'en',
            messageCount: 0,
            totalDuration: 0,
            quality: 'good',
            metadata: {},
            isActive: true,
            lastMessageAt: new Date(),
        };

        this.conversations.set(conversationId, conversation);
        this.messages.set(conversationId, []);
        return conversation;
    }

    async getConversation(conversationId: string): Promise<ConversationSession | null> {
        return this.conversations.get(conversationId) || null;
    }

    async getConversations(userId: string, limit: number): Promise<ConversationSession[]> {
        return Array.from(this.conversations.values())
            .filter(conv => conv.userId === userId)
            .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
            .slice(0, limit);
    }

    async addMessage(message: ConversationMessage): Promise<void> {
        const conversationMessages = this.messages.get(message.conversationId) || [];
        conversationMessages.push(message);
        this.messages.set(message.conversationId, conversationMessages);

        // Update conversation
        const conversation = this.conversations.get(message.conversationId);
        if (conversation) {
            conversation.lastMessageAt = new Date();
            conversation.messageCount = conversationMessages.length;
            this.conversations.set(message.conversationId, conversation);
        }
    }

    async deleteConversation(conversationId: string): Promise<void> {
        this.conversations.delete(conversationId);
        this.messages.delete(conversationId);
    }

    async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
        return this.messages.get(conversationId) || [];
    }

    // Assistant Config
    async getAssistantConfig(userId: string): Promise<AssistantConfig | null> {
        return this.assistantConfigs.get(userId) || null;
    }

    async saveAssistantConfig(config: AssistantConfig): Promise<void> {
        this.assistantConfigs.set(config.userId, config);
    }

    // Voice Profiles
    async createVoiceProfile(profile: VoiceProfile): Promise<void> {
        this.voiceProfiles.set(profile.id, profile);
    }

    async getVoiceProfiles(userId: string, name?: string): Promise<VoiceProfile[]> {
        const profiles = Array.from(this.voiceProfiles.values())
            .filter(profile => profile.userId === userId);

        if (name) {
            return profiles.filter(profile => profile.name.toLowerCase().includes(name.toLowerCase()));
        }

        return profiles;
    }

    async updateVoiceProfile(id: string, updates: Partial<VoiceProfile>): Promise<void> {
        const existing = this.voiceProfiles.get(id);
        if (existing) {
            const updated = { ...existing, ...updates, updatedAt: new Date() };
            this.voiceProfiles.set(id, updated);
        }
    }

    // Server Sessions
    async createServerSession(session: ServerSession): Promise<void> {
        this.serverSessions.set(session.id, session);
    }

    async getServerSessions(userId: string, deviceId?: string): Promise<ServerSession[]> {
        const sessions = Array.from(this.serverSessions.values())
            .filter(session => session.userId === userId);

        if (deviceId) {
            return sessions.filter(session => session.deviceId === deviceId);
        }

        return sessions;
    }

    async updateServerSession(sessionId: string): Promise<void> {
        const session = this.serverSessions.get(sessionId);
        if (session) {
            session.lastActivity = new Date();
            this.serverSessions.set(sessionId, session);
        }
    }

    async endServerSession(sessionId: string): Promise<void> {
        const session = this.serverSessions.get(sessionId);
        if (session) {
            session.isActive = false;
            this.serverSessions.set(sessionId, session);
        }
    }

    // Maintenance
    async performMaintenance(olderThanDays: number): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        // Clean old conversations
        for (const [id, conversation] of this.conversations.entries()) {
            if (conversation.lastMessageAt < cutoffDate) {
                this.conversations.delete(id);
                this.messages.delete(id);
            }
        }

        // Clean old server sessions
        for (const [id, session] of this.serverSessions.entries()) {
            if (session.lastActivity < cutoffDate) {
                this.serverSessions.delete(id);
            }
        }
    }

    // Backup & Restore
    async backupData(): Promise<any> {
        return {
            userSettings: Array.from(this.userSettings.entries()),
            conversations: Array.from(this.conversations.entries()),
            messages: Array.from(this.messages.entries()),
            assistantConfigs: Array.from(this.assistantConfigs.entries()),
            voiceProfiles: Array.from(this.voiceProfiles.entries()),
            serverSessions: Array.from(this.serverSessions.entries()),
        };
    }

    async restoreData(backupData: any): Promise<void> {
        if (backupData.userSettings) {
            this.userSettings = new Map(backupData.userSettings);
        }
        if (backupData.conversations) {
            this.conversations = new Map(backupData.conversations);
        }
        if (backupData.messages) {
            this.messages = new Map(backupData.messages);
        }
        if (backupData.assistantConfigs) {
            this.assistantConfigs = new Map(backupData.assistantConfigs);
        }
        if (backupData.voiceProfiles) {
            this.voiceProfiles = new Map(backupData.voiceProfiles);
        }
        if (backupData.serverSessions) {
            this.serverSessions = new Map(backupData.serverSessions);
        }
    }
}

// Singleton instance
export const databaseService = new SimpleDatabaseService();
