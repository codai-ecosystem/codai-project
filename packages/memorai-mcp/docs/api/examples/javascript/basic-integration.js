/**
 * MemorAI MCP Server - Basic Integration Example (JavaScript)
 * 
 * This example demonstrates basic memory operations including:
 * - Authentication setup
 * - Storing memories
 * - Retrieving memories
 * - Error handling
 * - Rate limiting
 */

const axios = require('axios');

class MemorAIClient {
    constructor(apiKey, baseUrl = 'https://api.memorai.com/v1') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'MemorAI-JS-Client/1.0.0'
            },
            timeout: 30000
        });

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                console.log(`🚀 Making ${config.method.toUpperCase()} request to ${config.url}`);
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ Request successful: ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                this.handleError(error);
                return Promise.reject(error);
            }
        );
    }

    /**
     * Handle API errors with detailed logging
     */
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            console.error(`❌ API Error ${status}:`, data.error || data);

            // Handle specific error types
            switch (status) {
                case 401:
                    console.error('🔐 Authentication failed - check your API key');
                    break;
                case 429:
                    console.error('⏳ Rate limit exceeded - implement retry logic');
                    const resetTime = error.response.headers['x-ratelimit-reset'];
                    if (resetTime) {
                        console.error(`⏰ Rate limit resets at: ${resetTime}`);
                    }
                    break;
                case 400:
                    console.error('📝 Invalid request - check your parameters');
                    break;
                case 500:
                    console.error('🔥 Server error - try again later');
                    break;
            }
        } else if (error.request) {
            console.error('🌐 Network error:', error.message);
        } else {
            console.error('⚠️ Request setup error:', error.message);
        }
    }

    /**
     * Check server health
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            console.log('🏥 Health check result:', response.data);
            return response.data;
        } catch (error) {
            console.error('💔 Health check failed:', error.message);
            throw error;
        }
    }

    /**
     * Store a new memory
     */
    async rememberMemory(agentId, content, metadata = {}) {
        try {
            const payload = {
                agentId,
                content,
                metadata: {
                    importance: 5,
                    tags: [],
                    timestamp: new Date().toISOString(),
                    ...metadata
                }
            };

            console.log('🧠 Storing memory for agent:', agentId);
            const response = await this.client.post('/api/memory/remember', payload);

            console.log('✨ Memory stored successfully:', {
                memoryId: response.data.memoryId,
                structuredKey: response.data.structuredKey,
                importance: response.data.importance
            });

            return response.data;
        } catch (error) {
            console.error('💭 Failed to store memory:', error.message);
            throw error;
        }
    }

    /**
     * Retrieve memories using search
     */
    async recallMemories(agentId, query, options = {}) {
        try {
            const params = {
                agentId,
                query,
                limit: 10,
                minImportance: 0,
                ...options
            };

            console.log('🔍 Searching memories for:', query);
            const response = await this.client.get('/api/memory/recall', { params });

            console.log(`📚 Found ${response.data.totalResults} memories in ${response.data.searchTime}ms`);

            return response.data;
        } catch (error) {
            console.error('🔍 Failed to recall memories:', error.message);
            throw error;
        }
    }

    /**
     * Get recent context for an agent
     */
    async getContext(agentId, contextSize = 5) {
        try {
            const params = { agentId, contextSize };
            console.log('📖 Getting context for agent:', agentId);

            const response = await this.client.get('/api/memory/context', { params });

            console.log(`📝 Retrieved context with ${response.data.contextSize} memories`);
            return response.data;
        } catch (error) {
            console.error('📖 Failed to get context:', error.message);
            throw error;
        }
    }

    /**
     * Delete a memory
     */
    async forgetMemory(agentId, structuredKey) {
        try {
            const params = { agentId, structuredKey };
            console.log('🗑️ Deleting memory:', structuredKey);

            const response = await this.client.delete('/api/memory/forget', { params });

            console.log('✅ Memory deleted successfully');
            return response.data;
        } catch (error) {
            console.error('🗑️ Failed to delete memory:', error.message);
            throw error;
        }
    }
}

// Example usage
async function basicIntegrationExample() {
    console.log('🚀 MemorAI Basic Integration Example');
    console.log('=====================================');

    // Initialize client with your API key
    const client = new MemorAIClient(process.env.MEMORAI_API_KEY || 'your-api-key-here');

    try {
        // 1. Health check
        console.log('\n1. Checking server health...');
        await client.healthCheck();

        // 2. Store some sample memories
        console.log('\n2. Storing sample memories...');

        const agentId = 'demo-agent-' + Math.random().toString(36).substr(2, 9);

        const memory1 = await client.rememberMemory(
            agentId,
            'We discussed the new project architecture. The client wants a scalable microservices solution.',
            {
                importance: 8,
                tags: ['meeting', 'architecture', 'microservices'],
                project: 'client-project-alpha',
                session: 'meeting-2025-08-27'
            }
        );

        const memory2 = await client.rememberMemory(
            agentId,
            'Implemented Redis caching to improve response times. Saw 40% improvement in API performance.',
            {
                importance: 7,
                tags: ['redis', 'caching', 'performance'],
                project: 'client-project-alpha',
                entityType: 'technical_implementation'
            }
        );

        const memory3 = await client.rememberMemory(
            agentId,
            'Client feedback: They love the new dashboard design. Requested mobile optimization.',
            {
                importance: 6,
                tags: ['feedback', 'dashboard', 'mobile'],
                project: 'client-project-alpha',
                priority: 'high'
            }
        );

        // 3. Search for memories
        console.log('\n3. Searching for memories...');

        // Search by topic
        const architectureMemories = await client.recallMemories(
            agentId,
            'architecture microservices',
            { limit: 5 }
        );

        console.log('🏗️ Architecture-related memories:');
        architectureMemories.memories.forEach((memory, index) => {
            console.log(`  ${index + 1}. [${memory.relevanceScore.toFixed(2)}] ${memory.content.substring(0, 80)}...`);
            console.log(`     📅 ${memory.timestamp} | 🏷️ ${memory.metadata.tags?.join(', ') || 'No tags'}`);
        });

        // Search by project
        const projectMemories = await client.recallMemories(
            agentId,
            'client project',
            {
                limit: 10,
                project: 'client-project-alpha'
            }
        );

        console.log('\n📁 Project-related memories:');
        projectMemories.memories.forEach((memory, index) => {
            console.log(`  ${index + 1}. [${memory.relevanceScore.toFixed(2)}] ${memory.content.substring(0, 80)}...`);
        });

        // 4. Get recent context
        console.log('\n4. Getting recent context...');
        const context = await client.getContext(agentId, 3);

        console.log(`📚 Recent context (${context.contextSize} memories):`);
        context.memories.forEach((memory, index) => {
            console.log(`  ${index + 1}. ${memory.content.substring(0, 100)}...`);
            console.log(`     📅 ${memory.timestamp} | 💯 Importance: ${memory.metadata.importance}`);
        });

        if (context.summary) {
            console.log(`\n📝 Context Summary: ${context.summary}`);
        }

        // 5. Demonstrate error handling
        console.log('\n5. Demonstrating error handling...');

        try {
            // Try to recall with invalid agent ID
            await client.recallMemories('', 'test query');
        } catch (error) {
            console.log('✅ Error handling working correctly for invalid agent ID');
        }

        console.log('\n🎉 Basic integration example completed successfully!');
        console.log('\nNext Steps:');
        console.log('- Explore advanced memory management features');
        console.log('- Check out analytics dashboard integration');
        console.log('- Learn about network synchronization');
        console.log('- Review best practices documentation');

    } catch (error) {
        console.error('💥 Example failed:', error.message);
        process.exit(1);
    }
}

// Utility function for batch operations
async function batchRememberMemories(client, agentId, memories) {
    console.log(`📦 Batch storing ${memories.length} memories...`);

    const results = [];
    for (let i = 0; i < memories.length; i++) {
        const memory = memories[i];
        try {
            const result = await client.rememberMemory(agentId, memory.content, memory.metadata);
            results.push(result);
            console.log(`  ✅ ${i + 1}/${memories.length}: ${memory.content.substring(0, 50)}...`);
        } catch (error) {
            console.error(`  ❌ ${i + 1}/${memories.length}: Failed - ${error.message}`);
            results.push(null);
        }
    }

    const successful = results.filter(r => r !== null).length;
    console.log(`📊 Batch operation completed: ${successful}/${memories.length} successful`);

    return results;
}

// Export for use in other modules
module.exports = {
    MemorAIClient,
    basicIntegrationExample,
    batchRememberMemories
};

// Run example if called directly
if (require.main === module) {
    basicIntegrationExample().catch(console.error);
}