// Real-time WebSocket Integration Example
// Demonstrates live memory updates and event handling

import MemorAISDK from '@memorai/sdk';

class RealtimeMemoryManager {
  constructor(config = {}) {
    this.sdk = new MemorAISDK({
      baseURL: config.baseURL || 'http://localhost:4950',
      apiKey: config.apiKey || process.env.MEMORAI_API_KEY,
      agentId: config.agentId || 'realtime-manager',
      enableWebSocket: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10
    });

    this.isConnected = false;
    this.eventListeners = new Map();
    this.memoryCache = new Map();

    this.setupEventHandlers();
  }

  // Setup WebSocket event handlers
  setupEventHandlers() {
    this.sdk.on('connected', () => {
      console.log('🟢 Connected to MemorAI');
      this.isConnected = true;
      this.emit('statusChanged', { connected: true });
    });

    this.sdk.on('disconnected', () => {
      console.log('🔴 Disconnected from MemorAI');
      this.isConnected = false;
      this.emit('statusChanged', { connected: false });
    });

    this.sdk.on('reconnecting', (attempt) => {
      console.log(`🟡 Reconnecting... (attempt ${attempt})`);
      this.emit('reconnecting', { attempt });
    });

    this.sdk.on('memoryCreated', (memory) => {
      console.log('➕ Memory created:', memory.id);
      this.memoryCache.set(memory.id, memory);
      this.emit('memoryCreated', memory);
    });

    this.sdk.on('memoryUpdated', (memory) => {
      console.log('✏️ Memory updated:', memory.id);
      this.memoryCache.set(memory.id, memory);
      this.emit('memoryUpdated', memory);
    });

    this.sdk.on('memoryDeleted', (memoryId) => {
      console.log('🗑️ Memory deleted:', memoryId);
      this.memoryCache.delete(memoryId);
      this.emit('memoryDeleted', { id: memoryId });
    });

    this.sdk.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.emit('error', error);
    });
  }

  // Event emitter functionality
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Connect to MemorAI
  async connect() {
    try {
      await this.sdk.connect();
      console.log('🚀 Connection established');
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  // Disconnect from MemorAI
  async disconnect() {
    try {
      await this.sdk.disconnect();
      console.log('👋 Disconnected successfully');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  // Subscribe to specific memory events with filters
  async subscribeToMemories(filters = {}) {
    try {
      await this.sdk.subscribe({
        agentId: filters.agentId,
        tags: filters.tags,
        importance: filters.importance,
        events: ['created', 'updated', 'deleted']
      });

      console.log('📡 Subscribed to memory events with filters:', filters);
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  }

  // Create memory with real-time notification
  async createMemory(content, metadata = {}) {
    try {
      const memory = await this.sdk.remember({
        content,
        agentId: 'realtime-manager',
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: 'realtime-example'
        }
      });

      // Memory creation will trigger WebSocket event
      return memory;
    } catch (error) {
      console.error('Failed to create memory:', error);
      throw error;
    }
  }

  // Update memory with real-time notification
  async updateMemory(memoryId, updates) {
    try {
      const updatedMemory = await this.sdk.updateMemory(memoryId, {
        ...updates,
        metadata: {
          ...updates.metadata,
          lastModified: new Date().toISOString()
        }
      });

      return updatedMemory;
    } catch (error) {
      console.error('Failed to update memory:', error);
      throw error;
    }
  }

  // Delete memory with real-time notification
  async deleteMemory(memoryId) {
    try {
      await this.sdk.forget(memoryId);
      return true;
    } catch (error) {
      console.error('Failed to delete memory:', error);
      throw error;
    }
  }

  // Get cached memories
  getCachedMemories() {
    return Array.from(this.memoryCache.values());
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      timestamp: new Date().toISOString()
    };
  }
}

// Live Dashboard Example
class LiveMemoryDashboard {
  constructor(memoryManager) {
    this.memoryManager = memoryManager;
    this.memories = [];
    this.stats = {
      total: 0,
      created: 0,
      updated: 0,
      deleted: 0
    };

    this.setupListeners();
  }

  setupListeners() {
    this.memoryManager.on('statusChanged', (status) => {
      console.log(`📊 Dashboard: Connection ${status.connected ? 'restored' : 'lost'}`);
      this.updateConnectionStatus(status.connected);
    });

    this.memoryManager.on('memoryCreated', (memory) => {
      this.memories.push(memory);
      this.stats.created++;
      this.stats.total++;
      this.updateDashboard('Memory created', memory);
    });

    this.memoryManager.on('memoryUpdated', (memory) => {
      const index = this.memories.findIndex(m => m.id === memory.id);
      if (index >= 0) {
        this.memories[index] = memory;
      }
      this.stats.updated++;
      this.updateDashboard('Memory updated', memory);
    });

    this.memoryManager.on('memoryDeleted', (data) => {
      this.memories = this.memories.filter(m => m.id !== data.id);
      this.stats.deleted++;
      this.stats.total--;
      this.updateDashboard('Memory deleted', data);
    });

    this.memoryManager.on('error', (error) => {
      console.error('📊 Dashboard error:', error);
      this.showError(error.message);
    });
  }

  updateDashboard(action, data) {
    console.log(`📊 Dashboard Update: ${action}`);
    console.log(`   - Total memories: ${this.stats.total}`);
    console.log(`   - Created: ${this.stats.created} | Updated: ${this.stats.updated} | Deleted: ${this.stats.deleted}`);
    console.log(`   - Latest action: ${action} (ID: ${data.id || 'N/A'})`);
    console.log('   ---');
  }

  updateConnectionStatus(connected) {
    const status = connected ? '🟢 ONLINE' : '🔴 OFFLINE';
    console.log(`📊 Dashboard Status: ${status}`);
  }

  showError(message) {
    console.log(`📊 Dashboard Error: ${message}`);
  }

  getStats() {
    return { ...this.stats };
  }

  getMemories() {
    return [...this.memories];
  }
}

// Example usage and demonstration
async function runRealtimeExample() {
  console.log('🚀 Starting Real-time Memory Management Example');

  // Initialize manager
  const manager = new RealtimeMemoryManager({
    agentId: 'realtime-demo',
    baseURL: 'http://localhost:4950'
  });

  // Initialize dashboard
  const dashboard = new LiveMemoryDashboard(manager);

  try {
    // Connect to MemorAI
    await manager.connect();

    // Subscribe to memory events
    await manager.subscribeToMemories({
      agentId: 'realtime-demo',
      importance: { min: 5 }
    });

    console.log('\n⏳ Simulating real-time operations...');

    // Simulate some operations with delays
    setTimeout(async () => {
      await manager.createMemory('Real-time test memory 1', {
        importance: 7,
        tags: ['test', 'realtime']
      });
    }, 1000);

    setTimeout(async () => {
      await manager.createMemory('Real-time test memory 2', {
        importance: 8,
        tags: ['test', 'important']
      });
    }, 2000);

    setTimeout(async () => {
      const memories = manager.getCachedMemories();
      if (memories.length > 0) {
        await manager.updateMemory(memories[0].id, {
          content: memories[0].content + ' (UPDATED)',
          metadata: { ...memories[0].metadata, updated: true }
        });
      }
    }, 3000);

    setTimeout(async () => {
      const memories = manager.getCachedMemories();
      if (memories.length > 1) {
        await manager.deleteMemory(memories[1].id);
      }
    }, 4000);

    // Show final stats after 6 seconds
    setTimeout(() => {
      console.log('\n📊 Final Dashboard Stats:');
      console.log(dashboard.getStats());
      console.log(`📝 Final memory count: ${dashboard.getMemories().length}`);

      // Cleanup
      manager.disconnect();
      console.log('✨ Real-time example completed!');
    }, 6000);

  } catch (error) {
    console.error('💥 Real-time example failed:', error);
    await manager.disconnect();
  }
}

// Export classes for use in other modules
export { RealtimeMemoryManager, LiveMemoryDashboard };

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRealtimeExample().catch(console.error);
}