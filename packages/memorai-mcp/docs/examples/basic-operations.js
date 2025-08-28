// Basic Memory Operations Example
// This example demonstrates fundamental MemorAI operations

import MemorAISDK from '@memorai/sdk';

// Initialize SDK
const sdk = new MemorAISDK({
  baseURL: 'http://localhost:4950',
  apiKey: process.env.MEMORAI_API_KEY || 'your-api-key',
  agentId: 'basic-operations-example'
});

class BasicMemoryOperations {
  constructor() {
    this.sdk = sdk;
  }

  // Store a simple memory
  async storeMemory(content, metadata = {}) {
    try {
      const memory = await this.sdk.remember({
        content: content,
        agentId: 'basic-operations-example',
        metadata: {
          importance: 5,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });

      console.log('✅ Memory stored:', memory.id);
      return memory;
    } catch (error) {
      console.error('❌ Failed to store memory:', error.message);
      throw error;
    }
  }

  // Search for memories
  async searchMemories(query, options = {}) {
    try {
      const results = await this.sdk.recall({
        query: query,
        agentId: 'basic-operations-example',
        limit: options.limit || 10,
        minImportance: options.minImportance || 0,
        ...options
      });

      console.log(`✅ Found ${results.length} memories for query: "${query}"`);
      return results;
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      throw error;
    }
  }

  // Update an existing memory
  async updateMemory(memoryId, newContent, newMetadata = {}) {
    try {
      const updatedMemory = await this.sdk.updateMemory(memoryId, {
        content: newContent,
        metadata: {
          ...newMetadata,
          updatedAt: new Date().toISOString()
        }
      });

      console.log('✅ Memory updated:', memoryId);
      return updatedMemory;
    } catch (error) {
      console.error('❌ Failed to update memory:', error.message);
      throw error;
    }
  }

  // Delete a memory
  async deleteMemory(memoryId) {
    try {
      await this.sdk.forget(memoryId);
      console.log('✅ Memory deleted:', memoryId);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete memory:', error.message);
      throw error;
    }
  }

  // Get all memories (with pagination)
  async getAllMemories(page = 1, pageSize = 20) {
    try {
      const results = await this.sdk.recall({
        query: '', // Empty query returns all
        agentId: 'basic-operations-example',
        limit: pageSize,
        offset: (page - 1) * pageSize
      });

      console.log(`✅ Retrieved ${results.length} memories (page ${page})`);
      return results;
    } catch (error) {
      console.error('❌ Failed to retrieve memories:', error.message);
      throw error;
    }
  }
}

// Example usage
async function runBasicOperationsExample() {
  const memoryOps = new BasicMemoryOperations();

  try {
    console.log('🚀 Starting Basic Memory Operations Example');

    // 1. Store some example memories
    console.log('\n📝 Storing memories...');
    const memory1 = await memoryOps.storeMemory(
      'User prefers dark mode theme',
      { tags: ['ui', 'preferences'], importance: 7 }
    );

    const memory2 = await memoryOps.storeMemory(
      'Customer complained about slow loading times',
      { tags: ['feedback', 'performance'], importance: 8 }
    );

    const memory3 = await memoryOps.storeMemory(
      'Meeting scheduled for next Tuesday at 2 PM',
      { tags: ['calendar', 'meeting'], importance: 6 }
    );

    // 2. Search for memories
    console.log('\n🔍 Searching memories...');
    const uiMemories = await memoryOps.searchMemories('user interface preferences');
    const feedbackMemories = await memoryOps.searchMemories('customer feedback', {
      minImportance: 7,
      limit: 5
    });

    // 3. Update a memory
    console.log('\n✏️ Updating memory...');
    await memoryOps.updateMemory(
      memory1.id,
      'User prefers dark mode theme and compact layout',
      { tags: ['ui', 'preferences', 'layout'], importance: 8 }
    );

    // 4. Get all memories with pagination
    console.log('\n📄 Getting all memories...');
    const allMemories = await memoryOps.getAllMemories(1, 10);

    console.log('\n📊 Summary:');
    console.log(`- Total memories retrieved: ${allMemories.length}`);
    console.log(`- UI-related memories: ${uiMemories.length}`);
    console.log(`- High-importance feedback: ${feedbackMemories.length}`);

    // 5. Clean up - delete one memory
    console.log('\n🗑️ Cleaning up...');
    await memoryOps.deleteMemory(memory3.id);

    console.log('✨ Basic operations example completed successfully!');

  } catch (error) {
    console.error('💥 Example failed:', error);
  }
}

// Error handling wrapper
async function runSafeExample() {
  try {
    await runBasicOperationsExample();
  } catch (error) {
    console.error('❌ Critical error in basic operations example:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export { BasicMemoryOperations, runBasicOperationsExample };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSafeExample();
}