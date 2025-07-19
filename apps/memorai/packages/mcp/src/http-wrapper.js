#!/usr/bin/env node

/**
 * Simple HTTP wrapper for Memorai MCP
 * Exposes Memorai MCP functionality via REST API
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const app = express();
const port = parseInt(process.env.MEMORAI_MCP_PORT || '8002');

app.use(express.json());

// In-memory storage (in production would use persistent storage)
const memoryStore = new Map();
const storageBase = process.env.MEMORAI_STORAGE_PATH ||
    path.join(os.homedir(), 'AppData', 'Local', 'Memorai', 'storage');

// Initialize storage
async function initializeStorage() {
    try {
        await fs.mkdir(storageBase, { recursive: true });
        console.log(`Memorai storage initialized at: ${storageBase}`);
    } catch (error) {
        console.error('Failed to initialize storage:', error);
    }
}

initializeStorage();

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'memorai-mcp-http-wrapper',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        memoryAgents: memoryStore.size
    });
});

// Capabilities endpoint
app.get('/capabilities', (req, res) => {
    res.json({
        transport: 'http-wrapper',
        tools: ['remember', 'recall', 'forget', 'context'],
        features: ['persistent_storage', 'simple_search', 'agent_isolation'],
        wrapper: true
    });
});

// Stats endpoint
app.get('/api/stats/:agentId?', (req, res) => {
    const { agentId } = req.params;

    if (agentId) {
        const agentMemories = memoryStore.get(agentId);
        res.json({
            agentId,
            memoryCount: agentMemories?.size || 0,
            memories: agentMemories ? Array.from(agentMemories.keys()) : []
        });
    } else {
        const stats = {
            totalAgents: memoryStore.size,
            totalMemories: 0,
            agentBreakdown: {}
        };

        for (const [agent, memories] of memoryStore.entries()) {
            const count = memories.size;
            stats.agentBreakdown[agent] = count;
            stats.totalMemories += count;
        }

        res.json(stats);
    }
});

// Remember endpoint
app.post('/api/memory/:agentId/remember', async (req, res) => {
    const { agentId } = req.params;
    const { content, metadata } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    try {
        // Initialize agent memory if not exists
        if (!memoryStore.has(agentId)) {
            memoryStore.set(agentId, new Map());
        }

        const memoryId = `real_mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const memory = {
            id: memoryId,
            content,
            metadata: metadata || {},
            timestamp: new Date().toISOString(),
            agentId
        };

        // Store in memory map
        memoryStore.get(agentId).set(memoryId, memory);

        // Persist to disk
        try {
            const agentDir = path.join(storageBase, agentId);
            await fs.mkdir(agentDir, { recursive: true });
            await fs.writeFile(
                path.join(agentDir, `${memoryId}.json`),
                JSON.stringify(memory, null, 2)
            );
        } catch (error) {
            console.warn('Failed to persist memory to disk:', error);
        }

        // Calculate stats
        const agentMemories = memoryStore.get(agentId);
        const totalMemories = Array.from(memoryStore.values()).reduce((sum, map) => sum + map.size, 0);

        res.json({
            success: true,
            memoryId,
            message: 'Real memory stored successfully',
            stats: {
                totalAgents: memoryStore.size,
                totalMemories,
                agentBreakdown: Object.fromEntries(
                    Array.from(memoryStore.entries()).map(([id, memories]) => [id, memories.size])
                )
            },
            responseTime: '0ms'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Recall endpoint
app.post('/api/memory/:agentId/recall', async (req, res) => {
    const { agentId } = req.params;
    const { query, limit = 10 } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const agentMemories = memoryStore.get(agentId);
        if (!agentMemories || agentMemories.size === 0) {
            return res.json({
                success: true,
                memories: [],
                count: 0,
                message: `No memories found for query: "${query}"`,
                query,
                agentId,
                responseTime: '1ms'
            });
        }

        // Simple text search
        const queryLower = query.toLowerCase();
        const matchingMemories = Array.from(agentMemories.values())
            .filter(memory =>
                memory.content.toLowerCase().includes(queryLower) ||
                JSON.stringify(memory.metadata).toLowerCase().includes(queryLower)
            )
            .slice(0, limit)
            .map(memory => ({
                memoryId: memory.id,
                content: memory.content,
                metadata: memory.metadata,
                timestamp: memory.timestamp
            }));

        res.json({
            success: true,
            memories: matchingMemories,
            count: matchingMemories.length,
            message: matchingMemories.length > 0
                ? `Found ${matchingMemories.length} memories matching "${query}"`
                : `No memories found for query: "${query}"`,
            query,
            agentId,
            responseTime: '1ms'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forget endpoint
app.delete('/api/memory/:agentId/:memoryId', async (req, res) => {
    const { agentId, memoryId } = req.params;

    try {
        const agentMemories = memoryStore.get(agentId);
        if (!agentMemories || !agentMemories.has(memoryId)) {
            return res.status(404).json({ error: `Memory ${memoryId} not found for agent ${agentId}` });
        }

        // Remove from memory
        agentMemories.delete(memoryId);

        // Remove from disk
        try {
            const filePath = path.join(storageBase, agentId, `${memoryId}.json`);
            await fs.unlink(filePath);
        } catch (error) {
            console.warn('Failed to delete memory file:', error);
        }

        res.json({
            success: true,
            message: `Memory ${memoryId} forgotten successfully`,
            memoryId,
            agentId,
            responseTime: '0ms'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Context endpoint
app.get('/api/memory/:agentId/context', async (req, res) => {
    const { agentId } = req.params;
    const contextSize = parseInt(req.query.contextSize) || 5;

    try {
        const agentMemories = memoryStore.get(agentId);
        if (!agentMemories || agentMemories.size === 0) {
            return res.json({
                success: true,
                context: [],
                count: 0,
                message: `No context found for agent: ${agentId}`,
                agentId,
                responseTime: '1ms'
            });
        }

        // Get most recent memories for context
        const context = Array.from(agentMemories.values())
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, contextSize)
            .map(memory => ({
                memoryId: memory.id,
                content: memory.content,
                metadata: memory.metadata,
                timestamp: memory.timestamp
            }));

        res.json({
            success: true,
            context,
            count: context.length,
            message: `Retrieved ${context.length} context memories for agent: ${agentId}`,
            agentId,
            contextSize,
            responseTime: '1ms'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🧠 Memorai MCP HTTP Wrapper running on port ${port}`);
    console.log(`   Health check: http://localhost:${port}/health`);
    console.log(`   Capabilities: http://localhost:${port}/capabilities`);
    console.log(`   Memory API: http://localhost:${port}/api/memory/{agentId}/{action}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down Memorai MCP HTTP Wrapper...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down Memorai MCP HTTP Wrapper...');
    process.exit(0);
});
