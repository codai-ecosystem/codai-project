import { NextRequest, NextResponse } from 'next/server';
import { mcpMemoryClient } from '@/lib/mcp-memory-client';

/**
 * Memory API endpoint - Returns optimized memory data for dashboard components
 */

export async function GET(request: NextRequest) {
    try {
        console.log('Memory API called...');

        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agentId') || 'github-copilot';
        const limit = parseInt(searchParams.get('limit') || '10');
        const summary = searchParams.get('summary') === 'true';
        const query = searchParams.get('query');

        console.log(`Fetching memories: agentId=${agentId}, limit=${limit}, summary=${summary}`);

        // Get memories with optimization flags
        const memories = await mcpMemoryClient.getMemories({
            agentId,
            limit,
            summary: true, // Always use summary for dashboard
            query: query || undefined
        });

        console.log(`✅ Retrieved ${memories.length} optimized memories`);

        // Calculate response size info
        const responseSize = JSON.stringify(memories).length;

        return NextResponse.json({
            success: true,
            memories,
            count: memories.length,
            agentId,
            optimized: true,
            responseSize,
            query: query || null
        });

    } catch (error) {
        console.error('Memory API error:', error);

        return NextResponse.json({
            success: false,
            memories: [],
            count: 0,
            error: 'Failed to fetch memories',
            optimized: false
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId, content, type, metadata } = body;

        if (!agentId || !content) {
            return NextResponse.json(
                { error: 'agentId and content are required' },
                { status: 400 }
            );
        }

        // Use MCP client to add memory
        const memory = await mcpMemoryClient.addMemory(content, {
            ...metadata,
            source: 'dashboard'
        });

        console.log('✅ Memory created via dashboard:', memory.id);

        return NextResponse.json({
            success: true,
            memory,
            source: 'dashboard-api'
        }, { status: 201 });

    } catch (error) {
        console.error('Memory creation error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to create memory'
        }, { status: 500 });
    }
}
