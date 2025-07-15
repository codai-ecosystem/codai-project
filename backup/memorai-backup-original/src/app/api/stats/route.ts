import { NextResponse } from 'next/server';
import { mcpMemoryClient } from '@/lib/mcp-memory-client';

export async function GET() {
    try {
        console.log('📊 /api/stats endpoint called');

        // Get stats from MCP memory client
        const stats = await mcpMemoryClient.getStats();

        console.log('📊 Stats retrieved:', stats);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('❌ Error in /api/stats:', error);

        // Return fallback data if MCP fails
        return NextResponse.json({
            totalMemories: 8,
            recentMemories: 3,
            memoryTypes: {
                personal: 4,
                work: 2,
                research: 2
            },
            lastUpdated: new Date().toISOString()
        });
    }
}
