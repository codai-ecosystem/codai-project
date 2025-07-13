import { useEffect, useState, useCallback } from 'react';
import { memoraiRealtimeService, MemoryEvent, RealtimeQuery } from '../services/realtime';

// Hook for MEMORAI real-time connection
export function useMemoraiRealtime() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectToRealtime = async () => {
      try {
        await memoraiRealtimeService.connect({
          url: process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:3001',
          token: localStorage.getItem('authToken') || undefined,
        });
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect MEMORAI to real-time service:', error);
        setIsConnected(false);
      }
    };

    connectToRealtime();

    memoraiRealtimeService.on('connection:lost', () => setIsConnected(false));
    memoraiRealtimeService.on('connection:restored', () => setIsConnected(true));

    return () => {
      memoraiRealtimeService.destroy();
    };
  }, []);

  return { isConnected };
}

// Hook for real-time memory operations
export function useRealtimeMemory(agentId: string) {
  const [memories, setMemories] = useState<MemoryEvent[]>([]);
  const [recentChanges, setRecentChanges] = useState<MemoryEvent[]>([]);

  useEffect(() => {
    memoraiRealtimeService.joinAgentRoom(agentId);

    const handleMemoryChange = (event: MemoryEvent) => {
      if (event.agentId === agentId) {
        setRecentChanges(prev => [...prev.slice(-9), event]);
        
        switch (event.type) {
          case 'create':
            setMemories(prev => [...prev, event]);
            break;
          case 'update':
            setMemories(prev => prev.map(m => 
              m.data.memoryId === event.memoryId ? event : m
            ));
            break;
          case 'delete':
            setMemories(prev => prev.filter(m => 
              m.data.memoryId !== event.memoryId
            ));
            break;
        }
      }
    };

    memoraiRealtimeService.on('memory:change', handleMemoryChange);

    return () => {
      memoraiRealtimeService.leaveAgentRoom(agentId);
      memoraiRealtimeService.off('memory:change', handleMemoryChange);
    };
  }, [agentId]);

  const createMemory = useCallback((memoryId: string, content: string, metadata?: any) => {
    memoraiRealtimeService.broadcastMemoryCreated(agentId, memoryId, content, metadata);
  }, [agentId]);

  const updateMemory = useCallback((memoryId: string, content: string, metadata?: any) => {
    memoraiRealtimeService.broadcastMemoryUpdated(agentId, memoryId, content, metadata);
  }, [agentId]);

  const deleteMemory = useCallback((memoryId: string) => {
    memoraiRealtimeService.broadcastMemoryDeleted(agentId, memoryId);
  }, [agentId]);

  return {
    memories,
    recentChanges,
    createMemory,
    updateMemory,
    deleteMemory,
  };
}

// Hook for real-time search
export function useRealtimeSearch(agentId: string) {
  const [searchResults, setSearchResults] = useState<Map<string, RealtimeQuery>>(new Map());
  const [activeSearches, setActiveSearches] = useState<string[]>([]);

  useEffect(() => {
    const handleSearchCompleted = (query: RealtimeQuery) => {
      if (query.agentId === agentId) {
        setSearchResults(prev => new Map(prev).set(query.id, query));
        setActiveSearches(prev => prev.filter(id => id !== query.id));
      }
    };

    memoraiRealtimeService.on('search:completed', handleSearchCompleted);

    return () => {
      memoraiRealtimeService.off('search:completed', handleSearchCompleted);
    };
  }, [agentId]);

  const performSearch = useCallback((query: string): string => {
    const queryId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setActiveSearches(prev => [...prev, queryId]);
    memoraiRealtimeService.broadcastSearch(agentId, query, queryId);
    return queryId;
  }, [agentId]);

  const getSearchResult = useCallback((queryId: string) => {
    return searchResults.get(queryId);
  }, [searchResults]);

  return {
    searchResults: Array.from(searchResults.values()),
    activeSearches,
    performSearch,
    getSearchResult,
  };
}

// Hook for agent status tracking
export function useAgentStatus() {
  const [connectedAgents, setConnectedAgents] = useState<Set<string>>(new Set());
  const [agentMetrics, setAgentMetrics] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const handleAgentConnected = (data: any) => {
      setConnectedAgents(prev => new Set(prev).add(data.agentId));
    };

    const handleAgentDisconnected = (data: any) => {
      setConnectedAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.agentId);
        return newSet;
      });
    };

    const handleUsageMetrics = (data: any) => {
      setAgentMetrics(prev => new Map(prev).set(data.agentId, data.metrics));
    };

    memoraiRealtimeService.on('agent:connected', handleAgentConnected);
    memoraiRealtimeService.on('agent:disconnected', handleAgentDisconnected);
    memoraiRealtimeService.on('analytics:usage', handleUsageMetrics);

    return () => {
      memoraiRealtimeService.off('agent:connected', handleAgentConnected);
      memoraiRealtimeService.off('agent:disconnected', handleAgentDisconnected);
      memoraiRealtimeService.off('analytics:usage', handleUsageMetrics);
    };
  }, []);

  return {
    connectedAgents: Array.from(connectedAgents),
    agentMetrics: Object.fromEntries(agentMetrics),
  };
}

// Hook for real-time analytics
export function useMemoraiAnalytics(agentId: string) {
  const [metrics, setMetrics] = useState({
    memoriesCreated: 0,
    memoriesUpdated: 0,
    memoriesDeleted: 0,
    searchesPerformed: 0,
    avgSearchTime: 0,
  });

  useEffect(() => {
    const handleMemoryChange = (event: MemoryEvent) => {
      if (event.agentId === agentId) {
        setMetrics(prev => ({
          ...prev,
          [`memories${event.type.charAt(0).toUpperCase() + event.type.slice(1)}d`]: 
            (prev as any)[`memories${event.type.charAt(0).toUpperCase() + event.type.slice(1)}d`] + 1,
        }));
      }
    };

    const handleSearchCompleted = (query: RealtimeQuery) => {
      if (query.agentId === agentId) {
        setMetrics(prev => ({
          ...prev,
          searchesPerformed: prev.searchesPerformed + 1,
        }));
      }
    };

    memoraiRealtimeService.on('memory:change', handleMemoryChange);
    memoraiRealtimeService.on('search:completed', handleSearchCompleted);

    return () => {
      memoraiRealtimeService.off('memory:change', handleMemoryChange);
      memoraiRealtimeService.off('search:completed', handleSearchCompleted);
    };
  }, [agentId]);

  const broadcastMetrics = useCallback(() => {
    memoraiRealtimeService.broadcastUsageMetrics(agentId, metrics);
  }, [agentId, metrics]);

  return {
    metrics,
    broadcastMetrics,
  };
}
