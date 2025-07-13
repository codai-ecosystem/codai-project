import { NextResponse } from 'next/server';
import { mcpMemoryClient } from '../../../../lib/mcp-memory-client';

/**
 * MCP RECALL API ENDPOINT
 * 
 * This endpoint was missing and causing enterprise-data-source.ts to fail.
 * It provides memory recall functionality via mcpMemoryClient.
 * 
 * Replaces the broken localhost:3000/mcp/recall calls with working functionality.
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const agentId = searchParams.get('agentId') || 'default-agent';

    console.log('MCP Recall API called with:', { query, limit, agentId });
    console.log('NO MORE BROKEN ENDPOINT - Using mcpMemoryClient');

    // Recall memories from MCP system via client
    // If search query doesn't return results, fall back to getting all memories
    let memories = query
      ? await mcpMemoryClient.searchMemories(query, { limit, agentId })
      : await mcpMemoryClient.getMemories({ limit, agentId });

    // If search returned no results, try getting all memories instead
    if (memories.length === 0 && query) {
      console.log(`Search for "${query}" returned 0 results, falling back to all memories`);
      memories = await mcpMemoryClient.getMemories({ limit, agentId });
    }

    console.log(`✅ Successfully recalled ${memories.length} memories from MCP via client`);

    // Transform to format expected by enterprise-data-source
    const transformedMemories = memories.map((memory) => ({
      id: memory.id,
      content: memory.content,
      type: memory.type,
      importance: memory.metadata.importance || 0.5,
      confidence: memory.metadata.confidence || 0.5,
      createdAt: memory.timestamp,
      updatedAt: memory.timestamp,
      metadata: memory.metadata,
      tags: memory.metadata.tags || [],
      agentId: memory.agentId,
    }));

    return NextResponse.json({
      success: true,
      data: {
        memories: transformedMemories,
        totalCount: transformedMemories.length,
        query: query,
        limit: limit,
        agentId: agentId,
      },
      metadata: {
        source: 'real_mcp_system_via_client',
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('MCP Recall API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to recall memories from MCP system',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: {
          memories: [],
          totalCount: 0,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, limit = 10, agentId = 'default-agent', filters } = body;

    console.log('MCP Recall POST called with:', { query, limit, agentId, filters });
    console.log('Enterprise-data-source calling /api/mcp/recall via POST');

    // Get memories from MCP system via client
    // If search query doesn't return results, fall back to getting all memories
    let memories = query
      ? await mcpMemoryClient.searchMemories(query, { limit, agentId })
      : await mcpMemoryClient.getMemories({ limit, agentId });

    // If search returned no results, try getting all memories instead
    if (memories.length === 0 && query) {
      console.log(`Search for "${query}" returned 0 results, falling back to all memories`);
      memories = await mcpMemoryClient.getMemories({ limit, agentId });
    }

    console.log(`✅ POST recall got ${memories.length} memories from MCP client`);

    // Apply filters if provided
    let filteredMemories = memories;
    if (filters) {
      if (filters.type) {
        filteredMemories = filteredMemories.filter((m) => m.type === filters.type);
      }
      if (filters.minImportance) {
        filteredMemories = filteredMemories.filter((m) =>
          (m.metadata.importance || 0) >= filters.minImportance
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        filteredMemories = filteredMemories.filter((m) =>
          filters.tags.some((tag: string) => (m.metadata.tags || []).includes(tag))
        );
      }
    }

    // Transform to enterprise-data-source format
    const transformedMemories = filteredMemories.map((memory) => ({
      id: memory.id,
      content: memory.content,
      type: memory.type,
      importance: memory.metadata.importance || 0.5,
      confidence: memory.metadata.confidence || 0.5,
      createdAt: memory.timestamp,
      updatedAt: memory.timestamp,
      metadata: memory.metadata,
      tags: memory.metadata.tags || [],
      agentId: memory.agentId,
    }));

    console.log(`✅ POST recall returning ${transformedMemories.length} transformed memories`);

    return NextResponse.json({
      success: true,
      data: {
        memories: transformedMemories,
        totalCount: transformedMemories.length,
        query: query,
        limit: limit,
        agentId: agentId,
        filters: filters,
      },
      metadata: {
        source: 'real_mcp_system_via_client',
        timestamp: new Date().toISOString(),
        method: 'POST',
      },
    });

  } catch (error) {
    console.error('MCP Recall POST error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process recall request',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: {
          memories: [],
          totalCount: 0,
        },
      },
      { status: 500 }
    );
  }
}
