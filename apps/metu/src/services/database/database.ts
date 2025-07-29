/**
 * METU Database Service - Local Storage Implementation
 * 
 * Provides a database interface using localStorage with real-time synchronization
 * capabilities. This will be enhanced with CND database integration in Phase 2.
 */

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

export class MetuDatabaseService {
    private readonly storagePrefix = 'metu_';
    private readonly version = SCHEMA_VERSION;

    constructor() {
        this.initializeDatabase();
    }

    /**
     * Initialize database with default structure
     */
    private initializeDatabase(): void {
        console.log('🗄️ Initializing METU database service...');

        // Check if database exists and version matches
        const currentVersion = this.getStorageItem<string>('database_version');
        if (!currentVersion || currentVersion !== this.version) {
            console.log('🔄 Database migration required, initializing...');
            this.migrateDatabase(currentVersion);
        }

        // Ensure default user exists
        this.ensureDefaultUser();

        console.log('✅ METU database service initialized');
    }

    /**
     * Migrate database to current version
     */
    private migrateDatabase(fromVersion: string | null): void {
        console.log(`🔄 Migrating database from ${fromVersion || 'none'} to ${this.version}`);

        // Set new version
        this.setStorageItem('database_version', this.version);

        // Initialize metadata
        this.setStorageItem('database_metadata', {
            version: this.version,
            createdAt: new Date().toISOString(),
            lastSync: new Date().toISOString(),
            totalUsers: 0,
            totalConversations: 0,
        });
    }

    /**
     * Ensure default user exists
     */
    private ensureDefaultUser(): void {
        const defaultUserId = 'default_user';
        const existingUser = this.getUserSettings(defaultUserId);

        if (!existingUser) {
            console.log('👤 Creating default user...');
            const defaultUser: UserSettings = {
                ...DEFAULT_USER_SETTINGS,
                id: defaultUserId,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastActive: new Date(),
            };

            this.saveUserSettings(defaultUser);
        }
    }

    /**
     * Generic storage operations
     */
    private getStorageItem<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(this.storagePrefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Failed to get storage item ${key}:`, error);
            return null;
        }
    }

    private setStorageItem<T>(key: string, value: T): void {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to set storage item ${key}:`, error);
        }
    }

    private removeStorageItem(key: string): void {
        try {
            localStorage.removeItem(this.storagePrefix + key);
        } catch (error) {
            console.error(`Failed to remove storage item ${key}:`, error);
        }
    }

    /**
     * User Settings Operations
     */
    getUserSettings(userId: string = 'default_user'): UserSettings | null {
        return this.getStorageItem<UserSettings>(`user_${userId}`);
    }

    saveUserSettings(settings: UserSettings): boolean {
        try {
            // Validate settings
            if (!this.validateUserSettings(settings)) {
                console.error('Invalid user settings provided');
                return false;
            }

            // Update timestamp
            settings.updatedAt = new Date();
            settings.lastActive = new Date();

            // Save to storage
            this.setStorageItem(`user_${settings.id}`, settings);

            console.log(`✅ User settings saved for ${settings.id}`);
            return true;
        } catch (error) {
            console.error('Failed to save user settings:', error);
            return false;
        }
    }

    updateUserSettings(userId: string, updates: Partial<UserSettings>): boolean {
        const currentSettings = this.getUserSettings(userId);
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
    getConversation(conversationId: string): ConversationSession | null {
        return this.getStorageItem<ConversationSession>(`conversation_${conversationId}`);
    }

    saveConversation(conversation: ConversationSession): boolean {
        try {
            this.setStorageItem(`conversation_${conversation.id}`, conversation);
            console.log(`✅ Conversation ${conversation.id} saved`);
            return true;
        } catch (error) {
            console.error('Failed to save conversation:', error);
            return false;
        }
    }

    getUserConversations(userId: string): ConversationSession[] {
        try {
            const conversations: ConversationSession[] = [];

            // Get all conversation keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(`${this.storagePrefix}conversation_`)) {
                    const conversation = this.getStorageItem<ConversationSession>(
                        key.replace(this.storagePrefix, '')
                    );
                    if (conversation && conversation.userId === userId) {
                        conversations.push(conversation);
                    }
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
    saveMessage(message: ConversationMessage): boolean {
        try {
            // Save individual message
            this.setStorageItem(`message_${message.id}`, message);

            // Update conversation last message time
            const conversation = this.getConversation(message.conversationId);
            if (conversation) {
                conversation.lastMessageAt = message.timestamp;
                conversation.messageCount += 1;
                this.saveConversation(conversation);
            }

            return true;
        } catch (error) {
            console.error('Failed to save message:', error);
            return false;
        }
    }

    getConversationMessages(conversationId: string): ConversationMessage[] {
        try {
            const messages: ConversationMessage[] = [];

            // Get all message keys for this conversation
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(`${this.storagePrefix}message_`)) {
                    const message = this.getStorageItem<ConversationMessage>(
                        key.replace(this.storagePrefix, '')
                    );
                    if (message && message.conversationId === conversationId) {
                        messages.push(message);
                    }
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
    getAssistantConfig(userId: string): AssistantConfig | null {
        return this.getStorageItem<AssistantConfig>(`assistant_${userId}`);
    }

    saveAssistantConfig(config: AssistantConfig): boolean {
        try {
            config.updatedAt = new Date();
            this.setStorageItem(`assistant_${config.userId}`, config);
            return true;
        } catch (error) {
            console.error('Failed to save assistant config:', error);
            return false;
        }
    }

    /**
     * Voice Profile Operations
     */
    getUserVoiceProfiles(userId: string): VoiceProfile[] {
        try {
            const profiles: VoiceProfile[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(`${this.storagePrefix}voice_profile_`)) {
                    const profile = this.getStorageItem<VoiceProfile>(
                        key.replace(this.storagePrefix, '')
                    );
                    if (profile && profile.userId === userId) {
                        profiles.push(profile);
                    }
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
    clearUserData(userId: string): boolean {
        try {
            // Remove user settings
            this.removeStorageItem(`user_${userId}`);

            // Remove user conversations and messages
            const conversations = this.getUserConversations(userId);
            conversations.forEach(conv => {
                this.removeStorageItem(`conversation_${conv.id}`);

                // Remove conversation messages
                const messages = this.getConversationMessages(conv.id);
                messages.forEach(msg => {
                    this.removeStorageItem(`message_${msg.id}`);
                });
            });

            // Remove assistant config
            this.removeStorageItem(`assistant_${userId}`);

            console.log(`✅ User data cleared for ${userId}`);
            return true;
        } catch (error) {
            console.error('Failed to clear user data:', error);
            return false;
        }
    }

    exportUserData(userId: string): object | null {
        try {
            const userData = {
                settings: this.getUserSettings(userId),
                conversations: this.getUserConversations(userId),
                assistantConfig: this.getAssistantConfig(userId),
                voiceProfiles: this.getUserVoiceProfiles(userId),
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
            storageUsed: this.getStorageUsage(),
            totalItems: localStorage.length,
            lastSync: new Date().toISOString(),
        };
    }

    private getStorageUsage(): string {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return `${(total / 1024).toFixed(2)} KB`;
    }
}

// Export singleton instance
export const databaseService = new MetuDatabaseService();
