import { NextRequest, NextResponse } from 'next/server';

/**
 * MCP Recall Memories API - Server-side endpoint that calls real MCP tools
 * This endpoint bridges the browser environment with the MCP system
 */

export async function POST(request: NextRequest) {
    try {
        console.log('MCP Recall Memories API called...');

        const body = await request.json();
        const { agentId = 'github-copilot', query = 'all memories', limit = 50, summary = true } = body;

        console.log(`Attempting to recall memories: agentId=${agentId}, query="${query}", limit=${limit}, summary=${summary}`);

        // Check if we're in VS Code environment with MCP tools
        let mcpResult = null;

        // Method 1: Try direct MCP tool access (VS Code environment)
        if (typeof globalThis !== 'undefined') {
            try {
                const mcpRecall = (globalThis as any).mcp_memoraimcpser_recall;

                if (typeof mcpRecall === 'function') {
                    console.log('✅ MCP recall function found, calling directly...');

                    mcpResult = await mcpRecall(agentId, query, limit);

                    if (mcpResult && mcpResult.success && mcpResult.memories) {
                        console.log(`✅ Successfully retrieved ${mcpResult.memories.length} memories from direct MCP`);

                        // Optimize response if summary requested
                        const optimizedMemories = mcpResult.memories.map((item: any) => {
                            const memory = item.memory || item;
                            let content = memory.content;

                            if (summary && content && content.length > 300) {
                                content = content.substring(0, 300) + '...';
                            }

                            return {
                                memory: {
                                    ...memory,
                                    content,
                                    optimized: summary
                                },
                                score: item.score || 1.0,
                                relevance_reason: item.relevance_reason || 'direct_match'
                            };
                        });

                        return NextResponse.json({
                            success: true,
                            memories: optimizedMemories,
                            count: optimizedMemories.length,
                            source: 'direct-mcp-system',
                            optimized: summary,
                            responseSize: JSON.stringify(optimizedMemories).length
                        });
                    }
                }
            } catch (mcpError) {
                console.warn('⚠️ Direct MCP call failed:', mcpError);
            }
        }

        // Method 2: Fallback with helpful guidance
        console.log('🔄 MCP tools not available in current environment');

        return NextResponse.json({
            success: false,
            memories: [],
            count: 0,
            source: 'mcp-unavailable',
            message: 'MCP tools are not available in this Next.js server environment',
            guidance: {
                issue: 'Next.js server cannot access VS Code MCP tools directly',
                solution: 'MCP tools are available in VS Code agent context but not in Next.js runtime',
                workaround: 'Use read-graph API which has fallback data, or implement MCP client bridge'
            },
            optimized: summary
        }, { status: 503 });

    } catch (error) {
        console.error('❌ MCP Recall Memories API error:', error);

        return NextResponse.json({
            success: false,
            memories: [],
            count: 0,
            source: 'api-error',
            error: error instanceof Error ? error.message : 'Unknown error',
            optimized: false
        }, { status: 500 });
    }
}

// Support GET requests as well for testing
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId') || 'github-copilot';
    const query = searchParams.get('query') || 'all memories';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Convert GET to POST request body format
    const body = { agentId, query, limit };

    // Create a new request with POST method and body
    const postRequest = new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(body)
    });

    return POST(postRequest);
}
