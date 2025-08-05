'use client';

import { useState, useEffect, useCallback } from 'react';

interface WebSocketConfig {
    url?: string;
    protocols?: string | string[];
    reconnectAttempts?: number;
    reconnectDelay?: number;
}

interface WebSocketHook {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    send: (data: any) => void;
    connect: () => void;
    disconnect: () => void;
}

export const useWebSocket = (config: WebSocketConfig = {}): WebSocketHook => {
    const {
        url = 'ws://localhost:4950/ws',
        protocols,
        reconnectAttempts = 5,
        reconnectDelay = 3000,
    } = config;

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reconnectCount, setReconnectCount] = useState(0);

    const connect = useCallback(() => {
        if (socket?.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        setIsConnecting(true);
        setError(null);

        try {
            const ws = new WebSocket(url, protocols);

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
                setReconnectCount(0);
            };

            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                setIsConnecting(false);
                setSocket(null);

                // Attempt to reconnect if not manually closed
                if (event.code !== 1000 && reconnectCount < reconnectAttempts) {
                    setTimeout(() => {
                        setReconnectCount(prev => prev + 1);
                        connect();
                    }, reconnectDelay);
                }
            };

            ws.onerror = (event) => {
                console.error('WebSocket error:', event);
                setError('WebSocket connection failed');
                setIsConnecting(false);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message:', data);
                    // Handle incoming messages here
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err);
                }
            };

            setSocket(ws);
        } catch (err) {
            console.error('Failed to create WebSocket:', err);
            setError('Failed to create WebSocket connection');
            setIsConnecting(false);
        }
    }, [url, protocols, reconnectAttempts, reconnectDelay, reconnectCount, socket]);

    const disconnect = useCallback(() => {
        if (socket) {
            socket.close(1000, 'Manual disconnect');
            setSocket(null);
        }
        setIsConnected(false);
        setIsConnecting(false);
        setReconnectCount(0);
    }, [socket]);

    const send = useCallback((data: any) => {
        if (socket?.readyState === WebSocket.OPEN) {
            try {
                socket.send(JSON.stringify(data));
            } catch (err) {
                console.error('Failed to send WebSocket message:', err);
            }
        } else {
            console.warn('WebSocket is not connected');
        }
    }, [socket]);

    // Auto-connect on mount
    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [socket]);

    return {
        isConnected,
        isConnecting,
        error,
        send,
        connect,
        disconnect,
    };
};
