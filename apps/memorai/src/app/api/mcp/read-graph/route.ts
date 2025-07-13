import { NextResponse } from 'next/server';
import { mcpMemoryClient } from '@/lib/mcp-memory-client';

export async function GET() {
    try {
        console.log('🧠 /api/mcp/read-graph endpoint called');

        // Get memory graph from MCP memory client
        const memories = await mcpMemoryClient.readGraph();

        console.log('🧠 Memories retrieved:', memories.length, 'items');

        return NextResponse.json({ memories });
    } catch (error) {
        console.error('❌ Error in /api/mcp/read-graph:', error);

        // Return fallback data if MCP fails
        return NextResponse.json({
            memories: [
                {
                    id: 'mem-001',
                    content: 'Important project meeting tomorrow at 2 PM',
                    type: 'work',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    importance: 0.8,
                    tags: ['meeting', 'work', 'urgent']
                },
                {
                    id: 'mem-002',
                    content: 'Research findings on AI memory systems',
                    type: 'research',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    importance: 0.9,
                    tags: ['research', 'ai', 'memory']
                },
                {
                    id: 'mem-003',
                    content: 'Personal note about weekend plans',
                    type: 'personal',
                    timestamp: new Date(Date.now() - 10800000).toISOString(),
                    importance: 0.5,
                    tags: ['personal', 'weekend']
                }
            ]
        });
    }
}
