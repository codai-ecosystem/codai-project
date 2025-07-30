import { getConfig } from '../../config/app';
import type {
    UserSettings,
    ConversationMessage,
    ConversationSession,
    AssistantConfig,
    VoiceProfile,
    ServerSession
} from './schema';
import { SimpleDatabaseService } from './SimpleDatabaseService';

/**
 * Database service interface methods
 */
export interface IDatabaseService {
    // User Settings
    getUserSettings(userId: string): Promise<UserSettings | null>;
    updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void>;
    setUserLanguage(userId: string, language: string): Promise<void>;

    // Conversations
    createConversation(conversationId: string): Promise<ConversationSession>;
    getConversation(conversationId: string): Promise<ConversationSession | null>;
    getConversations(userId: string, limit: number): Promise<ConversationSession[]>;
    addMessage(message: ConversationMessage): Promise<void>;
    deleteConversation(conversationId: string): Promise<void>;
    getConversationMessages(conversationId: string): Promise<ConversationMessage[]>;

    // Assistant Config
    getAssistantConfig(userId: string): Promise<AssistantConfig | null>;
    saveAssistantConfig(config: AssistantConfig): Promise<void>;

    // Voice Profiles
    createVoiceProfile(profile: VoiceProfile): Promise<void>;
    getVoiceProfiles(userId: string, name?: string): Promise<VoiceProfile[]>;
    updateVoiceProfile(id: string, updates: Partial<VoiceProfile>): Promise<void>;

    // Server Sessions
    createServerSession(session: ServerSession): Promise<void>;
    getServerSessions(userId: string, deviceId?: string): Promise<ServerSession[]>;
    updateServerSession(sessionId: string): Promise<void>;
    endServerSession(sessionId: string): Promise<void>;

    // Maintenance
    performMaintenance(olderThanDays: number): Promise<void>;

    // Backup & Restore
    backupData(): Promise<any>;
    restoreData(backupData: any): Promise<void>;

    // Initialization
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
}

/**
 * Main database service implementation for METU
 * Uses SimpleDatabaseService until CND integration is fixed
 */
export class DatabaseServiceImpl implements IDatabaseService {
    private service: SimpleDatabaseService;
    private initialized = false;

    constructor() {
        // Use simple in-memory service for now
        this.service = new SimpleDatabaseService();
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        await this.service.initialize();

        this.initialized = true;
        console.log('✅ Database Service initialized');
    }

    async cleanup(): Promise<void> {
        await this.service.cleanup();
    }

    // User Settings
    async getUserSettings(userId: string): Promise<UserSettings | null> {
        return this.service.getUserSettings(userId);
    }

    async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
        return this.service.updateUserSettings(userId, settings);
    }

    async setUserLanguage(userId: string, language: string): Promise<void> {
        return this.service.setUserLanguage(userId, language);
    }

    // Conversations
    async createConversation(conversationId: string): Promise<ConversationSession> {
        return this.service.createConversation(conversationId);
    }

    async getConversation(conversationId: string): Promise<ConversationSession | null> {
        return this.service.getConversation(conversationId);
    }

    async getConversations(userId: string, limit: number): Promise<ConversationSession[]> {
        return this.service.getConversations(userId, limit);
    }

    async addMessage(message: ConversationMessage): Promise<void> {
        return this.service.addMessage(message);
    }

    async deleteConversation(conversationId: string): Promise<void> {
        return this.service.deleteConversation(conversationId);
    }

    async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
        return this.service.getConversationMessages(conversationId);
    }

    // Assistant Config
    async getAssistantConfig(userId: string): Promise<AssistantConfig | null> {
        return this.service.getAssistantConfig(userId);
    }

    async saveAssistantConfig(config: AssistantConfig): Promise<void> {
        return this.service.saveAssistantConfig(config);
    }

    // Voice Profiles
    async createVoiceProfile(profile: VoiceProfile): Promise<void> {
        return this.service.createVoiceProfile(profile);
    }

    async getVoiceProfiles(userId: string, name?: string): Promise<VoiceProfile[]> {
        return this.service.getVoiceProfiles(userId, name);
    }

    async updateVoiceProfile(id: string, updates: Partial<VoiceProfile>): Promise<void> {
        return this.service.updateVoiceProfile(id, updates);
    }

    // Server Sessions
    async createServerSession(session: ServerSession): Promise<void> {
        return this.service.createServerSession(session);
    }

    async getServerSessions(userId: string, deviceId?: string): Promise<ServerSession[]> {
        return this.service.getServerSessions(userId, deviceId);
    }

    async updateServerSession(sessionId: string): Promise<void> {
        return this.service.updateServerSession(sessionId);
    }

    async endServerSession(sessionId: string): Promise<void> {
        return this.service.endServerSession(sessionId);
    }

    // Maintenance
    async performMaintenance(olderThanDays: number): Promise<void> {
        return this.service.performMaintenance(olderThanDays);
    }

    // Backup & Restore
    async backupData(): Promise<any> {
        return this.service.backupData();
    }

    async restoreData(backupData: any): Promise<void> {
        return this.service.restoreData(backupData);
    }
}

// Singleton instance
export const databaseService = new DatabaseServiceImpl();
