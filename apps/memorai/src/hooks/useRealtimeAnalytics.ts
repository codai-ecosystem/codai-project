/**
 * Real-time Analytics Hook (HTTP-based polling)
 * React hook for managing HTTP-based real-time analytics connections
 * Compatible with Next.js and standard HTTP endpoints
 * 
 * Features:
 * - HTTP polling for real-time data updates
 * - Connection state management
 * - Automatic reconnection with exponential backoff
 * - Subscription management for different data streams
 * - Error handling and recovery
 * - Message processing and data synchronization
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface RealtimeAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  timestamp: string;
  recommendations?: string[];
}

export interface PerformanceData {
  timestamp: string;
  metrics: {
    responseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    throughput: number;
  };
  systemResources: {
    cpuPercent: number;
    memoryPercent: number;
    diskPercent: number;
    networkBytesIn: number;
    networkBytesOut: number;
  };
  status: 'healthy' | 'warning' | 'critical';
}

export interface MemoryData {
  timestamp: string;
  totalMemories: number;
  recentAdditions: number;
  searchActivity: number;
  activeAgents: number;
}

export interface RealtimeState {
  connectionState: ConnectionState;
  clientId: string | null;
  connectedAt: Date | null;
  reconnectAttempts: number;
  error: string | null;
  messagesReceived: number;
  dataTransferBytes: number;
  lastMessageTime: Date | null;
  activeSubscriptions: Set<string>;
  availableStreams: string[];
  performanceData: PerformanceData | null;
  memoryData: MemoryData | null;
  alerts: RealtimeAlert[];
  systemData: any | null;
}

export interface UseRealtimeAnalyticsConfig {
  agentId?: string;
  autoConnect?: boolean;
  subscriptions?: string[];
  pollingInterval?: number;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface UseRealtimeAnalyticsReturn {
  state: RealtimeState;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribe: (streams: string[]) => void;
  unsubscribe: (streams: string[]) => void;
  sendAlert: (alert: Omit<RealtimeAlert, 'id' | 'timestamp'>) => void;
  resolveAlert: (alertId: string) => void;
  clearAlerts: () => void;
}

// Default configuration
const DEFAULT_CONFIG: Required<UseRealtimeAnalyticsConfig> = {
  agentId: 'default-agent',
  autoConnect: false,
  subscriptions: [],
  pollingInterval: 2000, // 2 seconds
  maxReconnectAttempts: 10,
  reconnectDelay: 1000
};

// HTTP-based real-time analytics hook
export const useRealtimeAnalytics = (config: UseRealtimeAnalyticsConfig = {}): UseRealtimeAnalyticsReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Generate client ID
  const clientId = useRef<string>(`client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Polling interval reference
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State management
  const [state, setState] = useState<RealtimeState>({
    connectionState: 'disconnected',
    clientId: null,
    connectedAt: null,
    reconnectAttempts: 0,
    error: null,
    messagesReceived: 0,
    dataTransferBytes: 0,
    lastMessageTime: null,
    activeSubscriptions: new Set(finalConfig.subscriptions),
    availableStreams: ['performance', 'memory', 'alerts', 'system'],
    performanceData: null,
    memoryData: null,
    alerts: [],
    systemData: null
  });

  // Calculate derived state
  const isConnected = state.connectionState === 'connected';

  // API call helper
  const callAPI = useCallback(async (method: 'GET' | 'POST' | 'DELETE', params: any = {}) => {
    const baseUrl = '/api/websocket/analytics';

    try {
      let url = baseUrl;
      let options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (method === 'GET') {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
      } else {
        options.body = JSON.stringify(params);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }, []);

  // Fetch latest data
  const fetchLatestData = useCallback(async () => {
    try {
      const response = await callAPI('GET', { action: 'data' });

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          performanceData: response.data.performance || prev.performanceData,
          memoryData: response.data.memory || prev.memoryData,
          alerts: response.data.alerts || prev.alerts,
          systemData: response.data.system || prev.systemData,
          messagesReceived: prev.messagesReceived + 1,
          dataTransferBytes: prev.dataTransferBytes + JSON.stringify(response.data).length,
          lastMessageTime: new Date(),
          error: null
        }));
      }
    } catch (error) {
      console.error('Failed to fetch latest data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
    }
  }, [callAPI]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      if (state.connectionState === 'connected') {
        await fetchLatestData();
      }
    }, finalConfig.pollingInterval);
  }, [fetchLatestData, finalConfig.pollingInterval, state.connectionState]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Connect function
  const connect = useCallback(async () => {
    if (state.connectionState === 'connected' || state.connectionState === 'connecting') {
      return;
    }

    setState(prev => ({
      ...prev,
      connectionState: 'connecting',
      error: null
    }));

    try {
      // Register client
      await callAPI('POST', {
        action: 'connect',
        clientId: clientId.current,
        agentId: finalConfig.agentId
      });

      // Subscribe to initial streams
      if (finalConfig.subscriptions.length > 0) {
        await callAPI('POST', {
          action: 'subscribe',
          clientId: clientId.current,
          streams: finalConfig.subscriptions
        });
      }

      setState(prev => ({
        ...prev,
        connectionState: 'connected',
        clientId: clientId.current,
        connectedAt: new Date(),
        reconnectAttempts: 0,
        activeSubscriptions: new Set(finalConfig.subscriptions)
      }));

      // Start polling for data
      startPolling();

    } catch (error) {
      console.error('Connection failed:', error);
      setState(prev => ({
        ...prev,
        connectionState: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));

      // Attempt reconnection if auto-reconnect is enabled
      if (state.reconnectAttempts < finalConfig.maxReconnectAttempts) {
        scheduleReconnect();
      }
    }
  }, [state.connectionState, state.reconnectAttempts, finalConfig, callAPI, startPolling]);

  // Disconnect function
  const disconnect = useCallback(async () => {
    stopPolling();

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (state.clientId) {
      try {
        await callAPI('POST', {
          action: 'disconnect',
          clientId: state.clientId
        });
      } catch (error) {
        console.error('Disconnect failed:', error);
      }
    }

    setState(prev => ({
      ...prev,
      connectionState: 'disconnected',
      clientId: null,
      connectedAt: null,
      reconnectAttempts: 0,
      error: null
    }));
  }, [state.clientId, callAPI, stopPolling]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    const delay = finalConfig.reconnectDelay * Math.pow(2, state.reconnectAttempts);

    setState(prev => ({
      ...prev,
      connectionState: 'reconnecting',
      reconnectAttempts: prev.reconnectAttempts + 1
    }));

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [finalConfig.reconnectDelay, state.reconnectAttempts, connect]);

  // Subscribe to streams
  const subscribe = useCallback(async (streams: string[]) => {
    if (!isConnected) return;

    try {
      await callAPI('POST', {
        action: 'subscribe',
        clientId: state.clientId,
        streams
      });

      setState(prev => ({
        ...prev,
        activeSubscriptions: new Set([...prev.activeSubscriptions, ...streams])
      }));
    } catch (error) {
      console.error('Subscribe failed:', error);
    }
  }, [isConnected, state.clientId, callAPI]);

  // Unsubscribe from streams
  const unsubscribe = useCallback(async (streams: string[]) => {
    if (!isConnected) return;

    try {
      await callAPI('POST', {
        action: 'unsubscribe',
        clientId: state.clientId,
        streams
      });

      setState(prev => {
        const newSubscriptions = new Set(prev.activeSubscriptions);
        streams.forEach(stream => newSubscriptions.delete(stream));
        return {
          ...prev,
          activeSubscriptions: newSubscriptions
        };
      });
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    }
  }, [isConnected, state.clientId, callAPI]);

  // Send alert (mock implementation for HTTP-based system)
  const sendAlert = useCallback(async (alert: Omit<RealtimeAlert, 'id' | 'timestamp'>) => {
    const newAlert: RealtimeAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      alerts: [...prev.alerts, newAlert]
    }));
  }, []);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId)
    }));
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setState(prev => ({
      ...prev,
      alerts: []
    }));
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (finalConfig.autoConnect && state.connectionState === 'disconnected') {
      connect();
    }

    return () => {
      stopPolling();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [finalConfig.autoConnect, connect, stopPolling, state.connectionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [stopPolling]);

  return {
    state,
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendAlert,
    resolveAlert,
    clearAlerts
  };
};
