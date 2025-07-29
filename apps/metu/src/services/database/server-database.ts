/**
 * METU Server Database Service - Node.js File System Storage
 * 
 * Server-side database implementation using file system storage
 * instead of localStorage, suitable for Node.js backend environment.
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
    UserSettings,
    ConversationMessage,
    ConversationSession,
    AssistantConfig,
    VoiceProfile,
    ServerSession,
    DEFAULT_USER_SETTINGS,
    VALIDATION_RULES,
    SCHEMA_VERSION
} from './schema';

export class MetuServerDatabaseService {
    private readonly dataDir: string;
    private readonly version = SCHEMA_VERSION;
    private cache: Map<string, any> = new Map();

    constructor(dataDir?: string) {
        // Use user data directory for persistent storage
        this.dataDir = dataDir || path.join(os.homedir(), '.metu', 'data');
        console.log(`🗄️ METU Server Database using directory: ${this.dataDir}`);
        this.initializeDatabase();
    }

    /**
     * Initialize database with default structure
     */
    private async initializeDatabase(): Promise<void> {
        console.log('🗄️ Initializing METU server database service...');

        try {
            // Ensure data directory exists
            await fs.mkdir(this.dataDir, { recursive: true });

            // Check if database exists and version matches
            const currentVersion = await this.getFileItem<string>('database_version');
            if (!currentVersion || currentVersion !== this.version) {
                console.log('🔄 Database migration required, initializing...');
                await this.migrateDatabase(currentVersion);
            }

            // Ensure default user exists
            await this.ensureDefaultUser();

            console.log('✅ METU server database service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
        }
    }

    /**
     * Migrate database to current version
     */
    private async migrateDatabase(fromVersion: string | null): Promise<void> {
        console.log(`🔄 Migrating database from ${fromVersion || 'none'} to ${this.version}`);

        try {
            // Set new version
            await this.setFileItem('database_version', this.version);

            // Initialize metadata
            await this.setFileItem('database_metadata', {
                version: this.version,
                createdAt: new Date().toISOString(),
                lastSync: new Date().toISOString(),
                totalUsers: 0,
                totalConversations: 0,
            });
        } catch (error) {
            console.error('❌ Database migration failed:', error);
        }
    }

    /**
     * Ensure default user exists
     */
    private async ensureDefaultUser(): Promise<void> {
        const defaultUserId = 'default_user';
        const existingUser = await this.getUserSettings(defaultUserId);

        if (!existingUser) {
            console.log('👤 Creating default user...');
            const defaultUser: UserSettings = {
                ...DEFAULT_USER_SETTINGS,
                id: defaultUserId,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastActive: new Date(),
            };

            await this.saveUserSettings(defaultUser);
        }
    }

    /**
     * Get file path for a key
     */
    private getFilePath(key: string): string {
        return path.join(this.dataDir, `${key}.json`);
    }

    /**
     * Generic file operations
     */
    private async getFileItem<T>(key: string): Promise<T | null> {
        try {
            // Check cache first
            if (this.cache.has(key)) {
                return this.cache.get(key);
            }

            const filePath = this.getFilePath(key);
            const data = await fs.readFile(filePath, 'utf-8');
            const parsed = JSON.parse(data);

            // Cache the result
            this.cache.set(key, parsed);
            return parsed;
        } catch (error) {
            if ((error as any).code !== 'ENOENT') {
                console.error(`Failed to get file item ${key}:`, error);
            }
            return null;
        }
    }

    private async setFileItem<T>(key: string, value: T): Promise<void> {
        try {
            const filePath = this.getFilePath(key);
            await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');

            // Update cache
            this.cache.set(key, value);
        } catch (error) {
            console.error(`Failed to set file item ${key}:`, error);
        }
    }

    private async removeFileItem(key: string): Promise<void> {
        try {
            const filePath = this.getFilePath(key);
            await fs.unlink(filePath);

            // Remove from cache
            this.cache.delete(key);
        } catch (error) {
            if ((error as any).code !== 'ENOENT') {
                console.error(`Failed to remove file item ${key}:`, error);
            }
        }
    }

    /**
     * List all files matching a pattern
     */
    private async listFiles(pattern: string): Promise<string[]> {
        try {
            const files = await fs.readdir(this.dataDir);
            return files.filter(file => file.includes(pattern) && file.endsWith('.json'));
        } catch (error) {
            console.error('Failed to list files:', error);
            return [];
        }
    }

    /**
     * User Settings Operations
     */
    async getUserSettings(userId: string = 'default_user'): Promise<UserSettings | null> {
        return this.getFileItem<UserSettings>(`user_${userId}`);
    }

    async saveUserSettings(settings: UserSettings): Promise<boolean> {
        try {
            // Validate settings
            if (!this.validateUserSettings(settings)) {
                console.error('Invalid user settings provided');
                return false;
            }

            // Update timestamp
            settings.updatedAt = new Date();
            settings.lastActive = new Date();

            // Save to file
            await this.setFileItem(`user_${settings.id}`, settings);

            console.log(`✅ User settings saved for ${settings.id}`);
            return true;
        } catch (error) {
            console.error('Failed to save user settings:', error);
            return false;
        }
    }

    async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<boolean> {
        const currentSettings = await this.getUserSettings(userId);
        if (!currentSettings) {
            console.error(`User ${userId} not found`);
            return false;
        }

        const updatedSettings: UserSettings = {
            ...currentSettings,
            ...updates,
            id: userId, // Ensure ID doesn't get overwritten
            updatedAt: new Date(),
            lastActive: new Date(),
        };

        return this.saveUserSettings(updatedSettings);
    }

    /**
     * Conversation Operations
     */
    async getConversation(conversationId: string): Promise<ConversationSession | null> {
        return this.getFileItem<ConversationSession>(`conversation_${conversationId}`);
    }

    async saveConversation(conversation: ConversationSession): Promise<boolean> {
        try {
            await this.setFileItem(`conversation_${conversation.id}`, conversation);
            console.log(`✅ Conversation ${conversation.id} saved`);
            return true;
        } catch (error) {
            console.error('Failed to save conversation:', error);
            return false;
        }
    }

    async getUserConversations(userId: string): Promise<ConversationSession[]> {
        try {
            const conversations: ConversationSession[] = [];
            const files = await this.listFiles('conversation_');

            for (const file of files) {
                const conversationId = file.replace('conversation_', '').replace('.json', '');
                const conversation = await this.getConversation(conversationId);
                if (conversation && conversation.userId === userId) {
                    conversations.push(conversation);
                }
            }

            // Sort by last message time
            return conversations.sort((a, b) =>
                new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
            );
        } catch (error) {
            console.error('Failed to get user conversations:', error);
            return [];
        }
    }

    /**
     * Message Operations
     */
    async saveMessage(message: ConversationMessage): Promise<boolean> {
        try {
            // Save individual message
            await this.setFileItem(`message_${message.id}`, message);

            // Update conversation last message time
            const conversation = await this.getConversation(message.conversationId);
            if (conversation) {
                conversation.lastMessageAt = message.timestamp;
                conversation.messageCount += 1;
                await this.saveConversation(conversation);
            }

            return true;
        } catch (error) {
            console.error('Failed to save message:', error);
            return false;
        }
    }

    async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
        try {
            const messages: ConversationMessage[] = [];
            const files = await this.listFiles('message_');

            for (const file of files) {
                const messageId = file.replace('message_', '').replace('.json', '');
                const message = await this.getFileItem<ConversationMessage>(`message_${messageId}`);
                if (message && message.conversationId === conversationId) {
                    messages.push(message);
                }
            }

            // Sort by timestamp
            return messages.sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
        } catch (error) {
            console.error('Failed to get conversation messages:', error);
            return [];
        }
    }

    /**
     * Assistant Configuration Operations
     */
    async getAssistantConfig(userId: string): Promise<AssistantConfig | null> {
        return this.getFileItem<AssistantConfig>(`assistant_${userId}`);
    }

    async saveAssistantConfig(config: AssistantConfig): Promise<boolean> {
        try {
            config.updatedAt = new Date();
            await this.setFileItem(`assistant_${config.userId}`, config);
            return true;
        } catch (error) {
            console.error('Failed to save assistant config:', error);
            return false;
        }
    }

    /**
     * Voice Profile Operations
     */
    async getUserVoiceProfiles(userId: string): Promise<VoiceProfile[]> {
        try {
            const profiles: VoiceProfile[] = [];
            const files = await this.listFiles('voice_profile_');

            for (const file of files) {
                const profileId = file.replace('voice_profile_', '').replace('.json', '');
                const profile = await this.getFileItem<VoiceProfile>(`voice_profile_${profileId}`);
                if (profile && profile.userId === userId) {
                    profiles.push(profile);
                }
            }

            return profiles.sort((a, b) =>
                new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
            );
        } catch (error) {
            console.error('Failed to get voice profiles:', error);
            return [];
        }
    }

    /**
     * Validation Methods
     */
    private validateUserSettings(settings: UserSettings): boolean {
        // Validate assistant name length
        if (settings.assistantName.length < VALIDATION_RULES.ASSISTANT_NAME_LENGTH.min ||
            settings.assistantName.length > VALIDATION_RULES.ASSISTANT_NAME_LENGTH.max) {
            return false;
        }

        // Validate voice settings
        if (settings.voiceSettings.speechRate < VALIDATION_RULES.VOICE_RATE_RANGE.min ||
            settings.voiceSettings.speechRate > VALIDATION_RULES.VOICE_RATE_RANGE.max) {
            return false;
        }

        if (settings.voiceSettings.volume < VALIDATION_RULES.VOICE_VOLUME_RANGE.min ||
            settings.voiceSettings.volume > VALIDATION_RULES.VOICE_VOLUME_RANGE.max) {
            return false;
        }

        // Validate custom instructions length
        if (settings.customInstructions &&
            settings.customInstructions.length > VALIDATION_RULES.CUSTOM_INSTRUCTIONS_LENGTH.max) {
            return false;
        }

        return true;
    }

    /**
     * Utility Methods
     */
    async clearUserData(userId: string): Promise<boolean> {
        try {
            // Remove user settings
            await this.removeFileItem(`user_${userId}`);

            // Remove user conversations and messages
            const conversations = await this.getUserConversations(userId);
            for (const conv of conversations) {
                await this.removeFileItem(`conversation_${conv.id}`);

                // Remove conversation messages
                const messages = await this.getConversationMessages(conv.id);
                for (const msg of messages) {
                    await this.removeFileItem(`message_${msg.id}`);
                }
            }

            // Remove assistant config
            await this.removeFileItem(`assistant_${userId}`);

            console.log(`✅ User data cleared for ${userId}`);
            return true;
        } catch (error) {
            console.error('Failed to clear user data:', error);
            return false;
        }
    }

    async exportUserData(userId: string): Promise<object | null> {
        try {
            const userData = {
                settings: await this.getUserSettings(userId),
                conversations: await this.getUserConversations(userId),
                assistantConfig: await this.getAssistantConfig(userId),
                voiceProfiles: await this.getUserVoiceProfiles(userId),
                exportedAt: new Date().toISOString(),
                version: this.version,
            };

            return userData;
        } catch (error) {
            console.error('Failed to export user data:', error);
            return null;
        }
    }

    getDatabaseStats(): object {
        return {
            version: this.version,
            dataDirectory: this.dataDir,
            cacheSize: this.cache.size,
            lastSync: new Date().toISOString(),
        };
    }

    /**
     * Cleanup cache periodically
     */
    clearCache(): void {
        this.cache.clear();
        console.log('🧹 Database cache cleared');
    }
}
