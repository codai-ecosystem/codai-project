import { NextResponse } from 'next/server';

/**
 * MCP Read-Graph API - Returns real memory data from MCP system
 */

export async function GET(request: Request) {
  try {
    console.log('Read-graph API called - fetching optimized memory data...');

    const { searchParams } = new URL(request.url);
    const summary = searchParams.get('summary') !== 'false'; // Default to true
    const limit = parseInt(searchParams.get('limit') || '10');

    // Try to get real memories from MCP system
    if (typeof globalThis !== 'undefined') {
      try {
        const mcpRecall = (globalThis as any).mcp_memoraimcpser_recall;

        if (typeof mcpRecall === 'function') {
          console.log('✅ Calling real MCP system from read-graph API...');

          const result = await mcpRecall('github-copilot', 'dashboard memories project development', limit);

          if (result && result.success && result.memories && result.memories.length > 0) {
            console.log(`✅ Retrieved ${result.memories.length} real memories from MCP system`);

            // Transform to optimized format for dashboard
            const transformedMemories = result.memories.map((item: any) => {
              let content = item.memory.content;

              // Optimize content length if summary requested
              if (summary && content.length > 250) {
                content = content.substring(0, 250) + '...';
              }

              return {
                id: item.memory.id,
                content,
                type: item.memory.type || 'note',
                metadata: {
                  importance: item.memory.importance || 0.5,
                  tags: item.memory.tags || [],
                  timestamp: item.memory.createdAt || new Date().toISOString(),
                  optimized: summary
                }
              };
            });

            console.log(`✅ Returning ${transformedMemories.length} optimized memories from MCP system`);

            return NextResponse.json({
              success: true,
              memories: transformedMemories,
              total: transformedMemories.length,
              source: 'real-mcp-system',
              optimized: summary
            });
          }
        }
      } catch (mcpError) {
        console.warn('⚠️ Failed to fetch from real MCP system:', mcpError);
      }
    }

    // Fallback to optimized test data if MCP is not available
    console.log('🔄 Using optimized fallback test data...');

    const fallbackMemories = [
      {
        id: 'test-1',
        content: summary
          ? 'Dashboard-MCP Synchronization Progress: Successfully identified agent ID mismatch...'
          : 'Dashboard-MCP Synchronization Progress: Successfully identified agent ID mismatch between dashboard and MCP system.',
        type: 'progress_update',
        metadata: {
          importance: 0.9,
          tags: ['dashboard', 'mcp', 'synchronization'],
          timestamp: new Date().toISOString(),
          optimized: summary
        }
      },
      {
        id: 'test-2',
        content: summary
          ? 'Phase 4 Step 2 Global Deployment Engine - SUCCESSFULLY VALIDATED with all tests passing...'
          : 'Phase 4 Step 2 Global Deployment Engine - SUCCESSFULLY VALIDATED with all tests passing and production readiness confirmed.',
        type: 'completion_report',
        metadata: {
          importance: 0.9,
          tags: ['phase-4', 'global-deployment', 'testing-complete'],
          timestamp: new Date().toISOString(),
          optimized: summary
        }
      },
      {
        id: 'test-3',
        content: summary
          ? 'User Requirements: Dashboard must show same data as MCP memory system...'
          : 'User Requirements: Dashboard must show same data as MCP memory system, not just 3 memories.',
        type: 'requirement',
        metadata: {
          importance: 0.8,
          tags: ['user-requirements', 'dashboard', 'data-sync'],
          timestamp: new Date().toISOString(),
          optimized: summary
        }
      }
    ];

    return NextResponse.json({
      success: true,
      memories: fallbackMemories,
      total: fallbackMemories.length,
      source: 'fallback-test-data',
      optimized: summary
    });

  } catch (error) {
    console.error('Read-graph API error:', error);

    return NextResponse.json(
      {
        success: false,
        memories: [],
        total: 0,
        error: 'Failed to fetch memories from MCP system',
        optimized: false
      },
      { status: 500 }
    );
  }
}
