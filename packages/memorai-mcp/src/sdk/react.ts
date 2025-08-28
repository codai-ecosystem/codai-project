/**
 * MemorAI React Integration - US-MEM-006 Implementation
 * React hooks for MemorAI SDK with excellent developer experience
 */

import { useState, useEffect, useCallback } from 'react';
import MemorAISDK, {
  type MemorAIConfig,
  type Memory,
  type SearchOptions,
  type ClusteringOptions,
  type AnalyticsOptions,
  type AnalyticsDashboard,
  type TenantContext,
  type SDKError
} from './memorai-sdk.js';

/**
 * React Hook for MemorAI SDK with complete lifecycle management
 */
export function useMemorAI(config: MemorAIConfig) {
  const [sdk] = useState(() => new MemorAISDK(config));
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<SDKError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleConnection = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnection = () => {
      setIsConnected(false);
    };

    const handleError = (err: SDKError) => {
      setError(err);
      setIsConnected(false);
    };

    sdk.on('connected', handleConnection);
    sdk.on('disconnected', handleDisconnection);
    sdk.on('error', handleError);

    return () => {
      sdk.off('connected', handleConnection);
      sdk.off('disconnected', handleDisconnection);
      sdk.off('error', handleError);
      sdk.destroy();
    };
  }, [sdk]);

  const remember = useCallback(async (memory: Memory, context?: TenantContext) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await sdk.remember(memory, context);
      return result;
    } catch (err) {
      setError(err as SDKError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const recall = useCallback(async (options: SearchOptions, context?: TenantContext) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await sdk.recall(options, context);
      return result;
    } catch (err) {
      setError(err as SDKError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const clusterMemories = useCallback(async (options: ClusteringOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await sdk.clusterMemories(options);
      return result;
    } catch (err) {
      setError(err as SDKError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const getAnalytics = useCallback(async (options?: AnalyticsOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await sdk.getAnalytics(options);
      return result;
    } catch (err) {
      setError(err as SDKError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const subscribeToUpdates = useCallback((agentId?: string) => {
    sdk.subscribeToUpdates(agentId);
  }, [sdk]);

  const unsubscribeFromUpdates = useCallback((agentId?: string) => {
    sdk.unsubscribeFromUpdates(agentId);
  }, [sdk]);

  return {
    sdk,
    isConnected,
    isLoading,
    error,
    remember,
    recall,
    clusterMemories,
    getAnalytics,
    subscribeToUpdates,
    unsubscribeFromUpdates
  };
}

/**
 * React hook for memory subscriptions with real-time updates
 */
export function useMemorySubscription(
  sdk: MemorAISDK,
  agentId?: string
) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handleMemoryCreated = (memory: Memory) => {
      if (!agentId || memory.agentId === agentId) {
        setMemories(prev => [...prev, memory]);
        setLastUpdate(new Date());
      }
    };

    const handleMemoryUpdated = (memory: Memory) => {
      if (!agentId || memory.agentId === agentId) {
        setMemories(prev => prev.map(m => m.id === memory.id ? memory : m));
        setLastUpdate(new Date());
      }
    };

    const handleMemoryDeleted = (data: { id: string; agentId: string }) => {
      if (!agentId || data.agentId === agentId) {
        setMemories(prev => prev.filter(m => m.id !== data.id));
        setLastUpdate(new Date());
      }
    };

    sdk.on('memoryCreated', handleMemoryCreated);
    sdk.on('memoryUpdated', handleMemoryUpdated);
    sdk.on('memoryDeleted', handleMemoryDeleted);

    // Subscribe to updates
    sdk.subscribeToUpdates(agentId);

    return () => {
      sdk.off('memoryCreated', handleMemoryCreated);
      sdk.off('memoryUpdated', handleMemoryUpdated);
      sdk.off('memoryDeleted', handleMemoryDeleted);
      sdk.unsubscribeFromUpdates(agentId);
    };
  }, [sdk, agentId]);

  return {
    memories,
    lastUpdate,
    clear: () => setMemories([])
  };
}

/**
 * React hook for memory analytics with caching
 */
export function useMemoryAnalytics(
  sdk: MemorAISDK,
  options?: AnalyticsOptions,
  refreshInterval?: number
) {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<SDKError | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!sdk) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sdk.getAnalytics(options);
      setAnalytics(result);
    } catch (err) {
      setError(err as SDKError);
    } finally {
      setIsLoading(false);
    }
  }, [sdk, options]);

  useEffect(() => {
    fetchAnalytics();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAnalytics, refreshInterval]);

  return {
    analytics,
    isLoading,
    error,
    refresh: fetchAnalytics
  };
}

export default useMemorAI;