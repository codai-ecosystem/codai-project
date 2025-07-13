import { useEffect, useState, useCallback, useRef } from 'react';
import { env } from '../config/env';

export interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: any;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = env.WEBSOCKET_URL,
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options;

  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null
  });

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          error: null
        }));
        reconnectCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: message }));
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false
        }));

        // Attempt reconnection
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current++;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          error: 'WebSocket connection failed'
        }));
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: 'Failed to create WebSocket connection'
      }));
    }
  }, [url, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setState(prev => ({
      ...prev,
      connected: false,
      connecting: false
    }));
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage
  };
}

// Hook for real-time metrics
export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    tasksCompleted: 0,
    aiInteractions: 0,
    systemHealth: 'healthy' as 'healthy' | 'warning' | 'error',
    lastUpdated: Date.now()
  });

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'metrics-update') {
      setMetrics(lastMessage.payload);
    }
  }, [lastMessage]);

  return metrics;
}

// Hook for AI streaming responses
export function useAIStreamSocket(sessionId?: string) {
  const [streamData, setStreamData] = useState<{
    content: string;
    isComplete: boolean;
    sessionId: string | null;
  }>({
    content: '',
    isComplete: false,
    sessionId: null
  });

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'ai-stream') {
      const { sessionId: msgSessionId, chunk, isComplete } = lastMessage.payload;

      if (!sessionId || sessionId === msgSessionId) {
        setStreamData(prev => ({
          content: isComplete ? chunk : prev.content + chunk,
          isComplete,
          sessionId: msgSessionId
        }));
      }
    }
  }, [lastMessage, sessionId]);

  const clearStream = useCallback(() => {
    setStreamData({
      content: '',
      isComplete: false,
      sessionId: null
    });
  }, []);

  return {
    ...streamData,
    clearStream
  };
}

// Hook for system health monitoring
export function useSystemHealth() {
  const [health, setHealth] = useState({
    status: 'healthy' as 'healthy' | 'warning' | 'error',
    services: {},
    uptime: 0,
    lastCheck: Date.now()
  });

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'system-health') {
      setHealth(lastMessage.payload);
    }
  }, [lastMessage]);

  return health;
}
