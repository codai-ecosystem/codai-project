/**
 * MemorAI MCP Memory Tools - 2025 MCP Standards
 * Core memory operations: remember, recall, context, forget
 */

import { z } from 'zod';
import { MemoryStore } from '../services/memory-service.js';

export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: z.ZodSchema<any>;
    handler: (args: any, memoryStore: MemoryStore) => Promise<any>;
}

// Input validation schemas
export const rememberSchema = z.object({
    agentId: z.string().describe('Agent identifier'),
    content: z.string().describe('Content to remember'),
    metadata: z.object({
        entityType: z.string().optional(),
        importance: z.number().min(1).max(10).default(5).optional(),
        priority: z.string().optional()
    }).optional()
});

export const recallSchema = z.object({
    agentId: z.string().describe('Agent identifier'),
    query: z.string().describe('Search query'),
    limit: z.number().default(10).optional().describe('Maximum results')
});

export const contextSchema = z.object({
    agentId: z.string().describe('Agent identifier'),
    contextSize: z.number().default(5).optional().describe('Number of recent memories')
});

export const forgetSchema = z.object({
    agentId: z.string().describe('Agent identifier'),
    structuredKey: z.string().describe('Memory key to delete')
});

// Tool handlers
async function rememberHandler(args: z.infer<typeof rememberSchema>, memoryStore: MemoryStore) {
    // Sanitize content to prevent injection attacks
    const sanitizedContent = sanitizeInput(args.content);
    
    await memoryStore.remember(args.agentId, sanitizedContent, args.metadata || {});
    
    return {
        content: [{
            type: 'text',
            text: `✅ Memory stored successfully!\nAgent: ${args.agentId}\nContent: ${sanitizedContent.substring(0, 100)}${sanitizedContent.length > 100 ? '...' : ''}\nTimestamp: ${new Date().toISOString()}`
        }]
    };
}

async function recallHandler(args: z.infer<typeof recallSchema>, memoryStore: MemoryStore) {
    const recallResponse = await memoryStore.recall(args.agentId, args.query, { limit: args.limit || 10 });
    const recallMemories = recallResponse.memories || [];
    
    let memoryText = `📋 Found ${recallMemories.length} memories for query: "${args.query}"\n\n`;
    if (recallMemories.length > 0) {
        memoryText += recallMemories.map((memory, index) => 
            `${index + 1}. ${memory.content}\n   📅 ${memory.timestamp}\n   🏷️  ${memory.structuredKey}\n`
        ).join('\n');
    } else {
        memoryText += '🔍 No memories found matching the query.';
    }
    
    return {
        content: [{
            type: 'text',
            text: memoryText
        }]
    };
}

async function contextHandler(args: z.infer<typeof contextSchema>, memoryStore: MemoryStore) {
    const contextResponse = await memoryStore.getContext(args.agentId, args.contextSize || 5);
    const contextMemories = contextResponse.context || [];
    
    let contextText = `🧠 Context for ${args.agentId} (${contextMemories.length} recent memories):\n\n`;
    if (contextMemories.length > 0) {
        contextText += contextMemories.map((memory, index) => 
            `${index + 1}. ${memory.content}\n   📅 ${memory.timestamp}\n`
        ).join('\n');
    } else {
        contextText += '📭 No context memories found.';
    }
    
    return {
        content: [{
            type: 'text',
            text: contextText
        }]
    };
}

async function forgetHandler(args: z.infer<typeof forgetSchema>, memoryStore: MemoryStore) {
    await memoryStore.forget(args.agentId, args.structuredKey);
    
    return {
        content: [{
            type: 'text',
            text: `🗑️  Memory forgotten successfully!\nAgent: ${args.agentId}\nKey: ${args.structuredKey}`
        }]
    };
}

// Utility function for input sanitization
function sanitizeInput(input: string): string {
    // Remove potentially dangerous characters and normalize
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/data:/gi, '') // Remove data: protocols
        .trim()
        .substring(0, 10000); // Limit length
}

// Export tool definitions following 2025 MCP standards
export const memoryTools: ToolDefinition[] = [
    {
        name: 'remember',
        description: 'Store a memory with content and metadata',
        inputSchema: rememberSchema,
        handler: rememberHandler
    },
    {
        name: 'recall',
        description: 'Search and retrieve memories',
        inputSchema: recallSchema,
        handler: recallHandler
    },
    {
        name: 'context',
        description: 'Get recent context for agent',
        inputSchema: contextSchema,
        handler: contextHandler
    },
    {
        name: 'forget',
        description: 'Delete a memory by key',
        inputSchema: forgetSchema,
        handler: forgetHandler
    }
];