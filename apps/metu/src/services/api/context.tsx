'use client';

/**
 * METU API React Context and Hooks
 * 
 * React context provider and hooks for managing API client state,
 * WebSocket connections, and data synchronization throughout the app.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { apiClient, MetuApiClient, ApiResponse } from '../api/client';
import { UserSettings, ConversationSession, ConversationMessage } from '../database/schema';

export interface ApiContextState {
    // Connection state
    isConnected: boolean;
    isLoading: boolean;
    connectionError: string | null;

    // User data
    currentUser: UserSettings | null;
    conversations: ConversationSession[];

    // API methods
    client: MetuApiClient;

    // Actions
    loadUserSettings: (userId?: string) => Promise<void>;
    updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
    loadConversations: (userId?: string) => Promise<void>;
    sendMessage: (conversationId: string, content: string, type?: 'user' | 'assistant') => Promise<void>;

    // Connection management
    connect: (userId?: string) => void;
    disconnect: () => void;

    // Stats
    serverStats: any;
    refreshStats: () => Promise<void>;
}

const ApiContext = createContext<ApiContextState | null>(null);

export interface ApiProviderProps {
    children: ReactNode;
    userId?: string;
    autoConnect?: boolean;
}

export function ApiProvider({ children, userId = 'default_user', autoConnect = true }: ApiProviderProps) {
    // Connection state
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    // Data state
    const [currentUser, setCurrentUser] = useState<UserSettings | null>(null);
    const [conversations, setConversations] = useState<ConversationSession[]>([]);
    const [serverStats, setServerStats] = useState<any>(null);

    // Connection management
    const connect = useCallback((connectUserId?: string) => {
        const targetUserId = connectUserId || userId;
        console.log(`🔌 Connecting to METU server for user: ${targetUserId}`);

        try {
            // Initialize WebSocket connection
            apiClient.initializeWebSocket(targetUserId, 'desktop');

            // Set up event listeners
            apiClient.on('connected', () => {
                console.log('✅ Connected to METU server');
                setIsConnected(true);
                setConnectionError(null);
            });

            apiClient.on('disconnected', () => {
                console.log('❌ Disconnected from METU server');
                setIsConnected(false);
            });

            apiClient.on('error', (error: any) => {
                console.error('🚨 Server connection error:', error);
                setConnectionError(error.message || 'Connection error');
                setIsConnected(false);
            });

            apiClient.on('settings_updated', (updatedSettings: UserSettings) => {
                console.log('🔄 User settings updated from server');
                setCurrentUser(updatedSettings);
            });

            apiClient.on('new_message', (message: ConversationMessage) => {
                console.log('📨 New message received from server');
                // Update conversations with new message
                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === message.conversationId
                            ? { ...conv, lastMessageAt: message.timestamp, messageCount: conv.messageCount + 1 }
                            : conv
                    )
                );
            });

            // Simulate connection success (in real implementation, this would come from server)
            setTimeout(() => {
                setIsConnected(true);
                setConnectionError(null);
            }, 1000);

        } catch (error) {
            console.error('Failed to connect to server:', error);
            setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        }
    }, [userId]);

    const disconnect = useCallback(() => {
        console.log('🔌 Disconnecting from METU server');
        apiClient.disconnect();
        setIsConnected(false);
        setConnectionError(null);
    }, []);

    // Data loading methods
    const loadUserSettings = useCallback(async (loadUserId?: string) => {
        const targetUserId = loadUserId || userId;
        setIsLoading(true);

        try {
            console.log(`👤 Loading user settings for: ${targetUserId}`);
            const response = await apiClient.getUserSettings(targetUserId);

            if (response.error) {
                console.error('Failed to load user settings:', response.error);
                setConnectionError(response.error);
            } else if (response.data) {
                console.log('✅ User settings loaded successfully');
                setCurrentUser(response.data);
                setConnectionError(null);
            }
        } catch (error) {
            console.error('Error loading user settings:', error);
            setConnectionError(error instanceof Error ? error.message : 'Failed to load user settings');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const updateUserSettings = useCallback(async (settings: Partial<UserSettings>) => {
        if (!currentUser) {
            console.error('No current user to update');
            return;
        }

        setIsLoading(true);

        try {
            console.log('💾 Updating user settings...');
            const response = await apiClient.updateUserSettings(currentUser.id, settings);

            if (response.error) {
                console.error('Failed to update user settings:', response.error);
                setConnectionError(response.error);
            } else if (response.data) {
                console.log('✅ User settings updated successfully');
                setCurrentUser(response.data);
                setConnectionError(null);

                // Send WebSocket update to other clients
                if (isConnected) {
                    apiClient.sendActivity();
                }
            }
        } catch (error) {
            console.error('Error updating user settings:', error);
            setConnectionError(error instanceof Error ? error.message : 'Failed to update user settings');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, isConnected]);

    const loadConversations = useCallback(async (loadUserId?: string) => {
        const targetUserId = loadUserId || userId;
        setIsLoading(true);

        try {
            console.log(`💬 Loading conversations for: ${targetUserId}`);
            const response = await apiClient.getUserConversations(targetUserId);

            if (response.error) {
                console.error('Failed to load conversations:', response.error);
                setConnectionError(response.error);
            } else if (response.data) {
                console.log(`✅ Loaded ${response.data.length} conversations`);
                setConversations(response.data);
                setConnectionError(null);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            setConnectionError(error instanceof Error ? error.message : 'Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const sendMessage = useCallback(async (
        conversationId: string,
        content: string,
        type: 'user' | 'assistant' = 'user'
    ) => {
        if (!currentUser) {
            console.error('No current user to send message');
            return;
        }

        try {
            console.log(`📨 Sending message to conversation: ${conversationId}`);
            const messageData: Partial<ConversationMessage> = {
                content,
                type,
                metadata: {
                    processingTime: 0,
                    confidence: 1.0,
                    language: 'en',
                    emotion: 'neutral',
                },
            };

            const response = await apiClient.saveMessage(conversationId, messageData);

            if (response.error) {
                console.error('Failed to send message:', response.error);
                setConnectionError(response.error);
            } else {
                console.log('✅ Message sent successfully');
                // Message will be updated via WebSocket event
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setConnectionError(error instanceof Error ? error.message : 'Failed to send message');
        }
    }, [currentUser]);

    const refreshStats = useCallback(async () => {
        try {
            console.log('📊 Refreshing server stats...');
            const response = await apiClient.getServerStats();

            if (response.error) {
                console.error('Failed to load server stats:', response.error);
            } else if (response.data) {
                console.log('✅ Server stats loaded');
                setServerStats(response.data);
            }
        } catch (error) {
            console.error('Error loading server stats:', error);
        }
    }, []);

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect();
            loadUserSettings();
            loadConversations();
            refreshStats();
        }

        return () => {
            if (autoConnect) {
                disconnect();
            }
        };
    }, [autoConnect, connect, loadUserSettings, loadConversations, refreshStats, disconnect]);

    // Periodic activity ping
    useEffect(() => {
        if (!isConnected) return;

        const interval = setInterval(() => {
            apiClient.sendActivity();
        }, 30000); // Send activity ping every 30 seconds

        return () => clearInterval(interval);
    }, [isConnected]);

    const contextValue: ApiContextState = {
        // Connection state
        isConnected,
        isLoading,
        connectionError,

        // User data
        currentUser,
        conversations,

        // API client
        client: apiClient,

        // Actions
        loadUserSettings,
        updateUserSettings,
        loadConversations,
        sendMessage,

        // Connection management
        connect,
        disconnect,

        // Stats
        serverStats,
        refreshStats,
    };

    return (
        <ApiContext.Provider value={contextValue}>
            {children}
        </ApiContext.Provider>
    );
}

// Custom hook to use the API context
export function useApi(): ApiContextState {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
}

// Specialized hooks for common operations
export function useUserSettings(userId?: string) {
    const { currentUser, loadUserSettings, updateUserSettings, isLoading } = useApi();

    useEffect(() => {
        if (userId) {
            loadUserSettings(userId);
        }
    }, [userId, loadUserSettings]);

    return {
        settings: currentUser,
        updateSettings: updateUserSettings,
        isLoading,
    };
}

export function useConversations(userId?: string) {
    const { conversations, loadConversations, sendMessage, isLoading } = useApi();

    useEffect(() => {
        if (userId) {
            loadConversations(userId);
        }
    }, [userId, loadConversations]);

    return {
        conversations,
        sendMessage,
        isLoading,
        refresh: () => loadConversations(userId),
    };
}

export function useConnection() {
    const { isConnected, connectionError, connect, disconnect } = useApi();

    return {
        isConnected,
        connectionError,
        connect,
        disconnect,
    };
}
