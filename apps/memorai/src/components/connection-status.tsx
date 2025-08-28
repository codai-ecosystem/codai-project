/**
 * MemorAI WebSocket Connection Status Component
 * Shows real-time connection status and activity
 */

'use client';

import React from 'react';
// import { useWebSocket } from '@/lib/websocket-client';

// Mock WebSocket hook until WebSocket client is implemented
const useWebSocket = (config: any) => {
    const [isConnected, setIsConnected] = React.useState(false);
    const [connectionState, setConnectionState] = React.useState('disconnected');
    
    return {
        connectionState,
        isConnected,
        connect: async () => setIsConnected(true),
        disconnect: () => setIsConnected(false),
        send: (message: any) => console.log('WebSocket message:', message),
        subscribe: (messageType: string, handler: (data: any) => void) => () => {},
        client: null,
        // Remove the properties that don't exist yet
        notifyUserActivity: (activity: string) => console.log('User activity:', activity)
    };
};

interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: string;
}

interface ConnectionStatusProps {
    userId?: string;
    className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    userId = 'anonymous',
    className = ''
}) => {
    const [lastActivity, setLastActivity] = React.useState<string>('');
    const [activityLog, setActivityLog] = React.useState<Array<{ type: string; message: string; timestamp: string }>>([]);

    const { connectionState, isConnected, notifyUserActivity } = useWebSocket({
        onMessage: (message: any) => {
            // Log incoming messages
            const logEntry = {
                type: message.type,
                message: JSON.stringify(message.data),
                timestamp: new Date().toLocaleTimeString()
            };

            setActivityLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 activities

            if (message.type === 'user_activity') {
                setLastActivity(`${message.userId}: ${message.data?.activity || message.data?.message || 'activity'}`);
            }
        },
        onConnect: () => {
            notifyUserActivity('joined the session');
        },
        onDisconnect: () => {
            setLastActivity('Disconnected from real-time updates');
        }
    });

    const getStatusColor = () => {
        if (connectionState === 'connecting') return 'text-yellow-500';
        if (isConnected) return 'text-green-500';
        if (connectionState === 'error') return 'text-red-500';
        return 'text-gray-500';
    };

    const getStatusIcon = () => {
        if (connectionState === 'connecting') return '🔄';
        if (isConnected) return '🟢';
        if (connectionState === 'error') return '🔴';
        return '⚫';
    };

    const getStatusText = () => {
        if (connectionState === 'connecting') return 'Connecting...';
        if (isConnected) return `Connected (1 user)`;
        if (connectionState === 'error') return `Error: Connection failed`;
        return 'Disconnected';
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Real-time Status
                </h3>
                <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
                    <span className="text-lg">{getStatusIcon()}</span>
                    <span className="text-sm font-medium">{getStatusText()}</span>
                </div>
            </div>

            {isConnected && (
                <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>User:</strong> {userId}
                    </div>

                    {lastActivity && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Last Activity:</strong> {lastActivity}
                        </div>
                    )}

                    {activityLog.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Recent Activity
                            </h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {activityLog.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium">{activity.type}</span>
                                            <span className="text-gray-400">{activity.timestamp}</span>
                                        </div>
                                        <div className="truncate mt-1" title={activity.message}>
                                            {activity.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {connectionState === 'error' && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        Connection Error: Connection failed
                    </p>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        Attempting to reconnect automatically...
                    </p>
                </div>
            )}

            {!isConnected && connectionState !== 'connecting' && connectionState !== 'error' && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Not connected to real-time updates
                    </p>
                </div>
            )}
        </div>
    );
};

export default ConnectionStatus;
