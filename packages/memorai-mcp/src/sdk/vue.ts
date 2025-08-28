/**
 * MemorAI Vue 3 Integration - US-MEM-006 Implementation
 * Vue 3 composables for MemorAI SDK with excellent developer experience
 */

import { ref, onMounted, onUnmounted, readonly, computed } from 'vue';
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
 * Vue 3 Composable for MemorAI SDK
 */
export function useMemorAI(config: MemorAIConfig) {
  const sdk = new MemorAISDK(config);
  const isConnected = ref(false);
  const isLoading = ref(false);
  const error = ref<SDKError | null>(null);

  onMounted(() => {
    const handleConnection = () => {
      isConnected.value = true;
      error.value = null;
    };

    const handleDisconnection = () => {
      isConnected.value = false;
    };

    const handleError = (err: SDKError) => {
      error.value = err;
      isConnected.value = false;
    };

    sdk.on('connected', handleConnection);
    sdk.on('disconnected', handleDisconnection);
    sdk.on('error', handleError);
  });

  onUnmounted(() => {
    sdk.destroy();
  });

  const remember = async (memory: Memory, context?: TenantContext) => {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await sdk.remember(memory, context);
      return result;
    } catch (err) {
      error.value = err as SDKError;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const recall = async (options: SearchOptions, context?: TenantContext) => {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await sdk.recall(options, context);
      return result;
    } catch (err) {
      error.value = err as SDKError;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clusterMemories = async (options: ClusteringOptions) => {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await sdk.clusterMemories(options);
      return result;
    } catch (err) {
      error.value = err as SDKError;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getAnalytics = async (options?: AnalyticsOptions) => {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await sdk.getAnalytics(options);
      return result;
    } catch (err) {
      error.value = err as SDKError;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const subscribeToUpdates = (agentId?: string) => {
    sdk.subscribeToUpdates(agentId);
  };

  const unsubscribeFromUpdates = (agentId?: string) => {
    sdk.unsubscribeFromUpdates(agentId);
  };

  return {
    sdk,
    isConnected: readonly(isConnected),
    isLoading: readonly(isLoading),
    error: readonly(error),
    remember,
    recall,
    clusterMemories,
    getAnalytics,
    subscribeToUpdates,
    unsubscribeFromUpdates
  };
}

/**
 * Vue 3 composable for memory subscriptions with real-time updates
 */
export function useMemorySubscription(sdk: MemorAISDK, agentId?: string) {
  const memories = ref<Memory[]>([]);
  const lastUpdate = ref<Date | null>(null);

  onMounted(() => {
    const handleMemoryCreated = (memory: Memory) => {
      if (!agentId || memory.agentId === agentId) {
        memories.value = [...memories.value, memory];
        lastUpdate.value = new Date();
      }
    };

    const handleMemoryUpdated = (memory: Memory) => {
      if (!agentId || memory.agentId === agentId) {
        memories.value = memories.value.map(m => m.id === memory.id ? memory : m);
        lastUpdate.value = new Date();
      }
    };

    const handleMemoryDeleted = (data: { id: string; agentId: string }) => {
      if (!agentId || data.agentId === agentId) {
        memories.value = memories.value.filter(m => m.id !== data.id);
        lastUpdate.value = new Date();
      }
    };

    sdk.on('memoryCreated', handleMemoryCreated);
    sdk.on('memoryUpdated', handleMemoryUpdated);
    sdk.on('memoryDeleted', handleMemoryDeleted);

    // Subscribe to updates
    sdk.subscribeToUpdates(agentId);
  });

  onUnmounted(() => {
    sdk.unsubscribeFromUpdates(agentId);
  });

  const clear = () => {
    memories.value = [];
  };

  // Computed properties for better reactivity
  const memoryCount = computed(() => memories.value.length);
  const recentMemories = computed(() =>
    memories.value
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 10)
  );

  return {
    memories: readonly(memories),
    memoryCount,
    recentMemories,
    lastUpdate: readonly(lastUpdate),
    clear
  };
}

/**
 * Vue 3 composable for memory analytics with caching
 */
export function useMemoryAnalytics(
  sdk: MemorAISDK,
  options?: AnalyticsOptions,
  refreshInterval?: number
) {
  const analytics = ref<AnalyticsDashboard | null>(null);
  const isLoading = ref(false);
  const error = ref<SDKError | null>(null);

  const fetchAnalytics = async () => {
    if (!sdk) return;

    isLoading.value = true;
    error.value = null;

    try {
      const result = await sdk.getAnalytics(options);
      analytics.value = result;
    } catch (err) {
      error.value = err as SDKError;
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    fetchAnalytics();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      onUnmounted(() => clearInterval(interval));
    }
  });

  // Computed properties for easier access to analytics data
  const totalMemories = computed(() => analytics.value?.summary.totalMemories || 0);
  const averageImportance = computed(() => analytics.value?.summary.averageImportance || 0);
  const responseTime = computed(() => analytics.value?.performanceMetrics.responseTime || 0);
  const successRate = computed(() => analytics.value?.performanceMetrics.successRate || 0);

  return {
    analytics: readonly(analytics),
    isLoading: readonly(isLoading),
    error: readonly(error),
    totalMemories,
    averageImportance,
    responseTime,
    successRate,
    refresh: fetchAnalytics
  };
}

export default useMemorAI;